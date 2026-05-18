#!/usr/bin/env bash
# Trim a clip and scrub-encode. Usage: ./scripts/trim-video.sh input.mp4 output.mp4 4.0 4.0
set -euo pipefail
IN="${1:?}"; OUT="${2:?}"; SS="${3:?}"; DUR="${4:?}"
ffmpeg -y -ss "$SS" -i "$IN" -t "$DUR" -an \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 20 \
  -g 2 -keyint_min 1 -sc_threshold 0 -movflags +faststart "$OUT"
"$(dirname "$0")/scrub-encode-video.sh" "$OUT"
echo "Trimmed: $OUT (${SS}s + ${DUR}s)"
