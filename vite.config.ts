import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { devLogTransport, handleLeadRequest, memoryRateLimiter } from './server/lead-handler.ts';
import securityHeaders from './security-headers.json' with { type: 'json' };

/**
 * Local adapter for POST /api/lead. Runs the real handler (validation, rate limit,
 * honeypot) with a dev-log transport that never delivers and says so in its response.
 */
function devLeadEndpoint(): Plugin {
  const rateLimiter = memoryRateLimiter({ limit: 30 });
  // Must return nothing: a function returned from configure*Server is treated as a post hook.
  const install = (server: { middlewares: { use: (path: string, fn: (req: IncomingMessage, res: ServerResponse) => void) => void } }): void => {
    server.middlewares.use('/api/lead', async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const request = new Request('http://localhost/api/lead', {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });
        const response = await handleLeadRequest(request, {
          env: {},
          transport: devLogTransport,
          rateLimiter,
          clientAddress: req.socket.remoteAddress,
        });
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      });
  };
  return {
    name: 'kreatifylabs-dev-lead-endpoint',
    configureServer: install,
    configurePreviewServer: install,
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devLeadEndpoint()],
  // Preview (and therefore the e2e suite) runs under the production security headers,
  // so a CSP regression fails tests. HSTS is irrelevant on localhost but harmless.
  preview: { headers: securityHeaders },
  build: {
    // The only chunk above Vite's 500 kB default is StatueScene (three.js + loaders, ~640 kB min / ~160 kB gzip).
    // It is lazy-loaded after the page is idle and only on capable desktops, never on the initial path.
    // The initial chunk is guarded separately by scripts/check-budgets.mjs.
    chunkSizeWarningLimit: 700,
  },
});
