/*
  Privacy-safe analytics adapter. Only allow-listed event names and properties can
  be sent, so form contents (names, emails, messages) can never leave via analytics.
  With no endpoint configured, events are dropped (and logged in development).
*/
import { CONFIG } from '../config';

export type AnalyticsEvent =
  | { name: 'form_opened'; source: string }
  | { name: 'form_started' }
  | { name: 'service_selected'; service: string }
  | { name: 'form_submission_succeeded'; mode: 'delivered' | 'dev-log' }
  | { name: 'form_submission_failed'; reason: string };

const ALLOWED_PROPS: Record<AnalyticsEvent['name'], readonly string[]> = {
  form_opened: ['source'],
  form_started: [],
  service_selected: ['service'],
  form_submission_succeeded: ['mode'],
  form_submission_failed: ['reason'],
};

/** Keep only allow-listed, short, identifier-like values. */
export function sanitiseEvent(event: AnalyticsEvent): Record<string, string> {
  const out: Record<string, string> = { event: event.name };
  for (const key of ALLOWED_PROPS[event.name]) {
    const value = (event as unknown as Record<string, unknown>)[key];
    if (typeof value === 'string' && /^[a-z0-9_-]{1,40}$/i.test(value)) out[key] = value;
  }
  return out;
}

export function track(event: AnalyticsEvent): void {
  const payload = sanitiseEvent(event);
  if (import.meta.env.DEV) console.debug('[analytics]', payload);
  if (!CONFIG.analyticsEndpoint || typeof navigator === 'undefined') return;
  const body = JSON.stringify(payload);
  if (!navigator.sendBeacon?.(CONFIG.analyticsEndpoint, body)) {
    void fetch(CONFIG.analyticsEndpoint, { method: 'POST', body, keepalive: true }).catch(() => {});
  }
}
