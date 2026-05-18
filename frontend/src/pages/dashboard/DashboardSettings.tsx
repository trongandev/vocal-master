import { useState } from 'react';
import { User, Bell, Crown, Shield, LogOut, Check, X, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardSettings() {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const PLANS = [
    {
      name: "Miễn phí",
      price: "0đ",
      period: "/ mãi mãi",
      desc: "Trải nghiệm tính năng cơ bản của VocalMaster.",
      features: [
        "Tải lên tối đa 3 bài hát / tháng",
        "Đánh giá thanh nhạc cơ bản (Level 1)",
        "Tham gia Cộng đồng người học",
        "Hiển thị quảng cáo"
      ],
      buttonText: "Đang sử dụng",
      buttonVariant: "outline",
      popular: false
    },
    {
      name: "VIP",
      price: "199.000đ",
      period: "/ tháng",
      desc: "Mở khoá toàn bộ sức mạnh AI để luyện giọng chuyên nghiệp.",
      features: [
        "Tải lên bài hát không giới hạn",
        "Đánh giá AI chuyên sâu (Level 2 & 3)",
        "Chế độ hát Private (Riêng tư)",
        "Tải bản sheet nhạc gốc chất lượng cao",
        "Không quảng cáo",
        "Huy hiệu VIP độc quyền trên Profile"
      ],
      buttonText: "Nâng cấp VIP",
      buttonVariant: "default",
      popular: true
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cài đặt tài khoản</h1>
          <p className="text-slate-400">Quản lý thông tin cá nhân và cấu hình ứng dụng.</p>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-slate-800 md:hidden">
          <LogOut className="w-5 h-5 mr-2" />
          Đăng xuất
        </Button>
      </div>

      {/* Profil details */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
           <User className="text-violet-400" />
           <h2 className="text-xl font-bold text-white">Hồ sơ cá nhân</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'An'}`} alt="avatar" className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700" />
            <Button variant="outline" className="border-slate-700 text-slate-300">Đổi Ảnh</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Tên hiển thị</label>
              <input type="text" defaultValue={user?.displayName || user?.email?.split('@')[0] || ''} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-300">Loại giọng (Tự đánh giá)</label>
               <select className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none appearance-none">
                  <option value="Bass">Bass</option>
                  <option value="Baritone" selected>Baritone</option>
                  <option value="Tenor">Tenor</option>
                  <option value="Alto">Alto</option>
                  <option value="Mezzo">Mezzo-soprano</option>
                  <option value="Soprano">Soprano</option>
               </select>
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-500 text-white">Lưu hồ sơ</Button>
        </div>
      </section>

      {/* Plan */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
           <Crown className="text-amber-500" />
           <h2 className="text-xl font-bold text-white">Gói dịch vụ</h2>
        </div>
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 to-slate-950">
           <div>
             <div className="flex items-center gap-2 mb-1">
               <span className="text-amber-500 font-bold">Gói Miễn Phí (Free)</span>
             </div>
             <p className="text-sm text-slate-400 max-w-sm">Giới hạn tải lên 3 bài hát/tháng. Nâng cấp VIP để mở khoá tính năng hát Private và không giới hạn kho nhạc.</p>
           </div>
           <Button 
             onClick={() => setShowUpgradeModal(true)}
             className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-0 shadow-lg shadow-amber-500/20 shrink-0"
           >
              <Star className="w-4 h-4 mr-2" />
              Nâng cấp VIP ngay
           </Button>
        </div>
      </section>

       {/* Notifications */}
       <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
           <Bell className="text-blue-400" />
           <h2 className="text-xl font-bold text-white">Thông báo & Quyền riêng tư</h2>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <div className="font-semibold text-white">Thông báo bài hát mới</div>
               <div className="text-sm text-slate-500">Nhận email khi có bài hát cộng đồng hot.</div>
             </div>
             <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-violet-600 focus:outline-none">
               <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
             </button>
           </div>
           <div className="flex items-center justify-between pt-4 border-t border-slate-800">
             <div>
               <div className="font-semibold text-white">Trang phục cá nhân Public</div>
               <div className="text-sm text-slate-500">Cho phép người khác truy cập trang cá nhân (Profile) của bạn.</div>
             </div>
             <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-violet-600 focus:outline-none">
               <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
             </button>
           </div>
        </div>
      </section>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Nâng cấp tài khoản</h2>
                  <p className="text-slate-400 text-sm">Mở khoá sức mạnh AI và các bài tập chuyên sâu.</p>
                </div>
                <button onClick={() => setShowUpgradeModal(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 bg-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PLANS.map((plan, idx) => (
                    <div 
                      key={idx} 
                      className={`relative flex flex-col p-6 rounded-2xl border ${
                        plan.popular 
                          ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-6 transform -translate-y-1/2">
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/20">
                            <Crown className="w-3 h-3" /> Đề xuất
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                        <span className="text-slate-400 font-medium">{plan.period}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-6 min-h-[40px]">{plan.desc}</p>
                      
                      <div className="flex-1 space-y-4 mb-8">
                        {plan.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-3">
                            <div className="shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center mt-0.5">
                              <Check className="w-3 h-3 text-violet-400" />
                            </div>
                            <span className="text-sm text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant={plan.buttonVariant as "default" | "outline"}
                        className={`w-full py-6 text-base font-semibold rounded-xl ${
                          plan.popular 
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 border-0 shadow-xl shadow-amber-500/20' 
                            : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {plan.buttonText}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
