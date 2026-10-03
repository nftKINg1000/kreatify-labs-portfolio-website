// Build-time pre-render: inject server-rendered HTML into dist/index.html so crawlers,
// link previews and visitors without JavaScript get the full page. Also writes
// robots.txt and sitemap.xml from the single configured site URL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const env = loadEnv('production', root, 'VITE_');
const siteUrl = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || 'https://kreatifylabs.com').replace(/\/$/, '');

const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const html = render();

const indexPath = path.join(dist, 'index.html');
const template = fs.readFileSync(indexPath, 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('prerender: #root placeholder not found in dist/index.html');
fs.writeFileSync(indexPath, template.replace('<!--app-html-->', html));

fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n  </url>\n</urlset>\n`,
);

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerender: ${(html.length / 1024).toFixed(1)} kB of HTML for ${siteUrl}`);
