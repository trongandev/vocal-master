import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { MOCK_LEADERBOARD, MOCK_SONGS } from '../data/mockData';

export default function Leaderboard() {
  const [selectedSong, setSelectedSong] = useState('global');

  return (
    <div className="flex flex-col gap-8 pb-16 pt-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 text-yellow-500 mb-2">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400">
          Bảng Vàng
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Những giọng ca xuất sắc nhất trên hệ thống VocalMaster.
        </p>
      </div>

      {/* Filter */}
      <div className="flex justify-center mb-4">
        <select 
          className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 min-w-[250px]"
          value={selectedSong}
          onChange={(e) => setSelectedSong(e.target.value)}
        >
          <option value="global">Xếp hạng Tổng cộng đồng</option>
          <optgroup label="Xếp hạng theo bài hát">
            {MOCK_SONGS.map(song => (
              <option key={song.id} value={song.id}>{song.title}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Podium (Top 3) */}
      <div className="flex items-end justify-center gap-2 md:gap-6 pt-10 pb-8 px-4">
        {/* Rank 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center w-1/3 max-w-[140px]"
        >
          <div className="relative mb-3">
            <img src={MOCK_LEADERBOARD[1].avatar} alt="" className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-300 bg-slate-800" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs shadow-lg">2</div>
          </div>
          <div className="text-center truncate w-full font-semibold text-slate-200">{MOCK_LEADERBOARD[1].name}</div>
          <div className="text-slate-400 text-sm">{MOCK_LEADERBOARD[1].score}</div>
          <div className="w-full h-24 md:h-32 bg-slate-800/80 rounded-t-xl mt-4 border-t border-slate-700" />
        </motion.div>

        {/* Rank 1 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center w-1/3 max-w-[160px] z-10"
        >
          <Crown className="w-8 h-8 text-yellow-400 mb-1 drop-shadow-md" />
          <div className="relative mb-4">
            <img src={MOCK_LEADERBOARD[0].avatar} alt="" className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 bg-slate-800 shadow-[0_0_20px_rgba(250,204,21,0.3)]" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-950 font-bold text-sm shadow-lg">1</div>
          </div>
          <div className="text-center truncate w-full font-bold text-yellow-400 text-lg">{MOCK_LEADERBOARD[0].name}</div>
          <div className="text-slate-300 font-medium">{MOCK_LEADERBOARD[0].score}</div>
          <div className="w-full h-32 md:h-44 bg-gradient-to-t from-yellow-900/40 to-yellow-600/20 rounded-t-xl mt-4 border-t border-yellow-500/50 backdrop-blur-sm" />
        </motion.div>

        {/* Rank 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center w-1/3 max-w-[140px]"
        >
          <div className="relative mb-3">
            <img src={MOCK_LEADERBOARD[2].avatar} alt="" className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-700 bg-slate-800" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center text-amber-100 font-bold text-xs shadow-lg">3</div>
          </div>
          <div className="text-center truncate w-full font-semibold text-slate-200">{MOCK_LEADERBOARD[2].name}</div>
          <div className="text-slate-400 text-sm">{MOCK_LEADERBOARD[2].score}</div>
          <div className="w-full h-20 md:h-24 bg-slate-800/80 rounded-t-xl mt-4 border-t border-slate-700" />
        </motion.div>
      </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mt-4">
        <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-16 text-center">Hạng</div>
          <div className="flex-1">Giọng ca</div>
          <div className="w-32 text-right">Điểm số</div>
        </div>
        <div className="divide-y divide-slate-800/50">
          {MOCK_LEADERBOARD.slice(3).map((user, idx) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + (idx * 0.05) }}
              className="flex items-center px-6 py-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-16 text-center font-bold text-slate-500">#{user.rank}</div>
              <div className="flex-1 flex items-center gap-4">
                <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-slate-800" />
                <span className="font-semibold text-slate-200">{user.name}</span>
              </div>
              <div className="w-32 text-right font-mono text-slate-300">{user.score} pt</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
