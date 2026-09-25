/**
 * Egyptian National ID & Birthday / Age Utilities
 * وحدة معالجة وتدقيق الرقم القومي المصري واستخراج تاريخ الميلاد والعمر الدقيق
 */

export const EGYPTIAN_GOVERNORATES: Record<string, string> = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
  '88': 'خارج جمهورية مصر العربية'
};

export const ARABIC_MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export interface NationalIdParseResult {
  isValid: boolean;
  errorMessage?: string;
  birthDate: string; // 'YYYY-MM-DD'
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  age: number;
  gender: 'male' | 'female';
  genderAr: string; // 'ذكر' | 'أنثى'
  governorateCode: string;
  governorate: string;
  formattedDate: string; // '15 إبريل 2004'
  formattedNumericDate: string; // '15 / 04 / 2004'
  zodiacSign: string;
}

export interface MemberExactBirthData {
  isValid: boolean;
  birthDate: string; // 'YYYY-MM-DD'
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  currentAge: number;
  nextAge: number;
  diffDays: number;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
  formattedDate: string; // '15 إبريل'
  formattedFullDate: string; // '15 إبريل 2004'
  formattedNumericDate: string; // '15 / 04 / 2004'
  governorate?: string;
  gender?: 'male' | 'female';
  genderAr?: string;
  zodiacSign: string;
}

/**
 * Convert Arabic/Eastern numerals (٠-٩) to Western Arabic digits (0-9)
 */
export function normalizeNumerals(str: string): string {
  if (!str) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, d => arabicDigits.indexOf(d).toString()).trim();
}

/**
 * Get Arabic Zodiac Sign from Month and Day
 */
export function getArabicZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'برج الحمل ♈';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'برج الثور ♉';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'برج الجوزاء ♊';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'برج السرطان ♋';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'برج الأسد ♌';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'برج العذراء ♍';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'برج الميزان ♎';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'برج العقرب ♏';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'برج القوس ♐';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'برج الجدي ♑';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'برج الدلو ♒';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'برج الحوت ♓';
  return '—';
}

/**
 * Calculate accurate age from year, month (1-12), and day (1-31)
 */
export function calculateExactAge(birthYear: number, birthMonth: number, birthDay: number): number {
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = (today.getMonth() + 1) - birthMonth;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Parse and Validate 14-digit Egyptian National ID
 */
export function parseEgyptianNationalId(rawId?: string | null): NationalIdParseResult {
  if (!rawId) {
    return {
      isValid: false,
      errorMessage: 'الرقم القومي غير مدخل',
      birthDate: '',
      birthYear: 0,
      birthMonth: 0,
      birthDay: 0,
      age: 0,
      gender: 'male',
      genderAr: 'ذكر',
      governorateCode: '',
      governorate: '',
      formattedDate: '',
      formattedNumericDate: '',
      zodiacSign: ''
    };
  }

  const clean = normalizeNumerals(rawId).replace(/[^0-9]/g, '');

  if (clean.length !== 14) {
    return {
      isValid: false,
      errorMessage: `الرقم القومي يجب أن يتكون من 14 رقماً (تم إدخال ${clean.length} رقم)`,
      birthDate: '',
      birthYear: 0,
      birthMonth: 0,
      birthDay: 0,
      age: 0,
      gender: 'male',
      genderAr: 'ذكر',
      governorateCode: '',
      governorate: '',
      formattedDate: '',
      formattedNumericDate: '',
      zodiacSign: ''
    };
  }

  const centuryCode = clean[0];
  let century = 0;
  if (centuryCode === '2') {
    century = 1900;
  } else if (centuryCode === '3') {
    century = 2000;
  } else {
    return {
      isValid: false,
      errorMessage: 'الخانة الأولى غير صحيحة (يجب أن تبدأ بـ 2 أو 3)',
      birthDate: '',
      birthYear: 0,
      birthMonth: 0,
      birthDay: 0,
      age: 0,
      gender: 'male',
      genderAr: 'ذكر',
      governorateCode: '',
      governorate: '',
      formattedDate: '',
      formattedNumericDate: '',
      zodiacSign: ''
    };
  }

  const yy = parseInt(clean.substring(1, 3), 10);
  const mm = parseInt(clean.substring(3, 5), 10);
  const dd = parseInt(clean.substring(5, 7), 10);
  const govCode = clean.substring(7, 9);
  const genderDigit = parseInt(clean[12], 10);

  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) {
    return {
      isValid: false,
      errorMessage: 'تاريخ الميلاد داخل الرقم القومي غير صالح',
      birthDate: '',
      birthYear: 0,
      birthMonth: 0,
      birthDay: 0,
      age: 0,
      gender: 'male',
      genderAr: 'ذكر',
      governorateCode: '',
      governorate: '',
      formattedDate: '',
      formattedNumericDate: '',
      zodiacSign: ''
    };
  }

  const birthYear = century + yy;
  const birthMonth = mm;
  const birthDay = dd;

  // Validate month and day bounds
  if (birthMonth < 1 || birthMonth > 12) {
    return {
      isValid: false,
      errorMessage: `الشهر المستخرج (${birthMonth}) غير صالح`,
      birthDate: '',
      birthYear: 0,
      birthMonth: 0,
      birthDay: 0,
      age: 0,
      gender: 'male',
      genderAr: 'ذكر',
      governorateCode: '',
      governorate: '',
      formattedDate: '',
      formattedNumericDate: '',
      zodiacSign: ''
    };
  }

  // Calendar validation for real days in month (e.g. leap years, 30 vs 31)
  const testDate = new Date(birthYear, birthMonth - 1, birthDay);
  if (
    testDate.getFullYear() !== birthYear ||
    testDate.getMonth() !== birthMonth - 1 ||
    testDate.getDate() !== birthDay
  ) {
    return {
      isValid: false,
      errorMessage: `يوم الميلاد (${birthDay}) غير صحيح للشهر المستخرج`,
      birthDate: '',
      birthYear: 0,
      birthMonth: 0,
      birthDay: 0,
      age: 0,
      gender: 'male',
      genderAr: 'ذكر',
      governorateCode: '',
      governorate: '',
      formattedDate: '',
      formattedNumericDate: '',
      zodiacSign: ''
    };
  }

  const isMale = genderDigit % 2 === 1;
  const gender: 'male' | 'female' = isMale ? 'male' : 'female';
  const genderAr = isMale ? 'ذكر' : 'أنثى';
  const governorate = EGYPTIAN_GOVERNORATES[govCode] || 'محافظة أخرى';
  const age = calculateExactAge(birthYear, birthMonth, birthDay);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const birthDate = `${birthYear}-${pad(birthMonth)}-${pad(birthDay)}`;
  const monthName = ARABIC_MONTH_NAMES[birthMonth - 1] || `${birthMonth}`;
  const formattedDate = `${birthDay} ${monthName} ${birthYear}`;
  const formattedNumericDate = `${pad(birthDay)} / ${pad(birthMonth)} / ${birthYear}`;
  const zodiacSign = getArabicZodiacSign(birthMonth, birthDay);

  return {
    isValid: true,
    birthDate,
    birthYear,
    birthMonth,
    birthDay,
    age,
    gender,
    genderAr,
    governorateCode: govCode,
    governorate,
    formattedDate,
    formattedNumericDate,
    zodiacSign
  };
}

/**
 * Extract complete birth data & birthday countdown for a member
 * Supports nationalId first, then falls back to birthDate string
 */
export function getMemberExactBirthData(member: {
  nationalId?: string | null;
  birthDate?: string | null;
  age?: number | null;
}): MemberExactBirthData {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let birthYear = 2005;
  let birthMonth = 1;
  let birthDay = 1;
  let isValid = false;
  let governorate: string | undefined;
  let gender: 'male' | 'female' | undefined;
  let genderAr: string | undefined;

  // 1. Try parsing National ID first
  if (member.nationalId) {
    const natRes = parseEgyptianNationalId(member.nationalId);
    if (natRes.isValid) {
      birthYear = natRes.birthYear;
      birthMonth = natRes.birthMonth;
      birthDay = natRes.birthDay;
      governorate = natRes.governorate;
      gender = natRes.gender;
      genderAr = natRes.genderAr;
      isValid = true;
    }
  }

  // 2. Fallback to birthDate string if nationalId wasn't valid
  if (!isValid && member.birthDate && member.birthDate.includes('-')) {
    const parts = member.birthDate.split('-');
    if (parts.length >= 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        birthYear = y;
        birthMonth = m;
        birthDay = d;
        isValid = true;
      }
    }
  }

  // 3. Fallback: if user specified age but no date, synthesize year
  if (!isValid && member.age && member.age > 0) {
    birthYear = today.getFullYear() - member.age;
    birthMonth = 1;
    birthDay = 1;
    isValid = true;
  }

  const currentAge = calculateExactAge(birthYear, birthMonth, birthDay);

  // Calculate Next Birthday Countdown
  const thisYearBirthday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let nextBirthdayDate = thisYearBirthday;
  if (thisYearBirthday.getTime() < todayStart.getTime()) {
    nextBirthdayDate = new Date(today.getFullYear() + 1, birthMonth - 1, birthDay);
  }

  const diffTime = nextBirthdayDate.getTime() - todayStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isToday = birthMonth === currentMonth && birthDay === currentDay;
  const isThisWeek = !isToday && diffDays > 0 && diffDays <= 7;
  const isThisMonth = birthMonth === currentMonth;

  // Next age is age turning on next birthday (if today is birthday, it is currentAge)
  const nextAge = isToday ? currentAge : currentAge + 1;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const monthName = ARABIC_MONTH_NAMES[birthMonth - 1] || `${birthMonth}`;
  const formattedDate = `${birthDay} ${monthName}`;
  const formattedFullDate = `${birthDay} ${monthName} ${birthYear}`;
  const formattedNumericDate = `${pad(birthDay)} / ${pad(birthMonth)} / ${birthYear}`;
  const zodiacSign = getArabicZodiacSign(birthMonth, birthDay);

  return {
    isValid,
    birthDate: `${birthYear}-${pad(birthMonth)}-${pad(birthDay)}`,
    birthYear,
    birthMonth,
    birthDay,
    currentAge,
    nextAge,
    diffDays,
    isToday,
    isThisWeek,
    isThisMonth,
    formattedDate,
    formattedFullDate,
    formattedNumericDate,
    governorate,
    gender,
    genderAr,
    zodiacSign
  };
}
