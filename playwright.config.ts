import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end, accessibility and visual tests against the production build
 * (`vite preview`, which also serves the dev-log /api/lead adapter).
 * Most projects disable WebGL so results are deterministic; @scene tests enable it.
 */
const baseURL = process.env.BASE_URL ?? 'http://localhost:4173';
const noWebgl = { launchOptions: { args: ['--disable-webgl', '--disable-3d-apis'] } };

export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: process.env.CI ? 'npm run build && npm run preview' : 'npm run preview',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, ...noWebgl }, grepInvert: /@visual|@scene|@mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...noWebgl }, grep: /@mobile|@a11y/ },
    {
      name: 'scene',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
      grep: /@scene/,
    },
    // Visual baselines are platform-specific; regenerate with `npm run test:visual -- --update-snapshots`.
    { name: 'visual', use: { ...devices['Desktop Chrome'], ...noWebgl }, grep: /@visual/ },
  ],
});
