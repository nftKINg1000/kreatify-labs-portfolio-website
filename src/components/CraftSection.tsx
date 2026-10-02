import { useRef, useState, type CSSProperties } from 'react';
import { CONTACT_EMAIL, SERVICES } from '../data/content';
import { clamp, useScrollProgress } from '../lib/scroll';

interface CraftSectionProps {
  onOpenEstimator: () => void;
}

export function CraftSection({ onOpenEstimator }: CraftSectionProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(1);

  useScrollProgress(pinRef, (progress) => {
    const next = clamp(Math.floor(progress * SERVICES.length) + 1, 1, SERVICES.length);
    setVisible((current) => (current === next ? current : next));
  });

  return (
    <section id="services" data-theme="light" className="dr-pb-160 dt:dr-pt-40 relative bg-primary">
      <div className="layout-block dr-pt-80 dr-mb-160 dt:dr-mb-440">
        <p className="p-l">
          Kreatify is an independent, <span className="contrast semi-bold">design-driven studio</span> that turns
          ambitious ideas into <span className="contrast semi-bold">fast, fluid web experiences</span> — from first
          sketch to launch. We sweat the details so your users feel them.
        </p>
        <p className="p dr-mt-48 dt:dr-mt-64">
          Have a project in mind?{' '}
          <button onClick={onOpenEstimator} className="link contrast semi-bold">
            Start a project
          </button>{' '}
          or{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link contrast semi-bold">
            say hello
          </a>
          .
        </p>
      </div>

      <div ref={pinRef} className="h-[300vh] dt:h-[500vh]">
        <div className="layout-block sticky top-0 h-svh overflow-hidden p-(--safe) pt-[calc(var(--safe)+var(--header-height))] dt:h-screen">
          <div className="pb-(--safe) text-end dt:absolute dt:right-(--safe) dt:p-0">
            <p className="h3">
              Kreatify brings
              <br />
              <span className="grey">the details</span>
            </p>
          </div>

          <ol
            className="relative [--card:calc(343*var(--px))] dt:[--card:calc(4*var(--column-width)+3*var(--gap))]"
            style={{ '--count': SERVICES.length } as CSSProperties}
          >
            {SERVICES.map((service, i) => (
              <li
                key={service}
                style={{ '--i': i } as CSSProperties}
                className={`absolute top-[calc(((100svh-var(--header-height)-var(--card)-var(--safe)-4*var(--safe))/(var(--count)-1))*var(--i))] transition-[opacity,translate] duration-[1200ms] ease-out-expo will-change-transform dt:top-[calc(((100vh-var(--header-height)-var(--card)-2*var(--safe))/(var(--count)-1))*var(--i))] dt:left-[calc(((100vw-var(--card)-2*var(--safe))/(var(--count)-1))*var(--i))] ${
                  i < visible ? 'translate-0 opacity-100' : 'translate-full opacity-0'
                }`}
              >
                <div className="dr-p-24 flex aspect-square w-(--card) flex-col justify-between border border-current bg-[color-mix(in_oklab,var(--theme-primary)_70%,transparent)] backdrop-blur-[5px]">
                  <p className="h2 contrast">{String(i + 1).padStart(2, '0')}</p>
                  <p className="h4">{service}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
