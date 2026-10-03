import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, Award, Shield, CheckCircle2, Clock, Calendar, 
  Sparkles, FileText, Download, Edit3, MessageSquare, 
  Copy, Check, Heart, BookOpen, Star, AlertCircle, 
  TrendingUp, QrCode, Phone, Mail, GraduationCap, ShieldCheck,
  Layers, Briefcase, FileDown, CheckCircle, DollarSign, CreditCard,
  CheckSquare, X, RefreshCw
} from 'lucide-react';
import { exportAttendanceToExcel, exportSubscriptionDuesToExcel } from '../../utils/excelExport';
import { downloadMemberPortfolioPDF } from '../../utils/pdfExport';
import { getMemberExactBirthData } from '../../utils/nationalId';
import { getWhatsAppUrl, hasValidWhatsApp } from '../../utils/whatsapp';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onOpenPortfolio: () => void;
  onOpenComplaint?: () => void;
  onOpenQRModal?: () => void;
  onSelectTask?: (taskId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  onOpenEditProfile, 
  onOpenPortfolio, 
  onOpenComplaint,
  onOpenQRModal,
  onSelectTask
}) => {
  const { 
    currentUser, tasks, attendanceRecords, badges, branding, 
    isHighLeadership, isHead, members, events, committees,
    subscriptionSettings, updateSubscriptionSettings,
    toggleMemberSubscriptionStatus, updateMemberSubscriptionBadge,
    calculateProfileCompletion
  } = useApp();

  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'attendance' | 'badges'>('overview');
  const [leadershipTab, setLeadershipTab] = useState<'overview' | 'history' | 'committees' | 'authorities'>('overview');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Subscription management state
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [newFeeInput, setNewFeeInput] = useState(subscriptionSettings?.monthlyFeeAmount?.toString() || '50');
  const [customBadgeTextInput, setCustomBadgeTextInput] = useState(currentUser?.subscriptionBadgeText || subscriptionSettings?.defaultBadgeText || 'ما انتا دافع بقى 👑');
  const [subSearchQuery, setSubSearchQuery] = useState('');

  // Calculate profile completion metrics
  const profileCompletion = calculateProfileCompletion(currentUser);

  // Filter personal data
  const myTasks = tasks.filter(t => t.assignedToMemberIds.includes(currentUser.id));
  const myAttendance = attendanceRecords.filter(a => a.memberId === currentUser.id);
  const myBadges = badges.filter(b => currentUser.badges.includes(b.id));

  const copyVolunteerId = () => {
    const idToCopy = currentUser.volunteerId || currentUser.id;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleExportMyAttendance = () => {
    exportAttendanceToExcel(myAttendance, `المتطوع_${currentUser.fullName}`);
  };

  const handleExportDuesExcel = () => {
    exportSubscriptionDuesToExcel(members, subscriptionSettings);
  };

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    try {
      await downloadMemberPortfolioPDF(currentUser, members, branding);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveFee = () => {
    const amount = Number(newFeeInput);
    if (!isNaN(amount) && amount >= 0) {
      updateSubscriptionSettings({ monthlyFeeAmount: amount });
    }
  };

  const handleSaveMyBadgeText = () => {
    if (customBadgeTextInput.trim()) {
      updateMemberSubscriptionBadge(currentUser.id, customBadgeTextInput.trim());
    }
  };

  const totalHours = myAttendance.reduce((acc, curr) => acc + (curr.durationMinutes || 300), 0) / 60;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* 1. Header Profile Banner */}
      <div className="glass-card overflow-hidden border border-blue-500/30 relative">
        <div className="h-32 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold backdrop-blur-md">
              {currentUser.currentCommitteeName}
            </span>
            <span className={`px-3 py-1 rounded-full border text-xs font-extrabold backdrop-blur-md flex items-center gap-1 ${
              isHighLeadership 
                ? 'bg-purple-500/20 border-purple-400/40 text-purple-200' 
                : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
            }`}>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{isHighLeadership ? '👑 قيادة عليا وإشراف عام' : `المستوى ${currentUser.level || 1}`}</span>
            </span>
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-14">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-right">
            <div className="relative group cursor-pointer" onClick={onOpenEditProfile}>
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-800 transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Edit3 className="w-5 h-5 text-sky-400 mb-1" />
                <span className="text-[10px] font-bold">تغيير الصورة</span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-[10px]" title="نشط حالياً">
                ✓
              </span>
            </div>

            <div>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span>{currentUser.fullName}</span>
                  
                  {/* Blue Verified Badge (علامة التوثيق الزرقاء كالفيس بوك) */}
                  {currentUser.isSubscriptionPaid && (
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600/30 border border-blue-400 text-blue-300 text-xs font-bold shadow-md shadow-blue-500/30 cursor-pointer animate-in fade-in"
                      title={currentUser.subscriptionBadgeText || subscriptionSettings?.defaultBadgeText || 'ما انتا دافع بقى 👑'}
                    >
                      <svg className="w-4 h-4 text-blue-400 fill-blue-500" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[11px] font-extrabold text-blue-200">
                        {currentUser.subscriptionBadgeText || subscriptionSettings?.defaultBadgeText || 'ما انتا دافع بقى 👑'}
                      </span>
                    </span>
                  )}
                </h2>
                
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                  {currentUser.position}
                </span>
              </div>

              {/* Unique Volunteer ID Pill */}
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold shadow-inner">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>الرقم التطوعي: {currentUser.volunteerId || currentUser.id}</span>
                  <button
                    onClick={copyVolunteerId}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="نسخ الرقم التطوعي"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
                {copiedId && <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">تم النسخ!</span>}
              </div>

              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 justify-center md:justify-start">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.college} • {currentUser.academicYear}</span>
              </p>

              {/* Interactive Social Media Profile Links Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3 pt-2 border-t border-slate-800/80">
                {hasValidWhatsApp(currentUser.whatsappNumber || currentUser.phone) && (
                  <a
                    href={getWhatsAppUrl(currentUser.whatsappNumber || currentUser.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    title="فتح محادثة واتساب فورية"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>WhatsApp 💬</span>
                  </a>
                )}

                {currentUser.facebookUrl && (
                  <a
                    href={currentUser.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all"
                  >
                    <span>Facebook</span>
                  </a>
                )}

                {currentUser.instagramUrl && (
                  <a
                    href={currentUser.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold transition-all"
                  >
                    <span>Instagram</span>
                  </a>
                )}

                {currentUser.tiktokUrl && (
                  <a
                    href={currentUser.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all"
                  >
                    <span>TikTok</span>
                  </a>
                )}

                {currentUser.linkedinUrl && (
                  <a
                    href={currentUser.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-all"
                  >
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 justify-center">
            <button
              onClick={onOpenEditProfile}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل الملف وروابط السوشيال</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              title="تصدير وتحميل البورتفوليو الرقمي بصيغة PDF فورياً"
            >
              <FileDown className={`w-4 h-4 ${isExportingPDF ? 'animate-bounce text-amber-400' : 'text-sky-400'}`} />
              <span>{isExportingPDF ? 'جاري تجهيز PDF...' : 'تحميل PDF مباشر 📄'}</span>
            </button>

            <button
              onClick={onOpenPortfolio}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer hover:text-white"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>البورتفوليو الرقمي (CV)</span>
            </button>

            <button
              onClick={onOpenComplaint}
              className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>شكوى / مقترح</span>
            </button>
          </div>
        </div>

        {/* Bio Banner */}
        {currentUser.bio && (
          <div className="px-6 pb-4 pt-1 border-t border-slate-800/80 text-right">
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              💬 "{currentUser.bio}"
            </p>
          </div>
        )}
      </div>

      {/* 2. Interactive Profile Completion Progress Card (نسبة استكمال البيانات الشخصية) */}
      <div className="glass-card p-4 sm:p-5 border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 shadow-xl text-right animate-in fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-lg shrink-0 ${
              profileCompletion.percentage === 100 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                : profileCompletion.percentage >= 70
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-blue-500/10'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-amber-500/10'
            }`}>
              {profileCompletion.percentage}%
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                <span>نسبة استكمال الملف الشخصي والبيانات</span>
                {profileCompletion.percentage === 100 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    مكتمل بنسبة 100% ✓
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    بحاجة لاستكمال ({profileCompletion.missingFields.length} بنود متبقية)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {profileCompletion.percentage === 100
                  ? 'كافة بياناتك الشخصية، الأكاديمية، والمهنية مسجلة وموثقة بنجاح في قاعدة بيانات الاتحاد.'
                  : `يتبقى استكمال ${profileCompletion.missingFields.length} حقول من بياناتك للوصول إلى 100% وظهور ملفك بكامل قوته.`}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEditProfile}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 self-end sm:self-center"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{profileCompletion.percentage === 100 ? 'تعديل وتحديث البيانات' : 'استكمال البيانات الآن'}</span>
          </button>
        </div>

        {/* Progress Bar Track */}
        <div className="mt-3.5 w-full bg-slate-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              profileCompletion.percentage === 100 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                : profileCompletion.percentage >= 70
                ? 'bg-gradient-to-r from-blue-500 to-sky-400 shadow-md shadow-blue-500/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-md shadow-amber-500/30'
            }`}
            style={{ width: `${Math.max(5, profileCompletion.percentage)}%` }}
          />
        </div>

        {/* Missing Fields Clickable Chips */}
        {profileCompletion.missingFields.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-semibold">اضغط لاستكمال:</span>
            {profileCompletion.missingFields.map((fieldLabel, idx) => (
              <button
                key={idx}
                onClick={onOpenEditProfile}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-amber-300/90 hover:text-amber-200 border border-amber-500/30 transition-colors cursor-pointer"
              >
                + {fieldLabel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Monthly Subscription & Blue Verified Badge Section (منظومة الاشتراك الشهري والتوثيق الأزرق) */}
      <div className="glass-card p-4 sm:p-5 border border-sky-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/30 text-right shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">منظومة الاشتراك الشهري للفريق</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/30">
                  {subscriptionSettings?.monthlyFeeAmount || 50} {subscriptionSettings?.currency || 'ج.م'} / شهرياً
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                سداد الاشتراك الشهري يمنح العضو علامة التوثيق الزرقاء الرسمية ويدعم أنشطة الاتحاد
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
            {/* Status Pill for Current User */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
              currentUser.isSubscriptionPaid 
                ? 'bg-blue-600/20 border-blue-400 text-blue-300 shadow-md shadow-blue-500/20'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}>
              {currentUser.isSubscriptionPaid ? (
                <>
                  <svg className="w-4 h-4 text-blue-400 fill-blue-500" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <span>مسدد وموثق 👑</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>بانتظار السداد</span>
                </>
              )}
            </div>

            {/* Leadership & Head Action Trigger */}
            {(isHighLeadership || isHead) && (
              <button
                onClick={() => setShowSubscriptionManager(prev => !prev)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>{showSubscriptionManager ? 'إخفاء لوحة الاشتراكات' : 'إدارة الاشتراكات والتسديد'}</span>
              </button>
            )}

            {/* Excel Dues Export Button */}
            {(isHighLeadership || isHead) && (
              <button
                onClick={handleExportDuesExcel}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="تصدير شيت إكسيل شامل لجميع المسددين وغير المسددين"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>شيت الاشتراكات Excel 📊</span>
              </button>
            )}
          </div>
        </div>

        {/* Subscription Info / Payment Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">قيمة الاشتراك الشهري:</span>
            <span className="text-white font-bold font-mono text-sm">{subscriptionSettings?.monthlyFeeAmount || 50} {subscriptionSettings?.currency || 'ج.م'}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">قابل للتعديل من الإدارة العليا فقط</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">طرق السداد المعتمدة:</span>
            <span className="text-emerald-300 font-semibold block">نقداً لمسؤول الموارد البشرية أو إنستاباي</span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{subscriptionSettings?.instapayHandle || 'alexu-volunteers@instapay'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">نص الشارة الزرقاء التوثيقية:</span>
            <span className="text-blue-300 font-bold block">{currentUser.subscriptionBadgeText || subscriptionSettings?.defaultBadgeText || 'ما انتا دافع بقى 👑'}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">يظهر مباشرة بجوار اسمك في المنظومة</span>
          </div>
        </div>

        {/* Expanded Leadership Management Panel */}
        {showSubscriptionManager && (isHighLeadership || isHead) && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
            {/* Top Control Bar for Supreme Leadership */}
            {isHighLeadership && (
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <div>
                    <h5 className="text-xs font-bold text-white">تعديل قيمة الاشتراك الشهري (للإدارة العليا فقط)</h5>
                    <p className="text-[10px] text-purple-300">يتم تطبيق القيمة فوراً على كافة حسابات وشيتات المنظومة</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      value={newFeeInput}
                      onChange={(e) => setNewFeeInput(e.target.value)}
                      className="w-16 bg-transparent text-white font-mono font-bold text-xs text-center focus:outline-none"
                    />
                    <span className="text-slate-400 text-xs font-semibold">{subscriptionSettings?.currency || 'ج.م'}</span>
                  </div>
                  <button
                    onClick={handleSaveFee}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    حفظ القيمة ✓
                  </button>
                </div>
              </div>
            )}

            {/* Custom Badge Text Editor for Current User */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <div>
                  <h5 className="text-xs font-bold text-white">تعديل نص الشارة الزرقاء (ما انتا دافع بقى)</h5>
                  <p className="text-[10px] text-slate-400">النص الذي يظهر أسفل الشارة الزرقاء عند التوثيق</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
                <input
                  type="text"
                  value={customBadgeTextInput}
                  onChange={(e) => setCustomBadgeTextInput(e.target.value)}
                  placeholder="مثال: ما انتا دافع بقى 👑"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSaveMyBadgeText}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  حفظ النص
                </button>
              </div>
            </div>

            {/* Members Subscription Table with Search and Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>سجل سداد الأعضاء والتوثيق ({members.filter(m => m.status === 'Active').length} عضو)</span>
                </h5>
                <input
                  type="text"
                  value={subSearchQuery}
                  onChange={(e) => setSubSearchQuery(e.target.value)}
                  placeholder="بحث باسم العضو أو الكود..."
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none max-w-xs"
                />
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 scrollbar-thin">
                <table className="w-full text-right text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-bold sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">العضو</th>
                      <th className="p-2.5">الكود التطوعي</th>
                      <th className="p-2.5">اللجنة</th>
                      <th className="p-2.5 text-center">حالة السداد</th>
                      <th className="p-2.5 text-center">الإجراء والتوثيق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {members
                      .filter(m => m.status === 'Active')
                      .filter(m => !subSearchQuery || m.fullName.includes(subSearchQuery) || m.volunteerId?.includes(subSearchQuery))
                      .map(member => (
                        <tr key={member.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-2.5 font-semibold text-white flex items-center gap-2">
                            <img src={member.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <span>{member.fullName}</span>
                          </td>
                          <td className="p-2.5 font-mono text-sky-400">{member.volunteerId || '—'}</td>
                          <td className="p-2.5 text-slate-400">{member.currentCommitteeName}</td>
                          <td className="p-2.5 text-center">
                            {member.isSubscriptionPaid ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                                مسدد 👑
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                                غير مسدد ⏳
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => toggleMemberSubscriptionStatus(member.id, !member.isSubscriptionPaid)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                member.isSubscriptionPaid
                                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {member.isSubscriptionPaid ? 'إلغاء التوثيق' : 'تأكيد السداد والتوثيق 👑'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Key Metrics Cards Grid */}
      {isHighLeadership ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 border-purple-500/20 bg-purple-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-purple-300 font-bold">الصفة التنظيمية</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-lg font-black text-white">{currentUser.position || 'مستشار الفريق'}</span>
            </div>
            <span className="text-[10px] text-purple-300/80 mt-2">
              👑 قيادة عليا وإشراف عام شامل
            </span>
          </div>

          <div className="glass-card p-4 border-blue-500/20 bg-blue-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-300 font-bold">الصلاحيات المركزية</span>
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-white">إدارة كاملة</span>
            </div>
            <span className="text-[10px] text-sky-300/80 mt-2">
              اعتماد المتطوعين، اللجان، وتعيين الأدوار
            </span>
          </div>

          <div className="glass-card p-4 border-emerald-500/20 bg-emerald-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 font-bold">إجمالي المتطوعين تحت الإشراف</span>
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">{members.filter(m => m.status === 'Active').length}</span>
              <span className="text-xs text-slate-400 mr-1">عضو نشط</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 mt-2">
              متابعة الـ 6 لجان تخصصية
            </span>
          </div>

          <div className="glass-card p-4 border-amber-500/20 bg-amber-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-300 font-bold">الفعاليات المعتمدة</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">{events.length}</span>
              <span className="text-xs text-slate-400 mr-1">فعالية</span>
            </div>
            <span className="text-[10px] text-amber-400/80 mt-2">
              موسم 2026/2027
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: XP & Points */}
          <div className="glass-card p-4 border-amber-500/20 bg-amber-950/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-300 font-bold">نقاط التطوع (XP)</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">{currentUser.points || 0}</span>
              <span className="text-xs text-slate-400 mr-1">نقطة</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full"
                style={{ width: `${Math.min(100, ((currentUser.points % 150) / 150) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 text-left">
              باقي {150 - (currentUser.points % 150)} للترقية
            </span>
          </div>

          {/* Metric 2: Attendance Rate */}
          <div className="glass-card p-4 border-blue-500/20 bg-blue-950/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-300 font-bold">نسبة الالتزام الميداني</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">{currentUser.performance?.attendanceRate || 0}%</span>
              <span className="text-xs text-slate-400 mr-1">({totalHours.toFixed(1)} ساعة)</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${currentUser.performance?.attendanceRate || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-400 mt-1">
              {myAttendance.length} فعاليات مسجلة بـ QR
            </span>
          </div>

          {/* Metric 3: Tasks Completed */}
          <div className="glass-card p-4 border-emerald-500/20 bg-emerald-950/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 font-bold">إنجاز المهام</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">
                {myTasks.filter(t => t.status === 'Approved').length}
              </span>
              <span className="text-xs text-slate-400 mr-1">من أصل {myTasks.length} مهمة</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${myTasks.length > 0 ? (myTasks.filter(t => t.status === 'Approved').length / myTasks.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              معدل الجودة: {currentUser.performance?.taskQuality || 0}/5.0
            </span>
          </div>

          {/* Metric 4: Overall Rating */}
          <div className="glass-card p-4 border-purple-500/20 bg-purple-950/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-purple-300 font-bold">التقييم الشامل الموحد</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">{currentUser.performance?.overallScore || 0}%</span>
              <span className="text-xs text-slate-400 mr-1">تقييم معتمد</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${currentUser.performance?.overallScore || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {currentUser.performance?.evaluationsCount || 0} تقييم مسجل
            </span>
          </div>
        </div>
      )}

      {/* 3. Digital ID Card + Hobbies & Aspirations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Digital ID Badge Card (1 Col) */}
        <div className="glass-card p-5 border border-sky-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/50 flex flex-col justify-between text-right relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden border border-blue-500/30">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="شعار اتحاد طلاب جامعة الإسكندرية" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-blue-600 text-xs">AU</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">بطاقة الهوية التطوعية</h4>
                  <p className="text-[10px] text-slate-400">{branding.subtitle || 'اتحاد طلاب جامعة الإسكندرية'}</p>
                </div>
              </div>
              <QrCode className="w-5 h-5 text-sky-400" />
            </div>

            <div className="flex items-center gap-3.5 my-4 bg-slate-900/90 p-3.5 rounded-2xl border border-amber-500/30 shadow-lg">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl bg-slate-950 shrink-0">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent py-0.5 text-center">
                  <span className="text-[8px] font-bold text-amber-300 font-mono tracking-wider">ID PHOTO</span>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-white text-sm">{currentUser.fullName}</p>
                <p className="font-mono text-sky-400 text-[11px] font-bold">{currentUser.volunteerId || currentUser.id}</p>
                <p className="text-[10px] text-slate-300 font-semibold">{currentUser.currentCommitteeName}</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>عضوية معتمدة وموثقة</span>
                </span>
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الرقم القومي:</span>
                <span className="font-mono">{currentUser.nationalId || '—'}</span>
              </div>
              {(() => {
                const userBirth = getMemberExactBirthData(currentUser);
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">تاريخ الميلاد والسن:</span>
                      <span className="font-mono text-slate-200">{userBirth.formattedFullDate} ({userBirth.currentAge} سنة)</span>
                    </div>
                    {userBirth.governorate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">المحافظة:</span>
                        <span className="text-slate-300">محافظة {userBirth.governorate}</span>
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">البريد الجامعي:</span>
                <span className="font-mono text-[10px]">{currentUser.universityEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الواتساب:</span>
                {hasValidWhatsApp(currentUser.whatsappNumber || currentUser.phone) ? (
                  <a
                    href={getWhatsAppUrl(currentUser.whatsappNumber || currentUser.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    title="فتح محادثة واتساب فورية"
                  >
                    <span>{currentUser.whatsappNumber || currentUser.phone}</span>
                    <span className="text-[10px]">💬</span>
                  </a>
                ) : (
                  <span className="font-mono text-slate-400">{currentUser.whatsappNumber || '—'}</span>
                )}
              </div>
            </div>

            {/* Official Student Union Stamp Badge */}
            <div className="mt-3 p-2 rounded-xl bg-slate-950/70 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-slate-900 border border-amber-500/50 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  <img 
                    src={branding.stampUrl || '/stamp.png'} 
                    alt="ختم الاتحاد" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-300 block">مختوم ومعتمد رسمياً</span>
                  <span className="text-[9px] text-slate-400">اتحاد طلاب جامعة الإسكندرية</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                2026/2027 ✓
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>تاريخ الانضمام: {currentUser.joinDate}</span>
            <span className="text-blue-400 font-semibold">جامعة الإسكندرية</span>
          </div>
        </div>

        {/* Hobbies & Learning Aspirations (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between text-right">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">الهوايات، الشغف، وتطلعات التعلم</h3>
              </div>
              <button
                onClick={onOpenEditProfile}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل الوسوم</span>
              </button>
            </div>

            {/* Hobbies Chips */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>الهوايات ومجالات الاهتمام المفضلة:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {currentUser.hobbies && currentUser.hobbies.length > 0 ? (
                  currentUser.hobbies.map((hobby, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <span>🎯</span>
                      <span>{hobby}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">لم يتم إضافة هوايات بعد. اضغط تعديل لإضافتها!</span>
                )}
              </div>
            </div>

            {/* Learning Aspirations Chips */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>تطلعات التعلم والمهام المرغوب التدرب عليها:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {currentUser.learningAspirations && currentUser.learningAspirations.length > 0 ? (
                  currentUser.learningAspirations.map((asp, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <span>🚀</span>
                      <span>{asp}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">لم يتم إضافة مهارات للتعلم بعد.</span>
                )}
              </div>
            </div>

            {/* Certified Skills & Certificates Badges (المهارات المعتمدة والشهادات) */}
            <div>
              <span className="text-xs font-bold text-amber-300 block mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>المهارات المعتمدة والشهادات الموثقة ({currentUser.certifiedSkills?.length || 0}):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentUser.certifiedSkills && currentUser.certifiedSkills.length > 0 ? (
                  currentUser.certifiedSkills.map((cSkill) => (
                    <div 
                      key={cSkill.id}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between space-y-1 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-white text-xs">{cSkill.skillName}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono shrink-0">
                          {cSkill.issueDate}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 flex items-center gap-1">
                        <span>🏛️ {cSkill.provider}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sm:col-span-2 text-xs text-slate-500 italic p-2 rounded-lg bg-slate-900/30 border border-slate-800">
                    لم تقم بإضافة شهادات أو مهارات معتمدة بعد. اضغط "تعديل الوسوم" لإضافتها وتوثيق الجهة وتاريخ الحصول عليها!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Match Note */}
          <div className="mt-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />
            <p className="text-xs text-indigo-200">
              💡 <strong>الربط الذكي:</strong> تُستخدم وسوم اهتماماتك والشهادات المعتمدة تلقائياً لترشيحك للمهام القيادية والفعاليات الأنسب لشغفك ومهاراتك.
            </p>
          </div>
        </div>

      </div>

      {/* 4. Tab Navigation Bar */}
      {isHighLeadership ? (
        <div className="flex flex-wrap rounded-2xl bg-slate-900/80 p-1.5 border border-purple-500/30 gap-1">
          <button
            onClick={() => setLeadershipTab('overview')}
            className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              leadershipTab === 'overview' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>الملف الإداري والقيادي</span>
          </button>
          <button
            onClick={() => setLeadershipTab('history')}
            className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              leadershipTab === 'history' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>السجل التاريخي والمسيرة</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">{currentUser.committeeHistory?.length || 0}</span>
          </button>
          <button
            onClick={() => setLeadershipTab('committees')}
            className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              leadershipTab === 'committees' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>اللجان والفعاليات المشرف عليها</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">{committees.length}</span>
          </button>
          <button
            onClick={() => setLeadershipTab('authorities')}
            className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              leadershipTab === 'authorities' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>الصلاحيات والبروتوكول المركزي</span>
          </button>
        </div>
      ) : (
        <div className="flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            نظرة عامة والمهارات
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>سجل مهامي</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">{myTasks.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>سجل الحضور والانصراف</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">{myAttendance.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'badges' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>الأوسمة والشهادات</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">{myBadges.length}</span>
          </button>
        </div>
      )}

      {/* 5. Tab Contents */}

      {/* High Leadership Tab Contents */}
      {isHighLeadership ? (
        <div className="space-y-6">
          
          {/* Leadership Tab 1: Executive Overview */}
          {leadershipTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              {/* Executive Credentials */}
              <div className="glass-card p-5 border-purple-500/30 bg-purple-950/10 space-y-4">
                <h4 className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>بيانات الصفة الإشرافية والاعتماد الرسمي</span>
                </h4>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">المنصب الرسمي:</span>
                    <span className="font-bold text-white">{currentUser.position || 'مستشار الفريق'}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">الجهة التابع لها:</span>
                    <span className="font-bold text-amber-300">اتحاد طلاب جامعة الإسكندرية</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">نطاق الإشراف:</span>
                    <span className="font-bold text-emerald-400">إشراف كلي وشامل على جميع اللجان والعمليات</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">الموسم التشغيلي:</span>
                    <span className="font-bold text-sky-400 font-mono">2026 / 2027</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/30 text-[11px] text-purple-200">
                  👑 <strong>المظلة الإدارية:</strong> بصفتك عضواً في القيادة العليا، ملفك التعريفي هو وثيقة اعتماد رسمي للقرارات والشهادات الصادرة من المنظومة.
                </div>
              </div>

              {/* Leadership Competencies */}
              <div className="glass-card p-5 border-blue-500/30 space-y-4">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span>الكفاءات القيادية والاستراتيجية المعتمدة</span>
                </h4>
                <div className="space-y-3">
                  {currentUser.skills && Object.keys(currentUser.skills).length > 0 ? (
                    Object.entries(currentUser.skills).map(([skill, score], i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium">{skill}</span>
                          <span className="text-sky-400 font-bold font-mono">{score} / 5</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-sky-400 h-full rounded-full"
                            style={{ width: `${(score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-3 text-center">
                      كفاءات قيادية وإشراف استراتيجي شامل
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Leadership Tab 2: Career History & Milestones */}
          {leadershipTab === 'history' && (
            <div className="glass-card p-5 border-slate-800 text-right space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">السجل التاريخي والترقيات والمسيرة القيادية</h4>
                  <p className="text-[11px] text-slate-400">توثيق المحطات القيادية واللجان ومسيرة التطوع السابقة</p>
                </div>
                <button
                  onClick={onOpenEditProfile}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل وإضافة محطات</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentUser.committeeHistory && currentUser.committeeHistory.length > 0 ? (
                  currentUser.committeeHistory.map((hist, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{hist.role}</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                            {hist.committeeName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                            {hist.season}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{hist.reason}</p>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {hist.startDate} حتى {hist.endDate}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <p className="font-bold text-white">{currentUser.currentCommitteeName} — {currentUser.position}</p>
                    <p className="text-[11px] text-slate-400 mt-1">عضوية قيادية نشطة منذ {currentUser.joinDate}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leadership Tab 3: Supervised Committees & Events */}
          {leadershipTab === 'committees' && (
            <div className="space-y-6 text-right">
              {/* Committees Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {committees.map(comm => (
                  <div key={comm.id} className="glass-card p-4 border-slate-800 hover:border-blue-500/40 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{comm.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {comm.code}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">رئيس اللجنة:</span>
                        <span className="font-semibold text-white">{comm.headName || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">نائب رئيس اللجنة:</span>
                        <span className="font-semibold text-white">{comm.viceName || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">عدد الأعضاء:</span>
                        <span className="font-bold text-emerald-400 font-mono">{comm.memberCount} عضو</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Events List Under Supervision */}
              <div className="glass-card p-5 border-slate-800 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>الفعاليات المعتمدة للموسم الحالي ({events.length})</span>
                </h4>
                {events.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4 bg-slate-900/40 rounded-xl border border-slate-800">
                    لا توجد فعاليات مسجلة حالياً. عند إطلاق فعاليات جديدة ستظهر هنا وفي غرفة العمليات.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {events.map(ev => (
                      <div key={ev.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white">{ev.name}</p>
                          <p className="text-[11px] text-slate-400">{ev.location} • {ev.date}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {ev.status === 'Live' ? 'جارية الآن 🟢' : 'معتمدة'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leadership Tab 4: Central Authorities & Protocol */}
          {leadershipTab === 'authorities' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
              <div className="glass-card p-4 border-purple-500/30 bg-purple-950/10 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>اعتماد وقبول المتطوعين</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  مراجعة طلبات الانضمام المعلقة، تعيين اللجان والأدوار الرسمية وتوليد الأكواد التطوعية المعتمدة.
                </p>
              </div>

              <div className="glass-card p-4 border-blue-500/30 bg-blue-950/10 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>إدارة وهيكلة اللجان</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  تأسيس اللجان التخصصية، تعيين رؤساء اللجان ونوابهم وتحديد الأهداف والمسؤوليات التشغيلية.
                </p>
              </div>

              <div className="glass-card p-4 border-emerald-500/30 bg-emerald-950/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>إطلاق الفعاليات وغرفة العمليات</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  بدء وإغلاق الفعاليات الميدانية، متابعة البث المباشر الميداني للقطاعات وجلسات التحضير بالـ QR.
                </p>
              </div>

              <div className="glass-card p-4 border-rose-500/30 bg-rose-950/10 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>القرارات التأديبية والقائمة السوداء</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  حظر واستبعاد المخالفين للائحة التنظيمية وتطبيق قرارات التصفية وحظر الدخول للمنظومة نهائياً.
                </p>
              </div>

              <div className="glass-card p-4 border-amber-500/30 bg-amber-950/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>إصدار الوثائق والشهادات</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  اعتماد الشهادات والمستندات بختم اتحاد طلاب جامعة الإسكندرية وتوقيعات القيادة العليا الحية.
                </p>
              </div>

              <div className="glass-card p-4 border-sky-500/30 bg-sky-950/10 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>التخصيص والتحكم المركزي</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  التحكم في الهوية البصرية، الشعار، الختم، شريط الأخبار التفاعلي وإعدادات التنبيهات الصوتية.
                </p>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Regular Volunteer Tab Contents */
        <div>
          {/* Tab 1: Overview & Skills */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              
              {/* Skills Breakdown */}
              <div className="glass-card p-5">
                <h4 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span>مصفوفة المهارات والكفاءات المعتمدة</span>
                </h4>
                <div className="space-y-3">
                  {currentUser.skills && Object.keys(currentUser.skills).length > 0 ? (
                    Object.entries(currentUser.skills).map(([skill, score], i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium">{skill}</span>
                          <span className="text-sky-400 font-bold font-mono">{score} / 5</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full"
                            style={{ width: `${(score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">لا توجد مهارات مسجلة بعد</p>
                  )}
                </div>
              </div>

              {/* Committee History Log */}
              <div className="glass-card p-5">
                <h4 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>السجل التاريخي للترقيات واللجان</span>
                </h4>
                <div className="space-y-3">
                  {currentUser.committeeHistory && currentUser.committeeHistory.length > 0 ? (
                    currentUser.committeeHistory.map((hist, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-bold text-white">{hist.committeeName} — {hist.role}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{hist.reason}</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            {hist.startDate} حتى {hist.endDate} ({hist.season})
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <p className="font-bold text-white">{currentUser.currentCommitteeName} — {currentUser.position}</p>
                      <p className="text-[11px] text-slate-400 mt-1">عضوية نشطة منذ {currentUser.joinDate}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: My Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 text-right">
              {myTasks.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-400 text-xs">
                  لا توجد مهام مسندة إليك حالياً.
                </div>
              ) : (
                myTasks.map(task => (
                  <div key={task.id} className="glass-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-slate-800 hover:border-slate-700 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          task.priority === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {task.priority === 'Critical' ? 'حرجة جداً' : task.priority === 'High' ? 'أولوية عالية' : 'عادية'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{task.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">{task.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>الموعد النهائي: {task.deadline}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">+{task.xpReward} XP</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        task.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        task.status === 'Submitted' ? 'bg-amber-500/20 text-amber-400' :
                        task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {task.status === 'Approved' ? 'تم الاعتماد ✓' :
                         task.status === 'Submitted' ? 'قيد المراجعة' :
                         task.status === 'In Progress' ? 'جاري التنفيذ' : 'مسندة'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: My Attendance History */}
          {activeTab === 'attendance' && (
            <div className="glass-card p-5 text-right space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">سجل الحضور والانصراف الميداني المعتمد</h4>
                  <p className="text-[11px] text-slate-400">توثيق دقيق بمواعيد تسجيل الدخول والخروج وعدد الساعات الفعلية</p>
                </div>
                <button
                  onClick={handleExportMyAttendance}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer hover:text-white"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>تصدير سجلي (Excel)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 pb-2">
                      <th className="py-2.5 font-bold">الفعالية / اليوم</th>
                      <th className="py-2.5 font-bold">التاريخ</th>
                      <th className="py-2.5 font-bold">تسجيل الحضور (Check-in)</th>
                      <th className="py-2.5 font-bold">تسجيل الانصراف (Check-out)</th>
                      <th className="py-2.5 font-bold">إجمالي الساعات</th>
                      <th className="py-2.5 font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                          لا توجد سجلات حضور مسجلة حتى الآن
                        </td>
                      </tr>
                    ) : (
                      myAttendance.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-900/40">
                          <td className="py-3 font-bold text-white">{rec.eventName}</td>
                          <td className="py-3 text-slate-300 font-mono">{rec.date}</td>
                          <td className="py-3 text-emerald-400 font-mono">{rec.checkInTime || '—'}</td>
                          <td className="py-3 text-sky-400 font-mono">{rec.checkOutTime || '—'}</td>
                          <td className="py-3 text-slate-300 font-mono">{rec.durationFormatted || '5 ساعات'}</td>
                          <td className="py-3">
                            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                              {rec.status === 'Present' ? 'حاضر' : rec.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Badges Showcase */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
              {myBadges.map(badge => (
                <div key={badge.id} className="glass-card p-5 border-amber-500/30 bg-amber-950/10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-lg">
                    {badge.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{badge.titleAr}</h4>
                      <span className="text-[10px] font-bold text-amber-400">+{badge.xpReward} XP</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{badge.description}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">المعيار: {badge.criteria}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
