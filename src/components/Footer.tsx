import { BRAND, CONTACT_EMAIL, CTA } from '../data/content';
import { useScrollTo } from '../lib/scroll';
import { CtaButton } from './ui/CtaButton';
import { Wordmark } from './ui/Logo';

interface FooterProps {
  onOpenEstimator: () => void;
}

const YEAR = new Date().getFullYear();

export function Footer({ onOpenEstimator }: FooterProps) {
  const scrollTo = useScrollTo();

  return (
    <footer
      data-theme="dark"
      className="dr-pb-20 dt:dr-pt-60 relative z-1 flex min-h-svh flex-col justify-between bg-primary pt-[calc(var(--safe)+var(--header-height))]"
    >
      <div className="layout-grid dr-pb-40 dr-gap-y-32 grow grid-rows-[1fr_auto]">
        <p className="h1 col-span-full self-start dt:text-[length:calc(128*100/816*1vh)]">
          {BRAND.headline[0]}
          <br />
          <span className="contrast">{BRAND.headline[1]}</span>
        </p>

        <p className="h1 col-span-full self-end text-end dt:col-[4/-1] dt:row-start-2 dt:text-[length:calc(128*100/816*1vh)]">
          Let&apos;s discuss
          <br />
          your product
        </p>

        <CtaButton onClick={onOpenEstimator} className="col-span-full self-end dt:col-[1/4] dt:row-start-2">
          {CTA.primary}
        </CtaButton>
      </div>

      <div className="layout-block dr-gap-16 flex flex-wrap items-center justify-between">
        {/* Approved white reverse wordmark on Deep Navy, above the 160px digital minimum. */}
        <Wordmark treatment="white" className="dr-w-160 min-w-40 h-auto" />
        <div className="dr-gap-32 flex flex-wrap">
          <a href={`mailto:${CONTACT_EMAIL}`} className="link p-xs">
            {CONTACT_EMAIL}
          </a>
          <button onClick={() => scrollTo(0)} className="link p-xs">
            Back to top
          </button>
        </div>
        <p className="p-xs muted">
          © {YEAR} {BRAND.name} · {BRAND.descriptor}
        </p>
      </div>
    </footer>
  );
}
