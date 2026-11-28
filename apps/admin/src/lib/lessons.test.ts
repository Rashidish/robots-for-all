import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { afterDecision, onlyStatusChanged, summarise, withStatus } from './lessons';

const lessonsDir = join(import.meta.dirname, '../../../../content/lessons');
const ids = readdirSync(lessonsDir);
const read = (id: string) => readFileSync(join(lessonsDir, id, 'index.md'), 'utf8');

describe('Content → Lessons: reading front matter', () => {
  it('reads every lesson in the repository', () => {
    expect(ids.length).toBeGreaterThan(20);
    for (const id of ids) {
      const s = summarise(id, read(id));
      expect(s.id).toBe(id);
      expect(s.title.length, id).toBeGreaterThan(3);
      expect([0, 1, 2, 3], id).toContain(s.phase);
      expect(s.grades.length, id).toBeGreaterThan(0);
      expect(['draft', 'in_review', 'published'], id).toContain(s.status);
    }
  });

  it('reads p2-art-01 correctly', () => {
    expect(summarise('p2-art-01', read('p2-art-01'))).toEqual({
      id: 'p2-art-01',
      title: 'Pen art',
      phase: 2,
      grades: [4, 5, 6],
      status: 'draft',
      reviewedBy: null,
      buildTestedBy: null,
      aiGenerated: true,
      templates: ['pen-lifter'],
      starterProgram: 'draw-a-square'
    });
  });
});

describe('Content → Lessons: changing only the status fields', () => {
  it('changes only the status lines of every lesson, and reads back what it wrote', () => {
    for (const id of ids) {
      const before = read(id);
      const after = withStatus(before, {
        status: 'published',
        reviewedBy: 'Reviewer: 3',
        buildTestedBy: 'T. Builder'
      });
      expect(onlyStatusChanged(before, after), id).toBe(true);
      const s = summarise(id, after);
      expect(s.status).toBe('published');
      expect(s.reviewedBy).toBe('Reviewer: 3');
      expect(s.buildTestedBy).toBe('T. Builder');
      // Everything outside the front matter is byte-for-byte the same.
      expect(after.split('\n---\n').slice(1)).toEqual(before.split('\n---\n').slice(1));
    }
  });

  it('notices any other change', () => {
    const before = read('p2-art-01');
    expect(onlyStatusChanged(before, before.replace('Pen art', 'Pen art!'))).toBe(false);
    expect(onlyStatusChanged(before, `${before}\nextra`)).toBe(false);
    expect(onlyStatusChanged(before, before.replace('status: draft', 'next: x'))).toBe(false);
  });
});

describe('what each decision does', () => {
  const base = summarise('p2-art-01', read('p2-art-01'));

  it('the second of review and build test publishes', () => {
    expect(afterDecision(base, 'approved', 'R')).toEqual({ reviewedBy: 'R', status: 'in_review' });
    expect(afterDecision(base, 'build_tested', 'T')).toEqual({ buildTestedBy: 'T' });
    expect(afterDecision({ ...base, buildTestedBy: 'T' }, 'approved', 'R')).toEqual({
      reviewedBy: 'R',
      status: 'published'
    });
    expect(afterDecision({ ...base, reviewedBy: 'R' }, 'build_tested', 'T')).toEqual({
      buildTestedBy: 'T',
      status: 'published'
    });
  });

  it('asking for changes or unpublishing takes the review away', () => {
    expect(afterDecision(base, 'changes_requested', 'R')).toEqual({
      status: 'draft',
      reviewedBy: null
    });
    expect(afterDecision({ ...base, status: 'published' }, 'unpublished', 'R')).toEqual({
      status: 'draft',
      reviewedBy: null
    });
    expect(afterDecision(base, 'sent_for_review', null)).toEqual({ status: 'in_review' });
  });
});
