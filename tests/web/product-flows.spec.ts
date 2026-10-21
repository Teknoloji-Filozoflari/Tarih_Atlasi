import { expect, test, type Page } from './fixtures';
import { tool, searchCatalog } from './menu';
async function year(page: Page, value: string) {
  await page
    .getByTestId('timeline-bar')
    .getByRole('button', { name: /^(MS|MÖ) /u })
    .click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill(value);
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
}
test('A: unsupported 2026 is honest, 1453 reconstructs polities and 1867 retains treaty source', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await expect(host).toHaveAttribute('data-historical-year', '2024');
  await year(page, 'MS 2000');
  await expect(host).toHaveAttribute('data-historical-year', '2000');
  await expect(host).toHaveAttribute('data-historical-count', '196');
  await year(page, 'MS 2026');
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(page.getByTestId('historical-coverage')).toHaveText('Veri yok');
  await year(page, 'MS 1453');
  await expect(host).toHaveAttribute('data-historical-count', '134');
  await year(page, 'MS 1867');
  await tool(page, 'Bu yılın siyasi kayıtları');
  await page
    .getByRole('button', { name: 'Alaska antlaşması — 141°B sınır kesiti', exact: true })
    .click();
  await expect(page.getByTestId('polity-card')).toContainText('MS 1867');
  await page.getByRole('button', { name: 'Kaynakları gör', exact: true }).click();
  await expect(page.getByTestId('source-details')).toContainText('NARA');
});
test('B+D: real search explicitly changes date, focuses and keeps the globe with selection', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Hastings');
  await page.getByRole('button', { name: 'Hastings Muharebesi', exact: true }).click();
  await page.getByRole('button', { name: 'İlgili tarihe git (MS 1066)' }).click();
  await page
    .getByRole('button', { name: 'Kaynaklı coğrafyaya odaklan — Hastings Muharebesi' })
    .click();
  await expect(page.getByTestId('event-card')).toBeVisible();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1066',
  );
  await expect(page.getByRole('button', { name: 'Atlas', exact: true })).toHaveCount(0);
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute('data-projection', 'globe');
  await expect(page.getByTestId('event-card')).toContainText('Hastings');
  await expect(page.getByRole('button', { name: 'Küre', exact: true })).toHaveCount(0);
  await expect(page.getByTestId('event-card')).toContainText('Hastings');
});
test('E: 390px keyboard search, layers, nonmodal details and rotation do not overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await searchCatalog(page, 'Hastings');
  await expect(page.getByRole('textbox', { name: 'Arama terimini düzenle' })).toBeVisible();
  await page.getByRole('button', { name: 'Hastings Muharebesi', exact: true }).click();
  await page.getByRole('button', { name: 'İlgili tarihe git (MS 1066)' }).click();
  await page
    .getByRole('button', { name: 'Kaynaklı coğrafyaya odaklan — Hastings Muharebesi' })
    .click();
  const details = page
    .getByTestId('entity-sheet')
    .getByRole('button', { name: 'Ayrıntıları göster', exact: true });
  await expect(details).toHaveAttribute('aria-pressed', 'false');
  await details.click();
  await expect(details).toHaveAttribute('aria-pressed', 'true');
  await details.click();
  await expect(details).toHaveAttribute('aria-pressed', 'false');
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await expect(page.getByTestId('historical-layer-controls').getByRole('switch')).toHaveCount(6);
});
test('legacy flat preference cannot restore 2D and independently saved layers survive', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await page.getByRole('switch', { name: 'Kültür', exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('tarihatlasi.preferences.v1') ?? '{}').layers?.culture,
      ),
    )
    .toBe(false);
  await page.evaluate(() => {
    const key = 'tarihatlasi.preferences.v1';
    const value = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(key, JSON.stringify({ ...value, projection: 'mercator' }));
  });
  await page.reload();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute('data-projection', 'globe', {
    timeout: 25000,
  });
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Kültür', exact: true })).not.toBeChecked();
});
test('C: nearest source preview is an explicit choice and keeps requested/source years separate', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await year(page, 'MS 2025');
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await tool(page, 'En yakın kaynak yılını önizle');
  await expect(host).toHaveAttribute('data-historical-source-year', '2024');
  await expect(host).toHaveAttribute('data-historical-year', '2025');
  await expect(host).toHaveAttribute('data-historical-count', '189');
  await expect(page.getByTestId('snapshot-preview-label')).toContainText('MS 2024');
  await tool(page, 'Kaynak yılı önizlemesini kapat');
  await expect(host).toHaveAttribute('data-historical-count', '0');
});
test('F: corrupt bookmark storage requires explicit recovery, then save and reopen work', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tarihatlasi.bookmarks.v1', '{broken'));
  await tool(page, 'Yer imleri');
  await expect(page.getByTestId('bookmarks-panel')).toContainText('Yerel kayıt okunamadı');
  await page.getByRole('button', { name: 'Bozuk kaydı incele ve kurtar' }).click();
  await page
    .getByRole('button', { name: 'Özgün kaydı inceledim; yalnız yer imlerini sıfırla' })
    .click();
  await page.getByRole('button', { name: /^Yılı kaydet/u }).click();
  await expect(page.getByTestId('bookmarks-panel')).toContainText('Yıl yer imi');
  await page.reload();
  await tool(page, 'Yer imleri');
  await expect(page.getByTestId('bookmarks-panel')).toContainText('Yıl yer imi');
});

test('G: reviewed country discovery opens its source card and never extends borders beyond the source period', async ({
  page,
}) => {
  await page.goto('/');
  await year(page, 'MS 2000');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-historical-year', '2000', { timeout: 25000 });
  await expect(host).toHaveAttribute('data-historical-count', '196');
  await tool(page, 'Bu yılın siyasi kayıtları');
  await expect(page.getByRole('button', { name: 'İspanya', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Türkiye', exact: true }).click();
  const card = page.getByTestId('polity-card');
  await expect(card.getByRole('heading', { name: 'Türkiye', exact: true })).toBeVisible();
  await expect(card).toContainText('Yaklaşık veri');
  await expect(card).toContainText('MS 1949');
  await expect(card).toContainText('MS 2005');
  await card.getByRole('button', { name: 'Kaynakları gör', exact: true }).click();
  await expect(page.getByTestId('source-details')).toContainText('CC-BY-4.0');
  await expect(page.getByTestId('source-details')).toContainText(
    'cliopatria_polities_only_v021.geojson',
  );
});
