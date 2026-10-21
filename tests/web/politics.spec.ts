import { tool } from './menu';
import { expect, test } from './fixtures';

test('siyasi kayıt klavye listesi, kaynak kartı, açık kamera odağı ve desteksiz yıl', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await tool(page, '1867 sınır örneğini göster');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await tool(page, 'Bu yılın siyasi kayıtları');
  await page
    .getByRole('button', { name: 'Alaska antlaşması — 141°B sınır kesiti', exact: true })
    .click();
  const card = page.getByTestId('polity-card');
  await expect(card).toContainText('Amerika Birleşik Devletleri — antlaşma tarafı');
  await expect(card).toContainText('Kullanılan kaynak yılı: MS 1867');
  await expect(card).toContainText('Devir: Rusya İmparatorluğu');
  await expect(card).toContainText('ölçülmüş WGS84 sınırı veya tam ülke alanı değildir');
  await expect(card.getByText('Kaynakla belgelenmiş başkentler:')).toHaveCount(0);
  await page.getByRole('button', { name: 'Seçili siyasi coğrafyaya odaklan' }).click();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await expect(host).toHaveAttribute('data-historical-year', '1867');
  await expect(page.getByTestId('globe-camera')).toContainText('-141.00, 66.50');
  await expect(page.locator('.atlas-political-label')).toHaveCount(1);
  await page.getByRole('button', { name: 'Sonraki yıl' }).click();
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(page.locator('.atlas-political-label')).toHaveCount(0);
  await tool(page, 'Bu yılın siyasi kayıtları');
  await expect(
    page.getByText('Bu yıl ve açık katman için destekli siyasi coğrafya yok.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await page.getByRole('button', { name: 'Önceki yıl' }).click();
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await tool(page, 'Bu yılın siyasi kayıtları');
  await page
    .getByRole('button', { name: 'Alaska antlaşması — 141°B sınır kesiti', exact: true })
    .click();
  await expect(card).toContainText('Kullanılan kaynak yılı: MS 1867');
});

test('haritasız siyasi liste veri yokluğunu ve tam polygon eksikliğini açıklar', async ({
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
  await tool(page, 'Bu yılın siyasi kayıtları');
  await expect(
    page.getByText('Bu yıl ve açık katman için destekli siyasi coğrafya yok.'),
  ).toBeVisible();
  await expect(
    page.getByText('Seçili kayıt yalnız sınır kesitidir; tam siyasi alanı göstermez.'),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Keşfet', exact: true })).toBeFocused();
});
