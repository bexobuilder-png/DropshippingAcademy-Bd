/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom';
import EduAnimation, { AnimKind } from './components/EduAnimation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { HomePage } from './pages/HomePage';
import { JoinWaitlistPage } from './pages/JoinWaitlistPage';
import { WaitlistConfirmedPage } from './pages/WaitlistConfirmedPage';
import { getCurrentUserSession, subscribeToAuthSession, UserSession } from './services/auth';

const TermsPage = React.lazy(() =>
  import('./pages/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = React.lazy(() =>
  import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
const ContactPage = React.lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const AdminCheckPage = React.lazy(() =>
  import('./pages/AdminCheckPage').then((m) => ({ default: m.AdminCheckPage }))
);
const ProfilePage = React.lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const WaitlistPage = React.lazy(() =>
  import('./pages/WaitlistPage').then((m) => ({ default: m.WaitlistPage }))
);
const LoginPage = React.lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const AlreadyRegisteredPage = React.lazy(() =>
  import('./pages/AlreadyRegisteredPage').then((m) => ({ default: m.AlreadyRegisteredPage }))
);
const WelcomeCelebrationPage = React.lazy(() =>
  import('./pages/WelcomeCelebrationPage').then((m) => ({ default: m.WelcomeCelebrationPage }))
);
const RegistrationPage = React.lazy(() =>
  import('./pages/RegistrationPage').then((m) => ({ default: m.RegistrationPage }))
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

/**
 * Guard for public/auth routes when user is already logged in.
 */
function LoggedInGuard({ children }: { children: React.ReactNode }) {
  const session = getCurrentUserSession();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (session && location.pathname === '/') {
      const shown = sessionStorage.getItem('da_welcome_splash_shown');
      if (!shown) {
        setShowSplash(true);
        sessionStorage.setItem('da_welcome_splash_shown', 'true');
        const t = setTimeout(() => setShowSplash(false), 1200);
        return () => clearTimeout(t);
      }
    }
  }, [session, location.pathname]);

  if (session) {
    if (location.pathname === '/register' || location.pathname === '/join' || location.pathname === '/already-registered') {
      return <AlreadyRegisteredPage />;
    }
    if (location.pathname === '/' || location.pathname === '/login') {
      if (showSplash) {
        return (
          <div className="fixed inset-0 z-50 bg-[#fbf9ef] flex items-center justify-center p-4">
            <div className="rounded-2xl bg-[#f2f0e7] border-2 border-[#171412] p-8 text-center shadow-lg animate-fade-in">
              <span className="text-3xl mb-2 block">👋</span>
              <h2 className="font-display text-[22px] font-extrabold text-[#171412]">
                স্বাগতম ফিরে আসার জন্য, {session.firstName}!
              </h2>
              <p className="text-[13px] text-[#171412]/75 mt-1">আপনার ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...</p>
            </div>
          </div>
        );
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

/**
 * Guard for protected member routes.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = getCurrentUserSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppShell() {
  const [anim, setAnim] = useState<null | 'intro' | 'submit' | 'success'>(null);
  const [animRunKey, setAnimRunKey] = useState(0);
  const [joinResetKey, setJoinResetKey] = useState(0);
  const [alreadyOnWaitlist, setAlreadyOnWaitlist] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const activeKind: AnimKind = anim ?? 'intro';

  const triggerRegister = useCallback(() => {
    setAnim('intro');
  }, [setAnim]);

  return (
    <>
      <ScrollToTopOnRouteChange />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-[50px] focus:bg-[#ff7722] focus:text-[#171412] focus:text-[13px] focus:font-bold"
      >
        Skip to main content
      </a>

      <div className="min-h-screen flex flex-col bg-[#fbf9ef] text-[#171412] pb-16 sm:pb-0 selection:bg-[#ff7722] selection:text-[#171412]">
        <Navigation setAnim={setAnim} onRegisterClick={triggerRegister} />
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
              <Route
                path="/"
                element={
                  <LoggedInGuard>
                    <HomePage
                      setAnim={setAnim}
                      onRegisterClick={triggerRegister}
                    />
                  </LoggedInGuard>
                }
              />
              <Route
                path="/courses"
                element={
                  <LoggedInGuard>
                    <RegistrationPage setAnim={setAnim} setAnimRunKey={setAnimRunKey} />
                  </LoggedInGuard>
                }
              />
              <Route
                path="/registration"
                element={
                  <LoggedInGuard>
                    <RegistrationPage setAnim={setAnim} setAnimRunKey={setAnimRunKey} />
                  </LoggedInGuard>
                }
              />
              <Route path="/admin" element={<Navigate to="/check" replace />} />
              <Route
                path="/join"
                element={
                  <LoggedInGuard>
                    <JoinWaitlistPage
                      key={joinResetKey}
                      setAnim={setAnim}
                      onVerifiedSuccess={(alreadyExists) => {
                        setAlreadyOnWaitlist(alreadyExists);
                        setAnimRunKey((k) => k + 1);
                        setAnim('success');
                      }}
                    />
                  </LoggedInGuard>
                }
              />
              <Route
                path="/register"
                element={
                  <LoggedInGuard>
                    <RegistrationPage setAnim={setAnim} setAnimRunKey={setAnimRunKey} />
                  </LoggedInGuard>
                }
              />
              <Route path="/waitlist-confirmed" element={<WaitlistConfirmedPage />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
              <Route
                path="/login"
                element={
                  <LoggedInGuard>
                    <LoginPage />
                  </LoggedInGuard>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/welcome"
                element={
                  <ProtectedRoute>
                    <WelcomeCelebrationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/already-registered"
                element={
                  <ProtectedRoute>
                    <AlreadyRegisteredPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/check" element={<AdminCheckPage />} />
              <Route
                path="*"
                element={<NotFoundPage onRegisterClick={triggerRegister} />}
              />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>

      <EduAnimation
        kind={anim ?? 'intro'}
        open={anim !== null}
        autoClose={anim !== 'submit'}
        runKey={animRunKey}
        words={ANIM_WORDS[lang][activeKind]}
        skipLabel={lang === 'bn' ? 'এড়িয়ে যান' : 'Skip'}
        onDone={() => {
          const finished = anim;
          setAnim(null);
          if (finished === 'intro') {
            setJoinResetKey((k) => k + 1);
            // If we are not already on registration or courses page, go there
            if (!window.location.pathname.includes('/registration') && !window.location.pathname.includes('/courses')) {
              navigate('/registration');
            }
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          } else if (finished === 'success') {
            // Success animation can lead to welcome or dashboard
            // But usually the page handles its own state change after animation
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
