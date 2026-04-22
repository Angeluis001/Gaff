#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${OPENCLAW_CONFIG_DIR:-/data/.openclaw}"
CONFIG_PATH="${OPENCLAW_CONFIG_PATH:-$CONFIG_DIR/openclaw.json}"
TEMPLATE_PATH="${OPENCLAW_RAILWAY_CONFIG_TEMPLATE:-/app/openclaw.railway.json}"

mkdir -p "$CONFIG_DIR"

if [ ! -s "$CONFIG_PATH" ] && [ -f "$TEMPLATE_PATH" ]; then
  cp "$TEMPLATE_PATH" "$CONFIG_PATH"
fi

export OPENCLAW_CONFIG_PATH="$CONFIG_PATH"
export OPENCLAW_CONFIG_DIR="$CONFIG_DIR"

# Clear corrupted WhatsApp channel state so the plugin starts fresh instead of crashing
STATE_DIR="${OPENCLAW_STATE_DIR:-/data/.openclaw}"
if [ -d "$STATE_DIR/channels/whatsapp" ]; then
  echo "[railway-start] clearing WhatsApp channel state for fresh start"
  rm -rf "$STATE_DIR/channels/whatsapp"
fi

trap 'echo "[railway-start] gateway exited with code $?"' EXIT

exec node /app/openclaw.mjs gateway --allow-unconfigured
