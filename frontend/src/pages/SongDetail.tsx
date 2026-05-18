import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mic2, ArrowLeft, Trophy, PlayCircle, BarChart2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MOCK_SONGS, MOCK_LEADERBOARD } from '../data/mockData';

export default function SongDetail() {
  const { id } = useParams();
  const song = MOCK_SONGS.find(s => s.id === id) || MOCK_SONGS[0];

  return (
    <div className="pb-16 pt-4">
      <Link to="/community" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại thư viện
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Cover & Global Data */}
        <div className="col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <div className="aspect-square relative">
              <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-6">
                <div className="flex gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-violet-600 text-white backdrop-blur-md">
                    {song.genre}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200 backdrop-blur-md border border-slate-700">
                    Độ khó: {song.difficulty}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-1 leading-tight">{song.title}</h1>
                <p className="text-lg text-slate-300">{song.artist}</p>
              </div>
            </div>
          </motion.div>

          <Button className="w-full h-14 text-lg font-bold bg-white text-slate-900 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <Mic2 className="mr-2 w-5 h-5" />
            Bắt đầu hát (Cần Đăng Nhập)
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <PlayCircle className="w-6 h-6 text-slate-400 mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{song.plays.toLocaleString()}</div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Lượt hát</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-yellow-400 mb-1">{song.highestScore}</div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Kỷ lục Server</div>
            </div>
          </div>
        </div>

        {/* Right Col: Mock Chart & Leaderboard */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Mock Visualization */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart2 className="text-violet-400" />
                Bản đồ nốt nhạc
              </h3>
              <span className="text-sm text-slate-500">Trích đoạn điệp khúc</span>
            </div>
            
            <div className="h-40 relative border-l border-b border-slate-800 px-2 pt-2">
              {/* Very basic mock bar chart for notes */}
              <div className="absolute bottom-0 left-4 w-8 bg-blue-500/40 rounded-t-sm h-[20%]" />
              <div className="absolute bottom-0 left-16 w-12 bg-blue-500/60 rounded-t-sm h-[40%]" />
              <div className="absolute bottom-0 left-32 w-8 bg-violet-500/80 rounded-t-sm h-[70%]" />
              <div className="absolute bottom-0 left-44 w-20 bg-fuchsia-500 rounded-t-sm h-[90%] shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
              <div className="absolute bottom-0 left-72 w-10 bg-violet-500/70 rounded-t-sm h-[60%]" />
              <div className="absolute bottom-0 left-80 w-16 bg-blue-500/50 rounded-t-sm h-[30%]" />
              
              <div className="absolute top-4 left-44 text-xs font-bold text-fuchsia-400">Đỉnh (C5)</div>
            </div>
          </div>

          {/* Top Singers for this song */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
             <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Trophy className="text-yellow-400" />
                Top Cao Thủ Bài Này
              </h3>
              <div className="space-y-4">
                {MOCK_LEADERBOARD.slice(0, 3).map((user, idx) => (
                  <div key={user.id} className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl">
                    <div className={`w-8 font-bold text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : 'text-amber-600'}`}>
                      #{idx + 1}
                    </div>
                    <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-slate-800" />
                    <div className="flex-1">
                      <div className="font-semibold text-white">{user.name}</div>
                    </div>
                    <div className="font-bold text-violet-400 text-lg">
                      {Math.floor(song.highestScore - idx * 1.5)} <span className="text-xs text-slate-500 font-normal">điểm</span>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
