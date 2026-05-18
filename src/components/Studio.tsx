import { site } from "@/content/site";
import Image from "next/image";
import { Reveal } from "./Reveal";

export function Studio() {
  return (
    <section id="studio" className="bg-smoke py-20 text-paper sm:py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="relative aspect-[4/5] max-h-[70svh] overflow-hidden sm:max-h-none">
              <Image
                src="/assets/IMG_4867-83e34d2d-e5ce-42ec-ba29-5a2ab76883b7.png"
                alt="Studio"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/50 sm:tracking-[0.4em]">
              Studio
            </p>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,11vw,3rem)] font-semibold uppercase leading-none tracking-tight sm:mt-6 md:text-5xl md:leading-tight">
              {site.studio.name}
            </h2>
            <p className="mt-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-paper/50 sm:mt-2 sm:tracking-[0.15em]">
              {site.studio.role}
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase leading-[1.75] tracking-[0.08em] text-paper/60 sm:mt-8 sm:leading-[1.9] sm:tracking-[0.1em]">
              {site.manifesto}
            </p>
            <a
              href="https://www.instagram.com/omnia___lab"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-11 items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:text-accent sm:mt-10 sm:tracking-[0.2em]"
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
