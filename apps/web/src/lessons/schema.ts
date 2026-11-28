// Lesson rules (ADR-0004, CLAUDE.md §6). Used by the content collection at build time and by unit tests.
import { z } from 'astro/zod';

export const PRIMM_STEPS = ['Predict', 'Run', 'Investigate', 'Modify', 'Make'] as const;
/** Junior lessons (Grades R–2, spec docs/specs/junior.md): PRIMM simplified to four steps. */
export const JUNIOR_STEPS = ['Predict', 'Run', 'Try', 'Make'] as const;
/** Phase 0 is Junior (Grades R–2); phases 1–3 are Build, Control, Integrate. */
export const JUNIOR_PHASE = 0;
/** The `##` steps a lesson of this phase has, in order. */
export const stepsFor = (phase: number): readonly string[] =>
  phase === JUNIOR_PHASE ? JUNIOR_STEPS : PRIMM_STEPS;

const lessonId = z
  .string()
  .regex(/^(p[1-3]|j)-[a-z]+-\d{2}$/, 'id must look like p1-crank-01 (Junior: j-route-01)');

export const lessonSchema = z
  .object({
    id: lessonId,
    title: z.string().min(3).max(80),
    /** 0 Junior (Grades R–2) | 1 Build | 2 Control | 3 Integrate */
    phase: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    /** Grade R is 0 (shown as "R"). */
    grades: z.array(z.number().int().min(0).max(12)).min(1),
    mechanism: z.string().min(2),
    syllabus_links: z
      .array(z.object({ subject: z.string().min(2), topic: z.string().min(2) }))
      .default([]),
    duration_minutes: z.number().int().positive().max(240),
    cost_estimate_zar: z.number().nonnegative(),
    parts: z
      .array(
        z.object({
          item: z.string().min(2),
          qty: z.number().int().positive(),
          /** A free or cheaper thing that works instead, e.g. "cereal-box card". */
          substitute: z.string().min(2).optional()
        })
      )
      .min(1),
    /** What learners will know or be able to do (M2 spec FR-1). */
    outcomes: z.array(z.string().min(5)).min(2).max(4),
    /** Vocabulary words introduced in the lesson. */
    concepts: z.array(z.string().min(2)).default([]),
    safety: z.object({
      /** True when a step needs an adult (craft knife, skewer points, hot glue). */
      adult_help: z.boolean(),
      notes: z.array(z.string().min(5)).min(1)
    }),
    /** "I can…" checks for the end of the lesson. */
    assessment: z
      .array(z.string().regex(/^I can /, 'assessment items start with "I can "'))
      .min(3)
      .max(5),
    prerequisites: z.array(lessonId).default([]),
    next: lessonId.nullable().default(null),
    /** Template sheet names: files in content/projects/<lesson id>/templates/<name>.ts */
    templates: z
      .array(z.string().regex(/^[a-z0-9-]+$/, 'template names are file names without .ts'))
      .default([]),
    /** Phase 2+: a starter program in content/lessons/<id>/programs/<name>.rfa.json (M3 FR-10). */
    starter_program: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'starter program names are file names without .rfa.json')
      .nullable()
      .default(null),
    /** Phase 2+: the robot world the starter program opens in (M4 FR-8): content/worlds/<id>.json. */
    world: z
      .string()
      .regex(/^[a-z]+(-[a-z]+)*$/, 'world ids are file names in content/worlds without .json')
      .nullable()
      .default(null),
    /** Junior: the missions the lesson opens, in content/junior (spec junior.md §9 step 3). */
    junior_missions: z
      .array(z.string().regex(/^[a-z]+(-[a-z]+)*$/, 'mission ids are file names in content/junior'))
      .default([]),
    /** What a learner needs: every Phase 2 lesson also works on the on-screen micro:bit. */
    hardware: z.enum(['none', 'microbit', 'microbit-motor']).default('none'),
    status: z.enum(['draft', 'in_review', 'published']),
    ai_generated: z.boolean(),
    reviewed_by: z.string().min(2).nullable(),
    /** Who built the robot by following only the printed lesson (M2 spec §8). */
    build_tested_by: z.string().min(2).nullable().default(null)
  })
  .refine((l) => l.status !== 'published' || l.reviewed_by !== null, {
    message: 'A published lesson needs reviewed_by (a person must review it first)',
    path: ['reviewed_by']
  })
  .refine((l) => l.status !== 'published' || l.build_tested_by !== null, {
    message: 'A published lesson needs build_tested_by (someone must build it from the lesson)',
    path: ['build_tested_by']
  })
  .refine((l) => (l.phase === JUNIOR_PHASE) === l.id.startsWith('j-'), {
    message: 'Junior lessons (phase 0) have ids starting "j-", and only they do',
    path: ['id']
  })
  .refine((l) => l.phase === JUNIOR_PHASE || !l.grades.includes(0), {
    message: 'Grade R (0) is only for Junior lessons (phase 0)',
    path: ['grades']
  })
  .refine((l) => l.phase !== JUNIOR_PHASE || l.grades.every((g) => g <= 2), {
    message: 'Junior lessons are for Grades R to 2 (0, 1, 2)',
    path: ['grades']
  })
  .refine((l) => (l.phase === JUNIOR_PHASE) === l.junior_missions.length > 0, {
    message: 'Junior lessons name at least one mission in junior_missions, and only they do',
    path: ['junior_missions']
  })
  .refine((l) => l.next !== l.id && !l.prerequisites.includes(l.id), {
    message: 'A lesson cannot link to itself',
    path: ['next']
  });

export type Lesson = z.infer<typeof lessonSchema>;

/**
 * A lesson translation, content/lessons/<id>/index.<lang>.md (more content spec §2.7): only the
 * translated words, in the same order as the English lesson, plus its own review status. Facts
 * (grades, cost, quantities, templates, programs, adult help) always come from the English lesson.
 */
export const translationSchema = z
  .object({
    title: z.string().min(3).max(100),
    outcomes: z.array(z.string().min(3)).default([]),
    concepts: z.array(z.string().min(2)).default([]),
    parts: z
      .array(z.object({ item: z.string().min(2), substitute: z.string().min(2).optional() }))
      .default([]),
    safety_notes: z.array(z.string().min(3)).default([]),
    assessment: z.array(z.string().min(3)).default([]),
    /**
     * The lesson's template sheets in this language (translate-templates spec §2.1): by sheet
     * name, its title and each part's name and notes, in the same order as the sheet.
     */
    templates: z
      .record(
        z.string().regex(/^[a-z0-9-]+$/),
        z
          .object({
            title: z.string().min(2).optional(),
            parts: z
              .array(
                z
                  .object({
                    name: z.string().min(1).optional(),
                    notes: z.array(z.string().min(2)).optional()
                  })
                  .strict()
              )
              .default([])
          })
          .strict()
      )
      .default({}),
    /** The starter program's name in this language (spec §2.6), shown in My programs. */
    program_name: z.string().min(2).max(60).optional(),
    /** Which English text this translates: `npm run translation-hash -- <lesson id>`. */
    translated_from: z.string().regex(/^[0-9a-f]{16}$/, 'translated_from is 16 hex characters'),
    status: z.enum(['draft', 'in_review', 'published']),
    ai_generated: z.boolean(),
    reviewed_by: z.string().min(2).nullable()
  })
  .strict()
  .refine((t) => t.status !== 'published' || t.reviewed_by !== null, {
    message: 'A published translation needs reviewed_by (a reviewer who reads the language)',
    path: ['reviewed_by']
  });

export type Translation = z.infer<typeof translationSchema>;

/**
 * Returns problems with the lesson body: the five PRIMM steps (Junior: Predict, Run, Try, Make)
 * must be `##` headings, in order, and no other phase's steps may appear.
 */
export function checkPrimm(body: string, phase = 1): string[] {
  const steps = stepsFor(phase);
  const all = new Set<string>([...PRIMM_STEPS, ...JUNIOR_STEPS]);
  const headings = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => (m[1] ?? '').trim());
  const found = headings.filter((h) => all.has(h));
  const problems: string[] = [];
  for (const step of steps) {
    if (!found.includes(step)) problems.push(`Missing "## ${step}" heading`);
  }
  for (const h of found) {
    if (!steps.includes(h)) problems.push(`"## ${h}" isn't a step of this lesson's phase`);
  }
  if (problems.length === 0 && found.join() !== steps.join()) {
    problems.push(`Lesson steps must be in order: ${steps.join(', ')}`);
  }
  return problems;
}

/** "R" for Grade R (0), else the number: [0, 1] → "R–1". */
export const gradesText = (grades: readonly number[]): string =>
  grades.map((g) => (g === 0 ? 'R' : String(g))).join('–');

/** Drafts and lessons in review appear only when SHOW_DRAFTS is not "false" (production sets it to "false"). */
export function isVisible(lesson: Pick<Lesson, 'status'>, showDrafts: boolean): boolean {
  return lesson.status === 'published' || showDrafts;
}

/** Returns problems with links between lessons: every prerequisite and next lesson must exist. */
export function checkLinks(
  lesson: Pick<Lesson, 'prerequisites' | 'next'>,
  existing: ReadonlySet<string>
): string[] {
  const linked = [...lesson.prerequisites, ...(lesson.next ? [lesson.next] : [])];
  return linked
    .filter((id) => !existing.has(id))
    .map((id) => `links to "${id}", which doesn't exist`);
}
