import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share, PlusSquare, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PWAInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ isOpen, onClose }) => {
  const { branding } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card bg-slate-950/95 border border-blue-500/40 p-6 rounded-3xl max-w-md w-full text-right shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain bg-white rounded-2xl p-1" />
            ) : (
              <Smartphone className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-base font-black text-white">تثبيت التطبيق على هاتفك المحمول 📱</h3>
            <p className="text-xs text-slate-400">تطبيق سريع، خفيف، وبدون الحاجة لمتجر التطبيقات</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2 my-4">
            <Check className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">التطبيق مثبت بالفعل على جهازك! ✨</h4>
            <p className="text-xs text-emerald-300">يمكنك فتحه مباشرة من شاشة هاتفك الرئيسية بأيقونة الاتحاد الرسمية.</p>
          </div>
        ) : isIOS ? (
          <div className="space-y-4 my-2">
            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2.5">
              <span className="text-xs font-bold text-sky-300 block">خطوات التثبيت على أجهزة iPhone / iPad (Safari):</span>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <span>اضغط على زر المشاركة <Share className="w-3.5 h-3.5 inline text-sky-400 mx-1" /> في أسفل متصفح Safari.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <span>مرر للأسفل واختر <strong className="text-white">"إضافة إلى الصفحة الرئيسية"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-sky-400 mx-1" /> (Add to Home Screen).</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <span>اضغط على <strong className="text-emerald-400">"إضافة" (Add)</strong> بالأعلى لتظهر الأيقونة فوراً على شاشتك.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              اضغط على الزر أدناه لتثبيت أيقونة التطبيق على شاشة هاتفك، مع تفعيل الإشعارات والنغمات الفورية بدون استهلاك للإنترنت أو الذاكرة.
            </p>

            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                deferredPrompt
                  ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white hover:scale-[1.02] cursor-pointer shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{deferredPrompt ? 'تثبيت التطبيق الآن بنقرة واحدة 📲' : 'تم تثبيت التطبيق أو يمكنك إضافته من خيارات المتصفح'}</span>
            </button>

            {!deferredPrompt && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                💡 <strong>ملاحظة:</strong> إذا لم يظهر زر التثبيت المباشر، يمكنك الضغط على القائمة الثلاثية للمتصفح <strong>(⋮)</strong> واختيار <strong>"تثبيت التطبيق"</strong> أو <strong>"الإضافة إلى الشاشة الرئيسية"</strong>.
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>شعار الاتحاد الرسمي</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>يدعم التنبيهات والأوفلاين</span>
          </span>
        </div>
      </div>
    </div>
  );
};
