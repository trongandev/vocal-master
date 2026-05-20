import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { Activity, AlertCircle, CheckCircle, Clock, Loader2, Mic, Music, Pause, Play, Save, Settings2, X } from "lucide-react"
import YouTube from "react-youtube"
import { useAuth } from "../../contexts/AuthContext"
import {
    decodeNotes,
    formatDuration,
    hydrateReference,
    scoreAudioChunk,
    type ConvertResult,
    type KaraokeNote,
    type ScoreBreakdown,
    type ScoreFrame,
    type ScoreResponse,
} from "../../lib/karaokeApi"
import { getSavedSongWithNotes, type SavedSong } from "../../lib/songStore"

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const MIN_MIDI = 48
const MAX_MIDI = 84
const MIN_NOTE_DURATION = 0.08
const SCORE_CHUNK_SECONDS = 1
const MIN_SCORE_CHUNK_SECONDS = 0.5
const PITCH_TOLERANCE_CENTS = 50

interface FinalSummary {
    averageScore: number | null
    pitch: number | null
    timing: number | null
    stability: number | null
    chunks: number
}

export default function PlayScreen() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [song, setSong] = useState<SavedSong | null>(null)
    const [notes, setNotes] = useState<KaraokeNote[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [player, setPlayer] = useState<any>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [sessionActive, setSessionActive] = useState(false)
    const [micReady, setMicReady] = useState(false)
    const [pendingScores, setPendingScores] = useState(0)
    const [scoreHistory, setScoreHistory] = useState<ScoreResponse[]>([])
    const [currentScore, setCurrentScore] = useState<number | null>(null)
    const [breakdown, setBreakdown] = useState<ScoreBreakdown>({ pitch: 0, timing: 0, stability: 0 })
    const [currentNoteName, setCurrentNoteName] = useState("--")
    const [targetNoteName, setTargetNoteName] = useState("--")
    const [correctHits, setCorrectHits] = useState(0)
    const [flaggedHits, setFlaggedHits] = useState(0)
    const [latencyOffset, setLatencyOffset] = useState(0)
    const [showSettings, setShowSettings] = useState(false)
    const [finalSummary, setFinalSummary] = useState<FinalSummary | null>(null)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const micLevelRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)
    const songRef = useRef<SavedSong | null>(null)
    const notesRef = useRef<KaraokeNote[]>([])
    const segmentsRef = useRef<{ start: number; end: number }[]>([])
    const sessionActiveRef = useRef(false)
    const audioContextRef = useRef<AudioContext | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const pcmChunksRef = useRef<Float32Array[]>([])
    const pcmSamplesRef = useRef(0)
    const chunkStartTimeRef = useRef<number | null>(null)
    const flushingRef = useRef(false)
    const frameDataRef = useRef<ScoreFrame[]>([])
    const scoreHistoryRef = useRef<ScoreResponse[]>([])

    const melodyNotes = useMemo(() => buildMelodyLine(notes.filter((note) => note.midi >= MIN_MIDI && note.midi <= MAX_MIDI && note.duration >= MIN_NOTE_DURATION)), [notes])
    const segments = useMemo(() => buildSegmentsFromNotes(melodyNotes, 2), [melodyNotes])
    const currentAverage = useMemo(() => average(scoreHistory.map((item) => item.score)), [scoreHistory])

    useEffect(() => {
        if (!user) {
            navigate("/login")
            return
        }
        if (!id) return

        let active = true
        setLoading(true)
        setError("")

        getSavedSongWithNotes(id, user.uid)
            .then(async (payload) => {
                if (!active) return
                if (!payload) {
                    setError("Khong tim thay bai hat hoac ban khong co quyen truy cap.")
                    return
                }

                const result: ConvertResult = {
                    metadata: payload.song.metadata,
                    notes_base64: payload.notesBase64,
                }
                await hydrateReference(payload.song.pythonSongId, result)

                const decodedNotes = decodeNotes(payload.notesBase64)
                if (!active) return
                setSong(payload.song)
                setNotes(decodedNotes)
            })
            .catch((err) => {
                if (active) setError(err instanceof Error ? err.message : String(err))
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [id, navigate, user])

    useEffect(() => {
        playerRef.current = player
    }, [player])

    useEffect(() => {
        songRef.current = song
    }, [song])

    useEffect(() => {
        notesRef.current = melodyNotes
        segmentsRef.current = segments
    }, [melodyNotes, segments])

    useEffect(() => {
        sessionActiveRef.current = sessionActive
    }, [sessionActive])

    useEffect(() => {
        let frame = 0
        const loop = () => {
            const time = getScoringTime(playerRef.current, latencyOffset)
            drawPianoRoll(canvasRef.current, notesRef.current, frameDataRef.current, time)
            setTargetNoteName(noteName(melodyNoteAt(notesRef.current, time)?.midi ?? null))
            frame = window.requestAnimationFrame(loop)
        }
        frame = window.requestAnimationFrame(loop)
        return () => window.cancelAnimationFrame(frame)
    }, [latencyOffset])

    useEffect(() => {
        return () => {
            void flushScoreChunk(true)
            stopMic()
        }
    }, [])

    const flushScoreChunk = useCallback(async (force: boolean) => {
        const audioContext = audioContextRef.current
        const activeSong = songRef.current
        if (!audioContext || !activeSong || pcmSamplesRef.current === 0 || chunkStartTimeRef.current == null || flushingRef.current) return

        const duration = pcmSamplesRef.current / audioContext.sampleRate
        if (!force && duration < SCORE_CHUNK_SECONDS) return
        if (duration < MIN_SCORE_CHUNK_SECONDS) {
            resetChunkBuffer()
            return
        }

        const chunks = pcmChunksRef.current
        const totalSamples = pcmSamplesRef.current
        const startTime = chunkStartTimeRef.current
        const segmentIndex = Math.max(0, findSegmentIndexAt(segmentsRef.current, startTime))
        resetChunkBuffer()

        flushingRef.current = true
        setPendingScores((value) => value + 1)

        try {
            const wavBlob = encodeWav(mergePcmChunks(chunks, totalSamples), audioContext.sampleRate)
            const result = await scoreAudioChunk({
                audioBlob: wavBlob,
                songId: activeSong.pythonSongId,
                segmentIndex,
                startTime,
                minMidi: MIN_MIDI,
                maxMidi: MAX_MIDI,
                minNoteDuration: MIN_NOTE_DURATION,
            })
            handleScoreResult(result)
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            if (!message.includes("chunk_too_short")) setError(message)
        } finally {
            flushingRef.current = false
            setPendingScores((value) => Math.max(0, value - 1))
        }
    }, [])

    function resetChunkBuffer() {
        pcmChunksRef.current = []
        pcmSamplesRef.current = 0
        chunkStartTimeRef.current = null
    }

    async function startSession() {
        if (!song) return
        setError("")
        setFinalSummary(null)
        try {
            if (!micReady) await startMic(flushScoreChunk)
            setSessionActive(true)
            playerRef.current?.playVideo?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Khong the truy cap microphone.")
        }
    }

    async function pauseSession() {
        setSessionActive(false)
        playerRef.current?.pauseVideo?.()
        await flushScoreChunk(true)
    }

    async function finishSession() {
        setSessionActive(false)
        playerRef.current?.pauseVideo?.()
        await flushScoreChunk(true)
        setFinalSummary(buildFinalSummary(scoreHistoryRef.current))
    }

    function handlePlayerStateChange(event: { data: number }) {
        setIsPlaying(event.data === 1)
        if (event.data !== 1 && sessionActiveRef.current) {
            setSessionActive(false)
            void flushScoreChunk(true)
        }
    }

    function handleScoreResult(result: ScoreResponse) {
        frameDataRef.current = [...frameDataRef.current, ...(result.frame_data || [])].slice(-500)
        scoreHistoryRef.current = [...scoreHistoryRef.current, result]
        setScoreHistory(scoreHistoryRef.current)
        setCurrentScore(result.score)
        setBreakdown(result.breakdown)

        const comparable = result.frame_data.filter((frame) => frame.cents_off !== null)
        setCorrectHits((value) => value + comparable.filter((frame) => Math.abs(Number(frame.cents_off)) <= PITCH_TOLERANCE_CENTS).length)
        setFlaggedHits((value) => value + comparable.filter((frame) => Math.abs(Number(frame.cents_off)) > 120).length)
    }

    async function startMic(flush: (force: boolean) => Promise<void>) {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
            },
        })
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        const processor = audioContext.createScriptProcessor(2048, 1, 1)
        const pitchBuffer = new Float32Array(analyser.fftSize)

        source.connect(analyser)
        source.connect(processor)
        processor.connect(audioContext.destination)

        processor.onaudioprocess = (event) => {
            const input = event.inputBuffer.getChannelData(0)
            const rms = calculateRms(input)
            if (micLevelRef.current) {
                micLevelRef.current.style.width = `${Math.min(100, Math.round((rms / 0.08) * 100))}%`
            }

            analyser.getFloatTimeDomainData(pitchBuffer)
            const hz = autoCorrelate(pitchBuffer, audioContext.sampleRate)
            setCurrentNoteName(hz > 0 ? noteName(getNoteFromFrequency(hz)) : "--")

            if (!sessionActiveRef.current) return

            if (chunkStartTimeRef.current == null) {
                chunkStartTimeRef.current = getScoringTime(playerRef.current, latencyOffset)
            }
            pcmChunksRef.current.push(new Float32Array(input))
            pcmSamplesRef.current += input.length

            const duration = pcmSamplesRef.current / audioContext.sampleRate
            if (duration >= SCORE_CHUNK_SECONDS) void flush(false)
        }

        audioContextRef.current = audioContext
        processorRef.current = processor
        streamRef.current = stream
        setMicReady(true)
    }

    function stopMic() {
        processorRef.current?.disconnect()
        processorRef.current = null
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        void audioContextRef.current?.close()
        audioContextRef.current = null
        setMicReady(false)
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="mr-3 h-6 w-6 animate-spin text-violet-400" />
                Dang tai bai hat...
            </div>
        )
    }

    if (error && !song) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black p-6 text-center text-white">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <div className="max-w-lg text-slate-300">{error}</div>
                <Link to="/dashboard" className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500">Ve dashboard</Link>
            </div>
        )
    }

    return (
        <div className="relative flex h-screen select-none flex-col overflow-hidden bg-black font-sans text-white">
            <header className="absolute top-0 z-50 flex w-full items-center justify-between bg-gradient-to-b from-black/85 to-transparent p-4">
                <div className="flex min-w-0 items-center gap-4">
                    <Link to="/dashboard" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 transition-colors hover:bg-slate-800">
                        <X className="h-5 w-5 text-slate-300" />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-bold leading-tight">{song?.title}</h1>
                        <p className="truncate text-sm text-slate-400">{song?.artist || "Karaoke Mode"} - {formatDuration(song?.duration)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-3 rounded-full border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 md:flex" title="Microphone Level">
                        <Mic className={`h-4 w-4 ${micReady ? "text-green-400" : "text-slate-500"}`} />
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                            <div ref={micLevelRef} className="h-full w-0 bg-green-400 transition-all duration-75" />
                        </div>
                    </div>
                    <button type="button" onClick={() => setShowSettings(true)} className="rounded-full bg-slate-900/50 p-2 text-slate-400 transition-colors hover:text-white">
                        <Settings2 className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={finishSession} className="flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-500">
                        <Save className="h-4 w-4" />
                        Hoan thanh
                    </button>
                </div>
            </header>

            <main className="relative z-10 flex h-full w-full flex-1 flex-col items-center justify-center pb-44 pt-16">
                <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800/80 bg-black/50 shadow-2xl">
                    {song?.youtubeVideoId ? (
                        <YouTube
                            videoId={song.youtubeVideoId}
                            opts={{
                                width: "100%",
                                height: "100%",
                                playerVars: {
                                    autoplay: 0,
                                    controls: 1,
                                    rel: 0,
                                    modestbranding: 1,
                                },
                            }}
                            onReady={(event) => setPlayer(event.target)}
                            onStateChange={handlePlayerStateChange}
                            className="absolute inset-0 h-full w-full"
                            iframeClassName="h-full w-full"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">Khong co YouTube video id.</div>
                    )}

                    <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-black/60 p-3 backdrop-blur-md">
                            <Metric label="Score" value={Math.round(currentAverage ?? currentScore ?? 0).toLocaleString("en-US")} className="text-amber-400" />
                            <Divider />
                            <Metric icon={<CheckCircle className="h-3 w-3" />} label="Dung" value={String(correctHits)} className="text-green-400" />
                            <Divider />
                            <Metric icon={<AlertCircle className="h-3 w-3" />} label="Lech" value={String(flaggedHits)} className="text-red-400" />
                        </div>
                    </div>

                    <div className="pointer-events-none absolute right-4 top-4 rounded-2xl border border-slate-700/50 bg-black/60 px-4 py-2 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <Music className="h-4 w-4 text-violet-400" />
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dang hat / Muc tieu</div>
                                <div className="text-right text-lg font-bold tracking-widest">{currentNoteName} / {targetNoteName}</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
                        <button type="button" onClick={startSession} disabled={sessionActive || !player} className="flex h-12 items-center gap-2 rounded-full bg-green-500 px-6 font-bold text-slate-950 transition hover:bg-green-400 disabled:opacity-50">
                            <Play className="h-5 w-5 fill-current" />
                            Start
                        </button>
                        <button type="button" onClick={pauseSession} disabled={!sessionActive} className="flex h-12 items-center gap-2 rounded-full bg-slate-100 px-6 font-bold text-slate-950 transition hover:bg-white disabled:opacity-50">
                            <Pause className="h-5 w-5 fill-current" />
                            Pause
                        </button>
                    </div>
                </div>
            </main>

            <footer className="absolute bottom-0 z-50 grid h-44 w-full grid-cols-[1fr_320px] border-t border-slate-800 bg-black/92 backdrop-blur-2xl max-lg:grid-cols-1">
                <div className="relative p-2">
                    <div className="absolute left-4 top-0 -mt-3 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Live Reference Roll</div>
                    <canvas ref={canvasRef} className="block h-full w-full rounded-xl outline outline-1 outline-slate-800/50" />
                </div>
                <aside className="hidden border-l border-slate-800 p-4 lg:block">
                    <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                        <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-blue-400" /> Realtime score</span>
                        <span>{pendingScores} pending</span>
                    </div>
                    <Breakdown label="Pitch" value={breakdown.pitch} color="bg-green-500" />
                    <Breakdown label="Timing" value={breakdown.timing} color="bg-blue-500" />
                    <Breakdown label="Stability" value={breakdown.stability} color="bg-amber-400" />
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
                        <span>{melodyNotes.length} notes</span>
                        <span>{segments.length} segments</span>
                        <span>{isPlaying ? "Playing" : "Paused"}</span>
                    </div>
                </aside>
            </footer>

            {error && song && <div className="absolute left-1/2 top-20 z-[70] max-w-xl -translate-x-1/2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100 backdrop-blur">{error}</div>}

            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                            <button type="button" onClick={() => setShowSettings(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                                <Settings2 className="h-6 w-6 text-violet-400" />
                                Cai dat luyen tap
                            </h3>
                            <label className="space-y-3">
                                <span className="flex justify-between text-sm font-bold text-slate-300">
                                    <span>Latency Offset</span>
                                    <span className="font-mono text-amber-400">{latencyOffset > 0 ? "+" : ""}{latencyOffset.toFixed(2)}s</span>
                                </span>
                                <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.05"
                                    value={latencyOffset}
                                    onChange={(event) => setLatencyOffset(Number(event.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-violet-500"
                                />
                            </label>
                            <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-200">
                                <Clock className="mr-1 inline h-4 w-4" />
                                Chinh offset neu mic hoac tai nghe co do tre.
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {finalSummary && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">Tong ket phien hat</h2>
                                    <p className="mt-1 text-sm text-slate-400">{song?.title}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-950 px-6 py-3 text-center">
                                    <div className="text-xs uppercase text-slate-500">Diem</div>
                                    <div className="text-5xl font-black text-amber-400">{finalSummary.averageScore == null ? "--" : Math.round(finalSummary.averageScore)}</div>
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-4">
                                <SummaryBox label="Chunks" value={String(finalSummary.chunks)} />
                                <SummaryBox label="Pitch" value={formatMetric(finalSummary.pitch)} />
                                <SummaryBox label="Timing" value={formatMetric(finalSummary.timing)} />
                                <SummaryBox label="Stability" value={formatMetric(finalSummary.stability)} />
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setFinalSummary(null)} className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800">Dong</button>
                                <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500">Hat lai</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function Metric({ label, value, className, icon }: { label: string; value: string; className?: string; icon?: ReactNode }) {
    return (
        <div>
            <div className={`mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${className || "text-slate-400"}`}>{icon}{label}</div>
            <div className={`font-mono text-2xl font-black leading-none ${className || "text-white"}`}>{value}</div>
        </div>
    )
}

function Divider() {
    return <div className="h-8 w-px bg-slate-700/50" />
}

function Breakdown({ label, value, color }: { label: string; value: number; color: string }) {
    const rounded = Math.round(value || 0)
    return (
        <div className="mb-3">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>{label}</span>
                <span>{rounded}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, rounded))}%` }} />
            </div>
        </div>
    )
}

function SummaryBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
        </div>
    )
}

function drawPianoRoll(canvas: HTMLCanvasElement | null, notes: KaraokeNote[], frames: ScoreFrame[], time: number) {
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(rect.width * ratio))
    canvas.height = Math.max(1, Math.floor(rect.height * ratio))

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.fillStyle = "#020617"
    ctx.fillRect(0, 0, rect.width, rect.height)

    const keyWidth = 46
    const windowSeconds = 10
    const start = time - 2
    const end = start + windowSeconds
    const visible = notes.filter((note) => note.end >= start && note.start <= end)
    const minMidi = Math.min(MIN_MIDI, ...visible.map((note) => note.midi))
    const maxMidi = Math.max(MAX_MIDI, ...visible.map((note) => note.midi))
    const midiRange = Math.max(1, maxMidi - minMidi)
    const plotWidth = rect.width - keyWidth

    ctx.strokeStyle = "#1e293b"
    for (let midi = minMidi; midi <= maxMidi; midi += 2) {
        const y = rect.height - ((midi - minMidi) / midiRange) * rect.height
        ctx.beginPath()
        ctx.moveTo(keyWidth, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()
    }

    for (const note of visible) {
        const x = keyWidth + ((note.start - start) / windowSeconds) * plotWidth
        const width = Math.max(4, (note.duration / windowSeconds) * plotWidth)
        const y = rect.height - ((note.midi - minMidi) / midiRange) * rect.height
        ctx.fillStyle = "#2563eb"
        roundRect(ctx, x, Math.max(2, y - 5), width, 9, 4)
        ctx.fill()
    }

    const frameWindow = frames.filter((frame) => frame.t >= start && frame.t <= end && frame.user_hz)
    for (const frame of frameWindow) {
        const midi = hzToMidi(Number(frame.user_hz))
        const x = keyWidth + ((frame.t - start) / windowSeconds) * plotWidth
        const y = rect.height - ((midi - minMidi) / midiRange) * rect.height
        ctx.fillStyle = matchColor(frame.cents_off)
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
    }

    const playheadX = keyWidth + ((time - start) / windowSeconds) * plotWidth
    ctx.strokeStyle = "#a855f7"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, rect.height)
    ctx.stroke()

    ctx.fillStyle = "#020617"
    ctx.fillRect(0, 0, keyWidth, rect.height)
    for (let midi = minMidi; midi <= maxMidi; midi += 12) {
        const y = rect.height - ((midi - minMidi) / midiRange) * rect.height
        ctx.fillStyle = "#94a3b8"
        ctx.font = "10px monospace"
        ctx.fillText(noteName(midi), 5, y)
    }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
}

function buildMelodyLine(input: KaraokeNote[]) {
    return input
        .filter((note) => {
            const active = input.filter((item) => item.start <= note.start && note.start < item.end)
            const highest = Math.max(...active.map((item) => item.midi))
            return note.midi === highest
        })
        .sort((a, b) => a.start - b.start || b.midi - a.midi)
}

function buildSegmentsFromNotes(input: KaraokeNote[], gapSeconds: number) {
    if (input.length === 0) return []
    const sorted = [...input].sort((a, b) => a.start - b.start)
    const segments: { start: number; end: number }[] = []
    let start = sorted[0].start
    let end = sorted[0].end

    for (const note of sorted.slice(1)) {
        if (note.start - end < gapSeconds) {
            end = Math.max(end, note.end)
        } else {
            segments.push({ start, end })
            start = note.start
            end = note.end
        }
    }
    segments.push({ start, end })
    return segments
}

function melodyNoteAt(notes: KaraokeNote[], time: number) {
    const active = notes.filter((note) => note.start <= time && time < note.end)
    if (active.length === 0) return null
    return active.reduce((best, note) => (note.midi > best.midi ? note : best), active[0])
}

function findSegmentIndexAt(segments: { start: number; end: number }[], time: number) {
    return segments.findIndex((segment) => segment.start <= time && time <= segment.end)
}

function getScoringTime(player: any, latencyOffset: number) {
    if (!player?.getCurrentTime) return 0
    return Math.max(0, Number(player.getCurrentTime() || 0) + latencyOffset)
}

function mergePcmChunks(chunks: Float32Array[], totalSamples: number) {
    const output = new Float32Array(totalSamples)
    let offset = 0
    for (const chunk of chunks) {
        output.set(chunk, offset)
        offset += chunk.length
    }
    return output
}

function encodeWav(samples: Float32Array, sampleRate: number) {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)
    writeAscii(view, 0, "RIFF")
    view.setUint32(4, 36 + samples.length * 2, true)
    writeAscii(view, 8, "WAVE")
    writeAscii(view, 12, "fmt ")
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeAscii(view, 36, "data")
    view.setUint32(40, samples.length * 2, true)

    let offset = 44
    for (const sample of samples) {
        const value = Math.max(-1, Math.min(1, sample))
        view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true)
        offset += 2
    }
    return new Blob([view], { type: "audio/wav" })
}

function writeAscii(view: DataView, offset: number, text: string) {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i))
}

function buildFinalSummary(history: ScoreResponse[]): FinalSummary {
    return {
        averageScore: average(history.map((item) => item.score)),
        pitch: average(history.map((item) => item.breakdown.pitch)),
        timing: average(history.map((item) => item.breakdown.timing)),
        stability: average(history.map((item) => item.breakdown.stability)),
        chunks: history.length,
    }
}

function average(values: number[]) {
    const valid = values.filter((value) => Number.isFinite(value))
    if (valid.length === 0) return null
    return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

function formatMetric(value: number | null) {
    return value == null ? "--" : String(Math.round(value))
}

function calculateRms(samples: Float32Array) {
    let sum = 0
    for (const sample of samples) sum += sample * sample
    return Math.sqrt(sum / samples.length)
}

function autoCorrelate(buf: Float32Array, sampleRate: number) {
    let size = buf.length
    let rms = 0
    for (let i = 0; i < size; i += 1) rms += buf[i] * buf[i]
    rms = Math.sqrt(rms / size)
    if (rms < 0.01) return -1

    let r1 = 0
    let r2 = size - 1
    const threshold = 0.2
    for (let i = 0; i < size / 2; i += 1) {
        if (Math.abs(buf[i]) < threshold) {
            r1 = i
            break
        }
    }
    for (let i = 1; i < size / 2; i += 1) {
        if (Math.abs(buf[size - i]) < threshold) {
            r2 = size - i
            break
        }
    }

    const sliced = buf.slice(r1, r2)
    size = sliced.length
    const correlations = new Array(size).fill(0)
    for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size - i; j += 1) correlations[i] += sliced[j] * sliced[j + i]
    }

    let d = 0
    while (correlations[d] > correlations[d + 1]) d += 1
    let maxValue = -1
    let maxPosition = -1
    for (let i = d; i < size; i += 1) {
        if (correlations[i] > maxValue) {
            maxValue = correlations[i]
            maxPosition = i
        }
    }

    let t0 = maxPosition
    const x1 = correlations[t0 - 1]
    const x2 = correlations[t0]
    const x3 = correlations[t0 + 1]
    const a = (x1 + x3 - 2 * x2) / 2
    const b = (x3 - x1) / 2
    if (a) t0 -= b / (2 * a)
    return sampleRate / t0
}

function getNoteFromFrequency(frequency: number) {
    return Math.round(12 * (Math.log(frequency / 440) / Math.log(2))) + 69
}

function noteName(midi: number | null) {
    if (midi == null || !Number.isFinite(midi)) return "--"
    const rounded = Math.round(midi)
    return `${NOTES[((rounded % 12) + 12) % 12]}${Math.floor(rounded / 12) - 1}`
}

function hzToMidi(hz: number) {
    return 69 + 12 * Math.log2(hz / 440)
}

function matchColor(cents: number | null) {
    if (cents == null) return "#a855f7"
    const abs = Math.abs(cents)
    if (abs <= PITCH_TOLERANCE_CENTS) return "#22c55e"
    if (abs <= 120) return "#eab308"
    return "#ef4444"
}
