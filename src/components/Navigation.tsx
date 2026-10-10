import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import type { AnimKind } from './EduAnimation';
import { ReadingProgressBar, useReadingProgress } from './ReadingProgressBar';
import { DropshippingAcademyBdLogo } from './svg/BrandLogo';

const HOME_SECTION_IDS = ['hero', 'results', 'learn', 'about', 'faq', 'contact'];

export interface NavigationProps {
  setAnim: React.Dispatch<React.SetStateAction<null | AnimKind>>;
}

export const Navigation: React.FC<NavigationProps> = ({ setAnim }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLanguage();
  const isHomePage = location.pathname === '/';
  const isRegisterPage = location.pathname === '/join';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRegister = () => {
    setMobileMenuOpen(false);
    if (isRegisterPage) return;
    setAnim('intro');
  };

  const { progress, isScrollable, hasScrolled, activeSectionId } =
    useReadingProgress('main-content', isHomePage ? HOME_SECTION_IDS : []);

  const handleAnchorScroll = (targetId: string) => {
    setMobileMenuOpen(false);
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

  const getNavButtonClass = (sectionIds: string[]) => {
    const isActive =
      isHomePage && sectionIds.includes(activeSectionId || 'hero');
    return isActive
      ? 'text-[#813502] font-bold hover:text-[#171412] transition-colors cursor-pointer whitespace-nowrap'
      : 'hover:text-[#ff7722] transition-colors cursor-pointer whitespace-nowrap';
  };

  return (
    <>
      {/* Top Sticky Bar — Original Warm Cream & Espresso Palette */}
      <header className="sticky top-0 z-40 bg-[#fbf9ef]/95 backdrop-blur-md border-b border-[#171412]/12 text-[#171412]">
        <div className="specimen-container h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Zone 1: Graduation Cap Logo + Brand Wordmark */}
          <Link
            to="/"
            onClick={() => {
              if (isHomePage) window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 group shrink-0"
          >
            <DropshippingAcademyBdLogo isDark={false} className="h-10" />
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 lg:gap-8 text-[14px] lg:text-[15px] font-semibold text-[#171412]/85"
          >
            <button
              type="button"
              onClick={() => handleAnchorScroll('hero')}
              className={getNavButtonClass(['hero'])}
            >
              {t('হোম', 'Home')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('results')}
              className={getNavButtonClass(['results', 'learn'])}
            >
              {t('নির্বাচিত ফলাফল', 'Featured Results')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('about')}
              className={getNavButtonClass(['about'])}
            >
              {t('আমাদের সম্পর্কে', 'About Us')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('contact')}
              className={getNavButtonClass(['faq', 'contact'])}
            >
              {t('যোগাযোগ', 'Contact')}
            </button>
          </nav>

          {/* Zone 3: Reading Indicator + Language Switcher + Orange Action Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Subtle Reading Progress Pill on Long-Form Scroll */}
            {isScrollable && hasScrolled && (
              <div
                aria-hidden="true"
                className="hidden lg:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[50px] bg-[#f2f0e7]/90 border border-[#171412]/12 text-[11px] font-bold text-[#813502] tabular-nums transition-opacity duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7722]" />
                <span>{progress}%</span>
              </div>
            )}

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={lang === 'bn' ? 'Switch language to English' : 'ওয়েবসাইটের ভাষা বাংলায় পরিবর্তন করুন'}
              className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-[50px] bg-[#f2f0e7] hover:bg-[#e5e2d6] border border-[#171412]/20 text-[11px] sm:text-[12px] font-bold text-[#171412] transition-colors cursor-pointer whitespace-nowrap"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>

            {/* Registration CTA Button */}
            <button
              type="button"
              onClick={handleRegister}
              className="h-9 sm:h-10 px-3.5 sm:px-5 rounded-[50px] bg-[#ff7722] hover:bg-[#e56310] text-[#171412] border border-[#171412] font-extrabold text-[12px] sm:text-[14px] inline-flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
            >
              <span>{t('রেজিস্ট্রেশন করুন', 'Register Now')}</span>
              <span aria-hidden="true" className="font-bold">→</span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg bg-[#f2f0e7] border border-[#171412]/20 flex items-center justify-center text-[#171412]"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#f2f0e7] border-b border-[#171412]/15 px-4 py-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleAnchorScroll('hero')}
              className="text-left py-2 font-bold text-[#813502]"
            >
              {t('হোম', 'Home')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('results')}
              className="text-left py-2 font-bold text-[#171412]/90"
            >
              {t('নির্বাচিত ফলাফল', 'Results')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('why-choose')}
              className="text-left py-2 font-bold text-[#171412]/90"
            >
              {t('কেন আমাদের একাডেমি?', 'Why Us')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('about')}
              className="text-left py-2 font-bold text-[#171412]/90"
            >
              {t('আমাদের সম্পর্কে', 'About Us')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('faq')}
              className="text-left py-2 font-bold text-[#171412]/90"
            >
              {t('যোগাযোগ ও সাহায্য', 'Contact & FAQ')}
            </button>
            <div className="pt-2 border-t border-[#171412]/15 flex items-center justify-end">
              <button
                type="button"
                onClick={handleRegister}
                className="px-4 py-2 bg-[#ff7722] text-[#171412] border border-[#171412] rounded-full font-bold text-xs"
              >
                {t('রেজিস্ট্রেশন করুন →', 'Register →')}
              </button>
            </div>
          </div>
        )}

        {/* Subtle Top Navigation Reading Progress Bar */}
        <ReadingProgressBar variant="navigation" />
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom App Bar"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 pb-[env(safe-area-inset-bottom)] bg-[#fbf9ef]/98 backdrop-blur-lg border-t border-[#171412]/15 flex items-center justify-around px-2 text-[#171412] shadow-lg"
      >
        <button
          type="button"
          onClick={() => handleAnchorScroll('hero')}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-[#813502]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('হোম', 'Home')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnchorScroll('results')}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-[#171412]/80 hover:text-[#ff7722]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('ফলাফল', 'Results')}</span>
        </button>

        <button
          type="button"
          onClick={handleRegister}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-[#171412]/80 hover:text-[#ff7722]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('রেজিস্ট্রেশন', 'Register')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnchorScroll('contact')}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-[#171412]/80 hover:text-[#ff7722]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('যোগাযোগ', 'Contact')}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-[#171412]/80 hover:text-[#ff7722]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('মেনু', 'Menu')}</span>
        </button>
      </nav>
    </>
  );
};
