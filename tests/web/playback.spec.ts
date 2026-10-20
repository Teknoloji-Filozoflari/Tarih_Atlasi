import { timelineTools, tool } from './menu';
import { expect, test } from '@playwright/test';

async function disableWebGL(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
        return kind === 'webgl2' ? null : Reflect.apply(original, this, [kind, ...args]);
      },
    });
  });
}
test('çizelge doğrudan MÖ/MS girişini, sıfır reddini ve klavye/ölçek kontrollerini destekler', async ({
  page,
}) => {
  await disableWebGL(page);
  await page.goto('/');
  const bar = page.getByTestId('timeline-bar');
  await bar.getByRole('button', { name: /^MS /u }).click();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('MÖ 0');
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
  await expect(page.getByText('Geçerli aralıkta, sıfırdan farklı bir yıl girin.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('MÖ 1');
  await page.getByRole('button', { name: 'Yılı uygula' }).click();
  const slider = bar.getByRole('slider', { name: 'Tarih çizelgesi yıl kaydırıcısı' });
  await expect(slider).toHaveAttribute('aria-valuetext', 'MÖ 1');
  await slider.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuetext', 'MS 1');
  await slider.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuetext', 'MÖ 1');
  await timelineTools(page);
  await page.getByRole('button', { name: 'Ölçek: Tüm tarih' }).click();
  await page.getByRole('button', { name: 'Ölçek: 200 yıl' }).click();
  await expect(page.getByRole('button', { name: 'Ölçek: 20 yıl' })).toBeVisible();
  await page.getByRole('button', { name: '+100 yıl', exact: true }).click();
  await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
  await expect(bar.getByRole('button', { name: 'MS 100', exact: true })).toBeVisible();
  await expect(bar.getByTestId('historical-coverage')).toHaveText('Yaklaşık veri');
});

test('oynatma manuel yıl hareketinde durur; reduced motion otomatik başlatmaz', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await disableWebGL(page);
  await page.clock.install();
  await page.goto('/');
  const bar = page.getByTestId('timeline-bar');
  await expect(bar.getByRole('button', { name: 'Oynat', exact: true })).toBeVisible();
  await timelineTools(page);
  await page.getByRole('button', { name: 'Başlangıca git' }).click();
  await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
  await bar.getByRole('button', { name: 'Oynat', exact: true }).click();
  await page.clock.runFor(1100);
  await expect(bar.getByRole('button', { name: 'MÖ 1999', exact: true })).toBeVisible();
  await bar.getByRole('slider').press('ArrowRight');
  await expect(bar.getByRole('button', { name: 'Oynat', exact: true })).toBeVisible();
  await page.clock.runFor(3000);
  await expect(bar.getByRole('button', { name: 'MÖ 1998', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Kapsam ve kaynaklar', exact: true }).click();
  const details = page.getByTestId('timeline-details');
  await expect(details).toContainText('İstenen yıl: MÖ 1998');
  await expect(details).toContainText('Uygulanmış kaynaklı geometri yok');
});

test('gerçek kürede zaman kamerayı korur; kaynak yılı ACK ile raporlanır', async ({ page }) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  const camera = page.getByTestId('globe-camera');
  const before = await camera.innerText();
  await tool(page, '1867 sınır örneğini göster');
  await expect(host).toHaveAttribute('data-historical-count', '138');
  await expect(camera).toHaveText(before);
  await timelineTools(page);
  await page.getByRole('button', { name: 'Ölçek: 20 yıl', exact: true }).click();
  await expect(page.getByTestId('snapshot-tick-1867')).toHaveCount(1);
  await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
  await tool(page, 'Kaynaklı örneğe odaklan');
  await expect(camera).toContainText('-141.00, 66.50');
  await tool(page, 'Kapsam ve kaynaklar');
  await expect(page.getByTestId('timeline-details')).toContainText(
    'Haritaya uygulanan kaynak yılı: MS 1867',
  );
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await page.getByRole('button', { name: 'Sonraki yıl' }).click();
  await expect(host).toHaveAttribute('data-historical-count', '138');
  await expect(camera).toContainText('-141.00, 66.50');
  await tool(page, 'Bu yılın siyasi kayıtları');
  await expect(
    page.getByRole('button', { name: 'Alaska antlaşması — 141°B sınır kesiti', exact: true }),
  ).toHaveCount(0);
});
