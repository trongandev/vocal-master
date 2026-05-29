import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic2, ArrowLeft, Trophy, PlayCircle, BarChart2, Loader2, SearchX, Star, Clock, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { db } from '../lib/firebase';
import { doc, getDoc, query, collection, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface FirebaseSong {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  genre?: string;
  difficulty?: string;
  viewCount?: number;
  playCount?: number;
  totalPracticeTime?: number;
}

function decodeNotes(notesBase64: string) {
    if (!notesBase64) return [];
    try {
        const binaryString = atob(notesBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const floatArray = new Float32Array(bytes.buffer);
        const notes = [];
        for (let i = 0; i < floatArray.length; i += 3) {
            notes.push({ start: floatArray[i], duration: floatArray[i+1], pitch: floatArray[i+2] });
        }
        return notes;
    } catch(e) { return []; }
}

export default function SongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<FirebaseSong | null>(null);
  const [targetNotes, setTargetNotes] = useState<any[]>([]);
  const [topScores, setTopScores] = useState<any[]>([]);
  const [topPracticers, setTopPracticers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongAndStats = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'songs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSong({ id: docSnap.id, ...docSnap.data() } as FirebaseSong);
        } else {
          setSong(null);
          return;
        }

        // Fetch chunk_0 for visualization
        const chunkSnap = await getDoc(doc(db, `songs/${id}/noteChunks/chunk_0`));
        if (chunkSnap.exists()) {
            const data = chunkSnap.data();
            setTargetNotes(decodeNotes(data.data));
        }

        // Fetch top scores
        const qScores = query(
           collection(db, 'userSongStats'),
           where('songId', '==', id),
           orderBy('maxScore', 'desc'),
           limit(3)
        );
        const snScores = await getDocs(qScores);
        setTopScores(snScores.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch top practice times
        const qHardest = query(
           collection(db, 'userSongStats'),
           where('songId', '==', id),
           orderBy('totalPracticeTime', 'desc'),
           limit(3)
        );
        const snHardest = await getDocs(qHardest);
        setTopPracticers(snHardest.docs.map(d => ({ id: d.id, ...d.data() })));
        
      } catch (error) {
        console.error("Lỗi khi tải thông tin bài hát:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongAndStats();
  }, [id]);

  if (isLoading) {
    return (
      <div className="pb-16 pt-32 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-4" />
        <p>Đang tải thông tin bài hát...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="pb-16 pt-32 flex flex-col items-center justify-center text-slate-500">
        <SearchX className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-xl font-medium text-white mb-2">Không tìm thấy bài hát</p>
        <p className="mb-6">Bài hát này có thể đã bị xóa hoặc không tồn tại.</p>
        <Button onClick={() => navigate(-1)} className="bg-violet-600 hover:bg-violet-500 text-white">Quay lại</Button>
      </div>
    );
  }

  const genre = song.genre || 'Khác';
  const difficulty = song.difficulty || 'Medium';
  const plays = song.playCount || 0;
  const views = song.viewCount || 0;
  const totalTime = song.totalPracticeTime || 0;
  const thumbnail = song.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80';

  // Calculate binned notes chart
  const BINS = 30;
  const maxTime = targetNotes.length > 0 ? targetNotes[targetNotes.length - 1].start + targetNotes[targetNotes.length - 1].duration : 1;
  const binWidth = maxTime / BINS;
  const binnedNotes = Array(BINS).fill(0).map(() => [] as number[]);
  
  targetNotes.forEach(note => {
     if (note.pitch > 0) {
        const binIdx = Math.min(BINS - 1, Math.floor(note.start / Math.max(0.1, binWidth)));
        binnedNotes[binIdx].push(note.pitch);
     }
  });

  const columnNotes = binnedNotes.map(bin => {
     if (bin.length === 0) return 0;
     const counts: Record<number, number> = {};
     bin.forEach(p => {
        const rounded = Math.round(p);
        counts[rounded] = (counts[rounded] || 0) + 1;
     });
     let maxCount = 0;
     let mostFrequentPitch = 0;
     Object.entries(counts).forEach(([pitchStr, count]) => {
         if (count > maxCount) {
             maxCount = count;
             mostFrequentPitch = Number(pitchStr);
         }
     });
     // We'll use the most frequent pitch as the representative for this time chunk
     return mostFrequentPitch;
  });

  let maxPitch = 0, minPitch = 1000;
  columnNotes.forEach(pitch => {
      if (pitch > maxPitch) maxPitch = pitch;
      if (pitch > 0 && pitch < minPitch) minPitch = pitch;
  });
  if (minPitch === 1000) minPitch = 0;
  
  const pitchRange = Math.max(1, maxPitch - minPitch);

  return (
    <div className="pb-16 pt-4 max-w-7xl mx-auto px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Cover & Global Data */}
        <div className="col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <div className="aspect-square relative">
              <img src={thumbnail} alt={song.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-6">
                <div className="flex gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-violet-600 text-white backdrop-blur-md">
                    {genre}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200 backdrop-blur-md border border-slate-700">
                    Độ khó: {difficulty}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-1 leading-tight">{song.title}</h1>
                <p className="text-lg text-slate-300">{song.artist}</p>
              </div>
            </div>
          </motion.div>

          <Link to={`/play/${song.id}`} className="block w-full text-decoration-none border-0 pt-2 pb-2">
            <Button className="w-full h-14 text-lg font-bold bg-white text-slate-900 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Mic2 className="mr-2 w-5 h-5" />
              Bắt đầu hát
            </Button>
          </Link>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <PlayCircle className="w-5 h-5 text-slate-400 mb-2" />
              <div className="text-xl font-bold text-white mb-1">{plays.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Lượt hát</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Eye className="w-5 h-5 text-slate-400 mb-2" />
              <div className="text-xl font-bold text-white mb-1">{views.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Lượt xem</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Clock className="w-5 h-5 text-violet-400 mb-2" />
              <div className="text-xl font-bold text-violet-400 mb-1">
                {totalTime > 3600 ? `${(totalTime / 3600).toFixed(1)}h` : `${Math.floor(totalTime / 60)}m`}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Tổng giờ tập</div>
            </div>
          </div>
        </div>

        {/* Right Col: Notes Chart & Leaderboard */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Notes Visualization */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart2 className="text-violet-400" />
                Bản đồ nốt nhạc
              </h3>
              <span className="text-sm text-slate-500">Trích đoạn đầu</span>
            </div>
            
            <div className="h-48 relative border-b border-slate-700 bg-slate-950/50 rounded-lg overflow-hidden flex items-end px-2 pb-2 gap-1">
              {columnNotes.some(p => p > 0) ? columnNotes.map((pitch, i) => {
                 if (pitch === 0) {
                     return <div key={i} className="flex-1 h-full" />;
                 }
                 const y = ((pitch - minPitch) / pitchRange) * 100;
                 return (
                    <div 
                      key={i} 
                      className="flex-1 bg-violet-500 rounded-sm shadow-[0_0_10px_rgba(139,92,246,0.6)] relative group"
                      style={{ 
                         height: `${Math.max(10, y)}%`
                      }}
                    >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {Math.round(pitch)} Hz
                       </div>
                    </div>
                 );
              }) : (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                    Không có dữ liệu nốt nhạc
                 </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Top Scores */}
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                   <Star className="text-amber-400" />
                   Top Điểm Số
                 </h3>
                 <div className="space-y-4">
                   {topScores.length === 0 && <div className="text-slate-500 text-sm">Chưa có ai ghi điểm</div>}
                   {topScores.map((user, idx) => (
                     <div key={user.id} className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl">
                       <div className={`w-6 font-bold text-center ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-amber-600'}`}>
                         #{idx + 1}
                       </div>
                       <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`} alt="avatar" className="w-10 h-10 rounded-full bg-slate-800" />
                       <div className="flex-1 min-w-0">
                         <div className="font-semibold text-white truncate">{user.displayName}</div>
                       </div>
                       <div className="font-bold text-amber-400 text-lg">
                         {(user.maxScore || 0).toLocaleString()} <span className="text-xs text-slate-500 font-normal">điểm</span>
                       </div>
                     </div>
                   ))}
                 </div>
             </div>

             {/* Top Practice */}
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                   <Trophy className="text-yellow-400" />
                   Top Luyện Tập
                 </h3>
                 <div className="space-y-4">
                   {topPracticers.length === 0 && <div className="text-slate-500 text-sm">Chưa có ai luyện tập</div>}
                   {topPracticers.map((user, idx) => (
                     <div key={user.id} className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl">
                       <div className={`w-6 font-bold text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : 'text-amber-600'}`}>
                         #{idx + 1}
                       </div>
                       <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`} alt="avatar" className="w-10 h-10 rounded-full bg-slate-800" />
                       <div className="flex-1 min-w-0">
                         <div className="font-semibold text-white truncate">{user.displayName}</div>
                       </div>
                       <div className="font-bold text-violet-400 text-sm flex items-center gap-1">
                         <Clock className="w-3.5 h-3.5" />
                         {(user.totalPracticeTime || 0) > 3600 ? `${Math.floor((user.totalPracticeTime || 0) / 3600)}h` : `${Math.floor((user.totalPracticeTime || 0) / 60)}m`}
                       </div>
                     </div>
                   ))}
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
