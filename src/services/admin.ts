import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  FOUNDERS as DEFAULT_FOUNDERS,
  FOUNDER_STORY as DEFAULT_FOUNDER_STORY,
  FounderProfile,
} from '../config/founders';
import {
  LOCAL_WAITLIST_ENTRIES_KEY,
  WaitlistDbRow,
} from './waitlist';

const ADMIN_DEMO_SESSION_KEY = 'da_admin_demo_session_v1';
const FOUNDERS_STORAGE_KEY = 'da_founders_custom_v1';
const FOUNDERS_CLEARED_KEY = 'da_founders_cleared_v1';
const FOUNDER_STORY_STORAGE_KEY = 'da_founder_story_custom_v1';

export const ALLOWED_ADMIN_EMAILS = [
  'bexobuilder@gmail.com',
  'rohit007jsr@gmail.com',
];

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export interface FounderStoryConfig {
  headline: string;
  lead: string;
  body: string;
  ctaLabel: string;
}

/**
 * Checks if an authorized admin is currently authenticated via Supabase Auth (or preview session).
 */
export async function getAdminSessionEmail(): Promise<string | null> {
  if (!isSupabaseConfigured) {
    try {
      const saved = sessionStorage.getItem(ADMIN_DEMO_SESSION_KEY);
      return isAllowedAdminEmail(saved) ? saved : null;
    } catch {
      return null;
    }
  }

  try {
    const { data } = await supabase.auth.getSession();
    const sessionEmail = data.session?.user?.email?.trim().toLowerCase() || null;
    if (sessionEmail && isAllowedAdminEmail(sessionEmail)) {
      return sessionEmail;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sends a 6-digit OTP ONLY if the email belongs to an authorized admin.
 */
export async function sendAdminLoginOtp(email: string): Promise<{
  success: boolean;
  error?: string;
  demoMode?: boolean;
}> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { success: false, error: 'Please enter a valid admin email address.' };
  }

  if (!isAllowedAdminEmail(normalized)) {
    return {
      success: false,
      error:
        'Access denied. Only authorized admin emails (bexobuilder@gmail.com or rohit007jsr@gmail.com) are permitted.',
    };
  }

  if (!isSupabaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, demoMode: true };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to send verification code.',
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Network error while sending verification code.',
    };
  }
}

/**
 * Verifies the admin's 6-digit OTP and ensures the email is in ALLOWED_ADMIN_EMAILS.
 */
export async function verifyAdminLoginOtp(
  email: string,
  token: string
): Promise<{
  success: boolean;
  adminEmail?: string;
  error?: string;
}> {
  const normalized = email.trim().toLowerCase();
  const cleanToken = token.trim();

  if (!isAllowedAdminEmail(normalized)) {
    return {
      success: false,
      error: 'Unauthorized admin email address.',
    };
  }

  if (!/^\d{6}$/.test(cleanToken)) {
    return { success: false, error: 'Please enter a valid 6-digit code.' };
  }

  if (!isSupabaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (cleanToken === '000000') {
      return { success: false, error: 'Invalid verification code.' };
    }
    try {
      sessionStorage.setItem(ADMIN_DEMO_SESSION_KEY, normalized);
    } catch {
      // Ignore
    }
    return { success: true, adminEmail: normalized };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalized,
      token: cleanToken,
      type: 'email',
    });

    if (error || !data.session?.user) {
      return {
        success: false,
        error:
          error?.message ||
          'Invalid or expired 6-digit code. Please request a new code.',
      };
    }

    const verifiedEmail = (data.session.user.email || normalized).toLowerCase();
    if (!isAllowedAdminEmail(verifiedEmail)) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Unauthorized admin account.',
      };
    }

    return {
      success: true,
      adminEmail: verifiedEmail,
    };
  } catch {
    return {
      success: false,
      error: 'Network error while verifying code.',
    };
  }
}

export async function signOutAdmin(): Promise<void> {
  try {
    sessionStorage.removeItem(ADMIN_DEMO_SESSION_KEY);
  } catch {
    // Ignore
  }
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

/**
 * Fetches all waitlist users ordered by newest first.
 */
export async function fetchAllWaitlistUsers(): Promise<{
  rows: WaitlistDbRow[];
  error?: string;
}> {
  const getLocalRows = (): WaitlistDbRow[] => {
    try {
      const raw = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
      return raw ? (JSON.parse(raw) as WaitlistDbRow[]) : [];
    } catch {
      return [];
    }
  };

  if (!isSupabaseConfigured) {
    return { rows: getLocalRows() };
  }

  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        rows: getLocalRows(),
        error: error.message,
      };
    }

    return { rows: (data as WaitlistDbRow[]) || [] };
  } catch {
    return {
      rows: getLocalRows(),
      error: 'Could not load waitlist records from Supabase.',
    };
  }
}

/**
 * Updates a waitlist applicant's status ('pending' | 'approved' | 'rejected' | 'contacted').
 */
export async function updateWaitlistStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected' | 'contacted'
): Promise<{ success: boolean; error?: string }> {
  // Update local fallback if present
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
    if (raw) {
      const list = JSON.parse(raw) as WaitlistDbRow[];
      const updated = list.map((r) => (r.id === id ? { ...r, status } : r));
      localStorage.setItem(LOCAL_WAITLIST_ENTRIES_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('waitlist')
      .update({ status })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update status.' };
  }
}

export interface StatusEmailParams {
  email: string;
  firstName: string;
  lastName?: string;
  action: 'approved' | 'rejected';
  customMessage?: string;
  subject?: string;
}

/**
 * Sends a custom status update email (Approved or Rejected) in Bangla via Nodemailer.
 */
export async function sendWaitlistStatusEmail(params: StatusEmailParams): Promise<{
  success: boolean;
  simulated?: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName || '',
        action: params.action,
        customMessage: params.customMessage || '',
        subject: params.subject,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে।',
      };
    }

    return {
      success: true,
      simulated: !!data.simulated,
      message: data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'নেটওয়ার্কের কারণে ইমেইল পাঠানো যায়নি।',
    };
  }
}

/**
 * Deletes a single waitlist user entry.
 */
export async function deleteWaitlistEntry(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_ENTRIES_KEY);
    if (raw) {
      const list = JSON.parse(raw) as WaitlistDbRow[];
      localStorage.setItem(
        LOCAL_WAITLIST_ENTRIES_KEY,
        JSON.stringify(list.filter((r) => r.id !== id))
      );
    }
  } catch {
    // Ignore
  }

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('waitlist').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete waitlist record.' };
  }
}

// ============================================================================
// FOUNDERS CONTROL CENTER MANAGEMENT
// ============================================================================

interface SupabaseFounderRow {
  id: string;
  name: string;
  role: string;
  specialty: string;
  short_bio: string;
  photo_url: string;
  alt: string;
  rotation_class: string;
  backdrop_color: string;
  sort_order: number;
  created_at?: string;
}

function mapRowToFounderProfile(row: SupabaseFounderRow): FounderProfile {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    specialty: row.specialty || 'E-Commerce Operations',
    shortBio: row.short_bio || '',
    photo: row.photo_url,
    alt: row.alt || `Portrait of ${row.name}`,
    rotationClass: row.rotation_class || '-rotate-3 md:-rotate-4',
    backdropColor: row.backdrop_color || '#ff7722',
    chipBg: '#171412',
    chipText: '#fbf9ef',
    isPlaceholder: false,
  };
}

export function loadLocalFounders(): FounderProfile[] {
  try {
    const isCleared = localStorage.getItem(FOUNDERS_CLEARED_KEY) === 'true';
    if (isCleared) return [];
    const raw = localStorage.getItem(FOUNDERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as FounderProfile[];
    }
  } catch {
    // Ignore
  }
  return DEFAULT_FOUNDERS;
}

function saveLocalFounders(founders: FounderProfile[], explicitlyCleared = false): void {
  try {
    if (explicitlyCleared) {
      localStorage.setItem(FOUNDERS_CLEARED_KEY, 'true');
      localStorage.setItem(FOUNDERS_STORAGE_KEY, JSON.stringify([]));
    } else {
      localStorage.removeItem(FOUNDERS_CLEARED_KEY);
      localStorage.setItem(FOUNDERS_STORAGE_KEY, JSON.stringify(founders));
    }
    window.dispatchEvent(new Event('founders-updated'));
  } catch {
    // Ignore
  }
}

/**
 * Fetches founders from Supabase `public.founders` table if available,
 * falling back to local custom founders or default founders.
 */
export async function fetchFoundersList(): Promise<FounderProfile[]> {
  if (!isSupabaseConfigured) {
    return loadLocalFounders();
  }

  try {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      return loadLocalFounders();
    }

    if (data && data.length > 0) {
      const mapped = (data as SupabaseFounderRow[]).map(mapRowToFounderProfile);
      saveLocalFounders(mapped, false);
      return mapped;
    }

    // If Supabase table is empty, seed it with DEFAULT_FOUNDERS so all devices share them
    try {
      const seedPayloads = DEFAULT_FOUNDERS.map((f, index) => ({
        name: f.name,
        role: f.role,
        specialty: f.specialty,
        short_bio: f.shortBio,
        photo_url: f.photo,
        alt: f.alt,
        rotation_class: f.rotationClass,
        backdrop_color: f.backdropColor,
        sort_order: index + 1,
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('founders')
        .insert(seedPayloads)
        .select('*');

      if (!insertError && insertedData && insertedData.length > 0) {
        const mapped = (insertedData as SupabaseFounderRow[]).map(
          mapRowToFounderProfile
        );
        saveLocalFounders(mapped, false);
        return mapped;
      }
    } catch {
      // Ignore seeding error
    }

    const isCleared = localStorage.getItem(FOUNDERS_CLEARED_KEY) === 'true';
    if (isCleared) {
      return [];
    }

    return loadLocalFounders();
  } catch {
    return loadLocalFounders();
  }
}

export interface NewFounderInput {
  name: string;
  role: string;
  specialty: string;
  shortBio: string;
  photo: string;
  backdropColor: string;
  rotationClass: string;
}

/**
 * Adds a new founder to Supabase `public.founders` and local state.
 */
export async function createFounder(
  input: NewFounderInput
): Promise<{ success: boolean; founder?: FounderProfile; error?: string }> {
  const current = loadLocalFounders();
  const newFounder: FounderProfile = {
    id: crypto.randomUUID ? crypto.randomUUID() : `founder-${Date.now()}`,
    name: input.name.trim(),
    role: input.role.trim(),
    specialty: input.specialty.trim() || 'E-Commerce Strategy',
    shortBio: input.shortBio.trim(),
    photo: input.photo,
    alt: `Portrait of ${input.name.trim()}, ${input.role.trim()} at Dropshipping Academy`,
    rotationClass: input.rotationClass || '-rotate-3 md:-rotate-4',
    backdropColor: input.backdropColor || '#ff7722',
    chipBg: '#171412',
    chipText: '#fbf9ef',
    isPlaceholder: false,
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('founders')
        .insert({
          name: newFounder.name,
          role: newFounder.role,
          specialty: newFounder.specialty,
          short_bio: newFounder.shortBio,
          photo_url: newFounder.photo,
          alt: newFounder.alt,
          rotation_class: newFounder.rotationClass,
          backdrop_color: newFounder.backdropColor,
          sort_order: current.length + 1,
        })
        .select('*')
        .single();

      if (!error && data) {
        const created = mapRowToFounderProfile(data as SupabaseFounderRow);
        const updatedList = [...current, created];
        saveLocalFounders(updatedList, false);
        return { success: true, founder: created };
      }
    } catch {
      // Fall through to local persistence if SQL table not yet run
    }
  }

  const updatedList = [...current, newFounder];
  saveLocalFounders(updatedList, false);
  return { success: true, founder: newFounder };
}

/**
 * Updates an existing founder's details and/or profile photo.
 */
export async function updateExistingFounder(
  id: string,
  input: NewFounderInput
): Promise<{ success: boolean; error?: string }> {
  const current = loadLocalFounders();
  const updatedList = current.map((f) =>
    f.id === id
      ? {
          ...f,
          name: input.name.trim(),
          role: input.role.trim(),
          specialty: input.specialty.trim(),
          shortBio: input.shortBio.trim(),
          photo: input.photo,
          alt: `Portrait of ${input.name.trim()}, ${input.role.trim()}`,
          backdropColor: input.backdropColor,
          rotationClass: input.rotationClass,
          isPlaceholder: false,
        }
      : f
  );

  saveLocalFounders(updatedList, false);

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('founders')
        .update({
          name: input.name.trim(),
          role: input.role.trim(),
          specialty: input.specialty.trim(),
          short_bio: input.shortBio.trim(),
          photo_url: input.photo,
          alt: `Portrait of ${input.name.trim()}, ${input.role.trim()}`,
          backdrop_color: input.backdropColor,
          rotation_class: input.rotationClass,
        })
        .eq('id', id);
    } catch {
      // Ignore if table not yet created
    }
  }

  return { success: true };
}

/**
 * Deletes a single founder by ID.
 */
export async function removeFounderById(id: string): Promise<{ success: boolean }> {
  const current = loadLocalFounders();
  const remaining = current.filter((f) => f.id !== id);
  saveLocalFounders(remaining, remaining.length === 0);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('founders').delete().eq('id', id);
    } catch {
      // Ignore
    }
  }

  return { success: true };
}

/**
 * Deletes ALL founders so the list is completely empty.
 */
export async function removeAllFounders(): Promise<{ success: boolean }> {
  saveLocalFounders([], true);

  if (isSupabaseConfigured) {
    try {
      // Delete all rows where id is not null
      await supabase
        .from('founders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      // Ignore
    }
  }

  return { success: true };
}

/**
 * Restores the 2 default founders.
 */
export async function restoreDefaultFoundersList(): Promise<FounderProfile[]> {
  saveLocalFounders(DEFAULT_FOUNDERS, false);

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('founders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      const seedPayloads = DEFAULT_FOUNDERS.map((f, index) => ({
        name: f.name,
        role: f.role,
        specialty: f.specialty,
        short_bio: f.shortBio,
        photo_url: f.photo,
        alt: f.alt,
        rotation_class: f.rotationClass,
        backdrop_color: f.backdropColor,
        sort_order: index + 1,
      }));

      await supabase.from('founders').insert(seedPayloads);
    } catch {
      // Ignore
    }
  }

  return DEFAULT_FOUNDERS;
}

/**
 * Loads & saves the Founder Story section text (headline, lead, body, ctaLabel).
 */
export function loadFounderStoryConfig(): FounderStoryConfig {
  try {
    const raw = localStorage.getItem(FOUNDER_STORY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as FounderStoryConfig;
    }
  } catch {
    // Ignore
  }
  return DEFAULT_FOUNDER_STORY;
}

export function saveFounderStoryConfig(story: FounderStoryConfig): void {
  try {
    localStorage.setItem(FOUNDER_STORY_STORAGE_KEY, JSON.stringify(story));
    window.dispatchEvent(new Event('founders-updated'));
  } catch {
    // Ignore
  }
}

// ============================================================================
// GENERAL SITE CONTENT SYNCHRONIZATION (Tools, Bento Results, Curriculum, Testimonials, FAQs)
// ============================================================================
export async function fetchSiteSectionContent<T>(
  sectionKey: string,
  fallbackDefault: T
): Promise<T> {
  const localKey = `da_site_content_${sectionKey}_v1`;
  try {
    const rawLocal = localStorage.getItem(localKey);
    if (rawLocal) {
      return JSON.parse(rawLocal) as T;
    }
  } catch {
    // Ignore
  }

  if (!isSupabaseConfigured) {
    return fallbackDefault;
  }

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('content_json')
      .eq('section_key', sectionKey)
      .single();

    if (!error && data && data.content_json) {
      const parsed = data.content_json as T;
      try {
        localStorage.setItem(localKey, JSON.stringify(parsed));
      } catch {
        // Ignore
      }
      return parsed;
    }
  } catch {
    // Ignore
  }

  return fallbackDefault;
}

export async function saveSiteSectionContent<T>(
  sectionKey: string,
  content: T
): Promise<{ success: boolean; error?: string }> {
  const localKey = `da_site_content_${sectionKey}_v1`;
  try {
    localStorage.setItem(localKey, JSON.stringify(content));
    window.dispatchEvent(new Event(`site-content-updated-${sectionKey}`));
  } catch {
    // Ignore
  }

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('site_content').upsert(
      {
        section_key: sectionKey,
        content_json: content as any,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section_key' }
    );

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save site content.' };
  }
}

/**
 * Compresses an uploaded image file via HTML5 Canvas into an optimized portrait JPEG Data URL.
 */
export function compressImageFileToDataUrl(
  file: File,
  maxWidth = 640,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file format.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
