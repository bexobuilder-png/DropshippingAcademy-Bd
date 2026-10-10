import React from 'react';
import { WhyChooseUsItem } from '../config/content';
import { useLanguage } from '../context/LanguageContext';

interface WhyChooseUsBarProps {
  items: WhyChooseUsItem[];
}

export const WhyChooseUsBar: React.FC<WhyChooseUsBarProps> = ({ items }) => {
  const { t } = useLanguage();

  const getIcon = (type: WhyChooseUsItem['iconType']) => {
    switch (type) {
      case 'trainer':
        return (
          <div className="w-12 h-12 rounded-full bg-[#ff7722]/20 text-[#813502] border border-[#171412]/15 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'recorded':
        return (
          <div className="w-12 h-12 rounded-full bg-[#ffc765]/40 text-[#171412] border border-[#171412]/15 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'support':
        return (
          <div className="w-12 h-12 rounded-full bg-[#fbc59d]/45 text-[#813502] border border-[#171412]/15 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'certificate':
        return (
          <div className="w-12 h-12 rounded-full bg-[#3d2fa9]/15 text-[#3d2fa9] border border-[#171412]/15 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        );
      case 'career':
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-[#ff7722]/20 text-[#813502] border border-[#171412]/15 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[13px] font-extrabold text-[#813502] tracking-wider uppercase block mb-2">
          {t('কেন আমাদের একাডেমি?', 'Why Dropshipping Academy BD?')}
        </span>
        <h2 className="font-display text-[28px] sm:text-[38px] font-extrabold text-[#171412] leading-tight tracking-[-0.02em]">
          {t('আপনার সফলতার জন্য আমরা প্রতিশ্রুতিবদ্ধ', 'Committed to Your Long-Term Success')}
        </h2>
      </div>

      {/* 5 Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-[20px] bg-[#fbf9ef] border border-[#171412]/20 hover:border-[#ff7722] shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 group"
          >
            {getIcon(item.iconType)}
            <h3 className="font-display text-[17px] font-extrabold text-[#171412] leading-tight mb-2 group-hover:text-[#813502] transition-colors">
              {item.title}
            </h3>
            <p className="text-[13px] font-medium text-[#171412]/75 leading-[1.5]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
