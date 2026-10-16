import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { sendQuickLoginOtp, verifyQuickLoginOtp, getCurrentUserSession, UserSession } from '../services/auth';
import { Button } from '../components/Button';

export const LoginPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');

  // 6-digit OTP code state
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const session = getCurrentUserSession();
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg(t('অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল বা ফোন নম্বর লিখুন।', 'Please enter your registered email or phone number.'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await sendQuickLoginOtp(identifier.trim());
      if (!res.success) {
        setErrorMsg(res.error || t('কোড পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।', 'Could not send verification code.'));
        setLoading(false);
        return;
      }

      setMaskedEmail(res.maskedEmail || 'your email');
      setTargetEmail(res.targetEmail || '');
      if (res.demoOtp) {
        setDemoOtpCode(res.demoOtp);
      }
      setStep('otp');
      setResendCountdown(30);
    } catch {
      setErrorMsg(t('নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpValues.join('');
    if (fullCode.length !== 6) {
      setErrorMsg(t('অনুগ্রহ করে ৬-ডিজিটের ভেরিফিকেশন কোড সম্পূর্ণ করুন।', 'Please complete the 6-digit verification code.'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyQuickLoginOtp(identifier.trim(), fullCode);
      if (!res.success || !res.session) {
        setErrorMsg(res.error || t('ভুল ভেরিফিকেশন কোড।', 'Invalid verification code.'));
        setLoading(false);
        return;
      }

      // Success: redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch {
      setErrorMsg(t('যাচাইকরণে ত্রুটি হয়েছে।', 'Verification error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const digit = cleaned.slice(-1);

    const nextValues = [...otpValues];
    nextValues[index] = digit;
    setOtpValues(nextValues);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpValues(pasted.split(''));
    }
  };

  return (
    <main id="main-content" className="py-12 md:py-20 bg-[#fbf9ef] text-[#171412] min-h-[85vh] flex items-center justify-center">
      <div className="specimen-container max-w-md w-full px-4">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#813502] hover:text-[#ff7722]"
          >
            ← {t('হোম পেইজে ফিরুন', 'Back to Home')}
          </Link>
        </div>

        <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-8 shadow-[4px_4px_0px_#171412]">
          
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ff7722]/20 text-[#813502] border border-[#ff7722]/40 mb-3">
              {t('পাসওয়ার্ডহীন সিকিউর লগইন', 'Passwordless Secure Login')}
            </span>
            <h1 className="font-display text-[26px] sm:text-[32px] font-extrabold text-[#171412] leading-tight">
              {step === 'identifier' ? t('আপনার ড্যাশবোর্ডে প্রবেশ করুন', 'Sign In to Dashboard') : t('৬-ডিজিট কোড যাচাই করুন', 'Enter 6-Digit Code')}
            </h1>
            <p className="text-[13px] text-[#171412]/75 mt-1.5 font-medium">
              {step === 'identifier'
                ? t('রেজিস্ট্রেশনকৃত ইমেইল বা ফোন নম্বর দিয়ে কোড নিন।', 'Enter your registered email or phone to receive a login code.')
                : t(`কোডটি পাঠানো হয়েছে: ${maskedEmail}`, `Verification code sent to: ${maskedEmail}`)}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-[14px] bg-rose-50 border-2 border-rose-300 text-rose-800 text-[13px] font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* DEMO Helper Banner if preview OTP exists */}
          {step === 'otp' && demoOtpCode && (
            <div className="mb-5 p-3 rounded-[12px] bg-amber-50 border border-amber-300 text-amber-900 text-[12px] font-semibold text-center">
              {t('প্রিভিউ টেস্ট কোড (ডমো):', 'Preview Test Code (Demo):')} <span className="font-mono font-black text-amber-950 px-1.5 py-0.5 bg-amber-200/60 rounded">123456</span>
            </div>
          )}

          {step === 'identifier' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#171412] mb-1.5">
                  {t('ইমেইল অথবা ফোন নম্বর', 'Email or Phone Number')}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com বা 017XXXXXXXX"
                  className="w-full h-12 px-4 rounded-[14px] bg-[#fbf9ef] border-2 border-[#171412]/25 text-[14px] font-semibold text-[#171412] placeholder-[#171412]/40 focus:outline-none focus:border-[#ff7722]"
                  required
                />
              </div>

              <Button type="submit" variant="orange" size="lg" className="w-full justify-center" disabled={loading}>
                {loading ? t('কোড পাঠানো হচ্ছে...', 'Sending code...') : t('ভেরিফিকেশন কোড পাঠান', 'Send Login Code')}
              </Button>

              <div className="text-center pt-3 border-t border-[#171412]/10">
                <span className="text-[13px] text-[#171412]/70 font-medium">
                  {t('একাউন্ট নেই?', 'No account yet?')}{' '}
                </span>
                <Link to="/register" className="text-[13px] font-extrabold text-[#813502] hover:underline">
                  {t('রেজিস্ট্রেশন করুন', 'Register Now')}
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-[#171412] mb-2 text-center">
                  {t('আপনার ইমেইলে প্রাপ্ত ৬-ডিজিট কোড লিখুন', 'Enter the 6-digit code received')}
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`login-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center font-display text-[20px] sm:text-[24px] font-black rounded-[12px] bg-[#fbf9ef] border-2 border-[#171412]/30 focus:border-[#ff7722] focus:bg-[#ffffff] focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" variant="orange" size="lg" className="w-full justify-center" disabled={loading}>
                {loading ? t('যাচাই করা হচ্ছে...', 'Verifying...') : t('লগইন নিশ্চিত করুন', 'Log In Now')}
              </Button>

              <div className="flex items-center justify-between text-[13px] pt-2 border-t border-[#171412]/10">
                <button
                  type="button"
                  onClick={() => setStep('identifier')}
                  className="font-bold text-[#171412]/70 hover:text-[#171412]"
                >
                  ← {t('নম্বর পরিবর্তন', 'Change')}
                </button>

                <button
                  type="button"
                  disabled={resendCountdown > 0 || loading}
                  onClick={handleSendCode}
                  className={`font-extrabold ${resendCountdown > 0 ? 'text-[#171412]/40 cursor-not-allowed' : 'text-[#813502] hover:underline cursor-pointer'}`}
                >
                  {resendCountdown > 0
                    ? t(`পুনরায় কোড (${resendCountdown}সে)`, `Resend code (${resendCountdown}s)`)
                    : t('কোড পুনরায় পাঠান', 'Resend code')}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </main>
  );
};
