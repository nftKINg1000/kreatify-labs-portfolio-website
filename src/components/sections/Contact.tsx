import { CONTACT_EMAIL, CTA, NEXT_STEPS, published } from '../../content';
import { useOpenLead } from '../../lib/leadContext';
import { CtaButton } from '../ui/CtaButton';
import { OwnerBadge } from '../ui/OwnerBadge';

export function Contact() {
  const openLead = useOpenLead();

  return (
    <section id="contact" data-theme="dark" aria-labelledby="contact-title" className="section section--dark contact" tabIndex={-1}>
      <div className="layout-grid section__head">
        <p className="eyebrow">Next step</p>
        <h2 id="contact-title" className="h1 section__title">
          Let’s discuss your product
        </h2>
      </div>

      <div className="layout-grid contact__body">
        <ol className="contact__steps">
          {published(NEXT_STEPS).map((step, i) => (
            <li key={step.title} className="contact__step">
              <OwnerBadge note={step.ownerInput} />
              <span className="p-xs muted" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="p-m semi-bold">{step.title}</h3>
              <p className="p-r">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="contact__actions">
          {/* Without JavaScript this falls back to email. */}
          <CtaButton href={`mailto:${CONTACT_EMAIL}`} onClick={openLead('contact')}>
            {CTA.primary}
          </CtaButton>
          <p className="p-r">
            Prefer email?{' '}
            <a className="link semi-bold" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
