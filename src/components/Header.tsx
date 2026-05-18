"use client";

import { Logo } from "@/components/Logo";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "#practice", label: "Practice" },
  { href: "#work", label: "Work" },
  { href: "#studio", label: "Studio" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 120], [0.85, 1]);

  useEffect(() => {
    const onScroll = () => {
      const tour = document.getElementById("top");
      const tourEnd = tour?.offsetHeight ?? 0;
      const pastTour =
        tourEnd > 0 && window.scrollY > tourEnd - window.innerHeight - 24;
      setScrolled(pastTour || (!tour && window.scrollY > 48));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const onHero = !scrolled && !menuOpen;

  return (
    <>
      <motion.header
        style={{ opacity: headerOpacity }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled || menuOpen
            ? "border-b border-line bg-paper/85 backdrop-blur-md"
            : "bg-transparent"
        } ${onHero ? "text-white" : "text-ink"}`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link
            href="/"
            className="group block transition-opacity hover:opacity-85"
            onClick={() => setMenuOpen(false)}
          >
            <Logo
              variant={onHero ? "light" : "dark"}
              priority
              className="h-7 w-auto md:h-8"
            />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                  onHero
                    ? "text-white/65 hover:text-white"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-px w-6 transition-transform duration-300 ${
                onHero && !menuOpen ? "bg-white" : "bg-ink"
              } ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 transition-opacity duration-300 ${
                onHero && !menuOpen ? "bg-white" : "bg-ink"
              } ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-6 transition-transform duration-300 ${
                onHero && !menuOpen ? "bg-white" : "bg-ink"
              } ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </motion.header>

      <motion.div
        initial={false}
        animate={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        className="fixed inset-0 z-40 bg-paper md:hidden"
      >
        <nav className="flex h-full flex-col justify-center gap-8 px-10">
          {links.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={menuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: menuOpen ? 0.05 * i : 0 }}
            >
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-4xl font-semibold uppercase tracking-tight"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>
    </>
  );
}