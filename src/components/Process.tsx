import { Reveal } from "./Reveal";

const steps = [
  {
    num: "01",
    title: "Listen & map",
    text: "Site, light, ritual, and intent — translated into spatial diagrams and atmospheric briefs.",
  },
  {
    num: "02",
    title: "Compose",
    text: "Material palettes, sectional studies, and experiential sequences developed in parallel.",
  },
  {
    num: "03",
    title: "Refine",
    text: "Iterative modelling and detailing until proportion, texture, and shadow align.",
  },
  {
    num: "04",
    title: "Realise",
    text: "From concept to built environment — coordinated with craftspeople and collaborators.",
  },
];

export function Process() {
  return (
    <section className="border-t border-line bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-muted">
            04 — Method
          </p>
        </Reveal>
        <div className="mt-16 divide-y divide-line">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={0.05 * i}>
              <div className="grid gap-6 py-10 md:grid-cols-[120px_1fr_1.2fr] md:gap-12 md:py-12">
                <p className="font-mono text-sm text-accent">{step.num}</p>
                <h3 className="font-display text-2xl font-semibold uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-ink-muted">
                  {step.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
