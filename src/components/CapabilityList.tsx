import { CAPABILITY_LIST, TECH_STACK } from '../data/content';

/** The founder's full capability list (brand guide p.31) plus the technology ecosystem. */
export function CapabilityList() {
  return (
    <section id="capability-list" data-theme="dark" className="dr-pb-160 dt:dr-pb-240 relative">
      <div className="layout-grid dr-mb-48 dt:dr-mb-80">
        <h2 className="h2 col-span-full dt:col-[1/span_6]">Everything we build</h2>
        <p className="p dr-mt-24 col-span-full self-end dt:col-[7/span_4] dt:mt-0">
          Across the complete product lifecycle, from validating an idea to deployment, optimisation and ongoing evolution.
        </p>
      </div>

      <ol className="layout-grid dt:gap-y-0">
        {CAPABILITY_LIST.map((item, i) => (
          <li
            key={item}
            className="dr-py-20 dr-gap-16 col-span-full flex items-baseline border-t border-sky/30 dt:col-span-6"
          >
            <span className="p-xs muted dr-w-32 shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <span className="p-m">{item}</span>
          </li>
        ))}
      </ol>

      <div className="layout-block dr-mt-64 dr-gap-8 flex flex-wrap">
        <span className="p-xs muted dr-mr-8 self-center">Technology</span>
        {TECH_STACK.map((tech) => (
          <span key={tech} className="p-xs dr-px-12 dr-py-8 dr-rounded-4 border border-sky/30">
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}
