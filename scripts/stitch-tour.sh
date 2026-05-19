#!/usr/bin/env bash
# Concat room-01..07 into tour.mp4 for single-timeline scroll scrub.
# Usage: ./scripts/stitch-tour.sh [--encode]
set -euo pipefail

ENCODE=0
[[ "${1:-}" == "--encode" ]] && ENCODE=1

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_DIR="$ROOT/public/video"
LIST="$VIDEO_DIR/tour-list.txt"
OUT="$VIDEO_DIR/tour.mp4"

cd "$VIDEO_DIR"
: >"$LIST"
for i in 01 02 03 04 05 06 07; do
  f="room-$i.mp4"
  if [[ ! -f "$f" ]]; then
    echo "Missing $VIDEO_DIR/$f — generate all rooms before stitching." >&2
    exit 1
  fi
  echo "file '$f'" >>"$LIST"
done

if [[ "$ENCODE" -eq 1 ]]; then
  ffmpeg -y -f concat -safe 0 -i "$LIST" \
    -an \
    -c:v libx264 \
    -pix_fmt yuv420p \
    -profile:v high \
    -crf 20 \
    -g 2 \
    -keyint_min 1 \
    -sc_threshold 0 \
    -movflags +faststart \
    "$OUT"
else
  ffmpeg -y -f concat -safe 0 -i "$LIST" -c copy -movflags +faststart "$OUT" 2>/dev/null || {
    echo "Stream copy failed; re-run with --encode" >&2
    rm -f "$OUT"
    exit 1
  }
fi

rm -f "$LIST"
"$ROOT/scripts/scrub-encode-video.sh" "$OUT"
echo "Stitched: $OUT ($(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT" 2>/dev/null || echo '?')s)"
