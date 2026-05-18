/** Scroll progress 0–1 from a tall section with sticky viewport. */
export function scrollProgressFromSection(section: HTMLElement): number {
  const scrollable = section.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  const rect = section.getBoundingClientRect();
  return Math.min(1, Math.max(0, -rect.top / scrollable));
}

/** Local 0–1 progress within room `index` of `roomCount` rooms. */
export function roomLocalProgress(
  globalProgress: number,
  roomIndex: number,
  roomCount: number,
): number {
  const segment = 1 / roomCount;
  const start = roomIndex * segment;
  return Math.min(1, Math.max(0, (globalProgress - start) / segment));
}

export type ClipScrubRange = {
  /** Fraction of source duration where scroll segment begins (0–1). */
  in?: number;
  /** Fraction of source duration where scroll segment ends (0–1). */
  out?: number;
};

/** SSIM-matched handoff (room-03 ↔ room-04-full). */
export const HANDOFF_STRUCTURE_ENVELOPE = {
  structureEndSec: 7.6,
  envelopeStartSecFull: 3.3,
} as const;

/** Map segment-local scroll (0–1) to a timestamp using optional in/out trim. */
export function scrubTimeFromLocal(
  local: number,
  duration: number,
  range?: ClipScrubRange,
): number {
  const tin = range?.in ?? 0;
  const tout = range?.out ?? 1;
  const clamped = Math.min(1, Math.max(0, local));
  return duration * (tin + clamped * (tout - tin));
}

export function roomOpacity(
  globalProgress: number,
  roomIndex: number,
  roomCount: number,
): number {
  const segment = 1 / roomCount;
  const start = roomIndex * segment;
  const end = (roomIndex + 1) * segment;
  const fade = segment * 0.32;

  if (globalProgress < start - fade || globalProgress > end + fade) return 0;
  if (globalProgress < start + fade) {
    return (globalProgress - (start - fade)) / (fade * 2);
  }
  if (globalProgress > end - fade) {
    return (end + fade - globalProgress) / (fade * 2);
  }
  return 1;
}

/**
 * Instant cut between two rooms — no overlap (prevents double-exposure ghosting).
 * Fade in/out within each segment still uses roomOpacity.
 */
export function roomOpacityHardCut(
  globalProgress: number,
  roomIndex: number,
  fromIndex: number,
  toIndex: number,
  roomCount: number,
): number {
  const boundary = (fromIndex + 1) / roomCount;

  if (roomIndex === fromIndex) {
    if (globalProgress >= boundary) return 0;
    return roomOpacity(globalProgress, roomIndex, roomCount);
  }

  if (roomIndex === toIndex) {
    if (globalProgress < boundary) return 0;
    return roomOpacity(globalProgress, roomIndex, roomCount);
  }

  return roomOpacity(globalProgress, roomIndex, roomCount);
}

const SEEK_EPSILON = 0.018;

type SeekState = {
  pending: number | null;
  raf: number;
};

const seekState = new WeakMap<HTMLVideoElement, SeekState>();

function getSeekState(video: HTMLVideoElement): SeekState {
  let state = seekState.get(video);
  if (!state) {
    state = { pending: null, raf: 0 };
    seekState.set(video, state);
  }
  return state;
}

function applySeek(video: HTMLVideoElement, time: number) {
  const state = getSeekState(video);
  state.pending = null;
  if (state.raf) {
    cancelAnimationFrame(state.raf);
    state.raf = 0;
  }

  if (video.readyState < 1 || !Number.isFinite(video.duration)) return;

  const target = Math.max(0, Math.min(video.duration - 0.001, time));
  if (Math.abs(video.currentTime - target) < SEEK_EPSILON) return;

  try {
    if (typeof video.fastSeek === "function") {
      video.fastSeek(target);
    } else {
      video.currentTime = target;
    }
  } catch {
    /* decode not ready */
  }
}

/** Pause and seek — tuned for scroll-scrub (queues while `seeking`). */
export function scrubVideoTo(
  video: HTMLVideoElement | null,
  time: number,
) {
  if (!video) return;

  const state = getSeekState(video);
  const target = time;

  if (video.readyState < 1 || !Number.isFinite(video.duration)) {
    state.pending = target;
    return;
  }

  const clamped = Math.max(0, Math.min(video.duration - 0.001, target));

  if (video.seeking) {
    state.pending = clamped;
    return;
  }

  if (Math.abs(video.currentTime - clamped) < SEEK_EPSILON) {
    state.pending = null;
    return;
  }

  state.pending = clamped;

  if (state.raf) return;
  state.raf = requestAnimationFrame(() => {
    state.raf = 0;
    const pending = state.pending;
    if (pending === null) return;
    applySeek(video, pending);
  });
}

/** Call once per video element to flush queued seeks after decode/seek. */
export function bindScrubVideo(video: HTMLVideoElement) {
  const onSeeked = () => {
    const state = getSeekState(video);
    const pending = state.pending;
    if (pending === null) return;
    if (Math.abs(video.currentTime - pending) < SEEK_EPSILON) {
      state.pending = null;
      return;
    }
    if (!video.seeking) {
      applySeek(video, pending);
    }
  };

  const onLoaded = () => {
    const state = getSeekState(video);
    if (state.pending !== null) {
      applySeek(video, state.pending);
    }
  };

  video.addEventListener("seeked", onSeeked);
  video.addEventListener("loadeddata", onLoaded);
  video.addEventListener("loadedmetadata", onLoaded);

  return () => {
    video.removeEventListener("seeked", onSeeked);
    video.removeEventListener("loadeddata", onLoaded);
    video.removeEventListener("loadedmetadata", onLoaded);
  };
}

export function prepareScrubVideo(video: HTMLVideoElement) {
  video.pause();
  video.playsInline = true;
  video.muted = true;
  video.preload = "auto";
  try {
    video.disablePictureInPicture = true;
  } catch {
    /* unsupported */
  }
}
