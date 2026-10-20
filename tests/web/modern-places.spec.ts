import { expect, test } from '@playwright/test';
import { placesManifest } from '../../src/places/generated/catalog';
test('modern country/place catalog exposes real installed coverage or an explicit missing-package state', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await expect(page.getByText('Güncel şehirler ve idari birimler', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Ülkelere göre şehir ve ilçe kayıtlarını gez', exact: true })
    .click();
  const explorer = page.getByTestId('modern-places-explorer');
  if (!placesManifest.version) {
    await expect(explorer).toContainText('Dünya şehir ve ilçe paketi henüz yüklenmedi');
    await expect(explorer).toContainText('yalnız altı önceki referans mevcut');
    await expect(explorer.getByRole('textbox')).toHaveCount(0);
    await expect(
      explorer.getByRole('button', { name: 'Sonraki kayıtlar', exact: true }),
    ).toHaveCount(0);
    return;
  }
  const tr = placesManifest.countries.find((c) => c.code === 'TR');
  expect(tr, 'Global GeoNames import should include Turkey').toBeDefined();
  await explorer
    .getByRole('textbox', { name: 'Güncel ülke adı veya kodu ara (örn. TR)' })
    .fill('TR');
  await explorer.getByRole('button', { name: new RegExp(`^${tr!.name} \\(TR\\)`) }).click();
  await explorer.getByRole('button', { name: 'İdari birimler / ilçeler', exact: true }).click();
  await explorer.getByRole('button', { name: /^◇ / }).first().click();
  const card = page.getByTestId('modern-city-card');
  await expect(card).toContainText('İdari birim temsil noktası');
  await expect(card).toContainText('tarih çizelgesinden bağımsız');
  await expect(
    card.getByRole('button', { name: 'GeoNames kaydını aç', exact: true }),
  ).toBeVisible();
  await card.getByRole('button', { name: 'Bu güncel noktaya odaklan', exact: true }).click();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '2024',
  );
});
