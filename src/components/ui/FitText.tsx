import { useLayoutEffect, useRef } from 'react';

/** Sizes a single line of text so it spans exactly the width of its parent. */
export function FitText({ children, className = '' }: { children: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const fit = () => {
      el.style.fontSize = '100px';
      const width = el.getBoundingClientRect().width;
      if (width > 0) el.style.fontSize = `${(parent.clientWidth / width) * 100}px`;
    };

    fit();
    document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`inline-block whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}
