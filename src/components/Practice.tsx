import { site } from "@/content/site";
import { Reveal } from "./Reveal";

const pillars = site.sectors.map((sector, i) => ({
  index: String(i + 1).padStart(2, "0"),
  title: sector.title,
}));

export function Practice() {
  return (
    <section id="practice" className="bg-smoke py-24 text-paper md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-paper/50">
            {site.practice.label}
          </p>
          <h2 className="mt-6 max-w-3xl font-display text-4xl font-semibold uppercase leading-tight tracking-tight md:text-5xl">
            {site.practice.title}
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-[11px] uppercase leading-[1.9] tracking-[0.1em] text-paper/60">
            {site.practice.tagline}
          </p>
          <p className="mt-4 max-w-2xl font-mono text-[11px] uppercase leading-[1.9] tracking-[0.1em] text-paper/55">
            {site.practice.description}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-px border border-line-dark bg-line-dark sm:grid-cols-2 md:grid-cols-4">
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
