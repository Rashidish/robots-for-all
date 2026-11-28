// How a lesson's phase and grades are shown: phase 0 is "Junior", Grade R is 0 (spec junior.md).
import { m } from '../i18n';
import { gradesText } from './schema';

export const phaseLabel = (phase: number): string =>
  phase === 0 ? m.lesson_phase_junior() : m.lesson_phase({ phase });

/** "Grade R" for one grade, "Grades 3–4" for more. */
export const gradesLabel = (grades: readonly number[]): string =>
  grades.length === 1
    ? m.lesson_grade({ grade: gradesText(grades) })
    : m.lesson_grades({ grades: gradesText(grades) });
