import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { performance } from 'node:perf_hooks';
const output = process.argv[2] ?? 'docs/reports/phase-15-web-benchmark.json',
  root = resolve('dist');
const report = {
  measuredAt: new Date().toISOString(),
  kind: 'STATIC_PRODUCTION_EXPORT_BROWSER',
  status: 'BLOCKED',
  measurements: [],
  excluded: ['Android device, GPU allocation, battery and temperature are not measured.'],
};
let browser, server;
try {
  server = createServer(async (req, res) => {
    try {
      const name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      let path = resolve(root, '.' + name);
      if (!path.startsWith(root + '/') && path !== root) throw new Error();
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
      const body = await readFile(path);
      res.setHeader(
        'Content-Type',
        {
          '.js': 'text/javascript',
          '.html': 'text/html',
          '.css': 'text/css',
          '.json': 'application/json',
        }[extname(path)] ?? 'application/octet-stream',
      );
      res.setHeader(
        'Cache-Control',
        /\/[a-f0-9]{64}\.json$/.test(path) ? 'public, max-age=31536000, immutable' : 'no-cache',
      );
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(4173, '127.0.0.1', resolve);
  });
  browser = await chromium.launch({ headless: true });
  for (const network of [
    { name: 'unthrottled', latency: 0, downloadThroughput: -1, uploadThroughput: -1 },
    {
      name: 'constrained-test-1Mbps-150ms',
      latency: 150,
      downloadThroughput: 125000,
      uploadThroughput: 62500,
    },
  ]) {
    const context = await browser.newContext(),
      page = await context.newPage();
    await page.addInitScript(() => {
      globalThis.__ATLAS_PROFILE__ = true;
      const observer = new MutationObserver(() => {
        if (document.querySelector('[data-testid="globe-canvas-host"][data-projection="globe"]')) {
          performance.mark('atlas-renderer-ready');
          observer.disconnect();
        }
      });
      observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-projection'],
      });
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      ...Object.fromEntries(Object.entries(network).filter(([k]) => k !== 'name')),
    });
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByTestId('globe-canvas-host').waitFor();
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="globe-canvas-host"]')
          ?.getAttribute('data-projection') === 'globe',
      {},
      { timeout: 30000 },
    );
    await page
      .getByTestId('timeline-bar')
      .getByRole('button', { name: /^(MS|MÖ) /u })
      .click();
    await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('MS 1867');
    await page.getByRole('button', { name: 'Yılı uygula' }).click();
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="globe-canvas-host"]')
          ?.getAttribute('data-historical-count') === '1',
    );
    const costs = [];
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: 'Katmanlar', exact: true }).click();
      const start = performance.now();
      await page.getByRole('switch', { name: 'Devlet', exact: true }).click();
      await page.getByRole('button', { name: 'Paneli kapat', exact: true }).click();
      await page.waitForFunction(
        (count) =>
          document
            .querySelector('[data-testid="globe-canvas-host"]')
            ?.getAttribute('data-historical-count') === count,
        i % 2 ? '1' : '0',
      );
      costs.push(performance.now() - start);
    }
    const data = await page.evaluate(() => ({
      rendererReadyMs: performance.getEntriesByName('atlas-renderer-ready')[0]?.startTime ?? null,
      navigation: performance.getEntriesByType('navigation').map((e) => e.toJSON()),
      resources: performance.getEntriesByType('resource').map((e) => ({
        name: e.name.split('/').at(-1),
        duration: e.duration,
        transferSize: e.transferSize,
        encodedBodySize: e.encodedBodySize,
      })),
      diagnostics: globalThis.__ATLAS_METRICS__?.(),
      heap: performance.memory
        ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
          }
        : null,
    }));
    await cdp.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
    });
    await page
      .getByTestId('timeline-bar')
      .getByRole('button', { name: /^(MS|MÖ) /u })
      .click();
    await page.getByRole('textbox', { name: 'Yıl numarası' }).fill('MS 1867');
    await page.getByRole('button', { name: 'Yılı uygula' }).click();
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="globe-canvas-host"]')
          ?.getAttribute('data-historical-count') === '1',
    );
    report.measurements.push({
      network: network.name,
      ...data,
      layerToggleAutomationLatencyMs: costs,
      offlineLoadedPilotVisible: true,
    });
    await context.close();
  }
  report.status = 'PASS';
} catch (error) {
  report.reason = `${error.code ?? error.name}: ${error.message}`;
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((resolve) => {
    if (server?.listening) server.close(resolve);
    else resolve();
  });
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`${report.status}: ${output}`);
}
