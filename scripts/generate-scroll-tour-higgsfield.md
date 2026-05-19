# Architecture scroll tour — Higgsfield

> **Continuity rule (mandatory):** Every clip’s **last frame** must match the **first frame** of the next. Use `room-{NN}-endframe.jpg` as start image, trim joins (SSIM), scrub-encode, then `./scripts/stitch-tour.sh`. Full pipeline: `.cursor/skills/scroll-scrub-video-continuity/SKILL.md`.

The homepage **scroll-scrubs one timeline**: you scroll vertically; the film advances through build phases (same pattern as [Video Scrub on Scroll](https://showcased.webflow.io/projects/video-scrub-on-scroll)).

**Subject:** contemporary architecture (villa / pavilion), not interior-only. Final beat: doors open, POV into the main room.

## Files

| File | Phase | Duration |
|------|--------|----------|
| `public/video/room-01.mp4` | 01 — Planning sketches & massing | 8s |
| `public/video/room-02.mp4` | 02 — CAD / BIM wireframe | 8s |
| `public/video/room-03.mp4` | 03 — Concrete structural shell (grey build) | 8s |
| `public/video/room-04.mp4` | 04 — Glazing & facade install | 8s |
| `public/video/room-05.mp4` | 05 — Completed exterior + landscape | 8s |
| `public/video/room-06.mp4` | 06 — Slow push to main entry | 8s |
| `public/video/room-07.mp4` | 07 — Doors open, interior POV | 10s |
| `public/video/tour.mp4` | **Stitched** (~54s) — best for smooth scrub | 54s |

Until `tour.mp4` exists, the site shows a **CSS build preview** and scrubs `hero.mp4` if present.

## Global settings

- Model: `seedance_2_0` (or `kling_3_0` for room 07 motion)
- Aspect: `16:9`
- Camera: mostly **slow lateral truck** or **dolly** so horizontal time reads on vertical scroll
- No people, no text, no logos
- Keep **same building massing** across all clips (continuation between rooms)

---

## Room 01 — Concept (room-01.mp4)

```
Slow dolly-in over an architectural drafting table, hand-drawn site plan and elevation sketches of a contemporary minimalist villa, white pencil lines on deep blue paper, compass and scale bar, soft desk lamp, shallow depth of field, desaturated documentary tone, fine film grain, 24fps. Empty studio, no people, no text.
```

---

## Room 02 — CAD / BIM (room-02.mp4) — Continuation

**Start image:** `public/video/room-01-endframe.jpg` (or `--start-image` that path / room-01 job id)

```
Continuing seamlessly from the prior frame on the drafting table: the hand-drawn minimalist villa elevation and plan sketches on deep blue paper gently morph into a luminous cyan BIM wireframe of the exact same building — identical flat roof line, same rectangular footprint, same window bay rhythm and cantilever as the pencil drawing. Slow stabilized orbit around the 3D model on black, structural grid and slab edges visible, pencil lines dissolving into glowing teal wireframe, technical architecture visualization, shallow depth of field, fine film grain, no people, no text.
```

---

## Room 03 — Structure (room-03.mp4) — Continuation

**Start image:** `public/video/room-02-endframe.jpg`

```
Continuing seamlessly from the prior cyan BIM wireframe frame: the glowing digital model dissolves into photoreal raw in-situ concrete construction of the exact same contemporary minimalist villa — identical flat roof line, footprint, column positions, and window bay rhythm as the wireframe. Wide stabilized slow push-in on an active construction site, grey overcast sky, exposed cast-in-place concrete columns and slab edges, rebar caps visible, minimal scaffolding, brutalist tectonic architecture, desaturated monochrome documentary, shallow depth of field, fine film grain, no people, no text.
```

---

## Room 04 — Envelope (room-04.mp4) — Continuation

**Start image:** `public/video/room-03-endframe.jpg`

**Scroll sync (no regen):** SSIM-matched handoff at **room-03 @ 7.6s** ↔ **room-04-full @ 3.3s** (not 4.0s). Trim: `./scripts/trim-video.sh public/video/room-04-full.mp4 public/video/room-04.mp4 3.3 1.65`. Structure `clipScrub: { in: 0.68, out: 0.945 }`. Instant cut at boundary.

```
Continuing seamlessly from the prior concrete shell frame: the same contemporary minimalist villa mid-construction — identical footprint, roof line, and window grid as before. Curtain wall aluminum frames and large glass panels are lifted into place along the facade, raw concrete structure still visible between frames, construction crane soft bokeh in background, slow stabilized lateral truck right along the building elevation, grey overcast architectural documentary light, desaturated monochrome, shallow depth of field, fine film grain, no people, no text.
```

---

## Room 05 — Built form (room-05.mp4) — Continuation

```
Continuing from prior clip. Completed contemporary villa exterior at dusk, dark stone and glass facade, landscape grading and gravel forecourt, warm interior glow through openings, slow dolly back to reveal full massing, cinematic architecture photography, subtle orange in sky, no people, no text.
```

---

## Room 06 — Approach (room-06.mp4) — Continuation

```
Continuing from prior clip. Low stabilized forward glide along gravel approach toward the main entrance, contemporary architecture, glass doors closed, reflection on facade, shallow depth of field, dusk blue hour, anamorphic lens flare subtle, no people, no text.
```

---

## Room 07 — Arrival (room-07.mp4) — Continuation

```
Continuing from prior clip. Entrance doors slide open, smooth first-person POV walk into a double-height living volume, concrete and wood palette, tall glazing with garden view, dramatic natural light, slow forward dolly into the room center, architectural interior not styled clutter, cinematic stabilized, no people, no text.
```

---

## Stitch → tour.mp4

```bash
./scripts/validate-tour-continuity.sh
./scripts/stitch-tour.sh --encode
```

Reload the site — it auto-detects `tour.mp4` and enables full scroll-scrub.
