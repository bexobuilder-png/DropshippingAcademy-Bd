import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  sendQuickLoginOtp,
  verifyQuickLoginOtp,
  getCurrentUserSession,
  UserSession,
} from '../services/auth';
import { Button } from './Button';
import { Input } from './Input';
import { OtpInput } from './OtpInput';
import { AlertCircleSvgIcon } from './svg/NavIcons';

interface AuthGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (session: UserSession) => void;
  message?: string;
  redirectTo?: string;
}

export const AuthGuardModal: React.FC<AuthGuardModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  message,
  redirectTo = '/join',
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mode: 'register_prompt' | 'quick_login'
  const [mode, setMode] = useState<'prompt' | 'login'>('prompt');
  const [identifier, setIdentifier] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  if (!isOpen) return null;

  const handleGoToRegister = () => {
    onClose();
    navigate(redirectTo);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setNoticeMsg('');

    const clean = identifier.trim();
    if (!clean) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে আপনার নিবন্ধিত ফোন নম্বর বা ইমেইল লিখুন।',
          'Please enter your registered phone number or email.'
        )
      );
      return;
    }

    setIsLoading(true);
    const result = await sendQuickLoginOtp(clean);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(
        result.error ||
          t('আবেদনকারী পাওয়া যায়নি।', 'Applicant record not found.')
      );
      return;
    }

    setLoginStep(2);
    setNoticeMsg(
      result.demoOtp
        ? t(
            `ভেরিফিকেশন কোড পাঠানো হয়েছে! (টেস্ট কোড: ${result.demoOtp})`,
            `Verification code sent! (Test Code: ${result.demoOtp})`
          )
        : t(
            'আপনার ইমেইলে ৬-ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।',
            'A 6-digit verification code has been sent to your email.'
          )
    );
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpToken.length !== 6) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে ৬-ডিজিটের কোড সম্পূর্ণ করুন।',
          'Please enter all 6 digits of the code.'
        )
      );
      return;
    }

    setIsLoading(true);
    const result = await verifyQuickLoginOtp(identifier, otpToken);
    setIsLoading(false);

    if (!result.success || !result.session) {
      setErrorMsg(result.error || t('ভুল ভেরিফিকেশন কোড।', 'Invalid verification code.'));
      return;
    }

    if (onAuthenticated) {
      onAuthenticated(result.session);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-guard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-[#fbf9ef] border-2 border-[#171412] p-6 sm:p-8 shadow-2xl text-[#171412] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('বন্ধ করুন', 'Close')}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f2f0e7] hover:bg-[#e5e2d6] border border-[#171412]/20 flex items-center justify-center text-[#171412] cursor-pointer"
        >
          ✕
        </button>

        {mode === 'prompt' ? (
          <div className="flex flex-col items-center text-center">
            {/* Lock / Security Icon */}
            <div className="w-16 h-16 rounded-full bg-[#ff7722]/15 border-2 border-[#ff7722] flex items-center justify-center text-[#813502] mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h3
              id="auth-guard-modal-title"
              className="font-display text-[20px] sm:text-[22px] font-extrabold text-[#171412] mb-2 leading-tight"
            >
              {t(
                'নিবন্ধিত সদস্যদের জন্য সংরক্ষিত',
                'Reserved for Registered Members'
              )}
            </h3>

            <p className="text-[14px] text-[#171412]/80 leading-relaxed mb-6">
              {message ||
                t(
                  'To access this information, you must register first.',
                  'To access this information, you must register first.'
                )}
            </p>

            {/* Primary Action: Go to Registration */}
            <button
              type="button"
              onClick={handleGoToRegister}
              className="w-full min-h-[48px] px-6 rounded-full bg-[#ff7722] hover:bg-[#e56310] text-[#171412] border-2 border-[#171412] font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mb-3"
            >
              <span>{t('রেজিস্ট্রেশন করুন', 'Register Now')}</span>
              <span>→</span>
            </button>

            {/* Returning applicant sign in button */}
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setNoticeMsg('');
                setMode('login');
              }}
              className="text-[13px] font-bold text-[#813502] hover:underline cursor-pointer py-1"
            >
              {t(
                'ইতিমধ্যে নিবন্ধিত? দ্রুত সাইন ইন করুন',
                'Already registered? Sign in'
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('prompt');
                  setLoginStep(1);
                  setErrorMsg('');
                }}
                className="text-[13px] font-bold text-[#813502] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                ← {t('পেছনে', 'Back')}
              </button>
            </div>

            <h3
              id="auth-guard-modal-title"
              className="font-display text-[20px] font-extrabold text-[#171412] mb-2"
            >
              {loginStep === 1
                ? t('দ্রুত সাইন ইন', 'Quick Sign In')
                : t('ভেরিফিকেশন কোড', 'Verification Code')}
            </h3>

            <p className="text-[13px] text-[#171412]/80 mb-5">
              {loginStep === 1
                ? t(
                    'রেজিস্ট্রেশনের সময় ব্যবহৃত ফোন নম্বর বা ইমেইল দিন।',
                    'Enter your phone number or email used during registration.'
                  )
                : t(
                    '৬-ডিজিটের ভেরিফিকেশন কোডটি নিচে লিখুন।',
                    'Enter the 6-digit verification code below.'
                  )}
            </p>

            {errorMsg && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-[13px] font-medium flex items-center gap-2"
              >
                <AlertCircleSvgIcon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {noticeMsg && (
              <div
                role="status"
                className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[13px] font-medium"
              >
                {noticeMsg}
              </div>
            )}

            {loginStep === 1 ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <Input
                  id="guard-identifier"
                  label={t('ফোন নম্বর অথবা ইমেইল', 'Phone number or Email')}
                  placeholder={t('যেমন: 01700000000 বা name@gmail.com', 'e.g. 01700000000 or email')}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[44px] h-11 px-4 rounded-xl bg-[#171412] hover:bg-[#813502] text-[#fbf9ef] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading
                    ? t('যাচাই হচ্ছে...', 'Checking...')
                    : t('কোড পাঠান →', 'Send Code →')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <OtpInput
                  value={otpToken}
                  onChange={setOtpToken}
                  error={errorMsg}
                />
                <button
                  type="submit"
                  disabled={isLoading || otpToken.length !== 6}
                  className="w-full min-h-[44px] h-11 px-4 rounded-xl bg-[#ff7722] hover:bg-[#e56310] text-[#171412] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading
                    ? t('ভেরিফাই হচ্ছে...', 'Verifying...')
                    : t('সাইন ইন নিশ্চিত করুন', 'Confirm Sign In')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AuthGuard: React.FC<{
  children: React.ReactNode;
  fallbackMessage?: string;
}> = ({ children, fallbackMessage }) => {
  const [session, setSession] = useState<UserSession | null>(() =>
    getCurrentUserSession()
  );
  const [showModal, setShowModal] = useState<boolean>(!session);

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[#fbf9ef]">
        <AuthGuardModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAuthenticated={(newSession) => setSession(newSession)}
          message={fallbackMessage}
        />
        <div className="text-center p-8 rounded-2xl bg-[#f2f0e7] border-2 border-[#171412] max-w-md">
          <p className="text-[15px] font-bold text-[#171412] mb-4">
            {fallbackMessage || 'To access this information, you must register first.'}
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 rounded-full bg-[#ff7722] text-[#171412] border border-[#171412] font-bold text-[14px] cursor-pointer"
          >
            সাইন ইন অথবা রেজিস্ট্রেশন করুন
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
