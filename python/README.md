# Python Karaoke Scoring Server

FastAPI audio processing service for karaoke conversion and realtime scoring.

## Runtime Requirements

- Python 3.11. Basic Pitch currently documents support through Python 3.11.
- ffmpeg on `PATH`

Convert jobs and converted song data are cached in memory inside the running
FastAPI process. Restarting the server clears all jobs/cache, and multiple
Uvicorn worker processes will not share cache with each other.

Conversion jobs run through an in-process bounded queue. Use
`CONVERT_CONCURRENCY` to limit how many heavy audio jobs run at the same time,
and `MAX_CONVERT_QUEUE_SIZE` to reject excess jobs with `convert_queue_full`.
For small servers, start with `CONVERT_CONCURRENCY=1`.

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

or
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name "python" --watch

```

## Tests

```powershell
.\.venv\Scripts\Activate.ps1
pytest
```

End-to-end conversion requires ffmpeg, yt-dlp network access for YouTube URLs,
and Basic Pitch model dependencies in `requirements.txt`.

## API Reference

### 1. YouTube Search

**Endpoint:** `GET /convert/youtube/search`

**Query Parameters:**

- `q` (string, required): Search query. Automatically appends "karaoke" if not present.
- `limit` (integer, optional): Number of results (1-10, default: 5)

**Response:** `200 OK`

```json
[
    {
        "title": "Song Name - Artist Karaoke",
        "url": "https://www.youtube.com/watch?v=...",
        "video_id": "...",
        "duration": 180.5,
        "thumbnail": "https://...",
        "channel": "Karaoke Channel",
        "view_count": 50000
    }
]
```

---

### 2. Convert YouTube Video to MIDI

**Endpoint:** `POST /convert`

**Request Body:**

```json
{
    "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:** `200 OK`

```json
{
    "job_id": "abc123def456",
    "song_id": "dQw4w9WgXcQ",
    "status": "pending",
    "status_url": "http://localhost:8000/convert/abc123def456/status",
    "events_url": "http://localhost:8000/convert/abc123def456/events",
    "result_url": null
}
```

**Status values:** `pending` | `processing` | `done` | `error`

**Frontend Implementation:**

```javascript
// 1.  stream events (recommended)
function streamConversionEvents(jobId) {
    const eventSource = new EventSource(`/convert/${jobId}/events`)
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log(`Progress: ${data.progress}%`)
    }
    eventSource.addEventListener("done", (event) => {
        const result = JSON.parse(event.data)
        console.log("Conversion complete:", result)
        eventSource.close()
    })
}
```

---

### 3. Get Conversion Status

**Endpoint:** `GET /convert/{job_id}/status`

**Response:** `200 OK`

```json
{
    "job_id": "abc123def456",
    "status": "processing",
    "progress": 45,
    "step": "extracting_pitch",
    "result_url": null,
    "error": null,
    "error_detail": null
}
```

**Status steps:** `queued` → `downloading` → `extracting_pitch` → `building_notes` → `cache_hit`

---

### 4. Stream Conversion Progress (Server-Sent Events)

**Endpoint:** `GET /convert/{job_id}/events`

**Stream Events:**

```
event: progress
data: {"job_id":"abc123","progress":50,"step":"extracting_pitch"}

event: done
data: {"metadata":{"title":"..."},"notes_base64":"AQID..."}

event: error
data: {"error":"download_failed","message":"..."}
```

---

### 5. Get Conversion Result

**Endpoint:** `GET /convert/{job_id}/result`

**Response:** `200 OK`

```json
{
    "metadata": {
        "title": "Song Title",
        "duration": 180.5,
        "artist": "Artist Name"
    },
    "notes_base64": "AQIDBA=="
}
```

**Decoding notes on frontend:**

```javascript
function decodeNotes(notesBase64) {
    // Decode base64 to bytes
    const binaryString = atob(notesBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }

    // Convert bytes to float32 array
    const floatArray = new Float32Array(bytes.buffer)

    // Group into triplets: [start_seconds, midi_note, duration_seconds]
    const notes = []
    for (let i = 0; i < floatArray.length; i += 3) {
        notes.push({
            start: floatArray[i],
            midiNote: floatArray[i + 1],
            duration: floatArray[i + 2],
        })
    }
    return notes
}

// Usage
const result = await fetch(`/convert/abc123def456/result`).then((r) => r.json())
const notes = decodeNotes(result.notes_base64)
console.log(notes)
// Output: [
//   { start: 0.5, midiNote: 60, duration: 0.5 },
//   { start: 1.0, midiNote: 62, duration: 0.5 },
//   ...
// ]
```

---

### 6. Score Audio Performance

**Endpoint:** `POST /score`

**Request:** multipart/form-data

- `audio_chunk` (required): Audio file (WAV/MP3)
- `song_id` (required): Song ID from conversion
- `seg_index` (required): Segment index (integer)
- `start_time` (required): When user started singing (seconds)
- `min_midi` (optional): Filter notes below this MIDI value
- `max_midi` (optional): Filter notes above this MIDI value
- `min_note_duration` (optional): Minimum note duration to consider

**Response:** `200 OK`

```json
{
    "seg_index": 0,
    "score": 85.5,
    "breakdown": {
        "pitch": 0.9,
        "timing": 0.85,
        "stability": 0.82
    },
    "frame_data": [
        {
            "t": 0.0,
            "user_hz": 440.5,
            "ref_hz": 440.0,
            "cents_off": 2.3
        },
        {
            "t": 0.02,
            "user_hz": null,
            "ref_hz": 440.0,
            "cents_off": null
        }
    ]
}
```

**Frontend Visualization:**

```javascript
async function scorePerformance(audioBlob, songId, segIndex, startTime) {
    const formData = new FormData()
    formData.append("audio_chunk", audioBlob)
    formData.append("song_id", songId)
    formData.append("seg_index", segIndex)
    formData.append("start_time", startTime)

    const response = await fetch("/score", {
        method: "POST",
        body: formData,
    })

    const result = await response.json()

    // Render score on UI
    document.getElementById("score").textContent = result.score.toFixed(1)
    document.getElementById("pitch-score").textContent = (result.breakdown.pitch * 100).toFixed(0) + "%"
    document.getElementById("timing-score").textContent = (result.breakdown.timing * 100).toFixed(0) + "%"
    document.getElementById("stability-score").textContent = (result.breakdown.stability * 100).toFixed(0) + "%"

    // Optional: Plot frame data using Chart.js or similar
    plotFrameData(result.frame_data)
}
```

---

### 8. Delete Cached Song

**Endpoint:** `DELETE /cache/{song_id}`

**Response:** `200 OK`

```json
{
    "song_id": "dQw4w9WgXcQ",
    "deleted": true
}
```

---

## Error Responses

All errors follow this format:

```json
{
    "detail": "error_code",
    "message": "Human readable error message"
}
```

**Common errors:**

- `invalid_url`: YouTube URL is invalid
- `invalid_audio`: Audio file format not supported
- `job_not_found`: Job ID doesn't exist (HTTP 404)
- `result_not_ready`: Conversion still in progress (HTTP 202)
- `reference_not_found`: Song ID not cached (HTTP 404)
- `chunk_too_short`: Audio chunk is too short for scoring
