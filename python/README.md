# Python Karaoke Scoring Server

FastAPI audio processing service for karaoke conversion and realtime scoring.

## Runtime Requirements

- Python 3.11. Basic Pitch currently documents support through Python 3.11.
- ffmpeg on `PATH`

Convert jobs and converted song data are cached in memory inside the running
FastAPI process. Restarting the server clears all jobs/cache, and multiple
Uvicorn worker processes will not share cache with each other.

Check ffmpeg before calling `/convert`:

```powershell
ffmpeg -version
```

If PowerShell cannot find `ffmpeg`, install it and restart the terminal so the
updated `PATH` is visible to Uvicorn.

## Setup

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

## Run

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API

- `POST /convert`: queues YouTube-to-MIDI conversion with Basic Pitch and returns `job_id`.
- `POST /convert/upload`: queues uploaded `.mp3`, `.wav`, `.flac`, `.m4a`, or `.ogg`
  conversion with Basic Pitch.
- `GET /convert/{job_id}/status`: returns progress.
- `GET /convert/{job_id}/events`: streams SSE progress. The `done` event returns
  JSON with `metadata` and `notes_base64`.
- `GET /convert/{job_id}/result`: returns the same JSON result for polling clients.
  Decode `notes_base64` into float32 triplets `[start_seconds, midi_note, duration_seconds]`.
- `POST /score`: accepts `audio_chunk`, `song_id`, `seg_index`, `start_time`.
- `DELETE /cache/{song_id}`: deletes cached reference data from memory.

## Tests

```powershell
.\.venv\Scripts\Activate.ps1
pytest
```

End-to-end conversion requires ffmpeg, yt-dlp network access for YouTube URLs,
and Basic Pitch model dependencies in `requirements.txt`.
