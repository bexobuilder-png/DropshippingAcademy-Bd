import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  buildWhatsAppConfirmUrl,
  DEFAULT_WHATSAPP_CONFIRM_MESSAGE,
  otpSchema,
  validateWhatsAppNumberFormat,
  waitlistStep1Schema,
  WaitlistFormValues,
} from '../schemas/waitlist';
import {
  consumeHeroEmailPrefill,
  loadWaitlistDraft,
  maskEmailAddress,
  saveWaitlistDraft,
  sendEmailVerificationOtp,
  validateRegistrationOnServer,
  verifyEmailOtpAndInsertWaitlist,
} from '../services/waitlist';
import { Button } from '../components/Button';
import { DobField, validateDob } from '../components/DobField';
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
  whatsappConfirmedByUser: false,
  confirmedWhatsappNumber: '',
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
  const { t, lang } = useLanguage();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<WaitlistFormValues>(() => {
    const saved = loadWaitlistDraft();
    const heroEmail = consumeHeroEmailPrefill();
    if (saved) {
      return {
        ...INITIAL_VALUES,
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

  // WhatsApp confirmation flow state
  const [whatsappTouched, setWhatsappTouched] = useState(false);
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);
  const [isWhatsAppStatusScreenOpen, setIsWhatsAppStatusScreenOpen] = useState(false);
  const [openedWhatsAppForNumber, setOpenedWhatsAppForNumber] = useState<string>(() => {
    const saved = loadWaitlistDraft();
    return saved?.confirmedWhatsappNumber || '';
  });
  const [dismissedConfirmPromptForNumber, setDismissedConfirmPromptForNumber] =
    useState<string>('');

  const savedScrollYRef = useRef<number>(0);
  const continueRegistrationBtnRef = useRef<HTMLButtonElement>(null);
  const openWhatsAppBtnRef = useRef<HTMLAnchorElement>(null);
  const doubleTapTimerRef = useRef<number | null>(null);

  // Step 2 state
  const [otpToken, setOtpToken] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpStatusMsg, setOtpStatusMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const effectiveWhatsapp = formData.sameAsPhone ? formData.phone : formData.whatsapp;

  const whatsappValidation = useMemo(
    () => validateWhatsAppNumberFormat(effectiveWhatsapp, 'BD'),
    [effectiveWhatsapp]
  );

  const whatsappClickToChatUrl = useMemo(() => {
    if (!whatsappValidation.isValid) return '';
    return buildWhatsAppConfirmUrl(
      whatsappValidation.e164,
      DEFAULT_WHATSAPP_CONFIRM_MESSAGE,
      'BD'
    );
  }, [whatsappValidation.isValid, whatsappValidation.e164]);

  const isCurrentWhatsappUserConfirmed = Boolean(
    whatsappValidation.isValid &&
      formData.whatsappConfirmedByUser &&
      formData.confirmedWhatsappNumber === whatsappValidation.e164
  );

  const showDidYouSendPrompt = Boolean(
    whatsappValidation.isValid &&
      openedWhatsAppForNumber === whatsappValidation.e164 &&
      !isCurrentWhatsappUserConfirmed &&
      dismissedConfirmPromptForNumber !== whatsappValidation.e164
  );

  useEffect(() => {
    saveWaitlistDraft(formData);
  }, [formData]);

  useEffect(() => {
    return () => {
      if (doubleTapTimerRef.current) {
        window.clearTimeout(doubleTapTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (formData.sameAsPhone && formData.whatsapp !== formData.phone) {
      setFormData((prev) => {
        const nextCheck = validateWhatsAppNumberFormat(prev.phone, 'BD');
        const stillConfirmed =
          prev.whatsappConfirmedByUser &&
          nextCheck.isValid &&
          prev.confirmedWhatsappNumber === nextCheck.e164;
        return {
          ...prev,
          whatsapp: prev.phone,
          whatsappConfirmedByUser: Boolean(stillConfirmed),
        };
      });
    }
  }, [formData.sameAsPhone, formData.phone, formData.whatsapp]);

  // Focus management and Escape key support when the lightweight WhatsApp status screen is open
  useEffect(() => {
    if (!isWhatsAppStatusScreenOpen) return;

    const focusTimer = window.setTimeout(() => {
      continueRegistrationBtnRef.current?.focus({ preventScroll: true });
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReturnFromWhatsAppStatus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWhatsAppStatusScreenOpen]);

  useEffect(() => {
    if (step !== 2 || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const getLocalizedWhatsappError = (reason?: 'empty' | 'invalid_format') => {
    if (reason === 'empty') {
      return t(
        'হোয়াটসঅ্যাপ নম্বর আবশ্যক। দেশের কোডসহ (+880) সঠিক নম্বর দিন।',
        'WhatsApp number is required. Please enter a valid number with country code (e.g. +880).'
      );
    }
    return t(
      'সঠিক আন্তর্জাতিক ফরম্যাটে হোয়াটসঅ্যাপ নম্বর দিন (যেমন: +880 1712-345678)।',
      'Please enter a valid WhatsApp phone number in international format (e.g. +880 1712-345678).'
    );
  };

  const updateField = <K extends keyof WaitlistFormValues>(
    field: K,
    value: WaitlistFormValues[K]
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      // If the effective WhatsApp number changed, reset user confirmation if it no longer matches
      const nextEffectiveWa =
        field === 'sameAsPhone'
          ? value
            ? prev.phone
            : prev.whatsapp
          : field === 'phone' && prev.sameAsPhone
          ? (value as string)
          : field === 'whatsapp'
          ? (value as string)
          : prev.sameAsPhone
          ? prev.phone
          : prev.whatsapp;

      const check = validateWhatsAppNumberFormat(nextEffectiveWa, 'BD');
      if (
        prev.whatsappConfirmedByUser &&
        (!check.isValid || check.e164 !== prev.confirmedWhatsappNumber)
      ) {
        next.whatsappConfirmedByUser = false;
      }

      return next;
    });

    if (field === 'whatsapp' || (field === 'phone' && formData.sameAsPhone)) {
      const nextWaVal = String(value || '');
      const check = validateWhatsAppNumberFormat(nextWaVal, 'BD');
      if (check.isValid) {
        setFieldErrors((prev) => {
          if (!prev.whatsapp) return prev;
          const copy = { ...prev };
          delete copy.whatsapp;
          return copy;
        });
      } else if (whatsappTouched) {
        setFieldErrors((prev) => ({
          ...prev,
          whatsapp: getLocalizedWhatsappError(check.errorReason),
        }));
      }
    } else if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (step1GlobalError) setStep1GlobalError('');
  };

  const handleWhatsappBlur = () => {
    setWhatsappTouched(true);
    const check = validateWhatsAppNumberFormat(effectiveWhatsapp, 'BD');
    if (!check.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        whatsapp: getLocalizedWhatsappError(check.errorReason),
      }));
    } else {
      setFieldErrors((prev) => {
        if (!prev.whatsapp) return prev;
        const copy = { ...prev };
        delete copy.whatsapp;
        return copy;
      });
    }
  };

  const handlePhoneBlur = () => {
    if (!formData.phone.trim()) return;
    const check = validateWhatsAppNumberFormat(formData.phone, 'BD');
    if (!check.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        phone: t(
          'সঠিক আন্তর্জাতিক ফরম্যাটে ফোন নম্বর দিন (যেমন: +880 1712-345678)।',
          'Please enter a valid international phone number (e.g. +880 1712-345678).'
        ),
      }));
    }
  };

  const handleOpenWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isOpeningWhatsApp) {
      e.preventDefault();
      return;
    }

    setWhatsappTouched(true);
    const check = validateWhatsAppNumberFormat(effectiveWhatsapp, 'BD');
    if (!check.isValid || !whatsappClickToChatUrl) {
      e.preventDefault();
      setFieldErrors((prev) => ({
        ...prev,
        whatsapp: getLocalizedWhatsappError(check.errorReason),
      }));
      const inputEl = document.getElementById(
        formData.sameAsPhone ? 'phone' : 'whatsapp'
      );
      inputEl?.focus();
      return;
    }

    // Prevent double taps while letting the native user-initiated <a target="_blank"> open WhatsApp
    setIsOpeningWhatsApp(true);
    if (doubleTapTimerRef.current) {
      window.clearTimeout(doubleTapTimerRef.current);
    }
    doubleTapTimerRef.current = window.setTimeout(() => {
      setIsOpeningWhatsApp(false);
    }, 1200);

    savedScrollYRef.current = window.scrollY;
    setOpenedWhatsAppForNumber(check.e164);
    setDismissedConfirmPromptForNumber('');
    saveWaitlistDraft({
      ...formData,
      whatsapp: check.e164,
    });
    setIsWhatsAppStatusScreenOpen(true);
  };

  const handleReturnFromWhatsAppStatus = () => {
    setIsWhatsAppStatusScreenOpen(false);
    const targetScrollY = savedScrollYRef.current;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: targetScrollY, behavior: 'instant' as ScrollBehavior });
      openWhatsAppBtnRef.current?.focus({ preventScroll: true });
    });
  };

  const handleUserConfirmWhatsAppSent = (didSend: boolean) => {
    const check = validateWhatsAppNumberFormat(effectiveWhatsapp, 'BD');
    if (didSend && check.isValid) {
      const updated: WaitlistFormValues = {
        ...formData,
        whatsapp: check.e164,
        whatsappConfirmedByUser: true,
        confirmedWhatsappNumber: check.e164,
      };
      setFormData(updated);
      saveWaitlistDraft(updated);
    } else if (!didSend && check.isValid) {
      const updated: WaitlistFormValues = {
        ...formData,
        whatsappConfirmedByUser: false,
      };
      setFormData(updated);
      saveWaitlistDraft(updated);
      setDismissedConfirmPromptForNumber(check.e164);
    }

    if (isWhatsAppStatusScreenOpen) {
      handleReturnFromWhatsAppStatus();
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingOtp) return;

    setStep1GlobalError('');
    setWhatsappTouched(true);

    const effectiveData: WaitlistFormValues = {
      ...formData,
      whatsapp: formData.sameAsPhone ? formData.phone : formData.whatsapp,
    };

    // 1. Immediate frontend validation for instant feedback
    const parsed = waitlistStep1Schema.safeParse(effectiveData);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof WaitlistFormValues, string>> = {};
      let firstInvalidKey: keyof WaitlistFormValues | undefined;
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof WaitlistFormValues | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] =
            key === 'whatsapp'
              ? getLocalizedWhatsappError(
                  validateWhatsAppNumberFormat(effectiveData.whatsapp, 'BD').errorReason
                )
              : issue.message;
          if (!firstInvalidKey) firstInvalidKey = key;
        }
      }
      setFieldErrors(nextErrors);
      if (firstInvalidKey) {
        const targetId =
          firstInvalidKey === 'dateOfBirth'
            ? 'dob-d'
            : firstInvalidKey === 'whatsapp' && formData.sameAsPhone
            ? 'phone'
            : firstInvalidKey;
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus({ preventScroll: true });
        }
      }
      return;
    }

    setFieldErrors({});
    setIsSendingOtp(true);

    // 2. Server-side validation when the form is submitted
    const serverValidation = await validateRegistrationOnServer(parsed.data);
    if (!serverValidation.success) {
      setIsSendingOtp(false);
      if (serverValidation.fieldErrors) {
        setFieldErrors(serverValidation.fieldErrors);
        const firstKey = Object.keys(
          serverValidation.fieldErrors
        )[0] as keyof WaitlistFormValues | undefined;
        if (firstKey) {
          const targetId =
            firstKey === 'dateOfBirth'
              ? 'dob-d'
              : firstKey === 'whatsapp' && formData.sameAsPhone ? 'phone' : firstKey;
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus({ preventScroll: true });
          }
        }
      }
      if (serverValidation.error) {
        setStep1GlobalError(serverValidation.error);
      }
      return;
    }

    const validatedData = serverValidation.normalized || parsed.data;
    setAnim('submit');

    let timerId = 0;
    let resolveTimer: () => void = () => {};

    const timerPromise = new Promise<void>((resolve) => {
      resolveTimer = resolve;
      timerId = window.setTimeout(resolve, 3600);
    });

    const apiPromise = sendEmailVerificationOtp(
      validatedData.email,
      validatedData.honeypot
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

    setFormData(validatedData);
    saveWaitlistDraft(validatedData);
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
              {/* Lightweight, accessible status screen shown immediately when WhatsApp is opened */}
              {isWhatsAppStatusScreenOpen && (
                <section
                  role="region"
                  aria-labelledby="whatsapp-status-heading"
                  aria-live="polite"
                  className="flex flex-col gap-5 py-2"
                >
                  <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-[50px] bg-[#fbf9ef] border border-[#171412]/30 text-[#813502] text-[12px] font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff7722]" aria-hidden="true" />
                    <span>
                      {t(
                        'হোয়াটসঅ্যাপ নিশ্চিতকরণ ধাপ',
                        'WhatsApp Confirmation Step'
                      )}
                    </span>
                  </div>

                  <h1
                    id="whatsapp-status-heading"
                    className="font-display text-[28px] sm:text-[38px] font-extrabold text-[#171412] leading-[1.1] tracking-[-0.02em]"
                  >
                    {t(
                      'WhatsApp খুলেছে? চালিয়ে যেতে এখানে ফিরে আসুন। (WhatsApp opened? Return here to continue.)',
                      'WhatsApp opened? Return here to continue.'
                    )}
                  </h1>

                  <p className="text-[15px] sm:text-[16px] text-[#171412]/85 leading-[1.6]">
                    {t(
                      'WhatsApp-এ প্রি-ফিল করা মেসেজটি যাচাই করে Send বোতামে ট্যাপ করুন, তারপর রেজিস্ট্রেশন সম্পন্ন করতে এই পেজে ফিরে আসুন। আমরা স্বয়ংক্রিয়ভাবে কোনো মেসেজ পাঠাই না এবং মেসেজ পাঠানো হয়েছে কি না বা নম্বরটি ভেরিফাইড কি না তা স্বয়ংক্রিয়ভাবে দাবি করি না।',
                      'Please review and tap Send on the prefilled message in WhatsApp, then return to this page to continue your registration. We do not send the message automatically, and this page does not claim the message was sent or that your number is verified.'
                    )}
                  </p>

                  {/* Prefilled Message & Number Summary Box */}
                  <div className="rounded-[16px] bg-[#fbf9ef] border border-[#171412]/25 p-4 sm:p-5 flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                      <span className="font-bold text-[#813502]">
                        {t('নির্বাচিত হোয়াটসঅ্যাপ নম্বর:', 'Selected WhatsApp number:')}
                      </span>
                      <span className="font-extrabold text-[#171412] tabular-nums">
                        {whatsappValidation.e164}
                      </span>
                    </div>
                    <div className="text-[13px] text-[#171412]/80 border-t border-[#171412]/10 pt-2.5">
                      <span className="font-bold text-[#171412]">
                        {t('প্রি-ফিল করা মেসেজ: ', 'Prefilled message: ')}
                      </span>
                      <span className="italic">
                        “{DEFAULT_WHATSAPP_CONFIRM_MESSAGE}”
                      </span>
                    </div>
                  </div>

                  {/* Optional "Did you send the message?" prompt */}
                  <div
                    role="group"
                    aria-labelledby="did-you-send-heading"
                    className="rounded-[16px] bg-[#fbf9ef] border-2 border-[#171412] p-4 sm:p-5 flex flex-col gap-3"
                  >
                    <p
                      id="did-you-send-heading"
                      className="text-[14px] sm:text-[15px] font-extrabold text-[#171412]"
                    >
                      {t(
                        'আপনি কি মেসেজটি পাঠিয়েছেন? (Did you send the message?)',
                        'Did you send the message?'
                      )}
                    </p>
                    <p className="text-[13px] text-[#171412]/75 leading-snug">
                      {t(
                        'হ্যাঁ নির্বাচন করলে নম্বরটি শুধুমাত্র “User confirmed” (ইউজার নিশ্চিত করেছেন) হিসেবে চিহ্নিত হবে—“WhatsApp verified” নয়। আপনি যেকোনো অবস্থাতেই রেজিস্ট্রেশন চালিয়ে যেতে পারবেন।',
                        'If you answer yes, your number will be marked as “User confirmed” only—not “WhatsApp verified.” You can continue registration either way.'
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleUserConfirmWhatsAppSent(true)}
                        className="min-h-[44px] px-4 py-2 rounded-[50px] bg-[#171412] text-[#fbf9ef] hover:bg-[#2c2623] text-[13px] font-bold inline-flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171412] focus-visible:ring-2 focus-visible:ring-[#ff7722]"
                      >
                        <CheckSvgIcon className="w-4 h-4 text-[#ff7722] shrink-0" />
                        <span>
                          {t(
                            'হ্যাঁ, আমি পাঠিয়েছি (Yes, mark User confirmed)',
                            'Yes, I sent it (Mark as User confirmed)'
                          )}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUserConfirmWhatsAppSent(false)}
                        className="min-h-[44px] px-4 py-2 rounded-[50px] bg-transparent text-[#171412] border border-[#171412]/35 hover:bg-[#171412]/5 hover:border-[#171412] text-[13px] font-bold inline-flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171412] focus-visible:ring-2 focus-visible:ring-[#ff7722]"
                      >
                        <span>
                          {t('এখনও না (Not yet)', 'No, not yet')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Primary "Continue registration" button & reopen link */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <Button
                      ref={continueRegistrationBtnRef}
                      type="button"
                      variant="orange"
                      size="lg"
                      onClick={handleReturnFromWhatsAppStatus}
                      className="w-full sm:w-auto"
                    >
                      <span>
                        {t(
                          'রেজিস্ট্রেশন চালিয়ে যান (Continue registration)',
                          'Continue registration'
                        )}
                      </span>
                      <ArrowRightSvgIcon className="w-4 h-4 shrink-0" />
                    </Button>

                    {whatsappClickToChatUrl && (
                      <a
                        href={whatsappClickToChatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] font-bold text-[#813502] underline underline-offset-4 hover:text-[#171412] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171412] focus-visible:ring-2 focus-visible:ring-[#ff7722]"
                      >
                        <span>
                          {t(
                            'WhatsApp না খুললে আবার চেষ্টা করুন',
                            'WhatsApp didn’t open? Tap to try again'
                          )}
                        </span>
                      </a>
                    )}
                  </div>
                </section>
              )}

              <div className={isWhatsAppStatusScreenOpen ? 'hidden' : 'block'}>
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
                  <div>
                    <label id="dob-label" className="block text-[14px] font-bold text-[#171412] mb-1.5">
                      {t('জন্ম তারিখ (Date of Birth)', 'Date of birth')}
                      <span className="text-[#ff7722] ml-1" aria-hidden="true">*</span>
                    </label>
                    <p id="dob-hint" className="text-[13px] text-[#171412]/75 mb-2.5">
                      {t(
                        'দিন, মাস ও বছর লিখুন — পরের ঘরে নিজে নিজেই চলে যাবে। বয়স ন্যূনতম ১৮ বছর হতে হবে।',
                        'Type day, month and year. It jumps to the next box by itself. You must be at least 18.'
                      )}
                    </p>
                    <DobField
                      id="dob"
                      value={formData.dateOfBirth}
                      onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                      lang={lang}
                      error={fieldErrors.dateOfBirth}
                    />
                  </div>

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
                    onBlur={handlePhoneBlur}
                    error={fieldErrors.phone}
                  />

                  {/* WhatsApp Number + Quick Click-to-Chat Confirmation Flow */}
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
                          className="w-5 h-5 rounded-[4px] accent-[#ff7722] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171412]"
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
                      value={effectiveWhatsapp}
                      onChange={(e164) => updateField('whatsapp', e164)}
                      onBlur={handleWhatsappBlur}
                      error={fieldErrors.whatsapp}
                    />

                    {/* Format valid helper & WhatsApp Click-to-Chat Confirmation Action */}
                    {whatsappValidation.isValid && (
                      <div
                        role="region"
                        aria-label={t(
                          'হোয়াটসঅ্যাপ নম্বর নিশ্চিতকরণ',
                          'WhatsApp number confirmation'
                        )}
                        className="mt-1 rounded-[16px] bg-[#fbf9ef] border border-[#171412]/25 p-4 flex flex-col gap-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-[12px] sm:text-[13px] text-[#171412]/80 leading-snug">
                            {t(
                              'নম্বরের ফরম্যাট সঠিক আছে (নোট: ফরম্যাট যাচাই নম্বরটি WhatsApp-এ রেজিস্টার্ড কি না তা প্রমাণ করে না)।',
                              'Number format is valid (Note: format validation does not prove this number is registered on WhatsApp).'
                            )}
                          </p>

                          {isCurrentWhatsappUserConfirmed && (
                            <span
                              role="status"
                              aria-live="polite"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-[#ff7722]/15 border border-[#171412] text-[#813502] text-[12px] font-extrabold shrink-0"
                            >
                              <CheckSvgIcon className="w-3.5 h-3.5 text-[#813502] shrink-0" />
                              <span>
                                {t(
                                  'ইউজার নিশ্চিত করেছেন (User confirmed)',
                                  'User confirmed'
                                )}
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            ref={openWhatsAppBtnRef}
                            href={isOpeningWhatsApp ? undefined : whatsappClickToChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-disabled={isOpeningWhatsApp ? 'true' : undefined}
                            onClick={handleOpenWhatsAppClick}
                            className={`min-h-[46px] px-5 py-2.5 rounded-[50px] bg-[#171412] text-[#fbf9ef] hover:bg-[#2c2623] border border-[#171412] text-[13px] sm:text-[14px] font-extrabold inline-flex items-center justify-center gap-2.5 transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171412] focus-visible:ring-2 focus-visible:ring-[#ff7722] select-none ${
                              isOpeningWhatsApp
                                ? 'opacity-60 pointer-events-none'
                                : 'cursor-pointer'
                            }`}
                          >
                            <svg
                              className="w-4 h-4 fill-current text-[#ff7722] shrink-0"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.942 2.796.943 3.182 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.768-5.769-5.768zm3.364 8.163c-.141.396-.713.727-1.026.772-.313.045-.719.064-2.179-.533-1.46-.597-2.385-2.096-2.456-2.19-.071-.094-.576-.767-.576-1.464 0-.697.365-1.039.495-1.18.13-.141.284-.177.378-.177.094 0 .189.001.272.005.087.005.203-.033.317.241.118.283.402.981.437 1.052.035.071.059.153.012.247-.047.094-.071.153-.142.236-.071.082-.149.183-.213.246-.071.071-.145.148-.062.29.083.142.368.608.79 1.002.544.509 1.004.667 1.146.738.142.071.224.059.307-.035.082-.095.354-.413.448-.555.094-.141.189-.118.318-.071.13.047.826.39.968.461.142.071.236.106.271.165.035.059.035.342-.106.738z" />
                            </svg>
                            <span>
                              {t(
                                'WhatsApp-এ খুলে নিশ্চিত করুন',
                                'Open WhatsApp to confirm'
                              )}
                            </span>
                          </a>

                          <span className="text-[12px] text-[#171412]/70">
                            {t(
                              'ঐচ্ছিক · WhatsApp-এ প্রি-ফিল করা মেসেজসহ চ্যাট খুলবে',
                              'Optional · Opens WhatsApp with a prefilled confirmation message'
                            )}
                          </span>
                        </div>

                        {/* Inline "Did you send the message?" prompt if user returned to form without answering */}
                        {showDidYouSendPrompt && (
                          <div
                            role="region"
                            aria-label={t(
                              'মেসেজ পাঠানোর নিশ্চিতকরণ',
                              'Message sent confirmation prompt'
                            )}
                            className="mt-1 pt-3 border-t border-[#171412]/15 flex flex-wrap items-center justify-between gap-3"
                          >
                            <span className="text-[13px] font-bold text-[#171412]">
                              {t(
                                'আপনি কি মেসেজটি পাঠিয়েছেন? (Did you send the message?)',
                                'Did you send the message?'
                              )}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUserConfirmWhatsAppSent(true)}
                                className="min-h-[38px] px-3.5 py-1.5 rounded-[50px] bg-[#ff7722] text-[#171412] border border-[#171412] text-[12px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171412]"
                              >
                                <CheckSvgIcon className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {t(
                                    'হ্যাঁ, পাঠিয়েছি (User confirmed)',
                                    'Yes, mark as User confirmed'
                                  )}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUserConfirmWhatsAppSent(false)}
                                className="min-h-[38px] px-3.5 py-1.5 rounded-[50px] bg-transparent text-[#171412] border border-[#171412]/30 hover:border-[#171412] text-[12px] font-bold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171412]"
                              >
                                <span>{t('না / পরে পাঠাবো', 'No / Continue anyway')}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                        className="w-5 h-5 mt-0.5 rounded-[4px] accent-[#ff7722] shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171412]"
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
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>
                        {t('ভেরিফিকেশন কোড পাঠান', 'Send verification code')}
                      </span>
                      <ArrowRightSvgIcon className="w-4 h-4 shrink-0" />
                    </Button>
                  </div>
                </form>
              </div>
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
