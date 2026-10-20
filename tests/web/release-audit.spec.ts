import { tool, searchCatalog } from './menu';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Fallback UI proof is separate from globe/GPU acceptance.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  });
});
test('privacy policy is accessible and distinguishes local storage, external sites and pending hosting review', async ({
  page,
}) => {
  await page.goto('/');
  await tool(page, 'Ayarlar ve gizlilik');
  const policy = page.getByTestId('privacy-policy');
  await expect(policy).toContainText('Gizlilik politikası');
  await expect(policy).toContainText('2026-10-18');
  await expect(policy).toContainText('uygulama GPS istemez');
  await expect(policy).toContainText('sunucuya yedekleme yoktur');
  await expect(policy).toContainText('henüz belirlenmemiştir');
  await expect(policy).toContainText('harici tarayıcıda açılır');
});
test('HTML-like search stays an input value without executing or creating an image node', async ({
  page,
}) => {
  await page.goto('/');
  const payload = '<img src=x onerror="window.__atlasXss=1">';
  await searchCatalog(page, payload);
  await expect(page.getByTestId('search-records').getByRole('textbox')).toHaveValue(payload);
  await expect(page.getByTestId('search-records').locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, '__atlasXss'))).toBeUndefined();
});
