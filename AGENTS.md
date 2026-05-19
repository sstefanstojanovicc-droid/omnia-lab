<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Scroll-scrub video

When generating or editing scroll-tour / hero scrub videos (`room-*.mp4`, `tour.mp4`, `ScrollTour`): **last frame of each clip must match the first frame of the next**, then stitch `tour.mp4`. Follow `.cursor/skills/scroll-scrub-video-continuity/SKILL.md`.

## Auto-sync (Git + Vercel)

Agent file edits are auto-committed and pushed via `.cursor/hooks.json` (`afterFileEdit` debounced, `stop` immediate). Pushes to `main` trigger a Vercel production deploy. Live site: https://omnia-lab.vercel.app
