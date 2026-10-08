import React from 'react';
import type { BentoResultItem } from '../config/content';
import { useLanguage } from '../context/LanguageContext';
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

  if (item.type === 'testimonial') {
    return (
      <article
        className={`${item.spanClass} rounded-[12px] bg-[#3d2fa9] text-[#fbf9ef] p-6 sm:p-8 flex flex-col justify-between border-2 border-[#171412]`}
      >
        <div>
          {/* Clean unboxed metadata header */}
          <div className="flex items-center justify-between gap-2 text-[12px] text-[#fbc59d] mb-4">
            <span>{item.tag}</span>
            {item.isPlaceholder && (
              <span className="text-[#ffc765] font-bold">
                {t('নমুনা প্রিভিউ', 'Sample Preview')}
              </span>
            )}
          </div>

          <h3 className="specimen-h3 text-[#fbf9ef] mb-4">{item.title}</h3>

          <blockquote className="text-[17px] sm:text-[18px] text-[#fbf9ef] leading-[1.35] font-medium">
            {item.quote}
          </blockquote>
        </div>

        <div className="pt-6 mt-6 border-t border-[#fbf9ef]/20 flex items-center gap-3.5">
          {/* SVG Initials Avatar */}
          <svg
            viewBox="0 0 44 44"
            fill="none"
            className="w-11 h-11 shrink-0"
            aria-hidden="true"
          >
            <circle cx="22" cy="22" r="21" fill="#ffc765" stroke="#171412" strokeWidth="2" />
            <text
              x="22"
              y="26.5"
              textAnchor="middle"
              fill="#171412"
              fontSize="14"
              fontWeight="800"
              fontFamily="Bricolage Grotesque, sans-serif"
            >
              {item.authorInitials || 'DA'}
            </text>
          </svg>
          <div>
            <div className="font-display text-[15px] font-extrabold text-[#fbf9ef]">
              {item.authorName}
            </div>
            <div className="text-[13px] text-[#fbc59d]">{item.authorRole}</div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`${item.spanClass} rounded-[12px] bg-[#171412] text-[#fbf9ef] p-6 sm:p-8 flex flex-col justify-between border border-[#171412]`}
    >
      <div>
        {/* Unboxed top-left metadata tag + benchmark indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#fbc59d] mb-3">
          <span>{item.tag}</span>
          {item.isPlaceholder && (
            <span className="text-[#ffc765]">Target Benchmark</span>
          )}
        </div>

        <h3 className="specimen-h3 text-[#fbf9ef] max-w-[34ch]">{item.title}</h3>

        <div className="mt-3 font-display text-[20px] font-extrabold text-[#ffc765] tabular-nums">
          {item.metric}
        </div>

        <p className="mt-2 text-[14px] text-[#fbf9ef]/80 leading-[1.35] max-w-[52ch]">
          {item.subcopy}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#fbf9ef]/10 flex items-center justify-center">
        {item.illustrationType === 'revenue-chart' && <RevenueChartIllustration />}
        {item.illustrationType === 'product-box' && <ProductBoxIllustration />}
        {item.illustrationType === 'storefront' && <StorefrontIllustration />}
        {item.illustrationType === 'shipping-route' && <ShippingRouteIllustration />}
      </div>
    </article>
  );
};
