import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CAPABILITIES, CTA, type Capability } from '../data/content';
import { useIsDesktop, useScrollProgress } from '../lib/scroll';
import { CtaButton } from './ui/CtaButton';
import { Modal } from './ui/Modal';

interface CapabilitiesShowcaseProps {
  onOpenEstimator: () => void;
}

// First and last cards are inset by half the grid so the strip starts and ends centred.
const EDGE = 'calc(6 * var(--column-width) + 6 * var(--gap) + var(--safe))';

/** Supporting graphics from brand guide p.18 — the cut, the plane and the channel. Never the A. */
function PlaneArt({ art }: { art: Capability['art'] }) {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden="true">
      <g transform="translate(40 70) scale(0.8)">
      {art === 'cut' && <polygon points="56,64 300,64 196,244 56,244" fill="var(--color-navy)" />}
      {art === 'plane' && (
        <>
          <polygon points="56,96 268,96 216,186 56,186" fill="var(--color-navy)" />
          <polygon points="300,64 336,64 336,196 300,214" fill="var(--color-signal)" />
        </>
      )}
      {art === 'channel' && (
        <>
          <polygon points="56,64 172,64 276,244 56,244" fill="var(--color-navy)" />
          <polygon points="224,64 344,64 344,244 328,244" fill="var(--color-navy)" />
        </>
      )}
      </g>
    </svg>
  );
}

function CapabilityCard({ capability, onOpen }: { capability: Capability; onOpen: () => void }) {
  return (
    <article className="dt:dr-w-480 flex w-full shrink-0 flex-col">
      <button
        onClick={onOpen}
        aria-label={`More about ${capability.title}`}
        className="group dr-rounded-8 relative block aspect-[4/3] w-full overflow-hidden border border-mist bg-white text-left"
      >
        <PlaneArt art={capability.art} />
        <span className="h2 dr-top-16 absolute right-[calc(20*var(--px))] text-navy">{capability.index}</span>
        <span className="absolute inset-0 bg-sky opacity-0 transition-opacity duration-[600ms] ease-out-expo group-hover:opacity-40" />
        <span className="dr-bottom-16 dr-right-16 dr-w-40 absolute flex aspect-square items-center justify-center rounded-full bg-navy text-white transition-[background-color] duration-[600ms] ease-out-expo group-hover:bg-signal">
          <ArrowUpRight className="dr-w-20 dr-h-20" strokeWidth={2} />
        </span>
      </button>
      <h3 className="p-m dr-mt-16">{capability.title}</h3>
      <p className="p-r dr-mt-8 muted">{capability.summary}</p>
    </article>
  );
}

export function CapabilitiesShowcase({ onOpenEstimator }: CapabilitiesShowcaseProps) {
  const [active, setActive] = useState<Capability | null>(null);
  const isDesktop = useIsDesktop();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef(0);

  // On desktop, make the section tall enough that scrolling down pans the whole strip sideways.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    if (!isDesktop) {
      scroller.style.height = '';
      track.style.transform = '';
      return;
    }

    const measure = () => {
      overflowRef.current = Math.max(0, track.scrollWidth - window.innerWidth);
      scroller.style.height = `${overflowRef.current + window.innerHeight}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isDesktop]);

  useScrollProgress(scrollerRef, (progress) => {
    if (!isDesktop || !trackRef.current) return;
    trackRef.current.style.transform = `translate3d(${-progress * overflowRef.current}px, 0, 0)`;
  });

  return (
    <section id="capabilities" data-theme="light" className="relative">
      <div className="layout-grid dr-mb-160 dt:dr-mb-240">
        <h2 className="h2 dr-mb-32 dt:dr-py-24 dt:dr-pl-32 col-span-full dt:col-[3/span_5] dt:mb-0">Six capabilities</h2>
        <p className="p dt:dr-mt-256 col-span-full dt:col-[8/span_4]">
          One lifecycle, from validating an idea to evolving a production system.{' '}
          <span className="contrast semi-bold">We lead with your problem and choose the technology after the outcome is clear.</span>
        </p>
      </div>

      <div ref={scrollerRef} className="dt:dr-mb-240 max-dt:mx-auto max-dt:w-(--layout-width)">
        <div className="flex overflow-hidden dt:sticky dt:top-0 dt:h-screen dt:items-center dt:pt-[calc(var(--safe)+var(--header-height))]">
          <div
            ref={trackRef}
            className="dr-gap-48 flex w-full flex-col will-change-transform dt:w-max dt:flex-row dt:gap-(--gap)"
            style={isDesktop ? { paddingInline: EDGE } : undefined}
          >
            {CAPABILITIES.map((capability) => (
              <CapabilityCard key={capability.id} capability={capability} onOpen={() => setActive(capability)} />
            ))}

            <div className="dt:dr-w-480 dr-gap-24 dr-py-48 flex w-full shrink-0 flex-col items-center justify-center text-center">
              <p className="p muted">Already have a prototype?</p>
              <CtaButton onClick={onOpenEstimator} className="dr-w-340 max-w-full whitespace-nowrap">
                {CTA.technical}
              </CtaButton>
            </div>
          </div>
        </div>
      </div>

      <Modal open={active !== null} onClose={() => setActive(null)} label={active?.title ?? 'Capability'}>
        {active && (
          <div className="dr-gap-24 flex flex-col">
            <p className="p-xs contrast">Capability {active.index} / 06</p>
            <h3 className="h2 dt:dr-text-64 dr-pr-48">{active.title}</h3>
            <p className="p">{active.detail}</p>
            <ul className="dr-gap-8 flex flex-wrap">
              {active.stack.map((item) => (
                <li key={item} className="p-xs dr-px-12 dr-py-8 dr-rounded-4 border border-current/30">
                  {item}
                </li>
              ))}
            </ul>
            <CtaButton
              onClick={() => {
                setActive(null);
                onOpenEstimator();
              }}
              className="dr-mt-8"
            >
              {active.cta}
            </CtaButton>
          </div>
        )}
      </Modal>
    </section>
  );
}
