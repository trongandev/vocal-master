import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Pause, X, Save, RefreshCw } from 'lucide-react';

export default function PlayScreen() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock progression
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => Math.min(p + 0.5, 100));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col relative select-none">
      {/* Background visualizer effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/40 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="absolute top-0 w-full p-4 md:p-6 flex items-center justify-between z-50 bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
             <h1 className="font-bold text-lg leading-tight">Chắc Ai Đó Sẽ Về</h1>
             <p className="text-sm text-slate-400">Sơn Tùng M-TP • Tông: C</p>
          </div>
        </div>
        <div className="font-mono font-bold text-violet-400 bg-slate-900/80 border border-violet-500/30 px-4 py-1.5 rounded-full">
           Điểm: 0
        </div>
      </header>

      {/* Main Stage (Lyrics & Video Mock) */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 mt-20 mb-32">
         {/* Youtube iframe mock */}
         <div className="w-full max-w-4xl aspect-[21/9] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 mb-10 opacity-70 relative">
            <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&q=80" className="w-full h-full object-cover opacity-50" alt="Video cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
               {!isPlaying && (
                 <button onClick={() => setIsPlaying(true)} className="w-20 h-20 bg-violet-600/90 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 transition-transform">
                   <Play className="w-10 h-10 ml-2" />
                 </button>
               )}
            </div>
         </div>

         {/* Scrolling Lyrics */}
         <div className="h-48 w-full max-w-3xl flex flex-col justify-center items-center text-center gap-6 mask-image-y">
            <p className="text-xl md:text-2xl text-slate-500 font-medium opacity-50 mb-4 transition-all">
              Anh tìm nỗi nhớ, anh tìm quá khứ
            </p>
            <p className="text-3xl md:text-5xl font-bold text-white transition-all scale-110 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              Nhớ lắm ký ức <span className="text-violet-400">anh và em</span>
            </p>
            <p className="text-xl md:text-2xl text-slate-500 font-medium opacity-50 mt-4 transition-all">
              Ngồi lại đây một chút, nghĩ về nhau một chút
            </p>
         </div>
      </main>

      {/* Realtime Pitch Meter Bottom */}
      <footer className="absolute bottom-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-50 p-6">
        <div className="max-w-5xl mx-auto">
           {/* Progress bar */}
           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
             <div className="h-full bg-violet-500" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
           </div>

           <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                 <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-200">
                    {isPlaying ? <Pause fill="currentColor" className="w-5 h-5" /> : <Play fill="currentColor" className="w-5 h-5 ml-1" />}
                 </button>
                 <button className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700">
                    <RefreshCw className="w-4 h-4" />
                 </button>
              </div>

              {/* Pitch Lane Mock */}
              <div className="flex-1 max-w-lg mx-6 h-16 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden hidden md:block">
                 <div className="absolute inset-y-0 left-1/2 w-px bg-slate-700/50" />
                 {/* Target Note */}
                 <div className="absolute top-[30%] left-[20%] w-[30%] h-3 bg-slate-700 rounded-full" />
                 <div className="absolute top-[60%] left-[60%] w-[20%] h-3 bg-slate-700 rounded-full" />
                 
                 {/* Current Voice - Live indicator */}
                 <motion.div 
                   className="absolute top-[30%] left-[45%] w-4 h-4 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                   animate={{ y: isPlaying ? [0, -10, 5, 0] : 0 }}
                   transition={{ duration: 1, repeat: Infinity }}
                 />
              </div>

              <Link to={`/results/session-complete`}>
                <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-green-600/20 text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" /> Hoàn thành
                </button>
              </Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
