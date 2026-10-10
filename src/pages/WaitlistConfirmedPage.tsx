import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { loadConfirmedWaitlist } from '../services/waitlist';
import { Button } from '../components/Button';
import { SuccessIllustration } from '../components/svg/SuccessIllustration';

export const WaitlistConfirmedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const confirmed = loadConfirmedWaitlist();

  // Route Guard: Only reachable after successful verification, otherwise redirect to "/"
  if (!confirmed) {
    return <Navigate to="/" replace />;
  }

  const alreadyOnWaitlist =
    Boolean(
      (location.state as { alreadyOnWaitlist?: boolean } | null)?.alreadyOnWaitlist
    ) || confirmed.alreadyOnWaitlist;

  return (
    <main id="main-content" className="py-12 md:py-20 lg:py-28 bg-[#070f1a] text-white">
      <div className="specimen-container max-w-3xl">
        <div className="rounded-[24px] bg-[#0d1e33] border border-white/10 shadow-2xl p-8 sm:p-12 text-center text-white">
          {/* SVG Confetti + Checkmark Badge Illustration */}
          <div className="flex justify-center mb-6">
            <SuccessIllustration className="w-32 h-32 md:w-36 md:h-36" />
          </div>

          {alreadyOnWaitlist && (
            <div
              role="status"
              aria-live="polite"
              className="inline-block mb-5 px-4 py-2 rounded-[50px] bg-amber-500/20 text-amber-300 text-[13px] font-bold border border-amber-500/40"
            >
              {t(
                'আপনি ইতিমধ্যে ওয়েটলিস্টে আছেন — আপনার আসন সংরক্ষিত রয়েছে!',
                "You're already on the waitlist — your spot is reserved!"
              )}
            </div>
          )}

          {/* Big Headline */}
          <h1 className="font-display text-[32px] sm:text-[46px] font-extrabold text-white mb-3 leading-tight">
            {t('আপনি ওয়েটলিস্টে যুক্ত হয়েছেন।', "You're on the waitlist.")}
          </h1>

          <p className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#00d27a] mb-3">
            {t(
              `স্বাগতম, ${confirmed.firstName}!`,
              `Welcome aboard, ${confirmed.firstName}!`
            )}
          </p>

          <p className="text-[16px] sm:text-[18px] text-slate-300 leading-[1.55] max-w-[46ch] mx-auto mb-10">
            {t(
              'আমাদের নতুন ব্যাচের প্রস্তুতি সম্পন্ন হওয়ার সাথে সাথেই আপনার ইমেইল এবং হোয়াটসঅ্যাপে যোগাযোগ করা হবে।',
              "As soon as we're ready, we'll contact you soon on your email and WhatsApp."
            )}
          </p>

          {/* Summary Card */}
          <div className="rounded-[16px] bg-[#081424] border border-white/10 p-6 text-left max-w-xl mx-auto mb-10 text-white">
            <div className="text-[12px] font-extrabold text-[#00d27a] pb-3 mb-4 border-b border-white/10 uppercase tracking-wider">
              {t(
                'ভেরিফাইড ওয়েটলিস্ট নিবন্ধনের সংক্ষিপ্ত বিবরণ',
                'Verified Waitlist Registration Summary'
              )}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <div>
                <dt className="text-slate-400 text-[12px] font-medium">
                  {t('আবেদনকারী', 'Applicant')}
                </dt>
                <dd className="font-display text-[16px] font-extrabold text-white mt-0.5">
                  {confirmed.firstName} {confirmed.lastName}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[12px] font-medium">
                  {t('অবস্থা (Status)', 'Status')}
                </dt>
                <dd className="font-display text-[16px] font-extrabold text-[#00d27a] mt-0.5">
                  {t('ভেরিফাইড · পরবর্তী ব্যাচ', 'Verified · Pending Cohort')}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[12px] font-medium">
                  {t('ভেরিফাইড ইমেইল', 'Verified Email')}
                </dt>
                <dd className="font-semibold text-slate-200 mt-0.5 break-all">
                  {confirmed.email}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[12px] font-medium">
                  {t('হোয়াটসঅ্যাপ নম্বর', 'WhatsApp Alert Number')}
                </dt>
                <dd className="font-semibold text-slate-200 tabular-nums mt-0.5">
                  {confirmed.whatsapp}
                </dd>
              </div>
            </dl>
          </div>

          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            {t('হোমপেজে ফিরে যান', 'Back to home')}
          </Button>
        </div>
      </div>
    </main>
  );
};
