import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { CONTACT_EMAIL, CTA } from '../data/content';
import { ASymbol } from './ui/Logo';
import { useScrollTo } from '../lib/scroll';

interface HeaderProps {
  onOpenEstimator: () => void;
}

const NAV = [
  { label: 'Capabilities', id: 'capabilities' },
  { label: 'Approach', id: 'approach' },
  { label: 'Pricing', id: 'pricing' },
];

export function Header({ onOpenEstimator }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const headerRef = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const lenis = useLenis();

  // Match the header's theme to whichever section sits underneath it.
  useLenis(() => {
    const header = headerRef.current;
    if (!header) return;
    const probe = header.offsetHeight / 2;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main [data-theme], footer[data-theme]'));
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) {
        const next = section.dataset.theme === 'light' ? 'light' : 'dark';
        setTheme((current) => (current === next ? current : next));
        return;
      }
    }
  });

  useEffect(() => {
    if (!lenis) return;
    if (menuOpen) lenis.stop();
    else lenis.start();
  }, [menuOpen, lenis]);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollTo(id);
  };

  const linkClass = 'link cta leading-[113%] whitespace-nowrap';

  return (
    <>
      <div
        data-theme={theme}
        className="pointer-events-none fixed inset-x-0 top-0 z-9 h-(--header-height) bg-[color-mix(in_oklab,var(--theme-primary)_50%,transparent)] mask-[linear-gradient(to_top,transparent,#000)] backdrop-blur-[10px] transition-colors duration-[600ms]"
      />

      <header
        ref={headerRef}
        data-theme={menuOpen ? 'dark' : theme}
        className="layout-grid fixed inset-x-0 top-0 z-12 h-(--header-height) items-center transition-[color] duration-[600ms] ease-out-expo"
      >
        <nav aria-label="Primary" className="dr-gap-40 col-[1/6] flex max-dt:hidden">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => go(item.id)} className={linkClass}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="col-span-2 col-start-3 flex justify-center dt:col-span-2 dt:col-start-6">
          <button
            onClick={() => go('hero')}
            aria-label="KreatifyLabs — back to top"
            className="dr-w-40 dr-h-40 dr-p-8 dr-rounded-4 flex items-center justify-center bg-action transition-colors duration-[600ms]"
          >
            {/* Approved A symbol: white on navy over light sections, colour on sky over dark ones. */}
            <ASymbol treatment={(menuOpen ? 'dark' : theme) === 'light' ? 'white' : 'color'} className="size-full" />
          </button>
        </div>

        <div className="dr-gap-40 col-[9/-1] flex justify-end max-dt:hidden">
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            Contact
          </a>
          <button onClick={onOpenEstimator} className={linkClass}>
            {CTA.primary}
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="dr-w-44 dr-h-44 col-start-6 flex flex-col items-end justify-center justify-self-end dt:hidden"
        >
          <span className="dr-h-8 relative flex w-full flex-col">
            <span
              className={`dr-w-24 dr-h-2 absolute top-0 right-0 bg-current transition-transform duration-300 ease-out-expo ${
                menuOpen ? 'translate-y-[calc(3*var(--px))] rotate-45' : ''
              }`}
            />
            <span
              className={`dr-w-24 dr-h-2 absolute right-0 bottom-0 bg-current transition-transform duration-300 ease-out-expo ${
                menuOpen ? '-translate-y-[calc(3*var(--px))] -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </header>

      <nav
        data-theme="dark"
        aria-hidden={!menuOpen}
        className={`dr-gap-32 fixed inset-0 z-11 flex flex-col items-center justify-center bg-primary transition-opacity duration-300 ease-out-expo dt:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {NAV.map((item) => (
          <button key={item.id} onClick={() => go(item.id)} className="link h3" tabIndex={menuOpen ? 0 : -1}>
            {item.label}
          </button>
        ))}
        <a href={`mailto:${CONTACT_EMAIL}`} className="link h3" tabIndex={menuOpen ? 0 : -1}>
          Contact
        </a>
        <button
          onClick={() => {
            setMenuOpen(false);
            onOpenEstimator();
          }}
          className="link h3 contrast"
          tabIndex={menuOpen ? 0 : -1}
        >
          {CTA.primary}
        </button>
      </nav>
    </>
  );
}
