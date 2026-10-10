import React from 'react';
import { motion } from 'motion/react';
import type { TestimonialItem } from '../config/content';
import { useLanguage } from '../context/LanguageContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
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
  const reducedMotion = useReducedMotion();
  const rotationClass = ROTATION_CLASSES[item.rotation] || 'md:rotate-0';

  return (
    <motion.article
      tabIndex={0}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
      className={`snap-center shrink-0 w-[85vw] sm:w-[320px] md:w-full rounded-[20px] bg-[#f2f0e7] text-[#171412] p-6 border-2 border-[#171412] shadow-md flex flex-col justify-between transition-all duration-200 ease-out transform ${rotationClass} hover:rotate-0 focus-visible:rotate-0 hover:z-10`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <StarRatingSvg count={5} className="w-4 h-4" />
          <span className="text-[12px] text-[#813502] font-bold px-2.5 py-0.5 rounded-[50px] bg-[#fbf9ef] border border-[#171412]/25">
            {item.isPlaceholder
              ? t('প্রিভিউ মতামত', 'Preview Feedback')
              : item.tag}
          </span>
        </div>

        <blockquote className="text-[15px] sm:text-[16px] text-[#171412]/90 font-medium leading-[1.5] mb-6">
          "{item.quote}"
        </blockquote>
      </div>

      <div className="pt-4 border-t border-[#171412]/15 flex items-center gap-3">
        {/* Initials Circle Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#ff7722] border border-[#171412] text-[#171412] flex items-center justify-center font-display font-extrabold text-[14px] shrink-0">
          {item.initials}
        </div>

        <div className="min-w-0">
          <div className="font-display text-[15px] font-extrabold text-[#171412] truncate">
            {item.author}
          </div>
          <div className="text-[12px] text-[#171412]/70 truncate">
            {item.role} <span aria-hidden="true">·</span> {item.tag}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
