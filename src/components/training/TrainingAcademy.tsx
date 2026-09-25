import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrainingCourse } from '../../types';
import { 
  GraduationCap, Award, BookOpen, Clock, User, 
  CheckCircle2, Sparkles, Printer, X, Search,
  Plus, Edit3, Trash2, ShieldAlert
} from 'lucide-react';
import { TrainingModal } from './TrainingModal';

export const TrainingAcademy: React.FC = () => {
  const { 
    trainings, 
    members, 
    currentUser, 
    enrollTraining, 
    completeTraining, 
    isHighLeadership, 
    deleteTrainingCourse,
    showNotification 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [skillSearch, setSkillSearch] = useState('');
  const [certificateCourse, setCertificateCourse] = useState<TrainingCourse | null>(null);
  
  // Training modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<TrainingCourse | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<TrainingCourse | null>(null);

  const filteredTrainings = trainings.filter(t => {
    return selectedCategory === 'all' || t.category === selectedCategory;
  });

  // Skills Query Engine: "Who is best at X?"
  const getTopVolunteersForSkill = (skillQuery: string) => {
    if (!skillQuery.trim()) return [];
    return members
      .map(m => {
        const foundKey = Object.keys(m.skills).find(k => k.includes(skillQuery) || skillQuery.includes(k));
        const score = foundKey ? m.skills[foundKey] : 0;
        return { member: m, score, skillName: foundKey || skillQuery };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  };

  const topSkillMatches = getTopVolunteersForSkill(skillSearch);

  const handleOpenAdd = () => {
    setCourseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: TrainingCourse) => {
    setCourseToEdit(course);
    setIsModalOpen(true);
  };

  const confirmDeleteCourse = () => {
    if (!courseToDelete) return;
    deleteTrainingCourse(courseToDelete.id);
    showNotification('success', `تم حذف الدورة "${courseToDelete.title}" بنجاح`);
    setCourseToDelete(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      
      {/* Header */}
      <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              مركز التطوير والتدريب المستمر
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            أكاديمية تدريب وتأهيل المتطوعين (Training Academy)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            برامج تدريبية متخصصة في القيادة، إدارة الفعاليات، المهارات التقنية، واستعلام مصفوفة المهارات
          </p>
        </div>

        {/* Leadership Add Button */}
        {isHighLeadership && (
          <button
            onClick={handleOpenAdd}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة دورة تدريبية</span>
          </button>
        )}
      </div>

      {/* Skills Matrix Query Tool: "من الأفضل في مهارة معينة؟" */}
      <div className="glass-card p-4 border-purple-500/30 bg-gradient-to-r from-purple-950/30 to-blue-950/30">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white">مستعلم مصفوفة المهارات (Who is best at...?)</h3>
        </div>
        <p className="text-[11px] text-slate-300 mb-2.5">
          ابحث عن أي مهارة (تصميم، إدارة حشود، تصوير، قيادة) واكتشف أفضل الكفاءات في الفريق فورياً
        </p>

        <div className="relative max-w-md mb-2">
          <Search className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="اكتب المهارة... (مثال: إدارة الحشود، فوتوشوب، قيادة، مونتاج)"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            className="glass-input text-xs pr-9 py-2"
          />
        </div>

        {skillSearch.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1.5">
            {topSkillMatches.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-full">لا يوجد متطوع مسجل بهذه المهارة حالياً</p>
            ) : (
              topSkillMatches.map(({ member, score }) => (
                <div key={member.id} className="p-2 rounded-xl bg-slate-900/80 border border-purple-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={member.avatarUrl} alt="" className="w-6 h-6 rounded-md object-cover" />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate text-[11px]">{member.fullName}</div>
                      <div className="text-[9px] text-slate-400">{member.currentCommitteeName}</div>
                    </div>
                  </div>
                  <div className="text-amber-400 shrink-0 text-xs">{'⭐'.repeat(score)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 w-fit overflow-x-auto max-w-full">
        {[
          { id: 'all', label: 'جميع الدورات' },
          { id: 'Event Management', label: 'إدارة الفعاليات' },
          { id: 'Leadership', label: 'القيادة والتفويض' },
          { id: 'Technical', label: 'المهارات التقنية' },
          { id: 'Media', label: 'الإعلام والمونتاج' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTrainings.map(course => {
          const isEnrolled = course.enrolledMemberIds.includes(currentUser.id);
          const isCompleted = course.completedMemberIds.includes(currentUser.id);

          return (
            <div 
              key={course.id}
              className="glass-card p-4 sm:p-5 glass-card-hover border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {course.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">{course.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      +50 XP
                    </span>

                    {/* Edit & Delete for Leadership */}
                    {isHighLeadership && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          title="تعديل الدورة"
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCourseToDelete(course)}
                          title="حذف الدورة"
                          className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 hover:text-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  {course.description}
                </p>

                <div className="space-y-1 text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>المدرب: <strong className="text-slate-200">{course.instructor}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>المدة الزمنية: {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الملتحقون: {course.enrolledMemberIds.length} متطوع ({course.completedMemberIds.length} أتموا الدورة)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                {isCompleted ? (
                  <button
                    onClick={() => setCertificateCourse(course)}
                    className="btn-secondary text-xs py-1.5 px-3 text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/40 w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>عرض شهادة الإتمام الرقمية 🎓</span>
                  </button>
                ) : isEnrolled ? (
                  <button
                    onClick={() => completeTraining(course.id, currentUser.id)}
                    className="btn-primary text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تسجيل إتمام الدورة واحتساب الـ 50 XP</span>
                  </button>
                ) : (
                  <button
                    onClick={() => enrollTraining(course.id, currentUser.id)}
                    className="btn-secondary text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>التسجيل في الدورة التدريبية</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      {certificateCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="max-w-2xl w-full p-8 bg-white text-slate-900 rounded-3xl shadow-2xl text-center font-sans border-8 border-double border-blue-900 relative print:border-none">
            
            <button 
              onClick={() => setCertificateCourse(null)}
              className="absolute top-4 left-4 p-2 rounded-lg text-slate-400 hover:text-slate-800 no-print cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-bold text-blue-900 tracking-widest mb-1">
              جامعة الإسكندرية • اتحاد الطلاب
            </div>
            <h2 className="text-2xl font-black text-slate-950 mb-1">
              شهادة إتمام وتأهيل تدريبي
            </h2>
            <div className="text-xs font-semibold text-slate-500 mb-6">
              Certificate of Training Completion
            </div>

            <p className="text-xs text-slate-600 mb-3">يشهد اتحاد طلاب جامعة الإسكندرية بأن المتطوع / المتطوعة:</p>
            <h3 className="text-2xl font-extrabold text-blue-900 mb-3">{currentUser.fullName}</h3>
            
            <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed mb-6">
              قد أتم بنجاح البرنامج التدريبي المتخصص بعنوان:
              <br />
              <strong className="text-sm font-bold text-slate-900">"{certificateCourse.title}"</strong>
              <br />
              بإشراف {certificateCourse.instructor} وبواقع {certificateCourse.duration}.
            </p>

            <div className="flex justify-between items-end pt-6 border-t border-slate-200 text-xs text-slate-600">
              <div className="text-right">
                <div className="font-bold text-slate-900">رئيس لجنة التدريب والتطوير</div>
                <div className="font-serif italic text-slate-500">سلمى إبراهيم النجار</div>
              </div>

              <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-800 flex items-center justify-center text-[10px] text-blue-900 font-bold rotate-12">
                ختم الاعتماد
              </div>

              <div className="text-left">
                <div className="font-bold text-slate-900">رئيس فريق المتطوعين</div>
                <div className="font-serif italic text-slate-500">أحمد عصام الدين</div>
              </div>
            </div>

            <div className="mt-6 no-print">
              <button 
                onClick={() => window.print()}
                className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة الرسمية</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <TrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseToEdit={courseToEdit}
      />

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-2xl shadow-2xl border border-rose-900/50 p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تأكيد حذف الدورة التدريبية</h3>
              <p className="text-xs text-slate-400 mt-1">
                هل أنت متأكد من رغبتك في حذف دورة <strong className="text-white">"{courseToDelete.title}"</strong> نهائياً؟
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteCourse}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
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
