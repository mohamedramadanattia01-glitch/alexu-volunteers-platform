import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskAttachment } from '../../types';
import { 
  X, CheckSquare, Sparkles, User, Calendar, 
  Tag, Shield, Check, Plus, AlertCircle, Mic, Paperclip,
  Users, Search, Award, CheckCircle2, ChevronDown, Clock,
  Flame, UserCheck, Layers, FileText, Zap
} from 'lucide-react';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { FileAttachmentUploader } from '../common/FileAttachmentUploader';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const { committees, events, members, createTask, getAIRecommendationForTask, currentUser } = useApp();

  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(20, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [activeSection, setActiveSection] = useState<'details' | 'assignees' | 'checklist'>('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [committeeId, setCommitteeId] = useState(committees[0]?.id || 'comm-org');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [maxPoints, setMaxPoints] = useState<number>(30);
  const [eventId, setEventId] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(['تنظيم ميداني']);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  // Member selection filters
  const [memberFilterComm, setMemberFilterComm] = useState('match_comm');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const [subtasksList, setSubtasksList] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: 'sub-1', title: 'فحص التجهيزات والتنسيق المسبق مع مسؤولي الموقع', completed: false },
    { id: 'sub-2', title: 'التنفيذ الميداني ومطابقة معايير الجودة المطلوبة', completed: false },
    { id: 'sub-3', title: 'رفع تقرير المخرجات والملفات المكتملة للاعتماد', completed: false }
  ]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | undefined>(undefined);
  const [voiceDuration, setVoiceDuration] = useState<number | undefined>(undefined);

  const currentComm = committees.find(c => c.id === committeeId);
  const aiRecommendations = getAIRecommendationForTask(skillsList, committeeId);

  // Filtered members for assignment
  const displayedMembers = useMemo(() => {
    return members.filter(m => {
      // Must be approved / active member
      if (m.status === 'Pending' || m.status === 'Archived') return false;

      // Filter by committee
      if (memberFilterComm === 'match_comm') {
        if (m.currentCommitteeId !== committeeId) return false;
      } else if (memberFilterComm !== 'all') {
        if (m.currentCommitteeId !== memberFilterComm) return false;
      }

      // Search query
      if (memberSearchQuery.trim()) {
        const q = memberSearchQuery.toLowerCase().trim();
        const matchesName = (m.fullName || '').toLowerCase().includes(q);
        const matchesRole = (m.role || '').toLowerCase().includes(q);
        const matchesCode = (m.volunteerId || '').toLowerCase().includes(q);
        const matchesPhone = (m.phone || '').includes(q);
        if (!matchesName && !matchesRole && !matchesCode && !matchesPhone) return false;
      }

      return true;
    });
  }, [members, committeeId, memberFilterComm, memberSearchQuery]);

  if (!isOpen) return null;

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

  const handleSelectAllInView = () => {
    const idsInView = displayedMembers.map(m => m.id);
    const newSelected = Array.from(new Set([...selectedMemberIds, ...idsInView]));
    setSelectedMemberIds(newSelected);
  };

  const handleDeselectAllInView = () => {
    const idsInView = new Set(displayedMembers.map(m => m.id));
    setSelectedMemberIds(selectedMemberIds.filter(id => !idsInView.has(id)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedMemberIds.length === 0) {
      if (!title.trim()) setActiveSection('details');
      else if (selectedMemberIds.length === 0) setActiveSection('assignees');
      return;
    }

    const assignedMembers = members.filter(m => selectedMemberIds.includes(m.id));
    const assignedNames = assignedMembers.map(m => m.fullName);
    const linkedEvent = events.find(ev => ev.id === eventId);

    createTask({
      title: title.trim(),
      description: description.trim(),
      committeeId,
      committeeName: currentComm ? currentComm.name : 'اللجنة التخصصية',
      assignedToMemberIds: selectedMemberIds,
      assignedToMemberNames: assignedNames,
      priority,
      deadline: deadline.replace('T', ' '),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-3xl w-full p-5 sm:p-6 border border-blue-500/40 shadow-2xl bg-[#090e1c] text-right my-6 rounded-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/25">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>إنشاء وإسناد مهمة جديدة</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal">
                  دورة العمل الميداني
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد المتطوعين، الموعد النهائي، مكافأة الـ XP، التوجيهات الصوتية والمرفقات
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveSection('details')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'details' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. تفاصيل المهمة والمواعيد</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('assignees')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeSection === 'assignees' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. اختيار وتكليف المتطوعين</span>
            {selectedMemberIds.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] flex items-center justify-center font-extrabold mr-1">
                {selectedMemberIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('checklist')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'checklist' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. خطوات التنفيذ والمرفقات</span>
            {subtasksList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                {subtasksList.length}
              </span>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* TAB 1: DETAILS */}
          {activeSection === 'details' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  عنوان المهمة *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: تنظيم قاعة المؤتمرات الكبرى واستقبال الضيوف..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input text-xs w-full py-2.5"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  شرح وتفاصيل المهمة ومخرجات التسليم المطلوبة
                </label>
                <textarea 
                  rows={3}
                  placeholder="اكتب المعايير المطلوبة للتنفيذ ومواصفات التسليم بدقة والتوقيتات..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input text-xs w-full leading-relaxed"
                />
              </div>

              {/* Committee, Priority, Deadline, Points Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">اللجنة التخصصية المعنية *</label>
                  <select 
                    value={committeeId}
                    onChange={(e) => setCommitteeId(e.target.value)}
                    className="glass-input text-xs w-full py-2"
                  >
                    {committees.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">درجة الأولوية والأهمية</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'Low', label: 'عادية', color: 'border-slate-700 text-slate-300' },
                      { key: 'Medium', label: 'متوسطة', color: 'border-sky-500/40 text-sky-300' },
                      { key: 'High', label: 'مرتفعة', color: 'border-amber-500/40 text-amber-300' },
                      { key: 'Critical', label: 'حرجة 🔥', color: 'border-rose-500/40 text-rose-300' }
                    ].map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPriority(p.key as TaskPriority)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          priority === p.key
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                            : `bg-slate-900/80 ${p.color} hover:bg-slate-800`
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>الموعد النهائي للتسليم (Deadline) *</span>
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                  </label>
                  <input 
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="glass-input text-xs w-full py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>مكافأة النقاط عند الاعتماد (XP)</span>
                    <span className="font-mono text-amber-400 font-bold">+{maxPoints} XP</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range"
                      min="5"
                      max="150"
                      step="5"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(Number(e.target.value))}
                      className="flex-1 accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1 shrink-0">
                      {[15, 30, 50, 100].map(pt => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setMaxPoints(pt)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                            maxPoints === pt 
                              ? 'bg-amber-400 text-slate-950 border-amber-300' 
                              : 'bg-slate-900 text-amber-400 border-slate-700 hover:border-amber-400/50'
                          }`}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Link to Event */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  ربط بفعالية أو حدث محدد (اختياري)
                </label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="glass-input text-xs w-full py-2"
                >
                  <option value="">-- بدون ارتباط بفعالية محددة (مهمة مستقلة) --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>
                  ))}
                </select>
              </div>

              {/* Next Step Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('assignees')}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  <span>التالي: اختيار المكلفين بالاسم</span>
                  <Users className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNEES (REAL MEMBERS BINDING) */}
          {activeSection === 'assignees' && (
            <div className="space-y-3.5 animate-in fade-in">
              
              {/* Filter and Bulk Actions Bar */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  
                  {/* Search Member */}
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="بحث بالاسم، الكود التطوعي، أو المنصب..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="glass-input text-xs w-full pr-9 py-1.5"
                    />
                  </div>

                  {/* Committee filter */}
                  <select
                    value={memberFilterComm}
                    onChange={(e) => setMemberFilterComm(e.target.value)}
                    className="glass-input text-xs sm:w-48 py-1.5"
                  >
                    <option value="match_comm">أعضاء لجنة المهمة ({currentComm?.name})</option>
                    <option value="all">جميع المتطوعين في المنصة</option>
                    {committees.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Bulk Select Action Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllInView}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>تحديد المعروضين بالكامل ({displayedMembers.length})</span>
                    </button>

                    {selectedMemberIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeselectAllInView}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-all"
                      >
                        إلغاء التحديد
                      </button>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    تم تكليف <strong className="text-amber-400 font-mono font-bold">{selectedMemberIds.length}</strong> عضو
                  </span>
                </div>
              </div>

              {/* AI Recommendations Quick Select */}
              {aiRecommendations.length > 0 && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      <span>ترشيحات الذكاء الاصطناعي الأكثر ملائمة للمهمة:</span>
                    </span>
                    <span className="text-[10px] text-purple-300">أعلى مطابقة للمهارات</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiRecommendations.slice(0, 4).map(({ member, matchScore, reason }) => {
                      const isSelected = selectedMemberIds.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => toggleMemberSelection(member.id)}
                          className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected 
                              ? 'bg-blue-600/30 border-blue-400 text-white shadow-md' 
                              : 'bg-slate-950/80 border-slate-800 hover:border-purple-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={member.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{member.fullName}</div>
                              <div className="text-[10px] text-slate-400 truncate">{reason}</div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-purple-400 font-mono shrink-0">
                            {matchScore}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Members Real Grid */}
              <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5">
                {displayedMembers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                    لا يوجد أعضاء مطابقين لمعايير البحث في هذه اللجنة
                  </div>
                ) : (
                  displayedMembers.map(member => {
                    const isSelected = selectedMemberIds.includes(member.id);
                    const commName = committees.find(c => c.id === member.currentCommitteeId)?.name || 'غير مسكن';

                    return (
                      <div
                        key={member.id}
                        onClick={() => toggleMemberSelection(member.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-600/25 border-blue-400 text-white shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/90 hover:bg-slate-900/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative">
                            <img 
                              src={member.avatarUrl} 
                              alt="" 
                              className="w-8 h-8 rounded-xl object-cover border border-white/10" 
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">{member.fullName}</span>
                              {member.volunteerId && (
                                <span className="text-[10px] font-mono text-slate-400">#{member.volunteerId}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="text-blue-300">{commName}</span>
                              <span>•</span>
                              <span>{member.points || 0} XP</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-400 text-white' 
                              : 'border-slate-700 bg-slate-900'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('details')}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  السابق: التفاصيل
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('checklist')}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  <span>التالي: خطوات التنفيذ والمرفقات</span>
                  <Layers className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST & ATTACHMENTS & VOICE */}
          {activeSection === 'checklist' && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Subtasks Checklist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    خطوات التنفيذ وقائمة التحقق (Subtasks Checklist)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">{subtasksList.length} خطوات</span>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    placeholder="إضافة خطوة تنفيذية (مثال: فحص التجهيزات، إرسال المسودة...)"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); }}}
                    className="glass-input text-xs flex-1"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddSubtask}
                    className="btn-secondary text-xs px-3.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة خطوة</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {subtasksList.map((sub, idx) => (
                    <div key={sub.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
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
                <label className="block text-xs font-bold text-slate-200 mb-1.5">المهارات المطلوبة للمهمة</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    placeholder="مثال: إدارة الحشود، تنظيم مسارح، جرافيك ديزاين..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                    className="glass-input text-xs flex-1"
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
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-400 cursor-pointer mr-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Voice Briefing Recorder */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-blue-400" />
                  <span>تسجيل توجيه صوتي للمهمة (Voice Briefing للمكلفين)</span>
                </label>
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
                  label="مستندات ومراجع المهمة (ملفات Word, PDF, Excel, صور...)"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('assignees')}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  السابق: المكلفين
                </button>
              </div>
            </div>
          )}

          {/* Validation Banner if missing required fields */}
          {(selectedMemberIds.length === 0 || !title.trim()) && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                {!title.trim() 
                  ? 'يرجى كتابة عنوان المهمة' 
                  : 'يرجى اختيار وتكليف متطوع واحد على الأقل من تبويب "اختيار وتكليف المتطوعين"'}
              </span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2.5 px-5 cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={selectedMemberIds.length === 0 || !title.trim()}
              className="btn-primary text-xs py-2.5 px-7 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>إنشاء وإرسال التكليفات فوراً 🚀 ({selectedMemberIds.length} عضو)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
