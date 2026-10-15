import { useEffect, useState, FormEvent } from "react";
import "./contact.css";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export type CustomContactField = {
  id: string;
  label: string;
  value: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  hours: string;
  customFields?: CustomContactField[];
};

export const DEFAULT_CONTACT: ContactInfo = {
  email: "rohit007jsr@gmail.com",
  phone: "",
  whatsapp: "",
  facebook: "",
  youtube: "",
  tiktok: "",
  hours: "২৪/৭ সাপোর্ট",
  customFields: [
    { id: "1", label: "অফিস ঠিকানা", value: "ঢাকা, বাংলাদেশ" }
  ]
};

const KEY = "dab_contact_v1";
const API = "/api/contact"; // GET returns JSON, PUT saves JSON.

export async function loadContact(): Promise<ContactInfo> {
  // 1. Try Supabase database if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content_json')
        .eq('section_key', 'contact')
        .maybeSingle();
      if (!error && data?.content_json) {
        const merged = { ...DEFAULT_CONTACT, ...(data.content_json as any) };
        try { localStorage.setItem(KEY, JSON.stringify(merged)); } catch {}
        return merged;
      }
    } catch {}
  }
  // 2. Try backend API endpoint
  try {
    const r = await fetch(API);
    if (r.ok) {
      const data = await r.json();
      const merged = { ...DEFAULT_CONTACT, ...data };
      try { localStorage.setItem(KEY, JSON.stringify(merged)); } catch {}
      return merged;
    }
  } catch {}
  // 3. Fallback to localStorage
  try {
    const s = localStorage.getItem(KEY);
    if (s) return { ...DEFAULT_CONTACT, ...JSON.parse(s) };
  } catch {}
  return DEFAULT_CONTACT;
}

/** Returns "server" when your backend saved it, "browser" when only this browser has it. */
export async function saveContact(c: ContactInfo): Promise<"server" | "browser"> {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  window.dispatchEvent(new Event("contact-info-updated"));
  let savedToServer = false;
  // 1. Try Supabase database if configured (persists to PostgreSQL site_content table)
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('site_content').upsert(
        {
          section_key: 'contact',
          content_json: c as any,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section_key' }
      );
      if (!error) {
        savedToServer = true;
      }
    } catch {}
  }
  // 2. Try backend API PUT
  try {
    const r = await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c)
    });
    if (r.ok) {
      savedToServer = true;
    }
  } catch {}
  return savedToServer ? "server" : "browser";
}

export function useContact() {
  const [info, setInfo] = useState<ContactInfo>(DEFAULT_CONTACT);
  useEffect(() => {
    loadContact().then(setInfo);
    const handler = () => {
      loadContact().then(setInfo);
    };
    window.addEventListener("contact-info-updated", handler);
    window.addEventListener("storage", handler);

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('public:site_content:contact')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content', filter: 'section_key=eq.contact' }, (payload: any) => {
          if (payload.new?.content_json) {
            setInfo({ ...DEFAULT_CONTACT, ...payload.new.content_json });
          }
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener("contact-info-updated", handler);
      window.removeEventListener("storage", handler);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);
  return info;
}

const digits = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/\D/g, "");
const url = (s: string) => (/^https?:\/\//i.test(s) ? s : "https://" + s);

export function ContactModal({ open, onClose, info }: { open: boolean; onClose: () => void; info: ContactInfo }) {
  const [name, setName] = useState(""); 
  const [msg, setMsg] = useState("");
  if (!open) return null;
  const send = (e: FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${info.email}?subject=${encodeURIComponent("Dropshipping Academy BD - " + name)}&body=${encodeURIComponent(msg)}`;
  };
  return (
    <div className="ck-overlay" onClick={onClose}>
      <div className="ck-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="ck-head"><h3>যোগাযোগ করুন</h3><button className="ck-x" onClick={onClose} aria-label="Close">×</button></div>
        {info.hours && <p className="ck-sub">{info.hours}</p>}
        <div className="ck-list">
          {info.email && <a className="ck-btn" href={`mailto:${info.email}`}>✉ {info.email}</a>}
          {info.whatsapp && <a className="ck-btn alt" href={`https://wa.me/${digits(info.whatsapp)}`} target="_blank" rel="noreferrer">WhatsApp: {info.whatsapp}</a>}
          {info.phone && <a className="ck-btn alt" href={`tel:+${digits(info.phone)}`}>☎ {info.phone}</a>}
          {info.facebook && <a className="ck-btn alt" href={url(info.facebook)} target="_blank" rel="noreferrer">Facebook</a>}
          {info.youtube && <a className="ck-btn alt" href={url(info.youtube)} target="_blank" rel="noreferrer">YouTube</a>}
          {info.tiktok && <a className="ck-btn alt" href={url(info.tiktok)} target="_blank" rel="noreferrer">TikTok</a>}
          {info.customFields?.map(f => f.value ? (
            <div key={f.id} className="ck-btn alt bg-[#f2f0e7] text-left px-4 py-3 flex flex-col my-1 rounded-[14px]">
              <span className="text-[11px] uppercase tracking-wider font-bold opacity-75">{f.label}</span>
              <span className="text-[14px] font-semibold">{f.value}</span>
            </div>
          ) : null)}
        </div>
        <form onSubmit={send}>
          <label className="ck-field">আপনার নাম<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label className="ck-field">মেসেজ<textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} required /></label>
          <button className="ck-btn" type="submit">ইমেইল পাঠান →</button>
        </form>
      </div>
    </div>
  );
}

const LABELS: [keyof ContactInfo, string][] = [
  ["email", "ইমেইল (Email)"], 
  ["whatsapp", "WhatsApp নম্বর (দেশ কোড সহ, যেমন 8801XXXXXXXXX)"], 
  ["phone", "ফোন নম্বর"],
  ["facebook", "Facebook লিংক"], 
  ["youtube", "YouTube লিংক"], 
  ["tiktok", "TikTok লিংক"], 
  ["hours", "সাপোর্টের সময় / স্ট্যাটাস"],
];

export function AdminContactForm() {
  const [v, setV] = useState<ContactInfo>(DEFAULT_CONTACT); 
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    loadContact().then(setV); 
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const where = await saveContact(v);
    setLoading(false);
    setStatus(where === "server" ? "✓ সফলভাবে সেভ হয়েছে এবং রিয়েল-টাইমে আপডেট হয়েছে!" : "✓ সেভ হয়েছে (লোকাল ব্রাউজার)");
    setTimeout(() => setStatus(""), 4000);
  };

  const addCustomField = () => {
    const list = v.customFields || [];
    setV({
      ...v,
      customFields: [...list, { id: Date.now().toString(), label: "", value: "" }]
    });
  };

  const updateCustomField = (id: string, field: 'label' | 'value', val: string) => {
    const list = (v.customFields || []).map(f => f.id === id ? { ...f, [field]: val } : f);
    setV({ ...v, customFields: list });
  };

  const removeCustomField = (id: string) => {
    const list = (v.customFields || []).filter(f => f.id !== id);
    setV({ ...v, customFields: list });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-[#fbf9ef] rounded-[28px] border-2 border-[#171412] shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#171412]/15">
        <div>
          <h3 className="font-display text-[22px] font-extrabold text-[#171412]">যোগাযোগ ও সাপোর্ট তথ্য ব্যবস্থাপনা</h3>
          <p className="text-[14px] text-[#171412]/75">এখানে ইমেইল (rohit007jsr@gmail.com), ফোন, সোশ্যাল মিডিয়া এবং অন্যান্য তথ্য পরিবর্তন করতে পারেন। পরিবর্তন করলে সকল ব্যবহারকারীর কাছে রিয়েল-টাইমে আপডেট হয়ে যাবে।</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LABELS.map(([k, label]) => (
            <div key={k} className="bg-[#f2f0e7] p-5 rounded-[20px] border border-[#171412]/15 shadow-sm">
              <label className="block text-[13px] font-bold text-[#171412] mb-2">{label}</label>
              <input 
                value={(v as any)[k] || ""} 
                onChange={(e) => setV({ ...v, [k]: e.target.value })} 
                type={k === "email" ? "email" : "text"} 
                className="w-full bg-[#fbf9ef] border-2 border-[#171412]/20 focus:border-[#171412] rounded-[12px] px-4 py-2.5 text-[15px] font-semibold text-[#171412] outline-none transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Custom Info Boxes Section */}
        <div className="mt-8 bg-[#f2f0e7] p-6 rounded-[24px] border border-[#171412]/15">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-display text-[18px] font-extrabold text-[#171412]">অন্যান্য তথ্যাবলী যোগ করুন (Custom Info Boxes)</h4>
              <p className="text-[13px] text-[#171412]/75">অতিরিক্ত যেকোনো তথ্য বা চ্যানেল যোগ করতে পারেন (যেমন: ঠিকানা, টেলিগ্রাম, নোটিশ ইত্যাদি)।</p>
            </div>
            <button 
              type="button" 
              onClick={addCustomField}
              className="px-4 py-2 bg-[#171412] text-[#fbf9ef] rounded-[12px] text-[13px] font-bold hover:bg-[#813502] transition-colors cursor-pointer"
            >
              + নতুন ফিল্ড যোগ করুন
            </button>
          </div>

          <div className="space-y-4">
            {(v.customFields || []).map((f) => (
              <div key={f.id} className="flex flex-col sm:flex-row gap-3 items-center bg-[#fbf9ef] p-4 rounded-[16px] border border-[#171412]/20">
                <input 
                  placeholder="ফিল্ডের নাম (যেমন: ঠিকানা)" 
                  value={f.label} 
                  onChange={(e) => updateCustomField(f.id, 'label', e.target.value)}
                  className="flex-1 bg-white border border-[#171412]/20 rounded-[10px] px-3 py-2 text-[14px] font-semibold text-[#171412] outline-none"
                />
                <input 
                  placeholder="মান (যেমন: গুলশান, ঢাকা)" 
                  value={f.value} 
                  onChange={(e) => updateCustomField(f.id, 'value', e.target.value)}
                  className="flex-1 bg-white border border-[#171412]/20 rounded-[10px] px-3 py-2 text-[14px] font-semibold text-[#171412] outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => removeCustomField(f.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-[10px] text-[13px] font-bold hover:bg-red-200 transition-colors cursor-pointer"
                >
                  মুছুন
                </button>
              </div>
            ))}
            {(!v.customFields || v.customFields.length === 0) && (
              <p className="text-[13px] text-[#171412]/60 italic text-center py-4">কোনো অতিরিক্ত তথ্য যোগ করা হয়নি।</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3.5 bg-[#813502] text-[#fbf9ef] rounded-[16px] font-display text-[16px] font-extrabold hover:bg-[#682a01] transition-colors shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন (Save Changes)"}
          </button>
          {status && <p className="text-[14px] font-bold text-green-700 bg-green-50 px-4 py-2 rounded-[12px] border border-green-200">{status}</p>}
        </div>
      </form>
    </div>
  );
}
