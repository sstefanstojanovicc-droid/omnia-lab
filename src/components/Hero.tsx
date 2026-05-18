"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HERO_VIDEO = "/video/hero.mp4";
const HERO_POSTER = "/assets/hero-poster.jpg";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => undefined);
    };

    const onLoaded = () => {
      setVideoReady(true);
      tryPlay();
    };

    video.addEventListener("canplay", onLoaded);
    if (video.readyState >= 3) onLoaded();

    return () => video.removeEventListener("canplay", onLoaded);
  }, []);

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative isolate h-[100svh] min-h-[560px] w-full overflow-hidden bg-smoke"
    >
      {/* Background video — indulgerenovations-style full-bleed */}
      <div className="absolute inset-0 z-0">
        <div
          className={`hero-fallback absolute inset-0 transition-opacity duration-[1.4s] ease-out ${
            videoReady ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1.4s] ease-out ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={HERO_POSTER}
          aria-hidden
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/20"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"
          aria-hidden
        />
      </div>

      {/* Foreground content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-20 pt-24 text-center md:px-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/55">
            Est. 2026
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2rem,5.5vw,3.75rem)] font-semibold uppercase leading-[1.1] tracking-[-0.02em] text-white">
            Immersive Spaces,
            <br />
            <span className="font-normal italic normal-case tracking-[0.02em] text-white/90">
              Timeless Design
            </span>
          </h1>

          <p className="mt-5 max-w-lg font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-white/50">
            Architecture & interior design by Dina Rosic
          </p>

          <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="#work"
              className="inline-flex min-w-[200px] items-center justify-center border border-white bg-white px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-transparent hover:text-white"
            >
              View our work
            </Link>
            <Link
              href="#contact"
              className="inline-flex min-w-[200px] items-center justify-center border border-white/40 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Begin a project
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/40">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="block h-8 w-px bg-white/35"
        />
      </motion.div>
    </section>
  );
}
