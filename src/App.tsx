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

const LoginPage = React.lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegistrationPage = React.lazy(() =>
  import('./pages/RegistrationPage').then((m) => ({ default: m.RegistrationPage }))
);
const ProfilePage = React.lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
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
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const MyCoursesPage = React.lazy(() =>
  import('./pages/MyCoursesPage').then((m) => ({ default: m.MyCoursesPage }))
);
const CertificatePage = React.lazy(() =>
  import('./pages/CertificatePage').then((m) => ({ default: m.CertificatePage }))
);
const CourseDetailsPage = React.lazy(() =>
  import('./pages/CourseDetailsPage').then((m) => ({ default: m.CourseDetailsPage }))
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

  if (session) {
    if (location.pathname === '/register' || location.pathname === '/login' || location.pathname === '/registration') {
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
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const activeKind: AnimKind = anim ?? 'intro';

  const triggerRegister = useCallback(() => {
    setAnimRunKey((k) => k + 1);
    setAnim('intro');
  }, [setAnim, setAnimRunKey]);

  return (
    <>
      <ScrollToTopOnRouteChange />
      <div className="min-h-screen flex flex-col bg-white text-[#171412] pb-16 sm:pb-0 selection:bg-[#059669] selection:text-white">
        <Navigation />
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="py-24 text-center flex items-center justify-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#006837] animate-ping"></span>
                <span className="font-bold">লোড হচ্ছে...</span>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage setAnim={setAnim} onRegisterClick={triggerRegister} />} />
              <Route path="/login" element={<LoggedInGuard><LoginPage /></LoggedInGuard>} />
              <Route path="/register" element={<LoggedInGuard><RegistrationPage setAnim={setAnim} setAnimRunKey={setAnimRunKey} /></LoggedInGuard>} />
              <Route path="/registration" element={<LoggedInGuard><RegistrationPage setAnim={setAnim} setAnimRunKey={setAnimRunKey} /></LoggedInGuard>} />
              
              <Route path="/dashboard" element={<ProtectedRoute><HomePage setAnim={setAnim} /></ProtectedRoute>} />
              <Route path="/course/:id" element={<CourseDetailsPage />} />
              <Route path="/my-courses" element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />
              <Route path="/certificates" element={<ProtectedRoute><CertificatePage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/check" element={<AdminCheckPage />} />
              <Route path="*" element={<NotFoundPage onRegisterClick={triggerRegister} />} />
            </Routes>
          </Suspense>
        </div>
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
            if (!window.location.pathname.includes('/registration')) {
              navigate('/registration');
            }
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
