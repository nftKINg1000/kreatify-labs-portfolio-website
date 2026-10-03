/*
  Public build-time configuration. Only VITE_* variables reach the browser —
  never put secrets in them. Server secrets live in api/ (process.env).
*/
const env = import.meta.env;

export const CONFIG = {
  /** Canonical origin, no trailing slash. Also substituted into index.html, robots.txt and sitemap.xml. */
  siteUrl: (env.VITE_SITE_URL || 'https://kreatifylabs.com').replace(/\/$/, ''),
  /** Lead endpoint (same-origin by default). */
  leadEndpoint: env.VITE_LEAD_ENDPOINT || '/api/lead',
  /** Optional analytics collector (receives only allow-listed, PII-free events). */
  analyticsEndpoint: env.VITE_ANALYTICS_ENDPOINT || '',
  /** Optional Web Vitals collector. */
  vitalsEndpoint: env.VITE_VITALS_ENDPOINT || '',
};
