import { expect, test } from '@playwright/test';
import { searchCatalog } from './menu';

test('Selim II opens a sourced birth-year card and selects 1524 explicitly', async ({ page }) => {
  await page.goto('/');
  await searchCatalog(page, 'II. Selim');
  await page.getByRole('button', { name: 'II. Selim', exact: true }).click();
  const card = page.getByTestId('person-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card).toContainText('1524');
  await card
    .getByRole('button', {
      name: 'Doğum yılına git ve yaklaşık konumu aç · MS 1524',
      exact: true,
    })
    .click();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1524',
    { timeout: 30000 },
  );
});
test('disputed Suleiman chronology cannot offer an exact birth-year map action', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'I. Süleyman');
  await page.getByRole('button', { name: 'I. Süleyman', exact: true }).click();
  const card = page.getByTestId('person-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card).toContainText('1496');
  await expect(
    card.getByRole('button', {
      name: /Doğum yılına git ve yaklaşık konumu aç/u,
    }),
  ).toHaveCount(0);
  await expect(
    card.getByRole('button', { name: /^Wikipedia’da aç(?: \(TR\)| \(EN\))?$/u }),
  ).toBeVisible();
});
