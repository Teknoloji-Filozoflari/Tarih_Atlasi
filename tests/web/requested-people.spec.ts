import { expect, test } from '@playwright/test';
import { searchCatalog } from './menu';
test('new sourced birth is selectable while unknown death remains unknown', async ({ page }) => {
  await page.goto('/');
  await searchCatalog(page, 'Lionel Messi');
  await page.getByRole('button', { name: 'Lionel Messi', exact: true }).click();
  const card = page.getByTestId('person-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card).toContainText('Rosario');
  await expect(card).toContainText('Ölüm bilinmiyor');
  await card
    .getByRole('button', { name: 'Doğum yılına git ve yaklaşık konumu aç · MS 1987', exact: true })
    .click();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1987',
    { timeout: 30000 },
  );
  await expect(
    card.getByRole('button', { name: /^Wikipedia’da aç(?: \(TR\)| \(EN\))?$/u }),
  ).toBeVisible();
});
test('unresolved request stays searchable without fake biography, coordinate or guessed Wikipedia link', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'A. J. Ayer');
  const pending = page.getByTestId('pending-people');
  await expect(pending).toContainText('A. J. Ayer');
  await expect(pending).toContainText('henüz yayımlanmadı');
  await expect(
    pending.getByRole('button', { name: /^Wikipedia’da aç(?: \(TR\)| \(EN\))?$/u }),
  ).toHaveCount(0);
  await expect(page.getByTestId('person-card')).toHaveCount(0);
});
test('music groups have no person birth card while explicit individual members remain discoverable requests', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Queen');
  const pending = page.getByTestId('pending-people');
  await expect(pending).toContainText('müzik grubunu');
  await expect(page.getByTestId('person-card')).toHaveCount(0);
  await searchCatalog(page, 'John Lennon');
  await expect(page.getByTestId('pending-people')).toContainText('John Lennon');
});
