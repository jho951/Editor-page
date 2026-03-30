#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.dev.yml"
PROD_COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.prod.yml"

MODE="${1:-dev}"
ACTION="${2:-up}"

case "$MODE" in
  dev)
    COMPOSE_FILE="$DEV_COMPOSE_FILE"
    SERVICE="editor-dev"
    ;;
  prod)
    COMPOSE_FILE="$PROD_COMPOSE_FILE"
    SERVICE="editor-prod"
    ;;
  *)
    echo "Usage: $0 [dev|prod] [up|down|build|logs]"
    exit 1
    ;;
esac

case "$ACTION" in
  up)
    docker compose -f "$COMPOSE_FILE" up --build "$SERVICE"
    ;;
  down)
    docker compose -f "$COMPOSE_FILE" down
    ;;
  build)
    docker compose -f "$COMPOSE_FILE" build "$SERVICE"
    ;;
  logs)
    docker compose -f "$COMPOSE_FILE" logs -f "$SERVICE"
    ;;
  *)
    echo "Usage: $0 [dev|prod] [up|down|build|logs]"
    exit 1
    ;;
esac
