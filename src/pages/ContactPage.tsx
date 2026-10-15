import React from 'react';
import { ContactSection } from '../components/ContactSection';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <main id="main-content" className="py-8 md:py-16">
      <div className="specimen-container mb-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#fbf9ef] border border-[#171412]/25 text-[#813502] text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
            {t('সাহায্য ও যোগাযোগ', 'Support & Contact Hub')}
          </span>
          <h1 className="font-display text-[32px] sm:text-[48px] font-extrabold text-[#171412] leading-[1.1] tracking-[-0.03em] mb-4">
            {t('যোগাযোগের সকল মাধ্যম ও ঠিকানা', 'All Contact Channels & Offices')}
          </h1>
          <p className="text-[16px] sm:text-[18px] text-[#171412]/80 font-medium leading-[1.5]">
            {t(
              'ড্রপশিপিং একাডেমি বিডি-র সাপোর্ট টিম সবসময় আপনার সাথে আছে। নিচে যেকোনো মাধ্যমে যোগাযোগ করুন।',
              'Dropshipping Academy BD support is here to help you succeed. Connect with us anytime via the channels below.'
            )}
          </p>
        </div>
      </div>

      <ContactSection />
    </main>
  );
};
