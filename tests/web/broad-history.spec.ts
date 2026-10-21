import { expect, test } from '@playwright/test';
import { searchCatalog } from './menu';

test('expanded Nobel scientist is searchable with a short card and source-qualified birth-year action', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Richard Feynman');
  await page
    .getByRole('button', { name: /Richard Feynman/ })
    .first()
    .click();
  const card = page.getByTestId('person-card');
  await expect(card).toContainText('1918');
  await expect(
    card.getByRole('button', { name: /^Wikipedia’da aç(?: \(TR\)| \(EN\))?$/u }),
  ).toBeVisible();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
  );
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await card
    .getByRole('button', { name: 'Doğum yılına git ve yaklaşık konumu aç · MS 1918', exact: true })
    .click();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1918',
    { timeout: 30000 },
  );
});

test('expanded battle is discoverable from the same local search without requiring a fabricated current-year marker', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Waterloo');
  await page
    .getByRole('button', { name: /Waterloo Muharebesi/ })
    .first()
    .click();
  const card = page.getByTestId('event-card');
  await expect(card).toContainText('1815');
  await expect(
    card.getByRole('button', { name: /^Wikipedia’da aç(?: \(TR\)| \(EN\))?$/u }),
  ).toBeVisible();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
  );
});
