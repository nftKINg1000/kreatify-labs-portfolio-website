import type { CSSProperties } from 'react';
import { ArrowDown } from 'lucide-react';
import { CtaButton } from './ui/CtaButton';
import { FitText } from './ui/FitText';
import { useScrollTo } from '../lib/scroll';

const delay = (seconds: number) => ({ '--delay': `${seconds}s` }) as CSSProperties;

interface HeroProps {
  onOpenEstimator: () => void;
}

export function Hero({ onOpenEstimator }: HeroProps) {
  const scrollTo = useScrollTo();

  return (
    <section
      id="hero"
      data-theme="dark"
      className="dr-mb-160 dt:dr-mb-320 max-dt:dr-pb-16 relative flex h-svh flex-col justify-between pt-(--header-height) dt:h-screen"
    >
      <div className="layout-grid">
        <h1 className="dr-mt-30 col-span-full font-anton leading-[0.8] uppercase">
          <span className="reveal block">
            <FitText>Kreatify</FitText>
          </span>
        </h1>

        <div className="dr-mt-24 col-[2/-1] text-end dt:col-[6/span_7]">
          <div className="reveal" style={delay(0.15)}>
            <p className="h3">Web Studio</p>
          </div>
        </div>
      </div>

      <div className="layout-grid dt:dr-pb-20 max-dt:dr-gap-12 items-end overflow-hidden">
        <div className="relative col-[1/span_2] max-dt:hidden">
          <span className="grow-line absolute inset-y-0 left-0 w-[calc(2*var(--px))] bg-pink" />
          <div className="dr-pl-16 dr-text-24 font-anton leading-none uppercase">
            <div className="reveal" style={delay(0.2)}>
              <p>scroll</p>
            </div>
            <div className="reveal" style={delay(0.25)}>
              <p>to explore</p>
            </div>
          </div>
        </div>

        <div className="p-s col-span-full max-dt:dr-mb-8 dt:col-[3/span_3]">
          <div className="reveal" style={delay(0.2)}>
            <p>The design-driven web studio</p>
          </div>
          <div className="reveal" style={delay(0.25)}>
            <p>
              crafting fluid, fast web experiences
            </p>
          </div>
        </div>

        <CtaButton onClick={onOpenEstimator} className="rise col-span-full dt:col-[7/10]">
          Start a project
        </CtaButton>
        <CtaButton
          onClick={() => scrollTo('work')}
          icon={<ArrowDown strokeWidth={1.5} />}
          className="rise col-span-full dt:col-[10/13]"
        >
          Showcase
        </CtaButton>
      </div>
    </section>
  );
}
