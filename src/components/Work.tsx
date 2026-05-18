"use client";

import { site } from "@/content/site";
import Image from "next/image";
import { Reveal } from "./Reveal";

const images = [
  "/assets/IMG_4865-2fec0a4f-3524-41b4-b336-1d3821bdb8f3.png",
  "/assets/IMG_4866-8db29384-d39a-4f55-a8aa-adff5fef665b.png",
  "/assets/IMG_4867-83e34d2d-e5ce-42ec-ba29-5a2ab76883b7.png",
  "/assets/IMG_4868-0aedb791-8f0a-4176-bb13-3e29074eb3a4.png",
];

const spans = [
  "md:col-span-2 md:row-span-2",
  "",
  "",
  "md:col-span-2",
];

export function Work() {
  return (
    <section id="work" className="border-t border-line bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-muted">
                Work
              </p>
              <h2 className="mt-6 font-display text-4xl font-semibold uppercase tracking-tight md:text-5xl">
                {site.practice.label}
              </h2>
            </div>
            <p className="max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ink-muted">
              {site.practice.description}
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid auto-rows-[220px] grid-cols-1 gap-4 md:auto-rows-[260px] md:grid-cols-3">
          {site.sectors.map((sector, i) => (
            <Reveal key={sector.title} delay={0.06 * i} className={spans[i] ?? ""}>
              <article className="work-card group relative h-full min-h-[220px] overflow-hidden bg-smoke">
                <Image
                  src={images[i] ?? images[0]}
                  alt={sector.title}
                  fill
                  className="object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
                  <h3 className="font-display text-xl font-semibold uppercase tracking-tight">
                    {sector.title}
                  </h3>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
