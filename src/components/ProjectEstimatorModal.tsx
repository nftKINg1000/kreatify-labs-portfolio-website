import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { CONTACT_EMAIL, ESTIMATOR_SERVICES } from '../data/content';
import { CtaButton } from './ui/CtaButton';
import { Modal } from './ui/Modal';

interface ProjectEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'p dr-py-12 w-full border-b border-white/20 bg-transparent outline-none transition-colors duration-500 placeholder:text-mist/70 focus:border-sky';

export function ProjectEstimatorModal({ isOpen, onClose }: ProjectEstimatorModalProps) {
  const [selected, setSelected] = useState<string[]>(['web-dev', 'motion']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));

  const total = ESTIMATOR_SERVICES.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + s.price, 0);

  // No backend yet: open a pre-filled email draft in the visitor's mail app.
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const services = ESTIMATOR_SERVICES.filter((s) => selected.includes(s.id)).map((s) => `- ${s.name}`);
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Services:',
      ...services,
      `Indicative estimate: ${total.toLocaleString()}`,
      '',
      'About the project:',
      notes || '-',
    ].join('\n');
    const subject = `Product discussion — ${name}`;
    window.location.assign(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setSubmitted(true);
  };

  const close = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={close} label="Project estimator">
      {submitted ? (
        <div className="dr-gap-24 dr-py-40 flex flex-col items-center text-center">
          <p className="h2">Draft ready</p>
          <p className="p max-w-[40ch]">
            We opened an email draft to <span className="contrast">{CONTACT_EMAIL}</span> with your selections.
            Nothing is sent until you press send in your mail app.
          </p>
          <CtaButton onClick={close} className="dr-w-240">
            Done
          </CtaButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="dr-gap-32 flex flex-col">
          <div className="dr-pr-48">
            <h3 className="h3">Project estimator</h3>
            <p className="p-r dr-mt-12 opacity-60">Pick what you need for an indicative estimate. Final scope is agreed after discovery.</p>
          </div>

          <fieldset className="dr-gap-8 flex flex-col">
            <legend className="sr-only">Services</legend>
            {ESTIMATOR_SERVICES.map((service) => {
              const isOn = selected.includes(service.id);
              return (
                <button
                  type="button"
                  key={service.id}
                  aria-pressed={isOn}
                  onClick={() => toggle(service.id)}
                  className={`dr-p-16 dr-rounded-8 dr-gap-16 flex items-center justify-between border text-left transition-colors duration-500 ${
                    isOn ? 'border-sky' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="dr-gap-12 p-r flex items-center">
                    <span
                      className={`dr-w-20 dr-h-20 dr-rounded-4 flex shrink-0 items-center justify-center border ${
                        isOn ? 'border-sky bg-sky text-navy' : 'border-white/40'
                      }`}
                    >
                      {isOn && <Check className="dr-w-16 dr-h-16" strokeWidth={3} />}
                    </span>
                    {service.name}
                  </span>
                  <span className="p-xs">+${service.price.toLocaleString()}</span>
                </button>
              );
            })}
          </fieldset>

          <div className="flex items-end justify-between border-t border-white/15 pt-[calc(16*var(--px))]">
            <span className="p-xs opacity-60">Estimate</span>
            <span className="h2 contrast">${total.toLocaleString()}</span>
          </div>

          <div className="dr-gap-16 grid grid-cols-1 dt:grid-cols-2">
            <input
              type="text"
              required
              placeholder="Your name"
              aria-label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            <input
              type="email"
              required
              placeholder="Email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <textarea
            rows={2}
            placeholder="Tell us about your project…"
            aria-label="Project details"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} resize-none`}
          />

          <button type="submit" className="cta cta-button">
            <span className="cta-button-icon">
              <Send strokeWidth={1.5} />
            </span>
            <span className="cta-button-label">
              <span>Prepare email draft</span>
              <span aria-hidden="true">Prepare email draft</span>
            </span>
          </button>
        </form>
      )}
    </Modal>
  );
}
