"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

const PHASES = [
  { start: 0, end: 0.16, className: "phase-blueprint" },
  { start: 0.12, end: 0.3, className: "phase-cad" },
  { start: 0.26, end: 0.44, className: "phase-structure" },
  { start: 0.4, end: 0.58, className: "phase-envelope" },
  { start: 0.54, end: 0.72, className: "phase-complete" },
  { start: 0.68, end: 0.88, className: "phase-approach" },
  { start: 0.84, end: 1, className: "phase-interior" },
] as const;

function phaseOpacity(progress: number, start: number, end: number): number {
  const fade = (end - start) * 0.35;
  if (progress < start - fade || progress > end + fade) return 0;
  if (progress < start + fade) return (progress - (start - fade)) / (fade * 2);
  if (progress > end - fade) return (end + fade - progress) / (fade * 2);
  return 1;
}

export type ArchitectureBuildLayersHandle = {
  setProgress: (progress: number) => void;
};

/** Scroll-driven build phases when tour/room videos are absent. */
export const ArchitectureBuildLayers = forwardRef<
  ArchitectureBuildLayersHandle,
  object
>(function ArchitectureBuildLayers(_props, ref) {
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    setProgress(progress: number) {
      PHASES.forEach((phase, i) => {
        const el = phaseRefs.current[i];
        if (!el) return;
        el.style.opacity = String(
          phaseOpacity(progress, phase.start, phase.end),
        );
      });
      if (lineRef.current) {
        lineRef.current.style.transform = `scaleX(${0.15 + progress * 0.85})`;
      }
    },
  }));

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {PHASES.map((phase, i) => (
        <div
          key={phase.className}
          ref={(el) => {
            phaseRefs.current[i] = el;
          }}
          className={`arch-build-layer ${phase.className}`}
          style={{ opacity: 0 }}
        />
      ))}
      <div
        ref={lineRef}
        className="absolute inset-x-0 bottom-[18%] h-px origin-left bg-white/20"
        style={{ transform: "scaleX(0.15)" }}
      />
    </div>
  );
});
