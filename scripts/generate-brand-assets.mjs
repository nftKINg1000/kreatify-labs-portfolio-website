// Generates raster brand assets from the approved SVG geometry (src/components/ui/Logo.tsx):
// favicon.ico, apple-touch-icon.png, brand/kreatifylabs-logo.png, og-image.png, and the
// static hero fallback for the 3D statue (rendered from the live scene).
// Usage: node scripts/generate-brand-assets.mjs [--statue http://localhost:4173]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (...p) => path.join(root, 'public', ...p);
fs.mkdirSync(pub('brand'), { recursive: true });
fs.mkdirSync(pub('images'), { recursive: true });

// Approved v1.2 paths (kept identical to Logo.tsx).
const L = {
  K: 'M32.4 34.7H46.2V60L67.6 34.7H84.5L59.2 64.1L89.5 96.9H69.6L46.2 70.2V96.9H32.4V34.7Z',
  R: 'M85.5 34.7H107.8C121.1 34.7 128.2 41.5 128.2 53.4C128.2 62 124 67.5 115.6 70.4L137 96.9H118.7L99.2 71.9V96.9H85.5V34.7ZM99.2 46V61.8H104.7C110.5 61.8 113.6 59.1 113.6 53.8C113.6 48.5 110.5 46 104.7 46H99.2Z',
  E: 'M133.5 34.7H169.4V46.5H147.2V59.9H168.3V71.9H147.2V84.9H169.4V96.9H133.5V34.7Z',
  T: 'M241.2 34.7H298.1V96.9H284.1V46.6H269.3V96.9H255.5V46.6H241.2V34.7Z',
  F: 'M301.5 34.7H337.1V46.6H315.3V60H335.5V71.9H315.3V96.9H301.5V34.7Z',
  Y: 'M330.9 34.7H348.1L361.4 56.3L374.3 34.7H390.9L368.3 68.8V96.9H354.5V68.9L330.9 34.7Z',
};
const A_LEFT = 'M208 32.4 170.4 97.2 208 70.1V32.4Z';
const A_RIGHT = 'M208 32.4V70.1L245.7 97.2L208 32.4Z';
const A_SOLID = 'M208 32.4 170.4 97.2 208 70.1 245.7 97.2Z';

const wordmark = (fill, color = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="32.4 32.4 358.5 64.8">
    ${['K', 'E', 'T', 'F', 'Y'].map((k) => `<path fill="${fill}" d="${L[k]}"/>`).join('')}
    <path fill="${fill}" fill-rule="evenodd" d="${L.R}"/>
    ${color ? `<path fill="#A0030E" d="${A_LEFT}"/><path fill="#0A1378" d="${A_RIGHT}"/>` : `<path fill="${fill}" d="${A_SOLID}"/>`}
  </svg>`;
const symbol = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="170.4 32.4 75.3 64.8"><path fill="#A0030E" d="${A_LEFT}"/><path fill="#0A1378" d="${A_RIGHT}"/></svg>`;

const anton = fs.readFileSync(path.join(root, 'node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2')).toString('base64');
const roboto = fs.readFileSync(path.join(root, 'node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2')).toString('base64');
const panchang = fs.readFileSync(pub('fonts', 'panchang-700.woff2')).toString('base64');
const fonts = `<style>
  @font-face{font-family:Anton;src:url(data:font/woff2;base64,${anton})}
  @font-face{font-family:Roboto;src:url(data:font/woff2;base64,${roboto})}
  @font-face{font-family:Panchang;font-weight:700;src:url(data:font/woff2;base64,${panchang})}
  *{margin:0;box-sizing:border-box} html,body{width:100%;height:100%}
</style>`;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function shoot(html, width, height, file, { transparent = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(`<!doctype html><html><head>${fonts}</head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const buffer = await page.screenshot({ omitBackground: transparent });
  if (file) fs.writeFileSync(file, buffer);
  await page.close();
  return buffer;
}

// Apple touch icon: approved colour A on Open Sky, inside the 40% safe zone.
await shoot(
  `<div style="width:180px;height:180px;background:#E6F4FD;display:grid;place-items:center">
    <div style="width:104px">${symbol}</div></div>`,
  180, 180, pub('apple-touch-icon.png'),
);

// favicon.ico (32×32 PNG wrapped in an ICO container).
const png32 = await shoot(
  `<div style="width:32px;height:32px;background:#E6F4FD;display:grid;place-items:center"><div style="width:22px">${symbol}</div></div>`,
  32, 32, null,
);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18);
fs.writeFileSync(pub('favicon.ico'), Buffer.concat([header, png32]));

// Logo for structured data / partners: colour wordmark on its Open Sky field with 0.5H clear space.
await shoot(
  `<div style="width:1200px;height:360px;background:#E6F4FD;display:grid;place-items:center"><div style="width:960px">${wordmark('#0A1378')}</div></div>`,
  1200, 360, pub('brand', 'kreatifylabs-logo.png'),
);

// Social share image (1200×630).
await shoot(
  `<div style="width:1200px;height:630px;background:#0A1378;color:#E6F4FD;padding:72px;display:flex;flex-direction:column;justify-content:space-between;font-family:Roboto">
    <div style="width:520px">${wordmark('#FFFFFF', false)}</div>
    <div>
      <div style="font-family:Panchang;font-weight:700;font-size:64px;line-height:1;text-transform:uppercase">Intelligence,<br><span style="background:#E6F4FD;color:#0A1378;padding:0 8px">made useful.</span></div>
      <div style="margin-top:28px;font-size:28px;color:#C8D8E5">KreatifyLabs — AI Product &amp; Creative Technology Studio</div>
    </div>
  </div>`,
  1200, 630, pub('og-image.png'),
);

// Static hero fallback for the 3D statue: rendered from the live scene when a preview URL is given.
const statueIndex = process.argv.indexOf('--statue');
if (statueIndex > -1) {
  const base = process.argv[statueIndex + 1] ?? 'http://localhost:4173';
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('has-scene'), null, { timeout: 60_000 });
  await page.waitForTimeout(1500);
  // Keep only the canvas, on a transparent page.
  await page.addStyleTag({ content: 'html,body,main,section,footer,header{background:transparent!important} body>*:not(.scene-layer){visibility:hidden!important} .scene-layer{visibility:visible!important}' });
  const shot = await page.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(root, 'scratch-statue.png'), shot);
  // Crop to the statue and encode as WebP in the browser.
  const webp = await page.evaluate(async (dataUrl) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
    for (let y = 0; y < c.height; y++)
      for (let x = 0; x < c.width; x++)
        if (data[(y * c.width + x) * 4 + 3] > 8) {
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
    const pad = 16;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    out.getContext('2d').drawImage(c, minX - pad, minY - pad, w, h, 0, 0, w, h);
    return { url: out.toDataURL('image/webp', 0.86), w, h };
  }, `data:image/png;base64,${shot.toString('base64')}`);
  fs.writeFileSync(pub('images', 'statue-fallback.webp'), Buffer.from(webp.url.split(',')[1], 'base64'));
  fs.rmSync(path.join(root, 'scratch-statue.png'));
  console.log(`statue fallback ${webp.w}×${webp.h}`);
}

await browser.close();
console.log('brand assets written to public/');
