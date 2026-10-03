import { LIFECYCLE, published, WORKING_PRACTICES } from '../../content';
import { OwnerBadge } from '../ui/OwnerBadge';

export function Approach() {
  return (
    <section id="approach" data-theme="light" aria-labelledby="approach-title" className="section" tabIndex={-1}>
      <div className="layout-grid section__head">
        <p className="eyebrow">Delivery approach</p>
        <h2 id="approach-title" className="h2 section__title">
          Define to evolve
        </h2>
        <p className="p section__intro">Six stages, each with outputs you can review before the next begins.</p>
      </div>

      <ol className="layout-grid lifecycle">
        {LIFECYCLE.map((stage, i) => (
          <li key={stage.step} className="lifecycle__stage">
            <span className="lifecycle__index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="h4">{stage.step}</h3>
            <p className="p-r">{stage.purpose}</p>
            <h4 className="p-xs muted lifecycle__label">Outputs</h4>
            <ul className="tick-list p-r">
              {stage.outputs.map((output) => (
                <li key={output}>{output}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="layout-grid practices">
        <h3 className="h3 practices__title">How engagements run</h3>
        <dl className="practices__list">
          {published(WORKING_PRACTICES).map((practice) => (
            <div key={practice.title} className="practices__item">
              <dt className="p-s">
                {practice.title}
                <OwnerBadge note={practice.ownerInput} />
              </dt>
              <dd className="p-r">{practice.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
