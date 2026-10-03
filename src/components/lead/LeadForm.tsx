import { useId, useRef, useState, type FormEvent } from 'react';
import { CONTACT_EMAIL, PRICING, PRICING_META } from '../../content';
import { track } from '../../lib/analytics';
import { endpointProvider, type LeadProvider, type SubmitOutcome } from '../../lib/leadProvider';
import {
  BUDGET_OPTIONS,
  EMPTY_LEAD,
  ENGAGEMENT_OPTIONS,
  LIMITS,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
  validateLead,
  type LeadField,
  type LeadInput,
  type ServiceId,
} from '../../shared/lead';

/** Draft survives closing and reopening the dialog within the page session (memory only). */
let draft: LeadInput = { ...EMPTY_LEAD };

/** Clear the in-memory draft (used by tests). */
// eslint-disable-next-line react/only-export-components
export function resetLeadDraft() {
  draft = { ...EMPTY_LEAD };
}

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'done'; outcome: Extract<SubmitOutcome, { status: 'delivered' | 'dev-log' }> }
  | { kind: 'error'; outcome: Extract<SubmitOutcome, { status: 'offline' | 'failed' }> };

const FIELD_ORDER: LeadField[] = ['name', 'email', 'company', 'engagement', 'services', 'budget', 'timeline', 'message'];

const formatPrice = (amount: number) => `${PRICING_META.currencyLabel}${amount.toLocaleString('en-US')}`;

function mailtoFor(lead: LeadInput): string {
  const body = [
    lead.message,
    '',
    lead.engagement && `Engagement: ${lead.engagement}`,
    lead.services.length > 0 && `Services: ${lead.services.join(', ')}`,
    lead.budget && `Budget: ${lead.budget}`,
    lead.timeline && `Timeline: ${lead.timeline}`,
    lead.company && `Company: ${lead.company}`,
  ]
    .filter(Boolean)
    .join('\n');
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Product discussion${lead.name ? ` — ${lead.name}` : ''}`)}&body=${encodeURIComponent(body)}`;
}

const FAILURE_COPY: Record<Extract<SubmitOutcome, { status: 'failed' }>['reason'] | 'offline', string> = {
  offline: 'You appear to be offline. Your answers are kept here — reconnect and try again, or email us instead.',
  network: 'The connection failed before your enquiry reached us. Your answers are kept — try again, or email us instead.',
  timeout: 'The request timed out, so we cannot confirm it arrived. Your answers are kept — try again, or email us instead.',
  server: 'Something went wrong on our side and your enquiry was not sent. Your answers are kept — try again, or email us instead.',
  delivery_failed: 'We could not deliver your enquiry. Your answers are kept — try again, or email us instead.',
  not_configured: 'Online enquiries are not available right now, so nothing was sent. Please email us — your answers are prefilled.',
  rate_limited: 'Too many attempts in a short time. Wait a few minutes and try again, or email us instead.',
};

interface LeadFormProps {
  provider?: LeadProvider;
  onDone?: () => void;
}

export function LeadForm({ provider = endpointProvider(), onDone }: LeadFormProps) {
  const [lead, setLead] = useState<LeadInput>(draft);
  const [errors, setErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const started = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;

  const update = <K extends keyof LeadInput>(field: K, value: LeadInput[K]) => {
    if (!started.current) {
      started.current = true;
      track({ name: 'form_started' });
    }
    setLead((current) => {
      const next = { ...current, [field]: value };
      draft = next;
      return next;
    });
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleService = (service: ServiceId, checked: boolean) => {
    if (checked) track({ name: 'service_selected', service });
    update('services', checked ? [...lead.services, service] : lead.services.filter((s) => s !== service));
  };

  const tier = PRICING.find((t) => t.id === lead.engagement);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === 'submitting') return;

    const validation = validateLead(lead);
    if (!validation.ok) {
      setErrors(validation.errors);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setErrors({});
    setStatus({ kind: 'submitting' });
    const outcome = await provider.submit(validation.lead);

    if (outcome.status === 'delivered' || outcome.status === 'dev-log') {
      track({ name: 'form_submission_succeeded', mode: outcome.status === 'delivered' ? 'delivered' : 'dev-log' });
      draft = { ...EMPTY_LEAD };
      setStatus({ kind: 'done', outcome });
    } else if (outcome.status === 'invalid') {
      track({ name: 'form_submission_failed', reason: 'validation' });
      setErrors(outcome.errors);
      setStatus({ kind: 'idle' });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    } else {
      track({ name: 'form_submission_failed', reason: outcome.status === 'offline' ? 'offline' : outcome.reason });
      setStatus({ kind: 'error', outcome });
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  if (status.kind === 'done') {
    const delivered = status.outcome.status === 'delivered';
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="lead-result">
        <p className="h3">{delivered ? 'Enquiry sent' : 'Not sent (development mode)'}</p>
        <p className="p">
          {delivered
            ? `We received your enquiry (reference ${status.outcome.reference}) and will reply by email.`
            : `The local development endpoint logged this enquiry (reference ${status.outcome.reference}) but did not deliver it. Configure a production transport to send enquiries.`}
        </p>
        {onDone && (
          <button type="button" className="cta cta-button" onClick={onDone}>
            <span className="cta-button-label">
              <span>Close</span>
              <span aria-hidden="true">Close</span>
            </span>
          </button>
        )}
      </div>
    );
  }

  const errorEntries = FIELD_ORDER.filter((field) => errors[field]);
  const describedBy = (field: LeadField, hint?: string) => [hint, errors[field] && id(`${field}-error`)].filter(Boolean).join(' ') || undefined;
  const submitting = status.kind === 'submitting';

  return (
    <form noValidate onSubmit={onSubmit} className="lead-form" aria-describedby={id('privacy')} aria-busy={submitting}>
      {errorEntries.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="form-errors">
          <p className="p-s">Check {errorEntries.length === 1 ? 'this field' : `these ${errorEntries.length} fields`}:</p>
          <ul>
            {errorEntries.map((field) => (
              <li key={field}>
                <a
                  href={`#${id(field)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id(field))?.focus();
                  }}
                >
                  {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status.kind === 'error' && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="form-failure">
          <p className="p">{FAILURE_COPY[status.outcome.status === 'offline' ? 'offline' : status.outcome.reason]}</p>
          <p className="p-r">
            <a className="link semi-bold" href={mailtoFor(lead)}>
              Email {CONTACT_EMAIL} with your answers
            </a>
          </p>
        </div>
      )}

      <p className="p-r muted">
        Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      <div className="field-row">
        <div className="field">
          <label htmlFor={id('name')} className="field-label">
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            id={id('name')}
            name="name"
            autoComplete="name"
            required
            maxLength={LIMITS.name}
            value={lead.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
          />
          {errors.name && <p id={id('name-error')} className="field-error">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor={id('email')} className="field-label">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id={id('email')}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={LIMITS.email}
            value={lead.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
          />
          {errors.email && <p id={id('email-error')} className="field-error">{errors.email}</p>}
        </div>
      </div>

      <div className="field">
        <label htmlFor={id('company')} className="field-label">
          Company <span className="muted">(optional)</span>
        </label>
        <input
          id={id('company')}
          name="company"
          autoComplete="organization"
          maxLength={LIMITS.company}
          value={lead.company}
          onChange={(e) => update('company', e.target.value)}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={describedBy('company')}
        />
        {errors.company && <p id={id('company-error')} className="field-error">{errors.company}</p>}
      </div>

      <fieldset className="field">
        <legend className="field-label">
          Engagement model <span className="muted">(optional)</span>
        </legend>
        <div className="choice-grid" id={id('engagement')}>
          {ENGAGEMENT_OPTIONS.map((option) => (
            <label key={option.id} className="choice">
              <input
                type="radio"
                name="engagement"
                value={option.id}
                checked={lead.engagement === option.id}
                onChange={() => update('engagement', option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <p className="field-hint" aria-live="polite">
          {tier
            ? `${tier.label} engagements are indicatively priced at ${formatPrice(tier.amount)} per ${tier.unit}. This is not a quote — scope and price are confirmed in a written proposal.`
            : 'Not sure? Leave it blank — we will suggest a model after reading your enquiry.'}
        </p>
      </fieldset>

      <fieldset className="field">
        <legend className="field-label">
          What do you need help with? <span className="muted">(optional)</span>
        </legend>
        <div className="choice-grid choice-grid--wide" id={id('services')}>
          {SERVICE_OPTIONS.map((option) => (
            <label key={option.id} className="choice">
              <input
                type="checkbox"
                name="services"
                value={option.id}
                checked={lead.services.includes(option.id)}
                onChange={(e) => toggleService(option.id, e.target.checked)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field-row">
        <div className="field">
          <label htmlFor={id('budget')} className="field-label">
            Budget range <span className="muted">(optional)</span>
          </label>
          <select id={id('budget')} name="budget" value={lead.budget} onChange={(e) => update('budget', e.target.value as LeadInput['budget'])}>
            <option value="">Select a range</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id('timeline')} className="field-label">
            Timeline <span className="muted">(optional)</span>
          </label>
          <select id={id('timeline')} name="timeline" value={lead.timeline} onChange={(e) => update('timeline', e.target.value as LeadInput['timeline'])}>
            <option value="">Select a timeline</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={id('message')} className="field-label">
          What are you building or improving? <span aria-hidden="true">*</span>
        </label>
        <p id={id('message-hint')} className="field-hint">
          A few sentences on the goal, where you are now and any deadline. At least {LIMITS.messageMin} characters.
        </p>
        <textarea
          id={id('message')}
          name="message"
          rows={5}
          required
          maxLength={LIMITS.message}
          value={lead.message}
          onChange={(e) => update('message', e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message', id('message-hint'))}
        />
        {errors.message && <p id={id('message-error')} className="field-error">{errors.message}</p>}
      </div>

      {/* Honeypot: hidden from people and assistive technology. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor={id('website')}>Leave this field empty</label>
        <input id={id('website')} name="kl_website" tabIndex={-1} autoComplete="off" value={lead.website} onChange={(e) => update('website', e.target.value)} />
      </div>

      <p id={id('privacy')} className="p-r muted">
        Your answers are sent to KreatifyLabs only to reply to this enquiry. They are not added to analytics.
      </p>

      <button type="submit" className="cta cta-button" disabled={submitting} aria-describedby={id('submit-status')}>
        <span className="cta-button-label">
          <span>{submitting ? 'Sending…' : status.kind === 'error' ? 'Try again' : 'Send enquiry'}</span>
          <span aria-hidden="true">{submitting ? 'Sending…' : status.kind === 'error' ? 'Try again' : 'Send enquiry'}</span>
        </span>
      </button>
      <p id={id('submit-status')} className="sr-only" aria-live="polite">
        {submitting ? 'Sending your enquiry.' : ''}
      </p>
    </form>
  );
}
