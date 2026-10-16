import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  OFFICIAL_WHATSAPP_NUMBER,
  OFFICIAL_WHATSAPP_DISPLAY,
  ADMIN_NOTIFICATION_EMAIL,
  buildWhatsAppLink,
} from '../config/siteContact';

export interface ContactItem {
  id: string;
  type: 'email' | 'phone' | 'whatsapp' | 'facebook' | 'telegram' | 'website' | 'address' | 'hours' | 'custom';
  label: string;
  value: string;
  visible: boolean;
  display_order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export const DEFAULT_CONTACT_ITEMS: ContactItem[] = [
  {
    id: 'contact-whatsapp-1',
    type: 'whatsapp',
    label: 'WhatsApp Support / হোয়াটসঅ্যাপ সাপোর্ট',
    value: OFFICIAL_WHATSAPP_DISPLAY,
    visible: true,
    display_order: 1,
  },
  {
    id: 'contact-phone-1',
    type: 'phone',
    label: 'Hotline & Direct Call / হটলাইন ও ফোন কল',
    value: OFFICIAL_WHATSAPP_DISPLAY,
    visible: true,
    display_order: 2,
  },
  {
    id: 'contact-email-1',
    type: 'email',
    label: 'Official Email / অফিসিয়াল ইমেইল',
    value: 'rohit007jsr@gmail.com',
    visible: true,
    display_order: 3,
  },
  {
    id: 'contact-facebook-1',
    type: 'facebook',
    label: 'Facebook Page / ফেসবুক পেজ',
    value: 'https://facebook.com/dropshippingacademybd',
    visible: true,
    display_order: 4,
  },
  {
    id: 'contact-telegram-1',
    type: 'telegram',
    label: 'Telegram Channel / টেলিগ্রাম চ্যানেল',
    value: 'https://t.me/dropshippingacademybd',
    visible: true,
    display_order: 5,
  },
  {
    id: 'contact-address-1',
    type: 'address',
    label: 'Office Address / অফিস ঠিকানা',
    value: 'Dhaka, Bangladesh · Gulshan-2 (Online & Live Lab)',
    visible: true,
    display_order: 6,
  },
  {
    id: 'contact-hours-1',
    type: 'hours',
    label: 'Office Hours / অফিস সময়',
    value: '10:00 AM - 10:00 PM (Daily)',
    visible: true,
    display_order: 7,
  },
];

const LOCAL_STORAGE_KEY = 'da_contact_settings_v2';
const LOCAL_STORAGE_MESSAGES_KEY = 'da_contact_messages_v2';
const RATE_LIMIT_KEY = 'da_contact_submission_rate_v1';

/**
 * Checks client-side rate limit: max 5 messages per 60 minutes.
 */
function checkClientRateLimit(): boolean {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    if (!raw) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, first: now }));
      return true;
    }
    const data = JSON.parse(raw);
    if (now - data.first > oneHour) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, first: now }));
      return true;
    }
    if (data.count >= 5) {
      return false;
    }
    data.count += 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    return true;
  } catch {
    return true;
  }
}

/**
 * Fetches contact channels/settings with Supabase persistence and localStorage fallback.
 */
export async function fetchContactSettings(): Promise<ContactItem[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as ContactItem[];
      }
    }
  } catch {
    // Ignore and fallback
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return DEFAULT_CONTACT_ITEMS;
}

/**
 * Saves contact settings to Supabase table and localStorage.
 */
export async function saveContactSettings(items: ContactItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));

    if (isSupabaseConfigured) {
      for (const item of items) {
        await supabase.from('contact_settings').upsert({
          id: item.id,
          type: item.type,
          label: item.label,
          value: item.value,
          visible: item.visible,
          display_order: item.display_order,
          updated_at: new Date().toISOString(),
        });
      }
    }

    window.dispatchEvent(new CustomEvent('contact-settings-updated', { detail: items }));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save contact settings' };
  }
}

/**
 * Submits a contact inquiry to public.messages with honeypot spam protection & rate limiting.
 * Returns the created message record and a WhatsApp redirect URL.
 */
export async function submitContactMessage(payload: {
  name: string;
  contact: string;
  message: string;
  honeypot?: string;
}): Promise<{
  success: boolean;
  error?: string;
  whatsAppUrl: string;
  messageId?: string;
}> {
  const { name, contact, message, honeypot } = payload;

  // Build WhatsApp URL using centralized number
  const waBody = `আসসালামু আলাইকুম, আমি ড্রপশিপিং একাডেমি বিডি ওয়েবসাইট থেকে যোগাযোগ করছি:\n\n👤 নাম: ${name.trim()}\n📞 যোগাযোগ: ${contact.trim()}\n💬 বার্তা: ${message.trim()}`;
  const whatsAppUrl = buildWhatsAppLink(waBody, OFFICIAL_WHATSAPP_NUMBER);

  // 1. Honeypot Bot Trap: If filled, silently treat as success without database storage
  if (honeypot && honeypot.trim().length > 0) {
    return { success: true, whatsAppUrl };
  }

  // 2. Client-side Rate Limit check (max 5 per hour)
  if (!checkClientRateLimit()) {
    return {
      success: false,
      error: 'আপনি এক ঘন্টায় একাধিক বার্তা পাঠিয়েছেন। সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।',
      whatsAppUrl,
    };
  }

  const cleanName = name.trim();
  const cleanContact = contact.trim();
  const cleanMessage = message.trim();

  if (!cleanName || !cleanContact || !cleanMessage) {
    return {
      success: false,
      error: 'দয়া করে নাম, মোবাইল/ইমেইল এবং বার্তা পূরণ করুন।',
      whatsAppUrl,
    };
  }

  const localMsgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newMsg: ContactMessage = {
    id: localMsgId,
    name: cleanName,
    contact: cleanContact,
    message: cleanMessage,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  // Local storage backup
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    const list: ContactMessage[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify([newMsg, ...list]));
  } catch {
    // Ignore
  }

  // 3. Save to Supabase public.messages table or via submit_contact_message RPC
  let savedId = localMsgId;
  if (isSupabaseConfigured) {
    try {
      // First try RPC with server-side rate-limiting
      const { data: rpcData, error: rpcError } = await supabase.rpc('submit_contact_message', {
        p_name: cleanName,
        p_contact: cleanContact,
        p_message: cleanMessage,
        p_honeypot: honeypot || null,
        p_client_id: cleanContact,
      });

      if (!rpcError && rpcData?.success) {
        if (rpcData.id) savedId = rpcData.id;
      } else {
        // Direct table insert fallback
        const { data: insertData, error: insertError } = await supabase
          .from('messages')
          .insert({
            name: cleanName,
            contact: cleanContact,
            message: cleanMessage,
            status: 'new',
          })
          .select('id')
          .single();

        if (!insertError && insertData?.id) {
          savedId = insertData.id;
        }
      }
    } catch {
      // Graceful offline fallback
    }
  }

  // 4. Send email notification copy to admin via /api/send-email (background call, doesn't block UI)
  try {
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_NOTIFICATION_EMAIL,
        firstName: cleanName,
        action: 'contact_message',
        customSubject: cleanContact,
        customMessage: cleanMessage,
      }),
    }).catch(() => {
      // Non-blocking
    });
  } catch {
    // Ignore network error on notification
  }

  return {
    success: true,
    whatsAppUrl,
    messageId: savedId,
  };
}

/**
 * Fetches all contact messages for the Admin Inbox.
 */
export async function fetchContactMessages(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data as ContactMessage[];
      }
    } catch {
      // Fallback
    }
  }

  // LocalStorage fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }

  return [];
}

/**
 * Updates a message status (new -> read -> replied).
 */
export async function updateMessageStatus(
  id: string,
  status: 'new' | 'read' | 'replied'
): Promise<{ success: boolean; error?: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    if (raw) {
      const list: ContactMessage[] = JSON.parse(raw);
      const updated = list.map((m) => (m.id === id ? { ...m, status } : m));
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('messages').update({ status }).eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  return { success: true };
}

/**
 * Deletes a message from the Inbox.
 */
export async function deleteContactMessage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    if (raw) {
      const list: ContactMessage[] = JSON.parse(raw);
      const updated = list.filter((m) => m.id !== id);
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  return { success: true };
}

/**
 * Helper to build a WhatsApp reply link for the sender's phone number.
 */
export function buildSenderWhatsAppReplyLink(senderContact: string, senderName: string): string | null {
  const digits = senderContact.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/\D/g, '');
  if (!digits || digits.length < 8) return null;

  let formatted = digits;
  if (formatted.startsWith('880')) {
    // already has 880
  } else if (formatted.startsWith('01') && formatted.length === 11) {
    formatted = '88' + formatted;
  } else if (formatted.startsWith('1') && formatted.length === 10) {
    formatted = '880' + formatted;
  }

  const replyText = `আসসালামু আলাইকুম ${senderName}, ড্রপশিপিং একাডেমি বিডি থেকে যোগাযোগ করছি। আপনার বার্তার প্রেক্ষিতে আমরা সহযোগিতা করতে প্রস্তুত।`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(replyText)}`;
}
