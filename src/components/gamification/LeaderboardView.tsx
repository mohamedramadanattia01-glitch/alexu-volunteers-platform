import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BadgeItem, Member } from '../../types';
import { 
  Trophy, Award, Flame, Star, Crown, Medal, Sparkles, 
  Plus, Edit2, Trash2, X, Check, Zap, HeartHandshake, 
  Shield, Camera, Palette, FileText, Target, Users, BookOpen, 
  Heart, Gem, Activity, Compass, ShieldCheck, Download, FileSpreadsheet,
  ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { exportMembersToExcel } from '../../utils/excelExport';

export const LeaderboardView: React.FC = () => {
  const { members, badges, headEvaluations, currentUser, isHighLeadership, addBadge, updateBadge, deleteBadge } = useApp();

  const [activeBoard, setActiveBoard] = useState<'members' | 'heads'>('members');
  const [period, setPeriod] = useState<'monthly' | 'season'>('season');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);

  const [badgeForm, setBadgeForm] = useState({
    titleAr: '',
    titleEn: '',
    category: 'Commitment',
    icon: 'Award',
    description: '',
    criteria: '',
    xpReward: 30
  });

  // Icon visual resolver
  const renderBadgeVisual = (badge: BadgeItem) => {
    const iconKey = (badge.icon || '').toLowerCase();
    
    if (iconKey === 'award' || iconKey.includes('award')) {
      return <Award className="w-6 h-6 text-amber-400" />;
    }
    if (iconKey === 'star' || iconKey.includes('star')) {
      return <Star className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />;
    }
    if (iconKey === 'zap' || iconKey.includes('zap')) {
      return <Zap className="w-6 h-6 text-sky-400" />;
    }
    if (iconKey === 'crown' || iconKey.includes('crown')) {
      return <Crown className="w-6 h-6 text-amber-300" />;
    }
    if (iconKey === 'hearthandshake' || iconKey.includes('heart')) {
      return <HeartHandshake className="w-6 h-6 text-emerald-400" />;
    }
    if (iconKey === 'flame' || iconKey.includes('flame') || iconKey.includes('fire')) {
      return <Flame className="w-6 h-6 text-rose-400" />;
    }
    if (iconKey === 'shield' || iconKey.includes('shield')) {
      return <ShieldCheck className="w-6 h-6 text-blue-400" />;
    }
    if (iconKey === 'camera' || iconKey.includes('camera') || iconKey.includes('video')) {
      return <Camera className="w-6 h-6 text-purple-400" />;
    }
    if (iconKey === 'palette' || iconKey.includes('design') || iconKey.includes('art')) {
      return <Palette className="w-6 h-6 text-cyan-400" />;
    }
    if (iconKey === 'filetext' || iconKey.includes('content') || iconKey.includes('write')) {
      return <FileText className="w-6 h-6 text-orange-400" />;
    }
    if (iconKey === 'trophy' || iconKey.includes('trophy')) {
      return <Trophy className="w-6 h-6 text-amber-400" />;
    }
    if (iconKey === 'gem' || iconKey.includes('gem')) {
      return <Gem className="w-6 h-6 text-pink-400" />;
    }
    if (iconKey === 'target' || iconKey.includes('target')) {
      return <Target className="w-6 h-6 text-rose-400" />;
    }

    if (/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/.test(badge.icon)) {
      return <span className="text-2xl">{badge.icon}</span>;
    }

    return <Award className="w-6 h-6 text-amber-400" />;
  };

  // Filter ONLY regular members (strictly excluding Heads, Vice Heads, and High Leadership)
  const rankedMembers = [...members]
    .filter(m => m.status === 'Active' && m.role === 'member')
    .sort((a, b) => b.points - a.points);

  // Filter ONLY Committee Heads and Vice Heads (sorted by real headEvaluations)
  const rankedHeads = [...members]
    .filter(m => m.status === 'Active' && (m.role === 'head' || m.role === 'vice_head'))
    .map(head => {
      const evals = headEvaluations.filter(e => e.headId === head.id);
      const evalScore = evals.length > 0 
        ? Math.round(evals.reduce((a, b) => a + b.percentage, 0) / evals.length)
        : (head.performance?.overallScore || 0);
      return { ...head, dynamicScore: evalScore };
    })
    .sort((a, b) => (b.dynamicScore - a.dynamicScore) || (b.points - a.points));

  const handleOpenNewBadge = () => {
    setEditingBadge(null);
    setBadgeForm({
      titleAr: '',
      titleEn: '',
      category: 'Commitment',
      icon: '🏅',
      description: '',
      criteria: '',
      xpReward: 30
    });
    setShowBadgeModal(true);
  };

  const handleOpenEditBadge = (badge: BadgeItem) => {
    setEditingBadge(badge);
    setBadgeForm({
      titleAr: badge.titleAr || badge.title,
      titleEn: badge.title || '',
      category: badge.category,
      icon: badge.icon,
      description: badge.description,
      criteria: badge.criteria,
      xpReward: badge.xpReward
    });
    setShowBadgeModal(true);
  };

  const handleSaveBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeForm.titleAr) return;

    const payload: Omit<BadgeItem, 'id'> = {
      title: badgeForm.titleEn || badgeForm.titleAr,
      titleAr: badgeForm.titleAr,
      category: badgeForm.category,
      icon: badgeForm.icon,
      description: badgeForm.description,
      criteria: badgeForm.criteria,
      xpReward: badgeForm.xpReward
    };

    if (editingBadge) {
      updateBadge(editingBadge.id, payload);
    } else {
      addBadge(payload);
    }
    setShowBadgeModal(false);
  };

  const activeRankList = activeBoard === 'members' ? rankedMembers : rankedHeads;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-amber-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
              التحفيز والجاميفيكيشن والتميز الميداني
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>لوحة شرف ورتب متطوعي جامعة الإسكندرية</span>
            <Trophy className="w-6 h-6 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            نقاط التميز XP، الرتب، الأوسمة، وترتيب الأبطال الأكثر التزاماً وتأثيراً
          </p>
        </div>

        {/* Board & Period Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {isHighLeadership && (
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveBoard('members')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeBoard === 'members' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                لوحة شرف الأعضاء
              </button>
              <button
                onClick={() => setActiveBoard('heads')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeBoard === 'heads' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>شرف رؤساء اللجان (القيادة)</span>
              </button>
            </div>
          )}

          <button
            onClick={() => exportMembersToExcel(members, activeBoard === 'members' ? 'أعضاء' : 'قيادات', activeBoard === 'members' ? 'members_only' : 'heads_only')}
            className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="تصدير جدول الترتيب إلى Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تصدير الترتيب (Excel)</span>
          </button>
        </div>
      </div>

      {/* Podium Top 3 or Empty State */}
      {activeRankList.length === 0 ? (
        <div className="glass-card p-8 border-slate-800 bg-slate-900/60 text-center rounded-2xl">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            {activeBoard === 'heads' ? 'لا يوجد رؤساء لجان مسجلين حالياً' : 'لا يوجد متطوعين مسجلين في لوحة الشرف حالياً'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeBoard === 'heads' 
              ? 'سيظهر تصنيف رؤساء ونواب اللجان هنا فور تعيينهم وتقييم أدائهم القيادي من قِبل الإدارة العليا.' 
              : 'سيظهر ترتيب المتطوعين وأبطال الموسم فور تسجيل الأعضاء الجدد واعتمادهم وإنجاز المهام.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
          
          {/* 2nd Place */}
          {activeRankList[1] && (
            <div className="glass-card p-5 border-slate-700 bg-slate-900/80 text-center order-2 md:order-1 relative">
              <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow-lg">
                2
              </div>
              <img src={activeRankList[1].avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-slate-300" />
              <h3 className="text-sm font-bold text-white">{activeRankList[1].fullName}</h3>
              <p className="text-[11px] text-slate-400">{activeRankList[1].currentCommitteeName} • {activeRankList[1].position}</p>
              <div className="mt-2 font-mono font-extrabold text-amber-400 text-base">{activeRankList[1].points} XP</div>
            </div>
          )}

          {/* 1st Place Champion */}
          {activeRankList[0] && (
            <div className="glass-card p-6 border-2 border-amber-400 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 text-center order-1 md:order-2 shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-lg">
                <Crown className="w-3.5 h-3.5" />
                <span>{activeBoard === 'heads' ? 'القائد المتميز الأول 👑' : 'بطل المتطوعين 🥇'}</span>
              </div>
              <img src={activeRankList[0].avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-2 border-2 border-amber-400 shadow-xl mt-2" />
              <h3 className="text-base font-extrabold text-white">{activeRankList[0].fullName}</h3>
              <p className="text-xs text-amber-300">{activeRankList[0].currentCommitteeName} • {activeRankList[0].position}</p>
              <div className="mt-2 font-mono font-black text-amber-400 text-xl">{activeRankList[0].points} XP</div>
            </div>
          )}

          {/* 3rd Place */}
          {activeRankList[2] && (
            <div className="glass-card p-5 border-amber-900/60 bg-slate-900/80 text-center order-3 relative">
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-3 shadow-lg">
                3
              </div>
              <img src={activeRankList[2].avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-amber-700" />
              <h3 className="text-sm font-bold text-white">{activeRankList[2].fullName}</h3>
              <p className="text-[11px] text-slate-400">{activeRankList[2].currentCommitteeName} • {activeRankList[2].position}</p>
              <div className="mt-2 font-mono font-extrabold text-amber-400 text-base">{activeRankList[2].points} XP</div>
            </div>
          )}

        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">
            {activeBoard === 'heads' ? '👑 الترتيب القيادي لرؤساء ونواب اللجان' : 'الترتيب الشامل للأعضاء المتطوعين'}
          </h3>
          <span className="text-xs text-slate-400">إجمالي المنافسين: {activeRankList.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5 font-bold">المركز</th>
                <th className="py-2.5 font-bold">{activeBoard === 'heads' ? 'المسؤول القيادي' : 'المتطوع'}</th>
                <th className="py-2.5 font-bold">اللجنة</th>
                <th className="py-2.5 font-bold">المستوى</th>
                {activeBoard === 'heads' ? (
                  <>
                    <th className="py-2.5 font-bold text-purple-400">مؤشر القيادة</th>
                    <th className="py-2.5 font-bold">إنجاز المهام</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 font-bold">الأوسمة</th>
                    <th className="py-2.5 font-bold">الأداء الشامل</th>
                  </>
                )}
                <th className="py-2.5 font-bold">النقاط (XP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeRankList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    لا توجد بيانات مسجلة في هذا التصنيف حالياً
                  </td>
                </tr>
              ) : (
                activeRankList.map((m, idx) => (
                  <tr key={m.id} className={`hover:bg-slate-800/40 transition-all ${m.id === currentUser.id ? 'bg-blue-950/40 font-bold' : ''}`}>
                    <td className="py-3 font-bold font-mono">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                        idx === 0 ? 'bg-amber-400 text-slate-950 font-black' :
                        idx === 1 ? 'bg-slate-300 text-slate-950 font-black' :
                        idx === 2 ? 'bg-amber-700 text-white font-black' : 'text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 flex items-center gap-2">
                      <img src={m.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">{m.fullName}</span>
                        <span className="text-[10px] text-sky-400 font-mono">{m.volunteerId}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">{m.currentCommitteeName}</td>
                    <td className="py-3 font-mono text-amber-400">Lv.{m.level}</td>
                    {activeBoard === 'heads' ? (
                      <>
                        <td className="py-3 font-mono text-purple-400 font-bold">{m.performance?.leadership || 88}%</td>
                        <td className="py-3 font-mono text-emerald-400">{m.performance?.taskCompletionRate || 92}%</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 text-slate-300">{m.badges.length} أوسمة</td>
                        <td className="py-3 font-mono text-emerald-400">{m.performance.overallScore}%</td>
                      </>
                    )}
                    <td className="py-3 font-mono font-extrabold text-amber-400">{m.points} XP</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badges Catalog & Management */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>كتالوج الأوسمة والشارات المعتمدة (Badges Directory)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              الأوسمة الرسمية الممنوحة لأبطال العمل الميداني والأنشطة الطلابية
            </p>
          </div>

          {isHighLeadership && (
            <button
              onClick={handleOpenNewBadge}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة وسام جديد</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map(badge => (
            <div key={badge.id} className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex items-start justify-between gap-3 relative group hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10">
                  {renderBadgeVisual(badge)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{badge.titleAr}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{badge.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      +{badge.xpReward} XP
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">
                      {badge.category}
                    </span>
                  </div>
                  {badge.criteria && (
                    <div className="text-[9px] text-slate-500 mt-1">المعيار: {badge.criteria}</div>
                  )}
                </div>
              </div>

              {isHighLeadership && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditBadge(badge)}
                    className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    title="تعديل الوسام"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تعديل</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف وسام "${badge.titleAr}" نهائياً من المنظومة وسحبه من كافة الأعضاء؟`)) {
                        deleteBadge(badge.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    title="حذف الوسام"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">حذف</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Badge Editor Modal for High Leadership */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-slate-950 border-slate-800 p-6 max-w-md w-full rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingBadge ? 'تعديل بيانات الوسام' : 'إضافة وسام / شارة جديدة'}
                </h3>
              </div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBadge} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الوسام بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: وسام قائد الميدان"
                  value={badgeForm.titleAr}
                  onChange={e => setBadgeForm({ ...badgeForm, titleAr: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الأيقونة / الرمز</label>
                  <input
                    type="text"
                    placeholder="مثال: 👑 أو 🚀"
                    value={badgeForm.icon}
                    onChange={e => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">نقاط المكافأة (XP)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={badgeForm.xpReward}
                    onChange={e => setBadgeForm({ ...badgeForm, xpReward: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الوصف المختصر</label>
                <input
                  type="text"
                  placeholder="وصف الشارة وما تمثله"
                  value={badgeForm.description}
                  onChange={e => setBadgeForm({ ...badgeForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">معيار الاستحقاق</label>
                <input
                  type="text"
                  placeholder="مثال: إنجاز 10 مهام ميدانية بدرجة ممتازة"
                  value={badgeForm.criteria}
                  onChange={e => setBadgeForm({ ...badgeForm, criteria: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>حفظ الوسام</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
