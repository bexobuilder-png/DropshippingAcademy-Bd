import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StudentEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  district?: string;
  enrollmentType: 'payment' | 'promo_only';
  promoCodeUsed?: string;
  paymentMethod?: 'bKash' | 'Nagad' | 'Rocket';
  senderPhone?: string;
  trxId?: string;
  amountPaid?: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
}

const ENROLLMENTS_STORAGE_KEY = 'da_student_enrollments_v1';

export const INITIAL_ENROLLMENTS: StudentEnrollment[] = [];

export async function fetchStudentEnrollments(): Promise<StudentEnrollment[]> {
  // 1. Try Supabase if available
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: StudentEnrollment[] = data.map((d) => ({
          id: d.id,
          courseId: d.course_id || '',
          courseTitle: d.course_title || '',
          courseCategory: d.course_category || '',
          studentName: d.student_name || '',
          studentPhone: d.student_phone || '',
          studentEmail: d.student_email || undefined,
          district: d.district || undefined,
          enrollmentType: (d.enrollment_type as 'payment' | 'promo_only') || 'payment',
          promoCodeUsed: d.promo_code_used || undefined,
          paymentMethod: d.payment_method || undefined,
          senderPhone: d.sender_phone || undefined,
          trxId: d.trx_id || undefined,
          amountPaid: d.amount_paid ?? 0,
          status: (d.status as 'pending' | 'approved' | 'rejected') || 'pending',
          notes: d.notes || undefined,
          createdAt: d.created_at || new Date().toISOString(),
        }));
        try {
          localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(mapped));
        } catch {
          // Ignore
        }
        return mapped;
      }
    } catch {
      // Fall through to localStorage
    }
  }

  // 2. Fallback to localStorage
  try {
    const raw = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return [];
}

export async function submitStudentEnrollment(
  payload: Omit<StudentEnrollment, 'id' | 'createdAt' | 'status'>
): Promise<{ success: boolean; enrollment?: StudentEnrollment; error?: string }> {
  const newEnrollment: StudentEnrollment = {
    ...payload,
    id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = await fetchStudentEnrollments();
    const updated = [newEnrollment, ...existing];
    localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('student-enrollments-updated', { detail: newEnrollment }));
  } catch (err: any) {
    console.error('Failed to save enrollment locally:', err);
  }

  // If Supabase configured, attempt remote insert
  if (isSupabaseConfigured) {
    try {
      await supabase.from('course_enrollments').insert({
        id: newEnrollment.id,
        course_id: newEnrollment.courseId,
        course_title: newEnrollment.courseTitle,
        course_category: newEnrollment.courseCategory,
        student_name: newEnrollment.studentName,
        student_phone: newEnrollment.studentPhone,
        student_email: newEnrollment.studentEmail || null,
        district: newEnrollment.district || null,
        enrollment_type: newEnrollment.enrollmentType,
        promo_code_used: newEnrollment.promoCodeUsed || null,
        payment_method: newEnrollment.paymentMethod || null,
        sender_phone: newEnrollment.senderPhone || null,
        trx_id: newEnrollment.trxId || null,
        amount_paid: newEnrollment.amountPaid || 0,
        status: newEnrollment.status,
        created_at: newEnrollment.createdAt,
      });
    } catch {
      // Local copy is already saved
    }
  }

  return { success: true, enrollment: newEnrollment };
}

export async function updateEnrollmentStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  notes?: string
): Promise<boolean> {
  try {
    const list = await fetchStudentEnrollments();
    const index = list.findIndex((e) => e.id === id);
    if (index >= 0) {
      list[index].status = status;
      if (notes !== undefined) {
        list[index].notes = notes;
      }
      localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('student-enrollments-updated'));
    }
  } catch (err) {
    console.error('Failed to update status locally:', err);
    return false;
  }

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('course_enrollments')
        .update({ status, ...(notes !== undefined ? { notes } : {}) })
        .eq('id', id);
    } catch {
      // Ignore
    }
  }

  return true;
}

export async function deleteStudentEnrollment(id: string): Promise<boolean> {
  try {
    const list = await fetchStudentEnrollments();
    const updated = list.filter((e) => e.id !== id);
    localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('student-enrollments-updated'));
  } catch (err) {
    console.error('Failed to delete enrollment locally:', err);
    return false;
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('course_enrollments').delete().eq('id', id);
    } catch {
      // Ignore
    }
  }

  return true;
}

export async function verifyEmailOtpAndEnroll(
  token: string,
  email: string,
  payload: Omit<StudentEnrollment, 'id' | 'createdAt' | 'status'>
): Promise<{ success: boolean; enrollment?: StudentEnrollment; error?: string }> {
  const cleanToken = token.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!isSupabaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 750));
    // Demo mode: accept anything except 000000
    if (cleanToken === '000000') {
      return { success: false, error: 'ভুল ভেরিফিকেশন কোড। আবার চেষ্টা করুন।' };
    }
    return submitStudentEnrollment(payload);
  }

  try {
    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: cleanToken,
      type: 'email',
    });

    if (verifyError || !authData?.session?.user?.id) {
      return {
        success: false,
        error: 'ভুল বা মেয়াদোত্তীর্ণ ভেরিফিকেশন কোড। অনুগ্রহ করে আবার যাচাই করুন।',
      };
    }

    // OTP verified, now submit enrollment
    return submitStudentEnrollment({
      ...payload,
      studentEmail: normalizedEmail,
    });
  } catch (err) {
    return {
      success: false,
      error: 'সার্ভারে যোগাযোগ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    };
  }
}
