"""Lógica do CortesFactory: validação de cortes, ffmpeg e nomes de ficheiro.

Sem dependências externas além do ffmpeg/ffprobe instalados no sistema.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

OUT_WIDTH = 1080
OUT_HEIGHT = 1920
MIN_CLIP_SECONDS = 1.0
MAX_CLIPS = 50

MODE_BLUR = "blur"  # vídeo inteiro visível, fundo desfocado
MODE_CROP = "crop"  # enquadramento central, corta as laterais
MODES = (MODE_BLUR, MODE_CROP)

_INVALID_FILENAME_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1f]')


@dataclass
class Cut:
    start: float
    end: float
    title: str


def parse_time(value) -> float:
    """Converte 'SS', 'MM:SS' ou 'HH:MM:SS' (aceita decimais) em segundos."""
    if isinstance(value, (int, float)):
        seconds = float(value)
        if seconds < 0:
            raise ValueError("O tempo não pode ser negativo.")
        return seconds

    text = str(value).strip().replace(",", ".")
    if not text:
        raise ValueError("Tempo em falta.")

    parts = text.split(":")
    if len(parts) > 3:
        raise ValueError(f"Tempo inválido: {value}")
    try:
        numbers = [float(p) for p in parts]
    except ValueError:
        raise ValueError(f"Tempo inválido: {value}") from None

    if any(n < 0 for n in numbers):
        raise ValueError("O tempo não pode ser negativo.")
    if len(numbers) > 1 and any(n >= 60 for n in numbers[1:]):
        raise ValueError(f"Minutos e segundos têm de ser menores que 60: {value}")

    seconds = 0.0
    for n in numbers:
        seconds = seconds * 60 + n
    return seconds


def format_time(seconds: float) -> str:
    """Formata segundos como HH:MM:SS.mmm (para mostrar ao utilizador)."""
    total_ms = int(round(seconds * 1000))
    hours, rest = divmod(total_ms, 3_600_000)
    minutes, rest = divmod(rest, 60_000)
    secs, ms = divmod(rest, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{ms:03d}"


def validate_cuts(raw_cuts, duration: float | None = None) -> list[Cut]:
    """Valida a lista de cortes vinda da interface. Levanta ValueError com mensagem em português."""
    if not isinstance(raw_cuts, list) or not raw_cuts:
        raise ValueError("Adicione pelo menos um corte.")
    if len(raw_cuts) > MAX_CLIPS:
        raise ValueError(f"Máximo de {MAX_CLIPS} cortes por tarefa.")

    cuts: list[Cut] = []
    for position, item in enumerate(raw_cuts, start=1):
        if not isinstance(item, dict):
            raise ValueError(f"Corte {position}: dados inválidos.")
        try:
            start = parse_time(item.get("start", ""))
            end = parse_time(item.get("end", ""))
        except ValueError as exc:
            raise ValueError(f"Corte {position}: {exc}") from None

        if end - start < MIN_CLIP_SECONDS:
            raise ValueError(
                f"Corte {position}: duração mínima de {MIN_CLIP_SECONDS:g} segundo "
                "(o fim tem de ser posterior ao início)."
            )
        if duration is not None and end > duration:
            raise ValueError(
                f"Corte {position}: o fim ({format_time(end)}) ultrapassa a duração "
                f"do vídeo ({format_time(duration)})."
            )

        title = str(item.get("title", "") or "").strip()
        cuts.append(Cut(start=start, end=end, title=title))
    return cuts


def safe_filename(title: str, index: int) -> str:
    """Nome de ficheiro seguro para Windows e Mac/Linux, com número de ordem."""
    cleaned = _INVALID_FILENAME_CHARS.sub("", title).strip().rstrip(".")
    cleaned = re.sub(r"\s+", "_", cleaned)[:60].strip("_")
    if not cleaned:
        cleaned = "corte"
    return f"{index:02d}_{cleaned}.mp4"


def find_ffmpeg() -> str | None:
    """Procura o ffmpeg: variável CORTESFACTORY_FFMPEG primeiro, depois o PATH."""
    override = os.environ.get("CORTESFACTORY_FFMPEG")
    if override and Path(override).is_file():
        return override
    return shutil.which("ffmpeg")


def find_ffprobe(ffmpeg: str | None) -> str | None:
    """Procura o ffprobe ao lado do ffmpeg ou no PATH."""
    if ffmpeg:
        sibling = Path(ffmpeg).with_name("ffprobe" + Path(ffmpeg).suffix)
        if sibling.is_file():
            return str(sibling)
    return shutil.which("ffprobe")


def probe_video(ffprobe: str, path: str) -> dict:
    """Devolve duração (s), largura, altura e se tem áudio."""
    result = subprocess.run(
        [
            ffprobe,
            "-v", "error",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            path,
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise ValueError("Não foi possível ler o vídeo. Confirme o caminho e o formato.")

    data = json.loads(result.stdout or "{}")
    streams = data.get("streams", [])
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    if video is None:
        raise ValueError("O ficheiro não tem faixa de vídeo.")

    try:
        duration = float(data.get("format", {}).get("duration", "0"))
    except ValueError:
        duration = 0.0
    if duration <= 0:
        raise ValueError("Não foi possível determinar a duração do vídeo.")

    return {
        "duration": duration,
        "width": int(video.get("width", 0)),
        "height": int(video.get("height", 0)),
        "has_audio": any(s.get("codec_type") == "audio" for s in streams),
    }


def _filter_graph(mode: str) -> str:
    if mode == MODE_CROP:
        return (
            f"[0:v]scale={OUT_WIDTH}:{OUT_HEIGHT}:force_original_aspect_ratio=increase,"
            f"crop={OUT_WIDTH}:{OUT_HEIGHT},setsar=1[v]"
        )
    # MODE_BLUR
    return (
        "[0:v]split=2[bg][fg];"
        f"[bg]scale={OUT_WIDTH}:{OUT_HEIGHT}:force_original_aspect_ratio=increase,"
        f"crop={OUT_WIDTH}:{OUT_HEIGHT},boxblur=20:2[bgb];"
        f"[fg]scale={OUT_WIDTH}:{OUT_HEIGHT}:force_original_aspect_ratio=decrease[fgs];"
        "[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1[v]"
    )


def build_clip_command(ffmpeg: str, source: str, cut: Cut, output: str, mode: str) -> list[str]:
    """Comando ffmpeg que gera um corte vertical 1080x1920 (H.264 + AAC)."""
    if mode not in MODES:
        raise ValueError(f"Modo desconhecido: {mode}")
    duration = cut.end - cut.start
    return [
        ffmpeg,
        "-hide_banner",
        "-loglevel", "error",
        "-y",
        "-ss", f"{cut.start:.3f}",
        "-i", source,
        "-t", f"{duration:.3f}",
        "-filter_complex", _filter_graph(mode),
        "-map", "[v]",
        "-map", "0:a:0?",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "160k",
        "-movflags", "+faststart",
        output,
    ]


def run_clip(ffmpeg: str, source: str, cut: Cut, output: str, mode: str) -> None:
    """Executa o ffmpeg para um corte. Levanta RuntimeError com o erro do ffmpeg se falhar."""
    command = build_clip_command(ffmpeg, source, cut, output, mode)
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0 or not Path(output).is_file():
        details = (result.stderr or "").strip().splitlines()[-3:]
        raise RuntimeError(" ".join(details) or "ffmpeg falhou sem mensagem.")
