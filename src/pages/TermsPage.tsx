import React from 'react';
import { Link } from 'react-router-dom';
import {
  ReadingProgressBar,
  ReadingSectionItem,
} from '../components/ReadingProgressBar';
import { useLanguage } from '../context/LanguageContext';

const TERMS_SECTIONS: ReadingSectionItem[] = [
  { id: 'terms-purpose', labelBn: '১. উদ্দেশ্য', labelEn: '1. Purpose' },
  { id: 'terms-age', labelBn: '২. বয়সসীমা', labelEn: '2. Age (18+)' },
  { id: 'terms-waitlist', labelBn: '৩. নিবন্ধন', labelEn: '3. Waitlist' },
  { id: 'terms-ip', labelBn: '৪. মেধাস্বত্ব', labelEn: '4. IP Rights' },
  { id: 'terms-conduct', labelBn: '৫. আচরণবিধি', labelEn: '5. Conduct' },
];

export const TermsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <main id="main-content" className="py-12 md:py-20">
      <div className="specimen-container max-w-3xl">
        <div className="text-[13px] font-bold text-[#813502] mb-3">
          {t('আইনি শর্তাবলী · কার্যকর: অক্টোবর ২০২৬', 'Legal · Effective October 2026')}
        </div>
        <h1 className="font-display text-[42px] sm:text-[64px] font-extrabold text-[#171412] leading-[0.95] tracking-[-0.03em] mb-6">
          {t('ব্যবহারের শর্তাবলী', 'Terms of Service')}
        </h1>

        <ReadingProgressBar
          variant="content"
          targetId="terms-article"
          estimatedMinutes={4}
          sections={TERMS_SECTIONS}
        />

        <article
          id="terms-article"
          className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-6 sm:p-10 flex flex-col gap-8 text-[16px] text-[#171412] leading-[1.6]"
        >
          <section id="terms-purpose" className="scroll-mt-36">
            <h2 className="specimen-h3 mb-2">
              {t(
                '১. শিক্ষামূলক উদ্দেশ্য ও আয়ের কোনো নিশ্চিত গ্যারান্টি না থাকা',
                '1. Educational Purpose & No Earnings Guarantees'
              )}
            </h2>
            <p>
              {t(
                'ড্রপশিপিং একাডেমি ই-কমার্স স্টোর পরিচালনা, প্রোডাক্ট রিসার্চ, সাপ্লায়ার সোর্সিং এবং পেইড ডিজিটাল মার্কেটিং বিষয়ে শিক্ষামূলক প্রশিক্ষণ, ফ্রেমওয়ার্ক, স্প্রেডশিট ও মেন্টরশিপ প্রদান করে। ই-কমার্স ব্যবসায় আর্থিক ঝুঁকি রয়েছে এবং সফল হতে নিয়মিত পরিশ্রমের প্রয়োজন হয়। আমরা কোনো নির্দিষ্ট আয়, মুনাফা বা অ্যাড স্পেন্ড রিটার্নের গ্যারান্টি দিই না।',
                'Dropshipping Academy provides educational training, frameworks, spreadsheets, and mentorship regarding e-commerce store operations, product research, supplier sourcing, and paid digital advertising. E-commerce involves financial risk and requires consistent execution. We do not guarantee any specific revenue, profit margin, or return on ad spend.'
              )}
            </p>
            <p className="mt-3 text-[#171412]/80">
              {t(
                'আমাদের সমস্ত কেস স্টাডি, ইউনিট ইকোনমিক্স ক্যালকুলেশন এবং লাইভ স্টোর উদাহরণ শুধুমাত্র বাস্তব অপারেশনাল পদ্ধতি বোঝানোর জন্য প্রদর্শিত হয়। প্রতিটি শিক্ষার্থীর ফলাফল তার বাজার বিশ্লেষণ, বিজ্ঞাপন বাজেট ব্যবস্থাপনা এবং অর্ডার ফুলফিলমেন্ট দক্ষতার ওপর নির্ভরশীল।',
                'All case studies, unit economics breakdowns, and live store examples are shared strictly to illustrate operational methodology. Individual outcomes depend on market testing discipline, ad budget stewardship, and supplier fulfillment execution.'
              )}
            </p>
          </section>

          <section id="terms-age" className="scroll-mt-36">
            <h2 className="specimen-h3 mb-2">
              {t('২. বয়সসীমা (১৮+ বছর)', '2. Age Requirement (18+)')}
            </h2>
            <p>
              {t(
                'অনলাইন স্টোর পরিচালনা, সাপ্লায়ার চুক্তি এবং অ্যাড অ্যাকাউন্ট বিলিং পরিচালনার জন্য আইনগত বয়স পূর্ণ হওয়া আবশ্যক। তাই আমাদের ওয়েটলিস্টে যুক্ত হতে বা যেকোনো ব্যাচে ভর্তি হতে আপনার বয়স ন্যূনতম ১৮ বছর হতে হবে।',
                'Because running an online store, entering supplier agreements, and managing ad network billing accounts require legal capacity, you must be at least 18 years old to join our waitlist or enroll in any Dropshipping Academy cohort.'
              )}
            </p>
          </section>

          <section id="terms-waitlist" className="scroll-mt-36">
            <h2 className="specimen-h3 mb-2">
              {t(
                '৩. ওয়েটলিস্ট নিবন্ধন ও যোগাযোগ',
                '3. Waitlist Registration & Communications'
              )}
            </h2>
            <p>
              {t(
                'ওয়েটলিস্ট ফরম পূরণ করে ৬-ডিজিটের ওয়ান-টাইম কোড দিয়ে ইমেইল ভেরিফাই করার মাধ্যমে আপনি ড্রপশিপিং একাডেমিকে নতুন ব্যাচ শুরুর তারিখ, কারিকুলাম আপডেট এবং ভর্তির নির্দেশনা ইমেইল ও হোয়াটসঅ্যাপে পাঠানোর অনুমতি দিচ্ছেন।',
                'By submitting the waitlist form and verifying your email with a 6-digit one-time code, you authorize Dropshipping Academy to contact you via email and WhatsApp regarding cohort opening dates, curriculum previews, and enrollment instructions.'
              )}
            </p>
          </section>

          <section id="terms-ip" className="scroll-mt-36">
            <h2 className="specimen-h3 mb-2">
              {t('৪. মেধাস্বত্ব (Intellectual Property)', '4. Intellectual Property')}
            </h2>
            <p>
              {t(
                'ড্রপশিপিং একাডেমির সকল কারিকুলাম ম্যাটেরিয়াল, মার্জিন ক্যালকুলেটর, স্টোরফ্রন্ট ওয়্যারফ্রেম এবং সাপ্লায়ার আউটরিচ স্ক্রিপ্ট একাডেমির নিজস্ব মেধাস্বত্ব। এগুলো কোনোভাবেই পুনঃবিতরণ বা বিক্রি করা যাবে না।',
                'All curriculum materials, margin calculators, storefront wireframes, and supplier outreach scripts shared by Dropshipping Academy remain the intellectual property of Dropshipping Academy and may not be redistributed or resold.'
              )}
            </p>
          </section>

          <section id="terms-conduct" className="scroll-mt-36">
            <h2 className="specimen-h3 mb-2">
              {t(
                '৫. কমিউনিটি আচরণবিধি ও নৈতিক ই-কমার্স চর্চা',
                '5. Community Conduct & Ethical Store Operations'
              )}
            </h2>
            <p>
              {t(
                'ড্রপশিপিং একাডেমির প্রতিটি শিক্ষার্থীকে গ্রাহক সেবা, পণ্যের মান এবং ডেলিভারি সময়ের ব্যাপারে স্বচ্ছতা বজায় রাখতে হবে। ভুয়া রিভিউ, বিভ্রান্তিকর বিজ্ঞাপন বা অনুমোদনহীন পেমেন্ট গেটওয়ে ব্যবহারের বিরুদ্ধে আমাদের অবস্থান কঠোর।',
                'Members of Dropshipping Academy are expected to uphold transparent shipping timelines, accurate product descriptions, and responsive customer support. Counterfeit goods, deceptive ad claims, or unauthorized payment practices will result in immediate removal from cohort resources.'
              )}
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
        </article>
      </div>
    </main>
  );
};

