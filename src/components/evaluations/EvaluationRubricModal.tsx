import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EvaluationRubric, EvaluationCriterion } from '../../types';
import { X, Sliders, Plus, Trash2, ShieldCheck, Check, AlertCircle, Sparkles } from 'lucide-react';

interface EvaluationRubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvaluationRubricModal: React.FC<EvaluationRubricModalProps> = ({
  isOpen,
  onClose
}) => {
  const { evaluationRubric, updateEvaluationRubric, currentUser } = useApp();

  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCriteria(evaluationRubric.criteria.map(c => ({ ...c })));
      setTitle(evaluationRubric.title);
      setDescription(evaluationRubric.description);
    }
  }, [isOpen, evaluationRubric]);

  if (!isOpen) return null;

  const totalMaxPoints = criteria.reduce((acc, curr) => acc + (Number(curr.maxPoints) || 0), 0);

  const handleAddCriterion = () => {
    const newCrit: EvaluationCriterion = {
      id: `crit-${Date.now()}`,
      name: 'معيار تقييم جديد',
      maxPoints: 25,
      description: 'وصف آلية احتساب النقاط لهذا البند'
    };
    setCriteria(prev => [...prev, newCrit]);
  };

  const handleUpdateCriterion = (id: string, field: keyof EvaluationCriterion, value: any) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteCriterion = (id: string) => {
    if (criteria.length <= 1) {
      alert('يجب أن يتضمن التقييم معياراً واحداً على الأقل.');
      return;
    }
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (criteria.length === 0) {
      alert('يرجى إضافة معايير التقييم أولاً.');
      return;
    }

    const updatedRubric: EvaluationRubric = {
      ...evaluationRubric,
      title: title.trim() || 'معايير التقييم الشامل الموحدة',
      description: description.trim(),
      criteria,
      lastUpdatedBy: `${currentUser.fullName} (${currentUser.position || 'القيادة العليا'})`,
      lastUpdatedAt: new Date().toISOString().split('T')[0]
    };

    updateEvaluationRubric(updatedRubric);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 border border-blue-500/40 bg-slate-950 text-right shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                تخصيص بنود ونقاط معايير التقييم الموحدة
              </h3>
              <p className="text-[11px] text-slate-400">
                صلاحية حصرية لرئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية والقيادة العليا
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

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Rubric Title & Info */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">عنوان وثيقة المعايير المعتمدة *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full text-xs"
              required
            />
          </div>

          {/* Criteria List Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>بنود ومعايير التقييم والنقاط المخصصة:</span>
              </span>

              <button
                type="button"
                onClick={handleAddCriterion}
                className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1 cursor-pointer hover:text-white"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>إضافة بند جديد</span>
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {criteria.map((crit, index) => (
                <div key={crit.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-400 mb-1">اسم البند أو المعيار {index + 1}</label>
                      <input
                        type="text"
                        value={crit.name}
                        onChange={(e) => handleUpdateCriterion(crit.id, 'name', e.target.value)}
                        className="glass-input w-full text-xs"
                        placeholder="مثال: الالتزام بالمواعيد..."
                        required
                      />
                    </div>

                    <div className="w-28">
                      <label className="block text-[10px] text-amber-300 font-bold mb-1">الحد الأقصى للنقاط</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={crit.maxPoints}
                        onChange={(e) => handleUpdateCriterion(crit.id, 'maxPoints', Number(e.target.value))}
                        className="glass-input w-full text-xs font-mono font-bold text-amber-400 text-center"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCriterion(crit.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer mt-5"
                      title="حذف هذا البند"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={crit.description}
                      onChange={(e) => handleUpdateCriterion(crit.id, 'description', e.target.value)}
                      className="glass-input w-full text-[11px] text-slate-300"
                      placeholder="وصف مختصر لمعايير احتساب الدرجات..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Score Summary Bar */}
          <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">إجمالي نقاط التقييم الكاملة:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-mono font-black text-amber-400">{totalMaxPoints}</span>
              <span className="text-xs text-slate-400">نقطة موحدة</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 cursor-pointer shadow-lg"
            >
              حفظ واعتماد المعايير الموحدة
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
