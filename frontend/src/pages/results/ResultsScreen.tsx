import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Share2, RotateCcw, BarChart2, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function ResultsScreen() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-4">
          <ChevronLeft className="w-5 h-5" /> Trở về trang quản lý
        </Link>
        
        <div className="text-center space-y-4 mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
            className="w-40 h-40 mx-auto bg-gradient-to-br from-violet-600 to-blue-600 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.3)] border-4 border-slate-900 outline outline-4 outline-violet-500/30"
          >
             <div className="text-5xl font-black text-white">92</div>
             <div className="text-sm font-bold uppercase tracking-widest text-violet-200">Điểm số</div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mt-6">Xuất sắc, Trọng An!</h1>
          <p className="text-slate-400">Bạn vừa hoàn thành bài "Chắc Ai Đó Sẽ Về" (Sơn Tùng M-TP)</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button className="bg-white text-slate-950 hover:bg-slate-200 px-8 rounded-full h-12 text-base font-semibold">
              <RotateCcw className="w-5 h-5 mr-2" /> Hát lại bài này
            </Button>
            <Button variant="outline" className="border-slate-700 bg-slate-900 hover:bg-slate-800 px-8 rounded-full h-12 text-base text-slate-300">
              <Share2 className="w-5 h-5 mr-2" /> Chia sẻ kết quả
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detailed breakdown */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
               <BarChart2 className="text-blue-400" />
               <h3 className="text-xl font-bold">Phân tích chi tiết</h3>
             </div>
             
             <div className="space-y-4">
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Cao độ (Pitch Accuracy)</span>
                   <span className="font-bold text-green-400">95%</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[95%]" /></div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Nhịp điệu (Rhythm Sync)</span>
                   <span className="font-bold text-yellow-400">88%</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-[88%]" /></div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Kỹ thuật ngân rung (Vibrato)</span>
                   <span className="font-bold text-blue-400">80%</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[80%]" /></div>
               </div>
             </div>
          </section>

          {/* Tips for improvement */}
          <section className="bg-gradient-to-br from-violet-900/40 to-slate-900 border border-violet-500/20 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
               <Star className="text-yellow-400" />
               <h3 className="text-xl font-bold">Nhận xét & Gợi ý</h3>
             </div>
             
             <div className="space-y-4">
               <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                 <h4 className="font-semibold text-red-300 mb-1">Đoạn cần luyện tập (00:45)</h4>
                 <p className="text-sm text-slate-400">Câu "Dường như nắng đã làm má em thêm hồng" bạn bị thấp hơn 1 nửa cung (flat). Khuyến nghị dùng chế độ Luyện Từng Đoạn.</p>
               </div>
               <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                 <h4 className="font-semibold text-green-300 mb-1">Điểm sáng của bạn</h4>
                 <p className="text-sm text-slate-400">Bạn xử lý luyến láy rất mềm mại ở phần điệp khúc. Thể điệu Pop/Ballad cực kỳ phù hợp với chất giọng Baritone của bạn.</p>
               </div>
             </div>
          </section>
        </div>

      </div>
    </div>
  );
}
