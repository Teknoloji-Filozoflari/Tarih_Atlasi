import { expect, test, type Page } from './fixtures';
import { searchCatalog } from './menu';
async function year(page: Page, value: string) {
  await page
    .getByTestId('timeline-bar')
    .getByRole('button', { name: /^(MS|MÖ) \d+$/ })
    .click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill(value);
  await page.getByRole('button', { name: 'Yılı uygula', exact: true }).click();
}
test('Turkey opening exposes a separately labelled current city card while history year stays unchanged', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
    { timeout: 30000 },
  );
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-status',
    'ready',
    { timeout: 30000 },
  );
  // Globe-first home keeps zoom below city LOD; regional zoom reveals markers.
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-camera-zoom',
    /^(0|1)\.\d{2}$/,
  );
  for (let step = 0; step < 4; step++)
    await page.getByRole('button', { name: 'Yakınlaştır', exact: true }).click();
  await expect(page.getByText('⌖ Güncel yerleşimler', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Güncel şehir bilgisini aç: Ankara', exact: true })
    .click();
  const card = page.getByTestId('modern-city-card');
  await expect(card).toContainText('tarih çizelgesinden bağımsız');
  // The installed world catalog is GeoNames, not the older three-city Wikidata pilot.
  // Do not invent a Wikipedia identity for a row without a reviewed QID mapping.
  await expect(
    card.getByRole('button', { name: 'GeoNames kaydını aç', exact: true }),
  ).toBeVisible();
  await expect(card.getByRole('button', { name: 'Wikipedia’da aç', exact: true })).toHaveCount(0);
  await expect(card).toContainText('Ankara');
  await expect(card.getByTestId('record-details')).toHaveCount(0);
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
  );
  await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
  await year(page, 'MS 1453');
  await expect(
    page.getByRole('button', { name: 'Güncel şehir bilgisini aç: Ankara', exact: true }),
  ).toBeVisible();
});
test('requested person is found locally with short sourced information and no fabricated map position', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Isaac Newton');
  await page
    .getByRole('button', { name: /Isaac Newton/ })
    .first()
    .click();
  const card = page.getByTestId('person-card');
  await page
    .getByRole('button', { name: 'Kartın ek bilgilerini göster', exact: true })
    .first()
    .click();
  await expect(card).toContainText('kütleçekimi');
  await expect(card).toContainText('gösterilebilir kişi konumu yok');
  await expect(card.getByRole('button', { name: 'Wikipedia’da aç', exact: true })).toBeVisible();
  await expect(card.getByTestId('record-details')).toHaveCount(0);
  await expect(page.locator('.atlas-person-marker')).toHaveCount(0);
});
test('Ottoman battle is selectable only in its supported year and keeps source precision visible', async ({
  page,
}) => {
  await page.goto('/');
  await year(page, 'MS 1453');
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1453',
    { timeout: 30000 },
  );
  await page.locator('.atlas-event-marker').first().click();
  const card = page.getByTestId('event-card');
  await page
    .getByRole('button', { name: 'Kartın ek bilgilerini göster', exact: true })
    .first()
    .click();
  await expect(card).toContainText('İstanbul’un Fethi');
  await expect(card).toContainText('Yaklaşık referans noktası');
  await expect(card.getByTestId('record-details')).toHaveCount(0);
  await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
  await year(page, 'MS 1454');
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1454',
  );
  await expect(page.locator('.atlas-event-marker')).toHaveCount(0);
});
