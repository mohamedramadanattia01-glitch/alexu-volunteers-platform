import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, X } from 'lucide-react';
import { ALEXANDRIA_UNIVERSITY_COLLEGES } from '../../data/colleges';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { committees, addMember } = useApp();

  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState<string>(ALEXANDRIA_UNIVERSITY_COLLEGES[1]); // كلية الهندسة
  const [academicYear, setAcademicYear] = useState('الفرقة الثانية');
  const [whatsappNumber, setWhatsappNumber] = useState('+2010');
  const [nationalId, setNationalId] = useState('30501010200000');
  const [committeeId, setCommitteeId] = useState(committees[0]?.id || 'comm-org');
  const [position, setPosition] = useState('عضو متطوع');

  if (!isOpen) return null;

  const currentComm = committees.find(c => c.id === committeeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    addMember({
      fullName,
      college,
      academicYear,
      whatsappNumber,
      nationalId,
      currentCommitteeId: committeeId,
      currentCommitteeName: currentComm ? currentComm.name : 'لجنة التنظيم',
      position
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-lg w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">إضافة متطوع جديد للفريق</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الرباعي *</label>
            <input 
              type="text"
              required
              placeholder="مثال: يوسف أحمد محمد عثمان..."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الكلية (جامعة الإسكندرية)</label>
              <select 
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="glass-input text-xs bg-slate-900"
              >
                {ALEXANDRIA_UNIVERSITY_COLLEGES.map(c => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الفرقة الدراسية</label>
              <input 
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="glass-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رقم الواتساب</label>
              <input 
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="glass-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الرقم القومي (14 رقم)</label>
              <input 
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="glass-input text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اللجنة المسند إليها</label>
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
              <label className="block text-xs font-bold text-slate-300 mb-1">المسمى التشغيلي</label>
              <input 
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="glass-input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4 cursor-pointer">
              إلغاء
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer">
              <span>حفظ وإضافة المتطوع</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
