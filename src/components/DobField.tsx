import { useEffect, useRef, useState, ClipboardEvent, KeyboardEvent } from "react";
import "../styles/dob.css";

type Lang = "bn" | "en";
const MON = {
  bn: ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};
const TXT = {
  bn: { d: "দিন", m: "মাস", y: "বছর", age: (n: string) => `বয়স ${n} বছর`, bad: "সঠিক তারিখ দিন (যেমন: ১৫ / ০৮ / ২০০০)।", young: "বয়স ন্যূনতম ১৮ বছর হতে হবে।", cal: "ক্যালেন্ডার খুলুন" },
  en: { d: "Day", m: "Month", y: "Year", age: (n: string) => `Age ${n}`, bad: "Enter a valid date (for example 15 / 08 / 2000).", young: "You must be at least 18 years old.", cal: "Open calendar" },
};
const toEn = (s: string) => s.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString());
const toBn = (s: string) => s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const digits = (s: string) => toEn(s).replace(/\D/g, "");
const pad = (v: string) => (v.length === 1 ? "0" + v : v);

export function validateDob(value: string, lang: Lang = "bn"): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(toEn(value).trim());
  const T = TXT[lang];
  if (!m) return T.bad;
  const d = +m[1], mo = +m[2], y = +m[3], dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d || y < 1920 || dt > new Date()) return T.bad;
  const now = new Date();
  const age = now.getFullYear() - y - (now.getMonth() < mo - 1 || (now.getMonth() === mo - 1 && now.getDate() < d) ? 1 : 0);
  return age < 12 ? T.young : "";
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  lang?: Lang;
  error?: string;
  onValidity?: (error: string) => void;
  id?: string;
}

export function DobField({ value, onChange, lang = "bn", error = "", onValidity, id = "dob" }: Props) {
  const T = TXT[lang];
  const parts = value.split("/");
  const [d, setD] = useState(parts[0] || "");
  const [m, setM] = useState(parts[1] || "");
  const [y, setY] = useState(parts[2] || "");
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const pick = useRef<HTMLInputElement>(null);

  const commit = (nd: string, nm: string, ny: string) => {
    setD(nd); setM(nm); setY(ny);
    onChange(nd || nm || ny ? [pad(nd), pad(nm), ny].join("/") : "");
  };

  const full = d && m && y.length === 4;
  const err = full ? validateDob([pad(d), pad(m), y].join("/"), lang) : "";
  useEffect(() => { onValidity?.(full ? err : ""); /* eslint-disable-next-line */ }, [d, m, y, lang]);

  let age: number | null = null;
  if (full && err !== T.bad) {
    const now = new Date(), mo = +m, dd = +d, yy = +y;
    age = now.getFullYear() - yy - (now.getMonth() < mo - 1 || (now.getMonth() === mo - 1 && now.getDate() < dd) ? 1 : 0);
  }
  const fmt = (n: string | number) => (lang === "bn" ? toBn(String(n)) : String(n));
  const words: string[] = [];
  if (+d >= 1 && +d <= 31) words.push(fmt(+d));
  if (+m >= 1 && +m <= 12) words.push(MON[lang][+m - 1]);
  if (y) words.push(fmt(y));
  const live = words.join(" ") + (age !== null ? " · " + T.age(fmt(age)) : "");
  const ok = age !== null && age >= 12 && !err;

  const go = (i: number, end = false) => {
    const el = refs[i]?.current; if (!el) return;
    el.focus(); const n = end ? el.value.length : 0; try { el.setSelectionRange(n, n); } catch { /* ignore */ }
  };

  const onInput = (i: 0 | 1 | 2, raw: string) => {
    const max = i === 2 ? 4 : 2;
    let v = digits(raw).slice(0, max), adv = false;
    if (i === 0 && v.length === 1 && +v > 3) { v = "0" + v; adv = true; }
    if (i === 1 && v.length === 1 && +v > 1) { v = "0" + v; adv = true; }
    if (i === 0 && v.length === 2 && (+v < 1 || +v > 31)) v = v[0] === "0" ? "0" : "3";
    if (i === 1 && v.length === 2 && (+v < 1 || +v > 12)) v = v[0] === "0" ? "0" : "1";
    const next: [string, string, string] = [d, m, y]; next[i] = v;
    commit(next[0], next[1], next[2]);
    if (adv || (v.length === max && i < 2)) go(i + 1);
  };

  const onKey = (i: 0 | 1 | 2, e: KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget, cur = [d, m, y];
    if (e.key === "Backspace" && !cur[i] && i > 0) {
      e.preventDefault(); const next: [string, string, string] = [d, m, y]; next[i - 1] = cur[i - 1].slice(0, -1);
      commit(next[0], next[1], next[2]); go(i - 1, true);
    } else if (e.key === "ArrowLeft" && el.selectionStart === 0 && i > 0) { e.preventDefault(); go(i - 1, true); }
    else if (e.key === "ArrowRight" && el.selectionStart === el.value.length && i < 2) { e.preventDefault(); go(i + 1); }
    else if (["/", "-", ".", " "].includes(e.key) && i < 2) {
      e.preventDefault();
      if (cur[i]) { const next: [string, string, string] = [d, m, y]; next[i] = pad(cur[i]); commit(next[0], next[1], next[2]); go(i + 1); }
    }
  };

  const onBlur = (i: 0 | 1 | 2) => {
    if (i < 2 && [d, m][i].length === 1) { const next: [string, string, string] = [d, m, y]; next[i] = pad(next[i]); commit(next[0], next[1], next[2]); }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const txt = toEn(e.clipboardData.getData("text")).trim(); let r: RegExpExecArray | null;
    let out: [string, string, string] | null = null;
    if ((r = /^(\d{1,2})[/\-. ](\d{1,2})[/\-. ](\d{4})$/.exec(txt))) out = [r[1], r[2], r[3]];
    else if ((r = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/.exec(txt))) out = [r[3], r[2], r[1]];
    else if ((r = /^(\d{2})(\d{2})(\d{4})$/.exec(txt))) out = [r[1], r[2], r[3]];
    if (out) { e.preventDefault(); commit(pad(String(+out[0])), pad(String(+out[1])), out[2]); }
  };

  const openCalendar = () => {
    const el = pick.current; if (!el) return;
    const max = new Date(); max.setFullYear(max.getFullYear() - 12); el.max = max.toISOString().slice(0, 10);
    try { el.showPicker(); } catch { go(0); }
  };

  const shown = error || err;
  const seg = (i: 0 | 1 | 2, label: string, val: string, ph: string, ac: string, y?: boolean) => (
    <label className={`dbx-seg${y ? " dbx-seg-y" : ""}${val ? " filled" : ""}`}>
      <span className="dbx-label">{label}</span>
      <input ref={refs[i]} id={i === 0 ? `${id}-d` : undefined} value={val} placeholder={ph} inputMode="numeric" maxLength={i === 2 ? 4 : 2}
        autoComplete={ac} enterKeyHint="next" onChange={(e) => onInput(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
        onBlur={() => onBlur(i)} onFocus={(e) => e.currentTarget.select()} onPaste={onPaste}
        aria-invalid={!!shown} aria-describedby={`${id}-hint ${id}-err`} />
    </label>
  );

  return (
    <div>
      <div className={`dbx${shown ? " bad" : ok ? " good" : ""}`} role="group" aria-labelledby={`${id}-label`}>
        {seg(0, T.d, d, "DD", "bday-day")}
        {seg(1, T.m, m, "MM", "bday-month")}
        {seg(2, T.y, y, "YYYY", "bday-year", true)}
        <button type="button" className="dbx-cal" onClick={openCalendar} aria-label={T.cal}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
        </button>
        <input ref={pick} className="dbx-hidden" type="date" tabIndex={-1} aria-hidden="true"
          onChange={(e) => { const v = e.target.value; if (v) { const p = v.split("-"); commit(p[2], p[1], p[0]); } }} />
      </div>
      <div className="dbx-live" aria-live="polite">
        {live && (
          <span className={`dbx-pill${ok ? " ok" : ""}`}>
            {ok && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
            <span>{live}</span>
          </span>
        )}
      </div>
      <div className="dbx-err" id={`${id}-err`} role="alert">{shown}</div>
    </div>
  );
}
export default DobField;
