---
name: scroll-scrub-video-continuity
description: >-
  Ensures scroll-scrub and dynamic website hero videos play as one continuous
  film. Mandates last-frame-to-first-frame matching between clips, Higgsfield
  continuation, scrub encoding, and tour.mp4 stitching. Use when generating or
  editing scroll tour videos, room-XX.mp4, tour.mp4, ScrollTour, Higgsfield
  architecture clips, or when the user mentions seamless video, frame handoff,
  or scroll-scrub continuity.
---

# Scroll-scrub video continuity

Dynamic scroll sites must feel like **one uncut video**, not a slideshow of clips. Crossfades in React only hide mismatches; **pixel continuity at every splice** is mandatory.

## Non-negotiable rule

For every adjacent pair **clip N → clip N+1**:

1. **Last frame of N** must match **first frame of N+1** (same massing, camera height, lighting direction, crop).
2. **Higgsfield:** generate N+1 with `--start-image` = `room-{NN}-endframe.jpg` from clip N (never skip).
3. **Post:** trim so the exported file **starts** on the matched frame and **ends** on the frame you will hand to the next clip.
4. **Encode:** run `./scripts/scrub-encode-video.sh` on every clip (dense keyframes for scroll).
5. **Ship:** stitch to `public/video/tour.mp4` — the site prefers one timeline over multi-clip mode.

If any join flashes, jumps, or “double exposure” dissolves badly → **fix the frames**, do not only tweak CSS opacity.

---

## Workflow (every new phase)

### 1. Generate with continuation

Use project script (auto end-frame + scrub encode):

```bash
./scripts/generate-room-clip.sh 04 "Continuing seamlessly from the prior frame…"
```

Or Higgsfield MCP with `start_image` = previous `room-{NN-1}-endframe.jpg`.

Prompt must include: **“Continuing seamlessly from the prior frame”** + lock building footprint, roof line, window rhythm.

### 2. Extract end frame for the next clip

After each export:

```bash
ffmpeg -y -sseof -0.1 -i public/video/room-03.mp4 -frames:v 1 -update 1 -q:v 2 \
  public/video/room-03-endframe.jpg
```

(`generate-room-clip.sh` does this automatically.)

### 3. Match the handoff (trim, don’t guess)

When clip N+1’s **first second** doesn’t match N’s last frame:

1. Export N’s last frame: `room-{N}-endframe.jpg`
2. Scan N+1 full export for best matching timestamp (SSIM or frame-by-frame compare).
3. Trim N+1 to start at that timestamp:

```bash
./scripts/trim-video.sh public/video/room-04-full.mp4 public/video/room-04.mp4 3.3 1.65
```

4. Optionally trim N’s **out** point so scroll lands on the match (document in `ScrollTour` `clipScrub` + `HANDOFF_*` in `src/lib/scrollScrub.ts`).

**Reference handoff (this repo):** room-03 @ **7.6s** ↔ room-04-full @ **3.3s** — see `scripts/generate-scroll-tour-higgsfield.md`.

Repeat for **every** join (01→02, 02→03, …), not only structure→envelope.

### 4. Scrub-encode

```bash
./scripts/scrub-encode-video.sh public/video/room-XX.mp4
```

Without this, scroll will stutter even with perfect splices.

### 5. Stitch → `tour.mp4`

```bash
./scripts/stitch-tour.sh
```

Deploy `tour.mp4`. `ScrollTour` auto-detects it and uses **single-video scrub** (smoothest).

Validate before deploy:

```bash
./scripts/validate-tour-continuity.sh
```

---

## Site integration (omnia-lab)

| Mode | File | Behavior |
|------|------|----------|
| **Production (required)** | `public/video/tour.mp4` | One `currentTime` scrub — no inter-clip dissolves |
| Fallback | `room-01.mp4` … `room-07.mp4` | Multi-player + dissolves; only acceptable while drafting |

Do not ship production relying on multi-clip crossfades alone.

---

## Checklist before marking video work done

- [ ] All `room-01` … `room-07` exist
- [ ] Each `room-{NN}-endframe.jpg` exists for NN < 07
- [ ] Each join visually inspected: pause at last frame of N, first frame of N+1 — **no jump**
- [ ] All clips scrub-encoded
- [ ] `tour.mp4` built and plays smoothly when scrubbing in browser
- [ ] `clipScrub` / handoff constants updated if trims changed

---

## Common failures

| Symptom | Cause | Fix |
|---------|--------|-----|
| Flash at scroll segment | Unmatched splice | Re-trim or regenerate N+1 with correct start image |
| Morph / double building | CSS dissolve between different frames | Match frames; prefer `tour.mp4` |
| Stutter while scrolling | Sparse keyframes | `scrub-encode-video.sh` |
| One segment too short | Over-trimmed (e.g. 1.6s room-04) | Re-trim from full export after SSIM match |
| Last chapter broken | Missing `room-07.mp4` | Generate with `room-06-endframe.jpg` |

---

## Related files

- Prompts: `scripts/generate-scroll-tour-higgsfield.md`
- Generate: `scripts/generate-room-clip.sh`
- Trim: `scripts/trim-video.sh`
- Stitch: `scripts/stitch-tour.sh`
- Player: `src/components/ScrollTour.tsx`, `src/lib/scrollScrub.ts`
