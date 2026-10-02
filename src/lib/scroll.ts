import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import { useLenis } from 'lenis/react';

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/**
 * Calls `onProgress` with how far the viewport has travelled through `ref`
 * (0 when its top reaches the top of the viewport, 1 when its bottom reaches the bottom).
 * Runs on every Lenis frame, so write to the DOM directly instead of setting state.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onProgress: (progress: number) => void) {
  const callbackRef = useRef(onProgress);
  useLayoutEffect(() => {
    callbackRef.current = onProgress;
  });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    const progress = distance > 0 ? clamp(-rect.top / distance) : rect.top <= 0 ? 1 : 0;
    callbackRef.current(progress);
  }, [ref]);

  useLenis(update, [update]);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useIsDesktop = () => useMediaQuery('(min-width: 800px)');

/** Smooth-scrolls to an element id (or the top) through Lenis, falling back to native scrolling. */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (target: string | number) => {
      const selector = typeof target === 'string' ? `#${target}` : target;
      if (lenis) {
        lenis.scrollTo(selector, { duration: 1.6 });
        return;
      }
      if (typeof selector === 'number') window.scrollTo({ top: selector, behavior: 'smooth' });
      else document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    },
    [lenis],
  );
}
