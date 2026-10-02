import { WHY } from '../data/content';

export function WhySection() {
  return (
    <section id="about" data-theme="dark" className="dr-mb-160 dt:dr-mb-640 relative">
      <div className="layout-grid">
        <h2 className="h2 dt:dr-py-24 dt:dr-px-32 col-span-full max-dt:dr-mb-48 dt:sticky dt:top-[33%] dt:col-[3/span_4] dt:self-start">
          Why Kreatify?
        </h2>

        <div className="dr-gap-120 dt:dr-gap-400 dt:dr-mt-256 col-span-full flex flex-col dt:col-[7/-1] dt:[&>*]:w-col-4">
          <p className="p">{WHY.intro}</p>
          {WHY.points.map((point) => (
            <div key={point.title}>
              <h3 className="h4 dr-mb-16 dt:dr-mb-24 contrast">{point.title}</h3>
              <p className="p">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
