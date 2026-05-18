import { useState } from 'react';
import { UploadCloud, FileMusic, ArrowRight, Save, Music, Play } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

export default function DashboardUpload() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link to="/dashboard" className="text-slate-400 hover:text-white">Bài hát của tôi</Link>
        <span className="text-slate-600">/</span>
        <span className="text-violet-400">Tải lên Sheet nhạc mới</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Tải lên Sheet nhạc</h2>
              <p className="text-slate-400 text-sm">Hỗ trợ PDF, MusicXML hoặc Ảnh chụp rõ nét. Hệ thống AI sẽ tự nhận diện hợp âm, cao độ và nốt nhạc.</p>
            </div>

            <div className="border-2 border-dashed border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-800/30 hover:border-violet-500 transition-colors cursor-pointer" onClick={() => setStep(2)}>
              <div className="w-16 h-16 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Kéo thả file vào đây</h3>
              <p className="text-slate-400 text-sm mb-6">hoặc click để chọn file từ thiết bị</p>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                Chọn File
              </Button>
            </div>
            
            {/* Example hint */}
            <div className="bg-slate-950 rounded-xl p-4 flex gap-4 text-sm border border-slate-800">
              <FileMusic className="w-6 h-6 text-slate-500 shrink-0" />
              <div>
                <p className="text-slate-300 font-medium mb-1">Mẹo để AI nhận diện tốt nhất:</p>
                <ul className="text-slate-500 list-disc list-inside space-y-1">
                  <li>Sử dụng file PDF xuất từ phần mềm chép nhạc (Sibelius, MuseScore) cho kết quả chuẩn 100%.</li>
                  <li>Nếu dùng ảnh chụp, hãy đảm bảo ảnh sáng, không bị mờ và không bị nghiêng.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Kết quả phân tích AI</h2>
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-slate-400 text-sm">Xử lý thành công (100% độ chính xác dự đoán)</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className="border-slate-700 text-slate-400 bg-transparent hover:bg-slate-800">
                Tải file khác
              </Button>
            </div>
            
            {/* MIDI Preview Mockup */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-300">Bản xem trước MIDI & Nốt nhạc</label>
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 relative overflow-hidden h-48 flex items-center justify-center group cursor-pointer">
                {/* Visualizer bars mock */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 flex items-end gap-1 px-4 opacity-30">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="flex-1 bg-violet-600 rounded-t-sm" style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
                  ))}
                </div>
                {/* Play button overlay */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-violet-600/80 text-white flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-violet-600 transition-all shadow-xl shadow-violet-500/20">
                  <Play className="w-8 h-8 ml-1" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Tên bài hát</label>
                <input type="text" defaultValue="Không Tên (Đã nhận dạng)" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Ca sĩ / Tác giả</label>
                <input type="text" placeholder="Nhập tên" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Tông giọng (Key)</label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none appearance-none">
                  <option value="C">C Major (Nhận diện)</option>
                  <option value="Am">A Minor</option>
                  <option value="G">G Major</option>
                  <option value="F">F Major</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Nhịp (Tempo)</label>
                <input type="number" defaultValue="120" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none" />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button variant="ghost" className="text-slate-400 hover:text-white">Huỷ bỏ</Button>
              <Link to="/dashboard">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu vào thư viện
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
