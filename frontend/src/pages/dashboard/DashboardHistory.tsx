import { useState, useEffect } from 'react';
import { Calendar, PlayCircle, Activity, ChevronDown, ChevronUp, Sparkles, User, Mic, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function DashboardHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Subscribe to User Profile
    const profileUnsubscribe = onSnapshot(doc(db, 'users', auth.currentUser!.uid), (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });

    // Subscribe to Evaluations
    const q = query(
      collection(db, 'vocalEvaluations'),
      where('userId', '==', auth.currentUser!.uid),
      orderBy('createdAt', 'desc')
    );

    const evaluationsUnsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(data);
      setLoading(false);
    });

    return () => {
      profileUnsubscribe();
      evaluationsUnsubscribe();
    };
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Đang xử lý...';
    const date = timestamp.toDate();
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hồ sơ & Lịch sử</h1>
          <p className="text-slate-400">Xem lại quá trình phát triển giọng hát và các phân tích từ AI.</p>
        </div>
        
        {userProfile && (
           <div className="bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/30 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white">
                 <User className="w-6 h-6" />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Loại giọng của bạn</div>
                 <div className="text-lg font-bold text-white">{userProfile.bestVocalType || 'Chưa xác định'}</div>
                 <div className="text-xs text-slate-400">Quãng giọng: {userProfile.bestVocalRange || '--'}</div>
              </div>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           <Activity className="w-5 h-5 text-blue-400" />
           Lịch sử AI Đánh giá
        </h2>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
              <RefreshCw className="w-8 h-8 text-violet-500 animate-spin mb-4" />
              <p className="text-slate-500">Đang tải lịch sử...</p>
           </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all">
                <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-violet-400 shrink-0">
                       <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <h3 className="font-bold text-white uppercase text-sm tracking-wide">Phân tích ngày {formatDate(item.createdAt).split(' ')[0]}</h3>
                         <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">Target: {item.targetNote}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.3 h-3.3" /> {formatDate(item.createdAt)}</span>
                        <span className="flex items-center gap-1"><Mic className="w-3.3 h-3.3" /> {item.vocalType || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl h-10 px-5"
                  >
                    {expandedId === item.id ? (
                       <><ChevronUp className="w-4 h-4 mr-2" /> Thu gọn</>
                    ) : (
                       <><PlayCircle className="w-4 h-4 mr-2" /> Xem chi tiết</>
                    )}
                  </Button>
                </div>

                {expandedId === item.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-slate-800 bg-slate-950 p-6"
                  >
                    <div className="prose prose-invert prose-sm max-w-none prose-violet bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                       {item.analysisResult.split('\n').map((line: string, i: number) => {
                          if (!line.trim()) return <div key={i} className="h-2" />;
                          return <p key={i} className="text-slate-300 leading-relaxed m-0 mb-2">{line}</p>
                       })}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
             <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="text-slate-500">Chưa có bản ghi đánh giá nào.</p>
             <Link to="/dashboard/ai-evaluate" className="inline-block mt-4 text-violet-400 hover:text-violet-300 font-bold">
                Bắt đầu buổi tập đầu tiên ngay →
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
