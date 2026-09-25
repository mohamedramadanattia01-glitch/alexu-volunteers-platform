import React, { useRef, useState } from 'react';
import { TaskAttachment } from '../../types';
import { 
  Upload, File, FileText, Image as ImageIcon, FileSpreadsheet, 
  Film, Music, Archive, X, Download, Eye, CheckCircle2, Loader2, Sparkles 
} from 'lucide-react';

interface FileAttachmentUploaderProps {
  attachments: TaskAttachment[];
  onChange: (attachments: TaskAttachment[]) => void;
  maxFiles?: number;
  label?: string;
  readOnly?: boolean;
}

export const FileAttachmentUploader: React.FC<FileAttachmentUploaderProps> = ({
  attachments,
  onChange,
  maxFiles = 10,
  label = 'إرفاق ملفات المخرجات (يقبل كافة الصيغ: صور، وورد، PDF، باوربوينت، إكسل، مضغوط...)',
  readOnly = false
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (filename: string, type: string) => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext) || type.startsWith('image/');
  };

  const getFileIcon = (filename: string, type: string) => {
    const ext = getFileExtension(filename);
    if (isImageFile(filename, type)) {
      return <ImageIcon className="w-5 h-5 text-sky-400" />;
    }
    if (ext === 'pdf' || type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    if (['doc', 'docx'].includes(ext) || type.includes('word') || type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-400" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || type.includes('excel') || type.includes('spreadsheet')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (['ppt', 'pptx'].includes(ext) || type.includes('presentation') || type.includes('powerpoint')) {
      return <FileText className="w-5 h-5 text-amber-400" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || type.startsWith('video/')) {
      return <Film className="w-5 h-5 text-purple-400" />;
    }
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext) || type.startsWith('audio/')) {
      return <Music className="w-5 h-5 text-pink-400" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || type.includes('zip') || type.includes('compressed')) {
      return <Archive className="w-5 h-5 text-amber-500" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const readFileAsDataUrl = (file: File): Promise<TaskAttachment> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: reader.result as string,
          type: file.type || 'application/octet-stream',
          size: formatFileSize(file.size),
          extension: getFileExtension(file.name),
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileArray = Array.from(files).slice(0, maxFiles - attachments.length);
      const newAttachments = await Promise.all(fileArray.map(f => readFileAsDataUrl(f)));
      onChange([...attachments, ...newAttachments]);
    } catch (err) {
      console.error('Error reading files:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (id?: string, idx?: number) => {
    if (readOnly) return;
    if (id) {
      onChange(attachments.filter(a => a.id !== id));
    } else if (idx !== undefined) {
      onChange(attachments.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="space-y-2.5 text-right">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-300">{label}</label>
        <span className="text-[10px] text-slate-400 font-mono">
          {attachments.length} مرفقات {maxFiles ? `(الحد الأقصى ${maxFiles})` : ''}
        </span>
      </div>

      {!readOnly && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesSelected(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-blue-500/40 hover:border-blue-400 rounded-2xl p-4 text-center bg-blue-950/20 hover:bg-blue-950/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
              <span className="text-xs font-bold text-blue-300">جاري معالجة وتشفير الملفات المرفقة...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-white">اضغط لاختيار الملفات أو اسحبها هنا مباشرة</div>
              <div className="text-[10px] text-slate-400 max-w-md">
                يقبل كافة الملفات: صور (PNG, JPG)، ملفات Word (.docx)، عروض PowerPoint (.pptx)، جداول Excel (.xlsx)، ملفات PDF، وأرشيف ZIP/RAR
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {attachments.map((att, idx) => {
            const isImg = isImageFile(att.name, att.type);

            return (
              <div
                key={att.id || idx}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isImg && att.url && att.url.startsWith('data:image') ? (
                    <img 
                      src={att.url} 
                      alt="" 
                      onClick={() => setPreviewImage({ url: att.url, name: att.name })}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700 cursor-pointer hover:scale-105 shrink-0" 
                    />
                  ) : (
                    <div className="p-1.5 rounded-lg bg-slate-800 shrink-0">
                      {getFileIcon(att.name, att.type)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="font-bold text-white truncate text-[11px]" title={att.name}>{att.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{att.size || 'ملف مرفق'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isImg && att.url && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ url: att.url, name: att.name })}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="معاينة الصورة"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {att.url && att.url !== '#' && (
                    <a
                      href={att.url}
                      download={att.name}
                      target="_blank"
                      rel="noreferrer"
                      title="تنزيل الملف"
                      className="p-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemove(att.id, idx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="حذف المرفق"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white truncate">{previewImage.name}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-slate-900">
              <img src={previewImage.url} alt="" className="max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
