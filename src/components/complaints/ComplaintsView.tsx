import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintStatus } from '../../types';
import { 
  MessageSquare, AlertCircle, Shield, CheckCircle2, Clock, 
  Send, Plus, Filter, Search, User, Lock, Sparkles, Check, ChevronDown, X, Star, ShieldAlert
} from 'lucide-react';

interface ComplaintsViewProps {
  onOpenNewComplaint?: () => void;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({ onOpenNewComplaint }) => {
  const { getVisibleComplaintsForUser, updateComplaintStatus, rateComplaintResolution, currentUser, isHighLeadership } = useApp();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState('');
  const [internalNotesText, setInternalNotesText] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Resolved');

  const visibleComplaints = getVisibleComplaintsForUser();

  const filteredComplaints = visibleComplaints.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.senderCommitteeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCount = visibleComplaints.length;
  const newCount = visibleComplaints.filter(c => c.status === 'New').length;
  const inProgressCount = visibleComplaints.filter(c => c.status === 'Under Review' || c.status === 'In Investigation').length;
  const resolvedCount = visibleComplaints.filter(c => c.status === 'Resolved').length;

  const canManageComplaints = isHighLeadership || currentUser.role === 'head' || currentUser.role === 'vice_head' || currentUser.role === 'hr_admin';

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    updateComplaintStatus(selectedComplaint.id, newStatus, responseText.trim(), internalNotesText.trim());
    setSelectedComplaint(null);
    setResponseText('');
    setInternalNotesText('');
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'administrative':
        return { label: 'شكوى إدارية', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'workload':
        return { label: 'ضغط مهام', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'interpersonal':
        return { label: 'خلافات باللجنة', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      case 'evaluation':
        return { label: 'تظلم تقييم', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'suggestion':
        return { label: 'مقترح تطوير', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'confidential':
        return { label: 'شكوى سرية 🔒', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      default:
        return { label: cat, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'New':
        return { label: 'جديدة 🔴', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'Under Review':
        return { label: 'قيد المراجعة 🟡', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'In Investigation':
        return { label: 'جاري التحقيق 🔵', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'Resolved':
        return { label: 'تم الحل والرد 🟢', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'Rejected':
        return { label: 'مرفوضة ⚪', color: 'bg-slate-700 text-slate-400 border-slate-600' };
    }
  };

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'Emergency':
        return { label: 'طوارئ 🚨', color: 'bg-rose-600/30 text-rose-300 border-rose-500 font-extrabold animate-pulse' };
      case 'High':
        return { label: 'عالية 🔥', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold' };
      case 'Low':
        return { label: 'عادية 🟢', color: 'bg-slate-700/60 text-slate-300 border-slate-600' };
      default:
        return { label: 'متوسطة ⚡', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Banner with Routing Info */}
      <div className="glass-card p-6 border-blue-500/30 relative overflow-hidden bg-gradient-to-l from-slate-900 via-slate-900 to-blue-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>نظام الشكاوى والمقترحات الموحد</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>منظومة الشكاوى، التظلمات، ومقترحات التطوير</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              تصل كل شكوى ومقترح تلقائياً ومباشرة إلى: <strong className="text-sky-300">رئيس لجنة العضو</strong>، 
              و<strong className="text-emerald-300">مسؤول الموارد البشرية HR</strong>، 
              و<strong className="text-amber-300">رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية والقيادة العليا</strong> للمتابعة والرد الفوري.
            </p>
          </div>

          {onOpenNewComplaint && (
            <button
              onClick={onOpenNewComplaint}
              className="btn-primary py-2.5 px-4 text-xs font-bold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-600/30 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تقديم شكوى أو مقترح جديد</span>
            </button>
          )}
        </div>

        {/* Stakeholder Triad Indicator */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">1</div>
            <div>
              <div className="font-bold text-white text-[11px]">رئيس لجنة العضو (Head)</div>
              <div className="text-[10px] text-slate-400">متابعة شؤون لجنته والمهام</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">2</div>
            <div>
              <div className="font-bold text-white text-[11px]">الموارد البشرية (HR Admin)</div>
              <div className="text-[10px] text-slate-400">التحقيق والحيادية والتقييمات</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs">3</div>
            <div>
              <div className="font-bold text-white text-[11px]">رئيس فريق المتطوعين (القيادة العليا)</div>
              <div className="text-[10px] text-slate-400">الإشراف والاعتماد النهائي</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">إجمالي الشكاوى والمقترحات</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">المقدمة عبر المنصة</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">شكاوى جديدة بانتظار الإجراء</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{newCount}</div>
          <div className="text-[10px] text-rose-300 mt-1">تتطلب الرد السريع 🚨</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">قيد المراجعة والتحقيق</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{inProgressCount}</div>
          <div className="text-[10px] text-amber-300 mt-1">جاري التنسيق لحلها</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">تم حلها والرد رسمياً</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{resolvedCount}</div>
          <div className="text-[10px] text-emerald-300 mt-1">حلول معتمدة ومغلقة ✓</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الشكاوى، العنوان، العضو، أو اللجنة..."
            className="glass-input text-xs pr-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'New', label: 'جديدة' },
            { id: 'Under Review', label: 'قيد المراجعة' },
            { id: 'In Investigation', label: 'جاري التحقيق' },
            { id: 'Resolved', label: 'تم الحل' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">لا توجد شكاوى أو مقترحات مسجلة</h3>
            <p className="text-xs text-slate-400">
              {statusFilter !== 'all' ? 'لا توجد نتائج تطابق الفلتر المحدد.' : 'فريق العمل متناغم ومستقر!'}
            </p>
          </div>
        ) : (
          filteredComplaints.map(complaint => {
            const catBadge = getCategoryBadge(complaint.category);
            const statBadge = getStatusBadge(complaint.status);
            const urgBadge = getUrgencyBadge(complaint.urgency);
            const isMyComplaint = complaint.senderId === currentUser.id;

            return (
              <div 
                key={complaint.id}
                className="glass-card p-5 space-y-3 hover:border-blue-500/50 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <img 
                      src={complaint.senderAvatar} 
                      alt="" 
                      className="w-10 h-10 rounded-xl object-cover border border-blue-400/40"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          {complaint.senderName}
                        </span>
                        {complaint.isAnonymous && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>سرية</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          ({complaint.senderCommitteeName})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        التاريخ: {complaint.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${urgBadge.color}`}>
                      {urgBadge.label}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${catBadge.color}`}>
                      {catBadge.label}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${statBadge.color}`}>
                      {statBadge.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{complaint.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
                    {complaint.description}
                  </p>
                </div>

                {/* Response Note if exists */}
                {complaint.responseNotes && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>رد وإجراء الإدارة: ({complaint.respondedBy})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-500">{complaint.respondedAt}</span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">
                      {complaint.responseNotes}
                    </p>

                    {/* Member Satisfaction Rating (Interactive for Sender) */}
                    {complaint.status === 'Resolved' && (
                      <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-300 font-semibold">تقييم رضا مقدم الشكوى عن الحل:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              disabled={!isMyComplaint}
                              onClick={() => isMyComplaint && rateComplaintResolution(complaint.id, star)}
                              className={`p-0.5 transition-all ${
                                isMyComplaint ? 'cursor-pointer hover:scale-125' : 'cursor-default'
                              } ${(complaint.satisfactionRating || 0) >= star ? 'text-amber-400' : 'text-slate-600'}`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Internal Administrative Notes (Confidential for Leadership & HR) */}
                {complaint.internalNotes && canManageComplaints && (
                  <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200">
                    <span className="font-bold flex items-center gap-1 text-purple-300 mb-0.5">
                      <ShieldAlert className="w-3 h-3" />
                      <span>ملاحظات إدارية سرية (خاصة بالقيادة وHR):</span>
                    </span>
                    <p className="text-slate-300 leading-normal">{complaint.internalNotes}</p>
                  </div>
                )}

                {/* Actions (Admin / Head Response) */}
                {canManageComplaints && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400">
                      صلاحية متابعة: متاح لرؤساء اللجان، ومسؤولي الموارد البشرية، والقيادة العليا
                    </span>

                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setNewStatus(complaint.status === 'Resolved' ? 'Resolved' : 'In Investigation');
                        setResponseText(complaint.responseNotes || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{complaint.responseNotes ? 'تعديل الرد والحالة' : 'الرد على الشكوى وتحديث الحالة'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Response / Update Status Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-lg w-full p-6 border border-blue-500/40 bg-slate-950 text-right">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>الرد على الشكوى / المقترح وتحديث حالتها</span>
              </h3>
              <button 
                onClick={() => setSelectedComplaint(null)} 
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3 text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="font-bold text-white mb-1">{selectedComplaint.title}</div>
              <div className="text-slate-400 text-[11px] line-clamp-2">{selectedComplaint.description}</div>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">تحديد الحالة الجديدة:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="glass-input text-xs"
                >
                  <option value="Under Review" className="bg-slate-900">🟡 قيد المراجعة (Under Review)</option>
                  <option value="In Investigation" className="bg-slate-900">🔵 جاري التحقيق والتنسيق (In Investigation)</option>
                  <option value="Resolved" className="bg-slate-900">🟢 تم الحل والاعتماد (Resolved)</option>
                  <option value="Rejected" className="bg-slate-900">⚪ تم الرفض أو حفظ الموضوع (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رد الإدارة والتوجيه المتخذ (يظهر للعضو):</label>
                <textarea
                  required
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="اكتب ردك الواضح والقرارات المتخذة بخصوص الشكوى..."
                  className="glass-input text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ملاحظات إدارية داخلية (سرية للقيادة وHR فقط):</label>
                <textarea
                  rows={2}
                  value={internalNotesText}
                  onChange={(e) => setInternalNotesText(e.target.value)}
                  placeholder="ملاحظات سرية لا تظهر لصاحب الشكوى..."
                  className="glass-input text-xs resize-none border-purple-500/30 focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد الرد وتحديث الحالة</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
