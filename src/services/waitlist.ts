import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  waitlistStep1Schema,
  validateWhatsAppNumberFormat,
  type WaitlistFormValues,
} from '../schemas/waitlist';

const DRAFT_STORAGE_KEY = 'da_waitlist_draft_v1';
const CONFIRMED_STORAGE_KEY = 'da_waitlist_confirmed_v1';
const HERO_EMAIL_PREFILL_KEY = 'da_hero_email_prefill_v1';
export const LOCAL_WAITLIST_ENTRIES_KEY = 'da_local_waitlist_entries_v1';

export interface ServerValidationResult {
  success: boolean;
  normalized?: WaitlistFormValues;
  fieldErrors?: Partial<Record<keyof WaitlistFormValues, string>>;
  error?: string;
}

/**
 * Validates the registration form payload on the server (`/api/validate-registration`)
 * using libphonenumber-js and Zod when the form is submitted.
 */
export async function validateRegistrationOnServer(
  formData: WaitlistFormValues
): Promise<ServerValidationResult> {
  try {
    const response = await fetch('/api/validate-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = (await response.json()) as ServerValidationResult;
    if (!response.ok || !data.success) {
      return {
        success: false,
        fieldErrors: data.fieldErrors,
        error: data.error,
      };
    }

    return {
      success: true,
      normalized: data.normalized || formData,
    };
  } catch {
    // Fallback if server route is unreachable in static-only preview
    const phoneCheck = validateWhatsAppNumberFormat(formData.phone, 'BD');
    const effectiveWa = formData.sameAsPhone ? formData.phone : formData.whatsapp;
    const waCheck = validateWhatsAppNumberFormat(effectiveWa, 'BD');
    const candidate: WaitlistFormValues = {
      ...formData,
      phone: phoneCheck.isValid ? phoneCheck.e164 : formData.phone,
      whatsapp: waCheck.isValid ? waCheck.e164 : effectiveWa,
    };
    const parsed = waitlistStep1Schema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof WaitlistFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof WaitlistFormValues | undefined;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return {
        success: false,
        fieldErrors,
        error: 'Please check the highlighted registration fields and try again.',
      };
    }
    return {
      success: true,
      normalized: parsed.data,
    };
  }
}

export interface WaitlistDbRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  whatsapp: string;
  email: string;
  consent_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  created_at: string;
  course_id?: string;
  course_title?: string;
  course_fee?: number;
  promo_code?: string;
  discount_amount?: number;
  final_fee?: number;
  enrolled_at?: string;
}

export function appendLocalWaitlistEntry(formData: WaitlistFormValues): void {
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
    const list: WaitlistDbRow[] = raw ? JSON.parse(raw) : [];
    const normalizedEmail = formData.email.trim().toLowerCase();
    const exists = list.some((item) => item.email.toLowerCase() === normalizedEmail);
    if (!exists) {
      const newRow: WaitlistDbRow = {
        id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
        user_id: `user-${Date.now()}`,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: normalizedEmail,
        consent_accepted: formData.consentAccepted,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_WAITLIST_ENTRIES_KEY, JSON.stringify([newRow, ...list]));
    }
  } catch {
    // Ignore storage errors
  }
}

export interface ConfirmedWaitlistRecord {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappConfirmedByUser?: boolean;
  dateOfBirth: string;
  alreadyOnWaitlist: boolean;
  confirmedAt: string;
  selectedCourseId?: string;
  selectedCourseTitle?: string;
  selectedCourseCategory?: string;
  courseFee?: number;
  promoCode?: string;
  discountAmount?: number;
  finalFee?: number;
  enrolledAt?: string;
}

export function saveHeroEmailPrefill(email: string): void {
  try {
    sessionStorage.setItem(HERO_EMAIL_PREFILL_KEY, email.trim());
  } catch {
    // Ignore storage quota errors
  }
}

export function consumeHeroEmailPrefill(): string {
  try {
    const email = sessionStorage.getItem(HERO_EMAIL_PREFILL_KEY) || '';
    sessionStorage.removeItem(HERO_EMAIL_PREFILL_KEY);
    return email;
  } catch {
    return '';
  }
}

export function saveWaitlistDraft(data: WaitlistFormValues): void {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function loadWaitlistDraft(): WaitlistFormValues | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WaitlistFormValues;
  } catch {
    return null;
  }
}

export function clearWaitlistDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function saveConfirmedWaitlist(record: ConfirmedWaitlistRecord): void {
  try {
    sessionStorage.setItem(CONFIRMED_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore
  }
}

export function loadConfirmedWaitlist(): ConfirmedWaitlistRecord | null {
  try {
    const raw = sessionStorage.getItem(CONFIRMED_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConfirmedWaitlistRecord;
  } catch {
    return null;
  }
}

export interface OtpDispatchResult {
  success: boolean;
  error?: string;
  isRateLimited?: boolean;
  demoMode?: boolean;
}

/**
 * Step 1: Send 6-digit email OTP via Supabase Auth (`signInWithOtp`).
 */
export async function sendEmailVerificationOtp(
  email: string,
  honeypot?: string
): Promise<OtpDispatchResult> {
  if (honeypot && honeypot.trim().length > 0) {
    // Silently reject bots
    return { success: false, error: 'Unable to process request.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isSupabaseConfigured) {
    // Preview fallback when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not yet set
    await new Promise((resolve) => setTimeout(resolve, 650));
    return {
      success: true,
      demoMode: true,
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      const status = (error as { status?: number }).status;
      const msg = error.message.toLowerCase();
      if (
        status === 429 ||
        msg.includes('rate limit') ||
        msg.includes('too many requests') ||
        msg.includes('security purposes') ||
        msg.includes('60 seconds')
      ) {
        return {
          success: false,
          isRateLimited: true,
          error:
            'Too many verification requests. Please wait 60 seconds before requesting another code.',
        };
      }

      return {
        success: false,
        error: error.message || 'Could not send verification email. Please try again.',
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Network error while contacting authentication server. Please check your connection.',
    };
  }
}

export interface VerifyAndInsertResult {
  success: boolean;
  alreadyOnWaitlist?: boolean;
  error?: string;
  isRateLimited?: boolean;
}

/**
 * Step 2: Verify the 6-digit email OTP (`verifyOtp`), insert the row into `public.waitlist`
 * with `user_id = session.user.id`, clear sessionStorage draft, and sign out.
 */
async function triggerConfirmationEmail(email: string, firstName: string, lastName: string) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        action: 'waitlist_confirmed',
      }),
    });
  } catch {
    // Non-blocking email trigger
  }
}

export async function verifyEmailOtpAndInsertWaitlist(
  token: string,
  formData: WaitlistFormValues
): Promise<VerifyAndInsertResult> {
  const cleanToken = token.trim();
  const normalizedEmail = formData.email.trim().toLowerCase();

  if (!isSupabaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 750));
    if (cleanToken === '000000') {
      return {
        success: false,
        error: 'Invalid or expired verification code. Please check the 6-digit code and try again.',
      };
    }

    const confirmed: ConfirmedWaitlistRecord = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: normalizedEmail,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      whatsappConfirmedByUser: Boolean(formData.whatsappConfirmedByUser),
      dateOfBirth: formData.dateOfBirth,
      alreadyOnWaitlist: false,
      confirmedAt: new Date().toISOString(),
    };
    saveConfirmedWaitlist(confirmed);
    appendLocalWaitlistEntry(formData);
    clearWaitlistDraft();
    triggerConfirmationEmail(normalizedEmail, formData.firstName.trim(), formData.lastName.trim());
    return { success: true, alreadyOnWaitlist: false };
  }

  try {
    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: cleanToken,
      type: 'email',
    });

    if (verifyError || !authData?.session?.user?.id) {
      const status = (verifyError as { status?: number } | null)?.status;
      const msg = (verifyError?.message || '').toLowerCase();

      if (status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
        return {
          success: false,
          isRateLimited: true,
          error: 'Too many verification attempts. Please wait a minute before trying again.',
        };
      }

      return {
        success: false,
        error:
          'Invalid or expired 6-digit verification code. Please double-check your email or request a new code.',
      };
    }

    const userId = authData.session.user.id;

    const { error: insertError } = await supabase.from('waitlist').insert({
      user_id: userId,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      date_of_birth: formData.dateOfBirth,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: normalizedEmail,
      consent_accepted: formData.consentAccepted,
      status: 'pending',
    });

    let alreadyOnWaitlist = false;

    if (insertError) {
      // Postgres 23505 = unique_violation (user_id or email already exists)
      if (
        insertError.code === '23505' ||
        insertError.message.toLowerCase().includes('duplicate key')
      ) {
        alreadyOnWaitlist = true;
      } else {
        await supabase.auth.signOut();
        return {
          success: false,
          error: insertError.message || 'Could not save your waitlist entry. Please try again.',
        };
      }
    }

    const confirmed: ConfirmedWaitlistRecord = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: normalizedEmail,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      whatsappConfirmedByUser: Boolean(formData.whatsappConfirmedByUser),
      dateOfBirth: formData.dateOfBirth,
      alreadyOnWaitlist,
      confirmedAt: new Date().toISOString(),
    };

    saveConfirmedWaitlist(confirmed);
    appendLocalWaitlistEntry(formData);
    clearWaitlistDraft();
    await supabase.auth.signOut();

    triggerConfirmationEmail(normalizedEmail, formData.firstName.trim(), formData.lastName.trim());

    return {
      success: true,
      alreadyOnWaitlist,
    };
  } catch {
    return {
      success: false,
      error: 'An unexpected network error occurred during verification. Please try again.',
    };
  }
}

export function maskEmailAddress(email: string): string {
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return '***@email.com';
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex);
  if (local.length <= 2) {
    return `${local[0] || '*'}***${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}${domain}`;
}
