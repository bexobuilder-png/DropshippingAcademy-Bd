import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeroSlideItem } from '../config/content';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRightSvgIcon } from './svg/NavIcons';

interface HeroSliderProps {
  slides: HeroSlideItem[];
  onCtaClick?: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides, onCtaClick }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Autoplay timer
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      role="region"
      aria-label={t('মূল ফিচার ও কোর্স স্লাইডার', 'Hero and courses featured slider')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full rounded-[20px] sm:rounded-[28px] bg-[#f2f0e7] border-2 border-[#171412] shadow-[6px_6px_0px_#171412] overflow-hidden focus:outline-none"
    >
      {/* Background Warm Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ff7722]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffc765]/25 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Slide Card Container */}
      <div className="p-6 sm:p-10 lg:p-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle, Feature Pills, CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Kicker Pill */}
            {currentSlide.badge && (
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#fbf9ef] border border-[#171412]/25 text-[#813502] text-[12px] sm:text-[13px] font-extrabold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
                  <span>{currentSlide.badge}</span>
                </span>
              </div>
            )}

            {/* Giant Title */}
            <h1 className="font-display text-[32px] sm:text-[46px] lg:text-[56px] font-extrabold text-[#171412] leading-[1.08] tracking-[-0.03em] mb-5">
              {currentSlide.titlePrefix}{' '}
              <span className="text-[#ff7722] block sm:inline">
                {currentSlide.titleHighlight}
              </span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-[15px] sm:text-[17px] font-medium text-[#171412]/80 leading-[1.6] max-w-[52ch] mb-7">
              {currentSlide.subtitle}
            </p>

            {/* 3 Core Pill Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {currentSlide.tags && currentSlide.tags.length > 0 ? (
                currentSlide.tags.map((tag, idx) => (
                  <div
                    key={`tag-${idx}`}
                    className="p-3 rounded-[12px] bg-[#fbf9ef] border border-[#171412]/20 hover:border-[#ff7722] transition-all flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#ff7722]/15 text-[#813502] flex items-center justify-center shrink-0">
                      {idx === 0 ? (
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : idx === 1 ? (
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-12.728 0m0 0l2.829-2.829m-2.829 2.829L3 21m2.828-15.364a5 5 0 017.072 0" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-[#171412] leading-tight truncate">
                        {tag.label}
                      </span>
                      <span className="text-[11px] text-[#813502] font-semibold mt-0.5 truncate">
                        {tag.sub}
                      </span>
                    </div>
                  </div>
                ))
              ) : null}
            </div>

            {/* CTA Button & Number Indicator */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onCtaClick}
                className="px-8 py-4 rounded-[50px] bg-[#ff7722] hover:bg-[#e56310] text-[#171412] border-2 border-[#171412] font-display text-[15px] sm:text-[16px] font-extrabold shadow-[4px_4px_0px_#171412] transition-all cursor-pointer inline-flex items-center gap-2.5 active:scale-95"
              >
                <span>{currentSlide.ctaText || t('কোর্স দেখুন ও রেজিস্ট্রেশন করুন', 'Explore Course & Register')}</span>
                <ArrowRightSvgIcon className="w-4 h-4 shrink-0 text-[#171412]" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[50px] bg-[#fbf9ef] border border-[#171412]/25 text-[12px] font-extrabold text-[#171412] tabular-nums">
                <span className="text-[#813502]">0{currentIndex + 1}</span>
                <span className="text-[#171412]/40">/</span>
                <span>0{total}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Media Showcase with Floating Cursive Script */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[20px] overflow-hidden border-2 border-[#171412] shadow-lg bg-[#171412] group">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden">
                <img
                  src={currentSlide.image}
                  alt={`${currentSlide.titlePrefix} ${currentSlide.titleHighlight}`}
                  loading="eager"
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/hero_laptop_business_1791567717121.jpg';
                  }}
                />

                {/* Subtle warm dark gradient overlay for media contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#171412]/80 via-transparent to-transparent pointer-events-none"></div>

                {/* Live Cohort Badge */}
                <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-[50px] bg-[#fbf9ef]/95 text-[#171412] text-[11px] font-extrabold tracking-wide border border-[#171412] backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
                  <span>{t('লাইভ ব্যাচ ০১', 'Live Cohort 01')}</span>
                </div>

                {/* Floating Script Tag */}
                <div className="absolute top-3.5 right-3.5 text-right font-display font-extrabold text-[14px] sm:text-[16px] text-[#171412] leading-tight shadow-md bg-[#ffc765]/95 px-3.5 py-2 rounded-[12px] border border-[#171412] backdrop-blur-md whitespace-pre-line select-none">
                  {currentSlide.floatingScriptText || 'শিখুন\nকাজ করুন\nনিজেকে গড়ুন'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar: Prev / Next buttons & Pagination Dots */}
      <div className="px-6 sm:px-10 py-3.5 bg-[#ebe8dc] border-t border-[#171412]/15 flex items-center justify-between gap-4">
        {/* Pagination Dots */}
        <div
          role="tablist"
          aria-label={t('স্লাইড নির্বাচন', 'Slide selector')}
          className="flex items-center gap-2"
        >
          {slides.map((s, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={`dot-${s.id || idx}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={t(`স্লাইড ${idx + 1} এ যান`, `Go to slide ${idx + 1}`)}
                onClick={() => goToSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-8 bg-[#ff7722] border border-[#171412]'
                    : 'w-2.5 bg-[#171412]/25 hover:bg-[#171412]/50'
                }`}
              />
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label={t('পূর্ববর্তী স্লাইড', 'Previous slide')}
            className="w-9 h-9 rounded-full bg-[#fbf9ef] hover:bg-[#ff7722] text-[#171412] border border-[#171412]/25 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label={t('পরবর্তী স্লাইড', 'Next slide')}
            className="w-9 h-9 rounded-full bg-[#fbf9ef] hover:bg-[#ff7722] text-[#171412] border border-[#171412]/25 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
