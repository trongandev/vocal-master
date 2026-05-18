import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Home, 
  Upload, 
  Globe, 
  History, 
  Settings, 
  LogOut, 
  Mic2,
  Crown,
  BookOpen,
  GraduationCap,
  Target,
  MessageSquareWarning,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }

    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        }
      });
      return () => unsubscribe();
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading || !user) return null;

  const navItems = [
    { name: 'Bài hát của tôi', path: '/dashboard', icon: Home, end: true },
    { name: 'Lộ trình học', path: '/dashboard/roadmap', icon: Target },
    { name: 'Cộng đồng', path: '/dashboard/community', icon: Globe },
    { name: 'Nhạc lý cơ bản', path: '/dashboard/theory', icon: GraduationCap },
    { name: 'Phát âm & Khẩu hình', path: '/dashboard/pronunciation', icon: MessageSquareWarning },
    { name: 'AI Đánh giá hát', path: '/dashboard/ai-evaluate', icon: Sparkles },
    { name: 'Kỹ thuật Thanh nhạc', path: '/dashboard/techniques', icon: BookOpen },
    { name: 'Lịch sử hát', path: '/dashboard/history', icon: History },
    { name: 'Cài đặt', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Mic2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">
              VocalMaster
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 hide-scrollbar">
          {navItems.map((item) => {
            const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 bg-violet-600/10 border border-violet-500/20 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-violet-400" : "")} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}

          <div className="mt-8 mb-4 px-3">
             <Link to="/dashboard/upload">
               <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20">
                 <Upload className="w-4 h-4 mr-2" />
                 Thêm bài mới
               </Button>
             </Link>
          </div>
        </div>

        {/* User profile brief & VIP */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">Free Plan</span>
            </div>
            <Link to="/dashboard/settings" className="text-xs text-amber-400 hover:underline">Nâng cấp</Link>
          </div>
          
          <div className="flex items-center gap-3 px-2">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
            <div className="flex-1 truncate">
              <div className="text-sm font-semibold text-white truncate">{user.displayName || user.email?.split('@')[0]}</div>
              <div className="text-xs text-slate-500 truncate">Giọng: {profile?.bestVocalType?.split(' (')[0] || 'Chưa xđ'}</div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <Mic2 className="w-5 h-5" />
            </div>
          </Link>
          <Link to="/dashboard/settings">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" className="w-8 h-8 rounded-full bg-slate-800" />
          </Link>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
