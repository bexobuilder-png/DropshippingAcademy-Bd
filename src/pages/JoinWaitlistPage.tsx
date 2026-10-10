import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  otpSchema,
  waitlistStep1Schema,
  WaitlistFormValues,
} from '../schemas/waitlist';
import {
  consumeHeroEmailPrefill,
  loadWaitlistDraft,
  maskEmailAddress,
  saveWaitlistDraft,
  sendEmailVerificationOtp,
  verifyEmailOtpAndInsertWaitlist,
} from '../services/waitlist';
import { Button } from '../components/Button';
import { DatePicker } from '../components/DatePicker';
import type { AnimKind } from '../components/EduAnimation';
import { Input } from '../components/Input';
import { OtpInput } from '../components/OtpInput';
import { PhoneInput } from '../components/PhoneInput';
import {
  AlertCircleSvgIcon,
  ArrowRightSvgIcon,
  CheckSvgIcon,
} from '../components/svg/NavIcons';

const INITIAL_VALUES: WaitlistFormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  whatsapp: '',
  sameAsPhone: false,
  email: '',
  consentAccepted: false,
  honeypot: '',
};

export interface JoinWaitlistPageProps {
  setAnim: React.Dispatch<React.SetStateAction<null | AnimKind>>;
  onVerifiedSuccess: (alreadyOnWaitlist: boolean) => void;
}

export const JoinWaitlistPage: React.FC<JoinWaitlistPageProps> = ({
  setAnim,
  onVerifiedSuccess,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<WaitlistFormValues>(() => {
    const saved = loadWaitlistDraft();
    const heroEmail = consumeHeroEmailPrefill();
    if (saved) {
      return {
        ...saved,
        email: heroEmail || saved.email,
      };
    }
    return {
      ...INITIAL_VALUES,
      email: heroEmail || '',
    };
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof WaitlistFormValues, string>>
  >({});
  const [step1GlobalError, setStep1GlobalError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Step 2 state
  const [otpToken, setOtpToken] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpStatusMsg, setOtpStatusMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    saveWaitlistDraft(formData);
  }, [formData]);

  useEffect(() => {
    if (formData.sameAsPhone && formData.whatsapp !== formData.phone) {
      setFormData((prev) => ({
        ...prev,
        whatsapp: prev.phone,
      }));
    }
  }, [formData.sameAsPhone, formData.phone]);

  useEffect(() => {
    if (step !== 2 || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const updateField = <K extends keyof WaitlistFormValues>(
    field: K,
    value: WaitlistFormValues[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (step1GlobalError) setStep1GlobalError('');
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingOtp) return;

    setStep1GlobalError('');
    const effectiveData: WaitlistFormValues = {
      ...formData,
      whatsapp: formData.sameAsPhone ? formData.phone : formData.whatsapp,
    };

    const parsed = waitlistStep1Schema.safeParse(effectiveData);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof WaitlistFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof WaitlistFormValues | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSendingOtp(true);
    setAnim('submit');

    let timerId = 0;
    let resolveTimer: () => void = () => {};
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const timerPromise = new Promise<void>((resolve) => {
      resolveTimer = resolve;
      timerId = window.setTimeout(resolve, reduce ? 700 : 3600);
    });

    const apiPromise = sendEmailVerificationOtp(
      parsed.data.email,
      parsed.data.honeypot
    ).then(
      (res) => {
        if (!res.success) {
          window.clearTimeout(timerId);
          setAnim(null);
          resolveTimer();
        }
        return res;
      },
      () => {
        window.clearTimeout(timerId);
        setAnim(null);
        resolveTimer();
        return {
          success: false as const,
          error: t(
            'ভেরিফিকেশন কোড পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।',
            'Could not send verification code. Please try again.'
          ),
        };
      }
    );

    const [, result] = await Promise.all([timerPromise, apiPromise]);

    setIsSendingOtp(false);
    setAnim(null);

    if (!result.success) {
      const errMessage =
        result.error ||
        t(
          'ভেরিফিকেশন কোড পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।',
          'Could not send verification code. Please try again.'
        );
      setFieldErrors((prev) => ({ ...prev, email: errMessage }));
      setStep1GlobalError(errMessage);
      return;
    }

    setFormData(parsed.data);
    saveWaitlistDraft(parsed.data);
    setOtpToken('');
    setOtpError('');
    setOtpStatusMsg('');
    setResendCooldown(60);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;

    setOtpError('');
    setOtpStatusMsg('');

    const parsedOtp = otpSchema.safeParse({ token: otpToken });
    if (!parsedOtp.success) {
      setOtpError(
        t(
          'অনুগ্রহ করে আপনার ইমেইলে পাঠানো ৬-ডিজিটের কোডটি লিখুন।',
          'Please enter all 6 digits of your verification code.'
        )
      );
      return;
    }

    setIsVerifying(true);
    const result = await verifyEmailOtpAndInsertWaitlist(
      parsedOtp.data.token,
      formData
    );
    setIsVerifying(false);

    if (!result.success) {
      setOtpError(
        result.error ||
          t(
            'ভুল বা মেয়াদোত্তীর্ণ কোড। অনুগ্রহ করে আবার যাচাই করুন।',
            'Invalid or expired code. Please check your email and try again.'
          )
      );
      return;
    }

    onVerifiedSuccess(Boolean(result.alreadyOnWaitlist));
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;

    setOtpError('');
    setOtpStatusMsg('');
    setIsResending(true);

    const result = await sendEmailVerificationOtp(
      formData.email,
      formData.honeypot
    );
    setIsResending(false);

    if (!result.success) {
      setOtpError(
        result.error ||
          t(
            'এই মুহূর্তে কোডটি পুনরায় পাঠানো যাচ্ছে না। কিছুক্ষণ পর চেষ্টা করুন।',
            'Unable to resend code right now. Please wait a moment.'
          )
      );
      return;
    }

    setResendCooldown(60);
    setOtpStatusMsg(
      t(
        'আপনার ইমেইলে নতুন একটি ৬-ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।',
        'A fresh 6-digit verification code has been sent to your email.'
      )
    );
  };

  return (
    <main id="main-content" className="py-10 md:py-16 lg:py-20 bg-[#fbf9ef] text-[#171412]">
      <div className="specimen-container max-w-3xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 text-[13px] font-bold text-[#813502] mb-3">
            <span>{t('ওয়েটলিস্ট নিবন্ধন', 'Waitlist Application')}</span>
            <span aria-live="polite" className="tabular-nums font-extrabold">
              {t(`ধাপ ${step} / ২`, `Step ${step} of 2`)}
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={2}
            aria-label={`Step ${step} of 2`}
            className="w-full h-2 rounded-full bg-[#f2f0e7] overflow-hidden border border-[#171412]/20"
          >
            <div
              className={`h-full bg-[#ff7722] transition-all duration-300 ${
                step === 1 ? 'w-1/2' : 'w-full'
              }`}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] shadow-md p-6 sm:p-10 text-[#171412]">
          {step === 1 ? (
            <>
              <h1 className="font-display text-[32px] sm:text-[44px] font-extrabold text-[#171412] leading-[1.05] tracking-[-0.03em] mb-3">
                {t('ওয়েটলিস্টে যুক্ত হোন।', 'Join the waitlist.')}
              </h1>
              <p className="text-[15px] sm:text-[16px] text-[#171412]/80 leading-[1.6] mb-8">
                {t(
                  'নিচে আপনার সঠিক তথ্য দিন। আপনার আসন নিশ্চিত করতে আমরা আপনার ইমেইলে একটি ৬-ডিজিটের ভেরিফিকেশন কোড পাঠাবো।',
                  'Enter your contact details below. We will send a 6-digit verification code to your email to lock in your spot.'
                )}
              </p>

              {step1GlobalError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-6 p-4 rounded-[12px] bg-[#fff8f8] border-2 border-[#ff3c34] text-[#ff3c34] text-[14px] font-semibold flex items-start gap-2.5"
                >
                  <AlertCircleSvgIcon className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{step1GlobalError}</span>
                </div>
              )}

              <form onSubmit={handleStep1Submit} noValidate className="flex flex-col gap-6">
                {/* Hidden Honeypot Field */}
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="website_url">Website URL (Leave blank)</label>
                  <input
                    id="website_url"
                    name="website_url"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.honeypot || ''}
                    onChange={(e) => updateField('honeypot', e.target.value)}
                  />
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    id="firstName"
                    label={t('নামের প্রথম অংশ (First Name)', 'First name')}
                    required
                    autoComplete="given-name"
                    placeholder={t('যেমন: তানভীর', 'e.g. Tanvir')}
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    error={fieldErrors.firstName}
                  />

                  <Input
                    id="lastName"
                    label={t('নামের শেষ অংশ (Last Name)', 'Last name')}
                    required
                    autoComplete="family-name"
                    placeholder={t('যেমন: হাসান', 'e.g. Hasan')}
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    error={fieldErrors.lastName}
                  />
                </div>

                {/* Date of Birth */}
                <DatePicker
                  id="dateOfBirth"
                  label={t('জন্ম তারিখ (Date of Birth)', 'Date of birth')}
                  required
                  hint={t(
                    'DD/MM/YYYY ফরম্যাটে লিখুন অথবা ক্যালেন্ডার থেকে বাছাই করুন। বয়স ন্যূনতম ১৮ বছর হতে হবে।',
                    'Type DD/MM/YYYY or use the calendar picker. You must be at least 18 years old.'
                  )}
                  value={formData.dateOfBirth}
                  onChange={(iso) => updateField('dateOfBirth', iso)}
                  error={fieldErrors.dateOfBirth}
                />

                {/* Phone Number */}
                <PhoneInput
                  id="phone"
                  label={t('ফোন নম্বর (Phone Number)', 'Phone number')}
                  required
                  hint={t(
                    'আপনার দেশের কোড সিলেক্ট করে সচল মোবাইল নম্বর দিন।',
                    'Select your country code and enter your mobile number.'
                  )}
                  value={formData.phone}
                  onChange={(e164) => updateField('phone', e164)}
                  error={fieldErrors.phone}
                />

                {/* WhatsApp Number */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-[#813502]">
                      {t(
                        'নতুন ব্যাচের আপডেট হোয়াটসঅ্যাপে পাঠানো হবে',
                        'We send cohort opening alerts via WhatsApp'
                      )}
                    </span>

                    <label
                      htmlFor="sameAsPhone"
                      className="min-h-[44px] inline-flex items-center gap-2.5 text-[14px] font-bold text-[#171412] cursor-pointer select-none"
                    >
                      <input
                        id="sameAsPhone"
                        type="checkbox"
                        checked={formData.sameAsPhone}
                        onChange={(e) =>
                          updateField('sameAsPhone', e.target.checked)
                        }
                        className="w-5 h-5 rounded-[4px] accent-[#ff7722] cursor-pointer"
                      />
                      <span>
                        {t('ফোন নম্বরের মতোই', 'Same as phone number')}
                      </span>
                    </label>
                  </div>

                  <PhoneInput
                    id="whatsapp"
                    label={t('হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)', 'WhatsApp number')}
                    required
                    disabled={formData.sameAsPhone}
                    value={formData.sameAsPhone ? formData.phone : formData.whatsapp}
                    onChange={(e164) => updateField('whatsapp', e164)}
                    error={fieldErrors.whatsapp}
                  />
                </div>

                {/* Email Address */}
                <Input
                  id="email"
                  label={t('ইমেইল ঠিকানা (Email Address)', 'Email address')}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  hint={t(
                    'এই ইমেইলে একটি ৬-ডিজিটের ভেরিফিকেশন কোড পাঠানো হবে।',
                    'We will send a 6-digit verification code to this address.'
                  )}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  error={fieldErrors.email}
                />

                {/* Consent Checkbox */}
                <div className="pt-2">
                  <label
                    htmlFor="consentAccepted"
                    className="flex items-start gap-3 cursor-pointer select-none"
                  >
                    <input
                      id="consentAccepted"
                      type="checkbox"
                      checked={formData.consentAccepted}
                      onChange={(e) =>
                        updateField('consentAccepted', e.target.checked)
                      }
                      aria-invalid={fieldErrors.consentAccepted ? 'true' : 'false'}
                      aria-describedby={
                        fieldErrors.consentAccepted ? 'consent-error' : undefined
                      }
                      className="w-5 h-5 mt-0.5 rounded-[4px] accent-[#ff7722] shrink-0 cursor-pointer"
                    />
                    <span className="text-[14px] text-[#171412] leading-[1.45]">
                      {t('আমি ', 'I agree to the ')}
                      <Link
                        to="/terms"
                        className="font-bold underline underline-offset-2 hover:text-[#813502]"
                      >
                        {t('শর্তাবলী', 'Terms of Service')}
                      </Link>
                      {t(' এবং ', ' and ')}
                      <Link
                        to="/privacy"
                        className="font-bold underline underline-offset-2 hover:text-[#813502]"
                      >
                        {t('গোপনীয়তা নীতিতে', 'Privacy Policy')}
                      </Link>
                      {t(
                        ' সম্মতি জানাচ্ছি এবং ইমেইল ও হোয়াটসঅ্যাপে ওয়েটলিস্ট আপডেট পেতে রাজি আছি।',
                        ', and consent to receive waitlist updates via email and WhatsApp.'
                      )}
                      <span className="text-[#813502] ml-1" aria-hidden="true">
                        *
                      </span>
                    </span>
                  </label>

                  {fieldErrors.consentAccepted && (
                    <div
                      id="consent-error"
                      role="alert"
                      aria-live="polite"
                      className="flex items-start gap-1.5 text-[13px] font-semibold text-[#ff3c34] mt-2"
                    >
                      <AlertCircleSvgIcon className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{fieldErrors.consentAccepted}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="orange"
                    size="lg"
                    isLoading={isSendingOtp}
                    loadingText={t('কোড পাঠানো হচ্ছে...', 'Sending verification code...')}
                    className="w-full sm:w-auto"
                  >
                    <span>
                      {t('ভেরিফিকেশন কোড পাঠান', 'Send verification code')}
                    </span>
                    <ArrowRightSvgIcon className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            /* =================================================================
               STEP 2: VERIFY EMAIL WITH 6-DIGIT OTP
            ================================================================= */
            <div>
              <h1 className="font-display text-[32px] sm:text-[44px] font-extrabold text-[#171412] leading-[1.05] tracking-[-0.03em] mb-3">
                {t('আপনার ইমেইল ভেরিফাই করুন।', 'Verify your email.')}
              </h1>

              <p className="text-[15px] sm:text-[16px] text-[#171412]/80 leading-[1.5] mb-2">
                {t('আমরা ৬-ডিজিটের একটি কোড পাঠিয়েছি ', 'We sent a 6-digit code to ')}
                <strong className="font-bold text-[#813502]">
                  {maskEmailAddress(formData.email)}
                </strong>
                {t(' ঠিকানায়।', '.')}
              </p>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpError('');
                    setOtpStatusMsg('');
                  }}
                  className="min-h-[44px] inline-flex items-center text-[13px] font-bold text-[#813502] underline underline-offset-4 hover:text-[#171412] cursor-pointer"
                >
                  {t('ইমেইল ঠিকানা পরিবর্তন করুন', 'Change email address')}
                </button>
              </div>

              {!isSupabaseConfigured && (
                <div
                  role="status"
                  className="mb-6 p-4 rounded-[12px] bg-[#ffc765]/30 border border-[#171412]/25 text-[13px] text-[#171412]"
                >
                  <strong>Preview Mode:</strong>{' '}
                  {t(
                    'যেকোনো ৬-ডিজিটের কোড (যেমন: 123456) দিয়ে ভেরিফিকেশন সম্পন্ন করুন।',
                    'Enter any 6-digit code (e.g. 123456) to complete verification.'
                  )}
                </div>
              )}

              {otpStatusMsg && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-6 p-4 rounded-[12px] bg-[#ff7722]/15 border border-[#ff7722] text-[14px] font-bold text-[#813502] flex items-center gap-2.5"
                >
                  <CheckSvgIcon className="w-5 h-5 text-[#813502] shrink-0" />
                  <span>{otpStatusMsg}</span>
                </div>
              )}

              <form onSubmit={handleStep2Verify} noValidate className="flex flex-col gap-6">
                <OtpInput
                  value={otpToken}
                  onChange={(val) => {
                    setOtpToken(val);
                    if (otpError) setOtpError('');
                  }}
                  disabled={isVerifying}
                  error={otpError}
                />

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button
                    type="submit"
                    variant="orange"
                    size="lg"
                    isLoading={isVerifying}
                    loadingText={t('যাচাই করা হচ্ছে...', 'Verifying code...')}
                  >
                    <span>{t('ভেরিফাই করুন', 'Verify')}</span>
                    <ArrowRightSvgIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={resendCooldown > 0 || isResending}
                    isLoading={isResending}
                    loadingText={t('পাঠানো হচ্ছে...', 'Resending...')}
                    onClick={handleResendCode}
                  >
                    {resendCooldown > 0 ? (
                      <span className="tabular-nums">
                        {t(
                          `পুনরায় কোড পাঠান (${resendCooldown}s)`,
                          `Resend code in ${resendCooldown}s`
                        )}
                      </span>
                    ) : (
                      <span>{t('পুনরায় কোড পাঠান', 'Resend code')}</span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
