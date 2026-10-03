import { describe, expect, it } from 'vitest';
import { CAPABILITIES, FAQ, LIFECYCLE, PRICING, PRINCIPLES, published, BRAND } from './index';
import { SERVICE_OPTIONS } from '../shared/lead';
import { sanitiseEvent } from '../lib/analytics';

describe('content model', () => {
  it('keeps the brand essentials', () => {
    expect(BRAND.name).toBe('KreatifyLabs');
    expect(BRAND.headline.join(' ')).toBe('Intelligence, made useful.');
    expect(PRINCIPLES).toEqual(['Useful before novel.', 'Clear before complex.', 'Responsible about automation.', 'Accountable for delivery.']);
    expect(LIFECYCLE.map((s) => s.step)).toEqual(['Define', 'Design', 'Engineer', 'Validate', 'Deploy', 'Evolve']);
    expect(CAPABILITIES).toHaveLength(6);
  });

  it('keeps the form services aligned with the six capability families', () => {
    expect(SERVICE_OPTIONS.map((s) => s.id)).toEqual(CAPABILITIES.map((c) => c.id));
  });

  it('labels every price basis and keeps the studio prices', () => {
    expect(PRICING.map((t) => [t.id, t.amount, t.unit])).toEqual([
      ['project', 4500, 'project'],
      ['product', 9800, 'project'],
      ['retainer', 12000, 'month'],
    ]);
    PRICING.forEach((tier) => expect(['fixed', 'starting-at', 'typical-range', 'indicative']).toContain(tier.basis));
  });

  it('hides owner-input items from production', () => {
    const drafts = FAQ.filter((f) => f.ownerInput);
    expect(drafts.length).toBeGreaterThan(0);
    expect(published(FAQ, false)).toHaveLength(FAQ.length - drafts.length);
    expect(published(FAQ, true)).toHaveLength(FAQ.length);
  });
});

describe('analytics', () => {
  it('drops anything outside the allow-list, including free text that could contain PII', () => {
    expect(sanitiseEvent({ name: 'form_submission_failed', reason: 'ada@example.com' })).toEqual({ event: 'form_submission_failed' });
    expect(sanitiseEvent({ name: 'service_selected', service: 'ai-engineering' })).toEqual({ event: 'service_selected', service: 'ai-engineering' });
    expect(sanitiseEvent({ name: 'form_started', email: 'x' } as never)).toEqual({ event: 'form_started' });
  });
});
