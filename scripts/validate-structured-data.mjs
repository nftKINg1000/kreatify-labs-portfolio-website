// Structural validation of JSON-LD and social metadata in dist/index.html.
// (Google's Rich Results Test is the authoritative check; run it against the deployed URL.)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
const errors = [];
const check = (condition, message) => condition || errors.push(message);

const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
check(blocks.length === 1, `expected 1 JSON-LD block, found ${blocks.length}`);

let data = {};
try {
  data = JSON.parse(blocks[0]);
} catch (error) {
  errors.push(`JSON-LD does not parse: ${error.message}`);
}

const graph = data['@graph'] ?? [];
const byType = Object.fromEntries(graph.map((node) => [node['@type'], node]));
check(data['@context'] === 'https://schema.org', '@context must be https://schema.org');
check(byType.WebSite, 'WebSite node missing');
check(byType.Organization, 'Organization node missing');

const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
check(canonical && /^https:\/\/[^%]+\/$/.test(canonical), `canonical must be an absolute https URL (got ${canonical})`);
const origin = canonical ? new URL(canonical).origin : '';

for (const node of graph) {
  check(node.name === 'KreatifyLabs', `${node['@type']}.name must be "KreatifyLabs"`);
  check(typeof node.url === 'string' && node.url.startsWith(origin), `${node['@type']}.url must use the canonical origin`);
}
const org = byType.Organization ?? {};
check(org.logo?.startsWith(origin), 'Organization.logo must be absolute on the canonical origin');
check(fs.existsSync(path.join(root, 'dist', 'brand', 'kreatifylabs-logo.png')), 'logo file missing from dist');

// Never publish unverifiable claims in schema.
for (const forbidden of ['aggregateRating', 'review', 'address', 'sameAs', 'award', 'foundingDate', 'numberOfEmployees']) {
  check(!(forbidden in org), `Organization must not include unverified "${forbidden}"`);
}

for (const property of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) {
  check(new RegExp(`(property|name)="${property}"`).test(html), `missing ${property}`);
}
check(!html.includes('%VITE_'), 'unreplaced %VITE_*% placeholder in HTML');
for (const file of ['robots.txt', 'sitemap.xml', 'og-image.png', 'favicon.ico', 'apple-touch-icon.png', 'site.webmanifest']) {
  check(fs.existsSync(path.join(root, 'dist', file)), `${file} missing from dist`);
}

if (errors.length) {
  console.error(errors.map((e) => `FAIL  ${e}`).join('\n'));
  process.exit(1);
}
console.log(`PASS  JSON-LD (${graph.map((n) => n['@type']).join(', ')}), canonical ${canonical}, social metadata and crawl files`);
