import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import { 
  X, FileText, Upload, Check, FolderPlus, FileUp, 
  FileSpreadsheet, Image as ImageIcon, Archive, FileCode,
  File, Presentation, Sparkles
} from 'lucide-react';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentToEdit?: DocumentItem | null;
}

const getFileTypeDetails = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') {
    return { type: 'PDF', label: 'PDF Document', color: 'text-rose-400 bg-rose-950/80 border-rose-500/40' };
  }
  if (['doc', 'docx'].includes(ext)) {
    return { type: 'Word', label: 'Word (DOCX)', color: 'text-blue-400 bg-blue-950/80 border-blue-500/40' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return { type: 'Excel', label: 'Excel Sheet', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40' };
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return { type: 'PowerPoint', label: 'PowerPoint', color: 'text-amber-400 bg-amber-950/80 border-amber-500/40' };
  }
  if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
    return { type: 'Image', label: 'صورة / تصميم', color: 'text-purple-400 bg-purple-950/80 border-purple-500/40' };
  }
  if (['zip', 'rar', '7z', 'tar'].includes(ext)) {
    return { type: 'Archive', label: 'ملف مضغوط', color: 'text-orange-400 bg-orange-950/80 border-orange-500/40' };
  }
  if (['txt', 'md'].includes(ext)) {
    return { type: 'Text', label: 'مستند نصي', color: 'text-slate-300 bg-slate-800 border-slate-600' };
  }
  return { type: 'File', label: ext.toUpperCase() || 'ملف وثائقي', color: 'text-sky-400 bg-sky-950/80 border-sky-500/40' };
};

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  documentToEdit
}) => {
  const { committees, addDocument, updateDocument, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [committeeId, setCommitteeId] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('Rules');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [pdfBase64, setPdfBase64] = useState<string>('');

  useEffect(() => {
    if (documentToEdit) {
      setTitle(documentToEdit.title);
      setCommitteeId(documentToEdit.committeeId);
      setCategory(documentToEdit.category);
      setDescription(documentToEdit.description || '');
      setFileName(documentToEdit.fileName || `${documentToEdit.title}.pdf`);
      setFileType(documentToEdit.fileType || getFileTypeDetails(documentToEdit.fileName || 'file.pdf').type);
      setFileSize(documentToEdit.fileSize);
      setPdfBase64(documentToEdit.pdfBase64 || '');
    } else {
      setTitle('');
      setCommitteeId(committees[0]?.id || 'comm-org');
      setCategory('Rules');
      setDescription('');
      setFileName('');
      setFileType('PDF');
      setFileSize('1.5 MB');
      setPdfBase64('');
    }
  }, [documentToEdit, isOpen, committees]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const sizeInMb = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    setFileSize(sizeInMb);

    const details = getFileTypeDetails(file.name);
    setFileType(details.type);

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPdfBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى كتابة عنوان الوثيقة أو المستند');
      return;
    }

    const commObj = committees.find(c => c.id === committeeId) || committees[0];
    const finalFileType = fileType || getFileTypeDetails(fileName || 'file.pdf').type;

    if (documentToEdit) {
      updateDocument(documentToEdit.id, {
        title: title.trim(),
        committeeId: commObj.id,
        committeeName: commObj.name,
        category,
        description,
        fileName: fileName || `${title.trim()}.pdf`,
        fileType: finalFileType,
        fileSize,
        pdfBase64: pdfBase64 || documentToEdit.pdfBase64
      });
    } else {
      addDocument({
        title: title.trim(),
        committeeId: commObj.id,
        committeeName: commObj.name,
        category,
        uploadedBy: currentUser.fullName,
        fileSize: fileSize || '2.0 MB',
        fileType: finalFileType,
        fileName: fileName || `${title.trim()}.pdf`,
        description,
        pdfBase64
      });
    }

    onClose();
  };

  const typeDetails = getFileTypeDetails(fileName || 'file.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-lg w-full p-6 border border-blue-500/40 bg-slate-950 text-right shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {documentToEdit ? 'تعديل بيانات وثيقة أو ملف' : 'رفع وإضافة وثيقة أو ملف جديد'}
              </h3>
              <p className="text-[11px] text-slate-400">توثيق الملفات الرسمية (PDF, Word, Excel, PowerPoint, صور، مضغوطة)</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* File Upload Selector */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              رفع الملف من جهازك (يدعم جميع الصيغ)
            </label>
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                {typeDetails.type === 'PDF' && <FileText className="w-6 h-6 text-rose-400" />}
                {typeDetails.type === 'Word' && <FileText className="w-6 h-6 text-blue-400" />}
                {typeDetails.type === 'Excel' && <FileSpreadsheet className="w-6 h-6 text-emerald-400" />}
                {typeDetails.type === 'PowerPoint' && <Presentation className="w-6 h-6 text-amber-400" />}
                {typeDetails.type === 'Image' && <ImageIcon className="w-6 h-6 text-purple-400" />}
                {typeDetails.type === 'Archive' && <Archive className="w-6 h-6 text-orange-400" />}
                {['File', 'Text'].includes(typeDetails.type) && <File className="w-6 h-6 text-sky-400" />}
              </div>

              <span className="font-bold text-white text-xs mb-0.5">
                {fileName ? fileName : 'اضغط لاختيار ملف (PDF, Word, Excel, PPT, صور...)'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {fileName ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeDetails.color}`}>
                    {typeDetails.label} • {fileSize}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    PDF, DOCX, XLSX, PPTX, PNG, JPG, ZIP, RAR, TXT
                  </span>
                )}
              </div>

              <input 
                type="file" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.svg,.webp,.zip,.rar,.7z,.txt,.csv" 
                onChange={handleFileUpload}
                className="hidden" 
              />
            </label>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">عنوان الوثيقة أو اسم الملف *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: اللائحة التنظيمية للفعاليات الميدانية 2026..."
              className="glass-input w-full text-xs"
              required
            />
          </div>

          {/* Category & Committee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">التصنيف الموضوعي *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="glass-input w-full text-xs"
              >
                <option value="Rules">لوائح وقواعد السلوك (Rules)</option>
                <option value="Event Plans">خطط الفعاليات والإخلاء (Plans)</option>
                <option value="Templates">قوالب وهويات بصرية (Templates)</option>
                <option value="Training">مواد ودورات تدريبية (Training)</option>
                <option value="Reports">تقارير إدارية ورسمية (Reports)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">اللجنة المسؤولة *</label>
              <select
                value={committeeId}
                onChange={(e) => setCommitteeId(e.target.value)}
                className="glass-input w-full text-xs"
              >
                {committees.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">نبذة عن محتوى الوثيقة (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً موجزاً لما تتضمنه هذه الوثيقة لمساعدة الأعضاء..."
              rows={2}
              className="glass-input w-full text-xs resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 cursor-pointer shadow-lg"
            >
              {documentToEdit ? 'حفظ التعديلات' : 'رفع ونشر الوثيقة'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
