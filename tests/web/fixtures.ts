import { test as base } from '@playwright/test';
export { expect, type Page } from '@playwright/test';

/** Bounded diagnostics from isolated test profiles, never real user telemetry. */
export const test = base.extend<{ atlasDiagnostics: void }>({
  atlasDiagnostics: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      const path = (value: string) => {
        try {
          const url = new URL(value);
          return url.origin + url.pathname; // exclude query parameters and fragments
        } catch {
          return '[invalid URL]';
        }
      };
      const remember = (value: string) => {
        if (errors.length === 40) errors.shift();
        errors.push(value.replace(/https?:\/\/[^\s"'<>]+/giu, (url) => path(url)).slice(0, 1000));
      };
      page.on('pageerror', (error) => remember(`script: ${error.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning')
          remember(`console: ${message.text()}`);
      });
      page.on('requestfailed', (request) =>
        remember(`network: ${path(request.url())} ${request.failure()?.errorText}`),
      );
      page.on('response', (response) => {
        if (response.status() >= 400)
          remember(`HTTP ${response.status()}: ${path(response.url())}`);
      });
      await use();
      if (testInfo.status !== testInfo.expectedStatus) {
        const state = await page
          .evaluate(() => {
            const host = document.querySelector('[data-testid="globe-canvas-host"]');
            return {
              globe: host ? { ...(host as HTMLElement).dataset } : null,
              timeline: document.querySelector('[data-testid="timeline-bar"]')?.textContent,
              coverage: document.querySelector('[data-testid="historical-coverage"]')?.textContent,
              markers: document.querySelectorAll('.maplibregl-marker').length,
            };
          })
          .catch(() => null);
        const body = JSON.stringify(
          { test: testInfo.title, project: testInfo.project.name, errors, state },
          null,
          2,
        );
        console.log('[atlas browser failure]', body);
        await testInfo.attach('atlas-diagnostics', { body, contentType: 'application/json' });
      }
    },
    { auto: true },
  ],
});
