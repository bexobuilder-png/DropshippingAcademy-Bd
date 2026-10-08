import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <main id="main-content" className="py-12 md:py-20">
      <div className="specimen-container max-w-3xl">
        <div className="text-[13px] font-bold text-[#813502] mb-3">
          {t(
            'তথ্য সুরক্ষা · কার্যকর: অক্টোবর ২০২৬',
            'Data Protection · Effective October 2026'
          )}
        </div>
        <h1 className="font-display text-[42px] sm:text-[64px] font-extrabold text-[#171412] leading-[0.95] tracking-[-0.03em] mb-8">
          {t('গোপনীয়তা নীতি', 'Privacy Policy')}
        </h1>

        <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-6 sm:p-10 flex flex-col gap-6 text-[16px] text-[#171412] leading-[1.5]">
          <section>
            <h2 className="specimen-h3 mb-2">
              {t('১. আমরা যেসব তথ্য সংগ্রহ করি', '1. Information We Collect')}
            </h2>
            <p>
              {t(
                'আপনি যখন ড্রপশিপিং একাডেমির ওয়েটলিস্টে নিবন্ধন করেন, তখন আমরা আপনার নাম, জন্ম তারিখ (১৮+ বয়স যাচাইয়ের জন্য), ফোন নম্বর, হোয়াটসঅ্যাপ নম্বর এবং ইমেইল ঠিকানা সংগ্রহ করি।',
                'When you register for the Dropshipping Academy waitlist, we collect your first name, last name, date of birth (to verify 18+ eligibility), phone number, WhatsApp number, and email address.'
              )}
            </p>
          </section>

          <section>
            <h2 className="specimen-h3 mb-2">
              {t(
                '২. আপনার তথ্য কীভাবে ব্যবহার করা হয়',
                '2. How We Use Your Information'
              )}
            </h2>
            <p>
              {t(
                'আপনার ভেরিফাইড যোগাযোগের তথ্য শুধুমাত্র ওয়েটলিস্টের অগ্রাধিকার তালিকা ব্যবস্থাপনা, নতুন ব্যাচে ভর্তির আমন্ত্রণ ইমেইল ও হোয়াটসঅ্যাপে পাঠানো এবং ফ্রি শিক্ষামূলক ক্যালকুলেটর শেয়ার করার কাজে ব্যবহার করা হয়। আমরা কখনোই আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা হস্তান্তর করি না।',
                'We use your verified contact information strictly to manage waitlist priority, send cohort enrollment invitations via email and WhatsApp, and share free pre-cohort educational calculators. We never sell, rent, or trade your personal data to third parties.'
              )}
            </p>
          </section>

          <section>
            <h2 className="specimen-h3 mb-2">
              {t(
                '৩. ডাটাবেস নিরাপত্তা ও রো-লেভেল সিকিউরিটি (RLS)',
                '3. Database Security & Row-Level Security (RLS)'
              )}
            </h2>
            <p>
              {t(
                'আপনার ওয়েটলিস্টের তথ্য আমাদের সুপাবেস (Supabase) পোস্টগ্রেএসকিউএল ডাটাবেসে রো-লেভেল সিকিউরিটি (RLS) এবং ওয়ান-টাইম পাসকোড ইমেইল ভেরিফিকেশনের মাধ্যমে সুরক্ষিত থাকে।',
                'Your waitlist record is stored in our Supabase PostgreSQL database protected by Row-Level Security (RLS) policies and one-time passcode email verification. Client sessions are immediately signed out once your waitlist entry is recorded.'
              )}
            </p>
          </section>

          <section>
            <h2 className="specimen-h3 mb-2">
              {t('৪. তথ্য মুছে ফেলার অনুরোধ', '4. Data Removal Requests')}
            </h2>
            <p>
              {t(
                'আপনি যেকোনো সময় ওয়েটলিস্ট থেকে আপনার নাম প্রত্যাহার করতে বা আপনার ব্যক্তিগত তথ্য সম্পূর্ণ মুছে ফেলার জন্য ইমেইল করতে পারেন: ',
                'You may opt out of the waitlist or request complete deletion of your personal data at any time by emailing '
              )}
              <a
                href="mailto:support@dropshippingacademy.io"
                className="font-bold underline underline-offset-2"
              >
                support@dropshippingacademy.io
              </a>
              .
            </p>
          </section>

          <div className="pt-4 border-t border-[#171412]/15">
            <Link
              to="/"
              className="inline-flex items-center min-h-[44px] font-bold text-[#813502] underline underline-offset-4 hover:text-[#171412]"
            >
              {t('হোমপেজে ফিরে যান', 'Return to Home')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};
