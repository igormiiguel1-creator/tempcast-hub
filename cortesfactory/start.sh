#!/usr/bin/env bash
# Arranque do CortesFactory em macOS / Linux.
cd "$(dirname "$0")" || exit 1
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "AVISO: ffmpeg nao encontrado. macOS: brew install ffmpeg  |  Ubuntu: sudo apt install ffmpeg"
fi
exec python3 server.py "$@"
