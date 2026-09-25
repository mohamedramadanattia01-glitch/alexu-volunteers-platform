import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskAttachment } from '../../types';
import { X, Send, FileText, CheckCircle2, AlertTriangle, Check, Shield } from 'lucide-react';
import { FileAttachmentUploader } from '../common/FileAttachmentUploader';

interface TaskSubmissionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({ task, isOpen, onClose }) => {
  const { submitTask, setTaskStance } = useApp();

  const [activeAction, setActiveAction] = useState<'submit' | 'commit' | 'excuse'>('submit');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [excuseReason, setExcuseReason] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmitDeliverables = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    submitTask(task.id, notes.trim(), attachments);
    onClose();
  };

  const handleConfirmCommitment = () => {
    setTaskStance(task.id, 'Committed');
    onClose();
  };

  const handleSubmitExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excuseReason.trim()) return;
    setTaskStance(task.id, 'Excused', excuseReason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-lg w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إجراء وموقف المهمة</h3>
              <p className="text-xs text-slate-400 font-semibold truncate max-w-xs">{task.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Choice Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveAction('submit')}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeAction === 'submit' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>تسليم المخرجات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('commit')}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeAction === 'commit' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تأكيد الالتزام</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('excuse')}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeAction === 'excuse' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>الاعتذار بالسبب</span>
          </button>
        </div>

        {/* Tab 1: Submit Deliverables */}
        {activeAction === 'submit' && (
          <form onSubmit={handleSubmitDeliverables} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات وتقرير تسليم المهمة بالتفصيل *</label>
              <textarea
                rows={4}
                required
                placeholder="اكتب ملخص ما قمت بإنجازه، تفاصيل المخرجات، وأي توضيحات تود إبلاغ قائد اللجنة بها..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="glass-input text-xs"
              />
            </div>

            {/* File Attachments Uploader for All File Formats */}
            <div>
              <FileAttachmentUploader
                attachments={attachments}
                onChange={setAttachments}
                label="إرفاق ملفات المخرجات (يقبل كافة الصيغ: صور، وورد، PDF، باوربوينت، إكسل، أرشيف مضغوط...)"
              />
            </div>

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
                className="btn-primary text-xs py-2.5 px-6 font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال تقرير التسليم للمراجعة 🚀</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Confirm Commitment */}
        {activeAction === 'commit' && (
          <div className="space-y-4 animate-in fade-in text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-1">تأكيد الالتزام وبدء التنفيذ</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                بالضغط على الزر أدناه، تؤكد استلامك الكامل للمهمة والتزامك بتسليمها قبل الموعد النهائي المحدد: ({task.deadline}).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-right space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>المكافأة المتوقعة:</span>
                <span className="text-amber-400 font-bold font-mono">+{task.xpReward || 25} XP</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>اللجنة المشرفة:</span>
                <span className="text-white font-medium">{task.committeeName}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleConfirmCommitment}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5 px-6 rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>أؤكد التزامي بالمهمة ✓</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Excuse / Decline with Reason */}
        {activeAction === 'excuse' && (
          <form onSubmit={handleSubmitExcuse} className="space-y-4 animate-in fade-in">
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">
                <span className="font-bold block mb-0.5">الاعتذار عن أداء المهمة:</span>
                <span>يرجى توضيح سبب الاعتذار بشفافية ليتمكن قائد اللجنة من إعادة إسناد المهمة لمتطوع آخر دون تأخير الخطة.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">سبب الاعتذار بالتفصيل *</label>
              <textarea
                rows={4}
                required
                placeholder="مثال: تعارض مع موعد امتحان عملي بالكلية / ظروف صحية طارئة..."
                value={excuseReason}
                onChange={(e) => setExcuseReason(e.target.value)}
                className="glass-input text-xs border-rose-500/30 focus:border-rose-400"
              />
            </div>

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
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs py-2.5 px-6 rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>إرسال الاعتذار لقائد اللجنة</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

