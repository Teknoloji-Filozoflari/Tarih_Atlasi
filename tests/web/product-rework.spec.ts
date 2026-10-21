import { expect, test } from './fixtures';
import { tool } from './menu';

test('globe-only keeps year, camera and one renderer through layer changes', async ({
  page,
}, info) => {
  await page.goto('/');
  const host = page.getByTestId('globe-canvas-host');
  await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
  await expect(host.locator('canvas')).toHaveCount(1);
  await expect(page.locator('[data-demo-id="synthetic-demo"]')).toBeHidden();
  await tool(page, '1867 sınır örneğini göster');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  const before = await page.getByTestId('globe-camera').textContent();
  await expect(page.getByRole('button', { name: 'Atlas', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Küre', exact: true })).toHaveCount(0);
  await expect(host).toHaveAttribute('data-projection', 'globe');
  await expect(host).toHaveAttribute('data-historical-year', '1867');
  await expect(host).toHaveAttribute('data-historical-count', '1');
  await expect(page.getByTestId('globe-camera')).toHaveText(before!);
  await expect(host.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
  await page.getByRole('switch', { name: 'Devlet', exact: true }).click();
  await page.getByRole('button', { name: 'Paneli kapat' }).click();
  await expect(host).toHaveAttribute('data-historical-count', '0');
  await expect(page.getByTestId('globe-camera')).toHaveText(before!);
  await info.attach('globe-only-real-renderer', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
});

test('corrupt bookmarks require review and confirmation; cancellation preserves original bytes', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tarihatlasi.bookmarks.v1', '{broken'));
  await tool(page, 'Yer imleri');
  await page.getByRole('button', { name: 'Bozuk kaydı incele ve kurtar' }).click();
  await expect(page.getByTestId('bookmarks-panel')).toContainText('{broken');
  await page.getByRole('button', { name: 'Vazgeç; özgün kaydı koru' }).click();
  expect(await page.evaluate(() => localStorage.getItem('tarihatlasi.bookmarks.v1'))).toBe(
    '{broken',
  );
  await page.getByRole('button', { name: 'Bozuk kaydı incele ve kurtar' }).click();
  await page
    .getByRole('button', { name: 'Özgün kaydı inceledim; yalnız yer imlerini sıfırla' })
    .click();
  await expect(page.getByTestId('bookmarks-panel')).toContainText('Henüz yer imi yok');
  await page.getByRole('button', { name: /^Yılı kaydet/u }).click();
  await expect(page.getByTestId('bookmarks-panel')).toContainText('Yıl yer imi');
  await page.reload();
  await tool(page, 'Yer imleri');
  await expect(page.getByTestId('bookmarks-panel')).toContainText('Yıl yer imi');
});

test('map-first fallback, readable coverage and all navigation remain available on small screens', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, name: string, ...args: unknown[]) {
        return name === 'webgl2' ? null : Reflect.apply(original, this, [name, ...args]);
      },
    });
  });
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 800, height: 360 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByTestId('timeline-bar').getByTestId('historical-coverage')).toHaveText(
      'Yaklaşık veri',
    );
    await expect(page.getByRole('button', { name: 'Atlas', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Katmanlar', exact: true })).toBeVisible();
    await expect(page.getByRole('slider')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const map = await page.getByTestId('atlas-workspace').boundingBox();
    expect(map?.height).toBeGreaterThanOrEqual(viewport.height < 500 ? 120 : 160);
    await tool(page, 'Yer imleri');
    await expect(page.getByTestId('bookmarks-panel')).toBeVisible();
    await page.getByRole('button', { name: 'Paneli kapat' }).click();
    await page.getByRole('button', { name: 'Harita lisansları ve atıflar', exact: true }).click();
    await expect(page.getByText(/Natural Earth/u).first()).toBeVisible();
    await page.getByRole('button', { name: 'Paneli kapat' }).click();
    await info.attach(`map-first-${viewport.width}x${viewport.height}`, {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  }
});
