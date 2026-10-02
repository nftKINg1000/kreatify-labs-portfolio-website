import { useRef } from 'react';
import { useLenis } from 'lenis/react';
import { HandCanvas3D } from './HandCanvas3D';

/** Pink intro curtain that lifts once fonts are ready. */
export function Loader({ loaded }: { loaded: boolean }) {
  return (
    <div
      data-theme="contrast"
      aria-hidden="true"
      className={`fixed inset-0 z-1000 flex items-center justify-center bg-primary transition-transform duration-[1200ms] ease-out-expo ${
        loaded ? 'pointer-events-none -translate-y-full' : ''
      }`}
    >
      <p className={`h2 transition-opacity duration-500 ${loaded ? 'opacity-0' : ''}`}>Kreatify</p>
    </div>
  );
}

/** Thin pink bar tracking page scroll (hidden on touch devices, like lenis.dev). */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  useLenis(({ progress }) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-100 [@media(hover:none)]:hidden">
      <div ref={barRef} className="dr-h-4 w-full origin-left scale-x-0 bg-pink" />
    </div>
  );
}

/** Fixed pink glow rising from the bottom of the viewport, with the 3D hand floating above it. */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 h-screen overflow-hidden">
      <div className="absolute top-0 left-1/2 h-[100vw] w-[200vw] -translate-x-1/2 translate-y-[50vh] bg-[radial-gradient(var(--color-pink),transparent_70%)] opacity-50" />
      <HandCanvas3D className="absolute inset-0" />
    </div>
  );
}
