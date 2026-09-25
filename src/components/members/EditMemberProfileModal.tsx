import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { 
  X, User, Upload, Sparkles, Heart, GraduationCap, 
  Plus, Trash2, Check, Phone, FileText, Camera 
} from 'lucide-react';

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
  const { updateMemberSelfProfile } = useApp();

  const [avatarUrl, setAvatarUrl] = useState(member.avatarUrl || '');
  const [bio, setBio] = useState(member.bio || '');
  const [whatsappNumber, setWhatsappNumber] = useState(member.whatsappNumber || '');
  const [facebookUrl, setFacebookUrl] = useState(member.facebookUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(member.tiktokUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(member.instagramUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(member.linkedinUrl || '');

  const [hobbies, setHobbies] = useState<string[]>(member.hobbies || ['القراءة', 'العمل التطوعي']);
  const [learningAspirations, setLearningAspirations] = useState<string[]>(
    member.learningAspirations || ['إدارة الفرق', 'الذكاء الاصطناعي']
  );

  const [newHobby, setNewHobby] = useState('');
  const [newAspiration, setNewAspiration] = useState('');

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

  const handleSave = () => {
    updateMemberSelfProfile(member.id, {
      avatarUrl,
      bio,
      whatsappNumber,
      facebookUrl,
      tiktokUrl,
      instagramUrl,
      linkedinUrl,
      hobbies,
      learningAspirations
    });
    onClose();
  };

  // Quick preset suggestions
  const suggestedHobbies = ['التصوير', 'المونتاج', 'الرسم والخط العربي', 'الشطرنج', 'الكتابة الإبداعية', 'البرمجة', 'الرياضة واللياقة', 'العزف والموسيقى'];
  const suggestedAspirations = ['إدارة الأزمات', 'التحدث أمام الجمهور', 'الذكاء الاصطناعي', 'التسويق الرقمي', 'تصميم الجرافيك', 'القيادة الفعالة', 'إدارة الوقت'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-xl w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-blue-400">
                <User className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">تعديل ملفي الشخصي</h3>
              <p className="text-[11px] text-slate-400">
                تحديث الصورة، الهوايات، والمهارات التي تطمح لتعلمها وتطويرها
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

        <div className="space-y-5 text-xs">
          
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
                  <span>رفع صورة من الجهاز</span>
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

          {/* Bio & Phone */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">نبذة عني (Bio):</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="اكتب نبذة قصيرة عن اهتماماتك ودورك في الفريق..."
                className="glass-input text-xs resize-none"
              />
            </div>

            {/* Social Media & Instant Contact Links */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white">
                  روابط التواصل السريع وحسابات السوشيال ميديا
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp */}
                <div>
                  <label className="block text-slate-300 text-[11px] font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>رقم الواتساب (للتواصل المباشر):</span>
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+201000000000"
                    className="glass-input text-xs font-mono"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-slate-300 text-[11px] font-bold mb-1 flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">f</span>
                    <span>رابط حساب الفيسبوك (Facebook URL):</span>
                  </label>
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/username"
                    className="glass-input text-xs font-mono"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-slate-300 text-[11px] font-bold mb-1 flex items-center gap-1.5">
                    <span className="text-pink-400 font-bold">📷</span>
                    <span>رابط الإنستغرام (Instagram URL):</span>
                  </label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="glass-input text-xs font-mono"
                  />
                </div>

                {/* TikTok */}
                <div>
                  <label className="block text-slate-300 text-[11px] font-bold mb-1 flex items-center gap-1.5">
                    <span className="text-cyan-400 font-bold">🎵</span>
                    <span>رابط التيك توك (TikTok URL):</span>
                  </label>
                  <input
                    type="url"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="https://tiktok.com/@username"
                    className="glass-input text-xs font-mono"
                  />
                </div>

                {/* LinkedIn */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 text-[11px] font-bold mb-1 flex items-center gap-1.5">
                    <span className="text-sky-400 font-bold">in</span>
                    <span>رابط الملف المهني لينكد إن (LinkedIn URL):</span>
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="glass-input text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hobbies & Talents */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="block font-bold text-white flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              <span>هواياتي ومواهبي الشخصية (Hobbies & Interests):</span>
            </label>
            <p className="text-[10px] text-slate-400">
              تظهر في ملفك الشخصي وسيرتك الذاتية وتساعد في إسناد المهام التناسبية
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                placeholder="اكتب هواية واضغط إضافة..."
                className="glass-input text-xs flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddHobby(); }}
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

            {/* Current Hobbies Tags */}
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

            {/* Quick Suggestions */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[10px] text-slate-400 mb-1.5">اقتراحات سريعة للاختيار:</div>
              <div className="flex flex-wrap gap-1">
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
          </div>

          {/* Learning Aspirations */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="block font-bold text-white flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>ما أرغب في تعلمه وتطويره (Skills to Learn & Aspirations):</span>
            </label>
            <p className="text-[10px] text-slate-400">
              تُستخدم لترشيحك للدورات التدريبية المتقدمة وورش العمل المناسبة
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAspiration}
                onChange={(e) => setNewAspiration(e.target.value)}
                placeholder="مهارة أو موضوع تريد تعلمه..."
                className="glass-input text-xs flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddAspiration(); }}
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

            {/* Current Aspirations Tags */}
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

            {/* Quick Suggestions */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[10px] text-slate-400 mb-1.5">اقتراحات مهارات للتعلم:</div>
              <div className="flex flex-wrap gap-1">
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary text-xs py-2 px-5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
