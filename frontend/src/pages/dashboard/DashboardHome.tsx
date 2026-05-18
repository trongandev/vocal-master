import { motion } from 'motion/react';
import { Plus, Edit2, Play, Lock, Globe, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  const mySongs = [
    { id: '1', title: 'Chắc Ai Đó Sẽ Về', artist: 'Sơn Tùng M-TP', status: 'Public', isVip: false, score: 98, date: '12/05/2026' },
    { id: 'custom-1', title: 'Bản Nhạc Của Tôi', artist: 'Trọng An', status: 'Private', isVip: true, score: null, date: '10/05/2026' },
    { id: '3', title: 'Vùng Ký Ức', artist: 'Chillies', status: 'Public', isVip: false, score: 92, date: '08/05/2026' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bài hát của tôi</h1>
          <p className="text-slate-400">Quản lý kho nhạc cá nhân và các bài hát tự tải lên.</p>
        </div>
        <Link to="/dashboard/upload">
          <Button className="bg-violet-600 hover:bg-violet-500 text-white">
            <Plus className="w-5 h-5 mr-1" />
            Tải lên bài mới
          </Button>
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/50 text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Tên bài hát / Ca sĩ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Kỷ lục cá nhân</th>
                <th className="px-6 py-4">Ngày thêm</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {mySongs.map((song) => (
                <tr key={song.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200">{song.title}</div>
                    <div className="text-xs text-slate-500">{song.artist}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      song.status === 'Public' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {song.status === 'Public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {song.status}
                      {song.status === 'Private' && <span className="ml-1 text-[10px] bg-amber-500 text-white px-1 rounded-sm uppercase">VIP</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {song.score ? `${song.score} pt` : '--'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {song.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/play/${song.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-green-400 hover:bg-green-400/10 transition-colors tooltip-target" title="Hát ngay">
                          <Play className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/dashboard/song/${song.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title="Chỉnh sửa">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Xoá">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mySongs.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Bạn chưa có bài hát nào. Tải sheet nhạc lên để bắt đầu!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
