import { describe, expect, it } from 'vitest';
import { checkLinks, checkPrimm, gradesText, isVisible, lessonSchema } from './schema';

const valid = {
  id: 'p1-crank-01',
  title: 'Crank-powered waving rhino',
  phase: 1,
  grades: [3, 4],
  mechanism: 'crank',
  syllabus_links: [{ subject: 'Natural Sciences and Technology', topic: 'Mechanical systems' }],
  duration_minutes: 45,
  cost_estimate_zar: 15,
  parts: [{ item: 'cardboard', qty: 1, substitute: 'cereal-box card' }],
  outcomes: ['Explain what a crank does', 'Build a working crank'],
  safety: { adult_help: false, notes: ['Use safety scissors'] },
  assessment: ['I can point to the crank', 'I can explain the motion', 'I can fix a stuck crank'],
  templates: ['rhino-parts'],
  status: 'draft',
  ai_generated: true,
  reviewed_by: null
};

const primmBody = '## Predict\nx\n## Run\nx\n## Investigate\nx\n## Modify\nx\n## Make\nx\n';

describe('lesson front matter', () => {
  it('accepts a valid draft', () => {
    expect(lessonSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults Phase 2 fields and checks their values', () => {
    const parsed = lessonSchema.parse(valid);
    expect(parsed.starter_program).toBeNull();
    expect(parsed.hardware).toBe('none');
    expect(
      lessonSchema.safeParse({
        ...valid,
        starter_program: 'blink-heart',
        hardware: 'microbit-motor'
      }).success
    ).toBe(true);
    expect(lessonSchema.safeParse({ ...valid, starter_program: '../x' }).success).toBe(false);
    expect(lessonSchema.safeParse({ ...valid, hardware: 'arduino' }).success).toBe(false);
    expect(parsed.world).toBeNull();
    expect(lessonSchema.safeParse({ ...valid, world: 'dark-tunnel' }).success).toBe(true);
    expect(lessonSchema.safeParse({ ...valid, world: '../x' }).success).toBe(false);
  });

  it('rejects a published lesson nobody reviewed', () => {
    const result = lessonSchema.safeParse({ ...valid, status: 'published' });
    expect(result.success).toBe(false);
  });

  it('accepts a published lesson that was reviewed and build-tested', () => {
    const result = lessonSchema.safeParse({
      ...valid,
      status: 'published',
      reviewed_by: 'T. Mokoena',
      build_tested_by: 'Robotics club, 22 Nov'
    });
    expect(result.success).toBe(true);
  });

  it('rejects a published lesson nobody built from the instructions', () => {
    const result = lessonSchema.safeParse({
      ...valid,
      status: 'published',
      reviewed_by: 'T. Mokoena'
    });
    expect(result.success).toBe(false);
  });

  it('fills sensible defaults for links and build testing', () => {
    const result = lessonSchema.parse(valid);
    expect(result.prerequisites).toEqual([]);
    expect(result.next).toBeNull();
    expect(result.build_tested_by).toBeNull();
  });

  it.each([
    ['bad id', { id: 'rhino' }],
    ['phase 4', { phase: 4 }],
    ['no parts', { parts: [] }],
    ['template with a file extension', { templates: ['rhino.svg'] }],
    ['unknown status', { status: 'live' }],
    ['one outcome', { outcomes: ['Only one outcome here'] }],
    ['no safety notes', { safety: { adult_help: false, notes: [] } }],
    ['assessment not "I can"', { assessment: ['Knows cranks', 'Builds', 'Explains'] }],
    ['two assessment items', { assessment: ['I can a', 'I can b'] }],
    ['link to itself', { next: 'p1-crank-01' }],
    ['bad next id', { next: 'gears' }]
  ])('rejects %s', (_name, change) => {
    expect(lessonSchema.safeParse({ ...valid, ...change }).success).toBe(false);
  });
});

describe('PRIMM structure', () => {
  it('passes when all five steps are present in order', () => {
    expect(checkPrimm(primmBody)).toEqual([]);
  });

  it('reports a missing step', () => {
    expect(checkPrimm(primmBody.replace('## Modify', '## Change'))).toEqual([
      'Missing "## Modify" heading'
    ]);
  });

  it('reports steps out of order', () => {
    const swapped = '## Run\n## Predict\n## Investigate\n## Modify\n## Make\n';
    expect(checkPrimm(swapped)).toHaveLength(1);
  });
});

describe('Junior lessons (Grades R–2, spec junior.md §9 step 3)', () => {
  const junior = {
    ...valid,
    id: 'j-robot-01',
    phase: 0,
    grades: [0],
    mechanism: 'directions',
    templates: [],
    junior_missions: ['bee-first-steps']
  };

  it('accepts phase 0 with Grade R and a mission', () => {
    expect(lessonSchema.safeParse(junior).success).toBe(true);
    expect(gradesText([0, 1])).toBe('R–1');
    expect(gradesText([3, 4])).toBe('3–4');
  });

  it.each([
    ['a Junior id on another phase', { ...valid, id: 'j-robot-01' }],
    ['a Junior lesson with a p1 id', { ...junior, id: 'p1-robot-01' }],
    ['Grade R outside Junior', { ...valid, grades: [0, 3] }],
    ['a Junior lesson for Grade 3', { ...junior, grades: [2, 3] }],
    ['a Junior lesson with no mission', { ...junior, junior_missions: [] }],
    ['missions on a Phase 1 lesson', { ...valid, junior_missions: ['bee-first-steps'] }]
  ])('rejects %s', (_name, lesson) => {
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it('has four steps: Predict, Run, Try, Make', () => {
    const body = '## Predict\nx\n## Run\nx\n## Try\nx\n## Make\nx\n## Teacher notes\nx\n';
    expect(checkPrimm(body, 0)).toEqual([]);
    expect(checkPrimm(primmBody, 0)).toEqual([
      'Missing "## Try" heading',
      '"## Investigate" isn\'t a step of this lesson\'s phase',
      '"## Modify" isn\'t a step of this lesson\'s phase'
    ]);
    expect(checkPrimm(body)).toContain('"## Try" isn\'t a step of this lesson\'s phase');
  });
});

describe('draft visibility', () => {
  it('always shows published lessons', () => {
    expect(isVisible({ status: 'published' }, false)).toBe(true);
  });

  it('hides drafts and lessons in review in production', () => {
    expect(isVisible({ status: 'draft' }, false)).toBe(false);
    expect(isVisible({ status: 'in_review' }, false)).toBe(false);
  });

  it('shows drafts on preview builds', () => {
    expect(isVisible({ status: 'draft' }, true)).toBe(true);
  });
});

describe('links between lessons', () => {
  const existing = new Set(['p1-crank-01', 'p1-lever-01']);

  it('accepts links to lessons that exist', () => {
    expect(checkLinks({ prerequisites: ['p1-lever-01'], next: null }, existing)).toEqual([]);
  });

  it('reports links to lessons that do not exist', () => {
    expect(checkLinks({ prerequisites: ['p1-gear-01'], next: 'p1-cam-01' }, existing)).toEqual([
      'links to "p1-gear-01", which doesn\'t exist',
      'links to "p1-cam-01", which doesn\'t exist'
    ]);
  });
});
