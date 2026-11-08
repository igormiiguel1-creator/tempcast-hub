#!/usr/bin/env bash
# Verifica o que falta para o CortesFactory (macOS / Linux) e instala só o que falta.
cd "$(dirname "$0")" || exit 1

missing_python=0
missing_ffmpeg=0

if command -v python3 >/dev/null 2>&1 && python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)'; then
  echo "[OK] Python 3.9+ ($(python3 --version 2>&1))"
else
  echo "[FALTA] Python 3.9+"
  missing_python=1
fi

if command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then
  echo "[OK] ffmpeg e ffprobe"
else
  echo "[FALTA] ffmpeg e ffprobe"
  missing_ffmpeg=1
fi

if [ "$missing_python" -eq 0 ] && [ "$missing_ffmpeg" -eq 0 ]; then
  echo ""
  echo "Tudo instalado. Pode correr ./start.sh"
  exit 0
fi

echo ""
if command -v brew >/dev/null 2>&1; then
  [ "$missing_python" -eq 1 ] && brew install python
  [ "$missing_ffmpeg" -eq 1 ] && brew install ffmpeg
elif command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update
  [ "$missing_python" -eq 1 ] && sudo apt-get install -y python3
  [ "$missing_ffmpeg" -eq 1 ] && sudo apt-get install -y ffmpeg
else
  echo "Gestor de pacotes não reconhecido (nem Homebrew nem apt)."
  echo "Instale manualmente: Python 3.9+ e ffmpeg (com ffprobe)."
  exit 1
fi

echo ""
echo "Instalação terminada. Execute ./instalar.sh outra vez para confirmar."
