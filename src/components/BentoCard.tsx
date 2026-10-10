import React from 'react';
import { motion } from 'motion/react';
import type { BentoResultItem } from '../config/content';
import { useLanguage } from '../context/LanguageContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  ProductBoxIllustration,
  RevenueChartIllustration,
  ShippingRouteIllustration,
  StorefrontIllustration,
} from './svg/BentoIllustrations';

export interface BentoCardProps {
  item: BentoResultItem;
}

export const BentoCard: React.FC<BentoCardProps> = ({ item }) => {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  if (item.type === 'testimonial') {
    return (
      <motion.article
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
        className={`${item.spanClass} w-full max-w-full box-border rounded-[20px] bg-[#3d2fa9] text-[#fbf9ef] p-6 sm:p-8 flex flex-col justify-between border-2 border-[#171412] shadow-md transition-all`}
      >
        <div>
          {/* Clean unboxed metadata header */}
          <div className="flex items-center justify-between gap-2 text-[12px] text-[#ffc765] font-bold mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-[#fbf9ef]/15 border border-[#fbf9ef]/30">
              {item.tag}
            </span>
            {item.isPlaceholder && (
              <span className="text-[#ffc765] font-bold">
                {t('নমুনা প্রিভিউ', 'Sample Preview')}
              </span>
            )}
          </div>

          <h3 className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#fbf9ef] mb-4 leading-tight">
            {item.title}
          </h3>

          <blockquote className="text-[16px] sm:text-[17px] text-[#fbf9ef]/90 leading-[1.5] font-medium">
            "{item.quote}"
          </blockquote>
        </div>

        <div className="pt-6 mt-6 border-t border-[#fbf9ef]/20 flex items-center gap-3.5">
          {/* SVG Initials Avatar */}
          <div className="w-11 h-11 rounded-full bg-[#ffc765] border border-[#171412] text-[#171412] flex items-center justify-center font-display font-extrabold text-[15px] shrink-0">
            {item.authorInitials || 'DA'}
          </div>
          <div>
            <div className="font-display text-[15px] font-extrabold text-[#fbf9ef]">
              {item.authorName}
            </div>
            <div className="text-[13px] text-[#fbc59d]">{item.authorRole}</div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
      className={`${item.spanClass} w-full max-w-full box-border rounded-[20px] bg-[#171412] text-[#fbf9ef] p-6 sm:p-8 flex flex-col justify-between border-2 border-[#171412] shadow-md transition-all`}
    >
      <div>
        {/* Unboxed top-left metadata tag + benchmark indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#fbc59d] font-bold mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-[#fbf9ef]/10 border border-[#fbf9ef]/20">
            {item.tag}
          </span>
          {item.isPlaceholder && (
            <span className="text-[#ffc765]">Target Benchmark</span>
          )}
        </div>

        <h3 className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#fbf9ef] max-w-[34ch] leading-tight">
          {item.title}
        </h3>

        <div className="mt-3 font-display text-[24px] sm:text-[28px] font-extrabold text-[#ff7722] tabular-nums">
          {item.metric}
        </div>

        <p className="mt-2 text-[14px] sm:text-[15px] text-[#fbf9ef]/80 leading-[1.5] max-w-[52ch]">
          {item.subcopy}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#fbf9ef]/15 flex items-center justify-center">
        {item.illustrationType === 'revenue-chart' && <RevenueChartIllustration />}
        {item.illustrationType === 'product-box' && <ProductBoxIllustration />}
        {item.illustrationType === 'storefront' && <StorefrontIllustration />}
        {item.illustrationType === 'shipping-route' && <ShippingRouteIllustration />}
      </div>
    </motion.article>
  );
};
