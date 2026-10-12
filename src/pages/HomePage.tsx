import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StudentIllustration } from '../components/StudentIllustration';
import type { AnimKind } from '../components/EduAnimation';

export interface HomePageProps {
  setAnim: React.Dispatch<React.SetStateAction<null | AnimKind>>;
  onRegisterClick?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setAnim,
  onRegisterClick,
}) => {
  const { t } = useLanguage();

  const triggerRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      setAnim('intro');
    }
  };

  const scrollToPath = () => {
    const el = document.getElementById('path');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main id="main-content" className="overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="hero3">
        <div className="wrap">
          <div className="h3-card">
            <div className="h3-text">
              <span className="chip">
                <i></i>
                <span>{t('লাইভ ব্যাচ ০১', 'Live batch 01')}</span>
              </span>
              <h1>
                <span>{t('ড্রপশিপিং ও ই-কমার্স', 'Dropshipping & E-commerce')}</span>
                <span>{t('ব্যবসা শিখুন', 'Learn the business')}</span>
              </h1>
              <p className="lead">
                {t(
                  'ঘরে বসে অনলাইন ব্যবসা শুরু করুন। আমাদের প্রফেশনাল কোর্সের মাধ্যমে শিখুন ড্রপশিপিং, ই-কমার্স, মার্কেটিং এবং ডিজিটাল বিজনেসের সকল কৌশল।',
                  'Start an online business from home. Our professional course teaches dropshipping, e-commerce, marketing and every skill of digital business.'
                )}
              </p>
              <div className="h3-btns">
                <button className="btn" type="button" onClick={triggerRegister}>
                  <span>{t('রেজিস্ট্রেশন করুন', 'Register Now')}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <button className="circ" type="button" onClick={scrollToPath}>
                  <i>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 5v14M6 13l6 6 6-6" />
                    </svg>
                  </i>
                  <span>{t('কোর্স কীভাবে চলে দেখুন', 'See how the course works')}</span>
                </button>
              </div>
            </div>
            <StudentIllustration />
            <ul className="h3-trust">
              <li>
                <span className="ti">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c0-4 3-6 7-6s7 2 7 6z" />
                  </svg>
                </span>
                <span>{t('প্রফেশনাল ট্রেইনার', 'Experienced Instructor')}</span>
              </li>
              <li>
                <span className="ti">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M8 20h8M12 16v4" />
                  </svg>
                </span>
                <span>{t('লাইভ ক্লাস', 'Live classes')}</span>
              </li>
              <li>
                <span className="ti">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
                    <rect x="3" y="13" width="4" height="6" rx="1.5" />
                    <rect x="17" y="13" width="4" height="6" rx="1.5" />
                  </svg>
                </span>
                <span>{t('২৪/৭ সাপোর্ট', '24/7 Support')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* 3 STEPS SECTION */}
        <section className="block" id="path">
          <h2>{t('৩ ধাপে আপনার অনলাইন ব্যবসা', 'Your online business in 3 steps')}</h2>
          <ol className="steps3">
            <li className="st">
              <div className="st-art">
                <svg viewBox="0 0 140 120" aria-hidden="true">
                  <defs>
                    <linearGradient id="s1a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF"/><stop offset="1" stopColor="#F1DDC6"/></linearGradient>
                    <linearGradient id="s1b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6A365"/><stop offset="1" stopColor="#E26B26"/></linearGradient>
                    <linearGradient id="s1c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFDF92"/><stop offset="1" stopColor="#EDB24A"/></linearGradient>
                  </defs>
                  <ellipse cx="70" cy="108" rx="52" ry="7" fill="#8F3F10" opacity=".18"/>
                  <path d="M70 100C54 90 28 90 12 98V36C28 28 54 28 70 38z" fill="url(#s1a)"/><path d="M70 100C86 90 112 90 128 98V36C112 28 86 28 70 38z" fill="#F4E4D0"/>
                  <path d="M70 38V100" stroke="#D9BE9E" strokeWidth="2"/><path d="M22 52c12-4 28-3 40 3M22 64c12-4 28-3 40 3M22 76c12-4 28-3 40 3M80 55c12-6 28-7 40-3M80 67c12-6 28-7 40-3" stroke="#D9BE9E" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                  <g transform="translate(108 18) rotate(32)"><rect x="-6" y="0" width="12" height="44" rx="3" fill="url(#s1b)"/><path d="M-6 44h12l-6 12z" fill="#FFF1D8"/><path d="M-2.5 51h5l-2.5 5z" fill="#2A1A11"/><rect x="-6" y="-10" width="12" height="10" rx="4" fill="#8F3F10"/></g>
                  <circle cx="30" cy="22" r="9" fill="url(#s1c)"/><path d="M30 17v10M25 22h10" stroke="#fff" strokeOpacity=".7" strokeWidth="2.4" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>
                <em>১</em>
                <span>{t('শিখুন', 'Learn')}</span>
              </h3>
              <p>{t('পণ্য রিসার্চ, সাপ্লায়ার খোঁজা ও যাচাই এবং লাভের হিসাব শিখুন।', 'Learn product research, finding and verifying suppliers, and working out your profit.')}</p>
            </li>

            <li className="st">
              <div className="st-art">
                <svg viewBox="0 0 140 120" aria-hidden="true">
                  <defs>
                    <linearGradient id="s2a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF"/><stop offset="1" stopColor="#F1DDC6"/></linearGradient>
                    <linearGradient id="s2b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6A365"/><stop offset="1" stopColor="#E26B26"/></linearGradient>
                    <linearGradient id="s2c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFDF92"/><stop offset="1" stopColor="#EDB24A"/></linearGradient>
                  </defs>
                  <ellipse cx="70" cy="108" rx="52" ry="7" fill="#8F3F10" opacity=".18"/>
                  <rect x="24" y="52" width="92" height="54" rx="6" fill="url(#s2a)"/><path d="M16 52l10-34h88l10 34z" fill="url(#s2b)"/>
                  <path d="M44 18l-4 34M70 18v34M96 18l4 34" stroke="#fff" strokeOpacity=".35" strokeWidth="3"/>
                  <rect x="58" y="68" width="24" height="38" rx="4" fill="#8F3F10"/><circle cx="77" cy="88" r="2" fill="#FFDF92"/>
                  <rect x="30" y="64" width="22" height="22" rx="4" fill="url(#s2c)"/><rect x="88" y="64" width="22" height="22" rx="4" fill="url(#s2c)"/>
                  <path d="M104 14l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#F6C974"/>
                </svg>
              </div>
              <h3>
                <em>২</em>
                <span>{t('তৈরি করুন', 'Build')}</span>
              </h3>
              <p>{t('ফেসবুক পেজ ও ই-স্টোর সাজান, প্রোডাক্ট যোগ করুন এবং মার্কেটিং শিখুন।', 'Set up your Facebook page and e-store, add products and learn marketing.')}</p>
            </li>

            <li className="st">
              <div className="st-art">
                <svg viewBox="0 0 140 120" aria-hidden="true">
                  <defs>
                    <linearGradient id="s3a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFDF92"/><stop offset="1" stopColor="#EDB24A"/></linearGradient>
                    <linearGradient id="s3b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6A365"/><stop offset="1" stopColor="#E26B26"/></linearGradient>
                    <radialGradient id="s3c" cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#FFE9AE"/><stop offset="1" stopColor="#F0B445"/></radialGradient>
                  </defs>
                  <ellipse cx="70" cy="108" rx="54" ry="7" fill="#8F3F10" opacity=".18"/>
                  <path d="M14 58l34-14 34 14v38l-34 14-34-14z" fill="url(#s3a)"/><path d="M14 58l34 14 34-14" fill="none" stroke="#C98A1E" strokeOpacity=".55" strokeWidth="2.4" strokeLinejoin="round"/><path d="M48 72v38" stroke="#C98A1E" strokeOpacity=".55" strokeWidth="2.4"/>
                  <path d="M30 51l34 14v14l-8-3.5V68L24 55z" fill="url(#s3b)"/>
                  <circle cx="98" cy="46" r="26" fill="url(#s3c)"/><circle cx="98" cy="46" r="26" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2"/><circle cx="98" cy="46" r="19" fill="none" stroke="#C98A1E" strokeOpacity=".6" strokeWidth="2" strokeDasharray="3 4"/>
                  <text x="98" y="56" textAnchor="middle" fontSize="28" fontWeight="800" fill="#8F3F10" fontFamily="'Anek Bangla','Hind Siliguri',system-ui,sans-serif">৳</text>
                  <path d="M120 94l-4 8 8-3z" fill="none"/>
                </svg>
              </div>
              <h3>
                <em>৩</em>
                <span>{t('বিক্রি করুন', 'Sell')}</span>
              </h3>
              <p>{t('অর্ডার নিন, সাপ্লায়ারের মাধ্যমে ডেলিভারি দিন এবং লাভ-ক্ষতির হিসাব রাখুন।', 'Take orders, deliver through your supplier and keep your profit and loss accounts.')}</p>
            </li>
          </ol>
        </section>

        {/* CLASS & SUPPORT */}
        <section className="block" id="fmt">
          <h2>{t('ক্লাস ও সহায়তা', 'Classes and support')}</h2>
          <div className="fmt">
            <div className="fmt-card">
              <span className="fi">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M10 8l5 3-5 3zM8 20h8M12 16v4" />
                </svg>
              </span>
              <h3>{t('লাইভ ক্লাস', 'Live classes')}</h3>
              <p>{t('প্রফেশনাল ট্রেইনার অনলাইনে সরাসরি শেখাবেন।', 'A professional trainer teaches you live, online.')}</p>
            </div>
            <div className="fmt-card">
              <span className="fi">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
                  <rect x="3" y="13" width="4" height="6" rx="1.5" />
                  <rect x="17" y="13" width="4" height="6" rx="1.5" />
                </svg>
              </span>
              <h3>{t('২৪/৭ হেল্পডেস্ক', '24/7 helpdesk')}</h3>
              <p>{t('আটকে গেলে যেকোনো সময় সাহায্য চাইতে পারবেন।', 'Ask for help any time you get stuck.')}</p>
            </div>
            <div className="fmt-card">
              <span className="fi">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <circle cx="12" cy="10" r="2.5" />
                  <path d="M9 20l3-3 3 3" />
                </svg>
              </span>
              <h3>{t('কোর্স শেষে সার্টিফিকেট', 'Certificate at the end')}</h3>
              <p>{t('কোর্স সম্পন্ন করলে সার্টিফিকেট পাবেন।', 'Complete the course and receive a certificate.')}</p>
            </div>
          </div>
        </section>

        {/* TOOLS */}
        <section className="block" id="tools">
          <h2>{t('যে টুলগুলো ব্যবহার শিখবেন', 'Tools you will learn to use')}</h2>
          <div className="tools">
            <div>
              <small>{t('স্টোর বানাতে', 'To build a store')}</small>
              <p><span className="tool">Shopify</span><span className="tool">WooCommerce</span></p>
            </div>
            <div>
              <small>{t('পণ্য আনতে', 'To source products')}</small>
              <p><span className="tool">AliExpress</span><span className="tool">CJ Dropshipping</span></p>
            </div>
            <div>
              <small>{t('বিজ্ঞাপন দিতে', 'To run ads')}</small>
              <p><span className="tool">Meta Ads</span><span className="tool">TikTok Ads</span></p>
            </div>
          </div>
        </section>

        {/* WHO IS THIS COURSE FOR */}
        <section className="block" id="fit">
          <h2>{t('কাদের জন্য এই কোর্স?', 'Who is this course for?')}</h2>
          <div className="fit">
            <ul className="fit-list">
              <li>{t('১৮ বছর বা তার বেশি বয়স', 'You are 18 or older')}</li>
              <li>{t('ড্রপশিপিং বা ই-কমার্সে একদম নতুন', 'You are new to dropshipping or e-commerce')}</li>
              <li>{t('পড়াশোনা বা চাকরির পাশাপাশি শিখতে চান', 'You want to learn alongside study or a job')}</li>
              <li>{t('ঘরে বসে অনলাইনে ব্যবসা শুরু করতে চান', 'You want to start an online business from home')}</li>
            </ul>
            <div className="note">
              <h3>{t('একটি সৎ কথা', 'One honest note')}</h3>
              <p>{t('ব্যবসা থেকে আয়ের কোনো নিশ্চয়তা দেওয়া হয় না। ফল নির্ভর করে আপনার শেখা, অনুশীলন ও সময়ের ওপর।', 'No income is guaranteed. Results depend on how much you learn, practise and the time you put in.')}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="block" id="faq">
          <h2>{t('সাধারণ প্রশ্ন', 'Common questions')}</h2>
          <div className="faq">
            <details>
              <summary>{t('কোর্সে ভর্তির বয়স কত?', 'What is the minimum age?')}</summary>
              <p>{t('বয়স ন্যূনতম ১৮ বছর হতে হবে।', 'You must be at least 18 years old.')}</p>
            </details>
            <details>
              <summary>{t('ক্লাস কীভাবে হবে?', 'How are the classes held?')}</summary>
              <p>{t('লাইভ অনলাইন ক্লাসে প্রফেশনাল ট্রেইনার সরাসরি শেখাবেন।', 'Live online classes taught directly by a professional trainer.')}</p>
            </details>
            <details>
              <summary>{t('সমস্যায় পড়লে কোথায় সাহায্য পাব?', 'Where do I get help?')}</summary>
              <p>{t('২৪/৭ হেল্পডেস্ক আপনার পাশে থাকবে।', 'The 24/7 helpdesk is there for you.')}</p>
            </details>
            <details>
              <summary>{t('ওয়েটলিস্টে যুক্ত হলে কী হবে?', 'What happens after I join the waitlist?')}</summary>
              <p>{t('ইমেইলে আসা কোড দিয়ে আসন নিশ্চিত করবেন। ব্যাচ শুরুর খবর আমরা আপনাকে জানাবো।', 'You confirm your seat with the code we email you. We tell you when the batch starts.')}</p>
            </details>
          </div>
        </section>

        {/* FINAL CTA BAND */}
        <div className="cta-band">
          <h2>{t('আপনার আসন নিশ্চিত করুন', 'Secure your seat')}</h2>
          <button className="btn" type="button" onClick={triggerRegister}>
            <span>{t('রেজিস্ট্রেশন করুন', 'Register Now')}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <p className="foot">Dropshipping Academy BD</p>
      </div>
    </main>
  );
};
