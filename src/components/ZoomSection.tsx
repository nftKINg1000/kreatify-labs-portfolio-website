import { useRef } from 'react';
import { clamp, useScrollProgress } from '../lib/scroll';

/**
 * Pinned sequence (lenis.dev "Enter Lenis"): the signature zooms apart, "We automate."
 * grows out of the centre, then a Deep Navy wipe hands over to the dark sections below.
 */
export function ZoomSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollProgress(sectionRef, (progress) => {
    const section = sectionRef.current;
    if (!section) return;
    const zoom = clamp(progress / 0.65);
    const wipe = clamp((progress - 0.65) / 0.35);
    section.style.setProperty('--zoom', zoom.toFixed(4));
    section.style.setProperty('--wipe', wipe.toFixed(4));
    // Once the wipe covers most of the screen the header should switch to its dark treatment.
    section.dataset.theme = wipe > 0.5 ? 'dark' : 'light';
  });

  return (
    <section ref={sectionRef} data-theme="light" className="relative h-[400vh] text-navy [--wipe:0] [--zoom:0] dt:h-[600vh]">
      <div className="layout-block sticky top-0 h-svh overflow-hidden dt:h-screen">
        <div className="dr-pb-20 flex h-full origin-center flex-col justify-between pt-[calc(var(--safe)+var(--header-height))] [transform:scale(calc(1+var(--zoom)*3))]">
          <h2 className="h2 text-[length:calc(56*100/650*1svh)] translate-y-[calc(var(--zoom)*-100%)] dt:text-[length:calc(128*100/816*1vh)]">
            We design.
            <br />
            <span className="text-signal">We build.</span>
          </h2>
          <h2 className="h2 text-end text-[length:calc(56*100/650*1svh)] text-nowrap translate-y-[calc(var(--zoom)*100%)] dt:text-[length:calc(128*100/816*1vh)]">
            Made useful.
          </h2>
        </div>

        <p
          aria-hidden="true"
          className="h3 pointer-events-none absolute top-1/2 left-1/2 text-center opacity-[calc(var(--zoom)*2)] [--k:2] [transform:translate(-50%,-50%)_scale(calc(var(--zoom)*var(--k)))] dt:[--k:2.6]"
        >
          We
          <br />
          automate.
        </p>

        <span className="absolute inset-0 origin-center bg-navy [transform:scaleX(var(--wipe))]" />
      </div>
    </section>
  );
}
