import { Member, Role } from '../types';
import { isHighLeadershipRole } from './roleUtils';

export interface CommitteeCodeMapping {
  prefix: string;
  name: string;
}

export const COMMITTEE_PREFIXES: Record<string, CommitteeCodeMapping> = {
  'comm-org': { prefix: 'OC', name: 'لجنة التنظيم' },
  'comm-hr': { prefix: 'HR', name: 'لجنة الموارد البشرية' },
  'comm-montage': { prefix: 'MN', name: 'لجنة المونتاج' },
  'comm-media': { prefix: 'MD', name: 'لجنة التصوير الفوتوغرافي والفيديوغرافي' },
  'comm-photo': { prefix: 'MD', name: 'لجنة التصوير الفوتوغرافي والفيديوغرافي' },
  'comm-content': { prefix: 'CW', name: 'لجنة صناعة المحتوى' },
  'comm-design': { prefix: 'DS', name: 'لجنة التصميم' },
  'comm-leadership': { prefix: 'AU', name: 'القيادة العليا للفريق' },
};

/**
 * Determine committee prefix from committeeId or role
 */
export function getCommitteePrefix(committeeId: string, role?: Role): string {
  if (isHighLeadershipRole(role)) {
    return 'AU';
  }
  if (COMMITTEE_PREFIXES[committeeId]) {
    return COMMITTEE_PREFIXES[committeeId].prefix;
  }
  // Guess from committeeId keywords
  const lower = committeeId.toLowerCase();
  if (lower.includes('org')) return 'OC';
  if (lower.includes('hr')) return 'HR';
  if (lower.includes('media')) return 'MD';
  if (lower.includes('design')) return 'DS';
  return 'VL';
}

/**
 * Generate next unique Volunteer ID based on committee prefix
 * Format:
 * - High Leadership: AU-001, AU-002, AU-003...
 * - Committees: OC-101, HR-101, MD-101, DS-101...
 */
export function generateCommitteeVolunteerId(
  committeeId: string,
  role: Role,
  existingMembers: Member[] = []
): string {
  const prefix = getCommitteePrefix(committeeId, role);

  if (prefix === 'AU') {
    // Leadership numbers: AU-001, AU-002, etc.
    const auMembers = existingMembers.filter(m => m.volunteerId && m.volunteerId.startsWith('AU-'));
    const maxNum = auMembers.reduce((max, m) => {
      const match = m.volunteerId.match(/^AU-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextNum = maxNum + 1;
    return `AU-${nextNum.toString().padStart(3, '0')}`;
  }

  // Committee members: OG-101, HR-101, etc.
  const prefixMembers = existingMembers.filter(
    m => m.volunteerId && m.volunteerId.startsWith(`${prefix}-`)
  );
  const maxNum = prefixMembers.reduce((max, m) => {
    const match = m.volunteerId.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 100);

  const nextNum = maxNum + 1;
  return `${prefix}-${nextNum}`;
}
