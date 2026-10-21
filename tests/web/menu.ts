import type { Page } from '@playwright/test';
const developerActions = [
  'Sentetik teknik işareti göster / gizle',
  '1867 sınır örneğini göster',
  '1066 muharebe örneğini göster',
  'Kişi incelemesi: 1880 (konum askıda)',
  'Kaynaklı örneğe odaklan',
  'Pilotun kaynak ve kapsamı',
];
export async function tool(page: Page, label: string) {
  const button = page.getByRole('button', { name: label, exact: true });
  const panelButton = page
    .getByTestId('entity-sheet')
    .getByRole('button', { name: label, exact: true });
  if (await panelButton.isVisible()) {
    await panelButton.click();
    return;
  }
  if ((await button.count()) === 1 && (await button.isVisible())) {
    await button.click();
    return;
  }
  const close = page.getByRole('button', { name: 'Paneli kapat', exact: true });
  if (await close.isVisible()) await close.click();
  await page.getByRole('button', { name: 'Keşfet', exact: true }).click();
  if (developerActions.includes(label))
    await page.getByRole('button', { name: 'Geliştirici araçları', exact: true }).click();
  await page.getByTestId('entity-sheet').getByRole('button', { name: label, exact: true }).click();
  if (['En yakın kaynak yılını önizle', 'Kaynak yılı önizlemesini kapat'].includes(label))
    await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
}
export async function timelineTools(page: Page) {
  const more = page.getByRole('button', { name: 'Tarih araçlarını genişlet', exact: true });
  if (await more.isVisible()) await more.click();
}
export async function searchCatalog(page: Page, query: string) {
  const edit = page.getByRole('textbox', { name: 'Arama terimini düzenle', exact: true });
  if (await edit.isVisible()) {
    await edit.fill(query);
    return;
  }
  const header = page.getByRole('textbox', { name: 'Atlas içinde ara', exact: true });
  if (await header.isVisible()) {
    await header.fill(query);
    await page.getByRole('button', { name: 'Ara', exact: true }).click();
    return;
  }
  if (!(await edit.isVisible())) {
    const close = page.getByRole('button', { name: 'Paneli kapat', exact: true });
    if (await close.isVisible()) await close.click();
    await page.getByRole('button', { name: 'Ara', exact: true }).click();
  }
  await edit.fill(query);
}
