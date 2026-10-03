// Repeatable site audit: axe (WCAG 2.2 A/AA), overflow, focus order, LCP/CLS, no-JS
// render and reduced-motion behaviour across the target viewports.
// Usage: node scripts/audit.mjs [baseUrl] [outDir]
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = process.argv[3] ?? 'audit-results';
const VIEWPORTS = [
  [320, 568], [375, 667], [390, 844], [768, 1024],
  [1024, 768], [1280, 800], [1440, 900], [1920, 1080],
];

fs.mkdirSync(OUT, { recursive: true });
// WebGL is disabled for the layout pass so screenshots are deterministic and fast;
// the 3D scene is audited separately by the e2e suite.
const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-3d-apis'] });
const report = { base: BASE, date: new Date().toISOString(), viewports: [] };

const metricsScript = () => {
  window.__lcp = 0;
  window.__cls = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__lcp = entry.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
  }).observe({ type: 'layout-shift', buffered: true });
};

for (const [width, height] of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.addInitScript(metricsScript);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);

  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    pageHeight: document.documentElement.scrollHeight,
    lcp: Math.round(window.__lcp),
    cls: Number(window.__cls.toFixed(4)),
  }));
  await page.screenshot({ path: path.join(OUT, `hero-${width}x${height}.png`) });

  const entry = { viewport: `${width}x${height}`, ...layout, horizontalOverflow: layout.scrollWidth > layout.clientWidth };

  if (width === 1440 || width === 390) {
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    entry.axe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));

    const focus = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      focus.push(
        await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return 'body';
          const label = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
          return `${el.tagName.toLowerCase()}${el.getAttribute('href') ? `[href=${el.getAttribute('href')}]` : ''} "${label}"`;
        }),
      );
    }
    entry.focusOrder = focus;
  }
  report.viewports.push(entry);
  await context.close();
  console.log('audited', width, height);
}

// No-JS render: how much meaningful content exists before/without JavaScript.
{
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  report.noJs = await page.evaluate(() => ({
    textLength: document.body.innerText.trim().length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.textContent.trim()).slice(0, 20),
    links: document.querySelectorAll('a[href]').length,
  }));
  await page.screenshot({ path: path.join(OUT, 'no-js-1280.png') });
  await context.close();
}

// Reduced motion: time until hero content is visible and total scroll length.
{
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'reduced-motion-1280-500ms.png') });
  report.reducedMotion = await page.evaluate(() => ({ pageHeight: document.documentElement.scrollHeight }));
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
