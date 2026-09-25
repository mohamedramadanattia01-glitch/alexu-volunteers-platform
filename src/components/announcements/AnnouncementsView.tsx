import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import { 
  Megaphone, 
  Plus, 
  Pin, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  Vote,
  Smile,
  X,
  Volume2
} from 'lucide-react';
import { AnnouncementModal } from './AnnouncementModal';
import { exportPollResultsToExcel } from '../../utils/excelExport';
import { VoicePlayer } from '../common/VoicePlayer';
import { CommitteeBadge } from '../common/CommitteeBadge';

const AVAILABLE_REACTIONS = ['👍', '❤️', '🔥', '👏', '💡'];

export const AnnouncementsView: React.FC = () => {
  const { 
    announcements, 
    currentUser, 
    isHighLeadership, 
    deleteAnnouncement, 
    showNotification,
    voteOnPoll,
    reactToAnnouncement
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  
  // State for viewing poll results breakdown
  const [selectedPollAnn, setSelectedPollAnn] = useState<Announcement | null>(null);
  
  // State for viewing reaction breakdown
  const [selectedReactionAnn, setSelectedReactionAnn] = useState<Announcement | null>(null);

  const canBroadcast = isHighLeadership || currentUser.role === 'head' || currentUser.role === 'vice_head';

  const handleOpenAdd = () => {
    setAnnouncementToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setAnnouncementToEdit(ann);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!announcementToDelete) return;
    deleteAnnouncement(announcementToDelete.id);
    showNotification('success', `تم حذف الإعلان "${announcementToDelete.title}" بنجاح`);
    setAnnouncementToDelete(null);
  };

  const handleVote = (announcementId: string, optionId: string) => {
    voteOnPoll(announcementId, optionId);
    showNotification('success', 'تم تسجيل صوتك في الاستطلاع بنجاح ✨');
  };

  const handleReaction = (announcementId: string, emoji: string) => {
    reactToAnnouncement(announcementId, emoji);
  };

  const handleExportPoll = (ann: Announcement) => {
    if (!ann.poll) return;
    exportPollResultsToExcel(ann.poll, ann.title);
    showNotification('success', 'تم تصدير ملف نتائج الاستطلاع بنجاح (Excel)');
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              مركز البث والتفاعل الإداري
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>التعميمات الرسمية والتوجيهات الصوتية</span>
            <Megaphone className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            إرسال تنبيهات وتوجيهات صوتية، وإجراء استطلاعات وتصويت تفاعلي مع تحليل فوري وتصدير إكسيل
          </p>
        </div>

        {canBroadcast && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>نشر إعلان / توجيه صوتي جديد</span>
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-xs font-semibold">
            لا توجد إعلانات منشورة حالياً.
          </div>
        ) : (
          announcements.map(ann => {
            const hasPoll = !!ann.poll;
            const userVote = ann.poll?.votes?.find(v => v.memberId === currentUser.id);
            const userVotedOptionId = userVote?.optionId;
            const totalPollVotes = ann.poll?.totalVotes || 0;

            const canManageAnnouncement = isHighLeadership || 
              (ann.authorId && ann.authorId === currentUser.id) ||
              (currentUser.role === 'head' && ann.targetCommitteeName === currentUser.currentCommitteeName);

            return (
              <div 
                key={ann.id}
                className={`glass-card p-4 sm:p-5 border-slate-800 transition-all ${
                  ann.isPinned ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 shadow-xl' : ''
                }`}
              >
                {/* Top bar */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.isPinned && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                        <Pin className="w-3 h-3" />
                        <span>مثبت (Pinned)</span>
                      </span>
                    )}
                    {ann.voiceNoteUrl && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-black border border-orange-500/30">
                        <Volume2 className="w-3 h-3" />
                        <span>تسجيل صوتي 🎙️</span>
                      </span>
                    )}
                    {hasPoll && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/30">
                        <Vote className="w-3 h-3" />
                        <span>استطلاع رأي وتصويت</span>
                      </span>
                    )}
                    <h3 className="text-sm sm:text-base font-black text-white leading-snug">{ann.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">{ann.createdAt}</span>

                    {/* Actions for Leadership & Author */}
                    {canManageAnnouncement && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(ann)}
                          title="تعديل الإعلان"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAnnouncementToDelete(ann)}
                          title="حذف الإعلان"
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Announcement Content */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3.5 whitespace-pre-line font-medium">
                  {ann.content}
                </p>

                {/* Voice Announcement Audio Player */}
                {ann.voiceNoteUrl && (
                  <div className="my-3 p-3 rounded-xl bg-slate-950/60 border border-amber-500/30">
                    <div className="text-[11px] font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4" />
                      <span>التوجيه الصوتي الرسمي المرفق:</span>
                    </div>
                    <VoicePlayer 
                      audioUrl={ann.voiceNoteUrl} 
                      durationSeconds={ann.voiceDuration} 
                      label="استمع للتوجيه الصوتي" 
                    />
                  </div>
                )}

                {/* Interactive Poll Section */}
                {hasPoll && ann.poll && (
                  <div className="my-4 p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 shadow-inner space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Vote className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-indigo-200">
                          {ann.poll.question}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        إجمالي الأصوات: <strong className="text-white">{totalPollVotes}</strong>
                      </span>
                    </div>

                    {/* Poll Options */}
                    <div className="space-y-2.5">
                      {ann.poll.options.map((option) => {
                        const isSelected = userVotedOptionId === option.id;
                        const percentage = totalPollVotes > 0 
                          ? Math.round((option.voteCount / totalPollVotes) * 100) 
                          : 0;

                        return (
                          <div 
                            key={option.id}
                            onClick={() => handleVote(ann.id, option.id)}
                            className={`group relative overflow-hidden rounded-xl border p-3 transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-indigo-500 bg-indigo-950/40 shadow-md shadow-indigo-500/10' 
                                : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            {/* Live Progress Bar Background */}
                            <div 
                              className={`absolute top-0 bottom-0 right-0 opacity-25 transition-all duration-500 ${
                                isSelected ? 'bg-indigo-500' : 'bg-slate-700'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />

                            <div className="relative flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'border-indigo-400 bg-indigo-500 text-white' 
                                    : 'border-slate-600 group-hover:border-slate-400'
                                }`}>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                                <span className={`font-semibold ${isSelected ? 'text-indigo-200 font-bold' : 'text-slate-200'}`}>
                                  {option.text}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-slate-400 text-[11px]">({option.voteCount} صوت)</span>
                                <span className={`font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`}>
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Poll Controls for Leaders */}
                    {canBroadcast && (
                      <div className="flex items-center justify-between pt-2 text-xs">
                        <button
                          onClick={() => setSelectedPollAnn(ann)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/40 text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>عرض تفاصيل وإحصائيات المصوتين</span>
                        </button>

                        <button
                          onClick={() => handleExportPoll(ann)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/40 text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>تصدير إكسيل</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Emoji Reactions Bar */}
                <div className="flex items-center justify-between gap-2 py-2 border-t border-slate-800/80 mt-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {AVAILABLE_REACTIONS.map((emoji) => {
                      const votersForEmoji = (ann.reactions || []).filter(r => r.emoji === emoji);
                      const count = votersForEmoji.length;
                      const hasReacted = votersForEmoji.some(r => r.memberId === currentUser.id);

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(ann.id, emoji)}
                          title={count > 0 ? votersForEmoji.map(v => v.memberName).join(', ') : 'تفاعل'}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            hasReacted
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 scale-105 shadow-sm'
                              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-slate-700/40 hover:scale-105'
                          }`}
                        >
                          <span className="text-sm">{emoji}</span>
                          {count > 0 && <span className="text-[11px] font-mono">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {(ann.reactions || []).length > 0 && (
                    <button
                      onClick={() => setSelectedReactionAnn(ann)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Smile className="w-3.5 h-3.5 text-amber-400" />
                      <span>قائمة المتفاعلين ({ann.reactions?.length})</span>
                    </button>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>الناشر: <strong className="text-slate-200">{ann.authorName}</strong> ({ann.authorRole})</span>
                  </div>

                  <div>
                    {ann.targetCommitteeId ? (
                      <CommitteeBadge committeeId={ann.targetCommitteeId} size="sm" />
                    ) : (
                      <span className="text-[10px] sm:text-[11px] text-sky-400 bg-sky-950/40 px-2.5 py-0.5 rounded-full border border-sky-500/20 font-bold">
                        📢 موجه لكافة الفريق
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        announcementToEdit={announcementToEdit}
      />

      {/* Poll Breakdown & Voters Modal */}
      {selectedPollAnn && selectedPollAnn.poll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-indigo-500/30 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">تفاصيل نتائج الاستطلاع والتصويت</h3>
                  <p className="text-xs text-slate-400">{selectedPollAnn.poll.question}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPollAnn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedPollAnn.poll.options.map((opt) => {
                const total = selectedPollAnn.poll?.totalVotes || 1;
                const pct = Math.round((opt.voteCount / total) * 100);
                return (
                  <div key={opt.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
                      <span>{opt.text}</span>
                      <span className="text-indigo-400 font-bold">{opt.voteCount} صوت ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voters List Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>سجل أسماء المصوتين وخياراتهم:</span>
              </h4>

              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/80 text-slate-300">
                    <tr>
                      <th className="p-2.5">اسم العضو</th>
                      <th className="p-2.5">اللجنة</th>
                      <th className="p-2.5">الخيار المختار</th>
                      <th className="p-2.5">وقت التصويت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 bg-slate-900/50">
                    {(!selectedPollAnn.poll.votes || selectedPollAnn.poll.votes.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500">
                          لم يقم أي عضو بالتصويت حتى الآن.
                        </td>
                      </tr>
                    ) : (
                      selectedPollAnn.poll.votes.map((voteRecord, idx) => {
                        const optionText = selectedPollAnn.poll?.options.find(o => o.id === voteRecord.optionId)?.text || 'خيار';
                        return (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-semibold text-white">{voteRecord.memberName}</td>
                            <td className="p-2.5 text-slate-400">{voteRecord.committeeName || 'عام'}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 text-[11px]">
                                {optionText}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-400 font-mono text-[11px]">{voteRecord.votedAt}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleExportPoll(selectedPollAnn)}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير هذا التقرير إلى Excel</span>
              </button>
              
              <button
                onClick={() => setSelectedPollAnn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactions List Modal */}
      {selectedReactionAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-amber-400" />
                <span>المتفاعلون مع الإعلان</span>
              </h3>
              <button 
                onClick={() => setSelectedReactionAnn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(selectedReactionAnn.reactions || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <span className="font-semibold text-white">{item.memberName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.committeeName})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.reactedAt}</span>
                </div>
              ))}
            </div>

            <div className="text-left pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedReactionAnn(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-2xl shadow-2xl border border-rose-900/50 p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تأكيد حذف الإعلان</h3>
              <p className="text-xs text-slate-400 mt-1">
                هل أنت متأكد من رغبتك في حذف الإعلان <strong className="text-white">"{announcementToDelete.title}"</strong> نهائياً؟
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setAnnouncementToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
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
