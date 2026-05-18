<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Auto-sync (Git + Vercel)

Agent file edits are auto-committed and pushed via `.cursor/hooks.json` (`afterFileEdit` debounced, `stop` immediate). Pushes to `main` trigger a Vercel production deploy. Live site: https://omnia-lab.vercel.app
