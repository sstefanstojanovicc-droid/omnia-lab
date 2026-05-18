import { site } from "@/content/site";

export function Marquee() {
  const track = [...site.marquee, ...site.marquee];

  return (
    <section className="overflow-hidden border-y border-line bg-paper py-6" aria-hidden>
      <div className="marquee-track flex w-max gap-16 whitespace-nowrap">
        {track.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="font-display text-5xl font-extrabold uppercase tracking-[-0.04em] text-ink/10 md:text-7xl"
          >
            {word}
          </span>
        ))}
      </div>
    </section>
  );
}
