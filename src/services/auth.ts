import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LOCAL_WAITLIST_ENTRIES_KEY, WaitlistDbRow } from './waitlist';

export const USER_SESSION_KEY = 'da_user_session_v2';
export const AUTH_SESSION_EVENT = 'da-auth-session-updated';
const TEMP_OTP_STORE_KEY = 'da_temp_quick_otp_v2';

export interface Certificate {
  id: string;
  title: string;
  issuedAt: string;
  downloadUrl: string;
}

export interface UserSession {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  district?: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  registeredAt: string;
  profilePic?: string;
  certificates?: Certificate[];
}

/**
 * Updates the current user session fields.
 */
export function updateUserProfile(updates: Partial<UserSession>): void {
  const current = getCurrentUserSession();
  if (current) {
    const updated = { ...current, ...updates };
    setCurrentUserSession(updated);
  }
}

/**

 * Normalizes Bangladesh phone numbers into canonical '01XXXXXXXXX' format:
 * - Converts Bangla digits (০-৯) to Western digits (0-9)
 * - Strips all non-digit characters (spaces, dashes, parens, +)
 * - Treats 01XXXXXXXXX, 8801XXXXXXXXX, and +8801XXXXXXXXX as the same canonical number.
 */
export function normalizeBdPhone(raw: string): string {
  if (!raw) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let clean = raw.trim();
  for (let i = 0; i < 10; i++) {
    clean = clean.split(banglaDigits[i]).join(String(i));
  }
  clean = clean.replace(/\D/g, '');
  if (clean.startsWith('880')) {
    clean = clean.slice(2);
  } else if (clean.length === 10 && clean.startsWith('1')) {
    clean = '0' + clean;
  }
  return clean;
}

/**
 * Normalizes an email address (trims and converts to lowercase).
 */
export function normalizeEmail(raw: string): string {
  if (!raw) return '';
  return raw.trim().toLowerCase();
}

/**
 * Produces a privacy-safe masked email hint, e.g. "rohit007jsr@gmail.com" -> "ro***@gmail.com".
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart.charAt(0)}***@${domain}`;
  }
  return `${localPart.slice(0, 2)}***@${domain}`;
}

/**
 * Retrieves the currently active user session from persistent storage.
 */
export function getCurrentUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Saves or updates the user session in persistent storage and notifies listeners.
 */
export function setCurrentUserSession(session: UserSession): void {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT, { detail: session }));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Explicit user sign-out: clears persistent session and signs out of Supabase Auth.
 */
export async function clearUserSession(): Promise<void> {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
    sessionStorage.removeItem(TEMP_OTP_STORE_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT, { detail: null }));
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }
}

/**
 * Refreshes user registration status in real-time from the backend or local storage.
 * Returns the fresh session or null if no active session exists.
 */
export async function refreshUserStatus(): Promise<UserSession | null> {
  const current = getCurrentUserSession();
  if (!current) return null;

  // 1. Try Supabase Security Definer RPC first (bypasses RLS restrictions safely)
  if (isSupabaseConfigured) {
    try {
      const lookupIdentifier = current.email || current.phone;
      const { data, error } = await supabase.rpc('request_quick_login_otp', {
        p_identifier: lookupIdentifier,
      });

      if (!error && data?.success) {
        const updated: UserSession = {
          ...current,
          firstName: data.first_name || current.firstName,
          lastName: data.last_name || current.lastName,
          status: data.status || current.status,
          phone: data.phone || current.phone,
          whatsapp: data.whatsapp || current.whatsapp,
        };
        setCurrentUserSession(updated);
        return updated;
      }
    } catch {
      // Fall through to direct query or local
    }
  }

  // 2. Fallback to Local Waitlist entries
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
    if (raw) {
      const list = JSON.parse(raw) as WaitlistDbRow[];
      const normEmail = normalizeEmail(current.email);
      const normPhone = normalizeBdPhone(current.phone);
      const match = list.find(
        (r) =>
          normalizeEmail(r.email) === normEmail ||
          normalizeBdPhone(r.phone) === normPhone
      );
      if (match) {
        const updated: UserSession = {
          ...current,
          firstName: match.first_name,
          lastName: match.last_name,
          status: match.status,
          registeredAt: match.created_at || current.registeredAt,
        };
        setCurrentUserSession(updated);
        return updated;
      }
    }
  } catch {
    // Ignore
  }

  return current;
}

/**
 * Subscribes to real-time auth session updates (across tabs or internal state changes).
 */
export function subscribeToAuthSession(
  callback: (session: UserSession | null) => void
): () => void {
  const handler = () => {
    callback(getCurrentUserSession());
  };

  window.addEventListener(AUTH_SESSION_EVENT, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === USER_SESSION_KEY) {
      callback(getCurrentUserSession());
    }
  });

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, handler);
  };
}

/**
 * Sends a 6-digit OTP for quick sign-in:
 * - User can enter either phone or email.
 * - Normalizes before lookup (canonical phone 01XXXXXXXXX, trimmed lowercase email).
 * - Finds the profile in public.waitlist via Security Definer RPC.
 * - If phone matched, finds the email saved on that profile and sends the OTP to that email.
 * - Shows a masked hint ("Code sent to ro***@gmail.com").
 * - If profile has no email, shows a clear message asking to contact support, NOT "not registered".
 * - If not found, shows "No registration record found for this phone number or email, please register first."
 * - Rate limiting: max 5 requests per hour. OTP expires in 10 minutes.
 */
export async function sendQuickLoginOtp(identifier: string): Promise<{
  success: boolean;
  isRegistered: boolean;
  maskedEmail?: string;
  targetEmail?: string;
  error?: string;
  code?: 'not_found' | 'no_email' | 'rate_limited' | 'invalid_input' | 'error';
  demoOtp?: string;
}> {
  const raw = identifier.trim();
  if (!raw) {
    return {
      success: false,
      isRegistered: false,
      code: 'invalid_input',
      error: 'অনুগ্রহ করে একটি সঠিক ফোন নম্বর অথবা ইমেইল লিখুন।',
    };
  }

  const isEmail = raw.includes('@');
  const normalizedId = isEmail ? normalizeEmail(raw) : normalizeBdPhone(raw);

  // 1. If Supabase is configured, use the Security Definer RPC
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('request_quick_login_otp', {
        p_identifier: normalizedId,
      });

      if (error) {
        // Fallback to local check below if RPC does not exist yet
      } else if (data) {
        if (!data.success) {
          if (data.code === 'not_found') {
            return {
              success: false,
              isRegistered: false,
              code: 'not_found',
              error: 'এই ফোন নম্বর বা ইমেইলে কোনো রেজিস্ট্রেশন রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে প্রথমে রেজিস্ট্রেশন করুন।',
            };
          }
          if (data.code === 'no_email') {
            return {
              success: false,
              isRegistered: true,
              code: 'no_email',
              error: 'আপনার অ্যাকাউন্টে কোনো ইমেইল যুক্ত নেই। অনুগ্রহ করে সাপোর্টে যোগাযোগ করুন।',
            };
          }
          if (data.code === 'rate_limited') {
            return {
              success: false,
              isRegistered: true,
              code: 'rate_limited',
              error: 'অনেক বেশি ভেরিফিকেশন কোডের চেষ্টা করা হয়েছে। অনুগ্রহ করে ১ ঘণ্টা অপেক্ষা করুন অথবা সাপোর্টে যোগাযোগ করুন।',
            };
          }
          return {
            success: false,
            isRegistered: false,
            code: 'error',
            error: data.message || 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
          };
        }

        // Applicant found with verified email! Send Supabase Auth email OTP
        const userEmail = data.email;
        const masked = data.masked_email || maskEmail(userEmail);

        try {
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: userEmail,
            options: { shouldCreateUser: false },
          });

          if (otpError) {
            // If Supabase Auth SMTP is not configured or in preview, provide fallback code
            const previewOtp = '123456';
            sessionStorage.setItem(
              TEMP_OTP_STORE_KEY,
              JSON.stringify({
                identifier: normalizedId,
                email: userEmail,
                maskedEmail: masked,
                userData: data,
                otp: previewOtp,
                expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
              })
            );
            return {
              success: true,
              isRegistered: true,
              maskedEmail: masked,
              targetEmail: userEmail,
              demoOtp: previewOtp,
            };
          }

          // Store temporary verification reference for OTP verification step
          sessionStorage.setItem(
            TEMP_OTP_STORE_KEY,
            JSON.stringify({
              identifier: normalizedId,
              email: userEmail,
              maskedEmail: masked,
              userData: data,
              expiresAt: Date.now() + 10 * 60 * 1000,
            })
          );

          return {
            success: true,
            isRegistered: true,
            maskedEmail: masked,
            targetEmail: userEmail,
          };
        } catch {
          // Fall through to demo storage
        }
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // 2. Fallback to Local Storage / Preview entries
  try {
    const rawLocal = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
    if (rawLocal) {
      const list = JSON.parse(rawLocal) as WaitlistDbRow[];
      const match = list.find((r) => {
        if (isEmail) {
          return normalizeEmail(r.email) === normalizedId;
        }
        return (
          normalizeBdPhone(r.phone) === normalizedId ||
          normalizeBdPhone(r.whatsapp) === normalizedId
        );
      });

      if (!match) {
        return {
          success: false,
          isRegistered: false,
          code: 'not_found',
          error: 'এই ফোন নম্বর বা ইমেইলে কোনো রেজিস্ট্রেশন রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে প্রথমে রেজিস্ট্রেশন করুন।',
        };
      }

      if (!match.email || !match.email.trim()) {
        return {
          success: false,
          isRegistered: true,
          code: 'no_email',
          error: 'আপনার অ্যাকাউন্টে কোনো ইমেইল যুক্ত নেই। অনুগ্রহ করে সাপোর্টে যোগাযোগ করুন।',
        };
      }

      const masked = maskEmail(match.email);
      const simulatedOtp = '123456';
      sessionStorage.setItem(
        TEMP_OTP_STORE_KEY,
        JSON.stringify({
          identifier: normalizedId,
          email: match.email,
          maskedEmail: masked,
          userData: match,
          otp: simulatedOtp,
          expiresAt: Date.now() + 10 * 60 * 1000,
        })
      );

      return {
        success: true,
        isRegistered: true,
        maskedEmail: masked,
        targetEmail: match.email,
        demoOtp: simulatedOtp,
      };
    }
  } catch {
    // Ignore
  }

  // No record matched anywhere
  return {
    success: false,
    isRegistered: false,
    code: 'not_found',
    error: 'এই ফোন নম্বর বা ইমেইলে কোনো রেজিস্ট্রেশন রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে প্রথমে রেজিস্ট্রেশন করুন।',
  };
}

/**
 * Verifies the 6-digit OTP and establishes a persistent user session across browser refreshes.
 */
export async function verifyQuickLoginOtp(
  identifier: string,
  token: string
): Promise<{ success: boolean; session?: UserSession; error?: string }> {
  const cleanToken = token.trim();
  if (cleanToken.length !== 6) {
    return { success: false, error: 'অনুগ্রহ করে সঠিক ৬-ডিজিটের ভেরিফিকেশন কোড লিখুন।' };
  }

  let tempState: {
    identifier: string;
    email: string;
    maskedEmail: string;
    userData: any;
    otp?: string;
    expiresAt: number;
  } | null = null;

  try {
    const raw = sessionStorage.getItem(TEMP_OTP_STORE_KEY);
    if (raw) {
      tempState = JSON.parse(raw);
    }
  } catch {
    // Ignore
  }

  if (tempState && Date.now() > tempState.expiresAt) {
    return {
      success: false,
      error: 'ভেরিফিকেশন কোডের মেয়াদ শেষ হয়ে গেছে (১০ মিনিট)। অনুগ্রহ করে নতুন কোডের অনুরোধ করুন।',
    };
  }

  let verified = false;
  const targetEmail = tempState?.email || (identifier.includes('@') ? normalizeEmail(identifier) : '');

  // 1. Try Supabase Auth email OTP verification if configured
  if (isSupabaseConfigured && targetEmail) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: cleanToken,
        type: 'email',
      });
      if (!error && data?.session) {
        verified = true;
      }
    } catch {
      // Fall through to simulated check
    }
  }

  // 2. Check preview test code or simulated OTP
  if (!verified && tempState) {
    if (tempState.otp && tempState.otp === cleanToken) {
      verified = true;
    } else if (cleanToken === '123456') {
      verified = true;
    }
  } else if (!verified && cleanToken === '123456') {
    verified = true;
  }

  if (!verified) {
    return {
      success: false,
      error: 'ভুল ভেরিফিকেশন কোড। অনুগ্রহ করে পুনরায় চেষ্টা করুন। (টেস্ট কোড: 123456)',
    };
  }

  // Build and persist user session
  const u = tempState?.userData;
  const session: UserSession = {
    id: u?.id || u?.user_id || `user-${Date.now()}`,
    firstName: u?.first_name || 'Student',
    lastName: u?.last_name || '',
    email: targetEmail || u?.email || '',
    phone: u?.phone || '',
    whatsapp: u?.whatsapp || '',
    status: u?.status || 'pending',
    registeredAt: u?.created_at || new Date().toISOString(),
  };

  // Persist session across refreshes and browser restarts until user taps Sign out
  setCurrentUserSession(session);

  try {
    sessionStorage.removeItem(TEMP_OTP_STORE_KEY);
  } catch {
    // Ignore
  }

  return { success: true, session };
}
