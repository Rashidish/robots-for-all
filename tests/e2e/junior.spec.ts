// Junior (Grades R–2; spec docs/specs/junior.md, ADR-0019) on a 360 px phone: picture blocks are
// tapped into a row and drive the robot on a grid, one square per step. Found and tapped by their
// spoken names (what a screen reader says), the way a child taps the pictures without reading.
import { expect, test } from './fixtures';

const tap = (page: import('@playwright/test').Page, name: string) =>
  page.getByRole('group', { name: 'Blocks' }).getByRole('button', { name, exact: true }).click();

test.describe('Junior (Grades R–2)', () => {
  test('a 4×4 mission is solved with picture blocks, with two stars kept on the phone', async ({
    page
  }) => {
    await page.goto('/code/junior/#rhino-to-water');
    await expect(page.getByRole('heading', { name: 'Rhino to the water' })).toBeVisible();
    for (const b of ['Three times', 'Forward', 'Turn right', 'Three times', 'Forward']) {
      await tap(page, b);
    }
    const row = page.getByRole('list', { name: 'Your program' });
    await expect(row.getByRole('button')).toHaveCount(5);
    // Tapping a block in the row takes it out; tapping it back in puts it at the end.
    await row
      .getByRole('button', { name: /Forward/ })
      .last()
      .click();
    await expect(row.getByRole('button')).toHaveCount(4);
    await tap(page, 'Forward');
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Well done! The best way!')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('img', { name: /The robot is at D4/ })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > 360);
    expect(overflow).toBe(false);
    await page.reload();
    await expect(
      page.getByRole('button', { name: '4. Rhino to the water (2 stars)' })
    ).toBeVisible();
  });

  test('bumping a rock says try again and the robot stays put', async ({ page }) => {
    await page.goto('/code/junior/#rhino-to-water');
    for (const b of ['Forward', 'Turn right', 'Forward']) await tap(page, b);
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Oops, a rock! Try again.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('img', { name: /The robot is at B1/ })).toBeVisible();
  });

  test('the code editor links to Junior, and Junior works offline after a visit', async ({
    page,
    context
  }) => {
    await page.goto('/code/');
    await page.getByRole('link', { name: 'Junior' }).click();
    await expect(page).toHaveURL(/\/code\/junior\/$/);
    await expect(page.getByRole('heading', { name: 'Three steps to the flower' })).toBeVisible();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Three steps to the flower' })).toBeVisible();
    await context.setOffline(true);
    await page.reload();
    await tap(page, 'Forward');
    await tap(page, 'Forward');
    await tap(page, 'Forward');
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Well done! The best way!')).toBeVisible({ timeout: 10_000 });
    await context.setOffline(false);
  });
});

test.describe('Junior printables and projector (step 2)', () => {
  const pdfPages = async (page: import('@playwright/test').Page) => {
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    return (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  };

  test('arrow cards print on two A4 pages; each mission sheet on one', async ({ page }) => {
    await page.goto('/code/junior/');
    await page.getByRole('link', { name: 'Arrow cards' }).click();
    await expect(page).toHaveURL(/\/code\/junior\/cards\/$/);
    await expect(page.getByRole('heading', { name: 'Arrow cards' })).toBeVisible();
    expect(await pdfPages(page)).toBe(2);
    for (const id of [
      'bee-first-steps',
      'bee-to-flower',
      'bus-round-corner',
      'rhino-to-water',
      'rhino-count-steps',
      'bus-to-school'
    ]) {
      await page.goto(`/code/junior/sheet/${id}/`);
      await expect(page.getByRole('img').first()).toBeVisible();
      expect(await pdfPages(page), `${id} sheet pages`).toBe(1);
    }
  });

  test('each mission links to its sheet; Big screen makes the blocks bigger', async ({ page }) => {
    await page.goto('/code/junior/#rhino-to-water');
    await expect(page.getByRole('link', { name: 'Print this mission' })).toHaveAttribute(
      'href',
      '/code/junior/sheet/rhino-to-water/'
    );
    const forward = page
      .getByRole('group', { name: 'Blocks' })
      .getByRole('button', { name: 'Forward', exact: true });
    const before = (await forward.boundingBox())?.height ?? 0;
    const big = page.getByRole('button', { name: 'Big screen' });
    await big.click();
    await expect(big).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(async () => (await forward.boundingBox())?.height ?? 0)
      .toBeGreaterThan(before);
    await big.click();
    await expect(big).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('Junior lessons (step 3)', () => {
  test('a Grade R lesson opens its mission and its picture sheet, with no PRIMM answer sheet', async ({
    page
  }) => {
    await page.goto('/lessons/?grade=0');
    await expect(page.getByRole('link', { name: 'Be the robot' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Rolling cardboard cart' })).toBeHidden();
    await page.getByRole('link', { name: 'Be the robot' }).click();
    await expect(page.getByRole('heading', { name: 'Be the robot', level: 1 })).toBeVisible();
    const facts = page.locator('.facts');
    await expect(facts).toContainText('Junior');
    await expect(facts).toContainText('Grade R');
    await expect(page.getByRole('heading', { name: 'Try', level: 2 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Print the answer sheet' })).toHaveCount(0);
    expect((await page.request.get('/lessons/j-robot-01/answer-sheet/')).status()).toBe(404);
    await page.getByRole('link', { name: 'Print the “Three steps to the flower” sheet' }).click();
    await expect(page).toHaveURL(/\/code\/junior\/sheet\/bee-first-steps\/$/);
    await page.goBack();
    await page.getByRole('link', { name: 'Open “Three steps to the flower”' }).click();
    await expect(page.getByRole('heading', { name: 'Three steps to the flower' })).toBeVisible();
    for (let i = 0; i < 3; i++) await tap(page, 'Forward');
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Well done! The best way!')).toBeVisible({ timeout: 10_000 });
  });

  test('a Junior lesson opens a later mission from its link', async ({ page }) => {
    await page.goto('/lessons/j-count-01/');
    await expect(page.locator('.facts')).toContainText('Grade 2');
    await page.getByRole('link', { name: 'Open “Count to the water”' }).click();
    await expect(page.getByRole('heading', { name: 'Count to the water' })).toBeVisible();
    await tap(page, 'Five times');
    await tap(page, 'Forward');
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Well done! The best way!')).toBeVisible({ timeout: 10_000 });
  });
});
