import Image from "next/image";
import { Reveal } from "./Reveal";

export function Studio() {
  return (
    <section id="studio" className="bg-smoke py-24 text-paper md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/assets/IMG_4867-83e34d2d-e5ce-42ec-ba29-5a2ab76883b7.png"
                alt="Studio research and drawing"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-paper/50">
              05 — Studio
            </p>
            <h2 className="mt-6 font-display text-4xl font-semibold uppercase leading-tight tracking-tight md:text-5xl">
              Dina Rosic
            </h2>
            <p className="mt-8 font-mono text-[11px] uppercase leading-[1.9] tracking-[0.1em] text-paper/60">
              Architect and interior designer. Founder of OMNIA — a practice born from
              the belief that space should hold everything at once: restraint and drama,
              precision and atmosphere, the technical and the poetic.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase leading-[1.9] tracking-[0.1em] text-paper/60">
              Drawing from cinematic interiors, experimental material studies, and
              rigorous architectural thinking, the studio works across residential,
              hospitality, and conceptual spatial projects.
            </p>
            <a
              href="https://www.instagram.com/omnia___lab"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-colors hover:text-accent"
            >
              @omnia___lab
              <span className="h-px w-8 bg-paper/40" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
