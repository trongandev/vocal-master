import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Music4, Clock, Network, ScrollText, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function DashboardTheory() {
  const lessons = [
    {
      id: "notes",
      title: "1. Nốt Nhạc & Solfege",
      desc: "Làm quen với Đồ Rê Mi và ký hiệu chữ cái C D E.",
      icon: Music4,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      id: "rhythm",
      title: "2. Nhịp điệu & Tempo",
      desc: "Hiểu về nhịp 2/4, 3/4, 4/4 và tốc độ bài hát.",
      icon: Clock,
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      id: "keys",
      title: "3. Tông bài hát (Chìa khoá)",
      desc: "Đô trưởng, Rê thứ, Mi giáng... là gì? Cách chọn tông.",
      icon: Network,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      id: "sheet",
      title: "4. Đọc Sheet Nhạc",
      desc: "Khuông nhạc, dòng kẻ, nén, móc đơn, móc kép.",
      icon: ScrollText,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Nhạc Lý Cơ Bản</h1>
        <p className="text-slate-400 text-lg">Nắm vững nền tảng âm nhạc trước khi bắt tay vào luyện giọng. Giáo trình được thiết kế dễ hiểu cho cả người mới bắt đầu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map((lesson, idx) => (
          <Link key={lesson.id} to={`/dashboard/theory/${lesson.id}`}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-3xl p-6 transition-all shadow-lg h-full group relative overflow-hidden"
            >
              {/* Bg glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${lesson.bg} rounded-full blur-3xl group-hover:scale-150 transition-transform`} />
              
              <div className="relative z-10 flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${lesson.bg} ${lesson.color} group-hover:scale-110 transition-transform shadow-lg`}>
                  <lesson.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{lesson.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{lesson.desc}</p>
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-violet-400 group-hover:text-violet-300">
                    Bắt đầu học <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h3 className="text-xl font-bold text-white mb-2">Sau khi học xong Nhạc Lý?</h3>
            <p className="text-slate-400 max-w-lg">Bạn đã có đủ kiến thức nền tảng để đọc hiểu sheet nhạc và tự tin bước vào phần Kỹ thuật Thanh nhạc.</p>
         </div>
         <Link to="/dashboard/techniques">
            <Button className="bg-slate-800 hover:bg-slate-700 text-white rounded-full">
               Tới Kỹ thuật Thanh nhạc
            </Button>
         </Link>
      </div>
    </div>
  );
}
