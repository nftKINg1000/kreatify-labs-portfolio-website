// Performance budgets for the production build (run after `npm run build`).
// Measures what the initial HTML actually references (scripts, modulepreloads, CSS)
// and fails if the initial path grows past budget or pulls in the 3D chunk.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const BUDGETS = {
  initialJsGzip: 200 * 1024, // brief: < 200 kB gzip
  initialCssGzip: 20 * 1024,
  htmlGzip: 40 * 1024,
  lazy3dGzip: 200 * 1024,
};

const gz = (buffer) => zlib.gzipSync(buffer, { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const refs = (pattern) => [...html.matchAll(pattern)].map((m) => m[1]);

const initialJs = [...refs(/<script[^>]+src="([^"]+\.js)"/g), ...refs(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)];
const initialCss = refs(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/g);
const size = (urls) => urls.reduce((sum, url) => sum + gz(fs.readFileSync(path.join(dist, url))), 0);

const assets = fs.readdirSync(path.join(dist, 'assets'));
const scene = assets.find((f) => /^StatueScene-.*\.js$/.test(f));

const results = [
  ['Initial JS (gzip)', size(initialJs), BUDGETS.initialJsGzip],
  ['Initial CSS (gzip)', size(initialCss), BUDGETS.initialCssGzip],
  ['HTML incl. pre-render (gzip)', gz(Buffer.from(html)), BUDGETS.htmlGzip],
  ['Lazy 3D chunk (gzip)', scene ? gz(fs.readFileSync(path.join(dist, 'assets', scene))) : 0, BUDGETS.lazy3dGzip],
];

let failed = false;
for (const [label, actual, budget] of results) {
  const ok = actual <= budget;
  failed ||= !ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(30)} ${kb(actual).padStart(9)}  (budget ${kb(budget)})`);
}

const initialNames = [...initialJs, ...initialCss].join(' ');
if (/StatueScene|three/i.test(initialNames) || /liberty\.glb/.test(html)) {
  console.log('FAIL  3D code or model is referenced from the initial HTML');
  failed = true;
} else {
  console.log('PASS  3D code and model stay off the initial path');
}

process.exit(failed ? 1 : 0);
