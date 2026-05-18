import { Reveal } from "./Reveal";

export function Definition() {
  return (
    <section id="definition" className="border-t border-line bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-muted">
            01 — Lexicon
          </p>
        </Reveal>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <Reveal delay={0.1}>
            <h2 className="blur-word font-display text-[clamp(3rem,10vw,7rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">
              OMNIA
              <span className="align-super text-[0.2em] font-normal">™</span>
            </h2>
            <p className="mt-8 max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-ink-muted">
              A multidisciplinary practice exploring totality in built form — from
              intimate interiors to immersive spatial narratives.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-[auto_1fr] md:gap-16">
              <p className="font-mono text-sm tracking-wide text-ink-muted">
                [&apos;ɔm.ni.a]
              </p>
              <div className="space-y-10 font-mono text-[11px] uppercase leading-[1.9] tracking-[0.12em]">
                <div>
                  <p className="text-ink-muted">1 — Noun</p>
                  <p className="mt-2 text-ink">
                    &ldquo;All things&rdquo; or &ldquo;everything&rdquo; (neuter plural);
                  </p>
                </div>
                <div>
                  <p className="text-ink-muted">2 — Adjective</p>
                  <p className="mt-2 text-ink">
                    A sense of totality, limitlessness, and completeness; &ldquo;for
                    all&rdquo;;
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
