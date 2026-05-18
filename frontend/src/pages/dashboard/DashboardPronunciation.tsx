import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, PlayCircle, RefreshCw, Volume2, CheckCircle2, AlertTriangle, XCircle, FileAudio, AudioLines, Info } from 'lucide-react';
import { Button } from '../../components/ui/button';

const EXERCISES = [
  {
    id: 1,
    title: "Luyện Mở Khẩu Hình Dọc (Nguyên âm A, O)",
    phrase: "Hoà vào làn mây trôi nát tan trong chiều",
    words: [
      { text: "Hoà", status: "good" },
      { text: "vào", status: "good" },
      { text: "làn", status: "good" },
      { text: "mây", status: "good" },
      { text: "trôi", status: "warning", issue: "Âm 'tr' chưa rõ, đang đọc giống 'ch'." },
      { text: "nát", status: "good" },
      { text: "tan", status: "bad", issue: "Khẩu hình bị bẹt. Cần hạ hàm dưới theo hình dọc." },
      { text: "trong", status: "good" },
      { text: "chiều", status: "good" }
    ],
    score: 78,
    tip: "Khi hát các từ có nguyên âm 'A' (như 'tan'), hãy hạ hàm dưới xuống thả lỏng thay vì kéo khóe miệng sang hai bên (cười). Điều này giúp âm vang và không bị chua."
  },
  {
    id: 2,
    title: "Phát âm rõ Phụ Âm Đầu (L/N & Tr/Ch)",
    phrase: "Lòng não nề nhìn trời trong mây trắng",
    words: [
      { text: "Lòng", status: "good" },
      { text: "não", status: "bad", issue: "Bị ngọng thành 'lão'. Hãy cố định đầu lưỡi ở chân răng." },
      { text: "nề", status: "good" },
      { text: "nhìn", status: "good" },
      { text: "trời", status: "warning", issue: "Đuối hơi, phụ âm 'Tr' bật chưa mạnh." },
      { text: "trong", status: "good" },
      { text: "mây", status: "good" },
      { text: "trắng", status: "good" }
    ],
    score: 65,
    tip: "Phụ âm giúp từ ngữ rành mạch. Nếu bạn hát yếu phụ âm đầu, bài hát sẽ bị 'sương mù' và người nghe không hiểu lời. Hãy tập bật mạnh hơi ở các phụ âm bật."
  },
  {
    id: 3,
    title: "Đóng nốt và Nhả chữ (Nguyên âm i, e)",
    phrase: "Nhìn hạt mưa rơi rớt bên thềm vắng",
    words: [
      { text: "Nhìn", status: "good" },
      { text: "hạt", status: "good" },
      { text: "mưa", status: "good" },
      { text: "rơi", status: "good" },
      { text: "rớt", status: "warning", issue: "Chữ bị nuốt, chưa rõ phụ âm cuối 't'." },
      { text: "bên", status: "good" },
      { text: "thềm", status: "warning", issue: "Âm 'e' bị nghẹt ở mũi." },
      { text: "vắng", status: "good" }
    ],
    score: 82,
    tip: "Để hát rõ các từ có âm cuối như 't', 'p', 'c', bạn cần có thao tác đóng khẩu hình nhẹ nhàng ở cuối nốt nhạc nhưng không được tắt hẳn luồng hơi quá sớm."
  }
];

export default function DashboardPronunciation() {
  const [selectedEx, setSelectedEx] = useState(EXERCISES[0]);
  const [testState, setTestState] = useState<'IDLE' | 'RECORDING' | 'ANALYZING' | 'RESULT'>('IDLE');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      setTestState('RECORDING');
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 9) { // Auto stop at 10s
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      alert("Vui lòng cấp quyền Microphone để sử dụng tính năng này.");
    }
  };

  const stopRecording = () => {
    stopMediaTracks();
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTestState('ANALYZING');
    
    // Simulate AI analyze delay
    setTimeout(() => {
      setTestState('RESULT');
    }, 2500);
  };

  const resetTest = () => {
    setTestState('IDLE');
    setRecordingTime(0);
  };

  const handleSelectExercise = (ex: any) => {
    setSelectedEx(ex);
    resetTest();
  };

  // Format time (ex: 00:05)
  const formatTime = (secs: number) => {
    return `00:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Chẩn đoán Phát âm & Chữ</h1>
        <p className="text-slate-400 text-lg">Hát không chỉ đúng nốt mà còn phải rõ chữ. AI sẽ phân tích khẩu hình, cách đẩy hơi và nguyên âm của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Exercises List */}
        <div className="lg:col-span-1 border-r border-slate-800/50 pr-0 lg:pr-8 space-y-4">
          <h3 className="font-semibold text-slate-300 mb-4 px-2 tracking-wide uppercase text-sm">Các bài tập mẫu</h3>
          <div className="space-y-3">
             {EXERCISES.map(ex => (
                <button 
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                     selectedEx.id === ex.id 
                       ? 'bg-rose-500/10 border-rose-500/30' 
                       : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <h4 className={`font-bold text-sm mb-2 ${selectedEx.id === ex.id ? 'text-rose-400' : 'text-slate-200'}`}>{ex.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 italic">"{ex.phrase}"</p>
                </button>
             ))}
          </div>
          
          <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
             <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">Bạn cũng có thể dán một đoạn lyric bất kỳ vào đây để AI tự tạo bài tập luyện phát âm riêng cho bạn (Sắp ra mắt).</p>
             </div>
          </div>
        </div>

        {/* Right Col: Testing Area */}
        <div className="lg:col-span-2">
           <AnimatePresence mode="wait">
              {/* STAGE: IDLE & RECORDING */}
              {(testState === 'IDLE' || testState === 'RECORDING') && (
                 <motion.div
                    key="stage-record"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center"
                 >
                    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center relative shadow-xl overflow-hidden min-h-[400px] flex flex-col justify-center">
                       {/* Subtle bg glow */}
                       <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />

                       <h2 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-4">Câu hát mục tiêu</h2>
                       <p className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-tight mb-12 py-2">
                          "{selectedEx.phrase}"
                       </p>

                       {testState === 'IDLE' ? (
                          <div className="flex flex-col items-center">
                             <Button 
                                size="lg" 
                                onClick={startRecording}
                                className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all hover:scale-105"
                             >
                                <Mic className="w-8 h-8 text-white" />
                             </Button>
                             <p className="text-slate-400 mt-6 font-medium">Bấm để thu âm đoạn hát trên</p>
                          </div>
                       ) : (
                          <div className="flex flex-col items-center">
                             <div className="flex items-center justify-center gap-2 mb-6 h-12">
                                {[1, 2, 3, 4, 5, 6, 7].map((bar, i) => (
                                   <motion.div 
                                      key={i}
                                      animate={{ height: [`20%`, `${Math.random() * 80 + 20}%`, `20%`] }}
                                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                      className="w-1.5 bg-rose-500 rounded-full"
                                   />
                                ))}
                             </div>
                             <div className="text-rose-400 font-mono text-2xl font-bold tracking-wider mb-8">
                                {formatTime(recordingTime)}
                             </div>
                             <Button 
                                size="lg" 
                                onClick={stopRecording}
                                className="h-14 px-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700"
                             >
                                <Square className="w-5 h-5 mr-3 fill-current" />
                                Dừng thu âm
                             </Button>
                          </div>
                       )}
                    </div>
                 </motion.div>
              )}

              {/* STAGE: ANALYZING */}
              {testState === 'ANALYZING' && (
                 <motion.div
                    key="stage-analyze"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[400px] w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl"
                 >
                    <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                       <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                       <motion.div 
                         animate={{ rotate: 360 }} 
                         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full" 
                       />
                       <AudioLines className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">AI đang phân tích khẩu hình...</h3>
                    <p className="text-slate-400 text-sm max-w-sm text-center">Chúng tôi đang bóc tách từng âm tiết và so sánh với phổ thanh nhạc chuẩn.</p>
                 </motion.div>
              )}

              {/* STAGE: RESULT */}
              {testState === 'RESULT' && (
                 <motion.div
                    key="stage-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                 >
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                       <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-800 pb-8">
                          <div>
                             <h2 className="text-2xl font-bold text-white mb-3">Kết quả Phân tích</h2>
                             <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center text-green-400 bg-green-400/10 px-2.5 py-1 rounded-md font-medium"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Chuẩn xác</span>
                                <span className="flex items-center text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md font-medium"><AlertTriangle className="w-4 h-4 mr-1.5" /> Cần chú ý</span>
                                <span className="flex items-center text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-md font-medium"><XCircle className="w-4 h-4 mr-1.5" /> Phát âm sai</span>
                             </div>
                          </div>

                          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                             <div className="text-center">
                                <span className="block text-slate-500 text-xs font-bold uppercase mb-1">Điểm rõ chữ</span>
                                <span className={`text-4xl font-black ${selectedEx.score >= 80 ? 'text-green-400' : selectedEx.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                   {selectedEx.score}
                                </span>
                             </div>
                          </div>
                       </div>

                       {/* Word by word breakdown */}
                       <div className="flex flex-wrap gap-2 mb-10">
                          {selectedEx.words.map((word, idx) => {
                             let colorClass = "bg-slate-800/50 text-slate-300 border-slate-700";
                             if (word.status === 'warning') colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]";
                             if (word.status === 'bad') colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold shadow-[0_0_10px_rgba(225,29,72,0.1)]";
                             if (word.status === 'good') colorClass = "bg-green-500/5 text-green-400 border-green-500/20";
                             
                             return (
                                <div key={idx} className="relative group cursor-default">
                                   <div className={`px-4 py-3 rounded-xl border text-xl transition-all ${colorClass}`}>
                                      {word.text}
                                   </div>
                                   {/* Tooltip for issues */}
                                   {(word.status === 'warning' || word.status === 'bad') && (
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 rounded-xl text-xs text-white shadow-xl border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                         <div className="font-bold mb-1 text-slate-300 flex items-center gap-1.5 border-b border-slate-700 pb-1">
                                            Lỗi chữ "{word.text}"
                                         </div>
                                         <div className="pt-1">{word.issue}</div>
                                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                                      </div>
                                   )}
                                </div>
                             )
                          })}
                       </div>

                       {/* Advice Block */}
                       <div className="bg-gradient-to-r from-blue-900/20 to-violet-900/20 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
                          <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mt-1">
                             <FileAudio className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                             <h4 className="text-white font-bold mb-1">Lời khuyên thanh nhạc</h4>
                             <p className="text-slate-300 text-sm leading-relaxed">{selectedEx.tip}</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex justify-center">
                       <Button 
                         size="lg" 
                         onClick={resetTest}
                         className="bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold h-12 px-8"
                       >
                          <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
                       </Button>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
