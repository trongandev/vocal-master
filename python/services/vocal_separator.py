from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from config import Settings, settings
from errors import download_failed


def maybe_separate_vocals(input_wav: Path, work_dir: Path, cfg: Settings = settings) -> Path:
    if not cfg.vocal_separation:
        return input_wav

    output_dir = work_dir / "demucs"
    try:
        subprocess.run(
            [
                sys.executable,
                "-m",
                "demucs",
                "--two-stems",
                "vocals",
                "-n",
                "htdemucs",
                "-o",
                str(output_dir),
                str(input_wav),
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=cfg.processing_timeout_seconds,
        )
    except subprocess.TimeoutExpired as exc:
        raise download_failed("demucs vocal separation timed out") from exc
    except subprocess.CalledProcessError as exc:
        raise download_failed(exc.stderr or exc.stdout or "demucs vocal separation failed") from exc

    expected = output_dir / "htdemucs" / input_wav.stem / "vocals.wav"
    if expected.exists():
        return expected

    matches = list(output_dir.glob("**/vocals.wav"))
    if not matches:
        raise download_failed("demucs did not produce vocals.wav")
    return matches[0]
