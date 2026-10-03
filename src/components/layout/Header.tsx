import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { BRAND, CTA, NAV } from '../../content';
import { useOpenLead } from '../../lib/leadContext';
import { navigateToHash } from '../../lib/navigation';
import { Dialog } from '../ui/Dialog';
import { ASymbol } from '../ui/Logo';

/** Match the header treatment to the section beneath it (no per-frame scroll work). */
function useSectionTheme(headerRef: React.RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const setup = () => {
      observer?.disconnect();
      const header = headerRef.current;
      if (!header) return;
      const probe = Math.round(header.offsetHeight / 2);
      // A one-pixel band at the header's vertical centre.
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setTheme((entry.target as HTMLElement).dataset.theme === 'dark' ? 'dark' : 'light');
          }
        },
        { rootMargin: `-${probe}px 0px -${Math.max(0, window.innerHeight - probe - 1)}px 0px` },
      );
      document.querySelectorAll('main > section[data-theme], footer[data-theme]').forEach((el) => observer!.observe(el));
    };
    setup();
    window.addEventListener('resize', setup, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', setup);
    };
  }, [headerRef]);
  return theme;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const returnFocus = useRef(true);
  const theme = useSectionTheme(headerRef);
  const openLead = useOpenLead();

  const goFromMenu = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    returnFocus.current = false;
    setMenuOpen(false);
    requestAnimationFrame(() => navigateToHash(href));
  };

  return (
    <header ref={headerRef} data-theme={theme} className="site-header">
      <div className="site-header__bar layout-grid">
        <nav aria-label="Primary" className="site-header__nav">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="nav-link link">
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#top" className="site-header__mark" aria-label={`${BRAND.name} — back to top`}>
          <ASymbol treatment={theme === 'light' ? 'white' : 'color'} className="size-full" />
        </a>

        <div className="site-header__actions">
          <a href="#contact" className="nav-link link">
            Contact
          </a>
          <a href="#contact" className="nav-link nav-link--cta" onClick={openLead('header')}>
            {CTA.primary}
          </a>
        </div>

        <button
          type="button"
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden="true" className="menu-button__bars" />
        </button>
      </div>

      <Dialog
        id="mobile-menu"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        hideTitle
        variant="fullscreen"
        returnFocusRef={returnFocus}
      >
        <nav aria-label="Mobile" className="mobile-nav">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="h3 link" onClick={goFromMenu(item.href)}>
              {item.label}
            </a>
          ))}
          <a href="#contact" className="h3 link" onClick={goFromMenu('#contact')}>
            Contact
          </a>
          <a
            href="#contact"
            className="cta cta-button mobile-nav__cta"
            onClick={(event) => {
              event.preventDefault();
              // Close the menu first so focus returns to the menu button, which then
              // becomes the enquiry dialog's invoker (and gets focus back afterwards).
              setMenuOpen(false);
              window.setTimeout(() => openLead('mobile-menu')(), 60);
            }}
          >
            <span className="cta-button-label">
              <span>{CTA.primary}</span>
              <span aria-hidden="true">{CTA.primary}</span>
            </span>
          </a>
        </nav>
      </Dialog>
    </header>
  );
}
