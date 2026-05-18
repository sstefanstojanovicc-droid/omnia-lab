#!/usr/bin/env bash
# Commits and pushes workspace changes so GitHub + Vercel stay in sync with agent edits.
# Vercel deploys automatically on push to main (Git integration).

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "${ROOT:-}" ]] || exit 0
cd "$ROOT"

git remote get-url origin &>/dev/null || exit 0

STATE_DIR="${TMPDIR:-/tmp}/omnia-lab-auto-sync"
mkdir -p "$STATE_DIR"
LOCK_FILE="$STATE_DIR/lock.dir"
TIMER_PID_FILE="$STATE_DIR/debounce.pid"
LOG_FILE="$STATE_DIR/sync.log"

DEBOUNCE_SEC="${AUTO_SYNC_DEBOUNCE_SEC:-8}"

log() {
  echo "[$(date -u +"%H:%M:%S")] $*" >>"$LOG_FILE"
}

has_changes() {
  ! git diff --quiet || return 0
  ! git diff --cached --quiet || return 0
  [[ -n "$(git ls-files --others --exclude-standard)" ]] && return 0
  return 1
}

run_sync() {
  has_changes || return 0

  BRANCH="$(git branch --show-current)"
  [[ -n "$BRANCH" ]] || return 0

  TIMESTAMP="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  SUMMARY="$(git status --porcelain | head -25)"

  git add -A

  if git diff --cached --quiet; then
    return 0
  fi

  git commit -m "$(cat <<EOF
chore: auto-sync agent edits ($TIMESTAMP)

$SUMMARY
EOF
)" --no-verify

  if git push origin "$BRANCH"; then
    log "pushed $BRANCH ($(git rev-parse --short HEAD))"
  else
    log "push failed on $BRANCH"
    return 1
  fi
}

with_lock() {
  local lockdir="${LOCK_FILE}.dir"
  if mkdir "$lockdir" 2>/dev/null; then
    trap 'rmdir "$lockdir" 2>/dev/null || true' EXIT
    eval "$1"
  fi
}

flush_debounce() {
  if [[ -f "$TIMER_PID_FILE" ]]; then
    local pid
    pid="$(cat "$TIMER_PID_FILE")"
    kill "$pid" 2>/dev/null || true
    rm -f "$TIMER_PID_FILE"
  fi
}

sync_now() {
  flush_debounce
  with_lock "run_sync" || true
}

schedule_debounced() {
  flush_debounce
  (
    sleep "$DEBOUNCE_SEC"
    with_lock "run_sync" || true
    rm -f "$TIMER_PID_FILE"
  ) &
  echo $! >"$TIMER_PID_FILE"
}

# swallow hook stdin (optional JSON payload)
if [[ ! -t 0 ]]; then
  cat >/dev/null
fi

case "${1:-}" in
  --now)
    sync_now
    ;;
  *)
    schedule_debounced
    ;;
esac

exit 0
