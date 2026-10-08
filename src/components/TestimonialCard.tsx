import React from 'react';
import type { TestimonialItem } from '../config/content';
import { useLanguage } from '../context/LanguageContext';
import { StarRatingSvg } from './svg/NavIcons';

export interface TestimonialCardProps {
  item: TestimonialItem;
}

const ROTATION_CLASSES: Record<number, string> = {
  [-6]: 'md:-rotate-6',
  [-2]: 'md:-rotate-2',
  [2]: 'md:rotate-2',
  [6]: 'md:rotate-6',
};

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ item }) => {
  const { t } = useLanguage();
  const rotationClass = ROTATION_CLASSES[item.rotation] || 'md:rotate-0';

  return (
    <article
      tabIndex={0}
      className={`snap-center shrink-0 w-[85vw] sm:w-[320px] md:w-full rounded-[12px] bg-[#fff] text-[#171412] p-6 border-2 border-[#171412] flex flex-col justify-between transition-transform duration-200 ease-out transform ${rotationClass} hover:rotate-0 focus-visible:rotate-0 hover:z-10`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <StarRatingSvg count={5} className="w-4 h-4" />
          <span className="text-[12px] text-[#813502] font-bold">
            {item.isPlaceholder
              ? t('প্রিভিউ মতামত', 'Preview Feedback')
              : item.tag}
          </span>
        </div>

        <blockquote className="text-[16px] text-[#171412] font-medium leading-[1.35] mb-6">
          {item.quote}
        </blockquote>
      </div>

      <div className="pt-4 border-t border-[#171412]/12 flex items-center gap-3">
        {/* SVG Initials Circle Avatar */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="w-10 h-10 shrink-0"
          aria-hidden="true"
        >
          <circle
            cx="20"
            cy="20"
            r="19"
            fill={item.accentBg}
            stroke="#171412"
            strokeWidth="2"
          />
          <text
            x="20"
            y="24.5"
            textAnchor="middle"
            fill={item.accentBg === '#3d2fa9' ? '#fbf9ef' : '#171412'}
            fontSize="13"
            fontWeight="800"
            fontFamily="Bricolage Grotesque, sans-serif"
          >
            {item.initials}
          </text>
        </svg>

        <div className="min-w-0">
          <div className="font-display text-[15px] font-extrabold text-[#171412] truncate">
            {item.author}
          </div>
          <div className="text-[12px] text-[#171412]/75 truncate">
            {item.role} <span aria-hidden="true">·</span> {item.tag}
          </div>
        </div>
      </div>
    </article>
  );
};
