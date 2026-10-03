import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadForm, resetLeadDraft } from './LeadForm';
import type { LeadProvider, SubmitOutcome } from '../../lib/leadProvider';
import * as analytics from '../../lib/analytics';

const provider = (...outcomes: SubmitOutcome[]): LeadProvider & { submit: ReturnType<typeof vi.fn> } => {
  const submit = vi.fn();
  outcomes.forEach((outcome) => submit.mockResolvedValueOnce(outcome));
  return { submit };
};

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^name/i), 'Ada Lovelace');
  await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
  await user.type(screen.getByLabelText(/what are you building/i), 'We need our prototype hardened for production.');
}

describe('LeadForm', () => {
  beforeEach(() => resetLeadDraft());

  it('shows field errors and a focusable summary instead of submitting invalid data', async () => {
    const user = userEvent.setup();
    const p = provider();
    render(<LeadForm provider={p} />);

    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(p.submit).not.toHaveBeenCalled();
    const summary = await screen.findByRole('alert');
    expect(summary).toHaveTextContent(/check these 3 fields/i);
    expect(screen.getByLabelText(/^name/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/^email/i)).toHaveAccessibleDescription(/enter your email/i);
  });

  it('announces success only when the server confirms delivery', async () => {
    const user = userEvent.setup();
    render(<LeadForm provider={provider({ status: 'delivered', reference: 'KL-1' })} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/enquiry sent.*KL-1/is);
  });

  it('says plainly that dev-mode submissions were not delivered', async () => {
    const user = userEvent.setup();
    render(<LeadForm provider={provider({ status: 'dev-log', reference: 'KL-DEV' })} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/not sent/i);
    expect(status).not.toHaveTextContent(/enquiry sent/i);
  });

  it('keeps the data after a network failure, offers email with prefilled answers, and retries', async () => {
    const user = userEvent.setup();
    const p = provider({ status: 'failed', reason: 'network' }, { status: 'delivered', reference: 'KL-2' });
    render(<LeadForm provider={p} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/answers are kept/i);
    const email = screen.getByRole('link', { name: /email hello@kreatifylabs\.com/i });
    expect(email.getAttribute('href')).toContain(encodeURIComponent('We need our prototype hardened'));
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Ada Lovelace');

    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(p.submit).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('status')).toHaveTextContent(/enquiry sent/i);
  });

  it('handles offline and not-configured endpoints without claiming success', async () => {
    const user = userEvent.setup();
    render(<LeadForm provider={provider({ status: 'offline' })} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/offline/i);
  });

  it('shows the indicative price for a chosen engagement, never a summed quote', async () => {
    const user = userEvent.setup();
    render(<LeadForm provider={provider()} />);
    await user.click(screen.getByRole('radio', { name: 'Product' }));
    expect(screen.getByText(/indicatively priced at US\$9,800 per project\. This is not a quote/i)).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'AI engineering' }));
    await user.click(screen.getByRole('checkbox', { name: 'Business automation' }));
    expect(screen.queryByText(/total/i)).not.toBeInTheDocument();
  });

  it('sends only PII-free analytics events', async () => {
    const user = userEvent.setup();
    const track = vi.spyOn(analytics, 'track');
    render(<LeadForm provider={provider({ status: 'delivered', reference: 'KL-3' })} />);
    await fillValid(user);
    await user.click(screen.getByRole('checkbox', { name: 'AI engineering' }));
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    await screen.findByRole('status');
    const payloads = JSON.stringify(track.mock.calls);
    expect(payloads).not.toMatch(/Ada|example\.com|prototype hardened/);
    expect(track.mock.calls.map(([e]) => e.name)).toEqual(
      expect.arrayContaining(['form_started', 'service_selected', 'form_submission_succeeded']),
    );
  });
});
