import type { CSSProperties } from 'react';
import { useRef } from 'react';
import { useLenis } from 'lenis/react';
import { BRAND } from '../data/content';
import { HandModel } from './HandModel';
import { Wordmark } from './ui/Logo';

export type IntroPhase = 'idle' | 'in' | 'out' | 'done';

/**
 * Opening animation, after lenis.dev: a Deep Navy curtain where the white mark and
 * descriptor rise from behind a mask, then the curtain lifts while its contents hold still,
 * revealing the full-colour mark in exactly the same place on the Open Sky hero.
 * The mark always moves as one intact object (brand guide p.20).
 */
export function Intro({ phase, onDone }: { phase: IntroPhase; onDone: () => void }) {
  if (phase === 'done') return null;

  const state = phase === 'in' ? 'is-in' : phase === 'out' ? 'is-in is-out' : '';

  return (
    <div
      aria-hidden="true"
      data-theme="dark"
      className={`intro ${state}`}
      onTransitionEnd={(e) => {
        if (phase === 'out' && e.target === e.currentTarget) onDone();
      }}
    >
      <div className="intro-inner">
        <div className="mark-box intro-mask">
          <span className="intro-piece h-full" style={{ '--index': 0 } as CSSProperties}>
            <Wordmark treatment="white" className="block size-full" />
          </span>
        </div>

        <div className="p-s absolute right-(--safe) bottom-(--safe) text-end text-sky">
          {BRAND.descriptorLines.map((line, i) => (
            <span key={line} className="intro-mask block">
              <span className="intro-piece" style={{ '--index': i + 2 } as CSSProperties}>
                {line}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Thin Signal Red bar tracking page scroll (hidden on touch devices, like lenis.dev). */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  useLenis(({ progress }) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-100 [@media(hover:none)]:hidden">
      <div ref={barRef} className="dr-h-4 w-full origin-left scale-x-0 bg-signal" />
    </div>
  );
}

/** Fixed Open Sky field with a soft light bloom and the 3D hand rising from below. */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 h-screen overflow-hidden bg-sky">
      <div className="absolute top-0 left-1/2 h-[100vw] w-[200vw] -translate-x-1/2 translate-y-[45vh] bg-[radial-gradient(var(--color-white),transparent_60%)] opacity-80" />
      <HandModel className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_52%,transparent_72%)] dt:[mask-image:none]" />
    </div>
  );
}
