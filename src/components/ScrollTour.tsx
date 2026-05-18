"use client";

import { site } from "@/content/site";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArchitectureBuildLayers,
  type ArchitectureBuildLayersHandle,
} from "./ArchitectureBuildLayers";
import {
  HANDOFF_STRUCTURE_ENVELOPE,
  activeHandoffAt,
  bindScrubVideo,
  handoffDissolveLocal,
  isInHandoffBlend,
  prepareScrubVideo,
  roomLocalProgress,
  roomOpacity,
  roomOpacityDissolve,
  scrollProgressFromSection,
  scrubTimeFromLocal,
  scrubVideoTo,
  type ClipScrubRange,
} from "@/lib/scrollScrub";

/** One stitched scroll-scrub file (best). See scripts/generate-scroll-tour-higgsfield.md */
const TOUR_VIDEO = "/video/tour.mp4";
const FALLBACK_VIDEO = "/video/hero.mp4";
const HERO_POSTER = "/video/room-01-endframe.jpg";

export type TourRoom = {
  id: string;
  index: string;
  title: string;
  headline?: string;
  body: string;
  clip?: string;
  poster?: string;
  /** Limit which part of the mp4 is driven by scroll (post-trim or in-file range). */
  clipScrub?: ClipScrubRange;
  cta?: { label: string; href: string; primary?: boolean };
};

const TOUR_CLIPS: Pick<
  TourRoom,
  "id" | "clip" | "poster" | "clipScrub" | "cta"
>[] = [
  {
    id: "concept",
    clip: "/video/room-01.mp4",
    poster: "/video/room-01-endframe.jpg",
  },
  {
    id: "cad",
    clip: "/video/room-02.mp4",
    poster: "/video/room-02-endframe.jpg",
  },
  {
    id: "structure",
    clip: "/video/room-03.mp4",
    poster: "/video/room-03-endframe.jpg",
    clipScrub: { in: 0.68, out: 0.945 },
  },
  {
    id: "envelope",
    clip: "/video/room-04.mp4",
    poster: "/video/room-04-startframe.jpg",
  },
  {
    id: "complete",
    clip: "/video/room-05.mp4",
    poster: "/video/room-05-startframe.jpg",
  },
  {
    id: "approach",
    clip: "/video/room-06.mp4",
    poster: "/video/room-06-endframe.jpg",
  },
  {
    id: "arrival",
    clip: "/video/room-07.mp4",
    poster: "/video/room-06-endframe.jpg",
    cta: { label: "View work", href: "#work", primary: true },
  },
];

/** Scroll-scrub build sequence — copy from site, clips merged locally. */
export const TOUR_ROOMS: TourRoom[] = site.tour.map((room) => {
  const clip = TOUR_CLIPS.find((c) => c.id === room.id);
  return { ...room, ...clip };
});

const ROOM_COUNT = TOUR_ROOMS.length;
const SCROLL_VH = ROOM_COUNT * 100;
const STRUCTURE_ROOM_INDEX = TOUR_ROOMS.findIndex((r) => r.id === "structure");
const ENVELOPE_ROOM_INDEX = TOUR_ROOMS.findIndex((r) => r.id === "envelope");

/** Every adjacent clip pair cross-dissolves (same as rooms 01→02 that felt seamless). */
const DISSOLVE_HANDOFFS: { from: number; to: number }[] = Array.from(
  { length: ROOM_COUNT - 1 },
  (_, i) => ({ from: i, to: i + 1 }),
);

function roomVisualOpacity(globalProgress: number, roomIndex: number): number {
  const pair = activeHandoffAt(
    globalProgress,
    roomIndex,
    DISSOLVE_HANDOFFS,
    ROOM_COUNT,
  );
  if (pair) {
    return roomOpacityDissolve(
      globalProgress,
      roomIndex,
      pair.from,
      pair.to,
      ROOM_COUNT,
    );
  }
  return roomOpacity(globalProgress, roomIndex, ROOM_COUNT);
}

function inDissolveHandoff(globalProgress: number): boolean {
  for (let i = 0; i < ROOM_COUNT; i++) {
    if (
      activeHandoffAt(globalProgress, i, DISSOLVE_HANDOFFS, ROOM_COUNT) !== null
    ) {
      return true;
    }
  }
  return false;
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
  const isMobileScrubRef = useRef(false);
  const mobileAutoRoomRef = useRef(0);
  const mobilePlayingRoomRef = useRef<number | null>(null);
  const videoModeRef = useRef<"tour" | "rooms" | "hero" | "detecting">(
    "detecting",
  );
  const clipsReadyRef = useRef<boolean[]>(Array(ROOM_COUNT).fill(false));
  const clipAvailableRef = useRef<boolean[]>(Array(ROOM_COUNT).fill(false));

  const [videoMode, setVideoMode] = useState<
    "tour" | "rooms" | "hero" | "detecting"
  >("detecting");
  const [clipAvailable, setClipAvailable] = useState<boolean[]>(() =>
    Array(ROOM_COUNT).fill(false),
  );
  const [clipsReady, setClipsReady] = useState<boolean[]>(() =>
    Array(ROOM_COUNT).fill(false),
  );
  const [isMobileScrub, setIsMobileScrub] = useState(false);
  const [mobileAutoRoom, setMobileAutoRoom] = useState(0);
  const [activeRoom, setActiveRoom] = useState(0);
  /** UI-only snapshot; scroll loop does not call setState per frame */
  const [progressUi, setProgressUi] = useState(0);

  useEffect(() => {
    videoModeRef.current = videoMode;
  }, [videoMode]);

  useEffect(() => {
    isMobileScrubRef.current = isMobileScrub;
  }, [isMobileScrub]);

  useEffect(() => {
    mobileAutoRoomRef.current = mobileAutoRoom;
  }, [mobileAutoRoom]);

  useEffect(() => {
    clipsReadyRef.current = clipsReady;
  }, [clipsReady]);

  useEffect(() => {
    clipAvailableRef.current = clipAvailable;
  }, [clipAvailable]);

  useEffect(() => {
    const detect = async () => {
      const mobileQuery = window.matchMedia(
        "(max-width: 767px), (pointer: coarse)",
      );
      const mobileAutoplay = mobileQuery.matches;
      setIsMobileScrub(mobileAutoplay);

      if (!mobileAutoplay) {
        try {
          if ((await fetch(TOUR_VIDEO, { method: "HEAD" })).ok) {
            setVideoMode("tour");
            return;
          }
        } catch {
          /* fall through */
        }
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

  useEffect(() => {
    if (videoMode === "detecting") return;

    if (videoMode === "rooms") {
      const first = clipAvailable.findIndex(Boolean);
      if (first < 0) return;
      if (!clipsReady[first]) return;
    }

    window.dispatchEvent(new CustomEvent("omnia-tour-ready"));
  }, [videoMode, clipAvailable, clipsReady]);

  useEffect(() => {
    if (videoMode !== "tour") return;
    const video = tourVideoRef.current;
    if (!video) return;
    const signal = () =>
      window.dispatchEvent(new CustomEvent("omnia-tour-ready"));
    video.addEventListener("loadeddata", signal);
    if (video.readyState >= 2) signal();
    return () => video.removeEventListener("loadeddata", signal);
  }, [videoMode]);

  const markClipReady = useCallback((index: number) => {
    const el = clipRefs.current[index];
    const wasReady = clipsReadyRef.current[index];
    if (!wasReady && el && Number.isFinite(el.duration)) {
      const room = TOUR_ROOMS[index];
      const start = scrubTimeFromLocal(0, el.duration, room?.clipScrub);
      scrubVideoTo(el, start);
    }
    setClipsReady((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      clipsReadyRef.current = next;
      return next;
    });
  }, []);

  const setMobilePlaylistRoom = useCallback((index: number) => {
    const next = Math.min(ROOM_COUNT - 1, Math.max(0, index));
    mobileAutoRoomRef.current = next;
    setMobileAutoRoom(next);
    setActiveRoom(next);
  }, []);

  const advanceMobilePlaylist = useCallback(
    (fromIndex: number) => {
      const available = clipAvailableRef.current;
      for (let step = 1; step <= ROOM_COUNT; step++) {
        const next = (fromIndex + step) % ROOM_COUNT;
        if (available[next]) {
          setMobilePlaylistRoom(next);
          return;
        }
      }
    },
    [setMobilePlaylistRoom],
  );

  const updateMobileProgress = useCallback((roomIdx: number) => {
    const video = clipRefs.current[roomIdx];
    const duration = video?.duration;
    const local =
      video && duration && Number.isFinite(duration) && duration > 0
        ? video.currentTime / duration
        : 0;
    const global = Math.min(1, (roomIdx + local) / ROOM_COUNT);
    progressRef.current = global;
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${global * 100}%`;
    }
  }, []);

  const syncMobilePlayback = useCallback((roomIdx: number) => {
    if (mobilePlayingRoomRef.current !== roomIdx) {
      mobilePlayingRoomRef.current = roomIdx;
      clipRefs.current.forEach((video, i) => {
        if (!video) return;
        if (i !== roomIdx) {
          video.pause();
          return;
        }
        if (Number.isFinite(video.duration)) {
          try {
            video.currentTime = 0;
          } catch {
            /* iOS may reject seeks before decode is ready */
          }
        }
      });
    }

    const active = clipRefs.current[roomIdx];
    if (!active || !clipAvailableRef.current[roomIdx]) return;
    active.muted = true;
    active.playsInline = true;
    active.loop = false;
    if (active.paused) {
      active.play().catch(() => {
        /* muted inline autoplay can still be delayed until the browser is ready */
      });
    }
  }, []);

  const syncOverlay = useCallback((p: number) => {
    const roomIdx = Math.min(ROOM_COUNT - 1, Math.floor(p * ROOM_COUNT));
    const mode = videoModeRef.current;
    const available = clipAvailableRef.current;
    const ready = clipsReadyRef.current;
    const anyClipAvailable = available.some(Boolean);
    const displayRoomIdx =
      isMobileScrubRef.current && mode === "rooms"
        ? mobileAutoRoomRef.current
        : roomIdx;

    if (!(isMobileScrubRef.current && mode === "rooms")) {
      progressRef.current = p;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${p * 100}%`;
      }
    }

    buildLayersRef.current?.setProgress(
      mode === "hero" || (mode === "rooms" && !anyClipAvailable) ? p : 0,
    );

    for (let i = 0; i < ROOM_COUNT; i++) {
      const opacity =
        isMobileScrubRef.current && mode === "rooms"
          ? displayRoomIdx === i
            ? 1
            : 0
          : roomVisualOpacity(p, i);
      const copy = copyRefs.current[i];
      if (copy) {
        copy.style.opacity = String(opacity);
        copy.style.visibility = opacity < 0.02 ? "hidden" : "visible";
        copy.setAttribute("aria-hidden", opacity < 0.1 ? "true" : "false");
      }
      const nav = navRefs.current[i];
      if (nav) {
        nav.classList.toggle("text-white", displayRoomIdx === i);
        nav.classList.toggle("text-white/25", displayRoomIdx !== i);
      }
      const video = clipRefs.current[i];
      if (video && available[i] && ready[i]) {
        video.style.opacity = String(opacity);
      }
    }
  }, []);

  const syncPlayback = useCallback((p: number) => {
    const mode = videoModeRef.current;

    if (mode === "detecting") return;

    if (isMobileScrubRef.current && mode === "rooms") {
      const roomIdx = mobileAutoRoomRef.current;
      syncMobilePlayback(roomIdx);
      return;
    }

    if (mode === "tour" || mode === "hero") {
      const video = tourVideoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;
      scrubVideoTo(video, p * video.duration);
      return;
    }

    const handoff = inDissolveHandoff(p);

    for (let i = 0; i < ROOM_COUNT; i++) {
      if (!clipAvailableRef.current[i] || !clipsReadyRef.current[i]) continue;
      const video = clipRefs.current[i];
      if (!video || !Number.isFinite(video.duration)) continue;

      const opacity = roomVisualOpacity(p, i);
      const pair = activeHandoffAt(p, i, DISSOLVE_HANDOFFS, ROOM_COUNT);
      const isHandoffClip = pair !== null;
      if (!handoff && opacity < 0.04) continue;
      if (handoff && !isHandoffClip && opacity < 0.04) continue;

      const room = TOUR_ROOMS[i];
      let local = roomLocalProgress(p, i, ROOM_COUNT);
      let time: number;

      const inBlend =
        pair !== null && isInHandoffBlend(p, pair.from, ROOM_COUNT);

      if (pair && i === pair.from) {
        if (inBlend || local > 0.88) local = 1;
        time = scrubTimeFromLocal(local, video.duration, room?.clipScrub);
        if (i === STRUCTURE_ROOM_INDEX && (inBlend || local >= 0.98)) {
          time = Math.min(
            video.duration - 0.001,
            HANDOFF_STRUCTURE_ENVELOPE.structureEndSec,
          );
        } else if (inBlend || local >= 0.98) {
          time = video.duration - 0.001;
        }
      } else if (pair && i === pair.to) {
        if (inBlend) {
          const introMax = i === ENVELOPE_ROOM_INDEX ? 0.42 : 0.35;
          local = handoffDissolveLocal(p, pair.from, ROOM_COUNT, introMax);
        } else if (local < 0.08) {
          local = 0;
        }
        time = scrubTimeFromLocal(local, video.duration, room?.clipScrub);
        if (!inBlend && local <= 0.03) {
          time = 0;
        }
      } else {
        time = scrubTimeFromLocal(local, video.duration, room?.clipScrub);
      }

      scrubVideoTo(video, time);
    }
  }, [syncMobilePlayback]);

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

      const roomIdx =
        isMobileScrubRef.current && videoModeRef.current === "rooms"
          ? mobileAutoRoomRef.current
          : Math.min(ROOM_COUNT - 1, Math.floor(p * ROOM_COUNT));
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
  }, [videoMode, clipAvailable]);

  const anyClipAvailable = clipAvailable.some(Boolean);
  /** CSS placeholders only when no mp4s exist — never overlay real clips. */
  const showBuildLayers =
    videoMode === "hero" || (videoMode === "rooms" && !anyClipAvailable);

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative bg-smoke"
      style={{ height: `${SCROLL_VH}vh` }}
    >
      <div className="sticky top-0 h-[100svh] min-h-[100svh] w-full overflow-hidden md:min-h-[560px]">
        <div className="absolute inset-0 z-0 isolate">
          <div
            className="hero-fallback absolute inset-0 pointer-events-none transition-opacity duration-300"
            aria-hidden
          />
          {showBuildLayers ? (
            <ArchitectureBuildLayers ref={buildLayersRef} />
          ) : null}

          {videoMode === "tour" || videoMode === "hero" ? (
            <video
              ref={tourVideoRef}
              className="scroll-tour-video absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              poster={HERO_POSTER}
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
                  style={{
                    opacity: 0,
                    zIndex: 10 + i,
                  }}
                  src={room.clip}
                  poster={room.poster ?? HERO_POSTER}
                  muted
                  playsInline
                  autoPlay={isMobileScrub && i === mobileAutoRoom}
                  loop={false}
                  preload={
                    isMobileScrub && i > mobileAutoRoom + 1
                      ? "metadata"
                      : "auto"
                  }
                  aria-hidden
                  onLoadedMetadata={() => markClipReady(i)}
                  onLoadedData={() => markClipReady(i)}
                  onCanPlay={() => markClipReady(i)}
                  onTimeUpdate={() => {
                    if (isMobileScrub && i === mobileAutoRoom) {
                      updateMobileProgress(i);
                    }
                  }}
                  onEnded={() => {
                    if (isMobileScrub) {
                      advanceMobilePlaylist(i);
                    }
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

        <div className="relative z-10 flex h-full flex-col px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-20 sm:px-6 sm:pb-12 sm:pt-24 md:px-12 md:pb-20">
          <div className="flex items-start justify-end">
            <div className="flex flex-col items-end gap-1.5 sm:gap-2">
              {TOUR_ROOMS.map((room, i) => (
                <span
                  key={room.id}
                  ref={(el) => {
                    navRefs.current[i] = el;
                  }}
                  className={`font-mono text-[8px] uppercase tracking-[0.28em] transition-colors duration-300 sm:text-[9px] sm:tracking-[0.35em] ${
                    activeRoom === i ? "text-white" : "text-white/25"
                  }`}
                >
                  {room.index}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mt-auto min-h-[min(48svh,260px)] flex-1 md:min-h-[260px]">
            {TOUR_ROOMS.map((room, i) => {
              const opacity =
                isMobileScrub && videoMode === "rooms"
                  ? mobileAutoRoom === i
                    ? 1
                    : 0
                  : roomVisualOpacity(progressUi, i);
              return (
                <div
                  key={room.id}
                  ref={(el) => {
                    copyRefs.current[i] = el;
                  }}
                  className="pointer-events-none absolute inset-x-0 bottom-0 max-w-[34rem] md:max-w-2xl"
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/50 sm:text-[10px] sm:tracking-[0.45em]">
                    {i === 0 ? site.direction : `${room.index} — ${room.title}`}
                  </p>
                  <h1 className="mt-3 font-display text-[clamp(2rem,12vw,4.5rem)] font-semibold uppercase leading-[1.02] tracking-[-0.03em] text-white sm:mt-4 sm:leading-[1.05]">
                    {room.title}
                  </h1>
                  {room.headline ? (
                    <p className="mt-2 font-display text-lg font-normal italic normal-case tracking-[0.02em] text-white/85 sm:text-xl md:text-2xl">
                      {room.headline}
                    </p>
                  ) : null}
                  <p className="mt-4 max-w-md font-mono text-[10px] uppercase leading-[1.75] tracking-[0.12em] text-white/60 sm:mt-5 sm:text-[11px] sm:leading-relaxed sm:tracking-[0.16em]">
                    {room.body}
                  </p>
                  {room.cta && opacity > 0.5 ? (
                    <div className="pointer-events-auto mt-6 grid w-full gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:gap-4">
                      <Link
                        href={room.cta.href}
                        className={`inline-flex min-h-12 w-full items-center justify-center px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors sm:min-w-[180px] sm:px-8 sm:py-3.5 sm:text-[11px] sm:tracking-[0.22em] ${
                          room.cta.primary
                            ? "border border-white bg-white text-ink hover:bg-transparent hover:text-white"
                            : "border border-white/40 text-white hover:border-white hover:bg-white/10"
                        }`}
                      >
                        {room.cta.label}
                      </Link>
                      <Link
                        href="#contact"
                        className="inline-flex min-h-12 w-full items-center justify-center border border-white/40 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white/10 sm:min-w-[180px] sm:px-8 sm:py-3.5 sm:text-[11px] sm:tracking-[0.22em]"
                      >
                        Begin a project
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 sm:mt-8 sm:gap-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/40">
              Scroll
            </span>
            <div className="h-px max-w-[200px] flex-1 overflow-hidden bg-white/15">
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
