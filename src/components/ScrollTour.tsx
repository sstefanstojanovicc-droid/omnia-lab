"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArchitectureBuildLayers,
  type ArchitectureBuildLayersHandle,
} from "./ArchitectureBuildLayers";
import {
  HANDOFF_STRUCTURE_ENVELOPE,
  bindScrubVideo,
  prepareScrubVideo,
  roomLocalProgress,
  roomOpacity,
  roomOpacityHardCut,
  scrollProgressFromSection,
  scrubTimeFromLocal,
  scrubVideoTo,
  type ClipScrubRange,
} from "@/lib/scrollScrub";

/** One stitched scroll-scrub file (best). See scripts/generate-scroll-tour-higgsfield.md */
const TOUR_VIDEO = "/video/tour.mp4";
const FALLBACK_VIDEO = "/video/hero.mp4";

export type TourRoom = {
  id: string;
  index: string;
  title: string;
  headline?: string;
  body: string;
  clip?: string;
  /** Limit which part of the mp4 is driven by scroll (post-trim or in-file range). */
  clipScrub?: ClipScrubRange;
  cta?: { label: string; href: string; primary?: boolean };
};

/** Architecture build timeline — scroll scrubs one continuous sequence (vertical scroll → horizontal time). */
export const TOUR_ROOMS: TourRoom[] = [
  {
    id: "concept",
    index: "01",
    title: "Concept",
    headline: "Planning & massing",
    body: "Hand sketches, site diagrams, and elevation studies — the first translation of intent into measurable form.",
    clip: "/video/room-01.mp4",
  },
  {
    id: "cad",
    index: "02",
    title: "CAD / BIM",
    headline: "Technical design",
    body: "Wireframe structure, sections, and coordinated systems — precision before ground breaks.",
    clip: "/video/room-02.mp4",
  },
  {
    id: "structure",
    index: "03",
    title: "Structure",
    headline: "Concrete shell",
    body: "Grey phase: cast-in-place structure, slab edges, and raw tectonic volume on site.",
    clip: "/video/room-03.mp4",
    /** Ends at SSIM-matched 7.6s (front-corner concrete). */
    clipScrub: { in: 0.68, out: 0.945 },
  },
  {
    id: "envelope",
    index: "04",
    title: "Envelope",
    headline: "Glazing & facade",
    body: "Curtain wall, openings, and cladding layered onto the frame — light and weather sealed.",
    clip: "/video/room-04.mp4",
    /** Trimmed from full @ 3.3s — frame 0 matches structure end; scroll through window install. */
  },
  {
    id: "complete",
    index: "05",
    title: "Built form",
    headline: "Exterior complete",
    body: "Landscape, material patina, and dusk light — architecture readable as a single composed object.",
    clip: "/video/room-05.mp4",
  },
  {
    id: "approach",
    index: "06",
    title: "Approach",
    headline: "Cinematic arrival",
    body: "Slow push toward the main entry — scale, threshold, and anticipation before crossing the line.",
    clip: "/video/room-06.mp4",
  },
  {
    id: "arrival",
    index: "07",
    title: "Arrival",
    headline: "Through the door",
    body: "Doors open; camera enters the main volume — interior architecture revealed as lived space.",
    clip: "/video/room-07.mp4",
    cta: { label: "View our work", href: "#work", primary: true },
  },
];

const ROOM_COUNT = TOUR_ROOMS.length;
const SCROLL_VH = ROOM_COUNT * 100;
const STRUCTURE_ROOM_INDEX = TOUR_ROOMS.findIndex((r) => r.id === "structure");
const ENVELOPE_ROOM_INDEX = TOUR_ROOMS.findIndex((r) => r.id === "envelope");

function roomVisualOpacity(globalProgress: number, roomIndex: number): number {
  if (STRUCTURE_ROOM_INDEX >= 0 && ENVELOPE_ROOM_INDEX >= 0) {
    return roomOpacityHardCut(
      globalProgress,
      roomIndex,
      STRUCTURE_ROOM_INDEX,
      ENVELOPE_ROOM_INDEX,
      ROOM_COUNT,
    );
  }
  return roomOpacity(globalProgress, roomIndex, ROOM_COUNT);
}

export function ScrollTour() {
  const containerRef = useRef<HTMLElement>(null);
  const tourVideoRef = useRef<HTMLVideoElement>(null);
  const clipRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const buildLayersRef = useRef<ArchitectureBuildLayersHandle>(null);

  const progressRef = useRef(0);
  const videoModeRef = useRef<"tour" | "rooms" | "hero">("hero");
  const clipsReadyRef = useRef<boolean[]>(Array(ROOM_COUNT).fill(false));
  const clipAvailableRef = useRef<boolean[]>(Array(ROOM_COUNT).fill(false));

  const [videoMode, setVideoMode] = useState<"tour" | "rooms" | "hero">("hero");
  const [clipAvailable, setClipAvailable] = useState<boolean[]>(() =>
    Array(ROOM_COUNT).fill(false),
  );
  const [clipsReady, setClipsReady] = useState<boolean[]>(() =>
    Array(ROOM_COUNT).fill(false),
  );
  const [activeRoom, setActiveRoom] = useState(0);
  /** UI-only snapshot; scroll loop does not call setState per frame */
  const [progressUi, setProgressUi] = useState(0);

  useEffect(() => {
    videoModeRef.current = videoMode;
  }, [videoMode]);

  useEffect(() => {
    clipsReadyRef.current = clipsReady;
  }, [clipsReady]);

  useEffect(() => {
    clipAvailableRef.current = clipAvailable;
  }, [clipAvailable]);

  useEffect(() => {
    const detect = async () => {
      try {
        if ((await fetch(TOUR_VIDEO, { method: "HEAD" })).ok) {
          setVideoMode("tour");
          return;
        }
      } catch {
        /* fall through */
      }

      const available = await Promise.all(
        TOUR_ROOMS.map(async (room) => {
          if (!room.clip) return false;
          try {
            return (await fetch(room.clip, { method: "HEAD" })).ok;
          } catch {
            return false;
          }
        }),
      );
      setClipAvailable(available);
      clipAvailableRef.current = available;

      if (available.some(Boolean)) {
        setVideoMode("rooms");
        return;
      }
      setVideoMode("hero");
    };
    detect();
  }, []);

  const syncOverlay = useCallback((p: number) => {
    progressRef.current = p;
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${p * 100}%`;
    }

    const roomIdx = Math.min(ROOM_COUNT - 1, Math.floor(p * ROOM_COUNT));
    const mode = videoModeRef.current;
    const available = clipAvailableRef.current;
    const ready = clipsReadyRef.current;
    const activeClipLive =
      mode === "rooms" && available[roomIdx] && ready[roomIdx];

    buildLayersRef.current?.setProgress(
      mode === "hero" || (mode === "rooms" && !activeClipLive) ? p : 0,
    );

    for (let i = 0; i < ROOM_COUNT; i++) {
      const opacity = roomVisualOpacity(p, i);
      const copy = copyRefs.current[i];
      if (copy) {
        copy.style.opacity = String(opacity);
        copy.style.visibility = opacity < 0.02 ? "hidden" : "visible";
        copy.setAttribute("aria-hidden", opacity < 0.1 ? "true" : "false");
      }
      const nav = navRefs.current[i];
      if (nav) {
        nav.classList.toggle("text-white", roomIdx === i);
        nav.classList.toggle("text-white/25", roomIdx !== i);
      }
      const video = clipRefs.current[i];
      if (video && available[i] && ready[i]) {
        video.style.opacity = String(opacity);
      }
    }
  }, []);

  const syncPlayback = useCallback((p: number) => {
    const mode = videoModeRef.current;

    if (mode === "tour" || mode === "hero") {
      const video = tourVideoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;
      scrubVideoTo(video, p * video.duration);
      return;
    }

    for (let i = 0; i < ROOM_COUNT; i++) {
      if (!clipAvailableRef.current[i] || !clipsReadyRef.current[i]) continue;
      const video = clipRefs.current[i];
      if (!video || !Number.isFinite(video.duration)) continue;

      const opacity = roomVisualOpacity(p, i);
      if (opacity < 0.02) continue;

      const room = TOUR_ROOMS[i];
      let local = roomLocalProgress(p, i, ROOM_COUNT);
      let time: number;

      if (i === STRUCTURE_ROOM_INDEX) {
        if (local > 0.92) local = 1;
        time = scrubTimeFromLocal(local, video.duration, room?.clipScrub);
        if (local >= 0.98) {
          time = Math.min(
            video.duration - 0.001,
            HANDOFF_STRUCTURE_ENVELOPE.structureEndSec,
          );
        }
      } else if (i === ENVELOPE_ROOM_INDEX) {
        if (local < 0.06) local = 0;
        time = scrubTimeFromLocal(local, video.duration, room?.clipScrub);
        if (local <= 0.02) {
          time = 0;
        }
      } else {
        time = scrubTimeFromLocal(local, video.duration, room?.clipScrub);
      }

      scrubVideoTo(video, time);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let lastUi = -1;
    let lastRoom = -1;

    const tick = () => {
      const p = scrollProgressFromSection(container);
      syncOverlay(p);
      syncPlayback(p);

      const roomIdx = Math.min(ROOM_COUNT - 1, Math.floor(p * ROOM_COUNT));
      if (roomIdx !== lastRoom) {
        lastRoom = roomIdx;
        setActiveRoom(roomIdx);
      }
      if (Math.abs(p - lastUi) > 0.008) {
        lastUi = p;
        setProgressUi(p);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [syncOverlay, syncPlayback]);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const tour = tourVideoRef.current;
    if (tour) {
      prepareScrubVideo(tour);
      cleanups.push(bindScrubVideo(tour));
    }
    clipRefs.current.forEach((video) => {
      if (!video) return;
      prepareScrubVideo(video);
      cleanups.push(bindScrubVideo(video));
    });
    return () => cleanups.forEach((fn) => fn());
  }, [videoMode, clipAvailable, clipsReady]);

  const activeClipLive =
    videoMode === "rooms" &&
    clipAvailable[activeRoom] &&
    clipsReady[activeRoom];
  const showBuildLayers =
    videoMode === "hero" || (videoMode === "rooms" && !activeClipLive);

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative bg-smoke"
      style={{ height: `${SCROLL_VH}vh` }}
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0 isolate">
          <div className="hero-fallback absolute inset-0" aria-hidden />
          {showBuildLayers ? (
            <ArchitectureBuildLayers ref={buildLayersRef} />
          ) : null}

          {videoMode === "tour" || videoMode === "hero" ? (
            <video
              ref={tourVideoRef}
              className="scroll-tour-video absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              preload="auto"
              aria-hidden
            >
              <source
                src={videoMode === "tour" ? TOUR_VIDEO : FALLBACK_VIDEO}
                type="video/mp4"
              />
            </video>
          ) : (
            TOUR_ROOMS.map((room, i) =>
              clipAvailable[i] && room.clip ? (
                <video
                  key={room.id}
                  ref={(el) => {
                    clipRefs.current[i] = el;
                  }}
                  className="scroll-tour-video absolute inset-0 h-full w-full object-cover"
                  style={{ opacity: 0 }}
                  src={room.clip}
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden
                  onLoadedData={() => {
                    const el = clipRefs.current[i];
                    if (el && Number.isFinite(el.duration)) {
                      const room = TOUR_ROOMS[i];
                      const start = scrubTimeFromLocal(
                        0,
                        el.duration,
                        room?.clipScrub,
                      );
                      scrubVideoTo(el, start);
                    }
                    setClipsReady((prev) => {
                      const next = [...prev];
                      next[i] = true;
                      clipsReadyRef.current = next;
                      return next;
                    });
                  }}
                  onError={() => {
                    setClipAvailable((prev) => {
                      const next = [...prev];
                      next[i] = false;
                      clipAvailableRef.current = next;
                      return next;
                    });
                    setClipsReady((prev) => {
                      const next = [...prev];
                      next[i] = false;
                      clipsReadyRef.current = next;
                      return next;
                    });
                  }}
                />
              ) : null,
            )
          )}

          <div
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/25"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex h-full flex-col px-6 pb-16 pt-24 md:px-12 md:pb-20">
          <div className="flex items-start justify-end">
            <div className="flex flex-col items-end gap-2">
              {TOUR_ROOMS.map((room, i) => (
                <span
                  key={room.id}
                  ref={(el) => {
                    navRefs.current[i] = el;
                  }}
                  className={`font-mono text-[9px] uppercase tracking-[0.35em] transition-colors duration-300 ${
                    activeRoom === i ? "text-white" : "text-white/25"
                  }`}
                >
                  {room.index}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mt-auto min-h-[220px] flex-1 md:min-h-[260px]">
            {TOUR_ROOMS.map((room, i) => {
              const opacity = roomVisualOpacity(progressUi, i);
              return (
                <div
                  key={room.id}
                  ref={(el) => {
                    copyRefs.current[i] = el;
                  }}
                  className="pointer-events-none absolute inset-x-0 bottom-0 max-w-xl md:max-w-2xl"
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/50">
                    {room.index} — {room.id.replace(/-/g, " ")}
                  </p>
                  <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-semibold uppercase leading-[1.05] tracking-[-0.02em] text-white">
                    {room.title}
                  </h1>
                  {room.headline ? (
                    <p className="mt-2 font-display text-xl font-normal italic normal-case tracking-[0.02em] text-white/85 md:text-2xl">
                      {room.headline}
                    </p>
                  ) : null}
                  <p className="mt-5 max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-white/55">
                    {room.body}
                  </p>
                  {room.cta && opacity > 0.5 ? (
                    <div className="pointer-events-auto mt-8 flex flex-wrap gap-4">
                      <Link
                        href={room.cta.href}
                        className={`inline-flex min-w-[180px] items-center justify-center px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                          room.cta.primary
                            ? "border border-white bg-white text-ink hover:bg-transparent hover:text-white"
                            : "border border-white/40 text-white hover:border-white hover:bg-white/10"
                        }`}
                      >
                        {room.cta.label}
                      </Link>
                      <Link
                        href="#contact"
                        className="inline-flex min-w-[180px] items-center justify-center border border-white/40 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:border-white hover:bg-white/10"
                      >
                        Begin a project
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between gap-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/40">
              Scroll — build timeline
            </span>
            <div className="h-px flex-1 max-w-[200px] overflow-hidden bg-white/15">
              <div
                ref={progressBarRef}
                className="h-full bg-white/70"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
