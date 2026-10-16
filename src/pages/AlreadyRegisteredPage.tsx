import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentUserSession, clearUserSession } from '../services/auth';
import { Button } from '../components/Button';

export const AlreadyRegisteredPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const session = getCurrentUserSession();

  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, navigate]);

  const handleLogoutAndRestart = async () => {
    await clearUserSession();
    navigate('/register', { replace: true });
  };

  return (
    <main id="main-content" className="py-16 md:py-24 bg-[#fbf9ef] text-[#171412] min-h-[85vh] flex items-center justify-center">
      <div className="specimen-container max-w-md w-full px-4 text-center">
        <div className="rounded-[28px] bg-[#f2f0e7] border-2 border-[#171412] p-8 sm:p-10 shadow-[6px_6px_0px_#171412]">
          
          {/* Green Tick Badge */}
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#2e7d32]/20 border-2 border-[#2e7d32] flex items-center justify-center text-[#2e7d32] text-2xl font-black">
            ✓
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#2e7d32]/15 text-[#2e7d32] mb-3">
            {t('ইতিমধ্যে নিবন্ধিত', 'Already Registered')}
          </span>

          <h1 className="font-display text-[24px] sm:text-[28px] font-extrabold text-[#171412] mb-2">
            {t('আপনি ইতিমধ্যে এই একাডেমির সদস্য!', 'You are already a member!')}
          </h1>

          <p className="text-[14px] text-[#171412]/80 mb-6 leading-relaxed font-medium">
            {t(
              `স্বাগতম ${session?.firstName || ''}! আপনি ইতিমধ্যে ড্রপশিপিং একাডেমি বিডি-তে নিবন্ধিত আছেন। আপনাকে সরাসরি ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে (${countdown} সে)...`,
              `Welcome back ${session?.firstName || ''}! You are already registered. Redirecting to your dashboard in ${countdown}s...`
            )}
          </p>

          {/* Countdown Progress Bar */}
          <div className="w-full h-2 bg-[#171412]/10 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[#ff7722] transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 4) * 100}%` }}
            />
          </div>

          <div className="space-y-3">
            <Button
              variant="orange"
              size="lg"
              className="w-full justify-center"
              onClick={() => navigate('/dashboard', { replace: true })}
            >
              {t('আমার ড্যাশবোর্ডে যান →', 'Go to My Dashboard →')}
            </Button>

            <button
              type="button"
              onClick={handleLogoutAndRestart}
              className="text-[13px] font-extrabold text-[#813502] hover:underline cursor-pointer pt-1 block mx-auto"
            >
              {t('অন্য কেউ? সাইন আউট করুন', 'Not you? Sign out')}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
};
