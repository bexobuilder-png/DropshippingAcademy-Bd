import "../styles/home.css";
import { STEP_ART } from "../data/stepArt";
import { RunningCourseCard } from "./RunningCourseCard";

type Lang = "bn" | "en";
const N = (s: string, lang: Lang) => (lang === "bn" ? s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : s);

const TXT = {
  bn: {
    pathT: "৩ ধাপে আপনার অনলাইন ব্যবসা",
    steps: [
      { t: "শিখুন", d: "পণ্য রিসার্চ, সাপ্লায়ার খোঁজা ও যাচাই এবং লাভের হিসাব শিখুন।" },
      { t: "তৈরি করুন", d: "ফেসবুক পেজ ও ই-স্টোর সাজান, প্রোডাক্ট যোগ করুন এবং মার্কেটিং শিখুন।" },
      { t: "বিক্রি করুন", d: "অর্ডার নিন, সাপ্লায়ারের মাধ্যমে ডেলিভারি দিন এবং লাভ-ক্ষতির হিসাব রাখুন।" },
    ],
    fmtT: "ক্লাস ও সহায়তা",
    fmt: [
      { t: "লাইভ ক্লাস", d: "প্রফেশনাল ট্রেইনার অনলাইনে সরাসরি শেখাবেন।" },
      { t: "২৪/৭ হেল্পডেস্ক", d: "আটকে গেলে যেকোনো সময় সাহায্য চাইতে পারবেন।" },
      { t: "কোর্স শেষে সার্টিফিকেট", d: "কোর্স সম্পন্ন করলে সার্টিফিকেট পাবেন।" },
    ],
    toolsT: "যে টুলগুলো ব্যবহার শিখবেন",
    tools: [
      { g: "স্টোর বানাতে", i: ["Shopify", "WooCommerce"] },
      { g: "পণ্য আনতে", i: ["AliExpress", "CJ Dropshipping"] },
      { g: "বিজ্ঞাপন দিতে", i: ["Meta Ads", "TikTok Ads"] },
    ],
    fitT: "কাদের জন্য এই কোর্স?",
    fit: ["১৮ বছর বা তার বেশি বয়স", "ড্রপশিপিং বা ই-কমার্সে একদম নতুন", "পড়াশোনা বা চাকরির পাশাপাশি শিখতে চান", "ঘরে বসে অনলাইনে ব্যবসা শুরু করতে চান"],
    noteT: "একটি সৎ কথা",
    noteD: "ব্যবসা থেকে আয়ের কোনো নিশ্চয়তা দেওয়া হয় না। ফল নির্ভর করে আপনার শেখা, অনুশীলন ও সময়ের ওপর।",
    faqT: "সাধারণ প্রশ্ন",
    faq: [
      { q: "কোর্সে ভর্তির বয়স কত?", a: "বয়স ন্যূনতম ১৮ বছর হতে হবে।" },
      { q: "ক্লাস কীভাবে হবে?", a: "লাইভ অনলাইন ক্লাসে প্রফেশনাল ট্রেইনার সরাসরি শেখাবেন।" },
      { q: "সমস্যায় পড়লে কোথায় সাহায্য পাব?", a: "২৪/৭ হেল্পডেস্ক আপনার পাশে থাকবে।" },
      { q: "ওয়েটলিস্টে যুক্ত হলে কী হবে?", a: "ইমেইলে আসা কোড দিয়ে আসন নিশ্চিত করবেন। ব্যাচ শুরুর খবর আমরা আপনাকে জানাবো।" },
    ],
    bandT: "আপনার আসন নিশ্চিত করুন",
    register: "রেজিস্ট্রেশন করুন",
  },
  en: {
    pathT: "Your online business in 3 steps",
    steps: [
      { t: "Learn", d: "Learn product research, finding and verifying suppliers, and working out your profit." },
      { t: "Build", d: "Set up your Facebook page and e-store, add products and learn marketing." },
      { t: "Sell", d: "Take orders, deliver through your supplier and keep your profit and loss accounts." },
    ],
    fmtT: "Classes and support",
    fmt: [
      { t: "Live classes", d: "A professional trainer teaches you live, online." },
      { t: "24/7 helpdesk", d: "Ask for help any time you get stuck." },
      { t: "Certificate at the end", d: "Complete the course and receive a certificate." },
    ],
    toolsT: "Tools you will learn to use",
    tools: [
      { g: "To build a store", i: ["Shopify", "WooCommerce"] },
      { g: "To source products", i: ["AliExpress", "CJ Dropshipping"] },
      { g: "To run ads", i: ["Meta Ads", "TikTok Ads"] },
    ],
    fitT: "Who is this course for?",
    fit: ["You are 18 or older", "You are new to dropshipping or e-commerce", "You want to learn alongside study or a job", "You want to start an online business from home"],
    noteT: "One honest note",
    noteD: "No income is guaranteed. Results depend on how much you learn, practise and the time you put in.",
    faqT: "Common questions",
    faq: [
      { q: "What is the minimum age?", a: "You must be at least 18 years old." },
      { q: "How are the classes held?", a: "Live online classes taught directly by a professional trainer." },
      { q: "Where do I get help?", a: "The 24/7 helpdesk is there for you." },
      { q: "What happens after I join the waitlist?", a: "You confirm your seat with the code we email you. We tell you when the batch starts." },
    ],
    bandT: "Secure your seat",
    register: "Register",
  },
};

const ICONS = [
  <svg key="a" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M10 8l5 3-5 3zM8 20h8M12 16v4" /></svg>,
  <svg key="b" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /></svg>,
  <svg key="c" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><circle cx="12" cy="10" r="2.5" /><path d="M9 20l3-3 3 3" /></svg>,
];

interface Props { lang?: Lang; onRegister: () => void }

export default function HomeSections({ lang = "bn", onRegister }: Props) {
  const T = TXT[lang];
  return (
    <div className="hm">
      <div className="hm-wrap">
        <section className="hm-block" id="path">
          <h2>{T.pathT}</h2>
          <div className="mb-6">
            <RunningCourseCard variant="featured" onLearnMore={onRegister} />
          </div>
          <ol className="hm-steps">
            {T.steps.map((s, i) => (
              <li className="hm-st" key={i}>
                <div className="hm-st-art" dangerouslySetInnerHTML={{ __html: STEP_ART[i] }} />
                <h3><em>{N(String(i + 1), lang)}</em><span>{s.t}</span></h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="hm-block" id="fmt">
          <h2>{T.fmtT}</h2>
          <div className="hm-fmt">
            {T.fmt.map((f, i) => (
              <div className="hm-fmt-card" key={i}><span className="hm-fi">{ICONS[i]}</span><h3>{f.t}</h3><p>{f.d}</p></div>
            ))}
          </div>
        </section>

        <section className="hm-block" id="tools">
          <h2>{T.toolsT}</h2>
          <div className="hm-tools">
            {T.tools.map((g, i) => (
              <div key={i}><small>{g.g}</small><p>{g.i.map((x) => <span className="hm-tool" key={x}>{x}</span>)}</p></div>
            ))}
          </div>
        </section>

        <section className="hm-block" id="fit">
          <h2>{T.fitT}</h2>
          <div className="hm-fit">
            <ul className="hm-fit-list">{T.fit.map((x) => <li key={x}>{x}</li>)}</ul>
            <div className="hm-note"><h3>{T.noteT}</h3><p>{T.noteD}</p></div>
          </div>
        </section>

        <section className="hm-block" id="faq">
          <h2>{T.faqT}</h2>
          <div className="hm-faq">
            {T.faq.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </div>
        </section>

        <div className="hm-band">
          <h2>{T.bandT}</h2>
          <button className="hm-band-btn" type="button" onClick={onRegister}>
            <span>{T.register}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
