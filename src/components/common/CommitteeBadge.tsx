import React from 'react';
import { 
  ShieldCheck, UserCheck, Camera, Palette, Film, 
  FileText, Users, Layers, Award, Sparkles 
} from 'lucide-react';

interface CommitteeBadgeProps {
  committeeId?: string;
  committeeName?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const getCommitteeVisualInfo = (commId?: string, commName?: string) => {
  const id = commId || '';
  const name = commName || '';

  if (id === 'comm-org' || name.includes('تنظيم')) {
    return {
      name: 'لجنة التنظيم',
      shortCode: 'OC',
      color: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
      icon: ShieldCheck,
      hex: '#2563eb'
    };
  }

  if (id === 'comm-hr' || name.includes('موارد') || name.includes('HR')) {
    return {
      name: 'لجنة الموارد البشرية',
      shortCode: 'HR',
      color: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
      icon: UserCheck,
      hex: '#10b981'
    };
  }

  if (id === 'comm-media' || name.includes('تصوير') || name.includes('فوتوغرافي') || name.includes('ميديا')) {
    return {
      name: 'لجنة التصوير الفوتوغرافي والفيديوغرافي',
      shortCode: 'MEDIA',
      color: 'bg-purple-600/20 text-purple-300 border-purple-500/40',
      icon: Camera,
      hex: '#8b5cf6'
    };
  }

  if (id === 'comm-design' || (name.includes('تصميم') && !name.includes('مونتاج'))) {
    return {
      name: 'لجنة التصميم',
      shortCode: 'DESIGN',
      color: 'bg-sky-600/20 text-sky-300 border-sky-500/40',
      icon: Palette,
      hex: '#0ea5e9'
    };
  }

  if (id === 'comm-montage' || name.includes('مونتاج') || name.includes('فيديو')) {
    return {
      name: 'لجنة المونتاج',
      shortCode: 'MONTAGE',
      color: 'bg-pink-600/20 text-pink-300 border-pink-500/40',
      icon: Film,
      hex: '#ec4899'
    };
  }

  if (id === 'comm-content' || name.includes('محتوى') || name.includes('صناعة المحتوى')) {
    return {
      name: 'لجنة صناعة المحتوى',
      shortCode: 'CONTENT',
      color: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
      icon: FileText,
      hex: '#f59e0b'
    };
  }

  return {
    name: commName || 'لجنة عامة',
    shortCode: 'COMM',
    color: 'bg-slate-700/50 text-slate-300 border-slate-600',
    icon: Layers,
    hex: '#64748b'
  };
};

export const CommitteeBadge: React.FC<CommitteeBadgeProps> = ({
  committeeId,
  committeeName,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const info = getCommitteeVisualInfo(committeeId, committeeName);
  const IconComponent = info.icon;

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2 font-bold'
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-bold border ${info.color} ${sizeClasses[size]} ${className}`}>
      {showIcon && <IconComponent className={`${iconSizes[size]} shrink-0`} />}
      <span className="truncate">{info.name}</span>
    </span>
  );
};
