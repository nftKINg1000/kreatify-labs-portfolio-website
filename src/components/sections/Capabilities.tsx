import { CAPABILITIES, CTA, TECH_STACK } from '../../content';
import type { Capability } from '../../content/types';
import { useOpenLead } from '../../lib/leadContext';
import { CtaButton } from '../ui/CtaButton';

/** Supporting graphics from brand guide p.18 — the cut, the plane and the channel. Never the A. */
function PlaneArt({ art }: { art: Capability['art'] }) {
  return (
    <svg viewBox="0 0 400 220" className="capability__art" aria-hidden="true" focusable="false">
      {art === 'cut' && <polygon points="40,30 250,30 160,190 40,190" className="fill-navy" />}
      {art === 'plane' && (
        <>
          <polygon points="40,70 230,70 184,150 40,150" className="fill-navy" />
          <polygon points="268,40 300,40 300,158 268,174" className="fill-signal" />
        </>
      )}
      {art === 'channel' && (
        <>
          <polygon points="40,30 140,30 232,190 40,190" className="fill-navy" />
          <polygon points="184,30 330,30 330,190 276,190" className="fill-navy" />
        </>
      )}
    </svg>
  );
}

export function Capabilities() {
  const openLead = useOpenLead();

  return (
    <section id="capabilities" data-theme="light" aria-labelledby="capabilities-title" className="section" tabIndex={-1}>
      <div className="layout-grid section__head">
        <p className="eyebrow">Capabilities</p>
        <h2 id="capabilities-title" className="h2 section__title">
          Six capabilities, one lifecycle
        </h2>
        <p className="p section__intro">
          From validating an idea to evolving a production system. We lead with your problem and choose the technology after the outcome is clear.
        </p>
      </div>

      <ol className="layout-grid card-grid card-grid--3 capability-grid">
        {CAPABILITIES.map((capability) => (
          <li key={capability.id} className="card capability" aria-labelledby={`cap-${capability.id}`}>
            <div className="capability__top">
              <PlaneArt art={capability.art} />
              <span className="capability__index" aria-hidden="true">
                {capability.index}
              </span>
            </div>
            <h3 id={`cap-${capability.id}`} className="h4">
              {capability.title}
            </h3>
            <p className="p-r capability__outcome">{capability.outcome}</p>

            <h4 className="p-xs capability__label">What you get</h4>
            <ul className="tick-list p-r">
              {capability.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <details className="disclosure">
              <summary className="p-s">Suited to, and what it means</summary>
              <ul className="tick-list p-r">
                {capability.suitedTo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="p-r muted">{capability.detail}</p>
            </details>
          </li>
        ))}
      </ol>

      <div className="layout-grid capability-foot">
        <div className="capability-foot__stack">
          <h3 className="p-xs muted">Technology we work with</h3>
          <ul className="tag-list">
            {TECH_STACK.map((tech) => (
              <li key={tech} className="tag">
                {tech}
              </li>
            ))}
          </ul>
        </div>
        <div className="capability-foot__cta">
          <p className="p">Already have a prototype?</p>
          <CtaButton href="#contact" onClick={openLead('capabilities-prototype')}>
            {CTA.technical}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
