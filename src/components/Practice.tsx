import { site } from "@/content/site";
import { Reveal } from "./Reveal";

const pillars = site.sectors.map((sector, i) => ({
  index: String(i + 1).padStart(2, "0"),
  title: sector.title,
}));

export function Practice() {
  return (
    <section id="practice" className="bg-smoke py-20 text-paper sm:py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/50 sm:tracking-[0.4em]">
            {site.practice.label}
          </p>
          <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.25rem,11vw,3rem)] font-semibold uppercase leading-[1.05] tracking-tight sm:mt-6 md:text-5xl md:leading-tight">
            {site.practice.title}
          </h2>
          <p className="mt-5 max-w-2xl font-mono text-[11px] uppercase leading-[1.75] tracking-[0.08em] text-paper/60 sm:mt-6 sm:leading-[1.9] sm:tracking-[0.1em]">
            {site.practice.tagline}
          </p>
          <p className="mt-4 max-w-2xl font-mono text-[11px] uppercase leading-[1.75] tracking-[0.08em] text-paper/55 sm:leading-[1.9] sm:tracking-[0.1em]">
            {site.practice.description}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px border border-line-dark bg-line-dark sm:mt-16 sm:grid-cols-2 md:mt-20 md:grid-cols-4">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={0.08 * i}>
              <article className="group flex h-full min-h-[180px] flex-col justify-between bg-smoke p-6 transition-colors duration-500 hover:bg-[#141414] sm:p-8 md:min-h-0 md:p-10">
                <p className="font-mono text-[10px] tracking-[0.3em] text-accent">
                  {pillar.index}
                </p>
                <div className="mt-12 sm:mt-16">
                  <h3 className="font-display text-[clamp(1.4rem,8vw,1.75rem)] font-bold uppercase leading-none tracking-tight md:text-2xl">
                    {pillar.title}
                  </h3>
                </div>
                <span className="mt-8 inline-block h-px w-12 bg-accent transition-all duration-500 group-hover:w-full sm:mt-10 sm:w-0" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
