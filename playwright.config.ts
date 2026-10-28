import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/web',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Real globe tests compete for software GPU/CPU on hosted runners.
  // Keep every scenario and assertion; use one browser worker for repeatability.
  workers: process.env.CI ? 1 : undefined,
  use: { baseURL: 'http://127.0.0.1:8081', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      testIgnore: '**/product-quality.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'narrow',
      testIgnore: '**/product-quality.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 } },
    },
    {
      name: 'visual',
      testMatch: '**/product-quality.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // CI and explicit production runs serve the static export. Expo `start --web`
    // does not become ready on GitHub-hosted runners (multi-minute URL timeout).
    command:
      process.env.ATLAS_TEST_PRODUCTION === '1' || process.env.CI
        ? 'npm run web:preview'
        : 'npm run web -- --host localhost --port 8081',
    url: 'http://127.0.0.1:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { CI: '1', EXPO_NO_TELEMETRY: '1' },
  },
});
