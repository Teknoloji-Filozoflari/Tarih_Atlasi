import { tool, searchCatalog } from './menu';
import { expect, test, type Page } from '@playwright/test';
async function fallback(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  });
}
async function year(page: Page, value: string) {
  await page
    .getByTestId('timeline-bar')
    .getByRole('button', { name: /^(MS|MÖ) /u })
    .click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill(value);
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
}
async function search(page: Page, value: string) {
  await searchCatalog(page, value);
}
test('ortak offline arama, klavye seçimi ve açık tarih geçişi; geri dönüş sorguyu korur', async ({
  page,
}) => {
  await fallback(page);
  await page.goto('/');
  await page.context().setOffline(true);
  await search(page, 'Hastings');
  await expect(page.getByTestId('search-records')).toContainText('Savaşlar ve muharebeler');
  const result = page.getByRole('button', { name: 'Hastings Muharebesi', exact: true });
  await result.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('timeline-details')).toContainText(
    `MS ${new Date().getFullYear()}`,
  );
  await expect(page.getByTestId('search-target')).toContainText(
    'Seçili yılda desteklenen coğrafya yok',
  );
  await page.getByRole('button', { name: 'İlgili tarihe git (MS 1066)' }).click();
  await expect(page.getByTestId('timeline-details')).toContainText('İstenen yıl: MS 1066');
  await page.getByRole('button', { name: 'Arama sonuçlarına dön' }).click();
  await expect(page.getByRole('textbox', { name: 'Arama terimini düzenle' })).toHaveValue(
    'Hastings',
  );
  await page.getByRole('textbox', { name: 'Arama terimini düzenle' }).fill('İMPARATORLUĞU');
  await expect(
    page.getByRole('button', { name: 'Rusya İmparatorluğu — devreden taraf' }),
  ).toBeVisible();
});
test('yıl yer imi reload sonrasında kalır; yıl ancak görünüm uygulandığında değişir', async ({
  page,
}) => {
  await fallback(page);
  await page.goto('/');
  await year(page, 'MÖ 1');
  await tool(page, 'Yer imleri');
  await page.getByRole('button', { name: 'Yılı kaydet (MÖ 1)' }).click();
  await expect(page.getByTestId('bookmarks-panel')).toContainText('Yıl yer imi');
  await page.reload();
  await tool(page, 'Yer imleri');
  await expect(page.getByTestId('bookmarks-panel')).toContainText('MÖ 1');
  await page.getByRole('button', { name: /^Kaydedilen görünümü incele/u }).click();
  await expect(page.getByTestId('timeline-details')).toContainText(
    `MS ${new Date().getFullYear()}`,
  );
  await page.getByRole('button', { name: 'Bu görünümü uygula' }).click();
  await expect(
    page.getByTestId('timeline-bar').getByRole('button', { name: 'MÖ 1', exact: true }),
  ).toBeVisible();
});
test('silinmiş varlık yer imi güvenli kalır, kaynak/marker uydurmadan yılı geri yükler', async ({
  page,
}) => {
  await fallback(page);
  await page.goto('/');
  await page.evaluate(() =>
    localStorage.setItem(
      'tarihatlasi.bookmarks.v1',
      JSON.stringify({
        version: 1,
        entries: [
          {
            id: 'bookmark-missing',
            kind: 'entity',
            view: { year: 1066, entityId: 'atlas:removed', camera: null },
          },
        ],
      }),
    ),
  );
  await page.reload();
  await tool(page, 'Yer imleri');
  await expect(page.getByTestId('bookmarks-panel')).toContainText(
    'Kayıt bu katalog sürümünde bulunamadı',
  );
  await page.getByRole('button', { name: /^Kaydedilen görünümü incele/u }).click();
  await page.getByRole('button', { name: 'Bu görünümü uygula' }).click();
  await expect(
    page.getByTestId('timeline-bar').getByRole('button', { name: 'MS 1066', exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('search-target')).toHaveCount(0);
});
test('paylaşım URL whitelist kullanır ve gelen görünüm önizleme olmadan uygulanmaz', async ({
  page,
}) => {
  await fallback(page);
  await page.goto('/');
  await year(page, 'MS 1066');
  await search(page, 'Hastings');
  await page.getByRole('button', { name: 'Hastings Muharebesi', exact: true }).click();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await tool(page, 'Görünümü paylaş');
  const text = await page.getByTestId('share-url').textContent(),
    url = new URL(text!);
  expect([...url.searchParams.keys()].sort()).toEqual(['entityId', 'year']);
  expect(url.searchParams.get('entityId')).toBe('atlas:hastings-1066');
  await page.goto(url.href);
  await expect(page.getByText('Paylaşılan bir görünüm var.', { exact: false })).toBeVisible();
  await expect(
    page
      .getByTestId('timeline-bar')
      .getByRole('button', { name: `MS ${new Date().getFullYear()}`, exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Paylaşılan görünümü incele' }).click();
  await page.getByRole('button', { name: 'Bu görünümü uygula' }).click();
  await expect(page.getByTestId('timeline-details')).toContainText('İstenen yıl: MS 1066');
});
test('bozuk bağlantı ve bozuk yerel depo açıklanır; mevcut yıl değişmez ve sessiz sıfırlama yapılmaz', async ({
  page,
}) => {
  await fallback(page);
  await page.goto('/?year=0&secret=ignored');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Paylaşım bağlantısı geçersiz' }),
  ).toBeVisible();
  await page.evaluate(() => localStorage.setItem('tarihatlasi.bookmarks.v1', '{broken'));
  await tool(page, 'Yer imleri');
  await expect(page.getByTestId('bookmarks-panel')).toContainText(
    'Yerel kayıt okunamadı veya kaydedilemedi',
  );
  await expect(page.getByRole('button', { name: /^Yılı kaydet/u })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('tarihatlasi.bookmarks.v1'))).toBe(
    '{broken',
  );
});
test('gerçek kürede arama odağı ve kamera yer imi yeniden açılışta geri yüklenir', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await search(page, 'Hastings');
  await page.getByRole('button', { name: 'Hastings Muharebesi', exact: true }).click();
  await page.getByRole('button', { name: 'İlgili tarihe git (MS 1066)' }).click();
  await page
    .getByRole('button', { name: 'Kaynaklı coğrafyaya odaklan — Hastings Muharebesi' })
    .click();
  await expect(page.getByTestId('globe-camera')).toContainText('z 3.00');
  const saved = await page.getByTestId('globe-camera').textContent();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await tool(page, 'Yer imleri');
  await page.getByRole('button', { name: 'Kamera görünümünü kaydet' }).click();
  await expect(page.getByTestId('bookmarks-panel')).toContainText('Kamera yer imi');
  await page.reload();
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await tool(page, 'Yer imleri');
  await page.getByRole('button', { name: /^Kaydedilen görünümü incele/u }).click();
  await page.getByRole('button', { name: 'Bu görünümü uygula' }).click();
  await expect(page.getByTestId('globe-camera')).toHaveText(saved!);
});
