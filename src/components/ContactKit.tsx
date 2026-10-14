import { useEffect, useState, FormEvent } from "react";
import "./contact.css";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

/* Contact kit: stored contact info + contact popup + admin form.
   Public site:  const info = useContact();  <ContactModal open={open} onClose={...} info={info} />
   Admin panel:  <AdminContactForm />  (put it inside your EXISTING logged-in admin page) */

export type ContactInfo = { email: string; phone: string; whatsapp: string; facebook: string; youtube: string; tiktok: string; hours: string };
export const DEFAULT_CONTACT: ContactInfo = {
  email: "rohit007jsr@gmail.com", phone: "", whatsapp: "", facebook: "", youtube: "", tiktok: "", hours: "২৪/৭ সাপোর্ট",
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
    return () => window.removeEventListener("contact-info-updated", handler);
  }, []);
  return info;
}

const digits = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/\D/g, "");
const url = (s: string) => (/^https?:\/\//i.test(s) ? s : "https://" + s);

export function ContactModal({ open, onClose, info }: { open: boolean; onClose: () => void; info: ContactInfo }) {
  const [name, setName] = useState(""); const [msg, setMsg] = useState("");
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
  ["email", "ইমেইল"], ["whatsapp", "WhatsApp নম্বর (দেশ কোড সহ, যেমন 8801XXXXXXXXX)"], ["phone", "ফোন নম্বর"],
  ["facebook", "Facebook লিংক"], ["youtube", "YouTube লিংক"], ["tiktok", "TikTok লিংক"], ["hours", "সাপোর্টের সময়"],
];
export function AdminContactForm() {
  const [v, setV] = useState<ContactInfo>(DEFAULT_CONTACT); const [status, setStatus] = useState("");
  useEffect(() => { loadContact().then(setV); }, []);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    const where = await saveContact(v);
    setStatus(where === "server" ? "সেভ হয়েছে" : "শুধু এই ব্রাউজারে সেভ হয়েছে (ব্যাকএন্ড সংযুক্ত নেই)");
  };
  return (
    <form onSubmit={save}>
      <h3>যোগাযোগের তথ্য</h3>
      {LABELS.map(([k, label]) => (
        <label className="ck-field" key={k}>{label}
          <input value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} type={k === "email" ? "email" : "text"} />
        </label>
      ))}
      <button className="ck-btn" type="submit">সেভ করুন</button>
      {status && <p className="ck-ok">{status}</p>}
    </form>
  );
}
