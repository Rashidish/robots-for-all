// The AI helper service (ADR-0018, M6 spec v0.3), on our own hostname at /helper/. The only holder
// of AI provider keys. Nothing a person types is stored or logged; only counts and costs.
//   POST /helper/ask    {question, page, lesson?, language?, earlier?: {question, answer},
//                        program?, run?}
//        an adult (Supabase session) or a child (learner session, lesson pages only) asks
//   POST /helper/thumb  {audience, up}   👍 or 👎 on an answer: a count only
//   GET  /helper/faq/<lesson>?lang=zu   a lesson's Common questions (public, cacheable)
//   POST /helper/faq-down {lesson, language, item}   👎 on a Common question; 3 hide it
// Every reply is no-store JSON: {status, answer?}. A status other than "ok" is a reason the page
// shows in the person's language (off, daily_cap, refused, blocked, safety, ...).
import { checkAnswer, soundsUnsafe } from './check.ts';
import { LANGUAGE_NAMES } from './languages.ts';
import { promptFor } from './prompts.ts';
import { anthropicProvider } from './providers/anthropic.ts';
import { ALLOWED, costCents, modelFor } from './providers/models.ts';
import type { Provider, Turn } from './providers/types.ts';
import { programForAi, strip } from './strip.ts';

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  ANTHROPIC_API_KEY?: string;
  SITE_URL?: string;
  /** Rand per US dollar, for the spend estimate (wrangler.jsonc vars). */
  ZAR_PER_USD?: string;
  BY_ADDRESS?: RateLimiter;
}

export interface Deps {
  fetch: typeof fetch;
  now: () => number;
  /** Tests give a fake provider; otherwise the model's own adapter is made from the key. */
  provider?: (model: string) => Provider;
}

type Audience = 'adult' | 'child';
interface Asker {
  audience: Audience;
  id: string;
}
interface Config {
  adult_model: string;
  child_model: string;
  adult_prompt: string;
  child_prompt: string;
}
interface Take {
  allowed: boolean;
  reason: string | null;
  grade_band: string | null;
  names: string[] | null;
}
export interface LessonJson {
  id: string;
  title: string;
  grades: number[];
  parts: { item: string; qty: number; substitute?: string }[];
  safety: { adult_help: boolean; notes: string[] };
  body: string;
  hash?: string;
}

const LESSON_ID = /^[a-z0-9-]{3,60}$/;
const LANGUAGE = /^[a-z]{2,3}$/;
const PAGES = ['home', 'lesson', 'editor', 'world'] as const;
export const MAX_QUESTION = { adult: 500, child: 200 } as const;
export const MAX_ANSWER = { adult: 1200, child: 700 } as const;

const reply = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer'
    }
  });
const answer = (status: string, text?: string) =>
  reply(200, text === undefined ? { status } : { status, answer: text });

export async function rpc<T>(
  env: Env,
  deps: Deps,
  fn: string,
  args: Record<string, unknown>,
  asToken?: string
): Promise<T | null> {
  const res = await deps.fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: asToken ? env.SUPABASE_ANON_KEY : env.SUPABASE_SERVICE_KEY,
      authorization: `Bearer ${asToken ?? env.SUPABASE_SERVICE_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(args)
  });
  if (!res.ok) return null;
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Who is asking: a learner session (the database says whose) or an adult (Supabase says). */
async function asker(request: Request, env: Env, deps: Deps): Promise<Asker | null> {
  const token = /^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/.exec(
    request.headers.get('authorization') ?? ''
  )?.[1];
  if (!token) return null;
  let kind: string;
  try {
    const payload = JSON.parse(
      atob((token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/'))
    ) as { kind?: unknown };
    kind = typeof payload.kind === 'string' ? payload.kind : '';
  } catch {
    return null;
  }
  if (kind === 'learner') {
    const id = await rpc<string | null>(env, deps, 'whoami_learner', {}, token);
    return id ? { audience: 'child', id } : null;
  }
  const res = await deps.fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string };
  return user.id ? { audience: 'adult', id: user.id } : null;
}

// The lesson as built by the site (/lessons/<id>.json), kept for 10 minutes per Worker.
const lessons = new Map<string, { at: number; lesson: LessonJson | null }>();
export async function lessonFor(id: string, env: Env, deps: Deps): Promise<LessonJson | null> {
  const hit = lessons.get(id);
  if (hit && deps.now() - hit.at < 10 * 60_000) return hit.lesson;
  const res = await deps.fetch(
    `${env.SITE_URL ?? 'https://robotsforall.org.za'}/lessons/${id}.json`
  );
  const lesson = res.ok ? ((await res.json()) as LessonJson) : null;
  lessons.set(id, { at: deps.now(), lesson });
  return lesson;
}

/** The lesson as context: the same text for every question about it, so it is cached. */
export function lessonContext(l: LessonJson): string {
  const parts = l.parts
    .map((p) => `- ${p.qty} × ${p.item}${p.substitute ? ` (or ${p.substitute})` : ''}`)
    .join('\n');
  return [
    `Lesson: ${l.title} (grades ${l.grades.map((g) => (g === 0 ? 'R' : String(g))).join(', ')})`,
    `Parts:\n${parts}`,
    `Safety: ${l.safety.adult_help ? 'an adult must help with this lesson.' : 'no adult help needed beyond normal supervision.'}\n${l.safety.notes.map((n) => `- ${n}`).join('\n')}`,
    `Lesson text:\n${l.body}`
  ].join('\n\n');
}

const str = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max ? v.trim() : null;

export async function handle(request: Request, env: Env, deps: Deps): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const faq = /^\/helper\/faq\/([a-z0-9-]{3,60})$/.exec(pathname);
  if (faq && request.method === 'GET') {
    const lang = url.searchParams.get('lang') ?? 'en';
    if (!LANGUAGE.test(lang)) return reply(400, { status: 'bad_request' });
    // The edge keeps each lesson's answers for 5 minutes, so a class opening one lesson at once
    // costs one database read (Workers Cache API; absent in tests).
    const edge = (globalThis as { caches?: { default?: Cache } }).caches?.default;
    const key = new Request(`${url.origin}${pathname}?lang=${lang}`);
    const kept = edge ? await edge.match(key) : undefined;
    if (kept) return kept;
    const rows =
      (await rpc<{ item: number; q: string; a: string }[]>(env, deps, 'helper_faq_for', {
        p_lesson: faq[1],
        p_language: lang
      })) ?? [];
    const res = new Response(JSON.stringify({ items: rows }), {
      headers: {
        'content-type': 'application/json',
        // Short, so a hidden answer goes soon; the phone keeps its own copy for offline.
        'cache-control': 'public, max-age=300',
        'x-content-type-options': 'nosniff'
      }
    });
    if (edge) await edge.put(key, res.clone());
    return res;
  }
  if (request.method !== 'POST') return reply(405, { status: 'post_only' });
  if (!['/helper/ask', '/helper/thumb', '/helper/faq-down'].includes(pathname)) {
    return reply(404, { status: 'not_found' });
  }
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object') throw new Error('not an object');
    body = parsed as Record<string, unknown>;
  } catch {
    return reply(400, { status: 'bad_request' });
  }
  const address = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (env.BY_ADDRESS && !(await env.BY_ADDRESS.limit({ key: address })).success) {
    return reply(429, { status: 'slow_down' });
  }
  const who = await asker(request, env, deps);
  if (!who) return reply(401, { status: 'sign_in' });

  if (pathname === '/helper/faq-down') {
    const lesson =
      typeof body['lesson'] === 'string' && LESSON_ID.test(body['lesson']) ? body['lesson'] : null;
    const lang =
      typeof body['language'] === 'string' && LANGUAGE.test(body['language'])
        ? body['language']
        : null;
    const item = body['item'];
    if (
      !lesson ||
      !lang ||
      typeof item !== 'number' ||
      !Number.isInteger(item) ||
      item < 0 ||
      item > 7
    ) {
      return reply(400, { status: 'bad_request' });
    }
    const hidden = await rpc<boolean>(env, deps, 'helper_faq_down', {
      p_lesson: lesson,
      p_language: lang,
      p_item: item,
      p_subject: who.id
    });
    if (hidden === true) {
      // Hidden at once (FR-17): the edge's copy of that lesson goes too.
      const edge = (globalThis as { caches?: { default?: Cache } }).caches?.default;
      await edge?.delete(new Request(`${url.origin}/helper/faq/${lesson}?lang=${lang}`));
    }
    return reply(200, { status: 'ok', hidden: hidden === true });
  }

  if (pathname === '/helper/thumb') {
    if (typeof body['up'] !== 'boolean') return reply(400, { status: 'bad_request' });
    await rpc(env, deps, 'helper_thumb', { p_audience: who.audience, p_up: body['up'] });
    return answer('ok');
  }

  // --- /helper/ask ---
  const max = MAX_QUESTION[who.audience];
  const question = str(body['question'], max);
  const page = PAGES.find((p) => p === body['page']);
  const lessonId =
    typeof body['lesson'] === 'string' && LESSON_ID.test(body['lesson']) ? body['lesson'] : null;
  const language =
    typeof body['language'] === 'string' && LANGUAGE.test(body['language'])
      ? body['language']
      : 'en';
  if (!question || !page) return reply(400, { status: 'bad_request' });
  const earlierRaw = body['earlier'] as Record<string, unknown> | undefined;
  const earlier =
    earlierRaw && typeof earlierRaw === 'object'
      ? { question: str(earlierRaw['question'], max), answer: str(earlierRaw['answer'], 2000) }
      : null;
  if (earlier && (!earlier.question || !earlier.answer))
    return reply(400, { status: 'bad_request' });

  // A child who sounds unsafe is answered at once, before anything else (spec §7.2).
  if (who.audience === 'child' && soundsUnsafe(question)) return answer('safety');

  // Children: lesson pages only, and the lesson must exist (FR-2).
  const onLesson = page === 'lesson' && lessonId !== null;
  const lesson = lessonId ? await lessonFor(lessonId, env, deps) : null;
  if (who.audience === 'child' && (!onLesson || !lesson)) return answer('lesson_only');

  const take = (
    await rpc<Take[]>(env, deps, 'helper_take', {
      p_adult: who.audience === 'adult' ? who.id : null,
      p_learner: who.audience === 'child' ? who.id : null,
      p_on_lesson: onLesson && lesson !== null
    })
  )?.[0];
  if (!take) return answer('unavailable');
  if (!take.allowed) return answer(take.reason ?? 'unavailable');

  const config = await rpc<Config>(env, deps, 'helper_config', {});
  if (!config) return answer('unavailable');
  const model = modelFor(
    who.audience === 'adult' ? config.adult_model : config.child_model,
    who.audience
  );
  const system = promptFor(
    who.audience === 'adult' ? config.adult_prompt : config.child_prompt,
    who.audience
  );

  // Context: the lesson (cached), plus the program and run for adults in the editor or world.
  const pieces = [lesson ? lessonContext(lesson) : 'No lesson: a general STEM question.'];
  if (who.audience === 'adult') {
    const program = programForAi(body['program']);
    if (program) pieces.push(`The program on screen (blocks as JSON):\n${program}`);
    const run = programForAi(body['run'], 3000);
    if (run) pieces.push(`The last robot world run report (JSON):\n${run}`);
  }
  const names = take.names ?? [];
  const turns: Turn[] = [];
  if (earlier?.question && earlier.answer) {
    turns.push({ role: 'user', text: strip(earlier.question, names) });
    turns.push({ role: 'assistant', text: strip(earlier.answer, names) });
  }
  const lead = [
    who.audience === 'child' && take.grade_band ? `Grade band: ${take.grade_band}.` : '',
    `Answer in ${LANGUAGE_NAMES[language] ?? 'English'}.`
  ]
    .filter(Boolean)
    .join(' ');
  turns.push({ role: 'user', text: `${lead}\n\n${strip(question, names)}` });

  const providerFor = deps.provider ?? (() => anthropicProvider(env.ANTHROPIC_API_KEY ?? ''));
  const ask = (m: string) =>
    providerFor(m).ask({
      model: m,
      system,
      context: pieces.join('\n\n'),
      turns,
      maxTokens: 2000
    });
  let used = model;
  let out;
  try {
    out = await ask(model);
  } catch {
    // FR-27: one try on the default model, then the page falls back to Common questions.
    if (model === 'claude-haiku-5-5') return answer('unavailable');
    used = 'claude-haiku-5-5';
    try {
      out = await ask(used);
    } catch {
      return answer('unavailable');
    }
  }
  const cents = ALLOWED[used] ? costCents(used, out.usage, Number(env.ZAR_PER_USD ?? '18')) : 0;
  if (out.refused) {
    await rpc(env, deps, 'helper_record', {
      p_subject: who.id,
      p_audience: who.audience,
      p_refused: true,
      p_blocked: false,
      p_cost_cents: cents
    });
    return answer('refused');
  }
  const checked = checkAnswer(out.text, MAX_ANSWER[who.audience]);
  await rpc(env, deps, 'helper_record', {
    p_subject: who.id,
    p_audience: who.audience,
    p_refused: false,
    p_blocked: checked.blocked,
    p_cost_cents: cents
  });
  return checked.blocked ? answer('blocked') : answer('ok', checked.text);
}
