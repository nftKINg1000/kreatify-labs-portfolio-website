import { AUDIENCE, PRINCIPLES, published } from '../../content';
import { OwnerBadge } from '../ui/OwnerBadge';

export function Audience() {
  return (
    <section id="audience" data-theme="light" aria-labelledby="audience-title" className="section" tabIndex={-1}>
      <div className="layout-grid section__head">
        <p className="eyebrow">Who we build for</p>
        <h2 id="audience-title" className="h2 section__title">
          Technology for a real business need
        </h2>
        <p className="p section__intro">
          We work with businesses that need technology to solve an operational or product problem — not technology for its own sake.
        </p>
      </div>

      <ul className="layout-grid card-grid card-grid--3">
        {published(AUDIENCE).map((fit) => (
          <li key={fit.title} className="card">
            <OwnerBadge note={fit.ownerInput} />
            <h3 className="h4">{fit.title}</h3>
            <p className="p-s card__need">{fit.need}</p>
            <p className="p-r">{fit.help}</p>
          </li>
        ))}
      </ul>

      <div className="layout-grid principles">
        <h3 className="p-s principles__label">How we behave</h3>
        <ul className="principles__list">
          {PRINCIPLES.map((principle) => (
            <li key={principle} className="h4">
              {principle}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
