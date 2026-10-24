import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentUserSession } from '../services/auth';
import { Button } from '../components/Button';

export const WelcomeCelebrationPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const session = getCurrentUserSession();

  const [countdown, setCountdown] = useState<number>(6);
  const [queuePos, setQueuePos] = useState<number>(142); // animated queue number

  useEffect(() => {
    // Count up queue position for celebration effect
    const interval = setInterval(() => {
      setQueuePos((prev) => (prev < 384 ? prev + 12 : 384));
    }, 200);

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

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [navigate]);

  return (
    <main id="main-content" className="py-16 md:py-24 bg-[#fbf9ef] text-[#171412] min-h-[85vh] flex items-center justify-center relative overflow-hidden">
      {/* Confetti floating accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-12 left-10 w-4 h-4 rounded-full bg-[#ff7722] animate-bounce" />
        <div className="absolute top-20 right-16 w-3 h-3 rounded-full bg-[#f6c974] animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-4 h-4 rounded-full bg-[#2e7d32] animate-ping" />
      </div>

      <div className="specimen-container max-w-lg w-full px-4 text-center z-10">
        <div className="rounded-[32px] bg-[#f2f0e7] border border-[#171412] p-8 sm:p-12 shadow-[8px_8px_0px_#171412] animate-fade-in">
          
          {/* Animated Seal Pop Tick */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#ff7722]/20 border border-[#ff7722] flex items-center justify-center text-[#ff7722] text-3xl font-black animate-scale-up">
            🎉
          </div>

          <span className="inline-block px-3.5 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider bg-[#ff7722] text-[#171412] mb-3 shadow-xs">
            {t('নিবন্ধন সফল হয়েছে!', 'Registration Successful!')}
          </span>

          <h1 className="font-display text-[28px] sm:text-[36px] font-extrabold text-[#171412] mb-3">
            {t(`স্বাগতম, ${session?.firstName || 'শিক্ষার্থী'}!`, `Welcome, ${session?.firstName || 'Student'}!`)}
          </h1>

          <p className="text-[15px] text-[#171412]/80 mb-6 leading-relaxed font-medium">
            {t(
              'আপনার ইমেইল সফলভাবে যাচাই হয়েছে। ড্রপশিপিং একাডেমি বিডি-তে আপনাকে আনুষ্ঠানিকভাবে স্বাগত জানানো হচ্ছে।',
              'Your email has been verified successfully. Welcome to Dropshipping Academy BD!'
            )}
          </p>

          {/* Queue Position Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#fbf9ef] border border-[#171412]/20 mb-8 shadow-xs">
            <span className="text-[12px] font-bold text-[#171412]/70">
              {t('আপনার ওয়েটলিস্ট সিরিয়াল:', 'Your Queue Position:')}
            </span>
            <span className="font-display text-[18px] font-black text-[#813502] tabular-nums">
              #{queuePos}
            </span>
          </div>

          {/* Countdown Progress Bar */}
          <div className="w-full h-2.5 bg-[#171412]/10 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-[#ff7722] transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 6) * 100}%` }}
            />
          </div>

          <Button
            variant="orange"
            size="lg"
            className="w-full justify-center text-[16px]"
            onClick={() => navigate('/dashboard', { replace: true })}
          >
            {t(`ড্যাশবোর্ডে প্রবেশ করুন (${countdown}সে) →`, `Enter Dashboard (${countdown}s) →`)}
          </Button>

        </div>
      </div>
    </main>
  );
};
