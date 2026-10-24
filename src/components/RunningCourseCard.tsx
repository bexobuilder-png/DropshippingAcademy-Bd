import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseItem } from '../config/courses';
import { useLanguage } from '../context/LanguageContext';
import { fetchRunningCourse } from '../services/courses';

interface RunningCourseCardProps {
  course?: CourseItem | null;
  variant?: 'drawer' | 'featured' | 'compact';
  onLearnMore?: () => void;
  className?: string;
}

export const RunningCourseCard: React.FC<RunningCourseCardProps> = ({
  course: propCourse,
  variant = 'drawer',
  onLearnMore,
  className = '',
}) => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseItem | null>(propCourse || null);
  const [loading, setLoading] = useState<boolean>(!propCourse);

  useEffect(() => {
    if (propCourse) {
      setCourse(propCourse);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const load = async () => {
      try {
        const item = await fetchRunningCourse();
        if (isMounted) {
          setCourse(item);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    };

    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener('site-courses-updated', handleUpdate);
    window.addEventListener('site-content-updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('site-courses-updated', handleUpdate);
      window.removeEventListener('site-content-updated', handleUpdate);
    };
  }, [propCourse]);

  const handleAction = () => {
    if (onLearnMore) {
      onLearnMore();
      return;
    }
    const el = document.getElementById('path');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/#path');
    }
  };

  if (loading) {
    return (
      <div
        className={`p-4 rounded-2xl bg-[#f2f0e7] border border-[#171412]/15 animate-pulse ${className}`}
      >
        <div className="h-4 bg-[#171412]/10 rounded w-1/3 mb-2" />
        <div className="h-5 bg-[#171412]/15 rounded w-3/4 mb-2" />
        <div className="h-3 bg-[#171412]/10 rounded w-full mb-3" />
        <div className="h-8 bg-[#171412]/10 rounded-full w-28" />
      </div>
    );
  }

  if (!course || course.isVisible === false || course.isActive === false) {
    return null;
  }

  const displayName = course.batchName || course.title;

  if (variant === 'drawer') {
    return (
      <section
        aria-labelledby="drawer-running-course-title"
        className={`rounded-2xl bg-[#f2f0e7] border border-[#171412]/20 p-3.5 text-[#171412] shadow-xs flex flex-col gap-2.5 ${className}`}
      >
        {/* Header Tag */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#ff7722]/15 text-[#813502] border border-[#ff7722]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7722] animate-ping" />
            <span>{t('চলতি কোর্স', 'Running course')}</span>
          </span>
          {course.duration && (
            <span className="text-[11px] font-semibold text-[#171412]/70 truncate max-w-[130px]">
              {course.duration.split('·')[0]}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h4
            id="drawer-running-course-title"
            className="text-[14px] font-extrabold text-[#171412] leading-snug tracking-tight"
          >
            {displayName}
          </h4>
          <p className="text-[12px] text-[#171412]/80 leading-relaxed mt-1 line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleAction}
          className="mt-0.5 w-full min-h-[44px] h-11 px-4 rounded-xl bg-[#171412] hover:bg-[#813502] text-[#fbf9ef] font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{t('আরও জানুন', 'Learn more')}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>
    );
  }

  // Featured variant for Landing Page (under hero or in curriculum)
  return (
    <section
      aria-labelledby="featured-running-course-title"
      className={`relative overflow-hidden rounded-[24px] bg-[#f2f0e7] border border-[#171412] p-5 sm:p-7 md:p-8 text-[#171412] shadow-md transition-all hover:shadow-lg ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-extrabold uppercase tracking-wide bg-[#ff7722] text-[#171412] border border-[#171412]">
              <span className="w-2 h-2 rounded-full bg-[#171412]" />
              <span>{t('চলতি কোর্স', 'Running course')}</span>
            </span>
            {course.badge && (
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#171412]/10 text-[#171412]">
                {course.badge}
              </span>
            )}
            {course.duration && (
              <span className="text-[12px] font-semibold text-[#813502]">
                {course.duration}
              </span>
            )}
          </div>

          <h3
            id="featured-running-course-title"
            className="font-display text-[20px] sm:text-[24px] md:text-[28px] font-extrabold text-[#171412] leading-tight"
          >
            {displayName}
          </h3>

          <p className="text-[14px] sm:text-[15px] text-[#171412]/85 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3">
          <div className="text-left md:text-right">
            <span className="text-[12px] text-[#171412]/70 font-semibold block">
              {t('কোর্স ফি', 'Course Fee')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-black font-display text-[#813502] tabular-nums">
                ৳{course.discountPrice ?? course.price}
              </span>
              {course.discountPrice && course.discountPrice < course.price && (
                <span className="text-[14px] text-[#171412]/50 line-through tabular-nums">
                  ৳{course.price}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAction}
            className="min-h-[44px] h-11 px-6 rounded-full bg-[#ff7722] hover:bg-[#e56310] text-[#171412] border border-[#171412] font-extrabold text-[14px] inline-flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span>{t('আরও জানুন', 'Learn more')}</span>
            <svg className="w-4 h-4 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
