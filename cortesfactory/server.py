"""Servidor local do CortesFactory.

Corre só em 127.0.0.1 (não fica acessível a outros computadores da rede).

Uso:
    python server.py            # arranca e abre o browser
    python server.py --no-browser
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import threading
import uuid
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

import core

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DEFAULT_PORT = int(os.environ.get("CORTESFACTORY_PORT", "8765"))
OUTPUT_FOLDER_NAME = "cortes_verticais"

_jobs: dict[str, dict] = {}
_jobs_lock = threading.Lock()


def _active_job() -> dict | None:
    for job in _jobs.values():
        if job["status"] == "running":
            return job
    return None


def _run_job(job_id: str, ffmpeg: str, source: str, cuts: list[core.Cut], mode: str) -> None:
    job = _jobs[job_id]
    output_dir = Path(job["output_dir"])
    errors = 0

    for number, (cut, clip) in enumerate(zip(cuts, job["clips"]), start=1):
        clip["status"] = "running"
        output = output_dir / core.safe_filename(cut.title or f"corte_{number}", number)
        try:
            core.run_clip(ffmpeg, source, cut, str(output), mode)
            clip["status"] = "done"
            clip["output"] = str(output)
        except (RuntimeError, OSError) as exc:
            clip["status"] = "error"
            clip["error"] = str(exc)
            errors += 1

    generated = len(cuts) - errors
    if generated == 0:
        job["status"] = "error"
        job["finished_message"] = "Nenhum corte foi gerado. Veja os erros abaixo."
    elif errors:
        job["status"] = "done_with_errors"
        job["finished_message"] = f"Concluído com erros: {generated} de {len(cuts)} cortes gerados."
    else:
        job["status"] = "done"
        job["finished_message"] = f"Concluído: {generated} cortes gerados."


class Handler(BaseHTTPRequestHandler):
    server_version = "CortesFactory/1.0"

    # --- helpers -----------------------------------------------------------

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_error_json(self, status: int, message: str) -> None:
        self._send_json(status, {"error": message})

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0 or length > 1_000_000:
            raise ValueError("Pedido inválido.")
        try:
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise ValueError("Pedido inválido.") from None
        if not isinstance(data, dict):
            raise ValueError("Pedido inválido.")
        return data

    def _serve_static(self, relative: str) -> None:
        target = (STATIC_DIR / relative).resolve()
        if STATIC_DIR.resolve() not in target.parents or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        if content_type.startswith("text/") or content_type in ("application/javascript", "application/json"):
            content_type += "; charset=utf-8"
        body = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):  # noqa: A002 - assinatura da classe base
        # Silencioso: o utilizador não precisa de ver logs de cada pedido.
        pass

    # --- rotas -------------------------------------------------------------

    def do_GET(self):  # noqa: N802 - nome exigido por http.server
        path = urlparse(self.path).path

        if path in ("/", "/index.html"):
            return self._serve_static("index.html")
        if path.startswith("/static/"):
            return self._serve_static(path[len("/static/"):])
        if path == "/api/status":
            ffmpeg = core.find_ffmpeg()
            ffprobe = core.find_ffprobe(ffmpeg)
            return self._send_json(HTTPStatus.OK, {
                "ffmpeg": ffmpeg,
                "ffprobe": ffprobe,
                "ready": bool(ffmpeg and ffprobe),
                "modes": list(core.MODES),
            })
        if path.startswith("/api/jobs/"):
            job_id = path[len("/api/jobs/"):]
            with _jobs_lock:
                job = _jobs.get(job_id)
                if job is None:
                    return self._send_error_json(HTTPStatus.NOT_FOUND, "Tarefa não encontrada.")
                return self._send_json(HTTPStatus.OK, job)

        self.send_error(HTTPStatus.NOT_FOUND)

    def do_POST(self):  # noqa: N802
        path = urlparse(self.path).path
        try:
            body = self._read_json()
        except ValueError as exc:
            return self._send_error_json(HTTPStatus.BAD_REQUEST, str(exc))

        if path == "/api/probe":
            return self._handle_probe(body)
        if path == "/api/jobs":
            return self._handle_create_job(body)

        self.send_error(HTTPStatus.NOT_FOUND)

    def _handle_probe(self, body: dict) -> None:
        ffmpeg = core.find_ffmpeg()
        ffprobe = core.find_ffprobe(ffmpeg)
        if not ffprobe:
            return self._send_error_json(HTTPStatus.SERVICE_UNAVAILABLE, "ffmpeg não encontrado.")

        source = str(body.get("path", "")).strip().strip('"')
        if not source or not Path(source).is_file():
            return self._send_error_json(HTTPStatus.BAD_REQUEST, "Ficheiro de vídeo não encontrado.")
        try:
            info = core.probe_video(ffprobe, source)
        except ValueError as exc:
            return self._send_error_json(HTTPStatus.BAD_REQUEST, str(exc))
        return self._send_json(HTTPStatus.OK, info)

    def _handle_create_job(self, body: dict) -> None:
        ffmpeg = core.find_ffmpeg()
        ffprobe = core.find_ffprobe(ffmpeg)
        if not ffmpeg or not ffprobe:
            return self._send_error_json(HTTPStatus.SERVICE_UNAVAILABLE, "ffmpeg não encontrado.")

        source = str(body.get("video", "")).strip().strip('"')
        if not source or not Path(source).is_file():
            return self._send_error_json(HTTPStatus.BAD_REQUEST, "Ficheiro de vídeo não encontrado.")

        mode = body.get("mode", core.MODE_BLUR)
        if mode not in core.MODES:
            return self._send_error_json(HTTPStatus.BAD_REQUEST, "Modo de enquadramento inválido.")

        try:
            info = core.probe_video(ffprobe, source)
            cuts = core.validate_cuts(body.get("cuts"), duration=info["duration"])
        except ValueError as exc:
            return self._send_error_json(HTTPStatus.BAD_REQUEST, str(exc))

        output_folder = str(body.get("output_dir", "")).strip().strip('"')
        output_dir = Path(output_folder) if output_folder else Path(source).parent / OUTPUT_FOLDER_NAME
        try:
            output_dir.mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            return self._send_error_json(HTTPStatus.BAD_REQUEST, f"Não foi possível criar a pasta de saída: {exc}")

        with _jobs_lock:
            if _active_job() is not None:
                return self._send_error_json(HTTPStatus.CONFLICT, "Já existe uma tarefa em curso. Aguarde que termine.")
            job_id = uuid.uuid4().hex
            _jobs[job_id] = {
                "id": job_id,
                "status": "running",
                "video": source,
                "output_dir": str(output_dir),
                "mode": mode,
                "clips": [
                    {
                        "index": n,
                        "title": cut.title,
                        "start": cut.start,
                        "end": cut.end,
                        "status": "pending",
                    }
                    for n, cut in enumerate(cuts, start=1)
                ],
                "finished_message": "",
            }

        worker = threading.Thread(target=_run_job, args=(job_id, ffmpeg, source, cuts, mode), daemon=True)
        worker.start()
        return self._send_json(HTTPStatus.ACCEPTED, {"id": job_id})


def make_server(port: int = DEFAULT_PORT) -> ThreadingHTTPServer:
    return ThreadingHTTPServer(("127.0.0.1", port), Handler)


def main() -> None:
    parser = argparse.ArgumentParser(description="CortesFactory - cortes verticais a partir de vídeos longos")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--no-browser", action="store_true", help="não abrir o browser automaticamente")
    args = parser.parse_args()

    server = make_server(args.port)
    url = f"http://127.0.0.1:{server.server_address[1]}/"
    print(f"CortesFactory a correr em {url}")
    print("Para fechar, prima Ctrl+C nesta janela.")
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nA fechar CortesFactory.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
