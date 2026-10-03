/*
  Runtime-agnostic lead handler (Web Request/Response). Adapters:
  - api/lead.ts         → Vercel Functions
  - vite.config.ts      → local development (dev-log transport, never delivers)
  Delivery transports are chosen from server-side environment variables only.
*/
import { validateLead, type LeadInput, type LeadResponse } from '../src/shared/lead.js';

export interface LeadEnv {
  RESEND_API_KEY?: string;
  LEAD_TO_EMAIL?: string;
  LEAD_FROM_EMAIL?: string;
  LEAD_WEBHOOK_URL?: string;
  ALLOWED_ORIGINS?: string;
}

export type Transport = (lead: LeadInput, reference: string) => Promise<{ delivered: boolean; mode?: 'dev-log' }>;

/** Rate-limit hook. The default is per-instance memory; plug a shared store (e.g. Redis) in production. */
export interface RateLimiter {
  allow(key: string): Promise<boolean> | boolean;
}

export function memoryRateLimiter({ limit = 5, windowMs = 10 * 60_000 } = {}): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    allow(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000) hits.clear(); // bounded memory
      return recent.length <= limit;
    },
  };
}

const MAX_BODY_BYTES = 16 * 1024;

const json = (body: LeadResponse, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** Opaque, non-reversible key for rate limiting (no raw IPs kept). */
async function hashKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`lead:${value}`));
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function reference(): string {
  return `KL-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function summary(lead: LeadInput, ref: string): string {
  return [
    `Reference: ${ref}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company || '—'}`,
    `Engagement: ${lead.engagement || '—'}`,
    `Services: ${lead.services.join(', ') || '—'}`,
    `Budget: ${lead.budget || '—'}`,
    `Timeline: ${lead.timeline || '—'}`,
    '',
    lead.message,
  ].join('\n');
}

/** Pick the configured delivery transport, or null when nothing is configured. */
export function transportFromEnv(env: LeadEnv): Transport | null {
  if (env.RESEND_API_KEY && env.LEAD_TO_EMAIL && env.LEAD_FROM_EMAIL) {
    return async (lead, ref) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: env.LEAD_FROM_EMAIL,
          to: [env.LEAD_TO_EMAIL],
          reply_to: lead.email,
          subject: `New enquiry ${ref} — ${lead.name}`,
          text: summary(lead, ref),
        }),
      });
      return { delivered: res.ok };
    };
  }
  if (env.LEAD_WEBHOOK_URL) {
    return async (lead, ref) => {
      const res = await fetch(env.LEAD_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reference: ref, ...lead, website: undefined, text: summary(lead, ref) }),
      });
      return { delivered: res.ok };
    };
  }
  return null;
}

export interface HandlerOptions {
  env: LeadEnv;
  transport: Transport | null;
  rateLimiter: RateLimiter;
  /** Client address as reported by the platform; used only to derive a hashed rate-limit key. */
  clientAddress?: string;
}

export async function handleLeadRequest(request: Request, options: HandlerOptions): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST' } });

  const origin = request.headers.get('origin');
  const allowed = (options.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  if (origin && allowed.length && !allowed.includes(origin)) return json({ ok: false, code: 'bad_request' }, 403);

  if (!(request.headers.get('content-type') ?? '').includes('application/json'))
    return json({ ok: false, code: 'bad_request' }, 415);

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return json({ ok: false, code: 'bad_request' }, 413);

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ ok: false, code: 'bad_request' }, 413);
    raw = JSON.parse(text);
  } catch {
    return json({ ok: false, code: 'bad_request' }, 400);
  }

  const key = await hashKey(options.clientAddress ?? 'unknown');
  if (!(await options.rateLimiter.allow(key))) return json({ ok: false, code: 'rate_limited' }, 429);

  const result = validateLead(raw);
  if (!result.ok) return json({ ok: false, code: 'validation', errors: result.errors }, 422);

  // Honeypot filled: reject without delivering. Never report delivery that did not happen,
  // even to bots — a person whose browser autofilled the hidden field gets the email fallback.
  if (result.lead.website) return json({ ok: false, code: 'bad_request' }, 400);

  const ref = reference();

  if (!options.transport) return json({ ok: false, code: 'not_configured' }, 503);

  try {
    const outcome = await options.transport(result.lead, ref);
    if (outcome.mode === 'dev-log') return json({ ok: true, delivered: false, reference: ref, mode: 'dev-log' }, 200);
    if (!outcome.delivered) return json({ ok: false, code: 'delivery_failed' }, 502);
    return json({ ok: true, delivered: true, reference: ref }, 200);
  } catch {
    // Never log the payload: it contains personal data.
    return json({ ok: false, code: 'delivery_failed' }, 502);
  }
}

/** Development transport: prints a redacted summary locally and reports that nothing was delivered. */
export const devLogTransport: Transport = async (lead, ref) => {
  console.info(`[lead:dev] ${ref} received (${lead.services.length} services, ${lead.message.length} chars). Not delivered.`);
  return { delivered: false, mode: 'dev-log' };
};
