import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'security-headers.json'), 'utf8')) as Record<string, string>;

describe('security headers', () => {
  it('vercel.json and public/_headers match security-headers.json (run scripts/sync-headers.mjs)', () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
    const global = vercel.headers.find((h: { source: string }) => h.source === '/(.*)').headers;
    expect(Object.fromEntries(global.map((h: { key: string; value: string }) => [h.key, h.value]))).toEqual(source);

    const netlify = fs.readFileSync(path.join(root, 'public', '_headers'), 'utf8');
    for (const [key, value] of Object.entries(source)) expect(netlify).toContain(`  ${key}: ${value}`);
  });

  it('keeps the CSP strict: no unsafe-inline or unsafe-eval, framing denied', () => {
    const csp = source['Content-Security-Policy'];
    expect(csp).not.toMatch(/'unsafe-inline'|'unsafe-eval'/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});
