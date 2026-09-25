import React, { useState, useEffect } from 'react';
import { 
  X, 
  Megaphone, 
  Save, 
  Pin, 
  Users, 
  Layers, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import { VoiceRecorder } from '../common/VoiceRecorder';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcementToEdit?: Announcement | null;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  announcementToEdit
}) => {
  const { createAnnouncement, updateAnnouncement, showNotification, committees } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'all' as Announcement['targetType'],
    targetCommitteeId: '',
    isPinned: false,
    voiceNoteUrl: '',
    voiceDuration: 0
  });

  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['موافق', 'غير موافق']);

  useEffect(() => {
    if (announcementToEdit) {
      setFormData({
        title: announcementToEdit.title,
        content: announcementToEdit.content,
        targetType: announcementToEdit.targetType,
        targetCommitteeId: announcementToEdit.targetCommitteeId || '',
        isPinned: announcementToEdit.isPinned,
        voiceNoteUrl: announcementToEdit.voiceNoteUrl || '',
        voiceDuration: announcementToEdit.voiceDuration || 0
      });
      if (announcementToEdit.poll) {
        setHasPoll(true);
        setPollQuestion(announcementToEdit.poll.question);
        setPollOptions(announcementToEdit.poll.options.map(o => o.text));
      } else {
        setHasPoll(false);
        setPollQuestion('');
        setPollOptions(['موافق', 'غير موافق']);
      }
    } else {
      setFormData({
        title: '',
        content: '',
        targetType: 'all',
        targetCommitteeId: '',
        isPinned: false,
        voiceNoteUrl: '',
        voiceDuration: 0
      });
      setHasPoll(false);
      setPollQuestion('');
      setPollOptions(['موافق', 'غير موافق']);
    }
  }, [announcementToEdit, isOpen]);

  const handleAddOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions];
    updated[index] = val;
    setPollOptions(updated);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showNotification('error', 'يرجى كتابة عنوان الإعلان ومحتواه');
      return;
    }

    const selectedComm = committees.find(c => c.id === formData.targetCommitteeId);

    const validOptions = pollOptions.filter(o => o.trim().length > 0);
    const pollData = hasPoll && validOptions.length >= 2 ? {
      id: announcementToEdit?.poll?.id || `poll-${Date.now()}`,
      question: pollQuestion.trim() || formData.title.trim(),
      options: validOptions.map((optText, idx) => ({
        id: `opt-${idx + 1}`,
        text: optText.trim(),
        voteCount: announcementToEdit?.poll?.options.find(o => o.text === optText.trim())?.voteCount || 0
      })),
      totalVotes: announcementToEdit?.poll?.totalVotes || 0,
      votes: announcementToEdit?.poll?.votes || [],
      isActive: true
    } : undefined;

    if (announcementToEdit) {
      updateAnnouncement(announcementToEdit.id, {
        title: formData.title,
        content: formData.content,
        targetType: formData.targetType,
        targetCommitteeId: formData.targetType === 'committee' ? formData.targetCommitteeId : undefined,
        targetCommitteeName: formData.targetType === 'committee' ? selectedComm?.name : undefined,
        isPinned: formData.isPinned,
        voiceNoteUrl: formData.voiceNoteUrl || undefined,
        voiceDuration: formData.voiceDuration || undefined,
        poll: pollData
      });
      showNotification('success', 'تم تعديل الإعلان بنجاح');
    } else {
      createAnnouncement({
        title: formData.title,
        content: formData.content,
        targetType: formData.targetType,
        targetCommitteeId: formData.targetType === 'committee' ? formData.targetCommitteeId : undefined,
        targetCommitteeName: formData.targetType === 'committee' ? selectedComm?.name : undefined,
        isPinned: formData.isPinned,
        voiceNoteUrl: formData.voiceNoteUrl || undefined,
        voiceDuration: formData.voiceDuration || undefined,
        poll: pollData
      });
      showNotification('success', 'تم نشر الإعلان بنجاح لجميع المعنيين');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {announcementToEdit ? 'تعديل بيانات الإعلان' : 'نشر إعلان وتعميم رسمي جديد'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">لوحة الإعلانات والتنبيهات المباشرة للفريق</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              عنوان الإعلان / التنبيه <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: تعليمات هامة بخصوص تنظيم المؤتمر السنوي"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الجمهور المستهدف
              </label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value as Announcement['targetType'] })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white"
              >
                <option value="all">كافة أعضاء الفريق (عام)</option>
                <option value="committee">لجنة مخصصة فقط</option>
                <option value="members">المتطوعون فقط</option>
              </select>
            </div>

            {formData.targetType === 'committee' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  حدد اللجنة
                </label>
                <select
                  value={formData.targetCommitteeId}
                  onChange={(e) => setFormData({ ...formData, targetCommitteeId: e.target.value })}
                  required={formData.targetType === 'committee'}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white"
                >
                  <option value="">اختر اللجنة المعنية...</option>
                  {committees.map(comm => (
                    <option key={comm.id} value={comm.id}>{comm.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              نص الإعلان والتفاصيل <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="اكتب نص الإعلان بالتفصيل والتعليمات الموجهة للأعضاء..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white placeholder-slate-400 resize-none"
            />
          </div>

          {/* Voice Announcement Recorder */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>تسجيل إذاعي / توجيه صوتي مرفق مع الإعلان 🎙️ (اختياري)</span>
            </label>
            <VoiceRecorder
              onRecordingComplete={(audioUrl: string, duration: number) => {
                setFormData(prev => ({
                  ...prev,
                  voiceNoteUrl: audioUrl,
                  voiceDuration: duration
                }));
              }}
            />
          </div>

          {/* Pin toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Pin className={`w-4 h-4 ${formData.isPinned ? 'text-amber-500' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">تثبيت الإعلان في أعلى القائمة</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">سيظهر الإعلان في صدارة لوحة الإعلانات لجميع الأعضاء</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Interactive Poll / Voting Section */}
          <div className="p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${hasPoll ? 'text-blue-400' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-bold text-white">إرفاق استطلاع رأي وتصويت تفاعلي (Poll)</p>
                  <p className="text-[10px] text-slate-400">يتيح للأعضاء التصويت بنقرة واحدة مع سحب النتائج والإحصائيات</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPoll}
                  onChange={(e) => setHasPoll(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {hasPoll && (
              <div className="space-y-2.5 pt-2 border-t border-blue-500/20 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    سؤال التصويت / الاستطلاع:
                  </label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="مثال: ما هو الموعد الأنسب لاجتماع اللجنة الميداني؟"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    خيارات التصويت (خيارات متعددة):
                  </label>
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`الخيار ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <span>+ إضافة خيار تصويت آخر</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{announcementToEdit ? 'حفظ التعديلات' : 'نشر الإعلان فوراً'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
