import { site } from "@/content/site";
import { Reveal } from "./Reveal";

export function Definition() {
  return (
    <section id="manifesto" className="border-t border-line bg-paper py-20 sm:py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-muted sm:tracking-[0.4em]">
            Manifesto
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-8 max-w-4xl font-display text-[clamp(2rem,11vw,3.5rem)] font-semibold uppercase leading-[1.08] tracking-[-0.03em] sm:mt-12 sm:leading-[1.1]">
            {site.practice.title}
          </h2>
          <p className="mt-6 max-w-3xl font-mono text-[11px] uppercase leading-[1.8] tracking-[0.08em] text-ink-muted sm:mt-8 sm:leading-[1.9] sm:tracking-[0.12em]">
            {site.manifesto}
          </p>
        </Reveal>
      </div>
    </section>
  );
}