# Scroll tour videos

**Architecture build timeline** — scroll drives `currentTime` through one continuous film (vertical scroll → horizontal time in the edit).

| File | Purpose |
|------|---------|
| `tour.mp4` | **Best** — one ~54s stitched file (7 phases) |
| `room-01.mp4` … `room-07.mp4` | Per-phase clips |
| `hero.mp4` | Fallback loop until tour/rooms exist |

Without video files, the hero shows a **CSS build preview** (sketch → CAD → structure → envelope → complete → approach → interior).

Generate prompts: `scripts/generate-scroll-tour-higgsfield.md`

After export, run `./scripts/scrub-encode-video.sh public/video/room-XX.mp4` for smooth scroll-scrub (dense keyframes).
