import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DropshippingAcademyBdLogo } from './svg/BrandLogo';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLanguage();
  const isHomePage = location.pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <>
      {/* Top Sticky Bar — Matching Screenshot Dark Header (#08121e) */}
      <header className="sticky top-0 z-40 bg-[#08121e]/95 backdrop-blur-md border-b border-white/10 text-white">
        <div className="specimen-container h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Zone 1: Green Graduation Cap Logo + Brand Wordmark */}
          <Link
            to="/"
            onClick={() => {
              if (isHomePage) window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 group shrink-0"
          >
            <DropshippingAcademyBdLogo isDark={true} className="h-10" />
          </Link>

          {/* Zone 2: Navigation Links Matching Screenshot */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 lg:gap-8 text-[14px] lg:text-[15px] font-semibold text-white/90"
          >
            <button
              type="button"
              onClick={() => handleAnchorScroll('hero')}
              className="text-[#00d27a] font-bold hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('হোম', 'Home')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('results')}
              className="hover:text-[#00d27a] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('নির্বাচিত ফলাফল', 'Featured Results')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('about')}
              className="hover:text-[#00d27a] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('আমাদের সম্পর্কে', 'About Us')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('contact')}
              className="hover:text-[#00d27a] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('যোগাযোগ', 'Contact')}
            </button>
          </nav>

          {/* Zone 3: User Icon + Language Switcher + Emerald Green Action Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Admin Profile Icon */}
            <Link
              to="/check"
              title={t('অ্যাডমিন পোর্টাল', 'Admin Control Center')}
              aria-label={t('অ্যাডমিন পোর্টাল', 'Admin Control Center')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-[#10b981] text-white hover:text-[#08121e] flex items-center justify-center transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={lang === 'bn' ? 'Switch language to English' : 'ওয়েবসাইটের ভাষা বাংলায় পরিবর্তন করুন'}
              className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-[50px] bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] sm:text-[12px] font-bold text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>

            {/* Registration CTA Button (Vibrant Emerald Green matching screenshot) */}
            <button
              type="button"
              onClick={() => navigate('/join')}
              className="h-9 sm:h-10 px-3.5 sm:px-5 rounded-[50px] bg-[#10b981] hover:bg-[#059669] text-[#08121e] font-extrabold text-[12px] sm:text-[14px] inline-flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
            >
              <span>{t('রেজিস্ট্রেশন করুন', 'Register Now')}</span>
              <span aria-hidden="true" className="font-bold">→</span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white"
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
          <div className="md:hidden bg-[#0a1526] border-b border-white/15 px-4 py-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleAnchorScroll('hero')}
              className="text-left py-2 font-bold text-[#10b981]"
            >
              {t('হোম', 'Home')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('results')}
              className="text-left py-2 font-bold text-white/90"
            >
              {t('নির্বাচিত ফলাফল', 'Results')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('why-us')}
              className="text-left py-2 font-bold text-white/90"
            >
              {t('কেন আমাদের একাডেমি?', 'Why Us')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('about')}
              className="text-left py-2 font-bold text-white/90"
            >
              {t('আমাদের সম্পর্কে', 'About Us')}
            </button>
            <button
              type="button"
              onClick={() => handleAnchorScroll('faq')}
              className="text-left py-2 font-bold text-white/90"
            >
              {t('যোগাযোগ ও সাহায্য', 'Contact & FAQ')}
            </button>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <Link to="/check" className="text-xs text-white/80 underline font-bold">
                {t('অ্যাডমিন কন্ট্রোল সেন্টার', 'Admin Portal')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/join');
                }}
                className="px-4 py-2 bg-[#10b981] text-[#08121e] rounded-full font-bold text-xs"
              >
                {t('রেজিস্ট্রেশন করুন →', 'Register →')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar Matching Screenshot 2 */}
      <nav
        aria-label="Mobile Bottom App Bar"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-[#08121e]/98 backdrop-blur-lg border-t border-white/15 flex items-center justify-around px-2 text-white shadow-2xl"
      >
        <button
          type="button"
          onClick={() => handleAnchorScroll('hero')}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-[#10b981]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('হোম', 'Home')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnchorScroll('results')}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-white/80 hover:text-[#00d27a]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('ফলাফল', 'Results')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/join')}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-white/80 hover:text-[#00d27a]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('রেজিস্ট্রেশন', 'Register')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnchorScroll('contact')}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-white/80 hover:text-[#00d27a]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight">{t('যোগাযোগ', 'Contact')}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-center cursor-pointer text-white/80 hover:text-[#10b981]"
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
