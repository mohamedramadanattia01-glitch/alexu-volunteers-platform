import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { 
  CheckSquare, Plus, Search, Filter, Clock, 
  CheckCircle2, AlertCircle, Sparkles, User, FileText, ChevronLeft,
  Trash2, Edit3, ShieldAlert, X, Save, ExternalLink, Check, ListChecks,
  Paperclip, Download, Mic, File
} from 'lucide-react';
import { VoicePlayer } from '../common/VoicePlayer';
import { CommitteeBadge } from '../common/CommitteeBadge';

interface TaskManagerProps {
  onOpenNewTask: () => void;
  onOpenSubmissionModal: (task: Task) => void;
  onOpenEvaluationModal: (task: Task) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  onOpenNewTask,
  onOpenSubmissionModal,
  onOpenEvaluationModal
}) => {
  const { tasks, committees, currentUser, isHighLeadership, deleteTask, updateTask, toggleTaskSubtask, showNotification } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Task delete and quick edit states
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Task['priority']>('Medium');
  const [editDeadline, setEditDeadline] = useState('');

  const canCreateTask = isHighLeadership || ['head', 'vice_head', 'hr_admin', 'event_manager'].includes(currentUser.role);

  const filteredTasks = tasks.filter(task => {
    // Regular members ONLY see their own assigned tasks
    if (currentUser.role === 'member') {
      const isAssigned = (task.assignedToMemberIds || []).includes(currentUser.id);
      if (!isAssigned) return false;
    }
    const matchesComm = selectedCommittee === 'all' || task.committeeId === selectedCommittee;
    const matchesSearch = task.title.includes(searchQuery) || task.description.includes(searchQuery);
    return matchesComm && matchesSearch;
  });

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'Assigned', label: 'تم الإسناد', color: 'border-blue-500/40 bg-blue-950/20' },
    { id: 'In Progress', label: 'قيد التنفيذ', color: 'border-sky-500/40 bg-sky-950/20' },
    { id: 'Submitted', label: 'تسليمات للمراجعة', color: 'border-amber-500/40 bg-amber-950/20' },
    { id: 'Approved', label: 'معتمدة ومكتملة', color: 'border-emerald-500/40 bg-emerald-950/20' },
    { id: 'Overdue', label: 'متأخرة', color: 'border-rose-500/40 bg-rose-950/20' },
  ];

  const handleStartEdit = (task: Task) => {
    setTaskToEdit(task);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditDeadline(task.deadline);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToEdit || !editTitle.trim()) return;

    updateTask(taskToEdit.id, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      deadline: editDeadline
    });

    showNotification('success', 'تم تعديل بيانات المهمة بنجاح');
    setTaskToEdit(null);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    showNotification('success', `تم حذف المهمة "${taskToDelete.title}" بنجاح`);
    setTaskToDelete(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-10">
      
      {/* Header */}
      <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              {currentUser.role === 'member' ? 'مهامي الميدانية والتنظيمية' : 'دورة العمل والتشغيل الميداني'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {currentUser.role === 'member' ? 'سجل المهام المسندة إليّ' : 'نظام إدارة وتوزيع المهام (Task Workflow)'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser.role === 'member'
              ? 'تابع مهامك المسندة، أكد التزامك أو اعتذر بالسبب، وارفع مخرجاتك لاعتمادها وحصد الـ XP'
              : 'متابعة شاملة من الإنشاء والإسناد بالذكاء الاصطناعي حتى التسليم والمراجعة والتقييم'}
          </p>
        </div>

        {canCreateTask && (
          <button
            onClick={onOpenNewTask}
            className="btn-primary text-xs py-2 px-3.5 cursor-pointer shadow-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء مهمة جديدة</span>
          </button>
        )}
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="glass-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في المهام..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input text-xs pr-9 py-2"
            />
          </div>

          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="glass-input text-xs w-full sm:w-44 py-2"
          >
            <option value="all">جميع اللجان</option>
            {committees.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Kanban vs List Switch */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            لوحة كانبان (Kanban)
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            قائمة جدولية
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => {
              if (col.id === 'Assigned') return t.status === 'Draft' || t.status === 'Assigned' || t.status === 'Accepted';
              if (col.id === 'Submitted') return t.status === 'Submitted' || t.status === 'Under Review';
              return t.status === col.id;
            });

            return (
              <div key={col.id} className={`rounded-2xl border p-3 flex flex-col gap-2.5 min-h-[450px] ${col.color}`}>
                
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white">{col.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colTasks.map(task => {
                    const isMyTask = task.assignedToMemberIds.includes(currentUser.id);
                    const canEvaluate = isHighLeadership || currentUser.role === 'head' || currentUser.role === 'vice_head';

                    return (
                      <div 
                        key={task.id}
                        className="glass-card p-3 border-slate-800 hover:border-blue-500/40 transition-all text-right space-y-2 bg-slate-900/90 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                            task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            task.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {task.priority === 'Critical' ? 'حرجة' : task.priority === 'High' ? 'عالية' : 'عادية'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-amber-400">
                              {task.status === 'Approved' && task.awardedPoints !== undefined
                                ? `+${task.awardedPoints}/${task.maxPoints || task.xpReward || 30} XP`
                                : `${task.maxPoints || task.xpReward || 30} XP`}
                            </span>
                            
                            {/* Leadership Quick Actions */}
                            {isHighLeadership && (
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => handleStartEdit(task)}
                                  title="تعديل المهمة"
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setTaskToDelete(task)}
                                  title="حذف المهمة"
                                  className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 hover:text-rose-200 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>

                        {/* Stance Badge (Commitment / Excuse) */}
                        {task.stance && (
                          <div className="pt-0.5">
                            {task.stance === 'Committed' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                <span>✓</span>
                                <span>تم تأكيد الالتزام</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold" title={`سبب الاعتذار: ${task.excuseReason || 'بدون سبب'}`}>
                                <span>⚠️</span>
                                <span className="truncate max-w-[150px]">معتذر: {task.excuseReason || 'عذر شخصي'}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Subtasks Checklist on Card */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-300 flex items-center gap-1">
                                <ListChecks className="w-3 h-3 text-blue-400" />
                                <span>خطوات التنفيذ</span>
                              </span>
                              <span className="font-mono text-slate-400 font-bold">
                                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                                style={{
                                  width: `${Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%`
                                }}
                              />
                            </div>

                            {/* Subtask items preview */}
                            <div className="space-y-1 pt-0.5 max-h-24 overflow-y-auto">
                              {task.subtasks.map(sub => (
                                <div 
                                  key={sub.id}
                                  onClick={() => (isMyTask || isHighLeadership) && toggleTaskSubtask(task.id, sub.id)}
                                  className={`flex items-center gap-1.5 text-[10px] p-1 rounded-md transition-all ${
                                    (isMyTask || isHighLeadership) ? 'cursor-pointer hover:bg-slate-800/80' : ''
                                  } ${sub.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                    sub.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 bg-slate-900'
                                  }`}>
                                    {sub.completed && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                  <span className="truncate">{sub.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Voice Briefing Note if recorded */}
                        {task.voiceNoteUrl && (
                          <div className="pt-1">
                            <VoicePlayer
                              audioUrl={task.voiceNoteUrl}
                              durationSeconds={task.voiceDuration || 15}
                              label="🎙️ توجيه صوتي من القائد"
                            />
                          </div>
                        )}

                        {/* Submission Deliverables / Attached Files */}
                        {((task.submission?.attachments && task.submission.attachments.length > 0) || 
                          (task.attachments && task.attachments.length > 0)) && (
                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-blue-400" />
                              <span>الملفات والمخرجات المرفوعة:</span>
                            </span>

                            {task.submission?.notes && (
                              <p className="text-[10px] text-slate-300 bg-slate-900 p-1.5 rounded-md border border-slate-800 line-clamp-2">
                                <strong className="text-emerald-400">تقرير التسليم: </strong>
                                {task.submission.notes}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1">
                              {[...(task.submission?.attachments || []), ...(task.attachments || [])].map((att, aIdx) => (
                                <a
                                  key={att.id || aIdx}
                                  href={att.url}
                                  download={att.name}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-900/40 hover:bg-blue-800 text-blue-200 text-[10px] border border-blue-500/30 transition-all font-medium truncate max-w-[170px]"
                                >
                                  <Download className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{att.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-300 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                          <div className="font-semibold text-slate-400 text-[9px] mb-0.5">المسند إليهم:</div>
                          <div className="text-white truncate">{task.assignedToMemberNames.join('، ')}</div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{task.deadline.split(' ')[0]}</span>
                          </span>
                          <CommitteeBadge committeeId={task.committeeId} committeeName={task.committeeName} size="sm" />
                        </div>

                        {/* Quick Contextual Action Buttons */}
                        <div className="pt-1">
                          {isMyTask && task.status !== 'Approved' && (
                            <button
                              onClick={() => onOpenSubmissionModal(task)}
                              className="btn-primary text-[10px] py-1.5 w-full cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>تحديد الموقف / تسليم المخرجات ⚡</span>
                            </button>
                          )}

                          {task.status === 'Submitted' && canEvaluate && (
                            <button
                              onClick={() => onOpenEvaluationModal(task)}
                              className="btn-secondary text-[10px] py-1.5 w-full text-amber-300 border-amber-500/40 hover:bg-amber-950/50 cursor-pointer mt-1"
                            >
                              <span>مراجعة وتقييم الجودة والدرجات ⭐</span>
                            </button>
                          )}

                          {task.status === 'Approved' && (
                            <div className="text-[9px] text-emerald-400 bg-emerald-950/30 p-1 rounded text-center border border-emerald-500/20 font-bold">
                              تم الاعتماد ({task.awardedPoints ?? task.maxPoints ?? 30}/{task.maxPoints || task.xpReward || 30} XP) ✓
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-card p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 font-bold">المهمة</th>
                  <th className="py-2.5 font-bold">اللجنة</th>
                  <th className="py-2.5 font-bold">المسند إليهم</th>
                  <th className="py-2.5 font-bold">الأولوية</th>
                  <th className="py-2.5 font-bold">الموعد النهائي</th>
                  <th className="py-2.5 font-bold">الحالة</th>
                  <th className="py-2.5 font-bold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-2.5 font-bold text-white max-w-xs truncate">{task.title}</td>
                    <td className="py-2.5 text-slate-300">{task.committeeName}</td>
                    <td className="py-2.5 text-slate-300">{task.assignedToMemberNames.join('، ')}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300' :
                        task.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-400">{task.deadline}</td>
                    <td className="py-2.5">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold w-fit ${
                          task.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          task.status === 'Submitted' ? 'bg-amber-500/20 text-amber-400' :
                          task.status === 'In Progress' ? 'bg-sky-500/20 text-sky-400' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {task.status}
                        </span>
                        {task.stance && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold w-fit ${
                            task.stance === 'Committed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {task.stance === 'Committed' ? 'ملتزم ✓' : 'معتذر ⚠️'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        {task.status === 'Submitted' ? (
                          <button 
                            onClick={() => onOpenEvaluationModal(task)}
                            className="text-xs text-amber-400 hover:underline cursor-pointer font-bold"
                          >
                            تقييم
                          </button>
                        ) : (
                          <button 
                            onClick={() => onOpenSubmissionModal(task)}
                            className="text-xs text-blue-400 hover:underline cursor-pointer font-bold"
                          >
                            موقف / تسليم
                          </button>
                        )}

                        {isHighLeadership && (
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                            title="حذف المهمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {taskToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/40">
              <h3 className="text-sm font-bold text-white">تعديل بيانات المهمة</h3>
              <button onClick={() => setTaskToEdit(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان المهمة</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="glass-input text-xs w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">وصف المهمة</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="glass-input text-xs w-full resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الأولوية</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="glass-input text-xs w-full"
                  >
                    <option value="Critical">حرجة (Critical)</option>
                    <option value="High">عالية (High)</option>
                    <option value="Medium">متوسطة (Medium)</option>
                    <option value="Low">منخفضة (Low)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الموعد النهائي</label>
                  <input
                    type="datetime-local"
                    value={editDeadline ? editDeadline.replace(' ', 'T') : ''}
                    onChange={(e) => setEditDeadline(e.target.value ? e.target.value.replace('T', ' ') : '')}
                    className="glass-input text-xs w-full font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTaskToEdit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-2xl shadow-2xl border border-rose-900/50 p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تأكيد حذف المهمة</h3>
              <p className="text-xs text-slate-400 mt-1">
                هل أنت متأكد من رغبتك في حذف المهمة <strong className="text-white">"{taskToDelete.title}"</strong>؟
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>نعم، تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
