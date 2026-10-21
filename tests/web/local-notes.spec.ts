import { expect, test } from '@playwright/test';
import { tool, searchCatalog } from './menu';
test('personal point survives reload, is explicitly unverified and remains editable', async ({
  page,
}) => {
  await page.goto('/');
  await tool(page, 'Kendi kayıtlarım');
  const panel = page.getByTestId('local-notes-panel');
  await panel.getByRole('textbox', { name: 'Ad / başlık', exact: true }).fill('SENTETİK E2E NOTU');
  await panel
    .getByRole('textbox', { name: 'Kısa bilgi', exact: true })
    .fill('Yalnız test; tarihî kayıt değildir.');
  await panel
    .getByRole('textbox', { name: 'Başlangıç yılı (MÖ / MS)', exact: true })
    .fill('MS 1881');
  await panel.getByRole('textbox', { name: 'Bitiş yılı (MÖ / MS)', exact: true }).fill('MS 1881');
  await panel.getByRole('button', { name: 'Cihaza kaydet', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Kaydı sil', exact: true })).toBeVisible();
  await page.reload();
  await tool(page, 'Kendi kayıtlarım');
  await panel.getByRole('button', { name: /SENTETİK E2E NOTU ·/ }).click();
  await expect(panel.getByRole('textbox', { name: 'Ad / başlık', exact: true })).toHaveValue(
    'SENTETİK E2E NOTU',
  );
  await expect(panel).toContainText('doğrulanmamış');
  await panel.getByRole('button', { name: 'Kaydı sil', exact: true }).click();
  await panel.getByRole('button', { name: 'Silmeyi onayla', exact: true }).click();
  await expect(panel.getByRole('button', { name: /SENTETİK E2E NOTU ·/ })).toHaveCount(0);
});
test('person card opens compact with verified Wikipedia link and reveals original controls explicitly', async ({
  page,
}) => {
  await page.goto('/');
  await searchCatalog(page, 'Atatürk');
  await page
    .getByRole('button', { name: /Mustafa Kemal Atatürk/ })
    .first()
    .click();
  const card = page.getByTestId('person-card');
  await expect(card).toContainText('1881');
  await expect(
    card.getByRole('button', { name: /^Wikipedia’da aç(?: \(TR\)| \(EN\))?$/u }),
  ).toBeVisible();
  await expect(card.getByRole('button', { name: /Doğum yılına git/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).click();
  await card
    .getByRole('button', { name: 'Doğum yılına git ve yaklaşık konumu aç · MS 1881', exact: true })
    .click();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1881',
    { timeout: 30000 },
  );
});

test('Atatürk remains selectable over current-city labels and replaces an open city card', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Unexpected text node'))
      errors.push(message.text());
  });
  await page.goto('/');
  await searchCatalog(page, 'Atatürk');
  await page
    .getByRole('button', { name: /Mustafa Kemal Atatürk/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await page
    .getByTestId('person-card')
    .getByRole('button', { name: 'Doğum yılına git ve yaklaşık konumu aç · MS 1881', exact: true })
    .click();
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute(
    'data-historical-year',
    '1881',
    { timeout: 30000 },
  );
  const close = page.getByRole('button', { name: 'Paneli kapat', exact: true });
  await close.click();
  const person = page.locator('.atlas-person-marker').filter({ hasText: /Mustafa Kemal Atatürk/ });
  await expect(person).toBeVisible();
  await page.locator('.atlas-modern-city:visible').first().click();
  await expect(page.getByTestId('modern-city-card')).toBeVisible();
  await person.click();
  await expect(page.getByTestId('person-card')).toContainText('Mustafa Kemal Atatürk');
  await expect(
    page
      .getByTestId('person-card')
      .getByRole('button', { name: /^Wikipedia’da aç(?: \(TR\)| \(EN\))?$/u }),
  ).toBeVisible();
  await expect(page.getByTestId('modern-city-card')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('picking a personal point is not interrupted by modern city markers', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Unexpected text node'))
      errors.push(message.text());
  });
  await page.goto('/');
  await expect(page.getByTestId('globe-canvas-host')).toHaveAttribute('data-projection', 'globe', {
    timeout: 30000,
  });
  await tool(page, 'Haritada nokta belirle ve kayıt ekle');
  await expect(page.getByRole('button', { name: 'Bu noktayı kullan', exact: true })).toBeVisible();
  await page.locator('.atlas-modern-city:visible').first().click();
  await expect(page.getByTestId('modern-city-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Bu noktayı kullan', exact: true }).click();
  await expect(page.getByTestId('local-notes-panel')).toBeVisible();
  await expect(
    page.getByTestId('local-notes-panel').getByRole('textbox', { name: 'Enlem', exact: true }),
  ).not.toHaveValue('');
  expect(errors).toEqual([]);
});
