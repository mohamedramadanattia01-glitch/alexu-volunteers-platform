import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Plus, X } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose }) => {
  const { committees, createEvent } = useApp();

  const [name, setName] = useState('');
  const [date, setDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('09:00 ص');
  const [endTime, setEndTime] = useState('04:00 م');
  const [location, setLocation] = useState('مركز مؤتمرات جامعة الإسكندرية');
  const [description, setDescription] = useState('');
  const [expectedMembersCount, setExpectedMembersCount] = useState(30);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Default quotas
    const quotas: Record<string, any> = {};
    committees.forEach(c => {
      quotas[c.id] = {
        committeeId: c.id,
        committeeName: c.name,
        required: Math.round(expectedMembersCount / committees.length),
        assigned: Math.round(expectedMembersCount / committees.length),
        present: 0
      };
    });

    createEvent({
      name,
      date,
      startTime,
      endTime,
      location,
      description,
      expectedMembersCount,
      committeeQuotas: quotas,
      status: 'Planned'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-lg w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">إضافة فعالية كبرى جديدة</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم الفعالية *</label>
            <input 
              type="text"
              required
              placeholder="مثال: هاكاثون الابتكار 2026..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">التاريخ</label>
              <input 
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">بدء الفعالية</label>
              <input 
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">انتهاء الفعالية</label>
              <input 
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">مكان انعقاد الفعالية الميداني</label>
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">العدد المستهدف من المتطوعين</label>
            <input 
              type="number"
              value={expectedMembersCount}
              onChange={(e) => setExpectedMembersCount(Number(e.target.value))}
              className="glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">وصف وأهداف الفعالية</label>
            <textarea 
              rows={2}
              placeholder="اكتب نبذة عن الفعالية..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4 cursor-pointer">
              إلغاء
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer">
              <span>جدولة الفعالية</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
