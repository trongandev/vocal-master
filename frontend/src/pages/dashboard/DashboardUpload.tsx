import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle2, FileMusic, Link as LinkIcon, Loader2, Music2, Save, Search, Youtube } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../contexts/AuthContext"
import {
    apiUrl,
    createConvertJob,
    decodeNotes,
    extractYouTubeVideoId,
    formatDuration,
    formatViewCount,
    getConvertResult,
    getConvertStatus,
    searchYouTubeVideos,
    type ConvertJob,
    type ConvertJobStatus,
    type ConvertResult,
    type KaraokeNote,
    type YouTubeSearchResult,
} from "../../lib/karaokeApi"
import { saveConvertedSong } from "../../lib/songStore"

type UploadTab = "youtube" | "link"

interface ConvertProgress {
    progress: number
    step: string
    status: string
}

const DEFAULT_PROGRESS: ConvertProgress = { progress: 0, step: "idle", status: "pending" }
const POLL_INTERVAL_MS = 1200

export default function DashboardUpload() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const previewRef = useRef<HTMLCanvasElement>(null)

    const [activeTab, setActiveTab] = useState<UploadTab>("youtube")
    const [query, setQuery] = useState("")
    const [linkUrl, setLinkUrl] = useState("")
    const [searching, setSearching] = useState(false)
    const [results, setResults] = useState<YouTubeSearchResult[]>([])
    const [selectedVideo, setSelectedVideo] = useState<YouTubeSearchResult | null>(null)

    const [converting, setConverting] = useState(false)
    const [progress, setProgress] = useState<ConvertProgress>(DEFAULT_PROGRESS)
    const [convertJob, setConvertJob] = useState<ConvertJob | null>(null)
    const [convertResult, setConvertResult] = useState<ConvertResult | null>(null)
    const [notes, setNotes] = useState<KaraokeNote[]>([])

    const [title, setTitle] = useState("")
    const [artist, setArtist] = useState("")
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const selectedSourceUrl = activeTab === "youtube" ? selectedVideo?.url || "" : linkUrl.trim()
    const selectedVideoId = selectedVideo?.video_id || extractYouTubeVideoId(selectedSourceUrl)

    const analysis = useMemo(() => buildAnalysis(notes, convertResult), [notes, convertResult])

    useEffect(() => {
        drawPreview(previewRef.current, notes)
    }, [notes])

    async function handleSearch() {
        const trimmed = query.trim()
        if (!trimmed) {
            setError("Nhap tu khoa tim kiem YouTube.")
            return
        }

        setSearching(true)
        setError("")
        setMessage("")
        setSelectedVideo(null)

        try {
            const videos = await searchYouTubeVideos(trimmed, 6)
            setResults(videos)
            if (videos.length === 0) setMessage("Khong tim thay video phu hop.")
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setSearching(false)
        }
    }

    async function handleConvert() {
        if (!selectedSourceUrl) {
            setError(activeTab === "youtube" ? "Chon mot video YouTube truoc khi tach MIDI." : "Dan link YouTube truoc khi xu ly.")
            return
        }

        setConverting(true)
        setError("")
        setMessage("")
        setConvertResult(null)
        setNotes([])
        setProgress({ progress: 0, step: "queued", status: "pending" })

        try {
            const job = await createConvertJob(selectedSourceUrl)
            setConvertJob(job)
            setProgress({ progress: job.status === "done" ? 100 : 0, step: job.status === "done" ? "cache_hit" : "queued", status: job.status })

            const result = await waitForConvertDone(job, setProgress)
            const decoded = decodeNotes(result.notes_base64)
            setConvertResult(result)
            setNotes(decoded)

            const metadataTitle = typeof result.metadata.source_name === "string" ? result.metadata.source_name : ""
            setTitle(selectedVideo?.title || metadataTitle || "Untitled")
            setArtist(selectedVideo?.channel || "")
            setProgress({ progress: 100, step: "done", status: "done" })
            setMessage("Da tach MIDI va san sang luu vao thu vien.")
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setConverting(false)
        }
    }

    async function handleSave() {
        if (!user || !convertJob || !convertResult) return

        setSaving(true)
        setError("")
        try {
            const songId = await saveConvertedSong({
                userId: user.uid,
                title,
                artist,
                sourceUrl: selectedSourceUrl,
                youtubeVideoId: selectedVideoId,
                thumbnail: selectedVideo?.thumbnail || (selectedVideoId ? `https://i.ytimg.com/vi/${selectedVideoId}/hqdefault.jpg` : null),
                duration: selectedVideo?.duration ?? (typeof convertResult.metadata.duration === "number" ? convertResult.metadata.duration : null),
                pythonSongId: convertJob.song_id,
                convertJobId: convertJob.job_id,
                result: convertResult,
            })
            navigate(`/play/${songId}`)
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-12">
            <div className="flex items-center gap-4 text-sm font-medium">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    Bai hat cua toi
                </Link>
                <span className="text-slate-600">/</span>
                <span className="text-violet-400">Them bai hat moi</span>
            </div>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:p-8">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-white">Them bai hat de luyen tap karaoke</h1>
                    <p className="text-sm text-slate-400">Tim YouTube karaoke, tach MIDI bang Python server, xem ket qua phan tich roi luu vao Firestore.</p>
                </div>

                <div className="mx-auto mb-8 flex max-w-xl rounded-xl border border-slate-800 bg-slate-950 p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("youtube")}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition ${
                            activeTab === "youtube" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        }`}
                    >
                        <Youtube className="h-5 w-5 text-red-500" />
                        Tim YouTube
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("link")}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition ${
                            activeTab === "link" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        }`}
                    >
                        <LinkIcon className="h-4 w-4 text-blue-400" />
                        Dan link
                    </button>
                </div>

                {activeTab === "youtube" ? (
                    <div className="space-y-5">
                        <div className="relative mx-auto max-w-2xl">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") void handleSearch()
                                }}
                                placeholder="Tim ten bai hat karaoke tren YouTube..."
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-4 pl-12 pr-36 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <Button
                                type="button"
                                onClick={handleSearch}
                                disabled={searching}
                                className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-red-600 px-5 text-white hover:bg-red-500"
                            >
                                {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Tim
                            </Button>
                        </div>

                        {results.length > 0 && (
                            <div className="grid gap-3">
                                {results.map((video) => {
                                    const isSelected = selectedVideo?.url === video.url
                                    return (
                                        <button
                                            type="button"
                                            key={video.url}
                                            onClick={() => setSelectedVideo(video)}
                                            className={`grid gap-4 rounded-2xl border p-3 text-left transition md:grid-cols-[160px_1fr_auto] md:items-center ${
                                                isSelected ? "border-violet-500 bg-violet-500/10" : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="aspect-video overflow-hidden rounded-xl bg-slate-800">
                                                {video.thumbnail ? <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" /> : null}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="line-clamp-2 font-semibold text-white">{video.title}</div>
                                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                                                    <span>{video.channel || "Unknown channel"}</span>
                                                    <span>{formatDuration(video.duration)}</span>
                                                    <span>{formatViewCount(video.view_count)} views</span>
                                                </div>
                                            </div>
                                            <div className={`rounded-full px-3 py-1 text-xs font-bold ${isSelected ? "bg-violet-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                                                {isSelected ? "Da chon" : "Chon"}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mx-auto max-w-2xl space-y-3">
                        <label className="text-sm font-semibold text-slate-300">YouTube URL</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                value={linkUrl}
                                onChange={(event) => setLinkUrl(event.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-white">Qua trinh tach file thanh MIDI</div>
                            <div className="text-xs text-slate-500">Server Python se download audio, chay Basic Pitch va tra ve metadata + notes_base64.</div>
                        </div>
                        <Button type="button" onClick={handleConvert} disabled={converting || !selectedSourceUrl} className="bg-violet-600 text-white hover:bg-violet-500">
                            {converting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Music2 className="mr-2 h-4 w-4" />}
                            Tach MIDI
                        </Button>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full bg-violet-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, progress.progress))}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>{progress.status}</span>
                        <span>{progress.step} - {progress.progress}%</span>
                    </div>
                </div>

                {error && <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
                {message && <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">{message}</div>}

                {convertResult && (
                    <div className="mt-8 space-y-6">
                        <div className="flex flex-col gap-4 border-t border-slate-800 pt-6 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Ket qua phan tich</h2>
                                <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                    Convert thanh cong bang {String(convertResult.metadata.transcription_engine || "basic_pitch")}
                                </div>
                            </div>
                            <Button type="button" variant="outline" className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800" onClick={() => resetResult(setConvertResult, setNotes, setProgress)}>
                                Chon bai khac
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            {analysis.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
                                    <div className="mt-2 text-xl font-bold text-white">{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-300">Ban xem truoc MIDI & not nhac</label>
                            <div className="h-56 rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                <canvas ref={previewRef} className="h-full w-full rounded-xl bg-slate-900" />
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-sm font-semibold text-slate-300">Ten bai hat</span>
                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </label>
                            <label className="space-y-2">
                                <span className="text-sm font-semibold text-slate-300">Ca si / Kenh</span>
                                <input
                                    value={artist}
                                    onChange={(event) => setArtist(event.target.value)}
                                    placeholder="Nhap ca si neu can"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Link to="/dashboard">
                                <Button variant="ghost" className="text-slate-400 hover:text-white">Huy bo</Button>
                            </Link>
                            <Button type="button" onClick={handleSave} disabled={saving || !title.trim()} className="bg-violet-600 text-white hover:bg-violet-500">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Luu vao thu vien
                            </Button>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
                    <FileMusic className="h-6 w-6 shrink-0 text-slate-500" />
                    <p className="text-slate-500">
                        Luu y: Python server cache ket qua trong RAM. Sau khi luu, trang play se nap lai reference MIDI tu Firestore vao backend truoc khi cham diem.
                    </p>
                </div>
            </section>
        </div>
    )
}

async function waitForConvertDone(job: ConvertJob, onStatus: (progress: ConvertProgress) => void): Promise<ConvertResult> {
    if (job.status === "done" && job.result_url) return getConvertResult(job.result_url)

    return new Promise((resolve, reject) => {
        let settled = false
        let pollingStarted = false
        let events: EventSource | null = null

        const finish = (result: ConvertResult) => {
            if (settled) return
            settled = true
            events?.close()
            resolve(result)
        }

        const fail = (err: unknown) => {
            if (settled) return
            settled = true
            events?.close()
            reject(err)
        }

        const startPolling = () => {
            if (pollingStarted || settled) return
            pollingStarted = true
            pollConvertResult(job.status_url, onStatus).then(finish).catch(fail)
        }

        try {
            events = new EventSource(apiUrl(job.events_url))
            events.addEventListener("status", (event) => {
                const payload = JSON.parse((event as MessageEvent).data) as ConvertJobStatus
                onStatus({ progress: payload.progress || 0, step: payload.step || "processing", status: payload.status })
            })
            events.addEventListener("done", (event) => {
                finish(JSON.parse((event as MessageEvent).data) as ConvertResult)
            })
            events.addEventListener("error", (event) => {
                if (event instanceof MessageEvent && event.data) {
                    try {
                        const payload = JSON.parse(event.data)
                        fail(new Error(payload.error_detail || payload.error || "Convert failed"))
                    } catch {
                        fail(new Error("Convert failed"))
                    }
                    return
                }
                events?.close()
                startPolling()
            })
            events.onerror = () => {
                events?.close()
                startPolling()
            }
        } catch {
            startPolling()
        }
    })
}

async function pollConvertResult(statusUrl: string, onStatus: (progress: ConvertProgress) => void): Promise<ConvertResult> {
    while (true) {
        const status = await getConvertStatus(statusUrl)
        onStatus({ progress: status.progress || 0, step: status.step || "processing", status: status.status })

        if (status.status === "done" && status.result_url) return getConvertResult(status.result_url)
        if (status.status === "error") throw new Error(status.error_detail || status.error || "Convert failed")
        await sleep(POLL_INTERVAL_MS)
    }
}

function resetResult(
    setConvertResult: (value: ConvertResult | null) => void,
    setNotes: (value: KaraokeNote[]) => void,
    setProgress: (value: ConvertProgress) => void,
) {
    setConvertResult(null)
    setNotes([])
    setProgress(DEFAULT_PROGRESS)
}

function buildAnalysis(notes: KaraokeNote[], result: ConvertResult | null) {
    const midiValues = notes.map((note) => note.midi)
    const minMidi = midiValues.length ? Math.min(...midiValues) : null
    const maxMidi = midiValues.length ? Math.max(...midiValues) : null
    const duration = typeof result?.metadata.duration === "number" ? result.metadata.duration : null
    const segments = Array.isArray(result?.metadata.segments) ? result.metadata.segments.length : 0

    return [
        { label: "Duration", value: formatDuration(duration) },
        { label: "Notes", value: String(notes.length) },
        { label: "Range", value: minMidi == null || maxMidi == null ? "--" : `${noteName(minMidi)} - ${noteName(maxMidi)}` },
        { label: "Segments", value: String(segments) },
    ]
}

function drawPreview(canvas: HTMLCanvasElement | null, notes: KaraokeNote[]) {
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(rect.width * ratio))
    canvas.height = Math.max(1, Math.floor(rect.height * ratio))

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, rect.width, rect.height)

    if (notes.length === 0) {
        ctx.fillStyle = "#64748b"
        ctx.textAlign = "center"
        ctx.font = "14px sans-serif"
        ctx.fillText("MIDI preview se hien thi sau khi convert", rect.width / 2, rect.height / 2)
        return
    }

    const visible = notes.slice(0, 700)
    const maxEnd = Math.max(...visible.map((note) => note.end), 1)
    const minMidi = Math.min(...visible.map((note) => note.midi), 48)
    const maxMidi = Math.max(...visible.map((note) => note.midi), 84)
    const midiRange = Math.max(1, maxMidi - minMidi)

    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i += 1) {
        const y = (rect.height / 5) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()
    }

    for (const note of visible) {
        const x = (note.start / maxEnd) * rect.width
        const width = Math.max(2, (note.duration / maxEnd) * rect.width)
        const y = rect.height - ((note.midi - minMidi) / midiRange) * rect.height
        ctx.fillStyle = "#8b5cf6"
        ctx.fillRect(x, Math.max(2, y - 4), width, 7)
    }
}

function noteName(midi: number) {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const rounded = Math.round(midi)
    return `${names[((rounded % 12) + 12) % 12]}${Math.floor(rounded / 12) - 1}`
}

function sleep(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function errorMessage(err: unknown) {
    return err instanceof Error ? err.message : String(err)
}
