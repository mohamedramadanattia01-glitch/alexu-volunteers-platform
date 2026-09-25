import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import { 
  FolderGit2, FileText, Download, Plus, Search, Filter, 
  Trash2, Edit3, Eye, FileUp, Sparkles, Check, AlertCircle,
  FileSpreadsheet, Image as ImageIcon, Archive, Presentation,
  File, ExternalLink
} from 'lucide-react';
import { AddDocumentModal } from './AddDocumentModal';

const getDocTypeInfo = (doc: DocumentItem) => {
  const ext = (doc.fileName || '').split('.').pop()?.toLowerCase() || '';
  const rawType = (doc.fileType || '').toUpperCase();

  if (ext === 'pdf' || rawType.includes('PDF')) {
    return {
      type: 'PDF',
      label: 'PDF Document',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
      icon: <FileText className="w-3.5 h-3.5 text-rose-400" />
    };
  }
  if (['doc', 'docx'].includes(ext) || rawType.includes('WORD') || rawType.includes('DOC')) {
    return {
      type: 'Word',
      label: 'Word Document',
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
      icon: <FileText className="w-3.5 h-3.5 text-blue-400" />
    };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext) || rawType.includes('EXCEL') || rawType.includes('XLS')) {
    return {
      type: 'Excel',
      label: 'Excel Sheet',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      icon: <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
    };
  }
  if (['ppt', 'pptx'].includes(ext) || rawType.includes('PPT') || rawType.includes('POWERPOINT')) {
    return {
      type: 'PowerPoint',
      label: 'PowerPoint',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      icon: <Presentation className="w-3.5 h-3.5 text-amber-400" />
    };
  }
  if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext) || rawType.includes('IMAGE')) {
    return {
      type: 'Image',
      label: 'صورة / تصميم',
      badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
      icon: <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
    };
  }
  if (['zip', 'rar', '7z', 'tar'].includes(ext) || rawType.includes('ARCHIVE') || rawType.includes('ZIP')) {
    return {
      type: 'Archive',
      label: 'ملف مضغوط (ZIP)',
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
      icon: <Archive className="w-3.5 h-3.5 text-orange-400" />
    };
  }
  return {
    type: 'File',
    label: ext.toUpperCase() || 'ملف وثائقي',
    badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
    icon: <File className="w-3.5 h-3.5 text-sky-400" />
  };
};

export const DocumentsView: React.FC = () => {
  const { documents, committees, deleteDocument, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<DocumentItem | null>(null);

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'hr_admin' || currentUser.role === 'head';

  const filteredDocs = documents.filter(doc => {
    const typeInfo = getDocTypeInfo(doc);
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.fileName && doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesComm = selectedCommittee === 'all' || doc.committeeId === selectedCommittee;
    const matchesType = selectedFileType === 'all' || typeInfo.type === selectedFileType;

    return matchesSearch && matchesCat && matchesComm && matchesType;
  });

  const handleDownload = (doc: DocumentItem) => {
    const filename = doc.fileName || `${doc.title}.${doc.fileType?.toLowerCase() || 'pdf'}`;
    if (doc.pdfBase64) {
      const link = document.createElement('a');
      link.href = doc.pdfBase64;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback download generator
      const sampleContent = `Alexandria University Volunteers Platform - Document: ${doc.title}\nCategory: ${doc.category}\nCommittee: ${doc.committeeName}\nUploaded By: ${doc.uploadedBy}\nDate: ${doc.uploadedAt}\n\n${doc.description || ''}`;
      const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف الوثيقة: "${title}" نهائياً من الأرشيف؟`)) {
      deleteDocument(id);
    }
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setDocumentToEdit(doc);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setDocumentToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 text-right">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-blue-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1 justify-end sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              المكتبة والأرشيف الرقمي الشامل
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>مستودع لوائح ووثائق اللجان (Documents Hub)</span>
            <FolderGit2 className="w-5 h-5 text-blue-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            الأدلة التنظيمية، اللوائح، خطط الفعاليات، قوالب الهوية البصرية، والملفات المعتمدة بجميع الصيغ (PDF, Word, Excel, PPT, صور)
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenNew}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>رفع وإضافة ملف / وثيقة جديدة</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في المستندات واللوائح والملفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input text-xs pr-9 w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input text-xs"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="Rules">لوائح وقواعد السلوك (Rules)</option>
            <option value="Event Plans">خطط الفعاليات والإخلاء (Plans)</option>
            <option value="Templates">قوالب وهويات بصرية (Templates)</option>
            <option value="Training">مواد ودورات تدريبية (Training)</option>
            <option value="Reports">تقارير إدارية ورسمية (Reports)</option>
          </select>

          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="glass-input text-xs"
          >
            <option value="all">جميع الصيغ والامتدادات</option>
            <option value="PDF">مستندات PDF (.pdf)</option>
            <option value="Word">مستندات Word (.docx)</option>
            <option value="Excel">جداول Excel (.xlsx)</option>
            <option value="PowerPoint">عروض PowerPoint (.pptx)</option>
            <option value="Image">صور وتصاميم (Images)</option>
            <option value="Archive">ملفات مضغوطة (ZIP/RAR)</option>
            <option value="File">ملفات أخرى</option>
          </select>

          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="glass-input text-xs"
          >
            <option value="all">جميع اللجان</option>
            {committees.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-slate-400 text-xs">
            لا توجد وثائق أو ملفات تطابق معايير البحث الحالية
          </div>
        ) : (
          filteredDocs.map(doc => {
            const typeInfo = getDocTypeInfo(doc);
            return (
              <div 
                key={doc.id} 
                className="glass-card p-5 glass-card-hover border-slate-800 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Category & File Type badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      doc.category === 'Rules' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      doc.category === 'Event Plans' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      doc.category === 'Templates' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {doc.category === 'Rules' ? 'لوائح وسلوك' :
                       doc.category === 'Event Plans' ? 'خطط فعاليات' :
                       doc.category === 'Templates' ? 'قوالب وهوية' :
                       doc.category === 'Training' ? 'مواد تدريب' : 'تقارير رسمية'}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${typeInfo.badgeClass}`}>
                      {typeInfo.icon}
                      <span>{typeInfo.type} • {doc.fileSize}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">{doc.title}</h4>
                  
                  {doc.description && (
                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed bg-slate-900/50 p-2 rounded-lg">
                      {doc.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span>اللجنة: <strong className="text-slate-200">{doc.committeeName}</strong></span>
                    <span className="text-[10px] font-mono text-slate-500">{doc.uploadedAt}</span>
                  </div>
                </div>

                {/* Card Footer with Download, Preview and Management Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                          title="تعديل بيانات الملف"
                        >
                          <Edit3 className="w-4 h-4 text-sky-400" />
                        </button>

                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="حذف الملف نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => handleDownload(doc)}
                    className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل الملف</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Document Modal */}
      <AddDocumentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setDocumentToEdit(null); }}
        documentToEdit={documentToEdit}
      />

    </div>
  );
};
