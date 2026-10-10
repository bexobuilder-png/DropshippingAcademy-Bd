import React, { useEffect, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface ReadingSectionItem {
  id: string;
  labelBn: string;
  labelEn: string;
}

export interface ReadingProgressBarProps {
  variant?: 'navigation' | 'content';
  targetId?: string;
  estimatedMinutes?: number;
  sections?: ReadingSectionItem[];
  className?: string;
}

export interface ReadingProgressState {
  progress: number;
  isScrollable: boolean;
  hasScrolled: boolean;
  activeSectionId: string;
}

export function useReadingProgress(
  targetId = 'main-content',
  sectionIds: string[] = []
): ReadingProgressState {
  const location = useLocation();
  const [state, setState] = useState<ReadingProgressState>({
    progress: 0,
    isScrollable: false,
    hasScrolled: false,
    activeSectionId: sectionIds[0] || '',
  });

  const sectionIdsKey = sectionIds.join(',');

  useEffect(() => {
    let rafId: number | null = null;

    const calculateProgress = () => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollTop = window.scrollY || docEl.scrollTop || body.scrollTop || 0;
      const viewportHeight = window.innerHeight || docEl.clientHeight || 1;

      const targetEl = document.getElementById(targetId);
      let rawProgress = 0;
      let scrollableDistance = 0;

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementHeight = targetEl.offsetHeight;
        scrollableDistance = elementHeight - viewportHeight * 0.75;

        if (scrollableDistance > 40) {
          const scrolledPastTop = scrollTop - elementTop + viewportHeight * 0.15;
          rawProgress = (scrolledPastTop / scrollableDistance) * 100;
        }
      } else {
        const fullHeight = Math.max(
          body.scrollHeight,
          docEl.scrollHeight,
          body.offsetHeight,
          docEl.offsetHeight
        );
        scrollableDistance = fullHeight - viewportHeight;
        if (scrollableDistance > 40) {
          rawProgress = (scrollTop / scrollableDistance) * 100;
        }
      }

      const totalDocScrollable =
        Math.max(body.scrollHeight, docEl.scrollHeight) - viewportHeight;
      if (totalDocScrollable > 0 && scrollTop >= totalDocScrollable - 8) {
        rawProgress = 100;
      }

      const clampedProgress =
        scrollTop <= 4 ? 0 : Math.min(100, Math.max(0, Math.round(rawProgress)));
      const isScrollable = scrollableDistance > 48 || totalDocScrollable > 64;
      const hasScrolled = scrollTop > 16;

      let activeSectionId = sectionIds[0] || '';
      if (sectionIds.length > 0) {
        const triggerOffset = viewportHeight * 0.28;
        for (const id of sectionIds) {
          const sectionEl = document.getElementById(id);
          if (sectionEl) {
            const rect = sectionEl.getBoundingClientRect();
            if (rect.top <= triggerOffset) {
              activeSectionId = id;
            }
          }
        }
      }

      setState((prev) => {
        if (
          prev.progress === clampedProgress &&
          prev.isScrollable === isScrollable &&
          prev.hasScrolled === hasScrolled &&
          prev.activeSectionId === activeSectionId
        ) {
          return prev;
        }
        return {
          progress: clampedProgress,
          isScrollable,
          hasScrolled,
          activeSectionId,
        };
      });
    };

    const scheduleCalculation = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        calculateProgress();
      });
    };

    calculateProgress();
    const initialTimer = window.setTimeout(calculateProgress, 120);

    window.addEventListener('scroll', scheduleCalculation, { passive: true });
    window.addEventListener('resize', scheduleCalculation, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleCalculation);
      resizeObserver.observe(document.body);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        resizeObserver.observe(targetEl);
      }
    }

    return () => {
      window.clearTimeout(initialTimer);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleCalculation);
      window.removeEventListener('resize', scheduleCalculation);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [location.pathname, targetId, sectionIdsKey]);

  return state;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  variant = 'navigation',
  targetId = 'main-content',
  estimatedMinutes = 4,
  sections = [],
  className = '',
}) => {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const gradientId = useId();
  const sectionIds = sections.map((s) => s.id);
  const { progress, isScrollable, hasScrolled, activeSectionId } =
    useReadingProgress(targetId, sectionIds);

  const handleSectionScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  if (variant === 'navigation') {
    return (
      <div
        role="progressbar"
        aria-label={t('পৃষ্ঠা পড়ার অগ্রগতি', 'Page reading progress')}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${progress}%`}
        className={`relative w-full h-[3px] bg-[#171412]/[0.06] overflow-hidden select-none pointer-events-none transition-opacity duration-300 ${
          isScrollable ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      >
        <svg
          viewBox="0 0 100 3"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="w-full h-full block"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#813502" />
              <stop offset="65%" stopColor="#ff7722" />
              <stop offset="100%" stopColor="#ffc765" />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width={progress}
            height="3"
            rx="1.5"
            fill={`url(#${gradientId})`}
            className={
              reducedMotion
                ? ''
                : 'transition-[width] duration-150 ease-out'
            }
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`sticky top-16 md:top-20 z-30 mb-6 rounded-[14px] bg-[#fbf9ef]/95 backdrop-blur-md border border-[#171412]/15 shadow-xs px-4 py-3 transition-all duration-200 ${
        hasScrolled ? 'border-[#171412]/25 shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Reading Status & Estimated Time */}
        <div className="flex items-center gap-2.5 text-[12px] sm:text-[13px] font-bold text-[#171412]/80">
          <span className="inline-flex items-center gap-1.5 text-[#813502]">
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full ${
                progress >= 95
                  ? 'bg-[#171412]'
                  : hasScrolled
                  ? 'bg-[#ff7722]'
                  : 'bg-[#813502]/60'
              }`}
            />
            <span>
              {t(
                `আনুমানিক ${estimatedMinutes} মিনিট পাঠ`,
                `${estimatedMinutes} min read`
              )}
            </span>
          </span>
          <span aria-hidden="true" className="text-[#171412]/30">
            ·
          </span>
          <span
            aria-live="off"
            className="tabular-nums font-extrabold text-[#171412]"
          >
            {progress >= 98
              ? t('পড়া সম্পন্ন (১০০%)', 'Completed (100%)')
              : t(`${progress}% পঠিত`, `${progress}% read`)}
          </span>
        </div>

        {/* Section Jump Pills (Desktop & Tablet) */}
        {sections.length > 0 && (
          <nav
            aria-label={t('অনুচ্ছেদ নেভিগেশন', 'Article section navigation')}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full"
          >
            {sections.map((sec, idx) => {
              const isActive = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSectionScroll(sec.id)}
                  className={`px-2.5 py-1 rounded-[50px] text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#171412] text-[#fbf9ef]'
                      : 'bg-[#f2f0e7] text-[#171412]/75 hover:bg-[#ebe8dc] hover:text-[#171412]'
                  }`}
                >
                  {t(sec.labelBn, sec.labelEn || `${idx + 1}`)}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Subtle Embedded Progress Track */}
      <div
        role="progressbar"
        aria-label={t('নিবন্ধ পড়ার অগ্রগতি', 'Article reading progress')}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${progress}%`}
        className="mt-2.5 w-full h-1.5 rounded-full bg-[#171412]/10 overflow-hidden"
      >
        <svg
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="w-full h-full block"
        >
          <defs>
            <linearGradient
              id={`${gradientId}-content`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#813502" />
              <stop offset="70%" stopColor="#ff7722" />
              <stop offset="100%" stopColor="#ffc765" />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width={progress}
            height="2"
            rx="1"
            fill={`url(#${gradientId}-content)`}
            className={
              reducedMotion
                ? ''
                : 'transition-[width] duration-150 ease-out'
            }
          />
        </svg>
      </div>
    </div>
  );
};
