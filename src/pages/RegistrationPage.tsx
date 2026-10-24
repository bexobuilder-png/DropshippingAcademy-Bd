import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { CourseItem, PromoCodeItem } from '../config/courses';
import { fetchCoursesList, fetchPromoCodesList, evaluatePromoCode, incrementPromoUsage, PromoValidationResult } from '../services/courses';
import { StudentEnrollment, verifyEmailOtpAndEnroll, submitStudentEnrollment } from '../services/enrollments';
import { sendEmailVerificationOtp, maskEmailAddress } from '../services/waitlist';
import { getCurrentUserSession, setCurrentUserSession } from '../services/auth';
import { OtpInput } from '../components/OtpInput';
import { Button } from '../components/Button';
import { ArrowRightSvgIcon, CheckSvgIcon, AlertCircleSvgIcon } from '../components/svg/NavIcons';
import { AnimKind } from '../components/EduAnimation';

type FlowStep = 'CATALOG' | 'FORM' | 'VERIFY' | 'PAYMENT' | 'SUCCESS';

const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export interface RegistrationPageProps {
  setAnim?: React.Dispatch<React.SetStateAction<null | AnimKind>>;
  setAnimRunKey?: React.Dispatch<React.SetStateAction<number>>;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ setAnim, setAnimRunKey }) => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // Navigation / Flow state
  const [step, setStep] = useState<FlowStep>('CATALOG');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ড্রপশিপিং অ্যান্ড রিসেলিং');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('ঢাকা');

  // Promo state (moves to Payment page)
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoValidationResult | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoCodesList, setPromoCodesList] = useState<PromoCodeItem[]>([]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // OTP state
  const [otpToken, setOtpToken] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Final state
  const [submittedData, setSubmittedData] = useState<StudentEnrollment | null>(null);
  const [formError, setFormError] = useState('');

  const PAYMENT_NUMBERS = {
    bKash: '01886-234567',
    Nagad: '01712-345678',
    Rocket: '01911-223344',
  };

  useEffect(() => {
    fetchCoursesList().then((list) => {
      const activeCourses = list.filter((c) => c.isActive !== false && c.isVisible !== false);
      setCourses(activeCourses);
      setLoadingCourses(false);

      // Handle courseId from URL
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get('courseId');
      if (courseId) {
        const found = activeCourses.find(c => c.id === courseId);
        if (found) {
          setSelectedCourse(found);
          setStep('FORM');
        }
      }
    });
    fetchPromoCodesList().then((codes) => setPromoCodesList(codes));
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const session = getCurrentUserSession();
    if (session && step === 'FORM') {
      setName(`${session.firstName} ${session.lastName}`);
      setEmail(session.email);
      setPhone(session.phone || '');
      setDistrict(session.district || 'ঢাকা');
      // If logged in, skip info/OTP and go to payment/enrollment
      setStep('PAYMENT');
    }
  }, [step]);

  // Re-validate applied promo code if user changes course selection
  useEffect(() => {
    if (selectedCourse && appliedPromo) {
      const result = evaluatePromoCode(appliedPromo.code || promoCode, selectedCourse, promoCodesList);
      if (result.isValid) {
        setAppliedPromo(result);
        setPromoError('');
      } else {
        setAppliedPromo(null);
        setPromoError(result.message || 'নতুন কোর্সের জন্য এই প্রোমো কোডটি কার্যকর নয়।');
      }
    }
  }, [selectedCourse]);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => c.category === activeCategory);
  }, [courses, activeCategory]);

  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourse(course);
    setStep('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyPromo = () => {
    setPromoError('');
    if (!selectedCourse) return;
    const clean = promoCode.trim().toUpperCase();
    if (!clean) {
      setPromoError('প্রোমো কোড প্রদান করুন।');
      setAppliedPromo(null);
      return;
    }

    const res = evaluatePromoCode(clean, selectedCourse, promoCodesList);
    if (res.isValid) {
      setAppliedPromo(res);
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError(res.message);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !phone.trim() || !email.trim() || !district.trim()) {
      setFormError('সবগুলো তথ্য পূরণ করুন।');
      return;
    }

    if (!email.includes('@')) {
      setFormError('সঠিক ইমেইল ঠিকানা দিন।');
      return;
    }

    setIsSendingOtp(true);
    if (setAnim) {
      if (setAnimRunKey) setAnimRunKey(k => k + 1);
      setAnim('submit');
    }
    
    const res = await sendEmailVerificationOtp(email);
    
    // Minimum wait for animation visibility
    await new Promise(resolve => setTimeout(resolve, 3600));
    
    setIsSendingOtp(false);
    if (setAnim) setAnim(null);

    if (res.success) {
      setStep('VERIFY');
      setResendCooldown(60);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormError(res.error || 'ভেরিফিকেশন কোড পাঠানো সম্ভব হয়নি।');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpToken.length !== 6) return;

    setIsVerifying(true);
    setOtpError('');

    const res = await verifyEmailOtpAndEnroll(otpToken, email, {
      courseId: selectedCourse!.id,
      courseTitle: selectedCourse!.title,
      courseCategory: selectedCourse!.category,
      studentName: name.trim(),
      studentPhone: phone.trim(),
      studentEmail: email.trim(),
      district: district.trim(),
      enrollmentType: 'payment',
      amountPaid: selectedCourse!.discountPrice ?? selectedCourse!.price,
    });

    setIsVerifying(false);
    if (res.success && res.enrollment) {
      setSubmittedData(res.enrollment);
      setStep('PAYMENT');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setOtpError(res.error || 'ভেরিফিকেশন ব্যর্থ হয়েছে। সঠিক কোড দিন।');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone.trim() || !trxId.trim()) {
      setFormError('পেমেন্ট তথ্য প্রদান করুন।');
      return;
    }

    setIsVerifying(true);
    setFormError('');

    // If promo code applied, increment usage atomically
    if (appliedPromo?.code) {
      await incrementPromoUsage(appliedPromo.code);
    }

    const originalFee = selectedCourse!.discountPrice ?? selectedCourse!.price;
    const finalFee = appliedPromo ? appliedPromo.finalPrice : originalFee;

    const finalPayload: StudentEnrollment = {
      id: submittedData?.id || `enr-${Date.now()}`,
      courseId: selectedCourse!.id,
      courseTitle: selectedCourse!.title,
      courseCategory: selectedCourse!.category,
      studentName: name.trim(),
      studentPhone: phone.trim(),
      studentEmail: email.trim(),
      district: district.trim(),
      enrollmentType: finalFee === 0 ? 'promo_only' : 'payment',
      promoCodeUsed: appliedPromo ? appliedPromo.code : undefined,
      paymentMethod: paymentMethod,
      senderPhone: senderPhone.trim(),
      trxId: trxId.trim().toUpperCase(),
      amountPaid: finalFee,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await submitStudentEnrollment(finalPayload);

    // Persist session for ProfilePage
    setCurrentUserSession({
      id: finalPayload.id,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      district: district.trim(),
      status: 'pending',
      registeredAt: finalPayload.createdAt,
    });

    if (setAnim) {
      if (setAnimRunKey) setAnimRunKey(k => k + 1);
      setAnim('success');
      await new Promise(resolve => setTimeout(resolve, 3800));
      setAnim(null);
    }

    setSubmittedData(finalPayload);
    setStep('SUCCESS');
    setIsVerifying(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSendingOtp(true);
    await sendEmailVerificationOtp(email);
    setIsSendingOtp(false);
    setResendCooldown(60);
  };

  const originalPrice = selectedCourse ? (selectedCourse.discountPrice ?? selectedCourse.price) : 0;
  const currentFinalPrice = appliedPromo ? appliedPromo.finalPrice : originalPrice;

  return (
    <main id="main-content" className="min-h-screen bg-[#fbf9ef] text-[#171412] pb-20">
      {/* Header */}
      <div className="bg-[#0b1712] text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black font-display mb-4 tracking-tight">
            {step === 'CATALOG' ? 'Select Your Course' : t('নিবন্ধন সম্পন্ন করুন', 'Complete Registration')}
          </h1>
          <p className="text-[#22c55e] font-bold text-lg md:text-xl">
            {step === 'CATALOG' 
              ? 'আপনার পছন্দের ক্যাটাগরি নির্বাচন করুন এবং কোর্স শুরু করুন'
              : t('আপনার সঠিক তথ্য দিয়ে ফরমটি পূরণ করুন', 'Fill the form with your correct information')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-[-50px] relative z-20">
        <AnimatePresence mode="wait">
          {/* STEP 1: CATALOG */}
          {step === 'CATALOG' && (
            <motion.div 
              key="catalog"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              className="space-y-12"
            >
              {/* Category Tabs */}

              <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                <button
                  onClick={() => setActiveCategory('ড্রপশিপিং অ্যান্ড রিসেলিং')}
                  className={`flex-1 p-6 rounded-2xl border transition-all flex items-center justify-center gap-4 ${
                    activeCategory === 'ড্রপশিপিং রিসেলিং'
                      ? 'bg-[#059669] border-[#171412] text-white shadow-[6px_6px_0px_#171412]'
                      : 'bg-white border-[#171412]/10 text-[#171412] hover:border-[#059669]'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${activeCategory === 'ড্রপশিপিং রিসেলিং' ? 'bg-white/20' : 'bg-[#f0fdf4]'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg">Dropshipping & Reselling</p>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">(ড্রপশিপিং অ্যান্ড রিসেলিং)</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveCategory('গ্লোবাল ড্রপশিপিং')}
                  className={`flex-1 p-6 rounded-2xl border transition-all flex items-center justify-center gap-4 ${
                    activeCategory === 'গ্লোবাল ড্রপশিপিং'
                      ? 'bg-[#059669] border-[#171412] text-white shadow-[6px_6px_0px_#171412]'
                      : 'bg-white border-[#171412]/10 text-[#171412] hover:border-[#059669]'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${activeCategory === 'গ্লোবাল ড্রপশিপিং' ? 'bg-white/20' : 'bg-[#f0fdf4]'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg">Global Dropshipping</p>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">(গ্লোবাল ড্রপশিপিং)</p>
                  </div>
                </button>
              </div>

              {/* Course Grid Header */}
              <div className="flex items-center justify-between border-b-2 border-[#059669]/10 pb-4">
                <div className="flex items-center gap-3 text-[#059669]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <h2 className="text-2xl font-black">{activeCategory} Courses</h2>
                </div>
                <span className="px-4 py-1 bg-[#f0fdf4] text-[#059669] font-bold text-sm rounded-full border border-[#059669]/20">
                  Total Courses: {filteredCourses.length}
                </span>
              </div>

              {loadingCourses ? (
                <div className="py-20 text-center font-bold text-[#059669]">লোড হচ্ছে...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((c) => (
                    <div key={c.id} className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300">
                      <div className="relative aspect-video bg-[#0b1712]">
                        <img 
                          src={c.thumbnailUrl || '/images/course_dropshipping_basic_1791567728755.jpg'} 
                          alt={c.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-[#059669] text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                            {c.badge || 'New'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 text-[#171412] group-hover:text-[#059669] transition-colors">{c.title}</h3>
                        <p className="text-sm text-[#171412]/60 mb-6 line-clamp-2">{c.subtitle || c.description}</p>
                        
                        <div className="flex items-center gap-6 mb-8 text-[11px] font-bold text-[#171412]/50">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>{c.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            <span>{c.highlights?.length || 10} Lessons</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectCourse(c)}
                          className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          Select Course
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#f0fdf4] border border-[#059669]/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                  </div>
                  <div>
                    <p className="font-bold text-[#171412]">নির্বাচিত কোর্সে ভর্তি হতে "Select Course" বাটনে ক্লিক করুন।</p>
                    <p className="text-sm text-[#171412]/60">আপনার যাত্রা শুরু হোক সফলতার দিকে!</p>
                  </div>
                </div>
                <div className="text-[#059669] font-black text-xl italic flex items-center gap-2">
                  Dream <span className="text-[#171412]/20">→</span> Learn <span className="text-[#171412]/20">→</span> Earn
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: FORM */}
          {step === 'FORM' && selectedCourse && (
            <motion.div 
              key="form"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#171412] shadow-[8px_8px_0px_#171412] overflow-hidden"
            >
              <div className="p-6 bg-[#fbf9ef] border-b-2 border-[#171412] flex items-center justify-between">
                <button onClick={() => setStep('CATALOG')} className="text-xs font-bold text-[#171412]/60 hover:text-[#059669]">← কোর্স পরিবর্তন</button>
                <span className="text-xs font-black uppercase tracking-widest bg-[#059669] text-white px-3 py-1 rounded-full">১ম ধাপ: ভর্তি ফরম</span>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-6 md:p-10 space-y-8">
                {formError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-3">
                    <AlertCircleSvgIcon className="w-5 h-5 shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#171412]/40 border-b border-[#171412]/5 pb-2">ব্যক্তিগত তথ্য</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#171412]">আপনার নাম *</label>
                      <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="যেমন: মোঃ সাব্বির" className="w-full px-4 py-3 rounded-xl border border-[#171412]/10 focus:border-[#059669] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#171412]">মোবাইল নম্বর *</label>
                      <input required value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="01XXXXXXXXX" className="w-full px-4 py-3 rounded-xl border border-[#171412]/10 focus:border-[#059669] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#171412]">ইমেইল ঠিকানা *</label>
                      <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="example@gmail.com" className="w-full px-4 py-3 rounded-xl border border-[#171412]/10 focus:border-[#059669] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#171412]">জেলা / ঠিকানা *</label>
                      <input required value={district} onChange={(e) => setDistrict(e.target.value)} type="text" placeholder="যেমন: ঢাকা" className="w-full px-4 py-3 rounded-xl border border-[#171412]/10 focus:border-[#059669] outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={isSendingOtp}
                    className="w-full py-4 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-black text-lg rounded-2xl border border-[#171412] shadow-[6px_6px_0px_#171412] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    {isSendingOtp ? 'কোড পাঠানো হচ্ছে...' : 'ভেরিফিকেশন কোড পাঠান →'}
                  </button>
                  <p className="text-center text-[10px] text-[#171412]/50 mt-4 font-medium italic">আপনার ইমেইলে একটি ৬-ডিজিটের গোপন কোড পাঠানো হবে।</p>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: VERIFY */}
          {step === 'VERIFY' && (
            <motion.div 
              key="verify"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              className="max-w-md mx-auto bg-white rounded-3xl border border-[#171412] shadow-[8px_8px_0px_#171412] p-8 md:p-10 space-y-8 text-center"
            >
              <div className="w-16 h-16 bg-[#059669]/10 text-[#059669] rounded-2xl border border-[#059669] mx-auto flex items-center justify-center text-3xl">📧</div>
              <div>
                <h3 className="text-2xl font-black mb-2">ইমেইল যাচাই করুন</h3>
                <p className="text-sm text-[#171412]/70 leading-relaxed">আমরা একটি ৬-ডিজিটের কোড পাঠিয়েছি <br/><strong className="text-[#171412]">{maskEmailAddress(email)}</strong> ঠিকানায়।</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <OtpInput value={otpToken} onChange={setOtpToken} disabled={isVerifying} error={otpError} />
                
                <div className="space-y-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={isVerifying || otpToken.length !== 6}
                    className="w-full py-3.5 bg-[#171412] hover:bg-[#2b2724] disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all shadow-lg"
                  >
                    {isVerifying ? 'যাচাই করা হচ্ছে...' : 'ভেরিফাই ও পেমেন্ট ধাপে যান →'}
                  </button>
                  
                  <button 
                    type="button" 
                    disabled={resendCooldown > 0 || isSendingOtp}
                    onClick={handleResendOtp}
                    className="text-xs font-bold text-[#171412]/60 hover:text-[#059669] disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `পুনরায় কোড পাঠান (${resendCooldown}s)` : 'আবার কোড পাঠান'}
                  </button>
                </div>
              </form>

              <button onClick={() => setStep('FORM')} className="text-xs font-bold text-[#171412]/40 hover:text-[#171412] underline">ইমেইল ঠিকানা ভুল? সংশোধন করুন</button>
            </motion.div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 'PAYMENT' && selectedCourse && (
            <motion.div 
              key="payment"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#171412] shadow-[8px_8px_0px_#171412] overflow-hidden"
            >
              <div className="p-6 bg-[#f0fdf4] border-b-2 border-[#171412] flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest bg-[#059669] text-white px-3 py-1 rounded-full">
                  {selectedCourse.enrollmentType === 'promo_only' ? 'প্রমো কোড ব্যবহার করুন' : '৩য় ধাপ: পেমেন্ট ও প্রমো কোড'}
                </span>
                <span className="text-xs font-bold text-[#171412]/60 truncate ml-4">কোর্স: {selectedCourse.title}</span>
              </div>
              
              <form onSubmit={handlePaymentSubmit} className="p-6 md:p-10 space-y-8">
                {formError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-3">
                    <AlertCircleSvgIcon className="w-5 h-5 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* 1. Course Summary */}
                <div className="p-6 bg-[#fbf9ef] rounded-2xl border border-[#171412]/10 space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#059669] bg-[#f0fdf4] px-2.5 py-1 rounded-md border border-[#059669]/20">
                        {selectedCourse.category}
                      </span>
                      <h3 className="text-xl font-black text-[#171412] mt-2">{selectedCourse.title}</h3>
                      <p className="text-xs text-[#171412]/60">{selectedCourse.duration}</p>
                    </div>

                    {selectedCourse.enrollmentType !== 'promo_only' && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#171412]/50 block">মূল কোর্স ফি</span>
                        {appliedPromo ? (
                          <div className="space-y-0.5">
                            <span className="line-through text-sm font-bold text-[#171412]/40 mr-2">৳{originalPrice.toLocaleString()}</span>
                            <span className="text-2xl sm:text-3xl font-black text-[#059669]">৳{currentFinalPrice.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-black text-[#171412]">৳{originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PROMO CODE SECTION */}
                  <div className="pt-4 border-t-2 border-dashed border-[#171412]/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#171412] flex items-center gap-1.5">
                        <span>🎟️ {selectedCourse.enrollmentType === 'promo_only' ? 'কোর্সে জয়েন হতে প্রমো কোড দিন *' : 'প্রমো কোড আছে? (Promotional Discount)'}</span>
                      </label>
                      {appliedPromo && (
                        <span className="text-xs font-bold text-[#059669] bg-[#f0fdf4] px-2.5 py-0.5 rounded-full border border-[#059669]/20 animate-pulse">
                          ✓ {appliedPromo.percentage === 100 ? 'FREE JOIN' : `${appliedPromo.percentage}% OFF`} Applied
                        </span>
                      )}
                    </div>

                    {appliedPromo ? (
                      <div className="p-4 bg-[#f0fdf4] border border-[#059669] rounded-xl flex items-center justify-between gap-4 animate-fade-in">
                        <div className="space-y-1">
                          <p className="font-mono font-black text-sm text-[#059669] uppercase tracking-wider">
                            {appliedPromo.code}
                          </p>
                          <p className="text-xs font-bold text-[#059669]">
                            {appliedPromo.message}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs rounded-lg transition-all border border-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          value={promoCode} 
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError('');
                          }} 
                          type="text" 
                          placeholder="e.g. JOINFREE" 
                          className="flex-1 px-4 py-3 rounded-xl border border-[#171412]/15 focus:border-[#059669] outline-none uppercase font-mono text-sm font-bold bg-white" 
                        />
                        <button 
                          type="button" 
                          onClick={handleApplyPromo} 
                          className="px-5 py-3 bg-[#171412] text-white font-bold text-xs rounded-xl hover:bg-[#059669] transition-all shrink-0"
                        >
                          Apply Code
                        </button>
                      </div>
                    )}

                    {promoError && (
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1.5 animate-shake">
                        <AlertCircleSvgIcon className="w-4 h-4 shrink-0" />
                        <span>{promoError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Payment Method Selection (Only if NOT promo_only AND finalPrice > 0) */}
                {selectedCourse.enrollmentType !== 'promo_only' && currentFinalPrice > 0 ? (
                  <div className="p-5 bg-white rounded-2xl border border-[#171412]/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">পেমেন্ট মেথড নির্বাচন করুন:</span>
                      <span className="text-sm font-black text-[#059669]">
                        পরিশোধযোগ্য: ৳{currentFinalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(['bKash', 'Nagad', 'Rocket'] as const).map(m => (
                        <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`py-3 rounded-xl border font-black text-xs transition-all ${paymentMethod === m ? 'bg-[#059669] border-[#171412] text-white shadow-[2px_2px_0px_#171412]' : 'bg-white border-[#171412]/5 text-[#171412]/40 hover:border-[#171412]/20'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 bg-[#fbf9ef] rounded-xl border border-dashed border-[#171412]/20 flex items-center justify-between gap-4">
                      <div className="min-w-0 text-left">
                        <span className="text-[10px] font-bold text-[#171412]/50 uppercase">{paymentMethod} Send Money নম্বর:</span>
                        <p className="font-mono font-black text-[#171412] truncate">{PAYMENT_NUMBERS[paymentMethod]}</p>
                      </div>
                      <button type="button" onClick={() => { navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod]); setCopiedNumber(true); setTimeout(() => setCopiedNumber(false), 2000); }} className="shrink-0 px-3 py-1.5 bg-white border border-[#171412] rounded-lg text-[10px] font-bold hover:bg-[#171412] hover:text-white transition-all">
                        {copiedNumber ? 'কপি হয়েছে!' : 'কপি করুন'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold">সেন্ডার নম্বর *</label>
                        <input required value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} type="tel" placeholder="01XXXXXXXXX" className="w-full px-3 py-2.5 rounded-xl border border-[#171412]/10 outline-none focus:border-[#059669]" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold">Transaction ID (TrxID) *</label>
                        <input required value={trxId} onChange={(e) => setTrxId(e.target.value)} type="text" placeholder="যেমন: 9K8J7H6G5F" className="w-full px-3 py-2.5 rounded-xl border border-[#171412]/10 outline-none focus:border-[#059669] uppercase font-mono" />
                      </div>
                    </div>
                  </div>
                ) : (
                  selectedCourse.enrollmentType === 'promo_only' && !appliedPromo ? (
                    <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center space-y-3">
                      <div className="text-3xl opacity-50">🎟️</div>
                      <p className="font-bold text-gray-500">অনুগ্রহ করে ভর্তির জন্য প্রমো কোডটি দিন।</p>
                      <p className="text-[10px] text-gray-400">এই কোর্সে শুধুমাত্র প্রমো কোড ব্যবহার করেই জয়েন হওয়া সম্ভব।</p>
                    </div>
                  ) : (
                    <div className="p-8 bg-[#f0fdf4] rounded-2xl border border-[#059669] text-center space-y-3 animate-fade-in">
                      <div className="text-3xl">🎁</div>
                      <p className="font-black text-[#059669]">সরাসরি জয়েন হওয়ার সুযোগ!</p>
                      <p className="text-xs font-bold text-[#059669]/60">আপনার জন্য এই কোর্সটি এখন উন্মুক্ত। সরাসরি ভর্তি সম্পন্ন করুন।</p>
                    </div>
                  )
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isVerifying || (selectedCourse.enrollmentType === 'promo_only' && !appliedPromo)}
                    className="w-full py-4 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-black text-lg rounded-2xl border border-[#171412] shadow-[6px_6px_0px_#171412] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    {isVerifying ? 'প্রসেসিং হচ্ছে...' : (
                      selectedCourse.enrollmentType === 'promo_only' || currentFinalPrice === 0
                        ? 'সরাসরি ভর্তি সম্পন্ন করুন →'
                        : 'পেমেন্ট ও ভর্তি নিশ্চিত করুন →'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'SUCCESS' && submittedData && (
            <motion.div 
              key="success"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              className="max-w-xl mx-auto bg-white rounded-3xl border border-[#171412] shadow-[10px_10px_0px_#22c55e] p-8 md:p-12 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-[#22c55e] text-white rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl animate-bounce">✓</div>
              <div>
                <h2 className="text-3xl font-black mb-2">রেজিস্ট্রেশন সফল! 🎉</h2>
                <p className="text-[#171412]/70 font-medium">অভিনন্দন <strong>{submittedData.studentName}</strong>! আপনার ভর্তি আবেদনটি পেন্ডিং হিসেবে জমা হয়েছে।</p>
              </div>

              <div className="p-6 bg-[#fbf9ef] rounded-2xl border border-[#171412] text-left space-y-4 font-mono text-xs">
                <div className="flex justify-between border-b border-[#171412]/5 pb-2">
                  <span className="text-[#171412]/50 font-sans">কোর্স:</span>
                  <span className="font-bold text-right">{submittedData.courseTitle}</span>
                </div>
                <div className="flex justify-between border-b border-[#171412]/5 pb-2">
                  <span className="text-[#171412]/50 font-sans">ট্র্যাকিং আইডি:</span>
                  <span className="font-bold">{submittedData.id}</span>
                </div>
                {submittedData.promoCodeUsed && (
                  <div className="flex justify-between border-b border-[#171412]/5 pb-2">
                    <span className="text-[#171412]/50 font-sans">প্রোমো কোড:</span>
                    <span className="font-black text-[#059669]">{submittedData.promoCodeUsed}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-[#171412]/5 pb-2">
                  <span className="text-[#171412]/50 font-sans">পরিশোধিত ফি:</span>
                  <span className="font-bold">৳{submittedData.amountPaid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-[#171412]/5 pb-2">
                  <span className="text-[#171412]/50 font-sans">পেমেন্ট স্ট্যাটাস:</span>
                  <span className="font-black text-[#ca8a04] px-2 py-0.5 bg-[#fef9c3] rounded">পেন্ডিং যাচাই</span>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <a 
                  href={`https://wa.me/8801886234567?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি ${submittedData.studentName}। "${submittedData.courseTitle}" কোর্সে রেজিস্ট্রেশন করেছি। ট্র্যাকিং আইডি: ${submittedData.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 bg-[#25D366] hover:bg-[#1ebc59] text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                >
                  <span>হোয়াটসঅ্যাপে নিশ্চিত করুন</span>
                </a>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full py-4 bg-[#171412] text-white font-black text-sm rounded-2xl hover:bg-[#059669] transition-all border border-[#171412] shadow-[6px_6px_0px_#171412] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  প্রোফাইল দেখুন
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};
