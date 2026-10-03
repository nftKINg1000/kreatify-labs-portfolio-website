import { describe, expect, it } from 'vitest';
import { LIMITS, normaliseLead, validateLead } from './lead';

const valid = {
  name: 'Ada Lovelace',
  email: 'Ada@Example.com',
  company: 'Analytical Engines',
  engagement: 'product',
  services: ['ai-engineering', 'ai-engineering', 'not-a-service'],
  budget: '10k-25k',
  timeline: '1-3-months',
  message: 'We have a prototype that needs production hardening.',
  website: '',
};

describe('normaliseLead', () => {
  it('trims, lower-cases email, drops unknown options and de-duplicates services', () => {
    const lead = normaliseLead({ ...valid, name: '  Ada  ', engagement: 'bogus', extra: 'ignored' });
    expect(lead.name).toBe('Ada');
    expect(lead.email).toBe('ada@example.com');
    expect(lead.engagement).toBe('');
    expect(lead.services).toEqual(['ai-engineering']);
    expect(lead).not.toHaveProperty('extra');
  });

  it('strips control characters but keeps newlines in the message', () => {
    const lead = normaliseLead({ ...valid, name: 'Ada\u0000\u0007', message: 'Line one\nLine two\u0000' });
    expect(lead.name).toBe('Ada');
    expect(lead.message).toBe('Line one\nLine two');
  });

  it('handles non-object input safely', () => {
    expect(normaliseLead(null).name).toBe('');
    expect(normaliseLead('nonsense').services).toEqual([]);
  });
});

describe('validateLead', () => {
  it('accepts a complete enquiry', () => {
    const result = validateLead(valid);
    expect(result.ok).toBe(true);
  });

  it('requires name, email and a meaningful message', () => {
    const result = validateLead({ name: '', email: '', message: 'short' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toMatch(/name/i);
      expect(result.errors.email).toMatch(/email/i);
      expect(result.errors.message).toMatch(/at least/i);
    }
  });

  it.each(['plainaddress', 'a@b', 'a b@c.com', '<a@b.com>'])('rejects invalid email %s', (email) => {
    const result = validateLead({ ...valid, email });
    expect(result.ok).toBe(false);
  });

  it('enforces length limits', () => {
    const result = validateLead({ ...valid, message: 'x'.repeat(LIMITS.message + 1), name: 'n'.repeat(LIMITS.name + 1) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.message).toBeDefined();
      expect(result.errors.name).toBeDefined();
    }
  });
});
