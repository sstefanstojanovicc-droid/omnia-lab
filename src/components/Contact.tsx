"use client";

import { Reveal } from "./Reveal";
import { useState } from "react";

export function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="border-t border-line bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-muted">
              06 — Contact
            </p>
            <h2 className="mt-6 font-display text-4xl font-semibold uppercase tracking-tight md:text-5xl">
              Begin a project
            </h2>
            <p className="mt-6 max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ink-muted">
              For commissions, collaborations, and press — share your vision. We respond
              within a few business days.
            </p>
            <div className="mt-10 space-y-3 font-mono text-[11px] uppercase tracking-[0.15em]">
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
              <p className="border border-line p-10 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
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
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                    Name
                  </span>
                  <input
                    required
                    name="name"
                    className="mt-2 w-full border-b border-line bg-transparent py-3 font-mono text-sm outline-none transition-colors focus:border-ink"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 w-full border-b border-line bg-transparent py-3 font-mono text-sm outline-none transition-colors focus:border-ink"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                    Project
                  </span>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    className="mt-2 w-full resize-none border-b border-line bg-transparent py-3 font-mono text-sm outline-none transition-colors focus:border-ink"
                  />
                </label>
                <button
                  type="submit"
                  className="group mt-4 inline-flex items-center gap-4 border border-ink px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper"
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
