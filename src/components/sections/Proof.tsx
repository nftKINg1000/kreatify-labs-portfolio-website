import { CASE_STUDIES, published, VALIDATION } from '../../content';
import { OwnerBadge } from '../ui/OwnerBadge';

/**
 * Honest proof: how delivery is validated. Verified case studies render here once the
 * owner adds them to CASE_STUDIES; nothing is shown in their place until then.
 */
export function Proof() {
  return (
    <section id="proof" data-theme="light" aria-labelledby="proof-title" className="section" tabIndex={-1}>
      <div className="layout-grid section__head">
        <p className="eyebrow">How we validate delivery</p>
        <h2 id="proof-title" className="h2 section__title">
          Evidence over promises
        </h2>
        <p className="p section__intro">
          We would rather show how work is checked than claim results we cannot share. These practices apply to every engagement.
        </p>
      </div>

      <ol className="layout-grid card-grid card-grid--2">
        {published(VALIDATION).map((practice, i) => (
          <li key={practice.title} className="card card--line">
            <OwnerBadge note={practice.ownerInput} />
            <span className="p-xs muted" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="h4">{practice.title}</h3>
            <p className="p-r">{practice.body}</p>
          </li>
        ))}
      </ol>

      {CASE_STUDIES.length > 0 && (
        <div className="layout-grid case-studies">
          <h3 className="h3">Selected work</h3>
          <ul className="card-grid card-grid--2">
            {CASE_STUDIES.map((study) => (
              <li key={study.title} className="card">
                <p className="p-xs muted">{study.client}</p>
                <h4 className="h4">{study.title}</h4>
                <dl className="case-study">
                  <dt className="p-xs">Problem</dt>
                  <dd className="p-r">{study.problem}</dd>
                  <dt className="p-xs">Approach</dt>
                  <dd className="p-r">{study.approach}</dd>
                  <dt className="p-xs">Outcome</dt>
                  <dd className="p-r">{study.outcome}</dd>
                </dl>
                {study.href && (
                  <a className="link p-s" href={study.href}>
                    Read the case study
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {CASE_STUDIES.length === 0 && import.meta.env.DEV && (
        <p className="layout-block">
          <OwnerBadge note="Add verified, client-approved case studies to CASE_STUDIES to show a Selected work block here." />
        </p>
      )}
    </section>
  );
}
