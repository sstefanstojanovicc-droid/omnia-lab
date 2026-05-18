"use client";

import { LOGO } from "@/components/Logo";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const REVEAL_MS = 1400;
const HOLD_MS = 280;
const EXIT_MS = 520;

export function SiteLoader() {
  const [mounted, setMounted] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [tourReady, setTourReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReveal(true));
    const onReady = () => setTourReady(true);
    const fallback = window.setTimeout(() => setTourReady(true), 9000);

    window.addEventListener("omnia-tour-ready", onReady);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.removeEventListener("omnia-tour-ready", onReady);
    };
  }, []);

  useEffect(() => {
    if (!animDone || !tourReady) return;
    const id = window.setTimeout(() => setMounted(false), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [animDone, tourReady]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [mounted]);

  return (
    <AnimatePresence>
      {mounted ? (
        <motion.div
          key="site-loader"
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden={!mounted}
          aria-busy={mounted}
          role="status"
          aria-label="Loading"
        >
          <motion.div
            className="relative h-[clamp(52px,12vw,88px)] w-[min(72vw,320px)] overflow-hidden"
            initial={{ clipPath: "inset(0 100% 0 0 round 0px)" }}
            animate={
              reveal
                ? { clipPath: "inset(0 0% 0 0 round 0px)" }
                : { clipPath: "inset(0 100% 0 0 round 0px)" }
            }
            transition={{
              duration: REVEAL_MS / 1000,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={() => setAnimDone(true)}
          >
            <Image
              src={LOGO.light}
              alt="OMNIA"
              width={520}
              height={141}
              priority
              className="h-full w-auto max-w-none object-left object-contain"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
