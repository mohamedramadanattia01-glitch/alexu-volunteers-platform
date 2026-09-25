import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Trash2,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseMembersFile, downloadMembersTemplateCsv, ParsedMemberRow } from '../../utils/excelImport';
import { isHighLeadershipRole, ALL_ROLES_INFO, getRoleShortLabel } from '../../utils/roleUtils';

interface ImportMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportMembersModal: React.FC<ImportMembersModalProps> = ({ isOpen, onClose }) => {
  const { importMembersBulk, showNotification, isHighLeadership } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedMemberRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsLoading(true);
    setErrors([]);
    setIsSuccess(false);

    try {
      const result = await parseMembersFile(uploadedFile);
      setParsedData(result.members);
      setErrors(result.errors);
      if (result.members.length === 0 && result.errors.length === 0) {
        setErrors(['الملف فارغ أو لا يحتوي على بيانات صالحة.']);
      }
    } catch (err: any) {
      setErrors([err.message || 'حدث خطأ أثناء معالجة الملف.']);
      setParsedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (parsedData.length === 0) return;
    
    // Convert parsed rows to members
    const newMembers = parsedData.map(row => ({
      fullName: row.name,
      universityEmail: row.email,
      whatsappNumber: row.phone || '+201000000000',
      role: row.role,
      currentCommitteeId: row.committeeId || 'comm-org',
      currentCommitteeName: row.committeeName || 'لجنة التنظيم',
      college: row.faculty || 'جامعة الإسكندرية',
      academicYear: row.academicYear || 'الفرقة الثالثة',
      volunteerId: row.volunteerId,
      position: row.position || 'عضو متطوع',
      joinDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'Active' as const,
      points: 100,
    }));

    importMembersBulk(newMembers);
    setIsSuccess(true);
    showNotification('success', `تم بنجاح استيراد ${newMembers.length} عضو وتوليد الأرقام التطوعية الفريدة`);
    setTimeout(() => {
      onClose();
      resetForm();
    }, 1200);
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setIsSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const counts = {
    total: parsedData.length,
    leadership: parsedData.filter(m => isHighLeadershipRole(m.role)).length,
    heads: parsedData.filter(m => m.role === 'head' || m.role === 'vice_head').length,
    members: parsedData.filter(m => m.role === 'member').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">استيراد بيانات الأعضاء (Excel / CSV)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">إضافة جماعية مع التعيين التلقائي للرقم التطوعي والصلاحيات</p>
            </div>
          </div>
          <button 
            onClick={() => { onClose(); resetForm(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">

          {/* Template Download banner */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200">تحميل النموذج القياسي للإكسيل</p>
                <p className="text-slate-500 dark:text-slate-400">نموذج جاهز بالأعمدة المطلوبة (الاسم، البريد، الهاتف، الكلية، الدور، اللجنة)</p>
              </div>
            </div>
            <button
              onClick={downloadMembersTemplateCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل النموذج</span>
            </button>
          </div>

          {/* Upload Area */}
          {!file && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                اسحب وأفلت ملف الإكسيل هنا أو انقر للاختيار
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                يدعم صيغ CSV, XLSX, XLS (الحد الأقصى 5 ميجابايت)
              </p>
            </div>
          )}

          {/* File Selected State */}
          {file && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="truncate text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="إلغاء واختيار ملف آخر"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Statistics Chips */}
              {parsedData.length > 0 && (
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">إجمالي الأعضاء</p>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">{counts.total}</p>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">قيادة عليا</p>
                    <p className="text-base font-bold text-purple-600 dark:text-purple-400">{counts.leadership}</p>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">مسؤولو لجان</p>
                    <p className="text-base font-bold text-amber-600 dark:text-amber-400">{counts.heads}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">متطوعون</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{counts.members}</p>
                  </div>
                </div>
              )}

              {/* Data Preview Table */}
              {parsedData.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                    <span>معاينة البيانات المستخرجة ({parsedData.length} عضو)</span>
                    <span className="text-[10px] text-slate-500">تم توليد الأرقام التطوعية تلقائياً</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            {row.volunteerId}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{row.name}</p>
                            <p className="text-[10px] text-slate-400">{row.email}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            ALL_ROLES_INFO[row.role]?.badgeClass || 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {ALL_ROLES_INFO[row.role]?.icon} {getRoleShortLabel(row.role, row.committeeName)}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-0.5">{row.faculty || 'جامعة الإسكندرية'}</p>
                        </div>
                      </div>
                    ))}
                    {parsedData.length > 10 && (
                      <div className="p-2 text-center text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800/20">
                        + {parsedData.length - 10} أعضاء إضافيين جاهزين للاستيراد
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Errors Display */}
              {errors.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>تنبيهات أثناء قراءة الملف:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-red-600 dark:text-red-300 space-y-0.5">
                    {errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Success State */}
          {isSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-sm">تم الاستيراد بنجاح!</p>
                <p>تمت إضافة الأعضاء وتوليد أكوادهم التطوعية وتحديث الدليل.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          
          <button
            onClick={handleImport}
            disabled={parsedData.length === 0 || isLoading || isSuccess}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تأكيد واستيراد ({parsedData.length}) عضو</span>
          </button>
        </div>

      </div>
    </div>
  );
};
