#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR_DIR="$ROOT_DIR/vendor"
DATA_DIR="$ROOT_DIR/data"

mkdir -p "$VENDOR_DIR" "$DATA_DIR"

fetch() {
  local target="$1"
  shift
  local tmp
  tmp="$(mktemp)"
  for url in "$@"; do
    echo "Downloading $(basename "$target") from: $url"
    if curl -fL --connect-timeout 10 --max-time 120 "$url" -o "$tmp"; then
      mv "$tmp" "$target"
      echo "Saved: $target"
      return 0
    fi
  done
  rm -f "$tmp"
  echo "Failed to download: $target" >&2
  return 1
}

fetch "$VENDOR_DIR/d3.v7.min.js" \
  "https://cdn.bootcdn.net/ajax/libs/d3/7.9.0/d3.min.js" \
  "https://fastly.jsdelivr.net/npm/d3@7/dist/d3.min.js" \
  "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"

fetch "$VENDOR_DIR/topojson-client.v3.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/topojson-client/3.1.0/topojson-client.min.js" \
  "https://fastly.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js" \
  "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"

fetch "$DATA_DIR/countries.geo.json" \
  "https://fastly.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json" \
  "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json" \
  "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"

echo "Done. Local assets updated in:"
echo "  - $VENDOR_DIR"
echo "  - $DATA_DIR"
