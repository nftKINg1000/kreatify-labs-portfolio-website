/*
  Lead submission provider abstraction. The UI depends only on `LeadProvider`;
  production uses the HTTP endpoint provider. Tests inject their own provider.
*/
import { CONFIG } from '../config';
import type { LeadInput, LeadResponse } from '../shared/lead';

export type SubmitOutcome =
  | { status: 'delivered'; reference: string }
  | { status: 'dev-log'; reference: string }
  | { status: 'invalid'; errors: NonNullable<Extract<LeadResponse, { ok: false }>['errors']> }
  | { status: 'offline' }
  | { status: 'failed'; reason: 'rate_limited' | 'not_configured' | 'delivery_failed' | 'network' | 'server' | 'timeout' };

export interface LeadProvider {
  submit(lead: LeadInput): Promise<SubmitOutcome>;
}

export function endpointProvider(url = CONFIG.leadEndpoint, timeoutMs = 15_000): LeadProvider {
  return {
    async submit(lead) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return { status: 'offline' };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(lead),
          signal: controller.signal,
        });
      } catch {
        return controller.signal.aborted ? { status: 'failed', reason: 'timeout' } : navigator.onLine === false ? { status: 'offline' } : { status: 'failed', reason: 'network' };
      } finally {
        clearTimeout(timer);
      }

      let body: LeadResponse | null = null;
      try {
        body = (await response.json()) as LeadResponse;
      } catch {
        body = null;
      }

      if (body?.ok && body.delivered) return { status: 'delivered', reference: body.reference };
      if (body?.ok && !body.delivered) return { status: 'dev-log', reference: body.reference };
      if (body && !body.ok) {
        if (body.code === 'validation' && body.errors) return { status: 'invalid', errors: body.errors };
        if (body.code === 'rate_limited' || body.code === 'not_configured' || body.code === 'delivery_failed')
          return { status: 'failed', reason: body.code };
      }
      return { status: 'failed', reason: 'server' };
    },
  };
}
