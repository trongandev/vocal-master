import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Play, Star, Music } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MOCK_SONGS } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function Community() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const genres = ['All', 'Pop', 'Ballad', 'Bolero', 'Indie'];

  const filteredSongs = MOCK_SONGS.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = activeFilter === 'All' || song.genre.includes(activeFilter);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="flex flex-col gap-8 pb-16 pt-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Thư viện bài hát</h1>
          <p className="text-slate-400">Khám phá các bài hát từ cộng đồng, chấm điểm và vinh danh.</p>
        </div>
        
        <div className="w-full md:w-auto relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Tìm tên bài, ca sĩ..." 
            className="w-full md:w-[300px] h-12 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Thể loại:</span>
        </div>
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setActiveFilter(genre)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === genre 
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredSongs.length > 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredSongs.map((song, idx) => (
           <motion.div
             key={song.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: idx * 0.05 }}
           >
             <Link to={`/song/${song.id}`}>
               <div className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-violet-500/50 transition-colors">
                 {/* Image */}
                 <div className="aspect-[4/3] w-full overflow-hidden relative">
                   <img 
                     src={song.coverUrl} 
                     alt={song.title} 
                     className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
                   
                   {/* Play overlay hover */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                     <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/50 transform scale-90 group-hover:scale-100 transition-transform">
                       <Play className="w-6 h-6 ml-1" />
                     </div>
                   </div>
 
                   {/* Badges */}
                   <div className="absolute top-3 left-3 flex gap-2">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                       song.difficulty === 'Easy' ? 'bg-green-500/80 text-white' : 
                       song.difficulty === 'Medium' ? 'bg-yellow-500/80 text-white' : 
                       'bg-red-500/80 text-white'
                     }`}>
                       {song.difficulty}
                     </span>
                     <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-900/80 text-slate-200 backdrop-blur-md">
                       {song.genre}
                     </span>
                   </div>
                 </div>
 
                 {/* Info */}
                 <div className="p-5">
                   <h3 className="text-xl font-bold text-white mb-1 group-hover:text-violet-300 transition-colors line-clamp-1">{song.title}</h3>
                   <p className="text-slate-400 text-sm mb-4">{song.artist}</p>
                   
                   <div className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-1.5 text-yellow-400">
                       <Star className="w-4 h-4 fill-yellow-400" />
                       <span className="font-bold">{song.highestScore}</span>
                       <span className="text-slate-500 ml-1">Kỷ lục</span>
                     </div>
                     <div className="text-slate-500">
                       {song.plays.toLocaleString()} lượt hát
                     </div>
                   </div>
                 </div>
               </div>
             </Link>
           </motion.div>
         ))}
       </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
            <Music className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-slate-300 mb-2">Không tìm thấy bài hát nào</h3>
          <p className="text-slate-500">Hãy thử từ khoá khác hoặc thể loại khác xem sao.</p>
        </div>
      )}
    </div>
  );
}
