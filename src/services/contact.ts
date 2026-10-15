import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  contact_info: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export const DEFAULT_CONTACT_ITEMS: ContactItem[] = [
  {
    id: 'contact-email-1',
    type: 'email',
    label: 'Official Email / অফিসিয়াল ইমেইল',
    value: 'rohit007jsr@gmail.com',
    visible: true,
    display_order: 1,
  },
  {
    id: 'contact-whatsapp-1',
    type: 'whatsapp',
    label: 'WhatsApp Chat / হোয়াটসঅ্যাপ সাপোর্ট',
    value: '+8801800000000',
    visible: true,
    display_order: 2,
  },
  {
    id: 'contact-phone-1',
    type: 'phone',
    label: 'Hotline & Direct Call / হটলাইন ও ফোন কল',
    value: '+8801800000000',
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

const LOCAL_STORAGE_KEY = 'da_contact_settings_v1';
const LOCAL_STORAGE_MESSAGES_KEY = 'da_contact_messages_v1';

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
    // Fallback to local storage or defaults
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

export async function saveContactSettings(items: ContactItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));

    if (isSupabaseConfigured) {
      // Upsert items
      for (const item of items) {
        const { error } = await supabase
          .from('contact_settings')
          .upsert({
            id: item.id,
            type: item.type,
            label: item.label,
            value: item.value,
            visible: item.visible,
            display_order: item.display_order,
            updated_at: new Date().toISOString(),
          });
        if (error) {
          console.error('Error upserting contact setting:', error);
        }
      }
    }

    window.dispatchEvent(new CustomEvent('contact-settings-updated', { detail: items }));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save contact settings' };
  }
}

export async function submitContactMessage(payload: {
  name: string;
  contact_info: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: payload.name.trim(),
    contact_info: payload.contact_info.trim(),
    message: payload.message.trim(),
    status: 'unread',
    created_at: new Date().toISOString(),
  };

  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    const list: ContactMessage[] = existing ? JSON.parse(existing) : [];
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify([newMessage, ...list]));
  } catch {
    // Ignore
  }

  try {
    if (isSupabaseConfigured) {
      await supabase.from('contact_messages').insert({
        id: newMessage.id,
        name: newMessage.name,
        contact_info: newMessage.contact_info,
        message: newMessage.message,
        status: newMessage.status,
      });
    }
  } catch {
    // Ignore network error for message save if offline
  }

  return { success: true };
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as ContactMessage[];
      }
    }
  } catch {
    // Fallback
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore
  }

  return [];
}

export async function updateMessageStatus(id: string, status: 'unread' | 'read' | 'replied'): Promise<void> {
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    if (existing) {
      const list: ContactMessage[] = JSON.parse(existing);
      const updated = list.map((m) => (m.id === id ? { ...m, status } : m));
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }

  try {
    if (isSupabaseConfigured) {
      await supabase.from('contact_messages').update({ status }).eq('id', id);
    }
  } catch {
    // Ignore
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    if (existing) {
      const list: ContactMessage[] = JSON.parse(existing);
      const updated = list.filter((m) => m.id !== id);
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }

  try {
    if (isSupabaseConfigured) {
      await supabase.from('contact_messages').delete().eq('id', id);
    }
  } catch {
    // Ignore
  }
}
