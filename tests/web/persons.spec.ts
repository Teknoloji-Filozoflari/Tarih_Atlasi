import { tool, searchCatalog } from './menu';
import { expect, test } from '@playwright/test';

test('harita olmasa da kişi aranır; yaşam dönemi konum kanıtı diye gösterilmez', async ({
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
  await searchCatalog(page, 'Gogh');
  await expect(page.getByTestId('search-records')).toContainText(
    'Bir sonuçta bulunmak, seçili yılda yaşamak veya o konumda bulunmak anlamına gelmez.',
  );
  await page.getByRole('button', { name: 'Vincent van Gogh', exact: true }).click();
  const card = page.getByTestId('person-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await card.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).click();
  await expect(card).toContainText('Yaşam aralığı bir yerde bulunulduğunun kanıtı değildir.');
  await expect(card).toContainText(
    'Bu yıl ve etkin kanıt filtresi için gösterilebilir kişi konumu yok.',
  );
  await expect(card.getByRole('img')).toHaveCount(0);
  await expect(card.getByRole('button', { name: 'Wikipedia’da aç (TR)' })).toBeVisible();
  await card
    .getByRole('button', { name: 'Diğer dönemleri ve biyografik bağlantıları aç/kapat' })
    .click();
  await expect(card).toContainText('Bu konum incelemeye alındı');
  await expect(card).toContainText('Ay hassasiyeti; gün bilinmiyor');
});

test('incelemedeki kişi konumu yaklaşık tercihle dahi çizilmez; profil ve kaynaklar erişilebilir', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await tool(page, 'Kişi incelemesi: 1880 (konum askıda)');
  await expect(host).toHaveAttribute('data-historical-year', '1880');
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(
    page.getByRole('button', { name: /Kişi konum kaydını seç: Vincent van Gogh/u }),
  ).toHaveCount(0);
  await tool(page, 'Kişi kataloğu');
  await page.getByRole('button', { name: 'Vincent van Gogh', exact: true }).click();
  const card = page.getByTestId('person-card');
  await page.getByRole('button', { name: 'Ayrıntıları göster', exact: true }).first().click();
  await expect(card).toContainText('Bu konum incelemeye alındı');
  await card.getByRole('button', { name: 'Kaynakları gör', exact: true }).click();
  await expect(card.getByTestId('source-details')).toContainText('Wikidata');
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await page.getByTestId('timeline-bar').getByRole('button', { name: 'Sonraki yıl' }).click();
  await expect(host).toHaveAttribute('data-historical-year', '1881');
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(
    page.getByRole('button', { name: /Kişi konum kaydını seç: Vincent van Gogh/u }),
  ).toHaveCount(0);
});
