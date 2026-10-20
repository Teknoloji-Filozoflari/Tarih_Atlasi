import { tool } from './menu';
import { expect, test } from '@playwright/test';

test('kaynaklı 1867 pilotu gerçek haritada çizilir; yıl ve devlet görünürlüğü bağımsızdır', async ({
  page,
}, info) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await expect(host).toHaveAttribute('data-historical-count', '22');
  await tool(page, '1867 sınır örneğini göster');
  await expect(host).toHaveAttribute('data-historical-year', '1867');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await tool(page, 'Kaynaklı örneğe odaklan');
  await expect(page.getByTestId('globe-camera')).toContainText('-141.00, 66.50');
  await info.attach('sourced-treaty-segment', {
    body: await host.screenshot(),
    contentType: 'image/png',
  });
  const box = await host.boundingBox();
  if (!box) throw new Error('No globe layout');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId('polity-card')).toContainText('20.6.MS 1867');
  await expect(page.getByTestId('polity-card')).toContainText('yalnız sınır kesitidir');
  await expect(
    page.getByRole('button', { name: 'NARA — 1867 Alaska Antlaşması olgu çıkarımı' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await page.getByRole('switch', { name: 'Devlet', exact: true }).click();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(page.getByTestId('timeline-coverage')).toContainText(
    'Bu katalogda seçili yıl için kaynakla desteklenen tarihî coğrafya kaydı yok.',
  );
  await tool(page, '1867 sınır örneğini göster');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await page.getByRole('button', { name: 'Sonraki yıl' }).click();
  await expect(host).toHaveAttribute('data-historical-year', '1868');
  await expect(host).toHaveAttribute('data-historical-count', '0');
});

test('küre arkasında kalan işaret gizlenir, sıfırlanınca yeniden seçilebilir', async ({ page }) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await tool(page, 'Sentetik teknik işareti göster / gizle');
  const marker = page.locator('[data-demo-id="synthetic-demo"]');
  await expect(marker).toBeVisible();
  const box = await host.boundingBox();
  if (!box) throw new Error('Globe has no layout');
  // Gerçek etkileşim ve MapLibre occlusion hesabı: harita iç durumunu taklit etme.
  for (let turn = 0; turn < 12; turn++) {
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.45, { steps: 24 });
    await page.mouse.up();
    try {
      await expect(marker).toHaveClass(/maplibregl-marker-covered/u, { timeout: 700 });
      break;
    } catch {
      if (turn === 11) throw new Error('Rotation did not place marker behind globe');
    }
  }
  await expect(marker).toBeHidden();
  // Görünmez ama odaklanabilir bir düğme bırakılmamalı.
  await marker.evaluate((element: HTMLElement) => element.focus());
  await expect(marker).not.toBeFocused();
  await expect(page.getByTestId('globe-bridge-status')).toHaveText('İşaret seçimi henüz alınmadı.');
  await page.getByRole('button', { name: 'Kamerayı sıfırla' }).click();
  await expect(marker).toBeVisible();
  await marker.click();
  await expect(page.getByTestId('globe-bridge-status')).toHaveText(
    'Sentetik işaret seçimi uygulamaya ulaştı.',
  );
});

test('gerçek globe, marker → React, kamera, resize ve ekran dönüşünde yeniden mount', async ({
  page,
}, testInfo) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.getByRole('heading', { name: 'Tarih Atlası' })).toBeVisible();
  const host = page.getByTestId('globe-canvas-host');
  // Fallback başarı sayılmaz: gerçek renderer load + projection + canvas şarttır.
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await expect(host.locator('canvas')).toBeVisible();
  if (!(await page.getByRole('button', { name: 'Sentetik demo işaretini seç' }).isVisible()))
    await tool(page, 'Sentetik teknik işareti göster / gizle');
  await page.getByRole('button', { name: 'Sentetik demo işaretini seç' }).click();
  await expect(page.getByTestId('globe-bridge-status')).toHaveText(
    'Sentetik işaret seçimi uygulamaya ulaştı.',
  );
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  const camera = page.getByTestId('globe-camera');
  const initial = await camera.innerText();
  const box = await host.boundingBox();
  if (!box) throw new Error('Globe has no layout');
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.6, { steps: 12 });
  await page.mouse.up();
  await expect(camera).not.toHaveText(initial);
  await page.mouse.wheel(0, -200);
  await expect(camera).not.toContainText('z 1.00');
  await page.getByRole('button', { name: 'Kamerayı sıfırla' }).click();
  await expect(camera).toHaveText(initial);
  const size = page.viewportSize();
  if (size) await page.setViewportSize({ width: size.width, height: size.height + 120 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach('globe', { body: await host.screenshot(), contentType: 'image/png' });
  await page.getByRole('link', { name: /Atlas hakkında/u }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('canvas.maplibregl-canvas')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Önce kaynak' })).toBeVisible();
  await page.goBack();
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await expect(page.getByTestId('globe-bridge-status')).toHaveText('İşaret seçimi henüz alınmadı.');
  expect(pageErrors).toEqual([]);
});

test('WebGL yokken haritasız açıklama, yeniden deneme ve bilgi sayfası kullanılabilir', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, context: string, ...args: unknown[]) {
        return context === 'webgl2' ? null : Reflect.apply(original, this, [context, ...args]);
      },
    });
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('WebGL 2 kullanılamıyor');
  await expect(page.getByRole('alert')).toContainText('Haritasız görünüm');
  await expect(page.locator('canvas.maplibregl-canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Yeniden dene' }).click();
  await expect(page.getByRole('alert')).toContainText('WebGL 2 kullanılamıyor');
  await page.getByRole('link', { name: /Atlas hakkında/u }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test('gerçek context kaybı renderer kaynaklarını bırakır ve tekrar yüklenebilir', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  const supported = await host.locator('canvas').evaluate((element) => {
    const gl = (element as HTMLCanvasElement).getContext('webgl2');
    const extension = gl?.getExtension('WEBGL_lose_context');
    extension?.loseContext();
    return Boolean(extension);
  });
  expect(supported, 'Context-loss test needs WEBGL_lose_context; do not silently pass').toBe(true);
  await expect(page.getByRole('alert')).toContainText('Grafik bağlamı kaybedildi');
  await expect(host.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Yeniden dene' }).click();
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await expect(page.getByTestId('globe-bridge-status')).toHaveText('İşaret seçimi henüz alınmadı.');
  if (!(await page.getByRole('button', { name: 'Sentetik demo işaretini seç' }).isVisible()))
    await tool(page, 'Sentetik teknik işareti göster / gizle');
  await page.getByRole('button', { name: 'Sentetik demo işaretini seç' }).click();
  await expect(page.getByTestId('globe-bridge-status')).toHaveText(
    'Sentetik işaret seçimi uygulamaya ulaştı.',
  );
});

test('geçersiz yol için Türkçe hata ve dönüş yolu vardır', async ({ page }) => {
  await page.goto('/gecersiz-sayfa');
  await expect(
    page.getByRole('heading', { name: 'Bu sayfa bulunamadı', exact: true }).last(),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Başlangıca dön' }).click();
  await expect(page.getByTestId('map-viewport')).toBeVisible();
});

test('zaman motoru önizlemesi açık seçim ister; kaynak yılı kalır ve yıl değişince kapanır', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await tool(page, '1867 sınır örneğini göster');
  await expect(page.getByTestId('historical-coverage')).toContainText('belgelenmiş yaklaşık');
  await page.getByRole('button', { name: 'Sonraki yıl' }).click();
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(page.getByTestId('historical-coverage')).toContainText(
    'desteklenen tarihî coğrafya kaydı yok',
  );
  await expect(page.getByTestId('snapshot-preview-label')).toHaveCount(0);
  await tool(page, 'En yakın kaynak yılını önizle');
  await expect(page.getByTestId('snapshot-preview-label')).toContainText('Kaynak yılı: MS 1867');
  await expect(host).toHaveAttribute('data-historical-year', '1868');
  await expect(host).toHaveAttribute('data-historical-source-year', '1867');
  await expect(host).toHaveAttribute('data-historical-preview', 'true');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await tool(page, 'Kaynak yılı önizlemesini kapat');
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(page.getByTestId('snapshot-preview-label')).toHaveCount(0);
  await tool(page, 'En yakın kaynak yılını önizle');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await page.getByRole('button', { name: 'Sonraki yıl' }).click();
  await expect(host).toHaveAttribute('data-historical-year', '1869');
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(page.getByTestId('snapshot-preview-label')).toHaveCount(0);
});
