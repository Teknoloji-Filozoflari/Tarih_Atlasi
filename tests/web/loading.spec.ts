import { expect, test } from './fixtures';
async function year(page: import('@playwright/test').Page, value: string) {
  const close = page.getByRole('button', { name: 'Paneli kapat', exact: true });
  if (await close.isVisible()) await close.click();
  await page
    .getByTestId('timeline-bar')
    .getByRole('button', { name: /^MS |^MÖ /u })
    .click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill(value);
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  });
  // Data endpoint loss only; app JS is still available. This does not assert offline cold start.
  await page.route('**/data/chunks/*.json', (route) => route.abort('internetdisconnected'));
});
test('data endpoint loss uses pinned licensed fallback; reload uses verified persistent cache', async ({
  page,
}) => {
  await page.goto('/');
  await year(page, '1867');
  await page.getByRole('button', { name: 'Keşfet', exact: true }).click();
  await expect(page.getByTestId('data-load-status')).toContainText('uygulamayla gelen izinli veri');
  await expect(page.getByTestId('data-load-status')).toContainText('0.7.0-discovery');
  await page.reload();
  await year(page, '1867');
  await page.getByRole('button', { name: 'Keşfet', exact: true }).click();
  await expect(page.getByTestId('data-load-status')).toContainText(
    'cihazdaki doğrulanmış önbellek',
  );
  await year(page, '2026');
  await page.getByRole('button', { name: 'Keşfet', exact: true }).click();
  await expect(page.getByTestId('data-load-status')).toHaveCount(0);
  await expect(
    page.getByTestId('timeline-coverage').getByTestId('historical-coverage'),
  ).toContainText('desteklenen tarihî coğrafya kaydı yok');
});
test('corrupt persisted body is discarded and replaced by approved bundled bytes', async ({
  page,
}) => {
  await page.goto('/');
  await year(page, '1867');
  await page.getByRole('button', { name: 'Keşfet', exact: true }).click();
  await expect(page.getByTestId('data-load-status')).toBeVisible();
  await page.evaluate(async () => {
    const c = await caches.open('tarihatlasi-historical-v1');
    for (const request of await c.keys()) {
      const old = await c.match(request);
      await c.put(request, new Response('CORRUPT', { headers: old?.headers }));
    }
  });
  await page.reload();
  await year(page, '1867');
  await page.getByRole('button', { name: 'Keşfet', exact: true }).click();
  await expect(page.getByTestId('data-load-status')).toContainText('uygulamayla gelen izinli veri');
  expect(
    await page.evaluate(async () => {
      const c = await caches.open('tarihatlasi-historical-v1');
      return Promise.all((await c.keys()).map(async (k) => (await c.match(k))?.text()));
    }),
  ).not.toContain('CORRUPT');
});
test('rapid year changes do not commit an older chunk response', async ({ page }) => {
  await page.goto('/');
  await page.unroute('**/data/chunks/*.json');
  await page.route('**/data/chunks/*.json', async (route) => {
    await new Promise((r) => setTimeout(r, 500));
    await route.abort();
  });
  await year(page, '1867');
  await year(page, '2026');
  await expect(page.getByTestId('timeline-bar').getByTestId('historical-coverage')).toHaveText(
    'Veri yok',
  );
  await page.waitForTimeout(800);
  await expect(
    page.getByTestId('timeline-bar').getByRole('button', { name: 'MS 2026', exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('data-load-status')).toHaveCount(0);
});
