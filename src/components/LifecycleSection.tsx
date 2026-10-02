import { useRef, useState, type CSSProperties } from 'react';
import { BRAND, CONTACT_EMAIL, CTA, LIFECYCLE } from '../data/content';
import { clamp, useScrollProgress } from '../lib/scroll';

interface LifecycleSectionProps {
  onOpenEstimator: () => void;
}

/** Boilerplate statement, then the six lifecycle stages stacking in as you scroll (lenis.dev "Lenis brings the heat"). */
export function LifecycleSection({ onOpenEstimator }: LifecycleSectionProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(1);

  useScrollProgress(pinRef, (progress) => {
    const next = clamp(Math.floor(progress * LIFECYCLE.length) + 1, 1, LIFECYCLE.length);
    setVisible((current) => (current === next ? current : next));
  });

  return (
    <section id="approach" data-theme="dark" className="dr-pb-160 dt:dr-pt-40 relative bg-primary">
      <div className="layout-block dr-pt-80 dr-mb-160 dt:dr-mb-440">
        <p className="p-l">
          {BRAND.name} is an <span className="contrast semi-bold">{BRAND.descriptor}</span>. We combine AI engineering,
          full-stack development, creative technology and automation to turn ideas and complex business problems into{' '}
          <span className="contrast semi-bold">production-ready digital systems</span>.
        </p>
        <p className="p dr-mt-48 dt:dr-mt-64">
          Have an idea, a prototype or a manual process?{' '}
          <button onClick={onOpenEstimator} className="link contrast semi-bold">
            {CTA.primary}
          </button>{' '}
          or{' '}
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Map our workflow')}`} className="link contrast semi-bold">
            {CTA.automation.toLowerCase()}
          </a>
          .
        </p>
      </div>

      <div ref={pinRef} className="h-[300vh] dt:h-[500vh]">
        <div className="layout-block sticky top-0 h-svh overflow-hidden p-(--safe) pt-[calc(var(--safe)+var(--header-height))] dt:h-screen">
          <div className="pb-(--safe) text-end dt:absolute dt:right-(--safe) dt:p-0">
            <p className="h3">
              From idea
              <br />
              <span className="muted">to production</span>
            </p>
          </div>

          <ol
            className="relative [--card:calc(343*var(--px))] dt:[--card:calc(4*var(--column-width)+3*var(--gap))]"
            style={{ '--count': LIFECYCLE.length } as CSSProperties}
          >
            {LIFECYCLE.map((stage, i) => (
              <li
                key={stage.step}
                style={{ '--i': i } as CSSProperties}
                className={`absolute top-[calc(((100svh-var(--header-height)-var(--card)-var(--safe)-4*var(--safe))/(var(--count)-1))*var(--i))] transition-[opacity,translate] duration-[1200ms] ease-out-expo will-change-transform dt:top-[calc(((100vh-var(--header-height)-var(--card)-2*var(--safe))/(var(--count)-1))*var(--i))] dt:left-[calc(((100vw-var(--card)-2*var(--safe))/(var(--count)-1))*var(--i))] ${
                  i < visible ? 'translate-0 opacity-100' : 'translate-full opacity-0'
                }`}
              >
                <div className="dr-p-24 flex aspect-square w-(--card) flex-col justify-between border border-sky/40 bg-[color-mix(in_oklab,var(--color-navy)_80%,transparent)] backdrop-blur-[5px]">
                  <p className="h2">{String(i + 1).padStart(2, '0')}</p>
                  <div>
                    <p className="h4">{stage.step}</p>
                    <p className="p-r dr-mt-12 muted">{stage.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
