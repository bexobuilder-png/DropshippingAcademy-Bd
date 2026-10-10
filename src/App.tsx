/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import EduAnimation, { AnimKind } from './components/EduAnimation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { HomePage } from './pages/HomePage';

const JoinWaitlistPage = React.lazy(() =>
  import('./pages/JoinWaitlistPage').then((m) => ({ default: m.JoinWaitlistPage }))
);
const WaitlistConfirmedPage = React.lazy(() =>
  import('./pages/WaitlistConfirmedPage').then((m) => ({
    default: m.WaitlistConfirmedPage,
  }))
);
const TermsPage = React.lazy(() =>
  import('./pages/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = React.lazy(() =>
  import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
const AdminCheckPage = React.lazy(() =>
  import('./pages/AdminCheckPage').then((m) => ({ default: m.AdminCheckPage }))
);
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const ANIM_WORDS: Record<
  'bn' | 'en',
  Record<AnimKind, [string, string, string]>
> = {
  bn: {
    intro: ['শিখুন', 'তৈরি করুন', 'আয় করুন'],
    submit: ['তথ্য লিখছি', 'যাচাই করছি', 'কোড পাঠাচ্ছি'],
    success: ['ইমেইল যাচাই সম্পন্ন', 'আপনার আসন নিশ্চিত', 'স্বাগতম!'],
  },
  en: {
    intro: ['Learn', 'Build', 'Earn'],
    submit: ['Filling in', 'Checking', 'Sending code'],
    success: ['Email verified', 'Seat confirmed', 'Welcome!'],
  },
};

function ScrollToTopOnRouteChange() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Support hash-based paths like /#/check or /#/join by converting to clean routes
    if (hash && hash.startsWith('#/')) {
      const targetRoute = hash.slice(1);
      navigate(targetRoute, { replace: true });
      return;
    }
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash, navigate]);

  return null;
}

function AppShell() {
  const [anim, setAnim] = useState<null | 'intro' | 'submit' | 'success'>(null);
  const [alreadyOnWaitlist, setAlreadyOnWaitlist] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const activeKind: AnimKind = anim ?? 'intro';

  return (
    <>
      <ScrollToTopOnRouteChange />
      {/* Accessible Skip-to-Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-[50px] focus:bg-[#ff7722] focus:text-[#171412] focus:text-[13px] focus:font-bold"
      >
        Skip to main content
      </a>

      <div className="min-h-screen flex flex-col bg-[#fbf9ef] text-[#171412] pb-16 sm:pb-0 selection:bg-[#ff7722] selection:text-[#171412]">
        <Navigation setAnim={setAnim} />
        <div className="flex-1">
          <Suspense
            fallback={
              <div
                role="status"
                aria-live="polite"
                className="py-24 text-center font-display text-[18px] font-bold text-[#171412] flex items-center justify-center gap-3"
              >
                <span className="w-3 h-3 rounded-full bg-[#ff7722] animate-ping"></span>
                <span>লোড হচ্ছে...</span>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage setAnim={setAnim} />} />
              <Route
                path="/join"
                element={
                  <JoinWaitlistPage
                    setAnim={setAnim}
                    onVerifiedSuccess={(alreadyExists) => {
                      setAlreadyOnWaitlist(alreadyExists);
                      setAnim('success');
                    }}
                  />
                }
              />
              <Route path="/waitlist-confirmed" element={<WaitlistConfirmedPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/check" element={<AdminCheckPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>

      <EduAnimation
        kind={anim ?? 'intro'}
        open={anim !== null}
        autoClose={anim !== 'submit'}
        words={ANIM_WORDS[lang][activeKind]}
        skipLabel={lang === 'bn' ? 'এড়িয়ে যান' : 'Skip'}
        onDone={() => {
          const finished = anim;
          setAnim(null);
          if (finished === 'intro') {
            navigate('/join');
          } else if (finished === 'success') {
            navigate('/waitlist-confirmed', {
              replace: true,
              state: { alreadyOnWaitlist },
            });
          }
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
