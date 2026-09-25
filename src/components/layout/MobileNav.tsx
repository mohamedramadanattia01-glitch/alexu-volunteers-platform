import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, CheckSquare, Zap, QrCode, 
  Users, AlertTriangle, Menu, Sparkles 
} from 'lucide-react';

interface MobileNavProps {
  onOpenMobileDrawer: () => void;
  onOpenQRModal: () => void;
  onOpenSOSModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  onOpenMobileDrawer, onOpenQRModal, onOpenSOSModal 
}) => {
  const { activeTab, setActiveTab, isLiveCommandCenterActive, sosAlerts } = useApp();
  const hasSOS = sosAlerts.some(s => s.status === 'Open');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all p-1 cursor-pointer active:scale-90 ${
            activeTab === 'dashboard' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600/20 shadow-sm shadow-blue-500/50' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span>الرئيسية</span>
        </button>

        {/* Tasks */}
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all p-1 cursor-pointer active:scale-90 ${
            activeTab === 'tasks' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-blue-600/20 shadow-sm shadow-blue-500/50' : ''}`}>
            <CheckSquare className="w-5 h-5" />
          </div>
          <span>المهام</span>
        </button>

        {/* Center Floating Pulsing QR Attendance Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onOpenQRModal}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 text-white flex items-center justify-center shadow-xl shadow-blue-500/50 border-3 border-slate-950 active:scale-90 transition-all cursor-pointer hover:scale-105"
          >
            <QrCode className="w-6 h-6 animate-pulse" />
          </button>
          <span className="text-[9px] font-extrabold text-sky-300 mt-1">مسح QR</span>
        </div>

        {/* Live Command Center */}
        <button
          onClick={() => setActiveTab('live-command')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all p-1 cursor-pointer active:scale-90 ${
            activeTab === 'live-command' ? 'text-emerald-400 scale-105' : isLiveCommandCenterActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'live-command' ? 'bg-emerald-600/20 shadow-sm shadow-emerald-500/50' : ''}`}>
            <Zap className="w-5 h-5" />
          </div>
          <span>غرفة العمليات</span>
        </button>

        {/* Menu Drawer */}
        <button
          onClick={onOpenMobileDrawer}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-all p-1 cursor-pointer active:scale-90"
        >
          <div className="p-1 rounded-xl hover:bg-slate-800">
            <Menu className="w-5 h-5" />
          </div>
          <span>القائمة</span>
        </button>

      </div>
    </nav>
  );
};
