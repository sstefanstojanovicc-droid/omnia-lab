import { Reveal } from "./Reveal";

const pillars = [
  {
    index: "I",
    title: "Immersive",
    body: "Environments that envelop the senses — light, material, and scale composed as a single atmospheric field.",
  },
  {
    index: "II",
    title: "Experiential",
    body: "Spaces choreographed for movement and pause. Every threshold, turn, and vista is considered as narrative.",
  },
  {
    index: "III",
    title: "Spatial",
    body: "From intimate rooms to large-scale interventions — form, structure, and void in deliberate tension.",
  },
];

export function Practice() {
  return (
    <section id="practice" className="bg-smoke py-24 text-paper md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-paper/50">
            02 — Practice
          </p>
          <h2 className="mt-6 max-w-2xl font-display text-4xl font-semibold uppercase leading-tight tracking-tight md:text-5xl">
            Multidisciplinary by design
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-px border border-line-dark bg-line-dark md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={0.08 * i}>
              <article className="group flex h-full flex-col justify-between bg-smoke p-8 transition-colors duration-500 hover:bg-[#141414] md:p-10">
                <p className="font-mono text-[10px] tracking-[0.3em] text-accent">
                  {pillar.index}
                </p>
                <div className="mt-16">
                  <h3 className="font-display text-2xl font-bold uppercase tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-paper/55">
                    {pillar.body}
                  </p>
                </div>
                <span className="mt-10 inline-block h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
