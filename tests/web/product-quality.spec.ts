import { expect, test } from './fixtures';
import { tool } from './menu';
const sizes = [
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
];
for (const size of sizes)
  test(`real app layout and screenshot ${size.width}x${size.height}`, async ({ page }, info) => {
    await page.setViewportSize(size);
    await page.goto('/');
    const host = page.getByTestId('globe-canvas-host');
    await expect(host).toHaveAttribute('data-projection', 'globe', { timeout: 25000 });
    await expect(host.locator('canvas')).toBeVisible();
    await expect(page.getByTestId('timeline-dock')).toBeVisible();
    const metrics = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const r = element.getBoundingClientRect(),
          css = getComputedStyle(element);
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          overflow: css.overflow,
          flex: css.flex,
          position: css.position,
        };
      };
      const canvas = document.querySelector('canvas.maplibregl-canvas') as HTMLCanvasElement | null;
      return {
        window: {
          width: innerWidth,
          height: innerHeight,
          dpr: devicePixelRatio,
          scrollWidth: document.documentElement.scrollWidth,
        },
        header: rect('[data-testid="app-header"]'),
        workspace: rect('[data-testid="atlas-workspace"]'),
        viewport: rect('[data-testid="map-viewport"]'),
        host: rect('[data-testid="globe-canvas-host"]'),
        canvasCSS: rect('canvas.maplibregl-canvas'),
        buffer: canvas ? { width: canvas.width, height: canvas.height } : null,
        dock: rect('[data-testid="timeline-dock"]'),
      };
    });
    expect(metrics.window.scrollWidth).toBeLessThanOrEqual(size.width);
    expect(metrics.header?.height).toBeLessThanOrEqual(72);
    expect(metrics.workspace!.height / size.height).toBeGreaterThan(0.5);
    expect(metrics.host!.height).toBeGreaterThan(0);
    expect(metrics.canvasCSS!.height).toBeGreaterThan(0);
    await info.attach('bounds.json', {
      body: JSON.stringify(metrics, null, 2),
      contentType: 'application/json',
    });
    await info.attach('main.png', { body: await page.screenshot(), contentType: 'image/png' });
    await tool(page, 'Yer imleri');
    await expect(page.getByTestId('bookmarks-panel')).toBeVisible();
    await info.attach('panel.png', { body: await page.screenshot(), contentType: 'image/png' });
    await page.getByRole('button', { name: 'Paneli kapat' }).click();
    await page.getByRole('button', { name: 'Keşfet', exact: true }).click();
    if (process.env.ATLAS_TEST_PRODUCTION === '1')
      await expect(page.getByRole('button', { name: 'Geliştirici araçları' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '1867 sınır örneğini göster' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '1066 muharebe örneğini göster' })).toHaveCount(
      0,
    );
  });
