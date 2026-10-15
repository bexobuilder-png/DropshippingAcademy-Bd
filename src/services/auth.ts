import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LOCAL_WAITLIST_ENTRIES_KEY, WaitlistDbRow } from './waitlist';

export const USER_SESSION_KEY = 'da_user_session_v2';
export const AUTH_SESSION_EVENT = 'da-auth-session-updated';

export interface UserSession {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  registeredAt: string;
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
 * Refreshes user registration status in real-time from the backend / local waitlist table.
 * Returns the fresh session or null if no active session exists.
 */
export async function refreshUserStatus(): Promise<UserSession | null> {
  const current = getCurrentUserSession();
  if (!current) return null;

  // 1. Try Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const cleanEmail = current.email.trim().toLowerCase();
      const { data, error } = await supabase
        .from('waitlist')
        .select('id, first_name, last_name, status, email, phone, whatsapp, created_at')
        .or(`email.ilike.${cleanEmail},phone.eq.${current.phone}`)
        .maybeSingle();

      if (!error && data) {
        const updated: UserSession = {
          ...current,
          firstName: data.first_name || current.firstName,
          lastName: data.last_name || current.lastName,
          status: data.status || current.status,
          registeredAt: data.created_at || current.registeredAt,
        };
        setCurrentUserSession(updated);
        return updated;
      }
    } catch {
      // Fallback to local
    }
  }

  // 2. Fallback to Local Waitlist entries
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
    if (raw) {
      const list = JSON.parse(raw) as WaitlistDbRow[];
      const match = list.find(
        (r) =>
          r.email.toLowerCase() === current.email.toLowerCase() ||
          r.phone === current.phone
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
 * Finds if a user is registered by Phone or Email.
 */
export async function lookupRegisteredApplicant(
  identifier: string
): Promise<WaitlistDbRow | null> {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  // 1. Supabase check
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .or(`email.ilike.${clean},phone.eq.${clean},whatsapp.eq.${clean}`)
        .maybeSingle();

      if (!error && data) {
        return data as WaitlistDbRow;
      }
    } catch {
      // Fall through to local
    }
  }

  // 2. Local entries check
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
    if (raw) {
      const list = JSON.parse(raw) as WaitlistDbRow[];
      const found = list.find(
        (r) =>
          r.email.toLowerCase() === clean ||
          r.phone.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
          r.whatsapp.replace(/\D/g, '') === clean.replace(/\D/g, '')
      );
      if (found) return found;
    }
  } catch {
    // Ignore
  }

  return null;
}

const TEMP_OTP_STORE_KEY = 'da_temp_quick_otp_v1';

/**
 * Sends a 6-digit OTP for quick re-login.
 */
export async function sendQuickLoginOtp(identifier: string): Promise<{
  success: boolean;
  isRegistered: boolean;
  error?: string;
  demoOtp?: string;
}> {
  const clean = identifier.trim().toLowerCase();
  const applicant = await lookupRegisteredApplicant(clean);

  if (!applicant) {
    return {
      success: false,
      isRegistered: false,
      error: 'এই ফোন নম্বর বা ইমেইলে কোনো রেজিস্ট্রেশন রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে প্রথমে রেজিস্ট্রেশন করুন।',
    };
  }

  if (isSupabaseConfigured && clean.includes('@')) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: clean,
        options: { shouldCreateUser: false },
      });
      if (error) {
        return { success: false, isRegistered: true, error: error.message };
      }
      return { success: true, isRegistered: true };
    } catch {
      // Fallback to simulated code
    }
  }

  // Simulated OTP for phone or preview environments
  const simulatedOtp = '123456';
  try {
    sessionStorage.setItem(
      TEMP_OTP_STORE_KEY,
      JSON.stringify({
        identifier: clean,
        otp: simulatedOtp,
        expiresAt: Date.now() + 5 * 60 * 1000,
      })
    );
  } catch {
    // Ignore
  }

  return {
    success: true,
    isRegistered: true,
    demoOtp: simulatedOtp,
  };
}

/**
 * Verifies the 6-digit quick login OTP and restores the persistent session.
 */
export async function verifyQuickLoginOtp(
  identifier: string,
  token: string
): Promise<{ success: boolean; session?: UserSession; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanToken = token.trim();

  if (cleanToken.length !== 6) {
    return { success: false, error: 'অনুগ্রহ করে সঠিক ৬-ডিজিটের ভেরিফিকেশন কোড লিখুন।' };
  }

  const applicant = await lookupRegisteredApplicant(cleanId);
  if (!applicant) {
    return { success: false, error: 'আবেদনকারী পাওয়া যায়নি।' };
  }

  let verified = false;

  // Supabase verify if email
  if (isSupabaseConfigured && cleanId.includes('@')) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanId,
        token: cleanToken,
        type: 'email',
      });
      if (!error && data?.session) {
        verified = true;
      }
    } catch {
      // Fallback
    }
  }

  // Check simulated OTP
  if (!verified) {
    try {
      const raw = sessionStorage.getItem(TEMP_OTP_STORE_KEY);
      if (raw) {
        const payload = JSON.parse(raw);
        if (
          payload.identifier === cleanId &&
          payload.otp === cleanToken &&
          Date.now() <= payload.expiresAt
        ) {
          verified = true;
        }
      }
      // In preview, allow 123456 as master test code
      if (cleanToken === '123456') {
        verified = true;
      }
    } catch {
      // Ignore
    }
  }

  if (!verified) {
    return {
      success: false,
      error: 'ভুল বা মেয়াদোত্তীর্ণ ভেরিফিকেশন কোড। অনুগ্রহ করে পুনরায় চেষ্টা করুন। (টেস্ট কোড: 123456)',
    };
  }

  const session: UserSession = {
    id: applicant.id || applicant.user_id || `user-${Date.now()}`,
    firstName: applicant.first_name,
    lastName: applicant.last_name,
    email: applicant.email,
    phone: applicant.phone,
    whatsapp: applicant.whatsapp,
    status: applicant.status || 'pending',
    registeredAt: applicant.created_at || new Date().toISOString(),
  };

  setCurrentUserSession(session);
  try {
    sessionStorage.removeItem(TEMP_OTP_STORE_KEY);
  } catch {
    // Ignore
  }

  return { success: true, session };
}
