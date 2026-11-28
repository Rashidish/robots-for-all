// Automated WCAG 2.2 AA checks with axe-core. Catches about a third of issues; manual
// TalkBack testing (M1 spec §9) covers the rest.
import AxeBuilder from '@axe-core/playwright';
import { expect, LESSON, SLIDES, TEMPLATE, test } from './fixtures';

const pages = [
  '/',
  '/lessons/',
  LESSON,
  SLIDES,
  TEMPLATE,
  '/about/',
  '/privacy/',
  '/account/',
  '/enrol/',
  '/enrol/confirm/',
  '/class/',
  '/me/',
  '/badges/',
  '/verify/',
  '/offline/',
  '/no-such-page/',
  // A translated lesson, and one shown in English on an isiZulu page (more content spec §2.7)
  '/zu/lessons/p1-crank-01/',
  '/zu/lessons/p1-cam-01/',
  '/code/junior/',
  '/code/junior/cards/',
  '/code/junior/sheet/rhino-to-water/',
  '/lessons/j-robot-01/',
  '/lessons/j-robot-01/slides/'
];

for (const path of pages) {
  test(`no WCAG A/AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.help}, ${v.nodes.length} element(s)`
    );
    expect(summary).toEqual([]);
  });
}

test('dark mode also passes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(LESSON);
  const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
