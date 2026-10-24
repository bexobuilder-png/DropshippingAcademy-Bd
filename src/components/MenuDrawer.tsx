import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  clearUserSession,
  getCurrentUserSession,
  refreshUserStatus,
  subscribeToAuthSession,
  UserSession,
} from '../services/auth';
import { StatusBadge } from './StatusBadge';
import { RunningCourseCard } from './RunningCourseCard';
import { AuthGuardModal } from './AuthGuard';
import { prefetchWaitlistDirectory } from '../services/waitlist';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick?: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onRegisterClick,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [session, setSession] = useState<UserSession | null>(() => getCurrentUserSession());
  const [isRefreshingStatus, setIsRefreshingStatus] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Subscribe to session changes and refresh status every time drawer opens
  useEffect(() => {
    const unsub = subscribeToAuthSession((updated) => {
      setSession(updated);
    });

    if (isOpen) {
      // Prefetch waitlist directory in background on drawer open
      prefetchWaitlistDirectory();
      setIsRefreshingStatus(true);
      refreshUserStatus().then((refreshed) => {
        if (refreshed) setSession(refreshed);
        setIsRefreshingStatus(false);
      });
    }

    return () => {
      unsub();
    };
  }, [isOpen]);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll while drawer is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNavClick = (target: string, isAnchor = false) => {
    onClose();
    if (isAnchor) {
      if (location.pathname !== '/') {
        navigate(`/#${target}`);
        return;
      }
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (target === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(target);
    }
  };

  const handleWaitlistClick = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    // Close drawer with animation, then navigate without flicker
    onClose();
    navigate('/waitlist');
  };

  const handleSignOut = async () => {
    await clearUserSession();
    setSession(null);
  };

  if (!isOpen) return null;

  const navItems = [
    {
      id: 'home',
      labelBn: 'হোম',
      labelEn: 'Home',
      action: () => handleNavClick('hero', true),
      isActive: location.pathname === '/',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'profile',
      labelBn: 'ব্যক্তিগত প্রোফাইল',
      labelEn: 'Personal Profile',
      action: () => {
        onClose();
        navigate('/profile');
      },
      isActive: location.pathname === '/profile',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'courses',
      labelBn: 'কোর্স ক্যাটালগ ও ভর্তি',
      labelEn: 'Courses Catalog',
      action: () => {
        onClose();
        navigate('/registration');
      },
      isActive: false,
      isSpecial: true,
      icon: (
        <svg className="w-5 h-5 shrink-0 text-[#ff7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: 'results',
      labelBn: 'নির্বাচিত ফলাফল',
      labelEn: 'Selected Results',
      action: () => handleNavClick('results', true),
      isActive: false,
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'why-us',
      labelBn: 'কেন আমাদের একাডেমি?',
      labelEn: 'Why Our Academy',
      action: () => handleNavClick('why-choose', true),
      isActive: false,
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'about',
      labelBn: 'আমাদের সম্পর্কে',
      labelEn: 'About Us',
      action: () => handleNavClick('about', true),
      isActive: false,
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'contact',
      labelBn: 'যোগাযোগ ও সাহায্য',
      labelEn: 'Contact & Support',
      action: () => handleNavClick('/contact', false),
      isActive: location.pathname === '/contact',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      id: 'waitlist',
      labelBn: 'নিবন্ধিত ওয়েটলিস্ট',
      labelEn: 'Registered Waiting List',
      action: handleWaitlistClick,
      isActive: location.pathname === '/waitlist',
      isSpecial: true,
      icon: (
        <svg className="w-5 h-5 shrink-0 text-[#ff7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'admin',
      labelBn: 'অ্যাডমিন প্যানেল',
      labelEn: 'Admin Panel',
      action: () => {
        onClose();
        navigate('/check');
      },
      isActive: location.pathname === '/check',
      icon: (
        <svg className="w-5 h-5 shrink-0 text-[#813502]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-hidden"
        role="region"
        aria-label="Navigation Drawer Overlay"
      >
        {/* Dimmed Backdrop */}
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        />

        {/* Drawer Panel sliding in from right */}
        <aside
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('মূল মেনু', 'Main Menu')}
          className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[84vw] sm:max-w-[380px] bg-[#fbf9ef] sm:border-l-2 border-[#171412] shadow-2xl text-[#171412] transform transition-transform duration-400 ease-out select-none ${
            reducedMotion ? '' : 'animate-slide-in-right'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#171412]/15 bg-[#f2f0e7]/70">
            <span className="text-[13px] font-black uppercase tracking-wider text-[#813502]">
              {t('ড্রপশিপিং একাডেমি', 'Dropshipping Academy')}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={t('মেনু বন্ধ করুন', 'Close menu')}
              className="w-10 h-10 min-w-[40px] rounded-full bg-[#f2f0e7] hover:bg-[#e5e2d6] border border-[#171412]/20 flex items-center justify-center text-[#171412] text-lg font-bold cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            
            {/* 1. Registration Status Block */}
            <div className="rounded-2xl bg-[#f2f0e7] border border-[#171412]/20 p-4 text-[#171412] shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-[#813502] uppercase tracking-wider">
                  {t('রেজিস্ট্রেশন স্ট্যাটাস', 'Registration Status')}
                </span>
                {session && isRefreshingStatus && (
                  <span className="w-2 h-2 rounded-full bg-[#ff7722] animate-ping" />
                )}
              </div>

              {session ? (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[15px] font-extrabold text-[#171412] truncate">
                      {session.firstName} {session.lastName}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#171412]/10">
                    <span className="text-[12px] font-semibold text-[#171412]/70">
                      {t('বর্তমান অবস্থা:', 'Current status:')}
                    </span>
                    <StatusBadge status={session.status} size="sm" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#171412]/75">
                      {t('স্ট্যাটাস:', 'Status:')}
                    </span>
                    <StatusBadge status="not_available" size="sm" />
                  </div>

                  <div className="pt-2 border-t border-[#171412]/10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/registration');
                      }}
                      className="flex-1 min-h-[44px] h-11 px-3 rounded-xl bg-[#ff7722] hover:bg-[#e56310] text-[#171412] border border-[#171412] text-[12px] font-extrabold flex items-center justify-center transition-all cursor-pointer"
                    >
                      {t('রেজিস্ট্রেশন করুন', 'Register Now')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="min-h-[44px] h-11 px-3 rounded-xl bg-[#171412] hover:bg-[#813502] text-[#fbf9ef] text-[12px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {t('সাইন ইন', 'Sign in')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Nav Items List */}
            <nav aria-label="Side drawer navigation" className="space-y-1.5 pt-1">
              {navItems.map((item, index) => {
                const label = lang === 'bn' ? item.labelBn : item.labelEn;
                const activeCls = item.isActive
                  ? 'bg-[#171412] text-[#fbf9ef] font-black shadow-xs'
                  : 'hover:bg-[#f2f0e7] text-[#171412]/90 font-bold';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    style={{
                      animationDelay: reducedMotion ? '0ms' : `${index * 35}ms`,
                    }}
                    className={`w-full min-h-[48px] px-3.5 py-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer text-[14px] ${activeCls} ${
                      reducedMotion ? '' : 'animate-fade-in'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{label}</span>
                    </div>

                    {item.isSpecial ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff7722] text-[#171412]">
                        {t('নতুন', 'NEW')}
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={`text-xs ${
                          item.isActive ? 'text-[#ff7722]' : 'text-[#171412]/35'
                        }`}
                      >
                        →
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* 3. Running Course Card */}
            <div className="pt-2">
              <RunningCourseCard
                variant="drawer"
                onLearnMore={() => {
                  onClose();
                  handleNavClick('path', true);
                }}
              />
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-[#171412]/15 bg-[#f2f0e7]/70 space-y-3">
            <div className="flex items-center justify-between gap-3">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLang}
                className="flex-1 min-h-[44px] h-11 px-3 rounded-xl bg-[#fbf9ef] hover:bg-[#e5e2d6] border border-[#171412]/20 text-[13px] font-extrabold text-[#171412] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#813502]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন'}</span>
              </button>

              {/* Explicit Sign Out Button if signed in */}
              {session && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-[44px] h-11 px-3.5 rounded-xl bg-[#fff8f8] hover:bg-rose-100 border border-rose-300 text-rose-700 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('সাইন আউট', 'Sign out')}</span>
                </button>
              )}
            </div>

            <div className="text-center text-[10px] font-bold text-[#171412]/50 tracking-wider">
              {t('ড্রপশিপিং একাডেমি বিডি © ২০২৬', 'Dropshipping Academy BD © 2026')}
            </div>
          </div>
        </aside>
      </div>

      {/* Auth Guard Modal for Quick Registration/Sign in */}
      <AuthGuardModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          onClose();
          navigate('/register');
        }}
        onAuthenticated={(newSession) => {
          setSession(newSession);
          setShowAuthModal(false);
          onClose();
          navigate('/waitlist');
        }}
        message={t(
          'ওয়েটলিস্ট দেখতে আপনাকে প্রথমে নিবন্ধন করতে হবে।',
          'To access this information, you must register first.'
        )}
      />
    </>
  );
};
