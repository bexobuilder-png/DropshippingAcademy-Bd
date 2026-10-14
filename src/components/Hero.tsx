import "../styles/hero.css";

type Lang = "bn" | "en";
const TXT = {
  bn: {
    batch: "লাইভ ব্যাচ ০১",
    h1a: "ড্রপশিপিং ও ই-কমার্স",
    h1b: "ব্যবসা শিখুন",
    lead: "ঘরে বসে অনলাইন ব্যবসা শুরু করুন। আমাদের প্রফেশনাল কোর্সের মাধ্যমে শিখুন ড্রপশিপিং, ই-কমার্স, মার্কেটিং এবং ডিজিটাল বিজনেসের সকল কৌশল।",
    register: "রেজিস্ট্রেশন করুন",
    how: "কোর্স কীভাবে চলে দেখুন",
    f1: "প্রফেশনাল ট্রেইনার", f2: "লাইভ ক্লাস", f3: "২৪/৭ সাপোর্ট",
  },
  en: {
    batch: "Live batch 01",
    h1a: "Dropshipping & E-commerce",
    h1b: "Learn the business",
    lead: "Start an online business from home. Our professional course teaches dropshipping, e-commerce, marketing and every skill of digital business.",
    register: "Register",
    how: "See how the course works",
    f1: "Professional trainer", f2: "Live classes", f3: "24/7 support",
  },
};

interface Props {
  lang?: Lang;
  onRegister: () => void;
  onScrollToSteps?: () => void;
  onOpenContact?: () => void;
}

export default function Hero({ lang = "bn", onRegister, onScrollToSteps, onOpenContact }: Props) {
  const T = TXT[lang];
  return (
    <section className="hero3">
      <div className="hx-wrap">
        <div className="h3-card">
          <div className="h3-text">
            <span className="hx-chip"><i /><span>{T.batch}</span></span>
            <h1><span>{T.h1a}</span><span>{T.h1b}</span></h1>
            <p className="hx-lead">{T.lead}</p>
            <div className="h3-btns">
              <button className="hx-btn" type="button" onClick={onRegister}>
                <span>{T.register}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              <button className="hx-circ" type="button" onClick={onScrollToSteps}>
                <i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg></i>
                <span>{T.how}</span>
              </button>
            </div>
          </div>
          <div className="h3-art">
            <div className="h3-stage-wrap">
              <img
                src="/student-3d-animated.svg"
                alt={lang === "bn" ? "ল্যাপটপে পড়াশোনা করা শিক্ষার্থী" : "Student studying on a laptop"}
                width="720"
                height="733"
                className="h3-student-img"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.triedFallback) {
                    img.dataset.triedFallback = "true";
                    img.src = "/academy-student-3d.webp";
                  }
                }}
              />
            </div>
          </div>
          <ul className="h3-trust">
            <li><span className="ti"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6z" /></svg></span><span>{T.f1}</span></li>
            <li><span className="ti"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg></span><span>{T.f2}</span></li>
            <li
              onClick={onOpenContact}
              className={onOpenContact ? "cursor-pointer hover:bg-[#ffc765]/20 transition-colors" : ""}
              role={onOpenContact ? "button" : undefined}
              tabIndex={onOpenContact ? 0 : undefined}
              onKeyDown={onOpenContact ? (e) => { if (e.key === "Enter" || e.key === " ") onOpenContact(); } : undefined}
            >
              <span className="ti"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /></svg></span><span>{T.f3}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
