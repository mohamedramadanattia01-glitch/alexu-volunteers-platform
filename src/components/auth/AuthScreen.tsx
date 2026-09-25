import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LogIn, UserPlus, Shield, Sparkles, Mail, Lock, 
  User, Phone, CreditCard, Building2, Calendar, 
  CheckCircle2, Clock, AlertCircle, ArrowRight, 
  Crown, Star, Layers, ChevronLeft, RefreshCw, Send, Check, X,
  ShieldAlert, Ban
} from 'lucide-react';
import { Member } from '../../types';
import { ALEXANDRIA_UNIVERSITY_COLLEGES } from '../../data/colleges';
import { parseEgyptianNationalId, normalizeNumerals } from '../../utils/nationalId';

export const AuthScreen: React.FC = () => {
  const { 
    loginWithEmail, registerVolunteer, committees, 
    members, bannedList, isUserBanned, branding, playSound 
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'pending_status' | 'banned_status'>('login');
  
  // Google Auth Modal / Simulation state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCollege, setRegCollege] = useState('كلية الهندسة');
  const [regAcademicYear, setRegAcademicYear] = useState('الفرقة الثانية');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('2005-06-15');
  const [regPreferredCommId, setRegPreferredCommId] = useState(committees[0]?.id || 'comm-org');
  const [regBio, setRegBio] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Pending user preview state
  const [pendingApplicant, setPendingApplicant] = useState<Member | null>(null);

  // Banned user details state
  const [bannedUserDetails, setBannedUserDetails] = useState<{
    email: string;
    fullName?: string;
    reason?: string;
    bannedAt?: string;
    bannedBy?: string;
  } | null>(null);

  const collegesList = ALEXANDRIA_UNIVERSITY_COLLEGES;

  const academicYearsList = [
    'الفرقة الإعدادية / الأولى',
    'الفرقة الثانية',
    'الفرقة الثالثة',
    'الفرقة الرابعة',
    'الفرقة الخامسة / بكالوريوس'
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) {
      setLoginError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setLoginLoading(true);
    setTimeout(() => {
      const res = loginWithEmail(loginEmail, loginPassword);
      setLoginLoading(false);

      if (!res.success) {
        if (res.status === 'Banned') {
          const blacklisted = bannedList.find(b => b.email?.toLowerCase() === loginEmail.trim().toLowerCase());
          setBannedUserDetails({
            email: loginEmail.trim(),
            fullName: res.member?.fullName || blacklisted?.fullName,
            reason: res.member?.banReason || blacklisted?.reason || 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي',
            bannedAt: res.member?.bannedAt || blacklisted?.bannedAt,
            bannedBy: res.member?.bannedBy || blacklisted?.bannedBy
          });
          setMode('banned_status');
        } else if (res.status === 'Pending' && res.member) {
          setPendingApplicant(res.member);
          setMode('pending_status');
        } else {
          setLoginError(res.message);
        }
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim() || !regEmail.trim() || !regWhatsapp.trim()) {
      setRegError('يرجى ملء كافة الحقول الأساسية المطلوبة');
      return;
    }

    if (!regEmail.includes('@')) {
      setRegError('يرجى إدخال بريد إلكتروني صحيح (Gmail أو بريد جامعي)');
      return;
    }

    setRegLoading(true);
    setTimeout(() => {
      const natResult = parseEgyptianNationalId(regNationalId);
      const effectiveBirthDate = natResult.isValid ? natResult.birthDate : regBirthDate;

      const res = registerVolunteer({
        fullName: regFullName,
        email: regEmail,
        password: regPassword || '123456',
        college: regCollege,
        academicYear: regAcademicYear,
        whatsapp: regWhatsapp,
        nationalId: regNationalId || '30500000000000',
        birthDate: effectiveBirthDate,
        preferredCommitteeId: regPreferredCommId,
        bio: regBio
      });

      setRegLoading(false);
      if (res.success && res.member) {
        setPendingApplicant(res.member);
        setMode('pending_status');
      } else {
        setRegError(res.message);
      }
    }, 500);
  };

  // Real Google Sign-in Handler
  const handleGoogleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleError('');

    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setGoogleError('يرجى إدخال بريد Google / Gmail صحيح');
      return;
    }

    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      setIsGoogleModalOpen(false);

      const targetEmail = googleEmailInput.trim().toLowerCase();

      // Check if banned
      if (isUserBanned(targetEmail)) {
        const blacklisted = bannedList.find(b => b.email?.toLowerCase() === targetEmail);
        const mem = members.find(m => m.universityEmail?.toLowerCase() === targetEmail);
        setBannedUserDetails({
          email: targetEmail,
          fullName: mem?.fullName || blacklisted?.fullName,
          reason: mem?.banReason || blacklisted?.reason || 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي',
          bannedAt: mem?.bannedAt || blacklisted?.bannedAt,
          bannedBy: mem?.bannedBy || blacklisted?.bannedBy
        });
        setMode('banned_status');
        return;
      }

      const existing = members.find(m => m.universityEmail?.trim().toLowerCase() === targetEmail);

      if (existing) {
        if (existing.status === 'Active') {
          loginWithEmail(existing.universityEmail);
        } else if (existing.status === 'Pending' || existing.status === 'Applicant') {
          setPendingApplicant(existing);
          setMode('pending_status');
        } else if (existing.status === 'Banned') {
          setBannedUserDetails({
            email: targetEmail,
            fullName: existing.fullName,
            reason: existing.banReason || 'مخالفة اللائحة التنظيمية',
            bannedAt: existing.bannedAt,
            bannedBy: existing.bannedBy
          });
          setMode('banned_status');
        } else {
          setLoginError('حسابك مؤرشف أو غير مفعل حالياً');
        }
      } else {
        // New Google Account - Transfer to Register form pre-filled
        setRegEmail(targetEmail);
        if (googleNameInput.trim()) {
          setRegFullName(googleNameInput.trim());
        }
        setMode('register');
        playSound('normal');
      }
    }, 500);
  };

  const checkPendingStatus = () => {
    if (!pendingApplicant) return;
    const refreshed = members.find(m => m.id === pendingApplicant.id);
    if (refreshed) {
      if (refreshed.status === 'Active') {
        loginWithEmail(refreshed.universityEmail);
      } else {
        setPendingApplicant(refreshed);
        playSound('normal');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Creative Ambient Glow */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-b from-blue-600/20 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg glass-card border border-white/10 bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Creative Central Logo & Branding Header */}
        <div className="p-6 sm:p-8 text-center relative border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950/80">
          
          {/* Glowing Animated Central Logo Container */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-4 group cursor-pointer">
            {/* Outer Pulsing Aura Ring */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
            
            {/* Rotating Ambient Border */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-sky-400 rounded-2xl p-[2px] shadow-2xl shadow-blue-500/40">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-1.5 shadow-inner">
                {branding.logoUrl ? (
                  <img 
                    src={branding.logoUrl} 
                    alt="اتحاد طلاب جامعة الإسكندرية" 
                    className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-950 via-slate-950 to-sky-950 flex flex-col items-center justify-center rounded-xl border border-blue-500/30">
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 tracking-wider">
                      AU
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest mt-0.5">
                      ALEX U
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>اتحاد طلاب جامعة الإسكندرية • البوابة الرسمية</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            {branding.appTitle || 'فريق المتطوعين'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {branding.subtitle || 'منصة إدارة وتشغيل العمليات واللجان التخصصية'}
          </p>
        </div>

        {/* Tab Switcher (Only if in login or register mode) */}
        {mode !== 'pending_status' && mode !== 'banned_status' && (
          <div className="flex border-b border-white/10 bg-slate-950/80 p-1.5 gap-1.5 text-xs sm:text-sm font-bold">
            <button
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              onClick={() => { setMode('register'); setRegError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>تسجيل متطوع جديد</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-7">
          
          {/* ======================================================== */}
          {/* 1. LOGIN MODE */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <div className="space-y-4">
              
              {/* Google Sign-in Official Button */}
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform active:scale-[0.99] border border-slate-200"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>المتابعة باستخدام حساب Google / Gmail</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 shrink-0">
                  أو بالبريد الإلكتروني وكلمة المرور
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{loginError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    البريد الإلكتروني (Email / Gmail)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="yourname@gmail.com أو البريد الجامعي"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    كلمة المرور (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {loginLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>دخول إلى المنصة الرسمية</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer transition-colors"
                >
                  ليس لديك حساب بعد؟ <span className="underline font-bold">تسجيل متطوع جديد الآن</span>
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 2. REGISTER MODE */}
          {/* ======================================================== */}
          {mode === 'register' && (
            <div className="space-y-3.5">
              
              {/* Google Sign-in fast fill option */}
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-white/10"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>ملء البيانات تلقائياً عبر حساب Google</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] font-semibold text-slate-500 shrink-0">
                  أو تعبئة الاستمارة يدوياً
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{regError}</div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الاسم الرباعي الرسمي *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="أدخل اسمك الرباعي كما في بطاقة الرقم القومي"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      البريد الإلكتروني (Gmail / جامعي) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="كلمة مرور الدخول"
                        className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* College & Academic Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      الكلية *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <select
                        value={regCollege}
                        onChange={e => setRegCollege(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        {collegesList.map(c => (
                          <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      الفرقة الدراسية *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <select
                        value={regAcademicYear}
                        onChange={e => setRegAcademicYear(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        {academicYearsList.map(y => (
                          <option key={y} value={y} className="bg-slate-900 text-white">{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Phone WhatsApp & National ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رقم الواتساب والتواصل *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={regWhatsapp}
                        onChange={e => setRegWhatsapp(e.target.value)}
                        placeholder="01012345678"
                        className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      الرقم القومي (14 رقم)
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        maxLength={14}
                        value={regNationalId}
                        onChange={e => {
                          const val = normalizeNumerals(e.target.value).replace(/[^0-9]/g, '').slice(0, 14);
                          setRegNationalId(val);
                          if (val.length === 14) {
                            const p = parseEgyptianNationalId(val);
                            if (p.isValid) {
                              setRegBirthDate(p.birthDate);
                            }
                          }
                        }}
                        placeholder="30501010204419"
                        className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time National ID Extraction Info Card */}
                {regNationalId.length > 0 && (() => {
                  const p = parseEgyptianNationalId(regNationalId);
                  if (p.isValid) {
                    return (
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 animate-in fade-in space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>تم استخراج وتدقيق بيانات الرقم القومي بنجاح:</span>
                        </div>
                        <div className="text-[10px] text-slate-300 flex flex-wrap gap-x-3 gap-y-1 pr-5">
                          <span>📅 تاريخ الميلاد: <strong className="text-white font-mono">{p.formattedDate}</strong></span>
                          <span>🎂 السن الدقيق: <strong className="text-emerald-300 font-bold font-mono">{p.age} سنة</strong></span>
                          <span>🏛️ المحافظة: <strong className="text-white">{p.governorate}</strong></span>
                          <span>👤 النوع: <strong className="text-white">{p.genderAr}</strong></span>
                          {p.zodiacSign && <span>✨ {p.zodiacSign}</span>}
                        </div>
                      </div>
                    );
                  } else if (regNationalId.length === 14) {
                    return (
                      <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/40 text-[11px] text-red-300 flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                        <span>⚠️ {p.errorMessage}</span>
                      </div>
                    );
                  }
                  return (
                    <div className="text-[10px] text-slate-400 pr-1">
                      متبقي {14 - regNationalId.length} أرقام لاستخراج تاريخ الميلاد والمحافظة تلقائياً
                    </div>
                  );
                })()}

                {/* Preferred Committee */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اللجنة المرغوب الانضمام إليها *
                  </label>
                  <div className="relative">
                    <Layers className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <select
                      value={regPreferredCommId}
                      onChange={e => setRegPreferredCommId(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      {committees.map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bio / Experience */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نبذة عن مهاراتك وخبراتك التطوعية السابقة
                  </label>
                  <textarea
                    rows={2}
                    value={regBio}
                    onChange={e => setRegBio(e.target.value)}
                    placeholder="اكتب باختصار عن شغفك بالعمل التطوعي ولماذا ترغب في الانضمام للاتحاد..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {regLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال طلب الانضمام لاعتماد رئيس الفريق</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. PENDING STATUS SCREEN */}
          {/* ======================================================== */}
          {mode === 'pending_status' && pendingApplicant && (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 inline-block mb-2">
                  ⏳ الطلب قيد المراجعة والاعتماد
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  أهلاً بك يا {pendingApplicant.fullName.split(' ')[0]}!
                </h2>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  تم استلام طلب انضمامك لفريق المتطوعين بنجاح. ملفك الآن قيد المراجعة والاعتماد الرسمي من قبل **رئيس الفريق والقيادة العليا** لاتحاد طلاب جامعة الإسكندرية.
                </p>
              </div>

              {/* Applicant Card Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-right space-y-2 text-xs max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">البريد الإلكتروني:</span>
                  <span className="font-semibold text-sky-400 font-mono">{pendingApplicant.universityEmail}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">الكلية والفرقة:</span>
                  <span className="font-semibold text-slate-200">{pendingApplicant.college} - {pendingApplicant.academicYear}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">اللجنة المرغوبة:</span>
                  <span className="font-semibold text-emerald-400">{pendingApplicant.preferredCommitteeName || pendingApplicant.currentCommitteeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">حالة الاعتماد:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                    بانتظار موافقة رئيس الفريق 🛡️
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={checkPendingStatus}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تحديث وفحص حالة الاعتماد</span>
                </button>
                <button
                  onClick={() => { setMode('login'); setPendingApplicant(null); }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>العودة لصفحة الدخول</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. BANNED / BLACKLISTED STATUS SCREEN */}
          {/* ======================================================== */}
          {mode === 'banned_status' && bannedUserDetails && (
            <div className="text-center py-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center shadow-xl shadow-rose-500/25 animate-bounce">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/40 inline-flex items-center gap-1.5 mb-2 shadow-sm">
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  <span>حساب محظور ومستبعد نهائياً ⛔</span>
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  عذراً، تم إيقاف وحظر هذا الحساب
                </h2>
                <p className="text-xs text-rose-200/90 mt-2 max-w-md mx-auto leading-relaxed bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
                  تم حظر هذا الحساب واستبعاد صاحبه نهائياً من استخدام منصة متطوعي اتحاد طلاب جامعة الإسكندرية بناءً على قرار صادر من القيادة العليا.
                </p>
              </div>

              {/* Banned Info Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-rose-900/60 text-right space-y-2.5 text-xs max-w-md mx-auto shadow-inner">
                {bannedUserDetails.fullName && (
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">الاسم:</span>
                    <span className="font-bold text-white">{bannedUserDetails.fullName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">البريد الإلكتروني المحظور:</span>
                  <span className="font-semibold text-rose-400 font-mono">{bannedUserDetails.email}</span>
                </div>
                <div className="border-b border-slate-800/80 pb-2 space-y-1">
                  <span className="text-slate-400 block">سبب الحظر والاستبعاد:</span>
                  <span className="font-medium text-rose-300 block bg-rose-950/30 p-2 rounded-lg border border-rose-900/30">
                    {bannedUserDetails.reason || 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي'}
                  </span>
                </div>
                {bannedUserDetails.bannedBy && (
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">الجهة المصدرة للقرار:</span>
                    <span className="font-bold text-slate-200">{bannedUserDetails.bannedBy}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الإجراء:</span>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-bold text-[11px] border border-rose-800/50">
                    حظر دائم وشامل (Blacklisted)
                  </span>
                </div>
              </div>

              {/* Switch Account Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => { setMode('login'); setBannedUserDetails(null); }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700 shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>تسجيل الدخول بحساب آخر</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ======================================================== */}
      {/* GOOGLE AUTH ACCOUNT PICKER MODAL */}
      {/* ======================================================== */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm glass-card border border-slate-700 bg-slate-950 p-6 rounded-2xl shadow-2xl space-y-4 text-right">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="font-bold text-sm text-white">تسجيل الدخول عبر Google</span>
              </div>
              <button 
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              أدخل حساب Gmail الخاص بك للدخول المباشر أو التسجيل السريع في المنصة:
            </p>

            {googleError && (
              <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs">
                {googleError}
              </div>
            )}

            <form onSubmit={handleGoogleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  عنوان البريد الإلكتروني (Gmail) *
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={googleEmailInput}
                  onChange={e => setGoogleEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  الاسم بالكامل (اختياري)
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={e => setGoogleNameInput(e.target.value)}
                  placeholder="اسمك الرباعي"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={googleLoading}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {googleLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>متابعة</span>}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 text-center text-slate-500 text-[11px]">
        اتحاد طلاب جامعة الإسكندرية • منصة إدارة العمليات والمتطوعين © 2026/2027
      </div>

    </div>
  );
};
