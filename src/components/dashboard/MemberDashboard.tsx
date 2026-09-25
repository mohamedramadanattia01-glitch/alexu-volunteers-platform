import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, Calendar, QrCode, Trophy, Award, 
  FileText, Sparkles, ChevronLeft, ArrowUpRight, Flame,
  Edit3, Heart, GraduationCap, MessageSquare 
} from 'lucide-react';

interface MemberDashboardProps {
  onOpenQRModal: () => void;
  onOpenDigitalPortfolio: () => void;
  onSelectTask: (taskId: string) => void;
  onOpenEditProfile?: () => void;
  onOpenComplaintModal?: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onOpenQRModal, 
  onOpenDigitalPortfolio, 
  onSelectTask,
  onOpenEditProfile,
  onOpenComplaintModal
}) => {
  const { currentUser, tasks, events, badges, setActiveTab } = useApp();

  const myTasks = tasks.filter(t => t.assignedToMemberIds.includes(currentUser.id));
  const activeMyTasks = myTasks.filter(t => t.status !== 'Approved' && t.status !== 'Cancelled');
  const myUpcomingEvent = events.find(e => e.status === 'Live' || e.status === 'Upcoming');

  const earnedBadges = badges.filter(b => currentUser.badges.includes(b.id));
  const nextLevelXP = currentUser.level * 150;
  const currentLevelXP = currentUser.points % 150;
  const levelProgress = Math.min(100, Math.round((currentLevelXP / 150) * 100));

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner with Gamification Level */}
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <img 
              src={currentUser.avatarUrl} 
              alt="" 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400/50 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  {currentUser.currentCommitteeName}
                </span>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>المستوى {currentUser.level}</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                أهلاً بك، {currentUser.fullName.split(' ')[0]} 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {currentUser.position} • كلية {currentUser.college}
              </p>
            </div>
          </div>

          {/* Gamification Level & XP Progress */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-blue-500/30 shadow-xl w-full lg:w-72">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-white flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>إجمالي النقاط</span>
              </span>
              <span className="font-extrabold text-amber-400 font-mono text-sm">{currentUser.points} XP</span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
              <div 
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>المستوى {currentUser.level}</span>
              <span>باقي {150 - currentLevelXP} XP للمستوى {currentUser.level + 1}</span>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-4 border-t border-white/10">
          <button 
            onClick={onOpenQRModal}
            className="btn-primary text-xs py-2 px-3.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>تسجيل الحضور بالـ QR الذكي</span>
          </button>

          {onOpenEditProfile && (
            <button 
              onClick={onOpenEditProfile}
              className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-400" />
              <span>تعديل ملفي الشخصي والهوايات</span>
            </button>
          )}

          {onOpenComplaintModal && (
            <button 
              onClick={onOpenComplaintModal}
              className="btn-secondary text-xs py-2 px-3.5 cursor-pointer hover:border-rose-500/40 hover:text-rose-300"
            >
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>تقديم شكوى أو مقترح</span>
            </button>
          )}

          <button 
            onClick={onOpenDigitalPortfolio}
            className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>السيرة الذاتية (CV)</span>
          </button>

          <button 
            onClick={() => setActiveTab('leaderboard')}
            className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>لوحة الشرف</span>
          </button>
        </div>
      </div>

      {/* Member KPIs Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">المهام النشطة</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{activeMyTasks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">مهام مكلف بها حالياً</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">نسبة الحضور</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{currentUser.performance.attendanceRate}%</div>
          <div className="text-[11px] text-emerald-400 mt-1">انضباط ممتاز في المواعيد ⭐</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">جودة المهام</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{currentUser.performance.taskQuality} / 5</div>
          <div className="text-[11px] text-amber-300 mt-1">تقييم الجودة من الهيد</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">الأوسمة المكتسبة</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">{currentUser.badges.length}</div>
          <div className="text-[11px] text-purple-300 mt-1">أوسمة شرف وإنجاز</div>
        </div>
      </div>

      {/* Hobbies & Learning Aspirations Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              <span>هواياتي ومواهبي</span>
            </h4>
            {onOpenEditProfile && (
              <button onClick={onOpenEditProfile} className="text-[10px] text-blue-400 hover:underline">
                تعديل
              </button>
            )}
          </div>
          {(!currentUser.hobbies || currentUser.hobbies.length === 0) ? (
            <p className="text-[11px] text-slate-500">أضف هواياتك لتعزيز سيرتك الذاتية وترشيح المهام المناسبة.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {currentUser.hobbies.map((h, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 text-[11px] font-semibold">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>ما أرغب في تعلمه وتطويره</span>
            </h4>
            {onOpenEditProfile && (
              <button onClick={onOpenEditProfile} className="text-[10px] text-blue-400 hover:underline">
                تعديل
              </button>
            )}
          </div>
          {(!currentUser.learningAspirations || currentUser.learningAspirations.length === 0) ? (
            <p className="text-[11px] text-slate-500">حدد ما ترغب في تعلمه لترشيحك للدورات المناسبة بالأكاديمية.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {currentUser.learningAspirations.map((a, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[11px] font-semibold">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tasks & Upcoming Event */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* My Tasks List */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-400" />
              <span>مهامي المسندة ({activeMyTasks.length})</span>
            </h3>
            <button onClick={() => setActiveTab('tasks')} className="text-xs text-blue-400 hover:underline">
              عرض كل المهام
            </button>
          </div>

          <div className="space-y-3">
            {activeMyTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400">لا توجد مهام نشطة حالياً، أنت متاح لتكليفات جديدة! 🚀</p>
              </div>
            ) : (
              activeMyTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{task.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      task.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{task.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>الموعد النهائي: {task.deadline}</span>
                    <span className="text-amber-400 font-bold">+{task.xpReward} XP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Next Shift & Badges */}
        <div className="space-y-4">
          
          {/* Next Shift */}
          {myUpcomingEvent && (
            <div className="glass-card p-5 border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-slate-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  {myUpcomingEvent.status === 'Live' ? '🔴 جاري الآن (Live)' : 'الفعالية القادمة'}
                </span>
                <Calendar className="w-4 h-4 text-sky-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{myUpcomingEvent.name}</h4>
              <p className="text-[11px] text-slate-300 mb-3">{myUpcomingEvent.location}</p>
              
              <div className="flex justify-between items-center text-xs text-slate-300 border-t border-slate-800 pt-2 mb-3">
                <span>التاريخ: {myUpcomingEvent.date}</span>
                <span>الموعد: {myUpcomingEvent.startTime}</span>
              </div>

              <button 
                onClick={onOpenQRModal}
                className="btn-primary text-xs w-full py-2"
              >
                تسجيل الحضور في الموقع
              </button>
            </div>
          )}

          {/* Badges Earned */}
          <div className="glass-card p-5">
            <h4 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <span>أوسمتي المكتسبة ({earnedBadges.length})</span>
              <Award className="w-4 h-4 text-amber-400" />
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {earnedBadges.map(badge => (
                <div key={badge.id} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-base mb-1">{badge.titleAr.split(' ')[0]}</div>
                  <div className="text-[10px] font-bold text-white truncate">{badge.titleAr.substring(2)}</div>
                  <div className="text-[9px] text-amber-400 mt-0.5">+{badge.xpReward} XP</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
