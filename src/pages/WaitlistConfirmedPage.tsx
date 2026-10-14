import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { loadConfirmedWaitlist, ConfirmedWaitlistRecord } from '../services/waitlist';
import {
  fetchCoursesList,
  fetchPromoCodesList,
  evaluatePromoCode,
  enrollStudentInCourse,
  PromoValidationResult,
} from '../services/courses';
import { CourseItem, PromoCodeItem } from '../config/courses';
import { Button } from '../components/Button';
import { SuccessIllustration } from '../components/svg/SuccessIllustration';
import { AlertCircleSvgIcon, CheckSvgIcon, ArrowRightSvgIcon } from '../components/svg/NavIcons';

export const WaitlistConfirmedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [confirmed, setConfirmed] = useState<ConfirmedWaitlistRecord | null>(() =>
    loadConfirmedWaitlist()
  );
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Course Selection State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoResult, setPromoResult] = useState<PromoValidationResult | null>(null);
  const [promoError, setPromoError] = useState<string>('');
  const [isSubmittingEnrollment, setIsSubmittingEnrollment] = useState(false);
  const [enrollmentSuccessMessage, setEnrollmentSuccessMessage] = useState('');
  const [isChangingCourse, setIsChangingCourse] = useState(false);
  const [showNavOptions, setShowNavOptions] = useState(false);

  // Load live courses and promo codes (from admin panel / Supabase)
  useEffect(() => {
    let mounted = true;
    Promise.all([fetchCoursesList(), fetchPromoCodesList()]).then(
      ([coursesData, promoData]) => {
        if (!mounted) return;
        const activeOnly = coursesData.filter((c) => c.isActive);
        setCourses(activeOnly);
        setPromoCodes(promoData);

        // Preselect either already enrolled course or first active course
        const currentRecord = loadConfirmedWaitlist();
        if (currentRecord?.selectedCourseId) {
          setSelectedCourseId(currentRecord.selectedCourseId);
          if (currentRecord.promoCode) {
            setPromoCodeInput(currentRecord.promoCode);
          }
        } else if (activeOnly.length > 0) {
          setSelectedCourseId(activeOnly[0].id);
        }
        setLoadingCourses(false);
      }
    );

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for real-time course updates from Admin Panel
  useEffect(() => {
    const handleSync = () => {
      fetchCoursesList().then((data) => {
        setCourses(data.filter((c) => c.isActive));
      });
      fetchPromoCodesList().then((data) => {
        setPromoCodes(data);
      });
      setConfirmed(loadConfirmedWaitlist());
    };

    window.addEventListener('site-courses-updated', handleSync);
    window.addEventListener('site-promocodes-updated', handleSync);
    return () => {
      window.removeEventListener('site-courses-updated', handleSync);
      window.removeEventListener('site-promocodes-updated', handleSync);
    };
  }, []);

  // Route Guard: Only reachable after successful verification
  if (!confirmed) {
    return <Navigate to="/" replace />;
  }

  const alreadyOnWaitlist =
    Boolean(
      (location.state as { alreadyOnWaitlist?: boolean } | null)?.alreadyOnWaitlist
    ) || confirmed.alreadyOnWaitlist;

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Recalculate promo when course changes or input changes
  const handleApplyPromo = (codeToApply?: string) => {
    const targetCode = (codeToApply ?? promoCodeInput).trim();
    setPromoError('');

    if (!targetCode) {
      setPromoResult(null);
      return;
    }

    if (!currentCourse) return;

    const result = evaluatePromoCode(targetCode, currentCourse, promoCodes);
    if (!result.isValid) {
      setPromoError(result.message);
      setPromoResult(null);
    } else {
      setPromoResult(result);
      setPromoCodeInput(result.code || targetCode);
    }
  };

  const calculateEffectiveFee = () => {
    if (!currentCourse) return 1000;
    const base =
      currentCourse.discountPrice !== undefined
        ? currentCourse.discountPrice
        : currentCourse.price;

    if (promoResult && promoResult.isValid) {
      return promoResult.finalPrice;
    }
    return base;
  };

  const handleConfirmEnrollment = async () => {
    if (!currentCourse || !confirmed) return;
    setIsSubmittingEnrollment(true);

    const basePrice =
      currentCourse.discountPrice !== undefined
        ? currentCourse.discountPrice
        : currentCourse.price;
    const finalFee = calculateEffectiveFee();
    const discount = basePrice - finalFee;

    const res = await enrollStudentInCourse(confirmed.email, {
      courseId: currentCourse.id,
      courseTitle: currentCourse.title,
      courseCategory: currentCourse.category,
      courseFee: basePrice,
      promoCode: promoResult?.isValid ? promoResult.code : undefined,
      discountAmount: discount > 0 ? discount : undefined,
      finalFee,
    });

    setIsSubmittingEnrollment(false);

    if (res.success) {
      const updated = loadConfirmedWaitlist();
      setConfirmed(updated);
      setIsChangingCourse(false);
      setEnrollmentSuccessMessage(
        t(
          `অভিনন্দন! আপনি "${currentCourse.title}" কোর্সে সফলভাবে ভর্তি নিশ্চিত করেছেন।`,
          `Congratulations! You have successfully enrolled in "${currentCourse.title}".`
        )
      );
      window.scrollTo({ top: 320, behavior: 'smooth' });
      setTimeout(() => setEnrollmentSuccessMessage(''), 8000);
    }
  };

  const isEnrolled = Boolean(confirmed.selectedCourseId && !isChangingCourse);

  return (
    <main id="main-content" className="py-10 md:py-16 lg:py-24 bg-[#fbf9ef] text-[#171412]">
      <div className="specimen-container max-w-4xl">
        {/* Main Enrollment Card */}
        <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] shadow-md p-6 sm:p-10 md:p-12 text-[#171412]">
          
          {/* Header Illustration & Welcome */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <SuccessIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            {alreadyOnWaitlist && (
              <div
                role="status"
                aria-live="polite"
                className="inline-block mb-4 px-4 py-1.5 rounded-[50px] bg-[#ffc765]/50 text-[#171412] text-[13px] font-bold border border-[#171412]"
              >
                {t(
                  'রেজিস্ট্রেশন যাচাই সম্পন্ন — আপনার অ্যাকাউন্ট সংরক্ষিত রয়েছে!',
                  'Registration verified — your profile is securely saved!'
                )}
              </div>
            )}

            <h1 className="font-display text-[30px] sm:text-[42px] font-extrabold text-[#171412] leading-tight mb-2">
              {t(
                `স্বাগতম, ${confirmed.firstName}!`,
                `Welcome aboard, ${confirmed.firstName}!`
              )}
            </h1>

            <p className="text-[16px] sm:text-[18px] text-[#171412]/80 leading-[1.55] max-w-2xl mx-auto">
              {t(
                'আপনার প্রাথমিক নিবন্ধন ও ইমেইল যাচাই সফল হয়েছে। এবার নিচে আপনার কাঙ্ক্ষিত কোর্সটি বেছে নিয়ে ভর্তি নিশ্চিত করুন।',
                'Your registration and verification are complete. Now select which course you would like to enroll in below.'
              )}
            </p>
          </div>

          {/* Success Notification Bar */}
          {enrollmentSuccessMessage && (
            <div
              role="status"
              aria-live="polite"
              className="mb-8 p-4 rounded-[16px] bg-[#e8f5e9] border-2 border-[#2e7d32] text-[#1b5e20] text-[14px] font-bold flex items-center gap-3 animate-fadeIn"
            >
              <CheckSvgIcon className="w-5 h-5 text-[#2e7d32] shrink-0" />
              <span>{enrollmentSuccessMessage}</span>
            </div>
          )}

          {/* =========================================================================
              STATE A: COURSE ALREADY ENROLLED — SHOW ADMISSION BADGE & RECEIPT
          ========================================================================= */}
          {isEnrolled && currentCourse ? (
            <div className="rounded-[20px] bg-[#fbf9ef] border-2 border-[#171412] p-6 sm:p-8 mb-8 text-left shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#171412]/15 mb-6">
                <div>
                  <div className="text-[12px] font-extrabold text-[#813502] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse"></span>
                    <span>{t('ভর্তি নিশ্চিতকৃত কোর্স', 'Enrolled Course Confirmation')}</span>
                  </div>
                  <h2 className="font-display text-[22px] sm:text-[28px] font-extrabold text-[#171412] mt-1">
                    {confirmed.selectedCourseTitle || currentCourse.title}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[12px] font-bold text-[#171412]/70 block">
                    {t('নির্ধারিত কোর্স ফি', 'Confirmed Fee')}
                  </span>
                  <span className="font-display text-[24px] sm:text-[28px] font-extrabold text-[#171412] tabular-nums">
                    ৳{confirmed.finalFee !== undefined ? confirmed.finalFee.toLocaleString('bn-BD') : (currentCourse.discountPrice || currentCourse.price)}
                  </span>
                </div>
              </div>

              {/* Course Highlights & Enrollment Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-[13px] font-bold text-[#813502] mb-2">
                    {t('কোর্সের বৈশিষ্ট্যসমূহ:', 'Key Course Highlights:')}
                  </div>
                  <ul className="space-y-2 text-[14px] text-[#171412]/85">
                    {currentCourse.highlights.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#813502] font-bold mt-0.5">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[14px] bg-[#f2f0e7] p-5 border border-[#171412]/20">
                  <div className="text-[13px] font-bold text-[#171412] mb-3 pb-2 border-b border-[#171412]/15">
                    {t('ভর্তির বিবরণী (Admission Summary)', 'Admission Details')}
                  </div>
                  <dl className="space-y-2.5 text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-[#171412]/70">{t('শিক্ষার্থীর নাম', 'Student Name')}</dt>
                      <dd className="font-bold text-[#171412]">{confirmed.firstName} {confirmed.lastName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#171412]/70">{t('ক্যাটাগরি', 'Category')}</dt>
                      <dd className="font-semibold text-[#813502]">{confirmed.selectedCourseCategory || currentCourse.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#171412]/70">{t('ক্লাস সময়কাল', 'Duration')}</dt>
                      <dd className="font-semibold text-[#171412]">{currentCourse.duration}</dd>
                    </div>
                    {confirmed.promoCode && (
                      <div className="flex justify-between text-[#1b5e20] font-semibold">
                        <dt>{t('ব্যবহৃত প্রোমো কোড', 'Promo Code Applied')}</dt>
                        <dd>{confirmed.promoCode} (-৳{confirmed.discountAmount || 0})</dd>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-[#171412]/15 text-[15px] font-extrabold text-[#171412]">
                      <dt>{t('মোট প্রদেয় ফি', 'Total Payable Fee')}</dt>
                      <dd className="tabular-nums">৳{confirmed.finalFee || currentCourse.price}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Action Buttons: Change Course or Profile */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#171412]/15">
                <button
                  type="button"
                  onClick={() => setIsChangingCourse(true)}
                  className="text-[13px] font-bold text-[#813502] underline underline-offset-4 hover:text-[#171412] cursor-pointer"
                >
                  {t('কোর্স পরিবর্তন করতে চান? ক্লিক করুন', 'Want to switch to another course? Click here')}
                </button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    <span>👤</span>
                    <span>{t('আমার প্রোফাইল দেখুন', 'View My Profile')}</span>
                  </Button>
                  <Button
                    variant="orange"
                    onClick={() => setShowNavOptions(true)}
                  >
                    <span>{t('হোম পেজে যান', 'Go to Home')}</span>
                    <ArrowRightSvgIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
                STATE B: COURSE SELECTION & PROMO CODE STEP
            ========================================================================= */
            <div className="mb-10 text-left">
              <div className="flex items-center justify-between gap-2 pb-3 mb-6 border-b-2 border-[#171412]">
                <div>
                  <span className="text-[12px] font-extrabold text-[#813502] uppercase tracking-wider block">
                    {t('ধাপ ৩ · কোর্স ও ভর্তি নির্বাচন', 'Step 3 · Course & Enrollment Selection')}
                  </span>
                  <h2 className="font-display text-[22px] sm:text-[28px] font-extrabold text-[#171412] mt-0.5">
                    {t('কোন কোর্সে ভর্তি হতে চান?', 'Which course would you like to enroll in?')}
                  </h2>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="text-[12px] font-bold text-[#171412]/60">
                    {t('উপলব্ধ কোর্স', 'Available Courses')}
                  </span>
                  <span className="block font-display text-[20px] font-extrabold text-[#813502] tabular-nums">
                    {courses.length} টি কোর্স
                  </span>
                </div>
              </div>

              {loadingCourses ? (
                <div className="py-12 text-center text-[#171412] flex items-center justify-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#ff7722] animate-ping"></span>
                  <span className="font-display text-[16px] font-bold">
                    {t('কোর্স লোড হচ্ছে...', 'Loading available courses...')}
                  </span>
                </div>
              ) : (
                <>
                  {/* Course Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {courses.map((course) => {
                      const isSelected = course.id === selectedCourseId;
                      return (
                        <div
                          key={course.id}
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            if (promoResult) {
                              const reEval = evaluatePromoCode(
                                promoCodeInput,
                                course,
                                promoCodes
                              );
                              setPromoResult(reEval.isValid ? reEval : null);
                            }
                          }}
                          className={`rounded-[18px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#fbf9ef] border-[#171412] shadow-md ring-2 ring-[#ff7722]/50 scale-[1.01]'
                              : 'bg-[#fbf9ef]/70 border-[#171412]/25 hover:border-[#171412] hover:bg-[#fff]'
                          }`}
                        >
                          <div>
                            {/* Top Badge & Radio */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="text-[11px] font-extrabold text-[#813502] uppercase tracking-wider">
                                {course.category}
                              </span>

                              <div className="flex items-center gap-2">
                                {course.badge && (
                                  <span className="px-2 py-0.5 rounded-[50px] bg-[#ff7722] text-[#171412] text-[10px] font-extrabold">
                                    {course.badge}
                                  </span>
                                )}
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'border-[#171412] bg-[#171412] text-[#fbf9ef]'
                                      : 'border-[#171412]/40 bg-[#fff]'
                                  }`}
                                >
                                  {isSelected && <span className="text-[11px]">✓</span>}
                                </div>
                              </div>
                            </div>

                            {/* Title & Tagline */}
                            <h3 className="font-display text-[18px] font-extrabold text-[#171412] leading-snug mb-2">
                              {course.title}
                            </h3>
                            <p className="text-[13px] text-[#171412]/75 leading-relaxed mb-4">
                              {course.subtitle}
                            </p>

                            {/* Highlights list */}
                            <ul className="space-y-1.5 mb-5 text-[12px] text-[#171412]/85">
                              {course.highlights.slice(0, 3).map((h, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-[#813502] font-bold">·</span>
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Price & Duration footer */}
                          <div className="pt-3 border-t border-[#171412]/15 flex items-end justify-between">
                            <div>
                              <span className="text-[11px] text-[#171412]/60 block font-medium">
                                {course.duration}
                              </span>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="font-display text-[22px] font-extrabold text-[#171412] tabular-nums">
                                  ৳{course.discountPrice !== undefined ? course.discountPrice.toLocaleString('bn-BD') : course.price.toLocaleString('bn-BD')}
                                </span>
                                {course.discountPrice !== undefined && course.discountPrice < course.price && (
                                  <span className="text-[12px] text-[#171412]/50 line-through tabular-nums">
                                    ৳{course.price}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={`text-[12px] font-bold px-2.5 py-1 rounded-[50px] transition-colors ${
                                isSelected
                                  ? 'bg-[#171412] text-[#fbf9ef]'
                                  : 'bg-[#f2f0e7] text-[#171412]'
                              }`}
                            >
                              {isSelected ? t('বাছাইকৃত', 'Selected') : t('সিলেক্ট করুন', 'Select')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code & Fee Calculation Box */}
                  <div className="rounded-[18px] bg-[#fbf9ef] border-2 border-[#171412] p-5 sm:p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#171412]/15 mb-4">
                      <div>
                        <div className="font-display text-[16px] font-extrabold text-[#171412]">
                          {t('প্রোমো কোড ও বিশেষ ছাড় (Promo Code)', 'Promo Code & Discount')}
                        </div>
                        <div className="text-[13px] text-[#171412]/75 mt-0.5">
                          {t(
                            'আপনার কাছে কোনো প্রোমো কোড থাকলে নিচে লিখুন এবং ছাড় উপভোগ করুন।',
                            'Have a promo code? Enter it below to unlock special discount.'
                          )}
                        </div>
                      </div>

                      {/* Promo Code Input & Apply Button */}
                      <div className="flex items-center gap-2 max-w-sm w-full">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => {
                            setPromoCodeInput(e.target.value.toUpperCase());
                            if (promoError) setPromoError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyPromo();
                            }
                          }}
                          placeholder={t('প্রোমো কোড লিখুন...', 'e.g. PROMO1000')}
                          className="flex-1 min-h-[44px] px-3.5 py-2 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] font-bold text-[#171412] uppercase placeholder:normal-case placeholder:font-normal placeholder:text-[#171412]/40 focus:border-[#ff7722] focus:outline-none"
                        />
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleApplyPromo()}
                        >
                          {t('প্রয়োগ করুন', 'Apply')}
                        </Button>
                      </div>
                    </div>

                    {/* Quick promo code suggestions / demo chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-[12px]">
                      <span className="font-bold text-[#813502]">
                        {t('💡 উপলব্ধ কোডসমূহ (ক্লিক করে ব্যবহার করুন):', '💡 Available codes (click to apply):')}
                      </span>
                      {promoCodes.filter((p) => p.isActive).map((promo) => (
                        <button
                          key={promo.id}
                          type="button"
                          onClick={() => {
                            setPromoCodeInput(promo.code);
                            handleApplyPromo(promo.code);
                          }}
                          className="px-2.5 py-1 rounded-[50px] bg-[#f2f0e7] hover:bg-[#ffc765] border border-[#171412]/20 font-mono font-bold text-[#171412] cursor-pointer transition-colors"
                        >
                          {promo.code} ({promo.discountType === 'percentage' ? `${promo.discountValue}%` : `৳${promo.discountValue}`} ছাড়)
                        </button>
                      ))}
                    </div>

                    {/* Promo feedback message */}
                    {promoError && (
                      <div
                        role="alert"
                        className="p-3 rounded-[10px] bg-[#fff8f8] border border-[#ff3c34] text-[#ff3c34] text-[13px] font-semibold flex items-center gap-2 mb-4"
                      >
                        <AlertCircleSvgIcon className="w-4 h-4 shrink-0" />
                        <span>{promoError}</span>
                      </div>
                    )}

                    {promoResult && promoResult.isValid && (
                      <div
                        role="status"
                        className="p-3 rounded-[10px] bg-[#e8f5e9] border border-[#2e7d32] text-[#1b5e20] text-[13px] font-bold flex items-center gap-2 mb-4"
                      >
                        <CheckSvgIcon className="w-4 h-4 shrink-0 text-[#2e7d32]" />
                        <span>{promoResult.message}</span>
                      </div>
                    )}

                    {/* Final Fee Calculation Summary */}
                    {currentCourse && (
                      <div className="pt-3 border-t border-[#171412]/15 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-[13px]">
                          <span className="text-[#171412]/70">{t('নির্বাচিত কোর্স:', 'Selected Course:')} </span>
                          <span className="font-bold text-[#171412]">{currentCourse.title}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          {promoResult && promoResult.isValid && promoResult.discountAmount > 0 && (
                            <div className="text-right">
                              <span className="text-[11px] text-[#1b5e20] font-bold block">
                                ছাড়: -৳{promoResult.discountAmount}
                              </span>
                              <span className="text-[12px] text-[#171412]/50 line-through tabular-nums">
                                ৳{currentCourse.discountPrice || currentCourse.price}
                              </span>
                            </div>
                          )}

                          <div className="text-right">
                            <span className="text-[11px] text-[#171412]/70 font-semibold block">
                              {t('মোট প্রদেয় ফি', 'Total Payable Fee')}
                            </span>
                            <span className="font-display text-[26px] font-extrabold text-[#813502] tabular-nums">
                              ৳{calculateEffectiveFee().toLocaleString('bn-BD')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission Button */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {isChangingCourse && (
                      <Button
                        variant="outline"
                        onClick={() => setIsChangingCourse(false)}
                      >
                        {t('বাতিল করুন', 'Cancel')}
                      </Button>
                    )}

                    <div className="ml-auto">
                      <Button
                        variant="orange"
                        size="lg"
                        isLoading={isSubmittingEnrollment}
                        loadingText={t('ভর্তি নিশ্চিত করা হচ্ছে...', 'Confirming enrollment...')}
                        onClick={handleConfirmEnrollment}
                      >
                        <span>{t('এই কোর্সে ভর্তি নিশ্চিত করুন', 'Confirm Course Enrollment')}</span>
                        <ArrowRightSvgIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Choice / Navigation Cards beneath */}
          <div className="mt-8 pt-8 border-t border-[#171412]/15 max-w-xl mx-auto">
            <div className="text-[13px] font-bold text-[#813502] mb-4 text-center">
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
                    {t('হোম পেজ', 'Home Page')}
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
                    'ভর্তিকৃত কোর্স, ব্যক্তিগত তথ্য ও এডমিশন সার্টিফিকেট দেখুন।',
                    'View enrolled course, profile info, and admission certificate.'
                  )}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Options Modal triggered when clicking "হোম পেজে যান" */}
      {showNavOptions && (
        <div
          role="dialog"
          aria-modal="true"
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
                <h3 className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#171412]">
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

            <div className="flex flex-col gap-3.5 mb-6">
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
                        'প্রোফাইল তথ্য, নির্বাচিত কোর্স ও সার্টিফিকেট ডাউনলোড অপশন',
                        'View personal details, enrolled course, and certificate download'
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-[#813502] text-[18px]">→</span>
              </button>
            </div>

            <div className="text-right">
              <Button variant="outline" onClick={() => setShowNavOptions(false)}>
                {t('বন্ধ করুন', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
