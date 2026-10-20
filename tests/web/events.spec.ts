import { tool } from './menu';
import { expect, test } from '@playwright/test';

async function chooseYear(page: import('@playwright/test').Page, year: string) {
  await page
    .getByTestId('timeline-bar')
    .getByRole('button', { name: /^(MS|MÖ) /u })
    .click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill(year);
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
}

test('konumsuz antlaşma offline yıl listesinde açılır; savaş anahtarından bağımsız kalır', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  });
  await page.goto('/');
  await chooseYear(page, 'MS 1648');
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await page.getByRole('switch', { name: 'Savaş', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Olay', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await page.context().setOffline(true);
  await tool(page, 'Bu yılın savaş ve olayları');
  await page
    .getByTestId('event-records')
    .getByRole('button', { name: '§ Vestfalya Barışı' })
    .click();
  const card = page.getByTestId('event-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card).toContainText('24.10.MS 1648');
  await expect(card).toContainText('haritada nokta üretilmedi');
  await expect(
    card.getByRole('button', { name: 'Kaynaklı olay geometrisine odaklan' }),
  ).toHaveCount(0);
  await expect(card.getByRole('button', { name: 'Wikipedia’da aç', exact: true })).toBeVisible();
  await card.getByRole('button', { name: 'Wikipedia’da aç', exact: true }).click();
  await expect(card.getByRole('alert').filter({ hasText: 'Bağlantı açılamadı' })).toBeVisible();
});

test('gerçek muharebe noktası kaynak kartına gider; yıl ve savaş filtresi geometriyi temizler', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await tool(page, '1066 muharebe örneğini göster');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await page.getByRole('button', { name: 'Olay kaydını seç: Hastings Muharebesi' }).click();
  const card = page.getByTestId('event-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card).toContainText('Yaklaşık referans noktası');
  await expect(card).toContainText('Yıl hassasiyeti');
  await card.getByRole('button', { name: 'Kaynakları gör', exact: true }).click();
  await expect(card.getByTestId('source-details')).toContainText('Wikidata');
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await page.getByRole('switch', { name: 'Savaş', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Olay', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await tool(page, '1066 muharebe örneğini göster');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await page.getByTestId('timeline-bar').getByRole('button', { name: 'Sonraki yıl' }).click();
  await expect(host).toHaveAttribute('data-historical-year', '1067');
  await expect(host).toHaveAttribute('data-historical-count', '0');
});

test('çok yıllı MÖ savaş ve alternatif tarihli modern süreç geometri olmadan listelenir', async ({
  page,
}) => {
  await page.goto('/');
  await chooseYear(page, 'MÖ 420');
  await tool(page, 'Bu yılın savaş ve olayları');
  await page.getByRole('button', { name: '⚑ Peloponnesos Savaşı' }).click();
  await expect(page.getByTestId('event-card')).toContainText('MÖ 431');
  await expect(page.getByTestId('event-card')).toContainText('MÖ 404');
  await expect(page.getByTestId('event-card')).toContainText('haritada nokta üretilmedi');
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await chooseYear(page, 'MS 1990');
  await tool(page, 'Bu yılın savaş ve olayları');
  await page
    .getByRole('button', { name: '✦ Almanya’nın yeniden birleşmesi — süreç kaydı' })
    .click();
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await page
    .getByTestId('event-card')
    .getByRole('button', { name: 'Ayrıntıları göster', exact: true })
    .click();
  await expect(page.getByTestId('event-card')).toContainText('Alternatif kaynak tarihi');
  await expect(page.getByTestId('event-card')).toContainText('15.3.MS 1991');
  await expect(page.getByTestId('event-card')).toContainText('Tarih yaklaşık, tartışmalı');
});
