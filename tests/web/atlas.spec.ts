import { searchCatalog } from './menu';
import { expect, test } from '@playwright/test';

// Gerçek Expo UI; yalnız WebGL özelliği hata yoluna zorlanır. GPU kanıtı değildir.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  });
});
test('katmanlar bağımsız; panel odağı, Escape ve odak dönüşü', async ({ page }) => {
  await page.goto('/');
  const layers = page.getByRole('button', { name: 'Katmanlar', exact: true });
  await layers.click();
  await expect(page.getByRole('button', { name: 'Paneli kapat' })).toBeFocused();
  await expect(page.getByRole('switch')).toHaveCount(6);
  await page.getByRole('switch', { name: 'Kültür', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Kültür', exact: true })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: 'Devlet', exact: true })).toBeChecked();
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('switch')).toHaveCount(0);
  await expect(layers).toBeFocused();
});

test('yıl sıfırı reddi, MÖ/MS geçişi ve boş arama', async ({ page }) => {
  await page.goto('/');
  const timeline = page.getByTestId('timeline-bar');
  await timeline.getByRole('button', { name: /^MS /u }).click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('0');
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
  await expect(page.getByText('Geçerli aralıkta, sıfırdan farklı bir yıl girin.')).toBeVisible();
  await page.getByRole('button', { name: 'MÖ', exact: true }).click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('1');
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
  await expect(timeline.getByRole('button', { name: 'MÖ 1', exact: true })).toBeVisible();
  await timeline.getByRole('button', { name: 'Sonraki yıl' }).click();
  await expect(timeline.getByRole('button', { name: 'MS 1', exact: true })).toBeVisible();
  await searchCatalog(page, 'Roma');
  await expect(page.getByText('Bu aramada desteklenen katalog kaydı yok.')).toBeVisible();
});

test('duyarlı yerleşim, azaltılmış hareket ve görsel inceleme çıktısı', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [
    { width: 320, height: 568 },
    { width: 800, height: 360 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.goto('/');
    await expect(page.getByTestId('timeline-bar')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('WebGL 2 kullanılamıyor');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const map = await page.getByTestId('map-viewport').boundingBox();
    expect(map?.height).toBeGreaterThanOrEqual(size.height < 500 ? 120 : 160);
    expect(map?.width).toBeGreaterThanOrEqual(size.width - 32);
    await page.getByRole('button', { name: 'Kapsam ve kaynaklar' }).click();
    await expect(page.getByText('Eksikleri görünür bir atlas')).toBeVisible();
    await info.attach(`layout-${size.width}x${size.height}`, {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await expect(page).toHaveScreenshot(`atlas-panel-${size.width}x${size.height}.png`, {
      animations: 'disabled',
    });
    await page.getByRole('button', { name: 'Paneli kapat' }).click();
  }
});
