import { tool, searchCatalog } from './menu';
import { expect, test, type Page } from '@playwright/test';

async function safeTabCapture(page: Page, throws = false) {
  await page.addInitScript((fail) => {
    const captures: string[][] = [];
    Object.defineProperty(window, '__externalCaptures', { value: captures });
    window.open = ((...args: string[]) => {
      if (fail) throw new Error('RAW_ENDPOINT_DETAIL_SHOULD_NOT_BE_VISIBLE');
      captures.push(args);
      return null;
    }) as typeof window.open;
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  }, throws);
}
async function personCard(page: Page) {
  await page.goto('/');
  await searchCatalog(page, 'Gogh');
  await page.getByRole('button', { name: 'Vincent van Gogh', exact: true }).click();
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  return page.getByTestId('person-card');
}
test('Türkçe sitelink güvenli sekmede açılır; çevrimdışı kaynak ve belirsizlik paneli yılı korur', async ({
  page,
}) => {
  await safeTabCapture(page);
  const card = await personCard(page);
  const yearBefore = await page.getByTestId('timeline-bar').textContent();
  await page.context().setOffline(true);
  await card.getByRole('button', { name: 'Kaynakları gör', exact: true }).click();
  const sources = card.getByTestId('source-details');
  await sources.getByRole('button', { name: 'Teknik izlenebilirlik ayrıntıları' }).click();
  await expect(sources).toContainText('SHA-256');
  await expect(sources).toContainText('2556738621');
  await expect(sources).toContainText('CC0-1.0');
  await expect(sources).toContainText('P551');
  await card.getByRole('button', { name: 'Veri belirsizliği', exact: true }).click();
  await expect(card.getByTestId('source-uncertainty')).toContainText('1853-03-30 / 1890-07-29');
  await card.getByRole('button', { name: 'Wikipedia’da aç (TR)', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, '__externalCaptures')))
    .toEqual([['https://tr.wikipedia.org/wiki/Vincent_van_Gogh', '_blank', 'noopener,noreferrer']]);
  await expect(sources).toBeVisible();
  expect(await page.getByTestId('timeline-bar').textContent()).toBe(yearBefore);
  await expect(card.getByRole('img')).toHaveCount(0);
});
test('incelenmemiş dil bağlantısı yok diye sunulmaz; antlaşma Wikidata fallback kullanır', async ({
  page,
}) => {
  await safeTabCapture(page);
  await page.goto('/');
  await page
    .getByTestId('timeline-bar')
    .getByRole('button', { name: /^(MS|MÖ) /u })
    .click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('MS 1648');
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
  await tool(page, 'Bu yılın savaş ve olayları');
  await page.getByRole('button', { name: '§ Vestfalya Barışı' }).click();
  const card = page.getByTestId('event-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card.getByRole('button', { name: 'Wikipedia’da aç', exact: true })).toBeVisible();
  await expect(card.getByTestId('source-details')).toHaveCount(0);
  await card.getByRole('button', { name: 'Kaynakları gör', exact: true }).click();
  await expect(card).toContainText('sitelink doğrulanmadı');
  await card.getByRole('button', { name: 'Wikidata kaydını aç (Q150995)' }).click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, '__externalCaptures')))
    .toEqual([['https://www.wikidata.org/wiki/Q150995', '_blank', 'noopener,noreferrer']]);
  await expect(card).toContainText('24.10.MS 1648');
});
test('dış bağlantı hatası Türkçe açıklanır; ham hata ayrıntısı gösterilmez ve kart kullanılabilir kalır', async ({
  page,
}) => {
  await safeTabCapture(page, true);
  const card = await personCard(page);
  await card.getByRole('button', { name: 'Wikipedia’da aç (TR)' }).click();
  await expect(card.getByRole('alert').filter({ hasText: 'Bağlantı açılamadı' })).toBeVisible();
  await expect(card).not.toContainText('RAW_ENDPOINT_DETAIL');
  await card.getByRole('button', { name: 'Kaynakları gör', exact: true }).click();
  await card.getByRole('button', { name: 'Teknik izlenebilirlik ayrıntıları' }).click();
  await expect(card.getByTestId('source-details')).toContainText('SHA-256');
});
