import { expect, test } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => console.error('BROWSER_ERROR', error.message));
  page.on('requestfailed', (request) =>
    console.error('BROWSER_REQUEST_FAILED', request.url(), request.failure()?.errorText),
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      console.error('BROWSER_HTTP_ERROR', response.status(), response.url());
  });
});
test('country name opens a QID-resolved external article while globe/year state stays in the app', async ({
  page,
  context,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  // SYNTHETIC API transport response only. No source geometry is replaced.
  let requests = 0;
  await context.route('https://www.wikidata.org/w/api.php?*', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'Api-User-Agent,Accept',
          'access-control-allow-methods': 'GET,OPTIONS',
        },
      });
      return;
    }
    requests++;
    const id = new URL(route.request().url()).searchParams.get('ids')!;
    await route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        entities: {
          [id]: {
            id,
            lastrevid: 123,
            sitelinks: {
              trwiki: {
                site: 'trwiki',
                title: 'SYNTHETIC TEST ONLY',
                url: 'https://tr.wikipedia.org/wiki/SYNTHETIC_TEST_ONLY',
              },
            },
          },
        },
      }),
    });
  });
  await context.route('https://tr.wikipedia.org/wiki/SYNTHETIC_TEST_ONLY', (route) =>
    route.fulfill({ contentType: 'text/plain', body: 'SYNTHETIC TEST ONLY' }),
  );
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 30000 });
  await expect(host).toHaveAttribute('data-historical-year', '2024', { timeout: 30000 });
  const name = page.locator('.atlas-country-label').first();
  await expect(name).toBeVisible({ timeout: 30000 });
  expect(pageErrors.filter((message) => /hydration|#418/iu.test(message))).toEqual([]);
  const popup = context.waitForEvent('page');
  await name.click();
  const article = await popup;
  await expect(article).toHaveURL('https://tr.wikipedia.org/wiki/SYNTHETIC_TEST_ONLY');
  await expect(host).toHaveAttribute('data-historical-year', '2024');
  await expect(page.getByTestId('polity-card')).toBeVisible();
  expect(requests).toBe(1);
  await article.close();
});
test('timeline exposes an exact year, round ruler and accessible scale choices without year zero', async ({
  page,
}) => {
  await page.goto('/');
  const bar = page.getByTestId('timeline-bar');
  await bar.getByRole('button', { name: 'MS 2024', exact: true }).click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('MS 2010');
  await page.getByRole('button', { name: 'Yılı uygula', exact: true }).click();
  await expect(bar.getByRole('slider')).toHaveAttribute('aria-valuetext', 'MS 2010');
  const box = await bar.boundingBox();
  expect(box!.height).toBeLessThan(125);
  await expect(page.getByTestId('world-coverage-summary')).toHaveCount(0);
  await expect(page.getByTestId('timeline-tools')).toHaveCount(0);
  await bar.getByRole('button', { name: 'Tarih araçlarını genişlet', exact: true }).click();
  const tools = page.getByTestId('timeline-tools-dialog');
  const toolsBox = await tools.boundingBox();
  expect(toolsBox!.width).toBeLessThanOrEqual(520);
  expect(toolsBox!.height).toBeLessThan(page.viewportSize()!.height);
  for (const name of ['Zamanda ilerle veya geri git', 'Çizelge aralığı', 'Oynatma hızı'])
    await expect(tools.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ölçek: 20 yıl', exact: true }).click();
  await expect(bar.getByRole('slider')).toHaveAttribute('max', '2020');
  await expect(bar.getByRole('slider')).toHaveAttribute('min', '2000');
  await expect(page.getByTestId('timeline-ruler')).toContainText('MS 2010');
  await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
  await expect(bar.getByRole('slider')).toBeVisible();
});
test('compact date tools jump, preserve scale and open year entry without stacking dialogs', async ({
  page,
}) => {
  await page.goto('/');
  const bar = page.getByTestId('timeline-bar');
  await bar.getByRole('button', { name: 'Tarih araçlarını genişlet', exact: true }).click();
  const tools = page.getByTestId('timeline-tools');
  await tools.getByRole('button', { name: '−10 yıl', exact: true }).click();
  await expect(tools).toContainText('MS 2014');
  await tools.getByRole('button', { name: '+10 yıl', exact: true }).click();
  await expect(tools).toContainText('MS 2024');
  await tools.getByRole('button', { name: '10 yıl/adım', exact: true }).click();
  await expect(tools.getByRole('button', { name: '10 yıl/adım', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await tools.getByRole('button', { name: 'Yıl seç', exact: true }).click();
  await expect(tools).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Yıl numarası' })).toBeVisible();
});
test('2010 country records use short labels, include Libya and Chad, and keep source detail collapsed', async ({
  page,
}) => {
  await page.goto('/');
  const bar = page.getByTestId('timeline-bar');
  await bar.getByRole('button', { name: 'MS 2024', exact: true }).click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('MS 2010');
  await page.getByRole('button', { name: 'Yılı uygula', exact: true }).click();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2010',
    { timeout: 30000 },
  );
  await page.getByRole('button', { name: 'Keşfet', exact: true }).click();
  await page.getByRole('button', { name: 'Bu yılın siyasi kayıtları', exact: true }).click();
  for (const name of ['Yunanistan', 'Libya', 'Çad'])
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Yunanistan Cumhuriyeti', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Libya', exact: true }).click();
  const card = page.getByTestId('polity-card');
  await expect(card.getByRole('heading', { name: 'Libya', exact: true })).toBeVisible();
  await expect(card).toContainText('Yaklaşık veri');
  await expect(page.getByTestId('source-details')).toHaveCount(0);
  await card.getByRole('button', { name: 'Kaynakları gör', exact: true }).click();
  await expect(page.getByTestId('source-details')).toContainText('CC-BY-4.0');
});
