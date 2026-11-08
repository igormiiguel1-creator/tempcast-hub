"""Testes do CortesFactory.

Executar a partir da pasta cortesfactory/:
    python -m unittest discover -s tests -v

Os testes de integração precisam de ffmpeg e ffprobe no PATH (ou em CORTESFACTORY_FFMPEG).
"""

import json
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import core  # noqa: E402
import server  # noqa: E402

FFMPEG = core.find_ffmpeg()
FFPROBE = core.find_ffprobe(FFMPEG)
HAS_FFMPEG = bool(FFMPEG and FFPROBE)


class ParseTimeTests(unittest.TestCase):
    def test_accepts_common_formats(self):
        self.assertEqual(core.parse_time("45"), 45.0)
        self.assertEqual(core.parse_time("1:30"), 90.0)
        self.assertEqual(core.parse_time("01:02:03"), 3723.0)
        self.assertEqual(core.parse_time("00:01:20.5"), 80.5)
        self.assertEqual(core.parse_time("00:01:20,5"), 80.5)
        self.assertEqual(core.parse_time(12), 12.0)

    def test_rejects_invalid(self):
        for bad in ["", "abc", "1:2:3:4", "-5", "1:75", "1:-2"]:
            with self.subTest(value=bad), self.assertRaises(ValueError):
                core.parse_time(bad)

    def test_format_time_roundtrip(self):
        self.assertEqual(core.format_time(3723.5), "01:02:03.500")
        self.assertEqual(core.format_time(0), "00:00:00.000")


class ValidateCutsTests(unittest.TestCase):
    def test_valid_cuts_are_converted(self):
        cuts = core.validate_cuts(
            [{"start": "0:10", "end": "0:40", "title": " Gancho "}], duration=100
        )
        self.assertEqual(len(cuts), 1)
        self.assertEqual((cuts[0].start, cuts[0].end, cuts[0].title), (10.0, 40.0, "Gancho"))

    def test_needs_at_least_one_cut(self):
        with self.assertRaisesRegex(ValueError, "pelo menos um corte"):
            core.validate_cuts([], duration=100)

    def test_end_must_be_after_start(self):
        with self.assertRaisesRegex(ValueError, "Corte 2"):
            core.validate_cuts(
                [{"start": "0:10", "end": "0:40"}, {"start": "0:50", "end": "0:50"}],
                duration=100,
            )

    def test_end_must_be_inside_video(self):
        with self.assertRaisesRegex(ValueError, "ultrapassa a duração"):
            core.validate_cuts([{"start": "0:10", "end": "2:00"}], duration=60)

    def test_limit_on_number_of_cuts(self):
        many = [{"start": "0", "end": "5"}] * (core.MAX_CLIPS + 1)
        with self.assertRaisesRegex(ValueError, "Máximo"):
            core.validate_cuts(many, duration=1000)


class FilenameTests(unittest.TestCase):
    def test_removes_invalid_windows_characters(self):
        name = core.safe_filename('Porque: "isto" <não> funciona?/sim', 3)
        self.assertEqual(name, "03_Porque_isto_não_funcionasim.mp4")

    def test_empty_title_falls_back(self):
        self.assertEqual(core.safe_filename("   ", 1), "01_corte.mp4")

    def test_long_title_is_truncated(self):
        name = core.safe_filename("a" * 200, 10)
        self.assertLessEqual(len(name), 60 + len("10_.mp4"))


class CommandTests(unittest.TestCase):
    def test_blur_mode_builds_vertical_output(self):
        cut = core.Cut(start=10.0, end=40.0, title="x")
        cmd = core.build_clip_command("ffmpeg", "in.mp4", cut, "out.mp4", core.MODE_BLUR)
        graph = cmd[cmd.index("-filter_complex") + 1]
        self.assertIn("scale=1080:1920", graph)
        self.assertIn("overlay", graph)
        self.assertEqual(cmd[cmd.index("-t") + 1], "30.000")
        self.assertEqual(cmd[cmd.index("-ss") + 1], "10.000")
        self.assertEqual(cmd[-1], "out.mp4")

    def test_crop_mode_has_no_overlay(self):
        cut = core.Cut(start=0.0, end=5.0, title="x")
        cmd = core.build_clip_command("ffmpeg", "in.mp4", cut, "out.mp4", core.MODE_CROP)
        graph = cmd[cmd.index("-filter_complex") + 1]
        self.assertNotIn("overlay", graph)
        self.assertIn("crop=1080:1920", graph)

    def test_unknown_mode_rejected(self):
        with self.assertRaises(ValueError):
            core.build_clip_command("ffmpeg", "in.mp4", core.Cut(0, 5, ""), "o.mp4", "zoom")


@unittest.skipUnless(HAS_FFMPEG, "ffmpeg/ffprobe não instalados")
class FfmpegIntegrationTests(unittest.TestCase):
    """Gera um vídeo 16:9 de teste, corta-o e verifica o resultado com o ffprobe."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = Path(tempfile.mkdtemp(prefix="cortesfactory-test-"))
        cls.source = cls.tmp / "source.mp4"
        subprocess.run(
            [
                FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
                "-f", "lavfi", "-i", "testsrc=size=1920x1080:rate=30",
                "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000",
                "-t", "20", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac",
                str(cls.source),
            ],
            check=True,
        )

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_probe_reads_source(self):
        info = core.probe_video(FFPROBE, str(self.source))
        self.assertAlmostEqual(info["duration"], 20.0, delta=0.2)
        self.assertEqual((info["width"], info["height"]), (1920, 1080))
        self.assertTrue(info["has_audio"])

    def test_blur_clip_is_vertical_with_audio(self):
        out = self.tmp / "blur.mp4"
        core.run_clip(FFMPEG, str(self.source), core.Cut(2.0, 7.0, "x"), str(out), core.MODE_BLUR)
        info = core.probe_video(FFPROBE, str(out))
        self.assertEqual((info["width"], info["height"]), (1080, 1920))
        self.assertAlmostEqual(info["duration"], 5.0, delta=0.2)
        self.assertTrue(info["has_audio"])

    def test_crop_clip_is_vertical(self):
        out = self.tmp / "crop.mp4"
        core.run_clip(FFMPEG, str(self.source), core.Cut(10.0, 13.0, "x"), str(out), core.MODE_CROP)
        info = core.probe_video(FFPROBE, str(out))
        self.assertEqual((info["width"], info["height"]), (1080, 1920))

    def test_bad_source_raises(self):
        bogus = self.tmp / "nao_e_video.mp4"
        bogus.write_text("isto não é um vídeo")
        with self.assertRaises(RuntimeError):
            core.run_clip(FFMPEG, str(bogus), core.Cut(0, 5, "x"), str(self.tmp / "x.mp4"), core.MODE_BLUR)


@unittest.skipUnless(HAS_FFMPEG, "ffmpeg/ffprobe não instalados")
class HttpApiTests(unittest.TestCase):
    """Arranca o servidor real numa porta livre e percorre a API como a interface faz."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = Path(tempfile.mkdtemp(prefix="cortesfactory-http-"))
        cls.source = cls.tmp / "episodio.mp4"
        subprocess.run(
            [
                FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
                "-f", "lavfi", "-i", "testsrc=size=1280x720:rate=25",
                "-f", "lavfi", "-i", "sine=frequency=330:sample_rate=44100",
                "-t", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac",
                str(cls.source),
            ],
            check=True,
        )
        cls.httpd = server.make_server(0)
        cls.base = f"http://127.0.0.1:{cls.httpd.server_address[1]}"
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def _request(self, method, path, payload=None):
        data = json.dumps(payload).encode() if payload is not None else None
        req = urllib.request.Request(
            self.base + path, data=data, method=method,
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                return res.status, json.loads(res.read() or b"{}")
        except urllib.error.HTTPError as err:
            return err.code, json.loads(err.read() or b"{}")

    def test_index_page_served(self):
        with urllib.request.urlopen(self.base + "/", timeout=10) as res:
            body = res.read().decode("utf-8")
        self.assertIn("CortesFactory", body)

    def test_status_reports_ffmpeg(self):
        status, data = self._request("GET", "/api/status")
        self.assertEqual(status, 200)
        self.assertTrue(data["ready"])

    def test_probe_endpoint(self):
        status, data = self._request("POST", "/api/probe", {"path": str(self.source)})
        self.assertEqual(status, 200)
        self.assertAlmostEqual(data["duration"], 30.0, delta=0.2)

    def test_probe_missing_file(self):
        status, data = self._request("POST", "/api/probe", {"path": str(self.tmp / "nope.mp4")})
        self.assertEqual(status, 400)
        self.assertIn("não encontrado", data["error"])

    def test_invalid_cut_rejected_before_running(self):
        status, data = self._request("POST", "/api/jobs", {
            "video": str(self.source),
            "cuts": [{"start": "0:20", "end": "0:10"}],
        })
        self.assertEqual(status, 400)
        self.assertIn("Corte 1", data["error"])

    def test_full_job_generates_vertical_clips(self):
        out_dir = self.tmp / "saida"
        status, data = self._request("POST", "/api/jobs", {
            "video": str(self.source),
            "mode": "blur",
            "output_dir": str(out_dir),
            "cuts": [
                {"start": "00:00:02", "end": "00:00:08", "title": "Gancho inicial"},
                {"start": "0:15", "end": "0:20", "title": "Momento: a/b"},
            ],
        })
        self.assertEqual(status, 202)
        job_id = data["id"]

        job = None
        for _ in range(300):
            _, job = self._request("GET", f"/api/jobs/{job_id}")
            if job["status"] != "running":
                break
            threading.Event().wait(0.2)

        self.assertEqual(job["status"], "done", job)
        self.assertEqual(len(job["clips"]), 2)
        for clip in job["clips"]:
            self.assertEqual(clip["status"], "done")
            info = core.probe_video(FFPROBE, clip["output"])
            self.assertEqual((info["width"], info["height"]), (1080, 1920))

        names = sorted(p.name for p in out_dir.glob("*.mp4"))
        self.assertEqual(names, ["01_Gancho_inicial.mp4", "02_Momento_ab.mp4"])


if __name__ == "__main__":
    unittest.main()
