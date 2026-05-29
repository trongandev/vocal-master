import { useParams, Link } from 'react-router-dom';
import { Play, Trophy, Music, Disc } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { MOCK_SONGS } from '../../data/mockData';

export default function ProfileScreen() {
  const { userId } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50 relative">
      {/* Cover Header */}
      <div className="h-64 md:h-80 w-full bg-gradient-to-r from-violet-900 to-slate-900 relative">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516280440503-62f80a0f5a70?w=1200&q=80')] opacity-30 mix-blend-overlay object-cover" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-20">
        {/* Profile Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
           <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || 'An'}`} 
              alt="Avatar" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-900 bg-slate-800 shadow-xl"
           />
           <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Trọng An</h1>
              <p className="text-slate-400 mb-4 md:mb-0">Hạng: #12 Global • Thành viên từ May 2026</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none text-center bg-slate-950 rounded-2xl p-4 border border-slate-800">
                 <div className="text-2xl font-bold text-white">45</div>
                 <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bản thu</div>
              </div>
              <div className="flex-1 md:flex-none text-center bg-slate-950 rounded-2xl p-4 border border-slate-800">
                 <div className="text-2xl font-bold text-yellow-400">920k</div>
                 <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Điểm tổng</div>
              </div>
           </div>
        </div>

        <div className="mt-12 space-y-6 pb-20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
             <h2 className="text-2xl font-bold flex items-center gap-2"><Disc className="text-violet-400" /> Bài hát công khai</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_SONGS.slice(0, 3).map((song) => (
              <div key={song.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col group">
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden mb-4 relative">
                   <img src={song.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                     <Link to={`/song/${song.id}`}>
                        <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white"><Play className="ml-1 w-5 h-5"/></div>
                     </Link>
                   </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{song.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{song.artist}</p>
                <div className="mt-auto flex justify-between items-center text-xs font-semibold text-slate-500">
                   <span className="flex items-center gap-1 text-yellow-400"><Trophy className="w-3 h-3" /> Điểm cao nhất: {song.highestScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
