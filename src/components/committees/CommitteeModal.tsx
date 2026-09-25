import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Layers, Plus, Trash2 } from 'lucide-react';

interface CommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommitteeModal: React.FC<CommitteeModalProps> = ({ isOpen, onClose }) => {
  const { members, createCommittee } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headId, setHeadId] = useState(members[0]?.id || '');
  const [coHeadId, setCoHeadId] = useState('');
  const [viceId, setViceId] = useState(members[1]?.id || '');
  const [secondViceId, setSecondViceId] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [respInput, setRespInput] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>(['متابعة وتنفيذ مهام الفعاليات']);

  if (!isOpen) return null;

  const handleAddResp = () => {
    if (respInput.trim() && !responsibilities.includes(respInput.trim())) {
      setResponsibilities([...responsibilities, respInput.trim()]);
      setRespInput('');
    }
  };

  const handleRemoveResp = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const headMember = members.find(m => m.id === headId);
    const coHeadMember = members.find(m => m.id === coHeadId);
    const viceMember = members.find(m => m.id === viceId);
    const secondViceMember = members.find(m => m.id === secondViceId);

    const headsList = [headMember, coHeadMember].filter(Boolean) as typeof members;
    const vicesList = [viceMember, secondViceMember].filter(Boolean) as typeof members;

    createCommittee({
      name,
      code: code.trim().toUpperCase() || 'COMM',
      description,
      responsibilities,
      headId: headMember?.id || headId,
      headName: headMember ? headMember.fullName : 'لم يحدد',
      headIds: headsList.map(h => h.id),
      headNames: headsList.map(h => h.fullName),
      coHeadIds: coHeadMember ? [coHeadMember.id] : [],
      coHeadNames: coHeadMember ? [coHeadMember.fullName] : [],
      viceId: viceMember?.id || viceId,
      viceName: viceMember ? viceMember.fullName : 'لم يحدد',
      viceIds: vicesList.map(v => v.id),
      viceNames: vicesList.map(v => v.fullName),
      color
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-lg w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إنشاء لجنة جديدة (Dynamic Committee)</h3>
              <p className="text-xs text-slate-400">إضافة لجنة تخصصية فورياً بدون الحاجة لتعديل الكود</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم اللجنة *</label>
              <input 
                type="text"
                required
                placeholder="مثال: لجنة التنظيم / المونتاج / التصميم..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الكود (Code)</label>
              <input 
                type="text"
                placeholder="OC"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="glass-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">وصف دور واختصاص اللجنة</label>
            <textarea 
              rows={2}
              placeholder="وصف مختصر لمسؤوليات اللجنة في أنشطة الاتحاد..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-sky-300 mb-1">👑 رئيس اللجنة الرئيسي (Head)</label>
              <select
                value={headId}
                onChange={(e) => setHeadId(e.target.value)}
                className="glass-input text-xs"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.currentCommitteeName || 'متطوع'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-400 mb-1">👑 رئيس مشارك اختياري (Co-Head)</label>
              <select
                value={coHeadId}
                onChange={(e) => setCoHeadId(e.target.value)}
                className="glass-input text-xs"
              >
                <option value="">-- بدون رئيس مشارك --</option>
                {members.filter(m => m.id !== headId).map(m => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">🥈 نائب رئيس اللجنة 1 (Vice Head)</label>
              <select
                value={viceId}
                onChange={(e) => setViceId(e.target.value)}
                className="glass-input text-xs"
              >
                <option value="">-- بدون نائب حالياً --</option>
                {members.filter(m => m.id !== headId && m.id !== coHeadId).map(m => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">🥈 نائب رئيس اللجنة 2 (Second Vice)</label>
              <select
                value={secondViceId}
                onChange={(e) => setSecondViceId(e.target.value)}
                className="glass-input text-xs"
              >
                <option value="">-- بدون نائب ثانٍ --</option>
                {members.filter(m => m.id !== headId && m.id !== coHeadId && m.id !== viceId).map(m => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Responsibilities list */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">مسؤوليات ومهام اللجنة الأساسية</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text"
                placeholder="أضف مسؤولية محددة..."
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                className="glass-input text-xs"
              />
              <button 
                type="button" 
                onClick={handleAddResp}
                className="btn-secondary text-xs px-3 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto">
              {responsibilities.map((resp, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-900 text-xs text-slate-300 flex items-center justify-between border border-slate-800">
                  <span>• {resp}</span>
                  <button type="button" onClick={() => handleRemoveResp(idx)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4 cursor-pointer">
              إلغاء
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer">
              <span>إنشاء اللجنة الآن 🏛️</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
