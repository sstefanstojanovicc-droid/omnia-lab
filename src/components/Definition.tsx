import { site } from "@/content/site";
import { Reveal } from "./Reveal";

export function Definition() {
  return (
    <section id="manifesto" className="border-t border-line bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-muted">
            Manifesto
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-12 max-w-4xl font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold uppercase leading-[1.1] tracking-[-0.02em]">
            {site.practice.title}
          </h2>
          <p className="mt-8 max-w-3xl font-mono text-[11px] uppercase leading-[1.9] tracking-[0.12em] text-ink-muted">
            {site.manifesto}
          </p>
        </Reveal>
      </div>
    </section>
  );
}