import { useEffect, useState } from "react"
import { Edit2, Globe, Loader2, Lock, Play, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../contexts/AuthContext"
import { deleteSong, listUserSongs, type SavedSong } from "../../lib/songStore"
import { formatDuration } from "../../lib/karaokeApi"

export default function DashboardHome() {
    const { user } = useAuth()
    const [songs, setSongs] = useState<SavedSong[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!user) return

        let active = true
        setLoading(true)
        listUserSongs(user.uid)
            .then((items) => {
                if (active) setSongs(items)
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
    }, [user])

    async function handleDelete(songId: string) {
        setDeletingId(songId)
        setError("")
        try {
            if (!user) return
            await deleteSong(songId, user.uid)
            setSongs((current) => current.filter((song) => song.id !== songId))
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-white">Bai hat cua toi</h1>
                    <p className="text-slate-400">Quan ly kho nhac ca nhan va cac bai hat da tach MIDI.</p>
                </div>
                <Link to="/dashboard/upload">
                    <Button className="bg-violet-600 text-white hover:bg-violet-500">
                        <Plus className="mr-1 h-5 w-5" />
                        Them bai moi
                    </Button>
                </Link>
            </div>

            {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap text-left text-sm">
                        <thead className="bg-slate-800/50 font-medium text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Ten bai hat / Ca si</th>
                                <th className="px-6 py-4">Trang thai</th>
                                <th className="px-6 py-4">Du lieu MIDI</th>
                                <th className="px-6 py-4">Ngay them</th>
                                <th className="px-6 py-4 text-right">Thao tac</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-violet-400" />
                                        Dang tai thu vien...
                                    </td>
                                </tr>
                            ) : (
                                songs.map((song) => (
                                    <tr key={song.id} className="transition-colors hover:bg-slate-800/20">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-16 overflow-hidden rounded-lg bg-slate-800">
                                                    {song.thumbnail ? <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" /> : null}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="max-w-sm truncate font-semibold text-slate-200">{song.title}</div>
                                                    <div className="text-xs text-slate-500">{song.artist}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                                                <Lock className="h-3.5 w-3.5" />
                                                Private
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            <div className="flex flex-col gap-1">
                                                <span>{Number(song.metadata.total_notes || 0).toLocaleString("en-US")} notes</span>
                                                <span className="text-xs text-slate-600">{formatDuration(song.duration)} - {song.noteChunkCount} chunks</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{formatDate(song.createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/play/${song.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 transition-colors hover:bg-green-400/10 hover:text-green-400" title="Hat ngay">
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link to={`/dashboard/song/${song.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 transition-colors hover:bg-blue-400/10 hover:text-blue-400" title="Chinh sua">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={deletingId === song.id}
                                                    onClick={() => void handleDelete(song.id)}
                                                    className="h-8 w-8 text-slate-400 transition-colors hover:bg-red-400/10 hover:text-red-400"
                                                    title="Xoa"
                                                >
                                                    {deletingId === song.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {!loading && songs.length === 0 && (
                        <div className="p-10 text-center text-slate-500">
                            <Globe className="mx-auto mb-4 h-10 w-10 text-slate-700" />
                            Ban chua co bai hat nao. Hay them bai moi de bat dau luyen tap.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function formatDate(timestamp: SavedSong["createdAt"]) {
    if (!timestamp) return "--"
    return timestamp.toDate().toLocaleDateString("vi-VN")
}
