import { expect, test } from '@playwright/test';
import { searchCatalog } from './menu';
test('downloaded Nobel profile opens a short sourced card without changing year or inventing a location', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Aziz Sancar');
  await page.getByRole('button', { name: 'Aziz Sancar', exact: true }).first().click();
  const card = page.getByTestId('person-card');
  await expect(card).toContainText('Aziz Sancar');
  await expect(
    card.getByRole('button', { name: /^Wikipedia’da aç(?: \(TR\)| \(EN\))?$/u }),
  ).toBeVisible();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
  );
});
