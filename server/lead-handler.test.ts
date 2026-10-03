import { describe, expect, it, vi } from 'vitest';
import { handleLeadRequest, memoryRateLimiter, transportFromEnv, type Transport } from './lead-handler.js';

const body = {
  name: 'Ada',
  email: 'ada@example.com',
  message: 'We need help turning a prototype into a product.',
  services: [],
};

const post = (payload: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });

const ok: Transport = async () => ({ delivered: true });
const allowAll = { allow: () => true };

describe('handleLeadRequest', () => {
  it('reports delivered only when the transport confirms delivery', async () => {
    const res = await handleLeadRequest(post(body), { env: {}, transport: ok, rateLimiter: allowAll });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, delivered: true });
    expect(json.reference).toMatch(/^KL-/);
  });

  it('returns 502 when the transport fails, never a success', async () => {
    const res = await handleLeadRequest(post(body), { env: {}, transport: async () => ({ delivered: false }), rateLimiter: allowAll });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, code: 'delivery_failed' });
  });

  it('returns 503 not_configured when no transport is set', async () => {
    const res = await handleLeadRequest(post(body), { env: {}, transport: null, rateLimiter: allowAll });
    expect(res.status).toBe(503);
  });

  it('validates on the server', async () => {
    const res = await handleLeadRequest(post({ name: '' }), { env: {}, transport: ok, rateLimiter: allowAll });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('validation');
    expect(json.errors.email).toBeDefined();
  });

  it('rejects a filled honeypot without delivering', async () => {
    const transport = vi.fn(ok);
    const res = await handleLeadRequest(post({ ...body, website: 'http://spam.example' }), { env: {}, transport, rateLimiter: allowAll });
    expect(res.status).toBe(400);
    expect(transport).not.toHaveBeenCalled();
  });

  it('rejects non-JSON, malformed and oversized bodies and wrong methods', async () => {
    expect((await handleLeadRequest(post('{nope'), { env: {}, transport: ok, rateLimiter: allowAll })).status).toBe(400);
    expect((await handleLeadRequest(post(body, { 'content-type': 'text/plain' }), { env: {}, transport: ok, rateLimiter: allowAll })).status).toBe(415);
    expect((await handleLeadRequest(post({ ...body, message: 'x'.repeat(20_000) }), { env: {}, transport: ok, rateLimiter: allowAll })).status).toBe(413);
    expect((await handleLeadRequest(new Request('http://localhost/api/lead'), { env: {}, transport: ok, rateLimiter: allowAll })).status).toBe(405);
  });

  it('rate-limits repeated submissions from the same client', async () => {
    const rateLimiter = memoryRateLimiter({ limit: 2, windowMs: 60_000 });
    const opts = { env: {}, transport: ok, rateLimiter, clientAddress: '203.0.113.7' };
    expect((await handleLeadRequest(post(body), opts)).status).toBe(200);
    expect((await handleLeadRequest(post(body), opts)).status).toBe(200);
    expect((await handleLeadRequest(post(body), opts)).status).toBe(429);
  });

  it('blocks disallowed origins when ALLOWED_ORIGINS is set', async () => {
    const res = await handleLeadRequest(post(body, { origin: 'https://evil.example' }), {
      env: { ALLOWED_ORIGINS: 'https://kreatifylabs.com' },
      transport: ok,
      rateLimiter: allowAll,
    });
    expect(res.status).toBe(403);
  });
});

describe('transportFromEnv', () => {
  it('returns null when nothing is configured (no silent fake delivery)', () => {
    expect(transportFromEnv({})).toBeNull();
  });

  it('selects the webhook transport and never forwards the honeypot field', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    const transport = transportFromEnv({ LEAD_WEBHOOK_URL: 'https://hooks.example/lead' });
    expect(transport).not.toBeNull();
    const result = await transport!({ ...body, company: '', engagement: '', budget: '', timeline: '', website: '', services: [] }, 'KL-TEST');
    expect(result.delivered).toBe(true);
    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent).not.toHaveProperty('website');
    expect(sent.reference).toBe('KL-TEST');
  });
});
