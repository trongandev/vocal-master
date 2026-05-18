import { Search, Download, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { MOCK_SONGS } from '../../data/mockData';

export default function DashboardCommunity() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Cộng đồng</h1>
        <p className="text-slate-400">Khám phá và lưu những bài hát từ người dùng khác vào thư viện của bạn.</p>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          placeholder="Tìm bài hát để luyện tập..." 
          className="w-full h-12 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_SONGS.map((song) => (
          <div key={song.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-violet-500/30 transition-colors flex gap-4">
            <img src={song.coverUrl} alt="cover" className="w-24 h-24 rounded-xl object-cover" />
            <div className="flex-1 flex flex-col pt-1">
              <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-violet-300 transition-colors">
                {song.title}
              </h3>
              <p className="text-slate-400 text-sm mb-2">{song.artist}</p>
              
              <div className="flex items-center gap-2 mb-3 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {song.highestScore} pt</span>
                <span>•</span>
                <span>Tông: {song.id === '1' ? 'C' : 'Am'}</span>
              </div>
              
              <div className="mt-auto">
                <Button size="sm" variant="outline" className="w-full bg-slate-950 border-slate-700 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all text-slate-300">
                   <Download className="w-4 h-4 mr-2" />
                   Lưu & Hát
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
