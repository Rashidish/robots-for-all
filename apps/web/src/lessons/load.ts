// Loads visible lessons and enforces the rules that need the lesson body or folder name.
import { getCollection, type CollectionEntry } from 'astro:content';
import { findTemplate } from '../templates/load';
import { findProgram } from './programs';
import { checkLinks, checkPrimm, isVisible } from './schema';
import { isOff } from '../withdrawn';
import { languageProblems } from './languages';
import { badgeProblems } from './badges';
import { seasonProblems } from './seasons';
import { worldIds, worldProblems } from './worlds';
import { juniorMissions, juniorProblems } from '../junior/missions';

export type LessonEntry = CollectionEntry<'lessons'>;

/** Production builds set SHOW_DRAFTS=false so only published lessons go live (ADR-0004 rule 4).
 * Read from the build environment (this code only runs at build time, never in the browser). */
export const showDrafts = process.env['SHOW_DRAFTS'] !== 'false';

export async function getLessons(): Promise<LessonEntry[]> {
  const all = await getCollection('lessons');
  const ids = new Set(all.map((l) => l.id));
  const problems: string[] = [];
  for (const lesson of all) {
    if (lesson.data.id !== lesson.id) {
      problems.push(`${lesson.id}: front matter id "${lesson.data.id}" must match the folder name`);
    }
    for (const p of checkPrimm(lesson.body ?? '', lesson.data.phase))
      problems.push(`${lesson.id}: ${p}`);
    for (const p of checkLinks(lesson.data, ids)) problems.push(`${lesson.id}: ${p}`);
    for (const name of lesson.data.templates) {
      if (!findTemplate(lesson.id, name)) {
        problems.push(
          `${lesson.id}: template "${name}" not found in content/projects/${lesson.id}/templates/`
        );
      }
    }
  }
  for (const lesson of all) {
    const name = lesson.data.starter_program;
    if (!name) continue;
    try {
      if (!findProgram(lesson.id, name)) {
        problems.push(
          `${lesson.id}: starter program "${name}" not found in content/lessons/${lesson.id}/programs/`
        );
      }
    } catch (err) {
      problems.push(
        `${lesson.id}: starter program "${name}" is not a valid program (${String(err)})`
      );
    }
  }
  // Robot worlds are content too: a broken world, or a lesson naming one that doesn't exist,
  // fails the build (M4 spec FR-4, FR-8).
  problems.push(
    ...worldProblems(),
    ...seasonProblems(),
    ...languageProblems(),
    ...juniorProblems()
  );
  const worlds = worldIds();
  const missions = new Set(juniorMissions().map((j) => j.id));
  for (const lesson of all) {
    for (const id of lesson.data.junior_missions) {
      if (!missions.has(id))
        problems.push(`${lesson.id}: mission "${id}" not found in content/junior/`);
    }
    const world = lesson.data.world;
    if (world && !worlds.has(world)) {
      problems.push(`${lesson.id}: world "${world}" not found in content/worlds/`);
    }
    if (world && !lesson.data.starter_program) {
      problems.push(`${lesson.id}: world "${world}" needs a starter_program to open it with`);
    }
  }
  if (problems.length > 0) {
    throw new Error(`Lesson problems:\n- ${problems.join('\n- ')}`);
  }
  // Junior lessons follow their missions' order (content/junior/order.json), easiest first.
  const order = juniorMissions().map((j) => j.id);
  const rank = (l: LessonEntry) => {
    const i = order.indexOf(l.data.junior_missions[0] ?? '');
    return i < 0 ? order.length : i;
  };
  const visible = all
    .filter((l) => isVisible(l.data, showDrafts) && !(isOff('lesson', l.id) && !showDrafts))
    .sort((a, b) => a.data.phase - b.data.phase || rank(a) - rank(b) || a.id.localeCompare(b.id));
  // Badges (M5 FR-17): a published badge must be earnable from the lessons that are live.
  const facts = (list: LessonEntry[]) =>
    list.map((l) => ({ id: l.id, phase: l.data.phase, mechanism: l.data.mechanism }));
  const live = facts(all.filter((l) => l.data.status === 'published' && !isOff('lesson', l.id)));
  const badgeIssues = badgeProblems(facts(all), live);
  if (badgeIssues.length > 0) throw new Error(`Badge problems:\n- ${badgeIssues.join('\n- ')}`);
  return visible;
}
