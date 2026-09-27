import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BellRing, Smartphone, CheckCircle2, X, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PushNotificationBanner: React.FC = () => {
  const { notificationPermission, requestNotificationPermission, testPushNotification } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSent, setTestTestSent] = useState(false);

  useEffect(() => {
    // If permission was granted, hide dismiss state
    if (notificationPermission === 'granted') {
      setIsDismissed(false);
    }
  }, [notificationPermission]);

  if (isDismissed) return null;

  const handleTest = async () => {
    setIsTesting(true);
    await testPushNotification();
    setTestTestSent(true);
    setIsTesting(false);
    setTimeout(() => setTestTestSent(false), 4000);
  };

  return (
    <AnimatePresence>
      {notificationPermission !== 'granted' ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative z-30 mx-3 my-2 md:mx-6 p-3 md:p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/90 via-indigo-950/85 to-slate-900/90 border border-blue-500/40 shadow-xl shadow-blue-950/50 backdrop-blur-md"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="relative p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 shrink-0">
                <BellRing className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs md:text-sm font-black text-white flex items-center gap-1.5">
                    <span>تفعيل الإشعارات اللحظية على جهازك</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                      موصى به جداً
                    </span>
                  </h4>
                </div>
                <p className="text-[11px] md:text-xs text-slate-300 mt-0.5 leading-relaxed">
                  تلقّ التكليفات بالمهام، الفعاليات الجديدة، التوجيهات الصوتية، ونداءات الطوارئ لحظياً حتى عند إغلاق التطبيق أو قفل الشاشة.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => requestNotificationPermission()}
                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>تفعيل الآن 🔔</span>
              </button>

              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                title="اختبار وصول الإشعار والصوت"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{testSent ? 'تم الإرسال ✓' : 'اختبار'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
                title="إخفاء مؤقتاً"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
