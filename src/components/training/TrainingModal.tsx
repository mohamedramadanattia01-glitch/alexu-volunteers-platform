import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  Save, 
  Clock, 
  User, 
  FileText, 
  Link2, 
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingCourse } from '../../types';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: TrainingCourse | null;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  onClose,
  courseToEdit
}) => {
  const { addTrainingCourse, updateTrainingCourse, showNotification, currentUser } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Communication' as TrainingCourse['category'],
    instructor: '',
    duration: '',
    description: '',
    materialsUrl: '',
    icon: 'GraduationCap',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        title: courseToEdit.title,
        category: courseToEdit.category,
        instructor: courseToEdit.instructor,
        duration: courseToEdit.duration,
        description: courseToEdit.description,
        materialsUrl: courseToEdit.materialsUrl || '',
        icon: courseToEdit.icon || 'GraduationCap',
        date: courseToEdit.date || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        category: 'Communication',
        instructor: currentUser?.fullName || '',
        duration: 'ساعتان (جلسة تفاعلية)',
        description: '',
        materialsUrl: '',
        icon: 'GraduationCap',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [courseToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.instructor.trim()) {
      showNotification('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (courseToEdit) {
      updateTrainingCourse(courseToEdit.id, formData);
      showNotification('success', 'تم تعديل الدورة التدريبية بنجاح');
    } else {
      addTrainingCourse({
        title: formData.title,
        category: formData.category,
        instructor: formData.instructor,
        duration: formData.duration,
        description: formData.description,
        materialsUrl: formData.materialsUrl,
        icon: formData.icon,
        date: formData.date,
      });
      showNotification('success', 'تمت إضافة الدورة التدريبية بنجاح');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {courseToEdit ? 'تعديل بيانات الدورة التدريبية' : 'إضافة دورة تدريبية جديدة'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">أكاديمية تدريب وتطوير كوادر المتطوعين</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              عنوان الدورة / الورشة التدريبية <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: مهارات القيادة الميدانية وإدارة الفعاليات الكبرى"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                المسار التدريبي <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TrainingCourse['category'] })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white"
              >
                <option value="Leadership">القيادة والإدارة (Leadership)</option>
                <option value="Event Management">تنظيم الفعاليات (Event Management)</option>
                <option value="Communication">التواصل والتأثير (Communication)</option>
                <option value="Media">الإعلام والتوثيق (Media)</option>
                <option value="Technical">المهارات التقنية (Technical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                المدة الزمنية <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="مثال: 3 ساعات أو 4 جلسات"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Instructor & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                المدرب / المحاضر <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="اسم المدرب أو الخبير"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ الانعقاد
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Materials Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              رابط المادة العلمية / العرض التقديمي (اختياري)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="url"
                value={formData.materialsUrl}
                onChange={(e) => setFormData({ ...formData, materialsUrl: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              وصف الدورة والمحاور الرئيسية
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب نبذة عن محتوى الورشة والمهارات المكتسبة..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white placeholder-slate-400 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{courseToEdit ? 'حفظ التعديلات' : 'إنشاء الدورة التدريبية'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
