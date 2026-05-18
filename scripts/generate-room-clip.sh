#!/usr/bin/env bash
# Generate a scroll-tour room clip with end-frame continuation + model fallback on NSFW.
# Usage: ./scripts/generate-room-clip.sh 06 "your prompt" [start_image]
set -euo pipefail

ROOM="${1:?Usage: generate-room-clip.sh <01-07> <prompt> [start_image]}"
PROMPT="${2:?prompt required}"
START_IMAGE="${3:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_DIR="$ROOT/public/video"
JOBS_DIR="$ROOT/scripts/hf-jobs"
ROOM_PADDED="$(printf '%02d' "$((10#${ROOM}))")"
OUT="$VIDEO_DIR/room-${ROOM_PADDED}.mp4"
JOB_JSON="$JOBS_DIR/room-${ROOM_PADDED}.json"

if [[ -z "$START_IMAGE" ]]; then
  PREV=$((10#${ROOM} - 1))
  if (( PREV >= 1 )); then
    PREV_PADDED="$(printf '%02d' "$PREV")"
    START_IMAGE="$VIDEO_DIR/room-${PREV_PADDED}-endframe.jpg"
  fi
fi

MODELS=(
  "seedance_2_0|--aspect_ratio 16:9 --duration 8 --resolution 1080p"
  "veo3_1_lite|--aspect_ratio 16:9 --duration 8"
  "kling3_0|--aspect_ratio 16:9 --duration 8 --mode std --sound off"
  "wan2_6|--aspect_ratio 16:9 --duration 8"
)

try_model() {
  local model="$1"
  local extra="$2"
  local tmp
  tmp="$(mktemp)"
  echo "→ Trying $model …" >&2

  local -a cmd=(higgsfield generate create "$model" --prompt "$PROMPT" --wait --wait-timeout 25m --wait-interval 8s --json)
  if [[ -n "$START_IMAGE" && -f "$START_IMAGE" ]]; then
    cmd+=(--start-image "$START_IMAGE")
  fi
  # shellcheck disable=SC2086
  cmd+=($extra)

  if ! "${cmd[@]}" >"$tmp" 2>&1; then
    echo "  ✗ $model failed (network/API)" >&2
    cat "$tmp" >&2
    rm -f "$tmp"
    return 1
  fi

  local status result_url job_id
  status="$(python3 -c "import json,sys; d=json.load(open('$tmp')); print(d[0].get('status',''))" 2>/dev/null || echo fail)"
  result_url="$(python3 -c "import json,sys; d=json.load(open('$tmp')); print(d[0].get('result_url',''))" 2>/dev/null || true)"
  job_id="$(python3 -c "import json,sys; d=json.load(open('$tmp')); print(d[0].get('id',''))" 2>/dev/null || true)"

  if [[ "$status" == "nsfw" || -z "$result_url" ]]; then
    echo "  ✗ $model → status=$status (trying next model)" >&2
    rm -f "$tmp"
    return 1
  fi

  echo "  ✓ $model → $result_url" >&2
  curl -fsSL "$result_url" -o "$OUT"
  "$ROOT/scripts/scrub-encode-video.sh" "$OUT"
  ffmpeg -y -sseof -0.1 -i "$OUT" -frames:v 1 -update 1 -q:v 2 \
    "$VIDEO_DIR/room-${ROOM_PADDED}-endframe.jpg" 2>/dev/null

  python3 - <<PY
import json
from pathlib import Path
data = json.load(open("$tmp"))
row = data[0]
Path("$JOB_JSON").write_text(json.dumps({
  "id": row.get("id"),
  "job_set_type": row.get("job_set_type"),
  "start_image": "$START_IMAGE",
  "result_url": row.get("result_url"),
  "local_path": "public/video/room-${ROOM_PADDED}.mp4",
  "prompt": "$PROMPT",
}, indent=2) + "\n")
PY
  rm -f "$tmp"
  return 0
}

cd "$ROOT"
for entry in "${MODELS[@]}"; do
  model="${entry%%|*}"
  extra="${entry#*|}"
  if try_model "$model" "$extra"; then
    echo "Saved $OUT and room-${ROOM_PADDED}-endframe.jpg"
    exit 0
  fi
done

echo "All models failed for room ${ROOM_PADDED}" >&2
exit 1
