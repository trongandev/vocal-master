import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Music, Search, Shield, ShieldAlert, Crown, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { db, auth } from '../../lib/firebase';
import { collection, query, getDocs, doc, getDoc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';

export default function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState<'users' | 'songs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!auth.currentUser) return;
      const currentUserDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const me = currentUserDoc.data();
      if (me?.role === 'admin') {
         setIsAdmin(true);
         fetchUsers();
         fetchSongs();
      } else {
         setIsAdmin(false);
         setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const fetchSongs = async () => {
    try {
      const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setSongs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleVip = async (userId: string, currentVipStatus: boolean) => {
    try {
      await setDoc(doc(db, 'users', userId), { isVip: !currentVipStatus }, { merge: true });
      setUsers(users.map(u => u.id === userId ? { ...u, isVip: !currentVipStatus } : u));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
        await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
        console.error(e);
    }
  };

  const toggleSongStatus = async (songId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'hidden' ? 'public' : 'hidden';
    try {
      await setDoc(doc(db, 'songs', songId), { status: newStatus }, { merge: true });
      setSongs(songs.map(s => s.id === songId ? { ...s, status: newStatus } : s));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSong = async (songId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài hát này khỏi hệ thống?")) return;
    try {
      await deleteDoc(doc(db, 'songs', songId));
      setSongs(songs.filter(s => s.id !== songId));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isLoading && !isAdmin) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-16 text-center pt-20">
         <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
         <h1 className="text-3xl font-bold text-white mb-2">Truy cập bị từ chối</h1>
         <p className="text-slate-400">Bạn không có quyền truy cập trang quản trị hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Quản lý người dùng, phân quyền và dữ liệu hệ thống.</p>
      </div>

      <div className="flex border-b border-slate-800 gap-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'users' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Người dùng
        </button>
        <button 
          onClick={() => setActiveTab('songs')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'songs' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Music className="w-4 h-4" /> Bài hát
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Đang tải dữ liệu...</div>
      ) : (
        <>
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-300">
                   <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                     <tr>
                       <th className="px-6 py-4 font-medium">Người dùng</th>
                       <th className="px-6 py-4 font-medium">UID</th>
                       <th className="px-6 py-4 font-medium text-center">VIP Status</th>
                       <th className="px-6 py-4 font-medium text-center">Role (Admin)</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {users.map(user => (
                       <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                         <td className="px-6 py-4">
                           <div className="font-bold text-white">{user.displayName || 'Không tên'}</div>
                           <div className="text-xs text-slate-500">{user.email || 'Không có email'}</div>
                         </td>
                         <td className="px-6 py-4 text-xs font-mono text-slate-500">{user.id}</td>
                         <td className="px-6 py-4 text-center">
                           <button 
                             onClick={() => toggleVip(user.id, user.isVip)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.isVip ? 'bg-amber-500' : 'bg-slate-700'}`}
                           >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isVip ? 'translate-x-6' : 'translate-x-1'}`} />
                           </button>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <button 
                             onClick={() => toggleRole(user.id, user.role)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.role === 'admin' ? 'bg-rose-500' : 'bg-slate-700'}`}
                           >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.role === 'admin' ? 'translate-x-6' : 'translate-x-1'}`} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'songs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-300">
                   <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                     <tr>
                       <th className="px-6 py-4 font-medium">Bài hát</th>
                       <th className="px-6 py-4 font-medium">Nghệ sĩ / Kênh</th>
                       <th className="px-6 py-4 font-medium">Owner UID</th>
                       <th className="px-6 py-4 font-medium text-center">Hiển thị (Public)</th>
                       <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {songs.map(song => (
                       <tr key={song.id} className="hover:bg-slate-800/30 transition-colors">
                         <td className="px-6 py-3">
                           <div className="flex items-center gap-3">
                             {song.thumbnail && <img src={song.thumbnail} alt="" className="w-12 h-8 object-cover rounded" />}
                             <div className="font-bold text-white max-w-[200px] truncate">{song.title}</div>
                           </div>
                         </td>
                         <td className="px-6 py-4 text-slate-400">{song.artist}</td>
                         <td className="px-6 py-4 text-xs font-mono text-slate-500">{song.ownerId}</td>
                         <td className="px-6 py-4 text-center">
                           <button 
                             onClick={() => toggleSongStatus(song.id, song.status || 'public')}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(song.status || 'public') === 'public' ? 'bg-green-500' : 'bg-slate-700'}`}
                             title={(song.status || 'public') === 'public' ? 'Đang hiển thị' : 'Đang ẩn'}
                           >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(song.status || 'public') === 'public' ? 'translate-x-6' : 'translate-x-1'}`} />
                           </button>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => deleteSong(song.id)}
                             className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                             title="Xoá bài hát"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
