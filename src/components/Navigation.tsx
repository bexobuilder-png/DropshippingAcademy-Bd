import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { BrandBadgeMark } from './svg/BrandLogo';
import { AboutIcon, FaqIcon, HomeIcon, LearnIcon } from './svg/NavIcons';
import { Button } from './Button';

interface RailItem {
  id: string;
  labelBn: string;
  labelEn: string;
  targetId: string;
  Icon: React.FC<{ className?: string }>;
}

const RAIL_ITEMS: RailItem[] = [
  { id: 'rail-home', labelBn: 'হোম', labelEn: 'Home', targetId: 'hero', Icon: HomeIcon },
  { id: 'rail-learn', labelBn: 'কী শিখবেন', labelEn: 'Learn', targetId: 'learn', Icon: LearnIcon },
  { id: 'rail-faq', labelBn: 'জিজ্ঞাসা', labelEn: 'FAQ', targetId: 'faq', Icon: FaqIcon },
  { id: 'rail-about', labelBn: 'প্রতিষ্ঠাতা', labelEn: 'About', targetId: 'about', Icon: AboutIcon },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLanguage();
  const isHomePage = location.pathname === '/';

  const handleAnchorScroll = (targetId: string) => {
    if (!isHomePage) {
      navigate(`/#${targetId}`);
      return;
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Sticky Bar — 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#fbf9ef]/95 backdrop-blur-sm hairline-b">
        <div className="specimen-container h-16 md:h-20 flex items-center justify-between gap-3">
          {/* Zone 1: Round SVG Logo Badge + Single Brand Wordmark */}
          <Link
            to="/"
            onClick={() => {
              if (isHomePage) window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-[#171412] group shrink-0 min-w-0"
          >
            <BrandBadgeMark
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 transition-transform duration-200 group-hover:scale-105 shrink-0"
              decorative={true}
            />
            <span className="font-display text-[14px] sm:text-[17px] md:text-[20px] font-extrabold tracking-[-0.02em] text-[#171412] truncate max-w-[120px] sm:max-w-none">
              {t('ড্রপশিপিং একাডেমি', 'Dropshipping Academy')}
            </span>
          </Link>

          {/* Zone 2: Clean Typography Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-6 text-[14px] font-semibold text-[#171412]"
          >
            <button
              type="button"
              onClick={() => handleAnchorScroll('results')}
              className="hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              {t('ফলাফল', 'Results')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('learn')}
              className="hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              {t('কী শিখবেন', 'Learn')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('reviews')}
              className="hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              {t('মতামত', 'Trusted By')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('faq')}
              className="hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              {t('সাধারণ জিজ্ঞাসা', 'FAQ')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('about')}
              className="hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              {t('প্রতিষ্ঠাতা', 'Founders')}
            </button>
          </nav>

          {/* Zone 3: Language Toggle (Bangla / English) + Primary Action Pill Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleLang}
              aria-label={
                lang === 'bn'
                  ? 'Switch website language to English'
                  : 'ওয়েবসাইটের ভাষা বাংলায় পরিবর্তন করুন'
              }
              className="min-h-[40px] sm:min-h-[44px] px-3.5 py-2 rounded-[50px] bg-[#f2f0e7] hover:bg-[#ffc765] border border-[#171412] text-[12px] sm:text-[13px] font-bold text-[#171412] transition-colors cursor-pointer whitespace-nowrap"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>

            <Button
              variant="primary"
              onClick={() => {
                if (isHomePage) {
                  const el = document.getElementById('hero-waitlist-email') || document.getElementById('hero');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (el instanceof HTMLInputElement) el.focus();
                    return;
                  }
                }
                navigate('/join');
              }}
              className="px-3 sm:px-4 py-2 text-[12px] sm:text-[14px] shrink-0 whitespace-nowrap min-h-[44px]"
              aria-label={t('ওয়েটলিস্টে যুক্ত হোন', 'Join the waitlist')}
            >
              {t('যোগ দিন', 'Join')}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Fixed Vertical Left Icon Rail */}
      {isHomePage && (
        <aside
          aria-label="Section quick navigation rail"
          className="hidden xl:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col gap-2 p-2 rounded-[50px] bg-[#f2f0e7]/95 border border-[#171412]/20 shadow-sm"
        >
          {RAIL_ITEMS.map(({ id, labelBn, labelEn, targetId, Icon }) => {
            const label = t(labelBn, labelEn);
            return (
              <div key={id} className="relative group">
                <button
                  type="button"
                  onClick={() => handleAnchorScroll(targetId)}
                  aria-label={`Scroll to ${label}`}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[#171412] hover:bg-[#171412] hover:text-[#fbf9ef] transition-colors cursor-pointer"
                >
                  <Icon className="w-5 h-5" />
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-[6px] bg-[#171412] text-[#fbf9ef] text-[12px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shadow-sm"
                >
                  {label}
                </span>
              </div>
            );
          })}
        </aside>
      )}

      {/* Mobile Compact Bottom Rail */}
      {isHomePage && (
        <nav
          aria-label="Mobile section navigation"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          className="xl:hidden fixed bottom-0 inset-x-0 z-50 h-14 bg-[#fbf9ef]/95 backdrop-blur-sm border-t border-[#171412]/15 flex items-center justify-around px-2"
        >
          {RAIL_ITEMS.map(({ id, labelBn, labelEn, targetId, Icon }) => {
            const label = t(labelBn, labelEn);
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleAnchorScroll(targetId)}
                aria-label={label}
                className="min-w-[44px] min-h-[44px] px-2 flex items-center justify-center gap-1 text-[12px] font-bold text-[#171412] hover:text-[#813502] cursor-pointer whitespace-nowrap"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
};
