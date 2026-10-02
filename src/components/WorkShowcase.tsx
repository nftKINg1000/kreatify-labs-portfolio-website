import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS, type Project } from '../data/content';
import { useIsDesktop, useScrollProgress } from '../lib/scroll';
import { CtaButton } from './ui/CtaButton';
import { Modal } from './ui/Modal';

interface WorkShowcaseProps {
  onOpenEstimator: () => void;
}

// First and last cards are inset by half the grid so the strip starts and ends centred.
const EDGE = 'calc(6 * var(--column-width) + 6 * var(--gap) + var(--safe))';

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article className="dt:dr-w-480 flex w-full shrink-0 flex-col">
      <button
        onClick={onOpen}
        aria-label={`Open ${project.title}`}
        className="group dr-rounded-8 relative block aspect-[4/3] w-full overflow-hidden text-left text-white"
        style={{
          background: `
            linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px) 0 0 / calc(40 * var(--px)) calc(40 * var(--px)),
            linear-gradient(90deg, rgb(255 255 255 / 0.06) 1px, transparent 1px) 0 0 / calc(40 * var(--px)) calc(40 * var(--px)),
            radial-gradient(120% 100% at 15% 10%, ${project.color} 0%, color-mix(in oklab, ${project.color} 30%, #000) 50%, #050505 100%)`,
        }}
      >
        <span className="p-xs dr-top-16 absolute left-[calc(16*var(--px))]">{project.category}</span>
        <span className="dr-bottom-16 dr-text-56 absolute left-[calc(16*var(--px))] right-[calc(64*var(--px))] font-anton leading-[0.9] uppercase">
          {project.client}
        </span>
        <span className="absolute inset-0 bg-pink opacity-0 transition-opacity duration-[600ms] ease-out-expo group-hover:opacity-25" />
        <span className="dr-bottom-16 dr-right-16 dr-w-32 absolute flex aspect-square items-center justify-center rounded-full bg-pink text-black opacity-0 transition-opacity duration-[600ms] ease-out-expo group-hover:opacity-100">
          <ArrowUpRight className="dr-w-16 dr-h-16" strokeWidth={2} />
        </span>
      </button>
      <h3 className="p-m dr-mt-16">{project.title}</h3>
      <p className="p-r dr-mt-8 text-[#8c8c8c]">
        {project.client} — {project.year}
      </p>
    </article>
  );
}

export function WorkShowcase({ onOpenEstimator }: WorkShowcaseProps) {
  const [active, setActive] = useState<Project | null>(null);
  const isDesktop = useIsDesktop();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef(0);

  // On desktop, make the section tall enough that scrolling down pans the whole strip sideways.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    if (!isDesktop) {
      scroller.style.height = '';
      track.style.transform = '';
      return;
    }

    const measure = () => {
      overflowRef.current = Math.max(0, track.scrollWidth - window.innerWidth);
      scroller.style.height = `${overflowRef.current + window.innerHeight}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isDesktop]);

  useScrollProgress(scrollerRef, (progress) => {
    if (!isDesktop || !trackRef.current) return;
    trackRef.current.style.transform = `translate3d(${-progress * overflowRef.current}px, 0, 0)`;
  });

  return (
    <section id="work" data-theme="dark" className="relative">
      <div className="layout-grid dr-mb-160 dt:dr-mb-240">
        <h2 className="h2 dr-mb-32 dt:dr-py-24 dt:dr-pl-32 col-span-full dt:col-[3/span_4] dt:mb-0">Selected work</h2>
        <p className="p dt:dr-mt-256 col-span-full dt:col-[7/span_4]">
          A selection of projects crafted for brands that care about design, performance, and the details nobody notices
          until they are missing. <span className="contrast semi-bold">Every one of them scrolls like butter.</span>
        </p>
      </div>

      <div ref={scrollerRef} className="dt:dr-mb-240 max-dt:mx-auto max-dt:w-(--layout-width)">
        <div className="flex overflow-hidden dt:sticky dt:top-0 dt:h-screen dt:items-center dt:pt-[calc(var(--safe)+var(--header-height))]">
          <div
            ref={trackRef}
            className="dr-gap-48 flex w-full flex-col will-change-transform dt:w-max dt:flex-row dt:gap-(--gap)"
            style={isDesktop ? { paddingInline: EDGE } : undefined}
          >
            {PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => setActive(project)} />
            ))}

            <div className="dt:dr-w-480 dr-gap-24 dr-py-48 flex w-full shrink-0 flex-col items-center justify-center text-center">
              <p className="p opacity-60">Need a site like these?</p>
              <CtaButton onClick={onOpenEstimator} className="dr-w-340 max-w-full whitespace-nowrap">
                Start a project
              </CtaButton>
            </div>
          </div>
        </div>
      </div>

      <Modal open={active !== null} onClose={() => setActive(null)} label={active?.title ?? 'Project'}>
        {active && (
          <div className="dr-gap-24 flex flex-col">
            <p className="p-xs contrast">
              {active.category} — {active.year}
            </p>
            <h3 className="h2 dt:dr-text-64 dr-pr-48">{active.title}</h3>
            <p className="p-r text-[#8c8c8c]">Client: {active.client}</p>
            <p className="p">{active.description}</p>
            <ul className="dr-gap-8 flex flex-wrap">
              {active.tags.map((tag) => (
                <li key={tag} className="p-xs dr-px-12 dr-py-8 dr-rounded-4 border border-white/15">
                  {tag}
                </li>
              ))}
            </ul>
            <CtaButton
              onClick={() => {
                setActive(null);
                onOpenEstimator();
              }}
              className="dr-mt-8"
            >
              Start a similar project
            </CtaButton>
          </div>
        )}
      </Modal>
    </section>
  );
}
