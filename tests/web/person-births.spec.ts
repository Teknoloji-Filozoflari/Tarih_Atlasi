import { expect, test } from './fixtures';
import { searchCatalog } from './menu';

test('Atatürk birth action explicitly selects 1881 and enables the approximate location without lifetime spreading', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Atatürk');
  await page
    .getByRole('button', { name: /Mustafa Kemal Atatürk/ })
    .first()
    .click();
  const card = page.getByTestId('person-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card).toContainText('1881');
  await expect(card).toContainText('Selanik');
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
  );
  await card
    .getByRole('button', { name: 'Doğum yılına git ve yaklaşık konumu aç · MS 1881', exact: true })
    .click();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1881',
    { timeout: 30000 },
  );
  await expect(card).toContainText('yaklaşık');
  await expect(card.getByRole('button', { name: 'Wikipedia’da aç', exact: true })).toBeVisible();
});
test('traditional birth dates remain readable biographies without a manufactured birth-year action', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Musa');
  await page.getByRole('button', { name: 'Hz. Musa', exact: true }).click();
  const card = page.getByTestId('person-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card).toContainText('Bilinmiyor');
  await expect(card.getByRole('button', { name: /Doğum yılına git/ })).toHaveCount(0);
  await expect(card.getByRole('button', { name: 'Wikipedia’da aç', exact: true })).toBeVisible();
});
test('pending source revision is reported separately from historical knowledge and never gains a fabricated point', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'James Watt');
  const pending = page.getByTestId('pending-people');
  await expect(pending).toContainText('James Watt');
  await expect(pending).toContainText('kaynak revizyonu incelemesi tamamlanmadı');
  await expect(pending.getByRole('button', { name: 'Wikipedia’da aç', exact: true })).toBeVisible();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
  );
});
