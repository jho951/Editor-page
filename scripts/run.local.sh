#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MODE="${1:-dev}"

case "$MODE" in
  dev)
    npm run dev
    ;;
  build)
    npm run build
    ;;
  preview)
    npm run preview
    ;;
  install)
    npm install
    ;;
  *)
    echo "Usage: $0 [dev|build|preview|install]"
    exit 1
    ;;
esac
