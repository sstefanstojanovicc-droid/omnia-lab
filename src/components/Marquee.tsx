import { site } from "@/content/site";

export function Marquee() {
  const track = [...site.marquee, ...site.marquee];

  return (
    <section className="overflow-hidden border-y border-line bg-paper py-4 sm:py-6" aria-hidden>
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap sm:gap-16">
        {track.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="font-display text-4xl font-extrabold uppercase tracking-[-0.04em] text-ink/10 sm:text-5xl md:text-7xl"
          >
            {word}
          </span>
        ))}
      </div>
    </section>
  );
}
