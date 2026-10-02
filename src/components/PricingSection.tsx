import { PRICING } from '../data/content';
import { CtaButton } from './ui/CtaButton';

interface PricingSectionProps {
  onOpenEstimator: () => void;
}

export function PricingSection({ onOpenEstimator }: PricingSectionProps) {
  return (
    <section id="pricing" data-theme="light" className="dr-pb-160 dt:dr-pb-240 relative bg-primary">
      <div className="layout-grid dr-mb-48 dt:dr-mb-80">
        <h2 className="h2 col-span-full dt:col-[1/span_6]">Engagements</h2>
        <p className="p dr-mt-24 col-span-full self-end dt:col-[7/span_4] dt:mt-0">
          Three ways to work together. Every engagement starts with a free call to scope the work.
        </p>
      </div>

      <div className="layout-grid dr-gap-y-16">
        {PRICING.map((tier) => (
          <article
            key={tier.label}
            data-theme={tier.highlighted ? 'dark' : 'light'}
            className="dr-p-24 dr-rounded-12 dr-gap-32 col-span-full flex flex-col justify-between border border-current bg-primary dt:col-span-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="p-xs">{tier.label}</p>
                {tier.highlighted && <p className="p-xs contrast">Most popular</p>}
              </div>
              <p className="h2 dr-mt-32">{tier.price}</p>
              <p className="p-r dr-mt-8 opacity-60">{tier.suffix}</p>
              <p className="p dr-mt-24">{tier.description}</p>
              <ul className="dr-mt-24 dr-gap-8 flex flex-col">
                {tier.features.map((feature) => (
                  <li key={feature} className="p-r dr-gap-12 flex items-center">
                    <span className="dr-w-12 h-px shrink-0 bg-pink" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <CtaButton onClick={onOpenEstimator}>Get started</CtaButton>
          </article>
        ))}
      </div>
    </section>
  );
}
