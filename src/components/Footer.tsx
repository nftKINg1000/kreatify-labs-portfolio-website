import { CONTACT_EMAIL } from '../data/content';
import { useScrollTo } from '../lib/scroll';
import { CtaButton } from './ui/CtaButton';

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
          Kreatify is
          <br />
          <span className="contrast">open for projects</span>
        </p>

        <p className="h1 col-span-full self-end text-end dt:col-[4/-1] dt:row-start-2 dt:text-[length:calc(128*100/816*1vh)]">
          Let&apos;s build
          <br />
          something good
        </p>

        <CtaButton onClick={onOpenEstimator} className="col-span-full self-end dt:col-[1/4] dt:row-start-2">
          Start a project
        </CtaButton>
      </div>

      <div className="layout-block dr-gap-16 flex flex-wrap items-center justify-between">
        <div className="dr-gap-32 flex">
          <a href={`mailto:${CONTACT_EMAIL}`} className="link p-xs">
            {CONTACT_EMAIL}
          </a>
          <button onClick={() => scrollTo(0)} className="link p-xs">
            Back to top
          </button>
        </div>
        <p className="p-xs opacity-60">© {YEAR} Kreatify Labs</p>
      </div>
    </footer>
  );
}
