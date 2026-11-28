// Every answer sheet code (answer-sheets spec Part B): what the app shows when a learner records a
// sheet, offline. Current sheets are made from the lessons at build time; sheets printed from
// older versions of a lesson come from content/sheets/codes.json, which only ever grows
// (`npm run sheet-codes` after a build adds new codes; a test fails if one is missing).
import type { APIRoute } from 'astro';
import past from '../../../../content/sheets/codes.json';
import { answerSheet, sheetCode, type SheetSummary, sheetSummary } from '../lessons/answers';
import { getLessons } from '../lessons/load';
import { localLesson } from '../lessons/translations';
import { siteLanguages } from '../site-languages';

export const GET: APIRoute = async () => {
  const lessons = await getLessons();
  const current: Record<string, SheetSummary> = {};
  // Junior lessons have picture mission sheets, with no sheet code (spec junior.md FR-6).
  for (const lesson of lessons.filter((l) => l.data.phase !== 0)) {
    for (const { code: lang } of siteLanguages) {
      const local = await localLesson(lesson, lang, lessons);
      if (local.lang !== lang) continue; // shown in English: the English sheet covers it
      const sections = answerSheet(local.body, local.steps);
      const code = await sheetCode(lesson.id, local.lang, sections, local.data.assessment);
      current[code] = sheetSummary(
        lesson.id,
        local.lang,
        local.data.title,
        sections,
        local.data.assessment
      );
    }
  }
  const all = { ...(past as Record<string, SheetSummary>), ...current };
  return new Response(JSON.stringify({ current: Object.keys(current).sort(), sheets: all }), {
    headers: { 'content-type': 'application/json' }
  });
};
