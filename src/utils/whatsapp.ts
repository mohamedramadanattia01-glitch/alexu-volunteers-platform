/**
 * WhatsApp & Phone Formatting Utilities
 * Automatically handles local Egyptian mobile numbers (01xxxxxxxxx -> 201xxxxxxxxx)
 * without forcing users to type international country codes (+20 or 20).
 */

export const formatWhatsAppNumber = (rawPhone?: string | null): string => {
  if (!rawPhone) return '';
  
  // Strip all non-numeric characters
  let clean = String(rawPhone).replace(/[^0-9]/g, '');
  if (!clean) return '';

  // Case 1: Already has 0020 prefix -> 20xxxxxxxxxx
  if (clean.startsWith('0020')) {
    clean = clean.substring(2);
  }
  // Case 2: Egyptian local format starting with 01 (11 digits: 010, 011, 012, 015)
  else if (clean.startsWith('01') && clean.length === 11) {
    clean = '20' + clean.substring(1);
  }
  // Case 3: Egyptian local format missing leading zero (10 digits starting with 10, 11, 12, 15)
  else if (clean.startsWith('1') && (clean.length === 10 || clean.length === 11) && !clean.startsWith('18') && !clean.startsWith('19')) {
    clean = '20' + clean;
  }
  // Case 4: General local number starting with single 0 (length >= 10)
  else if (clean.startsWith('0') && !clean.startsWith('00') && clean.length >= 10) {
    clean = '20' + clean.substring(1);
  }

  return clean;
};

/**
 * Returns a direct https://wa.me/... link with country code automatically applied.
 */
export const getWhatsAppUrl = (rawPhone?: string | null, message?: string): string => {
  const formatted = formatWhatsAppNumber(rawPhone);
  if (!formatted) return '#';
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${formatted}${query}`;
};

/**
 * Checks if a phone number is valid and can generate a WhatsApp quick action.
 */
export const hasValidWhatsApp = (rawPhone?: string | null): boolean => {
  if (!rawPhone) return false;
  const digits = String(rawPhone).replace(/[^0-9]/g, '');
  return digits.length >= 9;
};
