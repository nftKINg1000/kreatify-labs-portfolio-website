import { BRAND } from '../../content';

/** The brand promise as a short dark band; lines settle into place where scroll-driven animation is supported. */
export function Signature() {
  return (
    <section id="signature" data-theme="dark" aria-label="Our promise" className="signature">
      <p className="signature__lines layout-block">
        {BRAND.signature.map((line, i) => (
          <span key={line} className={`signature__line h1 ${i === 1 ? 'contrast' : ''}`}>
            {line}
          </span>
        ))}
      </p>
      <p className="p-l signature__boilerplate layout-block">{BRAND.boilerplate}</p>
    </section>
  );
}
