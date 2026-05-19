(function () {
  "use strict";

  var SEEK_EPSILON = 0.018;
  var HANDOFF_BLEND_SEGMENT = 0.68;
  var STRUCTURE_INDEX = 2;
  var ENVELOPE_INDEX = 3;
  var HANDOFF = { structureEndSec: 7.6, envelopeIntroMax: 0.42, defaultIntroMax: 0.35 };

  /** Per-beat trim + handoff (matches Next.js TOUR_CLIPS). Index = beat order. */
  var BEAT_CLIP = [
    null,
    null,
    { scrubIn: 0.68, scrubOut: 0.945 },
    null,
    null,
    null,
    null,
  ];

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  function smoothstep(t) {
    var x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function viewportHeight() {
    if (window.visualViewport && window.visualViewport.height > 0) {
      return window.visualViewport.height;
    }
    return window.innerHeight;
  }

  function scrollProgressFromSection(section, pinHeight) {
    var scrollable = section.offsetHeight - pinHeight;
    if (scrollable <= 0) return 0;
    var rect = section.getBoundingClientRect();
    return clamp(-rect.top / scrollable, 0, 1);
  }

  function roomLocalProgress(globalProgress, roomIndex, roomCount) {
    var segment = 1 / roomCount;
    var start = roomIndex * segment;
    return clamp((globalProgress - start) / segment, 0, 1);
  }

  function handoffBoundary(fromIndex, roomCount) {
    return (fromIndex + 1) / roomCount;
  }

  function handoffBlendWidth(roomCount) {
    var segment = 1 / roomCount;
    var roomFade = segment * 0.32 * 2;
    return Math.max(segment * HANDOFF_BLEND_SEGMENT, roomFade);
  }

  function scrubTimeFromLocal(local, duration, clip) {
    var tin = clip && clip.scrubIn != null ? clip.scrubIn : 0;
    var tout = clip && clip.scrubOut != null ? clip.scrubOut : 1;
    return duration * (tin + clamp(local, 0, 1) * (tout - tin));
  }

  function roomOpacity(globalProgress, roomIndex, roomCount) {
    var segment = 1 / roomCount;
    var start = roomIndex * segment;
    var end = (roomIndex + 1) * segment;
    var fade = segment * 0.32;
    if (globalProgress < start - fade || globalProgress > end + fade) return 0;
    if (globalProgress < start + fade) return (globalProgress - (start - fade)) / (fade * 2);
    if (globalProgress > end - fade) return (end + fade - globalProgress) / (fade * 2);
    return 1;
  }

  function roomOpacityDissolve(globalProgress, roomIndex, fromIndex, toIndex, roomCount) {
    var segment = 1 / roomCount;
    var boundary = handoffBoundary(fromIndex, roomCount);
    var blend = handoffBlendWidth(roomCount);
    var fade = segment * 0.32;
    var start = roomIndex * segment;
    var end = (roomIndex + 1) * segment;

    if (roomIndex === fromIndex) {
      if (globalProgress >= boundary) return 0;
      if (globalProgress >= boundary - blend) {
        var tOut = (globalProgress - (boundary - blend)) / blend;
        return 1 - smoothstep(tOut);
      }
      if (globalProgress < start - fade || globalProgress > end + fade) return 0;
      if (globalProgress < start + fade) return (globalProgress - (start - fade)) / (fade * 2);
      return 1;
    }

    if (roomIndex === toIndex) {
      if (globalProgress < boundary - blend) return 0;
      if (globalProgress < boundary) {
        var tIn = (globalProgress - (boundary - blend)) / blend;
        return smoothstep(tIn);
      }
      if (globalProgress > end + fade) return 0;
      if (globalProgress > end - fade) return (end + fade - globalProgress) / (fade * 2);
      return 1;
    }

    return roomOpacity(globalProgress, roomIndex, roomCount);
  }

  function dissolveHandoffs(roomCount) {
    var list = [];
    for (var i = 0; i < roomCount - 1; i++) list.push({ from: i, to: i + 1 });
    return list;
  }

  function activeHandoffAt(globalProgress, roomIndex, handoffs, roomCount) {
    var warm = 0.03;
    for (var h = 0; h < handoffs.length; h++) {
      var pair = handoffs[h];
      if (roomIndex !== pair.from && roomIndex !== pair.to) continue;
      var boundary = handoffBoundary(pair.from, roomCount);
      var blend = handoffBlendWidth(roomCount);
      if (
        globalProgress >= boundary - blend - warm &&
        globalProgress <= boundary + blend + warm
      ) {
        return pair;
      }
    }
    return null;
  }

  function isInHandoffBlend(globalProgress, fromIndex, roomCount) {
    var boundary = handoffBoundary(fromIndex, roomCount);
    var blend = handoffBlendWidth(roomCount);
    return globalProgress >= boundary - blend && globalProgress <= boundary + blend;
  }

  function handoffDissolveLocal(globalProgress, fromIndex, roomCount, introMax) {
    var boundary = handoffBoundary(fromIndex, roomCount);
    var blend = handoffBlendWidth(roomCount);
    if (globalProgress < boundary - blend) return 0;
    if (globalProgress >= boundary) {
      return roomLocalProgress(globalProgress, fromIndex + 1, roomCount);
    }
    var t = (globalProgress - (boundary - blend)) / blend;
    return smoothstep(t) * introMax;
  }

  function roomVisualOpacity(globalProgress, roomIndex, roomCount, handoffs) {
    var pair = activeHandoffAt(globalProgress, roomIndex, handoffs, roomCount);
    if (pair) {
      return roomOpacityDissolve(globalProgress, roomIndex, pair.from, pair.to, roomCount);
    }
    return roomOpacity(globalProgress, roomIndex, roomCount);
  }

  function inDissolveHandoff(globalProgress, roomCount, handoffs) {
    for (var i = 0; i < roomCount; i++) {
      if (activeHandoffAt(globalProgress, i, handoffs, roomCount)) return true;
    }
    return false;
  }

  /* ——— queued seek (smooth scrub, mobile-safe) ——— */
  function bindScrubVideo(video) {
    var state = { pending: null, raf: 0 };

    function applySeek(time) {
      state.pending = null;
      if (state.raf) {
        cancelAnimationFrame(state.raf);
        state.raf = 0;
      }
      if (video.readyState < 1 || !isFinite(video.duration)) return;
      var target = clamp(time, 0, video.duration - 0.001);
      if (Math.abs(video.currentTime - target) < SEEK_EPSILON) return;
      try {
        if (typeof video.fastSeek === "function") video.fastSeek(target);
        else video.currentTime = target;
      } catch (e) {}
    }

    function scrubVideoTo(time) {
      if (video.readyState < 1 || !isFinite(video.duration)) {
        state.pending = time;
        return;
      }
      var target = clamp(time, 0, video.duration - 0.001);
      if (video.seeking) {
        state.pending = target;
        return;
      }
      if (Math.abs(video.currentTime - target) < SEEK_EPSILON) {
        state.pending = null;
        return;
      }
      state.pending = target;
      if (state.raf) return;
      state.raf = requestAnimationFrame(function () {
        state.raf = 0;
        if (state.pending !== null) applySeek(state.pending);
      });
    }

    function onSeeked() {
      if (state.pending === null) return;
      if (Math.abs(video.currentTime - state.pending) < SEEK_EPSILON) {
        state.pending = null;
        return;
      }
      if (!video.seeking) applySeek(state.pending);
    }

    function onLoaded() {
      if (state.pending !== null) applySeek(state.pending);
    }

    video.pause();
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "auto";

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("loadedmetadata", onLoaded);

    return scrubVideoTo;
  }

  /* ——— scroll pin (HubSpot breaks sticky) ——— */
  function createScroller(section, pin, roomCount) {
    var pinHeight = 0;

    function measure() {
      pinHeight = pin.offsetHeight || viewportHeight();
      var trackPx = Math.round(roomCount * viewportHeight());
      section.style.height = trackPx + "px";
      section.style.minHeight = trackPx + "px";
    }

    function applyPinState(state) {
      pin.classList.remove("is-pinned", "is-ended");
      pin.style.position = "";
      pin.style.top = "";
      pin.style.bottom = "";
      pin.style.left = "";
      pin.style.width = "";
      pin.style.height = "";
      pin.style.zIndex = "";

      if (state === "pinned") {
        pin.classList.add("is-pinned");
        var rect = section.getBoundingClientRect();
        var vv = window.visualViewport;
        var vvTop = vv ? vv.offsetTop : 0;
        var h = viewportHeight();
        pin.style.position = "fixed";
        pin.style.top = vvTop + "px";
        pin.style.left = rect.left + "px";
        pin.style.width = rect.width + "px";
        pin.style.height = h + "px";
        pin.style.zIndex = "25";
      } else if (state === "ended") {
        pin.classList.add("is-ended");
        pin.style.position = "absolute";
        pin.style.bottom = "0";
        pin.style.left = "0";
        pin.style.width = "100%";
        pin.style.height = pinHeight + "px";
      } else {
        pin.style.height = pinHeight + "px";
      }
    }

    return {
      measure: measure,
      applyPin: function () {
        var rect = section.getBoundingClientRect();
        var top = window.scrollY + rect.top;
        var scrollRange = Math.max(1, section.offsetHeight - pinHeight);
        var y = window.scrollY;
        if (y < top) applyPinState("before");
        else if (y >= top + scrollRange) applyPinState("ended");
        else applyPinState("pinned");
      },
      pinHeight: function () {
        return pinHeight;
      },
    };
  }

  function liftHubSpotOverflow(section) {
    var node = section.parentElement;
    var depth = 0;
    while (node && node !== document.body && depth < 12) {
      node.style.setProperty("overflow", "visible", "important");
      node = node.parentElement;
      depth += 1;
    }
  }

  function syncPlayback(p, roomCount, handoffs, videos, ready, scrubbers) {
    var handoff = inDissolveHandoff(p, roomCount, handoffs);

    for (var i = 0; i < roomCount; i++) {
      if (!ready[i] || !videos[i]) continue;
      var video = videos[i];
      if (!isFinite(video.duration)) continue;

      var opacity = roomVisualOpacity(p, i, roomCount, handoffs);
      var pair = activeHandoffAt(p, i, handoffs, roomCount);
      if (!handoff && opacity < 0.04) continue;
      if (handoff && !pair && opacity < 0.04) continue;

      var clip = BEAT_CLIP[i] || null;
      var local = roomLocalProgress(p, i, roomCount);
      var time;
      var inBlend = pair && isInHandoffBlend(p, pair.from, roomCount);

      if (pair && i === pair.from) {
        if (inBlend || local > 0.88) local = 1;
        time = scrubTimeFromLocal(local, video.duration, clip);
        if (i === STRUCTURE_INDEX && (inBlend || local >= 0.98)) {
          time = Math.min(video.duration - 0.001, HANDOFF.structureEndSec);
        } else if (inBlend || local >= 0.98) {
          time = video.duration - 0.001;
        }
      } else if (pair && i === pair.to) {
        var introMax =
          i === ENVELOPE_INDEX ? HANDOFF.envelopeIntroMax : HANDOFF.defaultIntroMax;
        if (inBlend) {
          local = handoffDissolveLocal(p, pair.from, roomCount, introMax);
        } else if (local < 0.08) {
          local = 0;
        }
        time = scrubTimeFromLocal(local, video.duration, clip);
        if (!inBlend && local <= 0.03) time = 0;
      } else {
        time = scrubTimeFromLocal(local, video.duration, clip);
      }

      scrubbers[i](time);
    }
  }

  function initTour(section) {
    var roomCount = parseInt(section.getAttribute("data-room-count") || "7", 10);
    if (!roomCount) return;

    var pin = section.querySelector(".omnia-scroll-tour__pin");
    if (!pin) return;

    liftHubSpotOverflow(section);
    var scroller = createScroller(section, pin, roomCount);
    scroller.measure();

    var handoffs = dissolveHandoffs(roomCount);
    var clipEls = section.querySelectorAll(".omnia-scroll-tour__clip");
    var copies = section.querySelectorAll(".omnia-scroll-tour__beat-copy");
    var navItems = section.querySelectorAll(".omnia-scroll-tour__nav-item");
    var progressBar = section.querySelector("[data-progress-bar]");
    var fallback = section.querySelector(".omnia-scroll-tour__fallback");

    var videos = [];
    var scrubbers = [];
    var ready = [];

    for (var v = 0; v < roomCount; v++) {
      videos[v] = null;
      scrubbers[v] = function () {};
      ready[v] = false;
    }

    for (var c = 0; c < clipEls.length; c++) {
      var el = clipEls[c];
      var idx = parseInt(el.getAttribute("data-beat-index") || String(c), 10);
      videos[idx] = el;
      scrubbers[idx] = bindScrubVideo(el);
      (function (index, videoEl) {
        videoEl.addEventListener("loadeddata", function () {
          ready[index] = true;
          try {
            videoEl.currentTime = scrubTimeFromLocal(
              0,
              videoEl.duration,
              BEAT_CLIP[index],
            );
          } catch (e) {}
        });
        videoEl.addEventListener("error", function () {
          ready[index] = false;
          videoEl.style.display = "none";
        });
      })(idx, el);
    }

    function tick() {
      scroller.applyPin();
      var p = scrollProgressFromSection(section, scroller.pinHeight());
      var active = Math.min(roomCount - 1, Math.floor(p * roomCount));

      if (progressBar) progressBar.style.width = p * 100 + "%";

      navItems.forEach(function (el, i) {
        el.classList.toggle("is-active", i === active);
      });

      var anyVideo = false;
      for (var i = 0; i < roomCount; i++) {
        var op = roomVisualOpacity(p, i, roomCount, handoffs);
        var copy = copies[i];
        if (copy) {
          var copyOp = i === 0 && !ready[0] && p < 0.08 ? 1 : op;
          copy.style.opacity = String(copyOp);
          copy.style.visibility = copyOp < 0.02 ? "hidden" : "visible";
          copy.hidden = copyOp < 0.02;
        }
        var video = videos[i];
        if (video) {
          var videoOp = ready[i] ? op : i === 0 && p < 0.08 ? 1 : 0;
          video.style.opacity = String(videoOp);
          if (videoOp > 0.02) anyVideo = true;
        }
      }

      if (fallback) {
        var allFailed = true;
        for (var f = 0; f < roomCount; f++) {
          if (videos[f] && ready[f]) {
            allFailed = false;
            break;
          }
        }
        fallback.style.opacity = allFailed && !videos[0] ? "1" : "0";
      }

      syncPlayback(p, roomCount, handoffs, videos, ready, scrubbers);

      var header = document.querySelector("[data-omnia-header]");
      if (header) {
        var rect = section.getBoundingClientRect();
        var pastTour = -rect.top > section.offsetHeight - scroller.pinHeight() - 24;
        header.classList.toggle("omnia-header--dark", pastTour);
        header.classList.toggle("omnia-header--light", !pastTour);
      }
    }

    var raf = 0;
    function loop() {
      tick();
      raf = requestAnimationFrame(loop);
    }

    function onResize() {
      scroller.measure();
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize);
      window.visualViewport.addEventListener("scroll", onResize);
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("load", onResize);

    raf = requestAnimationFrame(loop);

    return function () {
      cancelAnimationFrame(raf);
    };
  }

  function boot() {
    document.querySelectorAll("[data-omnia-scroll-tour]").forEach(initTour);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
