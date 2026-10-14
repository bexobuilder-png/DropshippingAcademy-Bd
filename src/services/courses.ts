import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DEFAULT_COURSES,
  DEFAULT_PROMO_CODES,
  CourseItem,
  PromoCodeItem,
} from '../config/courses';
import {
  ConfirmedWaitlistRecord,
  loadConfirmedWaitlist,
  saveConfirmedWaitlist,
  LOCAL_WAITLIST_ENTRIES_KEY,
  WaitlistDbRow,
} from './waitlist';
import { fetchSiteSectionContent, saveSiteSectionContent } from './admin';

const COURSES_STORAGE_KEY = 'da_courses_custom_v1';
const PROMO_CODES_STORAGE_KEY = 'da_promo_codes_custom_v1';

export async function fetchCoursesList(): Promise<CourseItem[]> {
  try {
    const data = await fetchSiteSectionContent<CourseItem[]>(
      'courses_list',
      DEFAULT_COURSES
    );
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback to local storage
  }

  try {
    const raw = localStorage.getItem(COURSES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return DEFAULT_COURSES;
}

export async function saveCoursesList(
  courses: CourseItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new Event('site-courses-updated'));
  } catch {
    // Ignore
  }

  return await saveSiteSectionContent<CourseItem[]>('courses_list', courses);
}

export async function restoreDefaultCourses(): Promise<CourseItem[]> {
  await saveCoursesList(DEFAULT_COURSES);
  return DEFAULT_COURSES;
}

export async function fetchPromoCodesList(): Promise<PromoCodeItem[]> {
  try {
    const data = await fetchSiteSectionContent<PromoCodeItem[]>(
      'promo_codes_list',
      DEFAULT_PROMO_CODES
    );
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback
  }

  try {
    const raw = localStorage.getItem(PROMO_CODES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return DEFAULT_PROMO_CODES;
}

export async function savePromoCodesList(
  promoCodes: PromoCodeItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    localStorage.setItem(PROMO_CODES_STORAGE_KEY, JSON.stringify(promoCodes));
    window.dispatchEvent(new Event('site-promocodes-updated'));
  } catch {
    // Ignore
  }

  return await saveSiteSectionContent<PromoCodeItem[]>('promo_codes_list', promoCodes);
}

export async function restoreDefaultPromoCodes(): Promise<PromoCodeItem[]> {
  await savePromoCodesList(DEFAULT_PROMO_CODES);
  return DEFAULT_PROMO_CODES;
}

export interface PromoValidationResult {
  isValid: boolean;
  code?: string;
  discountType?: 'fixed' | 'percentage';
  discountAmount: number;
  finalPrice: number;
  message: string;
}

export function evaluatePromoCode(
  rawCode: string,
  course: CourseItem,
  availablePromoCodes: PromoCodeItem[]
): PromoValidationResult {
  const clean = rawCode.trim().toUpperCase();
  const basePrice = course.discountPrice !== undefined ? course.discountPrice : course.price;

  if (!clean) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: basePrice,
      message: 'অনুগ্রহ করে একটি প্রোমো কোড লিখুন।',
    };
  }

  const promo = availablePromoCodes.find(
    (p) => p.code.trim().toUpperCase() === clean && p.isActive
  );

  if (!promo) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: basePrice,
      message: `"${clean}" কোডটি সঠিক নয় বা মেয়াদ শেষ হয়েছে।`,
    };
  }

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = Math.round((basePrice * promo.discountValue) / 100);
  } else {
    discount = promo.discountValue;
  }

  discount = Math.min(discount, basePrice);
  const finalPrice = Math.max(0, basePrice - discount);

  return {
    isValid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountAmount: discount,
    finalPrice,
    message: `অভিনন্দন! প্রোমো কোড "${promo.code}" কার্যকর হয়েছে। আপনি ৳${discount} ছাড় পেয়েছেন!`,
  };
}

export interface CourseEnrollmentPayload {
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  courseFee: number;
  promoCode?: string;
  discountAmount?: number;
  finalFee: number;
}

/**
 * Updates course enrollment on the confirmed user record and in the database / local waitlist.
 */
export async function enrollStudentInCourse(
  email: string,
  payload: CourseEnrollmentPayload
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Update session ConfirmedWaitlistRecord
  const confirmed = loadConfirmedWaitlist();
  if (confirmed && confirmed.email.toLowerCase() === normalizedEmail) {
    const updatedRecord: ConfirmedWaitlistRecord = {
      ...confirmed,
      selectedCourseId: payload.courseId,
      selectedCourseTitle: payload.courseTitle,
      selectedCourseCategory: payload.courseCategory,
      courseFee: payload.courseFee,
      promoCode: payload.promoCode,
      discountAmount: payload.discountAmount || 0,
      finalFee: payload.finalFee,
      enrolledAt: new Date().toISOString(),
    };
    saveConfirmedWaitlist(updatedRecord);
  }

  // 2. Update Local Waitlist Entries (always fallback sync)
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
    if (raw) {
      const list: WaitlistDbRow[] = JSON.parse(raw);
      const updatedList = list.map((item) => {
        if (item.email.toLowerCase() === normalizedEmail) {
          return {
            ...item,
            course_id: payload.courseId,
            course_title: payload.courseTitle,
            course_fee: payload.courseFee,
            promo_code: payload.promoCode || '',
            discount_amount: payload.discountAmount || 0,
            final_fee: payload.finalFee,
            enrolled_at: new Date().toISOString(),
          };
        }
        return item;
      });
      localStorage.setItem(LOCAL_WAITLIST_ENTRIES_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('waitlist-entries-updated'));
    }
  } catch {
    // Ignore
  }

  // 3. Update Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('waitlist')
        .update({
          course_id: payload.courseId,
          course_title: payload.courseTitle,
          course_fee: payload.courseFee,
          promo_code: payload.promoCode || null,
          final_fee: payload.finalFee,
        })
        .ilike('email', normalizedEmail);
    } catch {
      // Suppress network/schema exceptions if column not yet added to SQL
    }
  }

  return { success: true };
}
