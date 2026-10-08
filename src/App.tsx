/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { LanguageProvider } from './context/LanguageContext';
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

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTopOnRouteChange />
          {/* Accessible Skip-to-Content Link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-[50px] focus:bg-[#171412] focus:text-[#fbf9ef] focus:text-[13px] focus:font-bold"
          >
            Skip to main content
          </a>

          <div className="min-h-screen flex flex-col bg-[#fbf9ef] text-[#171412] pb-16 sm:pb-0">
            <Navigation />
            <div className="flex-1">
              <Suspense
                fallback={
                  <div
                    role="status"
                    aria-live="polite"
                    className="py-24 text-center font-display text-[18px] font-bold text-[#171412]"
                  >
                    লোড হচ্ছে...
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/join" element={<JoinWaitlistPage />} />
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
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
