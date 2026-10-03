import { FAQ, published } from '../../content';
import { OwnerBadge } from '../ui/OwnerBadge';

/** Native <details> disclosure: keyboard and screen-reader support built in, content always in the DOM. */
export function Faq() {
  return (
    <section id="faq" data-theme="dark" aria-labelledby="faq-title" className="section section--dark" tabIndex={-1}>
      <div className="layout-grid section__head">
        <p className="eyebrow">FAQ</p>
        <h2 id="faq-title" className="h2 section__title">
          Questions, answered plainly
        </h2>
      </div>
      <div className="layout-grid">
        <div className="faq-list">
          {published(FAQ).map((item) => (
            <details key={item.question} className="faq-item">
              <summary>
                <h3 className="p-m">{item.question}</h3>
              </summary>
              <div className="faq-item__answer">
                <OwnerBadge note={item.ownerInput} />
                <p className="p">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
