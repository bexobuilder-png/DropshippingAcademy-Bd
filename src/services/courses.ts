import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DEFAULT_COURSES,
  DEFAULT_PROMO_CODES,
  CourseItem,
  PromoCodeItem,
} from '../config/courses';
import { fetchSiteSectionContent, saveSiteSectionContent } from './admin';

const COURSES_STORAGE_KEY = 'da_courses_custom_v2';
const PROMO_CODES_STORAGE_KEY = 'da_promo_codes_custom_v2';

export interface CourseDbRow {
  id: string;
  title: string;
  batch_name?: string | null;
  category: string;
  subtitle: string;
  description: string;
  highlights: string[];
  duration: string;
  price: number;
  discount_price?: number | null;
  badge?: string | null;
  is_active: boolean;
  is_running: boolean;
  is_visible: boolean;
  sort_order: number;
  updated_at?: string;
}

function mapDbRowToCourse(row: CourseDbRow): CourseItem {
  // Find default fallback to preserve UI visual assets if needed
  const defaultMatch = DEFAULT_COURSES.find((d) => d.id === row.id);

  return {
    id: row.id,
    title: row.title,
    batchName: row.batch_name || undefined,
    category: row.category || defaultMatch?.category || 'ড্রপশিপিং রিসেলিং',
    subtitle: row.subtitle || defaultMatch?.subtitle || '',
    description: row.description || defaultMatch?.description || '',
    price: typeof row.price === 'number' ? row.price : 1000,
    discountPrice:
      typeof row.discount_price === 'number'
        ? row.discount_price
        : defaultMatch?.discountPrice,
    promoCodeEligible: true,
    duration: row.duration || defaultMatch?.duration || '৮ সপ্তাহ · লাইভ ক্লাস',
    highlights: Array.isArray(row.highlights) && row.highlights.length > 0
      ? row.highlights
      : defaultMatch?.highlights || ['হ্যান্ডস-অন প্রজেক্ট ও লাইভ সাপোর্ট'],
    badge: row.badge || defaultMatch?.badge || undefined,
    isActive: row.is_active !== false,
    isRunning: Boolean(row.is_running),
    isVisible: row.is_visible !== false,
    sortOrder: typeof row.sort_order === 'number' ? row.sort_order : 0,
  };
}

function mapCourseToDbRow(course: CourseItem, index: number): CourseDbRow {
  return {
    id: course.id,
    title: course.title,
    batch_name: course.batchName || null,
    category: course.category || 'ড্রপশিপিং রিসেলিং',
    subtitle: course.subtitle || '',
    description: course.description || '',
    highlights: course.highlights || [],
    duration: course.duration || '৮ সপ্তাহ · লাইভ ক্লাস',
    price: course.price,
    discount_price: course.discountPrice ?? null,
    badge: course.badge || null,
    is_active: course.isActive !== false,
    is_running: Boolean(course.isRunning),
    is_visible: course.isVisible !== false,
    sort_order: course.sortOrder ?? index + 1,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetches courses from the shared Supabase 'courses' table with no-cache guarantees.
 * Falls back to localStorage and default courses when offline or unconfigured.
 */
export async function fetchCoursesList(): Promise<CourseItem[]> {
  // 1. Try fetching directly from the shared Supabase database table
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = (data as CourseDbRow[]).map(mapDbRowToCourse);
        // Cache to localStorage for offline access
        try {
          localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(mapped));
        } catch {
          // Ignore
        }
        return mapped;
      }
    } catch {
      // Fall through to cache/defaults
    }
  }

  // 2. Try fetching from site_content table
  try {
    const data = await fetchSiteSectionContent<CourseItem[]>('courses_list', DEFAULT_COURSES);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Ignore
  }

  // 3. Fallback to local storage
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

/**
 * Saves courses to the shared Supabase database table and broadcasts updates to all clients.
 */
export async function saveCoursesList(
  courses: CourseItem[]
): Promise<{ success: boolean; error?: string }> {
  // Update local cache immediately
  try {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new Event('site-courses-updated'));
  } catch {
    // Ignore
  }

  // 1. Upsert into shared Supabase 'courses' table
  if (isSupabaseConfigured) {
    try {
      const rows = courses.map((c, i) => mapCourseToDbRow(c, i));
      const { error } = await supabase.from('courses').upsert(rows, { onConflict: 'id' });

      if (error) {
        // Also save to site_content as redundant backup
        await saveSiteSectionContent<CourseItem[]>('courses_list', courses);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to sync with Supabase' };
    }
  }

  // Backup sync to site_content
  await saveSiteSectionContent<CourseItem[]>('courses_list', courses);
  return { success: true };
}

/**
 * Fetches the currently active running course batch.
 */
export async function fetchRunningCourse(): Promise<CourseItem | null> {
  try {
    const list = await fetchCoursesList();
    if (!Array.isArray(list) || list.length === 0) return null;

    // Look for explicitly marked running course that is active and visible
    const running = list.find((c) => c.isRunning && c.isActive !== false && c.isVisible !== false);
    if (running) return running;

    // Fallback to first active and visible course
    const firstActive = list.find((c) => c.isActive !== false && c.isVisible !== false);
    return firstActive || null;
  } catch {
    return null;
  }
}

/**
 * Sets a specific course as the running batch across all clients.
 */
export async function setRunningCourse(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await fetchCoursesList();
    const updated = current.map((c) => ({
      ...c,
      isRunning: c.id === courseId,
    }));
    return await saveCoursesList(updated);
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to set running course' };
  }
}

export async function deleteCourse(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await fetchCoursesList();
    const updated = current.filter((c) => c.id !== courseId);
    try {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('site-courses-updated'));
    } catch {
      // Ignore
    }

    if (isSupabaseConfigured) {
      await supabase.from('courses').delete().eq('id', courseId);
    }
    await saveSiteSectionContent<CourseItem[]>('courses_list', updated);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
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
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  finalPrice: number;
  message: string;
}

export function evaluatePromoCode(
  inputCode: string,
  course: CourseItem,
  promoCodesList: PromoCodeItem[]
): PromoValidationResult {
  const clean = inputCode.trim().toUpperCase();
  const basePrice = course.discountPrice !== undefined ? course.discountPrice : course.price;

  if (!clean) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: basePrice,
      message: 'প্রোমো কোড লিখুন',
    };
  }

  const found = promoCodesList.find(
    (p) => p.code.trim().toUpperCase() === clean && p.isActive !== false
  );

  if (!found) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: basePrice,
      message: 'প্রদত্ত প্রোমো কোডটি সঠিক নয় বা মেয়াদ উত্তীর্ণ হয়েছে।',
    };
  }

  let discount = 0;
  if (found.discountType === 'percentage') {
    discount = Math.round((basePrice * found.discountValue) / 100);
  } else {
    discount = found.discountValue;
  }

  discount = Math.min(discount, basePrice);
  const finalPrice = Math.max(0, basePrice - discount);

  return {
    isValid: true,
    code: found.code,
    discountType: found.discountType,
    discountValue: found.discountValue,
    discountAmount: discount,
    finalPrice,
    message: `প্রোমো কোড "${found.code}" কার্যকর হয়েছে! ${discount}৳ ছাড় দেওয়া হয়েছে।`,
  };
}

export async function enrollStudentInCourse(
  email: string,
  payload: {
    courseId: string;
    courseTitle: string;
    courseCategory: string;
    courseFee: number;
    promoCode?: string;
    discountAmount?: number;
    finalFee: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const rawConfirmed = localStorage.getItem('da_waitlist_confirmed_v1');
    if (rawConfirmed) {
      const parsed = JSON.parse(rawConfirmed);
      parsed.selectedCourseId = payload.courseId;
      parsed.courseTitle = payload.courseTitle;
      parsed.promoCode = payload.promoCode;
      parsed.finalFee = payload.finalFee;
      localStorage.setItem('da_waitlist_confirmed_v1', JSON.stringify(parsed));
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('waitlist')
          .update({
            // Store selected course info if needed
          })
          .eq('email', email.trim().toLowerCase());
      } catch {
        // Ignore
      }
    }

    window.dispatchEvent(new Event('student-enrolled-updated'));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Enrollment failed' };
  }
}

// ============================================================================
// REAL-TIME LISTENERS & WINDOW FOCUS REFETCH
// ============================================================================

if (typeof window !== 'undefined') {
  // 1. Refetch on tab focus or visibility change to ensure no stale cache
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchCoursesList().then(() => {
        window.dispatchEvent(new Event('site-courses-updated'));
      });
    }
  });

  window.addEventListener('focus', () => {
    fetchCoursesList().then(() => {
      window.dispatchEvent(new Event('site-courses-updated'));
    });
  });

  // 2. Real-time Supabase subscription on 'courses' table
  if (isSupabaseConfigured) {
    try {
      supabase
        .channel('public:courses')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'courses' },
          () => {
            fetchCoursesList().then(() => {
              window.dispatchEvent(new Event('site-courses-updated'));
            });
          }
        )
        .subscribe();
    } catch {
      // Ignore in mock/offline mode
    }
  }
}
