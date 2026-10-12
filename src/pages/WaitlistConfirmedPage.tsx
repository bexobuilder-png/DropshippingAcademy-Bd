import React, { useState } from 'react';
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
  const [showNavOptions, setShowNavOptions] = useState(false);

  // Route Guard: Only reachable after successful verification, otherwise redirect to "/"
  if (!confirmed) {
    return <Navigate to="/" replace />;
  }

  const alreadyOnWaitlist =
    Boolean(
      (location.state as { alreadyOnWaitlist?: boolean } | null)?.alreadyOnWaitlist
    ) || confirmed.alreadyOnWaitlist;

  return (
    <main id="main-content" className="py-12 md:py-20 lg:py-28 bg-[#fbf9ef] text-[#171412]">
      <div className="specimen-container max-w-3xl">
        <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] shadow-md p-8 sm:p-12 text-center text-[#171412]">
          {/* SVG Confetti + Checkmark Badge Illustration */}
          <div className="flex justify-center mb-6">
            <SuccessIllustration className="w-32 h-32 md:w-36 md:h-36" />
          </div>

          {alreadyOnWaitlist && (
            <div
              role="status"
              aria-live="polite"
              className="inline-block mb-5 px-4 py-2 rounded-[50px] bg-[#ffc765]/50 text-[#171412] text-[13px] font-bold border border-[#171412]"
            >
              {t(
                'আপনি ইতিমধ্যে ওয়েটলিস্টে আছেন — আপনার আসন সংরক্ষিত রয়েছে!',
                "You're already on the waitlist — your spot is reserved!"
              )}
            </div>
          )}

          {/* Big Headline */}
          <h1 className="font-display text-[32px] sm:text-[46px] font-extrabold text-[#171412] mb-3 leading-tight">
            {t('আপনি ওয়েটলিস্টে যুক্ত হয়েছেন।', "You're on the waitlist.")}
          </h1>

          <p className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#ff7722] mb-3">
            {t(
              `স্বাগতম, ${confirmed.firstName}!`,
              `Welcome aboard, ${confirmed.firstName}!`
            )}
          </p>

          <p className="text-[16px] sm:text-[18px] text-[#171412]/80 leading-[1.55] max-w-[46ch] mx-auto mb-10">
            {t(
              'আমাদের নতুন ব্যাচের প্রস্তুতি সম্পন্ন হওয়ার সাথে সাথেই আপনার ইমেইল এবং হোয়াটসঅ্যাপে যোগাযোগ করা হবে।',
              "As soon as we're ready, we'll contact you soon on your email and WhatsApp."
            )}
          </p>

          {/* Summary Card */}
          <div className="rounded-[16px] bg-[#fbf9ef] border border-[#171412]/25 p-6 text-left max-w-xl mx-auto mb-10 text-[#171412]">
            <div className="text-[12px] font-extrabold text-[#813502] pb-3 mb-4 border-b border-[#171412]/15 uppercase tracking-wider">
              {t(
                'ভেরিফাইড ওয়েটলিস্ট নিবন্ধনের সংক্ষিপ্ত বিবরণ',
                'Verified Waitlist Registration Summary'
              )}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <div>
                <dt className="text-[#171412]/70 text-[12px] font-medium">
                  {t('আবেদনকারী', 'Applicant')}
                </dt>
                <dd className="font-display text-[16px] font-extrabold text-[#171412] mt-0.5">
                  {confirmed.firstName} {confirmed.lastName}
                </dd>
              </div>

              <div>
                <dt className="text-[#171412]/70 text-[12px] font-medium">
                  {t('অবস্থা (Status)', 'Status')}
                </dt>
                <dd className="font-display text-[16px] font-extrabold text-[#ff7722] mt-0.5">
                  {t('ভেরিফাইড · পরবর্তী ব্যাচ', 'Verified · Pending Cohort')}
                </dd>
              </div>

              <div>
                <dt className="text-[#171412]/70 text-[12px] font-medium">
                  {t('ভেরিফাইড ইমেইল', 'Verified Email')}
                </dt>
                <dd className="font-semibold text-[#171412] mt-0.5 break-all">
                  {confirmed.email}
                </dd>
              </div>

              <div>
                <dt className="text-[#171412]/70 text-[12px] font-medium">
                  {t('হোয়াটসঅ্যাপ নম্বর', 'WhatsApp Alert Number')}
                </dt>
                <dd className="font-semibold text-[#171412] tabular-nums mt-0.5">
                  {confirmed.whatsapp}
                </dd>
              </div>
            </dl>
          </div>

          {/* Targeted Button: Marked by user */}
          <Button
            variant="orange"
            size="lg"
            onClick={() => setShowNavOptions(true)}
            aria-haspopup="dialog"
            aria-expanded={showNavOptions}
          >
            {t('হোমপেজে ফিরে যান', 'Back to home')}
          </Button>

          {/* Quick Choice Cards directly beneath button */}
          <div className="mt-8 pt-8 border-t border-[#171412]/15 max-w-xl mx-auto">
            <div className="text-[13px] font-bold text-[#813502] mb-4">
              {t('বা সরাসরি যেকোনো অপশনে যান:', 'Or jump directly to an option:')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="p-4 rounded-[14px] bg-[#fbf9ef] hover:bg-[#fff] border-2 border-[#171412] transition-all hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-display text-[16px] font-bold text-[#171412]">
                  <span>🏠</span>
                  <span className="group-hover:text-[#ff7722] transition-colors">
                    {t('হোমপেজ', 'Home Page')}
                  </span>
                </div>
                <p className="text-[12px] text-[#171412]/75 mt-1 leading-snug">
                  {t(
                    'কোর্সে ভর্তির লাইভ আপডেট, ব্যাচ নোটিশ ও একাডেমি দেখুন।',
                    'See your live enrollment update and batch notices.'
                  )}
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="p-4 rounded-[14px] bg-[#ffc765]/35 hover:bg-[#ffc765]/60 border-2 border-[#171412] transition-all hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-display text-[16px] font-bold text-[#171412]">
                  <span>👤</span>
                  <span className="group-hover:text-[#813502] transition-colors">
                    {t('আমার প্রোফাইল', 'My Profile')}
                  </span>
                </div>
                <p className="text-[12px] text-[#171412]/75 mt-1 leading-snug">
                  {t(
                    'প্রোফাইল তথ্য, ছবি এবং সার্টিফিকেট দেখুন ও ডাউনলোড করুন।',
                    'View info, avatar, and download certificate to gallery.'
                  )}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Options Modal triggered when clicking "হোমপেজে ফিরে যান" */}
      {showNavOptions && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="nav-options-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171412]/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowNavOptions(false)}
        >
          <div
            className="w-full max-w-lg rounded-[24px] bg-[#fbf9ef] border-3 border-[#171412] p-6 sm:p-8 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#171412]/15 mb-5">
              <div>
                <span className="text-[11px] font-extrabold text-[#813502] uppercase tracking-wider">
                  {t('পরবর্তী পদক্ষেপ বেছে নিন', 'Choose Next Step')}
                </span>
                <h3
                  id="nav-options-title"
                  className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#171412]"
                >
                  {t('আপনি কোথায় যেতে চান?', 'Where would you like to go?')}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowNavOptions(false)}
                className="w-9 h-9 rounded-full bg-[#f2f0e7] border border-[#171412]/20 flex items-center justify-center text-[#171412] hover:bg-[#ff7722] transition-colors cursor-pointer"
                aria-label={t('বন্ধ করুন', 'Close')}
              >
                ✕
              </button>
            </div>

            <p className="text-[14px] text-[#171412]/80 mb-6">
              {t(
                'আপনার আসন নিশ্চিত হয়েছে। আপনি হোম পেজে গিয়ে কোর্সে ভর্তির আপডেট দেখতে পারেন অথবা আপনার শিক্ষার্থী প্রোফাইলে গিয়ে তথ্য, ছবি ও সার্টিফিকেট দেখতে পারেন।',
                'Your registration is confirmed. You can head to the Home Page to see your course update, or go to your Student Profile to manage info, avatar photo, and download certificates.'
              )}
            </p>

            <div className="flex flex-col gap-3.5 mb-6">
              {/* Option 1: Home Page */}
              <button
                type="button"
                onClick={() => {
                  setShowNavOptions(false);
                  navigate('/');
                }}
                className="w-full p-4 rounded-[16px] bg-[#f2f0e7] hover:bg-[#ffc765]/40 border-2 border-[#171412] flex items-center justify-between gap-4 transition-all hover:scale-[1.01] cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#ff7722] border border-[#171412] flex items-center justify-center text-[22px] shrink-0">
                    🏠
                  </div>
                  <div>
                    <div className="font-display text-[16px] font-extrabold text-[#171412]">
                      {t('হোম পেজ (Home Page)', 'Home Page')}
                    </div>
                    <div className="text-[12px] text-[#171412]/75 mt-0.5">
                      {t(
                        'কোর্সে ভর্তির লাইভ আপডেট ও ব্যাচ কারিকুলাম দেখুন',
                        'View live course enrollment update and cohort curriculum'
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-[#171412] text-[18px]">→</span>
              </button>

              {/* Option 2: Profile */}
              <button
                type="button"
                onClick={() => {
                  setShowNavOptions(false);
                  navigate('/profile');
                }}
                className="w-full p-4 rounded-[16px] bg-[#ff7722]/15 hover:bg-[#ff7722]/30 border-2 border-[#171412] flex items-center justify-between gap-4 transition-all hover:scale-[1.01] cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#813502] text-[#fbf9ef] border border-[#171412] flex items-center justify-center text-[22px] shrink-0">
                    👤
                  </div>
                  <div>
                    <div className="font-display text-[16px] font-extrabold text-[#171412]">
                      {t('আমার প্রোফাইল (My Profile)', 'My Profile')}
                    </div>
                    <div className="text-[12px] text-[#171412]/75 mt-0.5">
                      {t(
                        'প্রোফাইল তথ্য, ছবি এবং সার্টিফিকেট ডাউনলোড অপশন',
                        'View personal details, photo avatar, and certificate download'
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-[#813502] text-[18px]">→</span>
              </button>
            </div>

            <div className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNavOptions(false)}
              >
                {t('বন্ধ করুন', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

