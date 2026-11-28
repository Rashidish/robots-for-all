// Common questions (M6 spec FR-15 to FR-19): drafted by AI from the lesson text only, with the
// children's rules, checked automatically, stored without human review (owner decision 6) and
// shown with the AI disclaimer. An answer that fails the check is dropped; a lesson with fewer
// than 3 good questions keeps what it had and is tried again the next day.
import { checkAnswer } from './check.ts';
import { LANGUAGE_NAMES } from './languages.ts';
import type { Provider } from './providers/types.ts';

export interface FaqItem {
  q: string;
  a: string;
}

export const MAX_Q = 200;
export const MAX_A = 600;

/** The AI's reply as checked items: JSON only, 5–8 wanted, at least 3 kept. */
export function parseFaq(reply: string): { items: FaqItem[]; dropped: number } {
  const start = reply.indexOf('[');
  const end = reply.lastIndexOf(']');
  let raw: unknown = [];
  if (start >= 0 && end > start) {
    try {
      raw = JSON.parse(reply.slice(start, end + 1));
    } catch {
      raw = [];
    }
  }
  const items: FaqItem[] = [];
  let dropped = 0;
  for (const entry of Array.isArray(raw) ? raw : []) {
    const e = entry as Record<string, unknown>;
    const q = typeof e['q'] === 'string' ? e['q'].trim() : '';
    const a = typeof e['a'] === 'string' ? e['a'].trim() : '';
    if (!q || !a || q.length > MAX_Q) {
      dropped += 1;
      continue;
    }
    const cq = checkAnswer(q, MAX_Q);
    const ca = checkAnswer(a, MAX_A);
    if (cq.blocked || ca.blocked || cq.text !== q) {
      dropped += 1;
      continue;
    }
    items.push({ q, a: ca.text });
    if (items.length === 8) break;
  }
  return { items, dropped };
}

export interface DraftInput {
  provider: Provider;
  model: string;
  system: string;
  context: string;
  language: string;
  youngestGrade: number;
}

/** Asks for one lesson's Common questions in one language. */
export async function draftFaq(input: DraftInput) {
  const out = await input.provider.ask({
    model: input.model,
    system: input.system,
    context: input.context,
    turns: [
      {
        role: 'user',
        text: `Write the common questions in ${LANGUAGE_NAMES[input.language] ?? 'English'}, for Grade ${input.youngestGrade === 0 ? 'R' : input.youngestGrade} and up.`
      }
    ],
    maxTokens: 3000
  });
  const parsed = out.refused ? { items: [], dropped: 0 } : parseFaq(out.text);
  return { ...parsed, refused: out.refused, usage: out.usage };
}
