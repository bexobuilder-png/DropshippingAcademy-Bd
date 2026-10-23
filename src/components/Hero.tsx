import React from "react";
import "../styles/hero.css";

type Lang = "bn" | "en";

const HERO_CONTENT = {
  bn: {
    batch: "লাইভ ব্যাচ ০১",
    h1a: "ড্রপশিপিং ও ই-কমার্স",
    h1b: "ব্যবসা শিখুন",
    lead: "ঘরে বসে অনলাইন ব্যবসা শুরু করুন। আমাদের প্রফেশনাল কোর্সের মাধ্যমে শিখুন ড্রপশিপিং, ই-কমার্স, মার্কেটিং এবং ডিজিটাল বিজনেসের সকল কৌশল।",
    register: "রেজিস্ট্রেশন করুন",
    how: "কোর্স কীভাবে চলে দেখুন",
    f1: "প্রফেশনাল ট্রেইনার",
    f2: "লাইভ ক্লাস",
    f3: "২৪/৭ সাপোর্ট",
  },
  en: {
    batch: "Live Batch 01",
    h1a: "Dropshipping & E-commerce",
    h1b: "Learn the Business",
    lead: "Start an online business from home. Our professional course teaches dropshipping, e-commerce, marketing, and every skill of digital business.",
    register: "Register Now",
    how: "See How Course Works",
    f1: "Professional Trainer",
    f2: "Live Classes",
    f3: "24/7 Support",
  },
};

interface Props {
  lang?: Lang;
  onRegister: () => void;
  onScrollToSteps?: () => void;
  onOpenContact?: () => void;
}

export default function Hero({ lang = "bn", onRegister, onScrollToSteps, onOpenContact }: Props) {
  const t = HERO_CONTENT[lang] || HERO_CONTENT.bn;

  return (
    <section
      className="hero3"
      aria-label={lang === "bn" ? "ড্রপশিপিং একাডেমি হিরো সেকশন" : "Dropshipping Academy Hero Section"}
    >
      <div className="hx-wrap">
        <div className="h3-master-card">
          {/* Upper Section: Text strictly on Left, 3D Art strictly on Right */}
          <div className="h3-presentation">
            {/* Left Content Column */}
            <div className="h3-text-col">
              <span className="hx-chip">
                <i />
                <span>{t.batch}</span>
              </span>

              <h1>
                <span>{t.h1a}</span>
                <span>{t.h1b}</span>
              </h1>

              <p className="hx-lead">{t.lead}</p>
            </div>

            {/* Right Art Column: Signature 3D Student Illustration */}
            <div className="h3-art-col">
              <div className="h3-stage-wrap">
                <img
                  src="/student-3d-animated.svg"
                  alt={lang === "bn" ? "ল্যাপটপে পড়াশোনা করা শিক্ষার্থী" : "Student studying on a laptop"}
                  width="1024"
                  height="1024"
                  className="h3-student-img"
                  loading="eager"
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
          </div>

          {/* Lower Section: Action Buttons & Trust Badges */}
          <div className="h3-console">
            {/* Action Buttons Row */}
            <div className="h3-actions-row">
              {/* Primary Registration Button */}
              <button className="hx-btn" type="button" onClick={onRegister}>
                <span>{t.register}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>

              {/* Upgraded Professional Secondary Button: কোর্স কীভাবে চলে দেখুন */}
              <button className="h3-tour-btn" type="button" onClick={onScrollToSteps}>
                <span className="h3-tour-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span>{t.how}</span>
              </button>
            </div>

            {/* Institutional Trust Badges Row */}
            <ul className="h3-trust-row">
              <li>
                <span className="ti">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c0-4 3-6 7-6s7 2 7 6z" />
                  </svg>
                </span>
                <span>{t.f1}</span>
              </li>

              <li>
                <span className="ti">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M8 20h8M12 16v4" />
                  </svg>
                </span>
                <span>{t.f2}</span>
              </li>

              <li
                onClick={onOpenContact}
                className={onOpenContact ? "cursor-pointer hover:bg-[#ffc765]/30 transition-colors" : ""}
                role={onOpenContact ? "button" : undefined}
                tabIndex={onOpenContact ? 0 : undefined}
                onKeyDown={
                  onOpenContact
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") onOpenContact();
                      }
                    : undefined
                }
              >
                <span className="ti">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
                    <rect x="3" y="13" width="4" height="6" rx="1.5" />
                    <rect x="17" y="13" width="4" height="6" rx="1.5" />
                  </svg>
                </span>
                <span>{t.f3}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
