import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EvaluationRubric, EvaluationCriterion, GradeThresholds } from '../../types';
import { X, Sliders, Plus, Trash2, Sparkles, Award, ShieldAlert } from 'lucide-react';

interface EvaluationRubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvaluationRubricModal: React.FC<EvaluationRubricModalProps> = ({
  isOpen,
  onClose
}) => {
  const { evaluationRubric, updateEvaluationRubric, currentUser } = useApp();

  const isHighLeadership = 
    currentUser.role === 'super_admin' || 
    currentUser.role === 'vice_president' || 
    currentUser.role === 'advisor';

  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gradeThresholds, setGradeThresholds] = useState<GradeThresholds>({
    gradeAPlus: 95,
    gradeA: 85,
    gradeB: 75,
    gradeC: 65,
    gradeD: 50
  });

  useEffect(() => {
    if (isOpen) {
      setCriteria(evaluationRubric.criteria.map(c => ({ ...c })));
      setTitle(evaluationRubric.title);
      setDescription(evaluationRubric.description);
      if (evaluationRubric.gradeThresholds) {
        setGradeThresholds({ ...evaluationRubric.gradeThresholds });
      }
    }
  }, [isOpen, evaluationRubric]);

  if (!isOpen) return null;

  const totalMaxPoints = criteria.reduce((acc, curr) => acc + (Number(curr.maxPoints) || 0), 0);

  const handleAddCriterion = () => {
    if (!isHighLeadership) return;
    const newCrit: EvaluationCriterion = {
      id: `crit-${Date.now()}`,
      name: 'معيار تقييم جديد',
      maxPoints: 25,
      description: 'وصف آلية احتساب النقاط لهذا البند'
    };
    setCriteria(prev => [...prev, newCrit]);
  };

  const handleUpdateCriterion = (id: string, field: keyof EvaluationCriterion, value: any) => {
    if (!isHighLeadership) return;
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteCriterion = (id: string) => {
    if (!isHighLeadership) return;
    if (criteria.length <= 1) {
      alert('يجب أن يتضمن التقييم معياراً واحداً على الأقل.');
      return;
    }
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isHighLeadership) {
      alert('عفواً! تعديل معايير التقييم ونسب التقديرات مقتصر حصرياً على القيادة العليا.');
      return;
    }

    if (criteria.length === 0) {
      alert('يرجى إضافة معايير التقييم أولاً.');
      return;
    }

    const updatedRubric: EvaluationRubric = {
      ...evaluationRubric,
      title: title.trim() || 'معايير التقييم الشامل الموحدة',
      description: description.trim(),
      criteria,
      gradeThresholds,
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
                تخصيص معايير التقييم ونسب التقديرات (A, B, C)
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

        {!isHighLeadership && (
          <div className="p-3 mb-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 flex items-center gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>تنبيه: يمكنك استعراض المعايير المعتمدة فقط، التعديل متاح حصرياً للقيادة العليا ورئيس الفريق.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Rubric Title & Info */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">عنوان وثيقة المعايير المعتمدة *</label>
            <input
              type="text"
              value={title}
              disabled={!isHighLeadership}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full text-xs disabled:opacity-60"
              required
            />
          </div>

          {/* Criteria List Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>بنود ومعايير التقييم والنقاط المخصصة (من 100 نقطة):</span>
              </span>

              {isHighLeadership && (
                <button
                  type="button"
                  onClick={handleAddCriterion}
                  className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1 cursor-pointer hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>إضافة بند جديد</span>
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {criteria.map((crit, index) => (
                <div key={crit.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-400 mb-1">اسم البند أو المعيار {index + 1}</label>
                      <input
                        type="text"
                        value={crit.name}
                        disabled={!isHighLeadership}
                        onChange={(e) => handleUpdateCriterion(crit.id, 'name', e.target.value)}
                        className="glass-input w-full text-xs disabled:opacity-60"
                        placeholder="مثال: الالتزام بالحضور، تنفيذ المهام..."
                        required
                      />
                    </div>

                    <div className="w-28">
                      <label className="block text-[10px] text-amber-300 font-bold mb-1">الدرجة المخصصة</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={crit.maxPoints}
                        disabled={!isHighLeadership}
                        onChange={(e) => handleUpdateCriterion(crit.id, 'maxPoints', Number(e.target.value))}
                        className="glass-input w-full text-xs font-mono font-bold text-amber-400 text-center disabled:opacity-60"
                        required
                      />
                    </div>

                    {isHighLeadership && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCriterion(crit.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer mt-5"
                        title="حذف هذا البند"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={crit.description}
                      disabled={!isHighLeadership}
                      onChange={(e) => handleUpdateCriterion(crit.id, 'description', e.target.value)}
                      className="glass-input w-full text-[11px] text-slate-300 disabled:opacity-60"
                      placeholder="وصف مختصر لمعايير احتساب الدرجات..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Thresholds (A+, A, B, C, D) Customization */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>الحدود الدنيا لنسب التقديرات الشاملة (%):</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <span className="block font-black text-emerald-400 text-xs mb-1">امتياز مرتفع A+</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    disabled={!isHighLeadership}
                    value={gradeThresholds.gradeAPlus}
                    onChange={(e) => setGradeThresholds(prev => ({ ...prev, gradeAPlus: Number(e.target.value) }))}
                    className="w-14 text-center font-mono font-bold bg-slate-950/80 border border-emerald-500/40 rounded px-1.5 py-0.5 text-xs text-emerald-300 disabled:opacity-60"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/30">
                <span className="block font-black text-teal-400 text-xs mb-1">امتياز A</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="40"
                    max="100"
                    disabled={!isHighLeadership}
                    value={gradeThresholds.gradeA}
                    onChange={(e) => setGradeThresholds(prev => ({ ...prev, gradeA: Number(e.target.value) }))}
                    className="w-14 text-center font-mono font-bold bg-slate-950/80 border border-teal-500/40 rounded px-1.5 py-0.5 text-xs text-teal-300 disabled:opacity-60"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30">
                <span className="block font-black text-blue-400 text-xs mb-1">جيد جداً B</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="30"
                    max="100"
                    disabled={!isHighLeadership}
                    value={gradeThresholds.gradeB}
                    onChange={(e) => setGradeThresholds(prev => ({ ...prev, gradeB: Number(e.target.value) }))}
                    className="w-14 text-center font-mono font-bold bg-slate-950/80 border border-blue-500/40 rounded px-1.5 py-0.5 text-xs text-blue-300 disabled:opacity-60"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30">
                <span className="block font-black text-amber-400 text-xs mb-1">جيد C</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="20"
                    max="100"
                    disabled={!isHighLeadership}
                    value={gradeThresholds.gradeC}
                    onChange={(e) => setGradeThresholds(prev => ({ ...prev, gradeC: Number(e.target.value) }))}
                    className="w-14 text-center font-mono font-bold bg-slate-950/80 border border-amber-500/40 rounded px-1.5 py-0.5 text-xs text-amber-300 disabled:opacity-60"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30">
                <span className="block font-black text-rose-400 text-xs mb-1">مقبول D</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="10"
                    max="100"
                    disabled={!isHighLeadership}
                    value={gradeThresholds.gradeD}
                    onChange={(e) => setGradeThresholds(prev => ({ ...prev, gradeD: Number(e.target.value) }))}
                    className="w-14 text-center font-mono font-bold bg-slate-950/80 border border-rose-500/40 rounded px-1.5 py-0.5 text-xs text-rose-300 disabled:opacity-60"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Score Summary Bar */}
          <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">إجمالي نقاط التقييم الكاملة:</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-lg font-mono font-black ${totalMaxPoints === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {totalMaxPoints}
              </span>
              <span className="text-xs text-slate-400">نقطة موحدة (المعياري: 100 نقطة)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              {isHighLeadership ? 'إلغاء' : 'إغلاق'}
            </button>
            {isHighLeadership && (
              <button
                type="submit"
                className="btn-primary text-xs py-2 px-5 cursor-pointer shadow-lg"
              >
                حفظ واعتماد المعايير ونسب التقديرات
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};

