/*
  Lead (enquiry) payload: types, options and validation shared by the browser form
  and the server handler. Dependency-free so it can run in any runtime.
  Keep this file free of imports so server code can load it directly.
*/

export const ENGAGEMENT_OPTIONS = [
  { id: 'project', label: 'Project' },
  { id: 'product', label: 'Product' },
  { id: 'retainer', label: 'Retainer' },
  { id: 'unsure', label: 'Not sure yet' },
] as const;

export const SERVICE_OPTIONS = [
  { id: 'product-definition', label: 'Product definition' },
  { id: 'ai-engineering', label: 'AI engineering' },
  { id: 'product-engineering', label: 'Product engineering' },
  { id: 'business-automation', label: 'Business automation' },
  { id: 'creative-technology', label: 'Creative technology' },
  { id: 'production-evolution', label: 'Production evolution' },
] as const;

/** Visitor-selected ranges in US dollars. These describe the visitor's budget, not a quote. */
export const BUDGET_OPTIONS = [
  { id: 'under-5k', label: 'Under US$5,000' },
  { id: '5k-10k', label: 'US$5,000–10,000' },
  { id: '10k-25k', label: 'US$10,000–25,000' },
  { id: '25k-plus', label: 'US$25,000 or more' },
  { id: 'unsure', label: 'Not sure yet' },
] as const;

export const TIMELINE_OPTIONS = [
  { id: 'asap', label: 'As soon as possible' },
  { id: '1-3-months', label: 'Within 1–3 months' },
  { id: '3-6-months', label: 'Within 3–6 months' },
  { id: 'exploring', label: 'Just exploring' },
] as const;

export type EngagementId = (typeof ENGAGEMENT_OPTIONS)[number]['id'];
export type ServiceId = (typeof SERVICE_OPTIONS)[number]['id'];
export type BudgetId = (typeof BUDGET_OPTIONS)[number]['id'];
export type TimelineId = (typeof TIMELINE_OPTIONS)[number]['id'];

export interface LeadInput {
  name: string;
  email: string;
  company: string;
  engagement: EngagementId | '';
  services: ServiceId[];
  budget: BudgetId | '';
  timeline: TimelineId | '';
  message: string;
  /** Honeypot: hidden from people; bots tend to fill it. Must stay empty. */
  website: string;
}

export type LeadField = Exclude<keyof LeadInput, 'website'>;

export const LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  message: 4000,
  messageMin: 20,
} as const;

export const EMPTY_LEAD: LeadInput = {
  name: '',
  email: '',
  company: '',
  engagement: '',
  services: [],
  budget: '',
  timeline: '',
  message: '',
  website: '',
};

export type LeadValidation =
  | { ok: true; lead: LeadInput }
  | { ok: false; errors: Partial<Record<LeadField, string>> };

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

/** Remove control characters (except newlines/tabs in the message), collapse outer whitespace. */
function clean(value: unknown, { multiline = false } = {}): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  const stripped = multiline ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') : value.replace(/[\u0000-\u001F\u007F]/g, ' ');
  return stripped.normalize('NFC').trim();
}

function pick<T extends string>(value: unknown, allowed: readonly { id: T }[]): T | '' {
  return typeof value === 'string' && allowed.some((option) => option.id === value) ? (value as T) : '';
}

/** Normalise untrusted input into a LeadInput shape (unknown keys dropped). */
export function normaliseLead(raw: unknown): LeadInput {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const services = Array.isArray(source.services)
    ? [...new Set(source.services.map((s) => pick(s, SERVICE_OPTIONS)).filter((s): s is ServiceId => s !== ''))]
    : [];

  return {
    name: clean(source.name),
    email: clean(source.email).toLowerCase(),
    company: clean(source.company),
    engagement: pick(source.engagement, ENGAGEMENT_OPTIONS),
    services,
    budget: pick(source.budget, BUDGET_OPTIONS),
    timeline: pick(source.timeline, TIMELINE_OPTIONS),
    message: clean(source.message, { multiline: true }),
    website: clean(source.website),
  };
}

/** Validate a lead. Messages are written for people and shown next to the field. */
export function validateLead(raw: unknown): LeadValidation {
  const lead = normaliseLead(raw);
  const errors: Partial<Record<LeadField, string>> = {};

  if (!lead.name) errors.name = 'Enter your name.';
  else if (lead.name.length > LIMITS.name) errors.name = `Use ${LIMITS.name} characters or fewer.`;

  if (!lead.email) errors.email = 'Enter your email address.';
  else if (lead.email.length > LIMITS.email || !EMAIL_PATTERN.test(lead.email))
    errors.email = 'Enter an email address in the format name@example.com.';

  if (lead.company.length > LIMITS.company) errors.company = `Use ${LIMITS.company} characters or fewer.`;

  if (!lead.message) errors.message = 'Tell us briefly what you want to build or improve.';
  else if (lead.message.length < LIMITS.messageMin)
    errors.message = `Add a little more detail (at least ${LIMITS.messageMin} characters).`;
  else if (lead.message.length > LIMITS.message) errors.message = `Use ${LIMITS.message} characters or fewer.`;

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, lead };
}

/** Server response contract. `delivered` is true only when a delivery transport confirmed receipt. */
export type LeadResponse =
  | { ok: true; delivered: true; reference: string }
  | { ok: true; delivered: false; reference: string; mode: 'dev-log' }
  | {
      ok: false;
      code: 'validation' | 'rate_limited' | 'not_configured' | 'delivery_failed' | 'bad_request';
      errors?: Partial<Record<LeadField, string>>;
    };
