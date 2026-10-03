import type { CSSProperties } from 'react';
import { ArrowDown } from 'lucide-react';
import { BRAND, CTA } from '../data/content';
import { useScrollTo } from '../lib/scroll';
import { CtaButton } from './ui/CtaButton';
import { Wordmark } from './ui/Logo';

const delay = (seconds: number) => ({ '--delay': `${seconds}s` }) as CSSProperties;

interface HeroProps {
  onOpenEstimator: () => void;
}

export function Hero({ onOpenEstimator }: HeroProps) {
  const scrollTo = useScrollTo();

  return (
    <section
      id="hero"
      data-theme="light"
      className="dr-mb-160 dt:dr-mb-320 max-dt:dr-pb-16 relative flex h-svh flex-col justify-between dt:h-screen"
    >
      {/* Same box as the intro mark, so the curtain reveals it in place. */}
      <h1 className="mark-box">
        <Wordmark treatment="color" title={`${BRAND.name} — ${BRAND.descriptor}`} />
      </h1>

      <div className="layout-grid pt-[calc(var(--header-height)+var(--mark-h,18vw)*2)] [--mark-h:calc(100vw/1.1808*0.18075)]">
        <div className="col-[2/-1] text-end dt:col-[6/span_7]">
          {BRAND.headline.map((line, i) => (
            <div key={line} className="reveal" style={delay(0.1 + i * 0.04)}>
              <p className={`h3 ${i === 1 ? 'contrast' : ''}`}>{line}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="layout-grid dt:dr-pb-20 max-dt:dr-gap-12 items-end overflow-hidden">
        <div className="relative col-[1/span_2] max-dt:hidden">
          <span className="grow-line absolute inset-y-0 left-0 w-[calc(2*var(--px))] bg-signal" />
          <div className="dr-pl-16 dr-text-24 font-anton leading-none uppercase">
            <div className="reveal" style={delay(0.2)}>
              <p>scroll</p>
            </div>
            <div className="reveal" style={delay(0.24)}>
              <p>to explore</p>
            </div>
          </div>
        </div>

        <div className="p-s col-span-full max-dt:dr-mb-8 dt:col-[3/span_3]">
          {BRAND.descriptorLines.map((line, i) => (
            <div key={line} className="reveal" style={delay(0.2 + i * 0.04)}>
              <p>{i === 0 ? `${BRAND.name} — ${line}` : line}</p>
            </div>
          ))}
        </div>

        <CtaButton onClick={onOpenEstimator} className="rise col-span-full dt:col-[7/10]">
          {CTA.primary}
        </CtaButton>
        <CtaButton
          onClick={() => scrollTo('capabilities')}
          icon={<ArrowDown strokeWidth={1.5} />}
          className="rise col-span-full dt:col-[10/13]"
        >
          {CTA.secondary}
        </CtaButton>
      </div>
    </section>
  );
}
