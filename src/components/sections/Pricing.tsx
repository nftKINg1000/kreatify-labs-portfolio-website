import { PRICING, PRICING_META } from '../../content';
import type { PriceBasis } from '../../content/types';
import { useOpenLead } from '../../lib/leadContext';
import { CtaButton } from '../ui/CtaButton';

const BASIS_LABEL: Record<PriceBasis, string> = {
  fixed: 'Fixed price',
  'starting-at': 'Starting at',
  'typical-range': 'Typical range',
  indicative: 'Indicative',
};

export function Pricing() {
  const openLead = useOpenLead();

  return (
    <section id="pricing" data-theme="dark" aria-labelledby="pricing-title" className="section section--dark" tabIndex={-1}>
      <div className="layout-grid section__head">
        <p className="eyebrow">Engagement models</p>
        <h2 id="pricing-title" className="h2 section__title">
          Three ways to work together
        </h2>
        <p className="p section__intro">{PRICING_META.note}</p>
      </div>

      <ul className="layout-grid card-grid card-grid--3 pricing-grid">
        {PRICING.map((tier) => (
          <li
            key={tier.id}
            data-theme={tier.highlighted ? 'light' : 'dark'}
            className={`card pricing-card ${tier.highlighted ? 'pricing-card--highlighted' : ''}`}
            aria-labelledby={`tier-${tier.id}`}
          >
            <div className="pricing-card__head">
              <h3 id={`tier-${tier.id}`} className="p-s">
                {tier.label}
              </h3>
              {tier.highlighted && <span className="p-xs contrast">Popular</span>}
            </div>
            <p className="pricing-card__price">
              <span className="p-xs muted pricing-card__basis">{BASIS_LABEL[tier.basis]}</span>
              <span className="h2">
                {PRICING_META.currencyLabel}
                {tier.amount.toLocaleString('en-US')}
              </span>
              <span className="p-r muted">
                per {tier.unit} · {PRICING_META.currency}
              </span>
            </p>
            <p className="p-r">{tier.summary}</p>
            <p className="p-r">
              <strong className="semi-bold">Best for:</strong> {tier.bestFor}
            </p>
            <h4 className="p-xs muted">Included</h4>
            <ul className="tick-list p-r">
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {tier.excludes.length > 0 && (
              <>
                <h4 className="p-xs muted">Not included</h4>
                <ul className="cross-list p-r">
                  {tier.excludes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            <CtaButton href="#contact" onClick={openLead(`pricing-${tier.id}`)} className="pricing-card__cta">
              Discuss a {tier.label.toLowerCase()}
            </CtaButton>
          </li>
        ))}
      </ul>

      <p className="layout-block p-r pricing-fit">
        Not sure which fits? Choose <strong className="semi-bold">Project</strong> for one defined deliverable, <strong className="semi-bold">Product</strong> to build or
        harden an application, and <strong className="semi-bold">Retainer</strong> for continuous work after launch.
      </p>
    </section>
  );
}
