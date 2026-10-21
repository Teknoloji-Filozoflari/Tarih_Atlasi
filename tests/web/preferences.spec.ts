import { timelineTools, tool } from './menu';
import { expect, test } from './fixtures';
const preferenceKey = 'tarihatlasi.preferences.v1';
test.beforeEach(async ({ page }) => {
  // Exercise accessible fallback UI; these scenarios are not GPU acceptance.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  });
});
test('six independent layers, filters and label density persist across reload; attribution stays reachable', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  const switches = page.getByTestId('historical-layer-controls').getByRole('switch');
  await expect(switches).toHaveCount(6);
  const cities = page.getByRole('switch', {
    name: 'Güncel şehirler ve idari birimler',
    exact: true,
  });
  await expect(cities).toBeChecked();
  await cities.click();
  await expect(cities).not.toBeChecked();
  await expect(switches).toHaveCount(6);
  for (const name of ['Devlet', 'Kültür', 'Kişi', 'Savaş', 'Olay', 'Tarihî yer / isimler']) {
    const control = page.getByRole('switch', { name, exact: true });
    await expect(control).toBeEnabled();
    await control.click();
    await expect(control).not.toBeChecked();
  }
  await page.getByRole('button', { name: 'Olay türü: Antlaşma', exact: true }).click();
  await page.getByRole('button', { name: 'Seyrek etiket görünümü', exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? '{}').sparseLabels,
        preferenceKey,
      ),
    )
    .toBe(true);
  await page.reload();
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await expect(cities).not.toBeChecked();
  await expect(
    page.getByRole('switch', { name: 'Tarihî yer / isimler', exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole('button', { name: 'Olay türü: Antlaşma', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('legend-panel')).toContainText('Siyasi egemenlik değildir');
  await page
    .getByTestId('entity-sheet')
    .getByRole('button', { name: 'Harita lisansları ve atıflar', exact: true })
    .click();
  await expect(page.getByText(/Natural Earth/u).first()).toBeVisible();
});
test('settings preserve selected year, use reduced motion, and reset only preferences', async ({
  page,
}) => {
  await page.goto('/');
  await timelineTools(page);
  await page
    .getByTestId('timeline-tools')
    .getByRole('button', { name: 'Başlangıca git', exact: true })
    .click();
  await page
    .getByTestId('timeline-tools-dialog')
    .getByRole('button', { name: 'Paneli kapat', exact: true })
    .click();
  await tool(page, 'Ayarlar ve gizlilik');
  await page.getByRole('button', { name: 'Hareketi azalt', exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').motion, preferenceKey),
    )
    .toBe('reduce');
  await expect(page.getByTestId('settings-panel')).toContainText('Hata bildirim servisi henüz yok');
  await page
    .getByRole('button', { name: 'Yalnız katman ve ayar tercihlerini sıfırla', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Hareket: sistem tercihi', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
  await expect(
    page.getByTestId('timeline-bar').getByRole('button', { name: 'MÖ 2000', exact: true }),
  ).toBeVisible();
});
test('unknown preference version is retained until explicit reset and does not disable attribution', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate((key) => localStorage.setItem(key, '{"version":99}'), preferenceKey);
  await page.reload();
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Devlet', exact: true })).toBeDisabled();
  expect(await page.evaluate((key) => localStorage.getItem(key), preferenceKey)).toBe(
    '{"version":99}',
  );
  await tool(page, 'Ayarlar ve gizlilik');
  await expect(page.getByTestId('settings-panel')).toContainText('Tercihler okunamadı');
  await page
    .getByRole('button', { name: 'Yalnız katman ve ayar tercihlerini sıfırla', exact: true })
    .click();
  await expect
    .poll(async () =>
      page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').version, preferenceKey),
    )
    .toBe(1);
});
