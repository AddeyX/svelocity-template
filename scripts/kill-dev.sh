#!/usr/bin/env bash
# Kill local dev servers (vite, wrangler/workerd, convex, electron-vite, etc.).
# Only targets TCP listeners owned by you whose process is a dev runtime, so
# editors and desktop apps that also listen on localhost (Cursor, Discord, ...)
# are left alone.
#
# Usage: scripts/kill-dev.sh [--repo] [--dry-run]
#   --repo     only kill servers started from inside this repo
#   --dry-run  list what would be killed without killing it

set -euo pipefail

RUNTIMES='^(node|bun|deno|workerd|esbuild|vite|wrangler)$'
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
repo_only=false
dry_run=false

for arg in "$@"; do
  case "$arg" in
    --repo) repo_only=true ;;
    --dry-run) dry_run=true ;;
    *) echo "unknown option: $arg" >&2; exit 1 ;;
  esac
done

pids=()
while read -r pid; do
  name="$(ps -o comm= -p "$pid" | xargs basename)"
  [[ "$name" =~ $RUNTIMES ]] || continue
  if $repo_only; then
    cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')"
    [[ "$cwd" == "$REPO_ROOT"* ]] || continue
  fi
  ports="$(lsof -a -p "$pid" -nP -iTCP -sTCP:LISTEN -Fn 2>/dev/null | sed -n "s/^n.*://p" | sort -un | paste -sd, - || true)"
  echo "$pid  $name  ports: $ports"
  pids+=("$pid")
done < <(lsof -a -nP -iTCP -sTCP:LISTEN -u "$(id -u)" -t | sort -u)

if [[ ${#pids[@]} -eq 0 ]]; then
  echo "No dev servers running."
  exit 0
fi

$dry_run && exit 0

kill "${pids[@]}" 2>/dev/null || true
sleep 2
for pid in "${pids[@]}"; do
  kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true
done
echo "Killed ${#pids[@]} dev server(s)."
