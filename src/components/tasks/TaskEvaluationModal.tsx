import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { X, Star, Award, CheckCircle2, MessageSquare, Zap } from 'lucide-react';

interface TaskEvaluationModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskEvaluationModal: React.FC<TaskEvaluationModalProps> = ({ task, isOpen, onClose }) => {
  const { evaluateTask, currentUser } = useApp();

  const maxPts = task ? (task.maxPoints || task.xpReward || 30) : 30;

  const [qualityScore, setQualityScore] = useState<number>(5);
  const [accuracyScore, setAccuracyScore] = useState<number>(5);
  const [commitmentScore, setCommitmentScore] = useState<number>(5);
  const [awardedPoints, setAwardedPoints] = useState<number>(maxPts);
  const [notes, setNotes] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    evaluateTask(task.id, {
      qualityScore,
      accuracyScore,
      commitmentScore,
      notes: notes.trim() || 'عمل متميز وإنجاز متقن.',
      feedback: notes.trim(),
      evaluatedBy: currentUser.fullName,
      evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }, Number(awardedPoints) || maxPts);

    onClose();
  };

  const renderStarPicker = (val: number, setVal: (v: number) => void, label: string) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
      <span className="text-xs font-bold text-slate-300">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setVal(star)}
            className="p-1 text-slate-600 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Star className={`w-5 h-5 ${star <= val ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
          </button>
        ))}
        <span className="text-xs font-mono font-bold text-amber-400 mr-2">{val}/5</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-lg w-full p-6 border border-amber-500/30 shadow-2xl bg-slate-950 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تقييم واعتماد مخرجات المهمة</h3>
              <p className="text-xs text-slate-400">{task.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volunteer Submission Review */}
        {task.submission && (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs mb-4">
            <div className="font-bold text-white mb-1">ملاحظات تسليم المتطوع:</div>
            <p className="text-slate-300 mb-2">{task.submission.notes}</p>
            {task.submission.fileUrls && task.submission.fileUrls.length > 0 && (
              <div className="text-sky-400 text-[11px] truncate">
                الرابط: {task.submission.fileUrls[0]}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {renderStarPicker(qualityScore, setQualityScore, 'جودة المخرجات والتنسيق')}
          {renderStarPicker(accuracyScore, setAccuracyScore, 'الدقة ومطابقة المواصفات')}
          {renderStarPicker(commitmentScore, setCommitmentScore, 'الالتزام بالموعد النهائي')}

          {/* Custom Awarded Points Input out of Max Points */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">منح نقاط الخبرة المستحقة (XP):</span>
                <span className="text-[10px] text-slate-400">حدد الدرجة المستحقة من إجمالي نقاط المهمة ({maxPts} XP)</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max={maxPts}
                value={awardedPoints}
                onChange={(e) => setAwardedPoints(Math.max(0, Math.min(maxPts, Number(e.target.value))))}
                className="w-16 bg-slate-900 border border-blue-400/50 rounded-lg py-1 px-2 text-center font-mono font-black text-amber-400 text-sm outline-none"
              />
              <span className="text-xs text-slate-400 font-mono font-bold">/ {maxPts}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">الملاحظات والتغذية الراجعة (Feedback)</label>
            <textarea
              rows={3}
              placeholder="اكتب تعليقك المشجع أو التعديلات المطلوبة للمستقبل..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input text-xs"
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
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد التقييم ومنح +{awardedPoints} XP ⭐</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

