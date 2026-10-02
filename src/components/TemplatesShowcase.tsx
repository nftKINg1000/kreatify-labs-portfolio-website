import { ArrowUpRight } from 'lucide-react';
import { TEMPLATES } from '../data/content';

export function TemplatesShowcase() {
  return (
    <section id="templates" data-theme="light" className="dr-pb-160 dt:dr-pb-240 relative bg-primary">
      <div className="layout-grid dr-mb-48 dt:dr-mb-80">
        <h2 className="h2 col-span-full dt:col-[1/span_6]">Open source</h2>
        <p className="p dr-mt-24 col-span-full self-end dt:col-[7/span_4] dt:mt-0">
          Starters and kits we use on client work, free to fork.
        </p>
      </div>

      <ul className="layout-block">
        {TEMPLATES.map((template) => {
          const external = template.link.startsWith('http');
          return (
            <li key={template.title} className="border-t border-current last:border-b">
              <a
                href={template.link}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className="group layout-grid dr-py-24 dt:dr-py-32 dr-gap-y-12 items-center px-0! transition-colors duration-[600ms] ease-out-expo hover:text-pink"
              >
                <span className="p-xs col-span-5 dt:col-span-2">{template.category}</span>
                <span className="col-start-6 justify-self-end dt:col-start-12">
                  <ArrowUpRight
                    className="dr-w-24 dr-h-24 transition-transform duration-[600ms] ease-out-expo group-hover:rotate-45"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="h4 col-span-full row-start-2 dt:col-[3/span_4] dt:row-start-1">{template.title}</span>
                <span className="p-r col-span-full row-start-3 opacity-70 dt:col-[8/span_4] dt:row-start-1">
                  {template.description}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
