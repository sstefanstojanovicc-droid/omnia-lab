#!/usr/bin/env bash
# Pre-deploy checks for scroll-tour frame continuity assets.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_DIR="$ROOT/public/video"
ERR=0

warn() { echo "⚠ $*"; ERR=1; }
ok() { echo "✓ $*"; }

for i in 01 02 03 04 05 06 07; do
  f="$VIDEO_DIR/room-$i.mp4"
  if [[ -f "$f" ]]; then
    dur="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$f" 2>/dev/null || echo 0)"
    ok "room-$i.mp4 (${dur}s)"
  else
    warn "Missing room-$i.mp4"
  fi
done

for i in 01 02 03 04 05 06; do
  j="$VIDEO_DIR/room-$i-endframe.jpg"
  if [[ -f "$j" ]]; then
    ok "room-$i-endframe.jpg"
  else
    warn "Missing room-$i-endframe.jpg (required for clip $((10#$i + 1)) continuation)"
  fi
done

if [[ -f "$VIDEO_DIR/tour.mp4" ]]; then
  ok "tour.mp4 present (production scroll mode)"
else
  warn "No tour.mp4 — run ./scripts/stitch-tour.sh after all rooms match"
fi

if [[ "$ERR" -ne 0 ]]; then
  echo ""
  echo "See .cursor/skills/scroll-scrub-video-continuity/SKILL.md"
  exit 1
fi

echo ""
echo "All continuity assets present. Scrub in browser to verify joins visually."
