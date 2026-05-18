"use client";

import { site } from "@/content/site";
import { Reveal } from "./Reveal";
import { useState } from "react";

export function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="border-t border-line bg-paper py-20 sm:py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-muted sm:tracking-[0.4em]">
              Contact
            </p>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,11vw,3rem)] font-semibold uppercase leading-none tracking-tight sm:mt-6 md:text-5xl">
              {site.contact.title}
            </h2>
            <p className="mt-5 max-w-md font-mono text-[11px] uppercase leading-[1.75] tracking-[0.08em] text-ink-muted sm:mt-6 sm:leading-relaxed sm:tracking-[0.12em]">
              {site.contact.description}
            </p>
            <div className="mt-8 space-y-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] sm:mt-10 sm:tracking-[0.15em]">
              <a
                href="mailto:hello@omnia.studio"
                className="block text-ink transition-colors hover:text-accent"
              >
                hello@omnia.studio
              </a>
              <p className="text-ink-muted">Melbourne, Australia</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {sent ? (
              <p className="border border-line p-6 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-ink-muted sm:p-10 sm:tracking-[0.15em]">
                Thank you — your message has been noted. We&apos;ll be in touch soon.
              </p>
            ) : (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:tracking-[0.25em]">
                    Name
                  </span>
                  <input
                    required
                    name="name"
                    className="mt-2 min-h-12 w-full border-b border-line bg-transparent py-3 font-mono text-base outline-none transition-colors focus:border-ink sm:text-sm"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:tracking-[0.25em]">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 min-h-12 w-full border-b border-line bg-transparent py-3 font-mono text-base outline-none transition-colors focus:border-ink sm:text-sm"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:tracking-[0.25em]">
                    Project
                  </span>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    className="mt-2 w-full resize-none border-b border-line bg-transparent py-3 font-mono text-base outline-none transition-colors focus:border-ink sm:text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-4 border border-ink px-6 py-4 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-paper sm:mt-4 sm:w-auto sm:px-8 sm:tracking-[0.2em]"
                >
                  Send inquiry
                  <span className="h-px w-6 bg-ink transition-all group-hover:w-10 group-hover:bg-paper" />
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
