#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Strip broken --localstorage-file* from NODE_OPTIONS so Node 22+ does not warn
# (some IDEs inject the flag). Must run in shell before `exec node`.
if [[ -n "${NODE_OPTIONS:-}" ]]; then
  # shellcheck disable=SC2001
  _cleaned="$(printf '%s' "$NODE_OPTIONS" | sed -E 's/--localstorage-file(=[^[:space:]]*)?//g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//;s/[[:space:]]\{2,\}/ /g')"
  if [[ -n "$_cleaned" ]]; then
    export NODE_OPTIONS="$_cleaned"
  else
    unset NODE_OPTIONS
  fi
fi
exec node "$ROOT/node_modules/next/dist/bin/next" dev
