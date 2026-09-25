import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskAttachment } from '../../types';
import { 
  X, CheckSquare, Sparkles, User, Calendar, 
  Tag, Shield, Check, Plus, AlertCircle, Mic, Paperclip 
} from 'lucide-react';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { FileAttachmentUploader } from '../common/FileAttachmentUploader';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const { committees, events, members, createTask, getAIRecommendationForTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [committeeId, setCommitteeId] = useState(committees[0]?.id || 'comm-org');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [deadline, setDeadline] = useState('2026-09-20 18:00');
  const [maxPoints, setMaxPoints] = useState<number>(30);
  const [eventId, setEventId] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(['تنظيم المسارح']);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [subtasksList, setSubtasksList] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: 'sub-1', title: 'فحص التجهيزات والتنسيق المسبق', completed: false },
    { id: 'sub-2', title: 'التنفيذ الميداني ومطابقة الجودة', completed: false },
    { id: 'sub-3', title: 'رفع تقرير المخرجات والملفات المكتملة', completed: false }
  ]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | undefined>(undefined);
  const [voiceDuration, setVoiceDuration] = useState<number | undefined>(undefined);

  if (!isOpen) return null;

  const currentComm = committees.find(c => c.id === committeeId);
  const aiRecommendations = getAIRecommendationForTask(skillsList, committeeId);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasksList([
      ...subtasksList,
      { id: `sub-${Date.now()}`, title: subtaskInput.trim(), completed: false }
    ]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasksList(subtasksList.filter(s => s.id !== id));
  };

  const toggleMemberSelection = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(mId => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedMemberIds.length === 0) return;

    const assignedNames = members
      .filter(m => selectedMemberIds.includes(m.id))
      .map(m => m.fullName);

    const linkedEvent = events.find(ev => ev.id === eventId);

    createTask({
      title,
      description,
      committeeId,
      committeeName: currentComm ? currentComm.name : 'لجنة التنظيم والميدان',
      assignedToMemberIds: selectedMemberIds,
      assignedToMemberNames: assignedNames,
      priority,
      deadline,
      maxPoints: Number(maxPoints) || 30,
      xpReward: Number(maxPoints) || 30,
      requiredSkills: skillsList,
      subtasks: subtasksList,
      attachments,
      voiceNoteUrl,
      voiceDuration,
      eventId: eventId || undefined,
      eventName: linkedEvent ? linkedEvent.name : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">إنشاء وإسناد مهمة جديدة</h3>
              <p className="text-xs text-slate-400">مزودة بمحرك التوصية الذكي لترشيح أفضل المتطوعين</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المهمة *</label>
            <input 
              type="text" 
              required
              placeholder="مثال: تجهيز منصة المتحدثين وفحص الصوتيات..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">تفاصيل ومواصفات المهمة</label>
            <textarea 
              rows={3}
              placeholder="اكتب المعايير المطلوبة للتنفيذ ومخرجات التسليم بدقة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          {/* Committee, Priority, Deadline, Points Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اللجنة المسؤولة *</label>
              <select 
                value={committeeId}
                onChange={(e) => setCommitteeId(e.target.value)}
                className="glass-input text-xs"
              >
                {committees.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">مستوى الأولوية</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="glass-input text-xs"
              >
                <option value="Critical">حرجة جداً (Critical)</option>
                <option value="High">مرتفعة (High)</option>
                <option value="Medium">متوسطة (Medium)</option>
                <option value="Low">عادية (Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الموعد النهائي (Deadline)</label>
              <input 
                type="text"
                placeholder="2026-09-20 18:00"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">إجمالي نقاط المهمة (XP)</label>
              <input 
                type="number"
                min="5"
                max="200"
                value={maxPoints}
                onChange={(e) => setMaxPoints(Number(e.target.value))}
                className="glass-input text-xs font-mono font-bold text-amber-400"
              />
            </div>
          </div>

          {/* Link to Event */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ربط بفعالية معينة (اختياري)</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="glass-input text-xs"
            >
              <option value="">-- بدون ارتباط بفعالية محددة --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>
              ))}
            </select>
          </div>

          {/* Voice Briefing Recorder */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">تسجيل توجيه صوتي للمهمة (Voice Briefing)</label>
            <VoiceRecorder
              onRecordingComplete={(audioUrl, dur) => {
                setVoiceNoteUrl(audioUrl);
                setVoiceDuration(dur);
              }}
            />
          </div>

          {/* Attachments / Reference Files */}
          <div>
            <FileAttachmentUploader
              attachments={attachments}
              onChange={setAttachments}
              label="مستندات ومراجع المهمة (اختياري - ملفات وورد، PDF، صور، إكسل...)"
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300">المهام الفرعية وقائمة التحقق (Checklist)</label>
              <span className="text-[11px] text-slate-400">{subtasksList.length} عناصر محددة</span>
            </div>
            
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                placeholder="إضافة خطوة فرعية (مثال: فحص التجهيزات، إرسال المسودة...)"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); }}}
                className="glass-input text-xs"
              />
              <button 
                type="button" 
                onClick={handleAddSubtask}
                className="btn-secondary text-xs px-3 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة خطوة</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {subtasksList.map((sub, idx) => (
                <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{sub.title}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSubtask(sub.id)} 
                    className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">المهارات المطلوبة للمهمة</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                placeholder="مثال: إدارة الحشود، فوتوشوب، مونتاج..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                className="glass-input text-xs"
              />
              <button 
                type="button" 
                onClick={handleAddSkill}
                className="btn-secondary text-xs px-3 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {skillsList.map(skill => (
                <span key={skill} className="px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-300 text-xs flex items-center gap-1 border border-blue-500/30">
                  <Tag className="w-3 h-3" />
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* AI Member Recommendation Engine */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-xs font-bold text-white">ترشيحات الذكاء الاصطناعي (AI Smart Match)</span>
              </div>
              <span className="text-[10px] text-purple-300">مطابقة المهارات + عبء العمل + الأداء</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aiRecommendations.map(({ member, matchScore, reason }) => {
                const isSelected = selectedMemberIds.includes(member.id);
                return (
                  <div 
                    key={member.id}
                    onClick={() => toggleMemberSelection(member.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected 
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-md' 
                        : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={member.avatarUrl} alt="" className="w-7 h-7 rounded-md object-cover" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{member.fullName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{reason}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-purple-400 font-mono">
                        {matchScore}%
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Members Count */}
          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span>تم اختيار: <strong className="text-white">{selectedMemberIds.length}</strong> متطوع</span>
            {selectedMemberIds.length === 0 && (
              <span className="text-rose-400 text-[11px] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>يرجى اختيار عضو واحد على الأقل</span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={selectedMemberIds.length === 0 || !title.trim()}
              className="btn-primary text-xs py-2.5 px-6 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>إنشاء وإسناد المهمة 🚀</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
