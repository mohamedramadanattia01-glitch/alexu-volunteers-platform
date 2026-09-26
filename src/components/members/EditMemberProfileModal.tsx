import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, CommitteeHistoryItem, CertifiedSkillItem } from '../../types';
import { 
  X, User, Upload, Sparkles, Heart, GraduationCap, 
  Plus, Check, Phone, FileText, Camera, Lock,
  ShieldCheck, MapPin, AlertCircle, HeartHandshake,
  History, Award, Trash2, Calendar, Link as LinkIcon,
  Crown, Flame, Star, Trophy, Shield
} from 'lucide-react';
import { ALEXANDRIA_UNIVERSITY_COLLEGES } from '../../data/colleges';
import { parseEgyptianNationalId, normalizeNumerals } from '../../utils/nationalId';

interface EditMemberProfileModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export const EditMemberProfileModal: React.FC<EditMemberProfileModalProps> = ({
  member,
  isOpen,
  onClose
}) => {
  const { updateMemberSelfProfile, isHighLeadership, badges: masterBadges } = useApp();

  // High Leadership Exclusive Admin Fields
  const [adminPoints, setAdminPoints] = useState<number>(member.points || 0);
  const [adminLevel, setAdminLevel] = useState<number>(member.level || 1);
  const [adminBadges, setAdminBadges] = useState<string[]>(member.badges || []);
  const [adminOverallScore, setAdminOverallScore] = useState<number>(member.performance?.overallScore || 0);
  const [adminAttendanceRate, setAdminAttendanceRate] = useState<number>(member.performance?.attendanceRate || 100);
  const [adminTaskQuality, setAdminTaskQuality] = useState<number>(member.performance?.taskQuality || 0);

  const toggleBadge = (badgeId: string) => {
    setAdminBadges(prev => 
      prev.includes(badgeId) ? prev.filter(id => id !== badgeId) : [...prev, badgeId]
    );
  };

  // Personal Official Data
  const [fullName, setFullName] = useState(member.fullName || '');
  const [nationalId, setNationalId] = useState(member.nationalId || '');
  const [phone, setPhone] = useState(member.phone || member.whatsappNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(member.whatsappNumber || member.phone || '');
  const [college, setCollege] = useState(member.college || 'كلية الهندسة');
  const [academicYear, setAcademicYear] = useState(member.academicYear || 'الفرقة الثالثة');
  const [bloodType, setBloodType] = useState(member.bloodType || 'O+');
  const [emergencyContact, setEmergencyContact] = useState(member.emergencyContact || '');
  const [address, setAddress] = useState(member.address || 'الإسكندرية');

  // Avatar & Profile
  const [avatarUrl, setAvatarUrl] = useState(member.avatarUrl || '');
  const [bio, setBio] = useState(member.bio || '');

  // Social URLs
  const [facebookUrl, setFacebookUrl] = useState(member.facebookUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(member.tiktokUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(member.instagramUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(member.linkedinUrl || '');

  // Hobbies & Aspirations
  const [hobbies, setHobbies] = useState<string[]>(member.hobbies || ['القراءة', 'العمل التطوعي']);
  const [learningAspirations, setLearningAspirations] = useState<string[]>(
    member.learningAspirations || ['إدارة الفرق', 'الذكاء الاصطناعي']
  );

  const [newHobby, setNewHobby] = useState('');
  const [newAspiration, setNewAspiration] = useState('');

  // Certified Skills & Certificates (المهارات المعتمدة والشهادات)
  const [certifiedSkills, setCertifiedSkills] = useState<CertifiedSkillItem[]>(member.certifiedSkills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProvider, setNewSkillProvider] = useState('');
  const [newSkillIssueDate, setNewSkillIssueDate] = useState('');
  const [newSkillCredentialUrl, setNewSkillCredentialUrl] = useState('');

  // Committee & Career History (Editable by Member)
  const [committeeHistory, setCommitteeHistory] = useState<CommitteeHistoryItem[]>(member.committeeHistory || []);
  const [newCommName, setNewCommName] = useState('');
  const [newHistRole, setNewHistRole] = useState('');
  const [newHistSeason, setNewHistSeason] = useState('2026/2027');
  const [newHistStartDate, setNewHistStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHistEndDate, setNewHistEndDate] = useState('مستمر');
  const [newHistReason, setNewHistReason] = useState('');

  if (!isOpen) return null;

  // Handle local avatar file upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAvatarUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHobby = () => {
    if (!newHobby.trim()) return;
    if (!hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()]);
    }
    setNewHobby('');
  };

  const handleRemoveHobby = (hobbyToRemove: string) => {
    setHobbies(hobbies.filter(h => h !== hobbyToRemove));
  };

  const handleAddAspiration = () => {
    if (!newAspiration.trim()) return;
    if (!learningAspirations.includes(newAspiration.trim())) {
      setLearningAspirations([...learningAspirations, newAspiration.trim()]);
    }
    setNewAspiration('');
  };

  const handleRemoveAspiration = (aspToRemove: string) => {
    setLearningAspirations(learningAspirations.filter(a => a !== aspToRemove));
  };

  const handleAddHistoryItem = () => {
    if (!newCommName.trim() || !newHistRole.trim()) return;
    const newItem: CommitteeHistoryItem = {
      id: `hist-self-${Date.now()}`,
      committeeName: newCommName.trim(),
      role: newHistRole.trim(),
      season: newHistSeason.trim() || '2026/2027',
      startDate: newHistStartDate || new Date().toISOString().split('T')[0],
      endDate: newHistEndDate.trim() || 'مستمر',
      reason: newHistReason.trim() || 'ترقية ومسيرة تطوعية',
      changedBy: fullName || member.fullName
    };
    setCommitteeHistory([newItem, ...committeeHistory]);
    setNewCommName('');
    setNewHistRole('');
    setNewHistReason('');
  };

  const handleRemoveHistoryItem = (id: string) => {
    setCommitteeHistory(committeeHistory.filter(h => h.id !== id));
  };

  const handleAddCertifiedSkill = () => {
    if (!newSkillName.trim() || !newSkillProvider.trim()) return;
    const newSkill: CertifiedSkillItem = {
      id: `skill-cert-${Date.now()}`,
      skillName: newSkillName.trim(),
      provider: newSkillProvider.trim(),
      issueDate: newSkillIssueDate.trim() || new Date().getFullYear().toString(),
      credentialUrl: newSkillCredentialUrl.trim() || undefined
    };
    setCertifiedSkills([newSkill, ...certifiedSkills]);
    setNewSkillName('');
    setNewSkillProvider('');
    setNewSkillIssueDate('');
    setNewSkillCredentialUrl('');
  };

  const handleRemoveCertifiedSkill = (id: string) => {
    setCertifiedSkills(certifiedSkills.filter(s => s.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNatId = nationalId.trim() || member.nationalId;
    const parsed = parseEgyptianNationalId(cleanNatId);

    updateMemberSelfProfile(member.id, {
      fullName: fullName.trim() || member.fullName,
      nationalId: cleanNatId,
      birthDate: parsed.isValid ? parsed.birthDate : member.birthDate,
      age: parsed.isValid ? parsed.age : member.age,
      phone: phone.trim() || member.phone,
      whatsappNumber: whatsappNumber.trim() || member.whatsappNumber,
      college,
      academicYear,
      bloodType,
      emergencyContact: emergencyContact.trim(),
      address: address.trim(),
      avatarUrl,
      bio,
      facebookUrl,
      tiktokUrl,
      instagramUrl,
      linkedinUrl,
      hobbies,
      learningAspirations,
      certifiedSkills,
      committeeHistory,
      points: isHighLeadership ? Number(adminPoints) : member.points,
      level: isHighLeadership ? Number(adminLevel) : member.level,
      badges: isHighLeadership ? adminBadges : member.badges,
      performance: isHighLeadership ? {
        overallScore: Number(adminOverallScore),
        attendanceRate: Number(adminAttendanceRate),
        taskQuality: Number(adminTaskQuality),
        taskCompletionRate: member.performance?.taskCompletionRate || 0,
        commitment: member.performance?.commitment || 100,
        teamwork: member.performance?.teamwork || 0,
        leadership: member.performance?.leadership || 0,
        evaluationsCount: member.performance?.evaluationsCount || 0
      } : undefined
    });
    onClose();
  };

  // Quick preset suggestions
  const suggestedHobbies = ['التصوير', 'المونتاج', 'الرسم والخط العربي', 'الشطرنج', 'الكتابة الإبداعية', 'البرمجة', 'الرياضة واللياقة', 'العزف والموسيقى', 'التنظيم'];
  const suggestedAspirations = ['إدارة الأزمات', 'التحدث أمام الجمهور', 'الذكاء الاصطناعي', 'التسويق الرقمي', 'تصميم الجرافيك', 'القيادة الفعالة', 'إدارة الوقت', 'العلاقات العامة'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-5 sm:p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-blue-400">
                <User className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">تعديل وتحديث بياناتي الشخصية</h3>
              <p className="text-[11px] text-slate-400">
                تحديث الرقم القومي، الكلية، أرقام التواصل، والبيانات الميدانية في شيت الفريق المعتمد
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          {/* Avatar Upload & Preview */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <img 
                src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt="Profile Avatar" 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-lg"
              />
              <label 
                htmlFor="avatar-file-upload" 
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5 mb-0.5 text-sky-400" />
                <span className="text-[9px] font-bold">تغيير الصورة</span>
              </label>
              <input 
                type="file" 
                accept="image/*" 
                id="avatar-file-upload" 
                onChange={handleAvatarUpload} 
                className="hidden" 
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-right">
              <div>
                <label className="block text-slate-300 font-bold mb-1">صورة الحساب الشخصي:</label>
                <label 
                  htmlFor="avatar-file-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-[11px] cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة جديدة من جهازك</span>
                </label>
              </div>

              <div>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="أو ضع رابط صورة مباشرة (Image URL)"
                  className="glass-input text-[11px] font-mono py-1 px-2.5"
                />
              </div>
            </div>
          </div>

          {/* Core Official Personal Info */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white">البيانات الرسمية والأكاديمية</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">الاسم الرباعي الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الاسم الرباعي كما في البطاقة..."
                  className="glass-input text-xs"
                />
              </div>

              {/* National ID */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1">الرقم القومي (14 رقم) *</label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={nationalId}
                  onChange={(e) => setNationalId(normalizeNumerals(e.target.value).replace(/[^0-9]/g, '').slice(0, 14))}
                  placeholder="14 رقماً قومياً..."
                  className="glass-input text-xs font-mono"
                />

                {/* Real-time National ID extraction badge */}
                {nationalId.length > 0 && (() => {
                  const p = parseEgyptianNationalId(nationalId);
                  if (p.isValid) {
                    return (
                      <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 animate-in fade-in space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>الرقم القومي صحيح ومطابق للمواصفات الرسمية:</span>
                        </div>
                        <div className="text-[10px] text-slate-300 flex flex-wrap gap-x-3 gap-y-0.5 pr-4">
                          <span>📅 تاريخ الميلاد: <strong className="text-white font-mono">{p.formattedDate}</strong></span>
                          <span>🎂 العمر الدقيق: <strong className="text-emerald-300 font-bold font-mono">{p.age} سنة</strong></span>
                          <span>🏛️ المحافظة: <strong className="text-white">{p.governorate}</strong></span>
                          <span>👤 النوع: <strong className="text-white">{p.genderAr}</strong></span>
                          {p.zodiacSign && <span>✨ {p.zodiacSign}</span>}
                        </div>
                      </div>
                    );
                  } else if (nationalId.length === 14) {
                    return (
                      <div className="mt-2 p-2 rounded-xl bg-red-950/30 border border-red-500/40 text-[11px] text-red-300 flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>⚠️ {p.errorMessage}</span>
                      </div>
                    );
                  }
                  return (
                    <div className="text-[10px] text-slate-400 mt-1 pr-1">
                      متبقي {14 - nationalId.length} أرقام لاستخراج تاريخ الميلاد والعمر الدقيق
                    </div>
                  );
                })()}
              </div>

              {/* Protected Read-Only Email */}
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-bold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>البريد الإلكتروني المعتمد (حساب الدخول - محمي للقراءة فقط):</span>
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-normal">🔒 لا يمكن تعديله لأمان الحساب</span>
                </label>
                <input
                  type="email"
                  disabled
                  readOnly
                  value={member.universityEmail}
                  className="glass-input text-xs font-mono bg-slate-950/80 border-slate-800 text-slate-400 cursor-not-allowed select-none"
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">الكلية / المعهد *</label>
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="glass-input text-xs cursor-pointer"
                >
                  {ALEXANDRIA_UNIVERSITY_COLLEGES.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">الفرقة الدراسية *</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="glass-input text-xs cursor-pointer"
                >
                  <option value="الفرقة الأولى" className="bg-slate-900 text-white">الفرقة الأولى</option>
                  <option value="الفرقة الثانية" className="bg-slate-900 text-white">الفرقة الثانية</option>
                  <option value="الفرقة الثالثة" className="bg-slate-900 text-white">الفرقة الثالثة</option>
                  <option value="الفرقة الرابعة" className="bg-slate-900 text-white">الفرقة الرابعة</option>
                  <option value="الفرقة الخامسة" className="bg-slate-900 text-white">الفرقة الخامسة (طبي / هندسي)</option>
                  <option value="الفرقة السادسة" className="bg-slate-900 text-white">الفرقة السادسة (بشري)</option>
                  <option value="خريج / دراسات عليا" className="bg-slate-900 text-white">خريج / دراسات عليا</option>
                </select>
              </div>

              {/* Phone / Mobile */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم الهاتف الأساسي *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01000000000"
                  className="glass-input text-xs font-mono"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم الواتساب (للمجموعات الميدانية) *</label>
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="01000000000"
                  className="glass-input text-xs font-mono"
                />
              </div>

              {/* Blood Type */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">فصيلة الدم (للطوارئ الميدانية)</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="glass-input text-xs font-mono cursor-pointer"
                >
                  <option value="O+" className="bg-slate-900 text-white">O+</option>
                  <option value="O-" className="bg-slate-900 text-white">O-</option>
                  <option value="A+" className="bg-slate-900 text-white">A+</option>
                  <option value="A-" className="bg-slate-900 text-white">A-</option>
                  <option value="B+" className="bg-slate-900 text-white">B+</option>
                  <option value="B-" className="bg-slate-900 text-white">B-</option>
                  <option value="AB+" className="bg-slate-900 text-white">AB+</option>
                  <option value="AB-" className="bg-slate-900 text-white">AB-</option>
                </select>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم هاتف ولي الأمر / الطوارئ</label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="رقم شخص للطوارئ..."
                  className="glass-input text-xs font-mono"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1">محل الإقامة / العنوان الحالي</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="المنطقة - الإسكندرية..."
                  className="glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">نبذة عني ودوري في الفريق (Bio):</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="اكتب نبذة قصيرة عن مهاراتك واهتماماتك ودورك التطوعي..."
              className="glass-input text-xs resize-none"
            />
          </div>

          {/* Social Media Links */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white">حسابات التواصل الاجتماعي والملف المهني</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 text-[11px] font-bold mb-1">رابط فيسبوك (Facebook URL):</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] font-bold mb-1">رابط إنستغرام (Instagram URL):</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] font-bold mb-1">رابط تيك توك (TikTok URL):</label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] font-bold mb-1">رابط لينكد إن (LinkedIn URL):</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="glass-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Hobbies & Talents */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="block font-bold text-white flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              <span>هواياتي ومواهبي الشخصية:</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                placeholder="اكتب موهبة أو هواية واضغط إضافة..."
                className="glass-input text-xs flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHobby(); } }}
              />
              <button
                type="button"
                onClick={handleAddHobby}
                className="btn-primary text-xs px-3.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {hobbies.map((h, i) => (
                <span 
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 text-[11px] font-semibold flex items-center gap-1.5"
                >
                  <span>{h}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveHobby(h)} 
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
              {suggestedHobbies.filter(sh => !hobbies.includes(sh)).map((sh, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHobbies([...hobbies, sh])}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-all cursor-pointer"
                >
                  + {sh}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Aspirations */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="block font-bold text-white flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>ما أرغب في تعلمه وتطويره (Skills to Learn):</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAspiration}
                onChange={(e) => setNewAspiration(e.target.value)}
                placeholder="مهارة أو ورشة عمل تريد تعلمها..."
                className="glass-input text-xs flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAspiration(); } }}
              />
              <button
                type="button"
                onClick={handleAddAspiration}
                className="btn-primary text-xs px-3.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {learningAspirations.map((a, i) => (
                <span 
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[11px] font-semibold flex items-center gap-1.5"
                >
                  <span>{a}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveAspiration(a)} 
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
              {suggestedAspirations.filter(sa => !learningAspirations.includes(sa)).map((sa, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLearningAspirations([...learningAspirations, sa])}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-all cursor-pointer"
                >
                  + {sa}
                </button>
              ))}
            </div>
          </div>

          {/* Certified Skills & Official Certificates (المهارات المعتمدة والشهادات) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>المهارات المعتمدة والشهادات التدريبية (Certified Skills & Certificates):</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-bold">
                {certifiedSkills.length} شهادات معتمدة
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              أضف المهارات والشهادات والاعتمادات التي حصلت عليها مع توثيق الجهة المانحة وتاريخ الحصول عليها لتظهر في ملفك وسيرتك الذاتية.
            </p>

            {/* Certified Skills List */}
            <div className="space-y-2">
              {certifiedSkills.length === 0 ? (
                <div className="text-center py-3 text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  لم تقم بإضافة شهادات أو مهارات معتمدة بعد. أضف مهاراتك من النموذج أدناه.
                </div>
              ) : (
                certifiedSkills.map((s) => (
                  <div 
                    key={s.id} 
                    className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-amber-300 text-sm">{s.skillName}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold">
                          🏛️ {s.provider}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                          📅 {s.issueDate}
                        </span>
                      </div>
                      {s.credentialUrl && (
                        <div className="text-[10px] text-sky-400 truncate max-w-sm flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          <span>{s.credentialUrl}</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertifiedSkill(s.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="حذف هذه المهارة المعتمدة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Certified Skill Form */}
            <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2.5">
              <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مهارة / شهادة معتمدة جديدة:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="اسم المهارة أو الشهادة (مثال: إدارة المشاريع الاحترافية PMP)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="glass-input text-xs"
                />
                <input
                  type="text"
                  placeholder="الجهة أو المكان المانح (مثال: معهد جوته، جوجل، نقابة المهندسين)"
                  value={newSkillProvider}
                  onChange={(e) => setNewSkillProvider(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="تاريخ أو عام الحصول عليها (مثال: 2026 أو مايو 2025)"
                  value={newSkillIssueDate}
                  onChange={(e) => setNewSkillIssueDate(e.target.value)}
                  className="glass-input text-xs"
                />
                <input
                  type="text"
                  placeholder="رابط أو كود التحقق من الشهادة (اختياري)..."
                  value={newSkillCredentialUrl}
                  onChange={(e) => setNewSkillCredentialUrl(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddCertifiedSkill}
                  disabled={!newSkillName.trim() || !newSkillProvider.trim()}
                  className="btn-primary text-xs px-4 py-2 shrink-0 disabled:opacity-50 flex items-center gap-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة المهارة المعتمدة</span>
                </button>
              </div>
            </div>
          </div>

          {/* Career & Committee History / Promotions (سجل الترقيات واللجان) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                <History className="w-4 h-4 text-emerald-400" />
                <span>السجل التاريخي والترقيات واللجان السابقة (Career Milestones):</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                {committeeHistory.length} محطات
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              يمكنك هنا توثيق وتعديل جميع المناصب، اللجان، ومراحل تطوعك وتدرجك الإداري والميداني بالفريق.
            </p>

            {/* Existing History List */}
            <div className="space-y-2">
              {committeeHistory.length === 0 ? (
                <div className="text-center py-3 text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  لا توجد محطات تاريخية مسجلة بعد. يمكنك إضافة محطات سابقة من النموذج أدناه.
                </div>
              ) : (
                committeeHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.role}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {item.committeeName}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.season}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {item.startDate} ⬅ {item.endDate}
                        </span>
                        {item.reason && (
                          <span className="text-slate-300">• {item.reason}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHistoryItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="حذف هذه المحطة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New History Form */}
            <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>إضافة محطة / ترقية جديدة:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="اسم اللجنة / القطاع (مثال: لجنة التنظيم)"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  className="glass-input text-xs"
                />
                <input
                  type="text"
                  placeholder="المسمى أو المنصب (مثال: نائب رئيس لجنة)"
                  value={newHistRole}
                  onChange={(e) => setNewHistRole(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="الموسم (مثال: 2026/2027)"
                  value={newHistSeason}
                  onChange={(e) => setNewHistSeason(e.target.value)}
                  className="glass-input text-xs"
                />
                <input
                  type="text"
                  placeholder="تاريخ البداية (مثال: 2026-09-01)"
                  value={newHistStartDate}
                  onChange={(e) => setNewHistStartDate(e.target.value)}
                  className="glass-input text-xs"
                />
                <input
                  type="text"
                  placeholder="تاريخ النهاية (مثال: مستمر)"
                  value={newHistEndDate}
                  onChange={(e) => setNewHistEndDate(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="سبب الترقية أو النبذة (اختياري)..."
                  value={newHistReason}
                  onChange={(e) => setNewHistReason(e.target.value)}
                  className="glass-input text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddHistoryItem}
                  disabled={!newCommName.trim() || !newHistRole.trim()}
                  className="btn-primary text-xs px-4 py-2 shrink-0 disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة المحطة</span>
                </button>
              </div>
            </div>
          </div>

          {/* HIGH LEADERSHIP EXCLUSIVE ADMIN SECTION */}
          {isHighLeadership && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-purple-500/30">
                <Crown className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">صلاحيات التعديل والاعتماد المباشر للإدارة العليا</h4>
                  <p className="text-[10px] text-purple-300/80">تعديل النقاط والرتبة الميدانية وإدارة الأوسمة الممنوحة ونسب التقييم</p>
                </div>
              </div>

              {/* Points & Level & Scores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>رصيد النقاط (XP)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={adminPoints}
                    onChange={(e) => setAdminPoints(Number(e.target.value))}
                    className="glass-input text-xs font-mono font-bold text-amber-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-300 mb-1 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-sky-400" />
                    <span>المستوى (Level)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={adminLevel}
                    onChange={(e) => setAdminLevel(Number(e.target.value))}
                    className="glass-input text-xs font-mono font-bold text-sky-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-emerald-400" />
                    <span>نسبة الأداء العام (%)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={adminOverallScore}
                    onChange={(e) => setAdminOverallScore(Number(e.target.value))}
                    className="glass-input text-xs font-mono font-bold text-emerald-300"
                  />
                </div>
              </div>

              {/* Badges Management Grid */}
              <div>
                <label className="block text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>الأوسمة والأنواط الرسمية (انقر لمنح أو سحب الوسام):</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {masterBadges.map(badge => {
                    const isAssigned = adminBadges.includes(badge.id);
                    return (
                      <button
                        type="button"
                        key={badge.id}
                        onClick={() => toggleBadge(badge.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isAssigned
                            ? 'bg-purple-900/40 border-purple-400 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{badge.icon || '🏅'}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{badge.titleAr || badge.title}</div>
                            <div className="text-[9px] text-slate-400 truncate max-w-[140px]">{badge.category} • +{badge.xpReward} XP</div>
                          </div>
                        </div>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isAssigned
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isAssigned ? 'ممنوح ✓' : 'غير ممنوح'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتحديث البيانات في الشيت العام</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
