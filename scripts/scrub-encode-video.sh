#!/usr/bin/env bash
# Re-encode for smooth scroll-scrub (dense keyframes). Usage: ./scripts/scrub-encode-video.sh public/video/room-01.mp4
set -euo pipefail
INPUT="${1:?Usage: scrub-encode-video.sh <input.mp4>}"
DIR="$(dirname "$INPUT")"
BASE="$(basename "$INPUT" .mp4)"
TMP="$DIR/${BASE}.scrub.tmp.mp4"

ffmpeg -y -i "$INPUT" \
  -an \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -profile:v high \
  -crf 20 \
  -g 2 \
  -keyint_min 1 \
  -sc_threshold 0 \
  -movflags +faststart \
  "$TMP"

mv "$TMP" "$INPUT"
echo "Scrub-encoded: $INPUT"
