import { expect, test } from './fixtures';

test('current road failure leaves year and globe usable; toggle can disable it', async ({
  page,
}) => {
  await page.route('https://tiles.openfreemap.org/**', (route) => route.abort());
  await page.goto('/?year=2024&lat=36.2&lon=28&zoom=10');
  const roads = page.getByRole('switch', { name: 'Güncel yollar', exact: true });
  const licenses = page.getByRole('button', { name: 'Harita lisansları ve atıflar', exact: true });
  await expect(licenses).toBeVisible({ timeout: 60000 });
  await expect(roads).toBeHidden();
  await expect(
    page.locator('summary').filter({ hasText: 'Harita lisansları ve atıflar' }),
  ).toHaveCount(0);
  await licenses.click();
  await expect(roads).toBeVisible();
  await expect(
    page.getByText('Yollar yüklenemedi. Yeniden açarak deneyebilirsin.', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('canvas.maplibregl-canvas')).toHaveCount(1);
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
  );
  await roads.click();
  await expect(roads).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByText('Güncel yollar kapalı', { exact: true })).toBeVisible();
  await roads.click();
  await expect(roads).toHaveAttribute('aria-checked', 'true');
});
