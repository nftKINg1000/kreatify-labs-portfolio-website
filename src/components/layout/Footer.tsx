import { BRAND, CONTACT_EMAIL, NAV } from '../../content';
import { Wordmark } from '../ui/Logo';

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer data-theme="dark" className="site-footer section--dark">
      <div className="layout-grid site-footer__grid">
        <div className="site-footer__brand">
          {/* Approved white reverse wordmark on Deep Navy, above the 160px digital minimum. */}
          <Wordmark treatment="white" className="site-footer__wordmark" title={BRAND.name} />
          <p className="p-r muted">{BRAND.descriptor}</p>
        </div>

        <nav aria-label="Footer" className="site-footer__nav">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <a className="link p-s" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a className="link p-s" href="#contact">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="site-footer__contact">
          <a className="link p-s" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          <a className="link p-s" href="#top">
            Back to top
          </a>
        </div>
      </div>
      <p className="layout-block p-xs muted site-footer__legal">
        <span suppressHydrationWarning>© {YEAR}</span> {BRAND.name} · {BRAND.descriptor}
        <br />
        {/* Required by the model's CC BY 4.0 licence. */}
        Statue of Liberty 3D model by{' '}
        <a className="link" href="https://sketchfab.com/3d-models/statue-of-liberty-c461ed8724424ad99500fd058a0ab082">
          Maurice Svay
        </a>
        , licensed under{' '}
        <a className="link" href="https://creativecommons.org/licenses/by/4.0/">
          CC BY 4.0
        </a>
        ; simplified and recoloured.
      </p>
    </footer>
  );
}
