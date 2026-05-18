from __future__ import annotations

import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

if load_dotenv is not None:
    load_dotenv()


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _get_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        return default
    return int(value)


def _get_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        return default
    return float(value)


@dataclass(frozen=True)
class Settings:
    cache_ttl_seconds: int = 86400
    max_video_duration: int = 600
    vocal_separation: bool = True
    pitch_method: str = "pyin"
    score_pitch_weight: float = 0.4
    score_timing_weight: float = 0.3
    score_stability_weight: float = 0.3
    processing_timeout_seconds: int = 120
    sample_rate: int = 16000
    frame_length: int = 512
    hop_length: int = 512
    min_chunk_seconds: float = 0.5
    min_confidence: float = 0.5
    segment_gap_seconds: float = 2.0
    pitch_tolerance_cents: float = 50.0
    timing_tolerance_seconds: float = 0.15

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            cache_ttl_seconds=_get_int("CACHE_TTL_SECONDS", 86400),
            max_video_duration=_get_int("MAX_VIDEO_DURATION", 600),
            vocal_separation=_get_bool("VOCAL_SEPARATION", True),
            pitch_method=os.getenv("PITCH_METHOD", "pyin").strip().lower(),
            score_pitch_weight=_get_float("SCORE_PITCH_WEIGHT", 0.4),
            score_timing_weight=_get_float("SCORE_TIMING_WEIGHT", 0.3),
            score_stability_weight=_get_float("SCORE_STABILITY_WEIGHT", 0.3),
            processing_timeout_seconds=_get_int("PROCESSING_TIMEOUT_SECONDS", 120),
            sample_rate=_get_int("SAMPLE_RATE", 16000),
            frame_length=_get_int("FRAME_LENGTH", 512),
            hop_length=_get_int("HOP_LENGTH", 512),
            min_chunk_seconds=_get_float("MIN_CHUNK_SECONDS", 0.5),
            min_confidence=_get_float("MIN_CONFIDENCE", 0.5),
            segment_gap_seconds=_get_float("SEGMENT_GAP_SECONDS", 2.0),
            pitch_tolerance_cents=_get_float("PITCH_TOLERANCE_CENTS", 50.0),
            timing_tolerance_seconds=_get_float("TIMING_TOLERANCE_SECONDS", 0.15),
        )


def get_settings() -> Settings:
    return Settings.from_env()


settings = get_settings()
