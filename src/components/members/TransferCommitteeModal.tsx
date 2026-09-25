import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { X, ArrowRightLeft } from 'lucide-react';

interface TransferCommitteeModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferCommitteeModal: React.FC<TransferCommitteeModalProps> = ({
  member,
  isOpen,
  onClose
}) => {
  const { committees, transferMemberCommittee } = useApp();

  const [newCommId, setNewCommId] = useState(committees[0]?.id || '');
  const [reason, setReason] = useState('');

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommId || !reason.trim()) return;

    transferMemberCommittee(member.id, newCommId, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-md w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">نقل العضو إلى لجنة أخرى</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs mb-4">
          <div className="text-slate-400">العضو: <strong className="text-white">{member.fullName}</strong></div>
          <div className="text-slate-400 mt-0.5">اللجنة الحالية: <strong className="text-blue-400">{member.currentCommitteeName}</strong></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اللجنة الجديدة المراد النقل إليها *</label>
            <select
              value={newCommId}
              onChange={(e) => setNewCommId(e.target.value)}
              className="glass-input text-xs"
            >
              {committees.filter(c => c.id !== member.currentCommitteeId).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">سبب وتفاصيل قرار النقل *</label>
            <textarea
              rows={3}
              required
              placeholder="اكتب أسباب النقل (رغبة العضو، حاجة العمل الميداني، إثبات كفاءة)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4 cursor-pointer">
              إلغاء
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer">
              <span>تأكيد النقل وتوثيق السجل</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
