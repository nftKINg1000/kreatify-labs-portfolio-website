import { ArrowDown } from 'lucide-react';
import { BRAND, CTA, HERO_CUES } from '../../content';
import { useOpenLead } from '../../lib/leadContext';
import { CtaButton } from '../ui/CtaButton';
import { Wordmark } from '../ui/Logo';

const BLANK_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export function Hero() {
  const openLead = useOpenLead();

  return (
    <section id="top" data-theme="light" aria-labelledby="hero-title" className="hero" tabIndex={-1}>
      <h1 id="hero-title" className="hero__mark">
        <span className="sr-only">
          {BRAND.name}: {BRAND.descriptor}
        </span>
        <Wordmark treatment="color" decorative className="hero__wordmark" />
      </h1>

      <div className="hero__body layout-grid">
        <div className="hero__copy">
          <p className="h3 hero__headline">
            <span>{BRAND.headline[0]}</span> <span className="contrast">{BRAND.headline[1]}</span>
          </p>
          <p className="p-m hero__lede">{BRAND.valueProposition}</p>
          <div className="hero__actions">
            <CtaButton href="#contact" onClick={openLead('hero')}>
              {CTA.primary}
            </CtaButton>
            <CtaButton href="#capabilities" variant="secondary" icon={<ArrowDown strokeWidth={1.75} />}>
              {CTA.secondary}
            </CtaButton>
          </div>
        </div>

        {/* Static composition shown when the optional 3D scene is not running. */}
        {/* Below 64rem the image is hidden, so a 1px source keeps phones from downloading it. */}
        <picture className="hero__fallback">
          <source media="(max-width: 63.99rem)" srcSet={BLANK_PIXEL} />
          <img src="/images/statue-fallback.webp" alt="" width={464} height={833} decoding="async" />
        </picture>
      </div>

      <ul className="hero__cues layout-grid" aria-label="How we work">
        {HERO_CUES.map((cue) => (
          <li key={cue} className="p-s">
            {cue}
          </li>
        ))}
      </ul>
    </section>
  );
}
