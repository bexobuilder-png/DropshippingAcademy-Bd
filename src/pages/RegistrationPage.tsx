import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CourseItem, PromoCodeItem } from '../config/courses';
import { fetchCoursesList, fetchPromoCodesList } from '../services/courses';
import { StudentEnrollment, verifyEmailOtpAndEnroll } from '../services/enrollments';
import { sendEmailVerificationOtp, maskEmailAddress } from '../services/waitlist';
import { OtpInput } from '../components/OtpInput';
import { Button } from '../components/Button';
import { ArrowRightSvgIcon, CheckSvgIcon, AlertCircleSvgIcon } from '../components/svg/NavIcons';

type FlowStep = 'CATALOG' | 'FORM' | 'VERIFY' | 'SUCCESS';

export const RegistrationPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // Navigation / Flow state
  const [step, setStep] = useState<FlowStep>('CATALOG');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('সব কোর্স');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
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
      setCourses(list.filter((c) => c.isActive !== false && c.isVisible !== false));
      setLoadingCourses(false);
    });
    fetchPromoCodesList().then((codes) => setPromoCodesList(codes));
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const filteredCourses = courses;

  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourse(course);
    setStep('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleValidatePromo = () => {
    setPromoError('');
    const cleaned = promoCode.trim().toUpperCase();
    if (!cleaned) {
      setPromoError('প্রমো কোড দিন');
      return;
    }

    // If course has a specific required promo code, enforce it
    if (selectedCourse?.requiredPromoCode && cleaned !== selectedCourse.requiredPromoCode.toUpperCase()) {
      setPromoError('এই কোর্সের জন্য প্রমো কোডটি সঠিক নয়');
      setPromoDiscount(null);
      return;
    }

    const match = promoCodesList.find((p) => p.code.toUpperCase() === cleaned && p.isActive);
    if (!match) {
      setPromoError('অকার্যকর প্রমো কোড');
      setPromoDiscount(null);
      return;
    }
    const basePrice = selectedCourse!.discountPrice ?? selectedCourse!.price;
    const discount = match.discountType === 'percentage' 
      ? Math.round((basePrice * match.discountValue) / 100) 
      : match.discountValue;
    setPromoDiscount(discount);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !email.includes('@')) {
      setFormError('সঠিক ইমেইল ঠিকানা দিন। ভেরিফিকেশন কোড পাঠানো হবে।');
      return;
    }

    const effectivePrice = Math.max(0, (selectedCourse!.discountPrice ?? selectedCourse!.price) - (promoDiscount ?? 0));
    const isPromoOnlyCourse = selectedCourse?.enrollmentType === 'promo_only';

    if (isPromoOnlyCourse && !promoDiscount) {
      setFormError('এই কোর্সে ভর্তি হতে ভ্যালিড প্রমো কোড বাধ্যতামূলক।');
      return;
    }
    
    if (!isPromoOnlyCourse && effectivePrice > 0 && (!senderPhone.trim() || !trxId.trim())) {
      setFormError('পেমেন্ট তথ্য (Sender Number ও TrxID) প্রদান করুন।');
      return;
    }

    setIsSendingOtp(true);
    const res = await sendEmailVerificationOtp(email);
    setIsSendingOtp(false);

    if (res.success) {
      setStep('VERIFY');
      setResendCooldown(60);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormError(res.error || 'ভেরিফিকেশন কোড পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpToken.length !== 6) return;

    setIsVerifying(true);
    setOtpError('');

    const effectivePrice = Math.max(0, (selectedCourse!.discountPrice ?? selectedCourse!.price) - (promoDiscount ?? 0));
    const isPromoOnlyMode = selectedCourse!.enrollmentType === 'promo_only' || effectivePrice === 0;

    const res = await verifyEmailOtpAndEnroll(otpToken, email, {
      courseId: selectedCourse!.id,
      courseTitle: selectedCourse!.title,
      courseCategory: selectedCourse!.category,
      studentName: name.trim(),
      studentPhone: phone.trim(),
      studentEmail: email.trim(),
      district: district.trim(),
      enrollmentType: isPromoOnlyMode ? 'promo_only' : 'payment',
      promoCodeUsed: promoDiscount !== null ? promoCode.trim().toUpperCase() : undefined,
      paymentMethod: !isPromoOnlyMode ? paymentMethod : undefined,
      senderPhone: !isPromoOnlyMode ? senderPhone.trim() : undefined,
      trxId: !isPromoOnlyMode ? trxId.trim() : undefined,
      amountPaid: effectivePrice,
    });

    setIsVerifying(false);
    if (res.success && res.enrollment) {
      setSubmittedData(res.enrollment);
      setStep('SUCCESS');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setOtpError(res.error || 'ভেরিফিকেশন ব্যর্থ হয়েছে। কোডটি আবার যাচাই করুন।');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSendingOtp(true);
    await sendEmailVerificationOtp(email);
    setIsSendingOtp(false);
    setResendCooldown(60);
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#fbf9ef] text-[#171412] pb-20">
      {/* Header */}
      <div className="bg-[#171412] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold font-display mb-4">
            {step === 'CATALOG' ? 'কোর্স নির্বাচন করুন' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}
          </h1>
          <p className="text-[#ff7722] font-bold text-sm md:text-base">
            {step === 'CATALOG' ? 'আপনার পছন্দের কোর্সটি বেছে নিন এবং সরাসরি ভর্তি হয়ে যান।' : selectedCourse?.title}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-[-40px]">
        {/* Step Indicator removed as per user request */}

        {/* STEP 1: CATALOG */}
        {step === 'CATALOG' && (
          <div className="space-y-8">

            {loadingCourses ? (
              <div className="py-20 text-center font-bold">লোড হচ্ছে...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((c) => (
                  <div key={c.id} className="bg-white rounded-3xl border-2 border-[#171412] shadow-[6px_6px_0px_#171412] overflow-hidden flex flex-col group hover:translate-y-[-4px] transition-all duration-300">
                    <div className="relative aspect-video bg-[#171412]">
                      <img 
                        src={c.thumbnailUrl || '/images/course_dropshipping_basic_1791567728755.jpg'} 
                        alt={c.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#171412] text-white text-[10px] font-bold rounded-full border border-white/20 uppercase tracking-widest">
                          {c.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">{c.title}</h3>
                        <p className="text-sm text-[#171412]/70 mb-4 line-clamp-2">{c.subtitle || c.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {c.highlights?.slice(0, 2).map((h, i) => (
                            <span key={i} className="text-[10px] font-bold bg-[#f2f0e7] px-2 py-1 rounded-md border border-[#171412]/5 flex items-center gap-1">
                              <span className="text-[#15803d]">✓</span> {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#171412]/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[#171412]/50 uppercase tracking-wider">কোর্স ফি</span>
                          <span className="text-xl font-black text-[#171412]">৳{c.discountPrice ?? c.price}</span>
                        </div>
                        <button
                          onClick={() => handleSelectCourse(c)}
                          className="px-6 py-3 bg-[#ff7722] hover:bg-[#ff6600] text-[#171412] font-black text-sm rounded-2xl border-2 border-[#171412] shadow-[3px_3px_0px_#171412] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                        >
                          ভর্তি হন →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: FORM */}
        {step === 'FORM' && selectedCourse && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border-2 border-[#171412] shadow-[8px_8px_0px_#171412] overflow-hidden">
            <div className="p-6 bg-[#fbf9ef] border-b-2 border-[#171412] flex items-center justify-between">
              <button onClick={() => setStep('CATALOG')} className="text-xs font-bold text-[#171412]/60 hover:text-[#ff7722]">← কোর্স পরিবর্তন</button>
              <span className="text-xs font-black uppercase tracking-widest bg-[#171412] text-white px-3 py-1 rounded-full">ভর্তি ফরম</span>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 md:p-10 space-y-8">
              {formError && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-3">
                  <AlertCircleSvgIcon className="w-5 h-5 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#171412]/40 border-b border-[#171412]/5 pb-2">ব্যক্তিগত তথ্য</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#171412]">আপনার নাম *</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="যেমন: মোঃ সাব্বির" className="w-full px-4 py-3 rounded-xl border-2 border-[#171412]/10 focus:border-[#ff7722] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#171412]">মোবাইল নম্বর *</label>
                    <input required value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="01XXXXXXXXX" className="w-full px-4 py-3 rounded-xl border-2 border-[#171412]/10 focus:border-[#ff7722] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#171412]">ইমেইল ঠিকানা * (ভেরিফিকেশন আবশ্যক)</label>
                    <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="example@gmail.com" className="w-full px-4 py-3 rounded-xl border-2 border-[#171412]/10 focus:border-[#ff7722] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#171412]">জেলা / ঠিকানা *</label>
                    <input required value={district} onChange={(e) => setDistrict(e.target.value)} type="text" placeholder="যেমন: ঢাকা" className="w-full px-4 py-3 rounded-xl border-2 border-[#171412]/10 focus:border-[#ff7722] outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#171412]/40 border-b border-[#171412]/5 pb-2">
                  {selectedCourse.enrollmentType === 'promo_only' ? 'প্রমো কোড ভেরিফিকেশন' : 'পেমেন্ট ও প্রমো কোড'}
                </h4>
                
                {/* Promo Code Section */}
                {(selectedCourse.enrollmentType === 'promo_only' || selectedCourse.enrollmentType === 'both' || (selectedCourse.enrollmentType === 'payment' && selectedCourse.promoCodeEligible)) && (
                  <div className="p-5 bg-[#f2f0e7] rounded-2xl border-2 border-[#171412]/10 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold">
                        {selectedCourse.enrollmentType === 'promo_only' ? 'ভর্তি হতে প্রমো কোড দিন *' : 'প্রমো কোড আছে কি? (ঐচ্ছিক ছাড়)'}
                      </label>
                      {promoDiscount !== null && <span className="text-xs font-bold text-[#15803d]">✓ কোড সফল! {promoDiscount > 0 ? `(৳${promoDiscount} ছাড়)` : ''}</span>}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={promoCode} 
                        onChange={(e) => setPromoCode(e.target.value)} 
                        type="text" 
                        placeholder={selectedCourse.requiredPromoCode || "PROMO1000"} 
                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#171412]/10 focus:border-[#ff7722] outline-none uppercase font-mono text-sm" 
                      />
                      <button type="button" onClick={handleValidatePromo} className="px-4 py-2.5 bg-[#171412] text-white font-bold text-xs rounded-xl hover:bg-[#ff7722] hover:text-[#171412] transition-all">যাচাই</button>
                    </div>
                    {promoError && <p className="text-[10px] font-bold text-red-500">{promoError}</p>}
                  </div>
                )}

                {/* Conditional Payment Section - Only show if not promo_only */}
                {selectedCourse.enrollmentType !== 'promo_only' && (
                  <div className="p-5 bg-white rounded-2xl border-2 border-[#171412]/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">পেমেন্ট মেথড:</span>
                      <span className="text-sm font-black text-[#ff7722]">
                        পরিশোধযোগ্য: ৳{Math.max(0, (selectedCourse.discountPrice ?? selectedCourse.price) - (promoDiscount ?? 0))}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(['bKash', 'Nagad', 'Rocket'] as const).map(m => (
                        <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`py-3 rounded-xl border-2 font-black text-xs transition-all ${paymentMethod === m ? 'bg-[#ff7722] border-[#171412] shadow-[2px_2px_0px_#171412]' : 'bg-white border-[#171412]/5 text-[#171412]/40 hover:border-[#171412]/20'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 bg-[#fbf9ef] rounded-xl border-2 border-dashed border-[#171412]/20 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#171412]/50 uppercase">{paymentMethod} Send Money নম্বর:</span>
                        <p className="font-mono font-black text-[#171412] truncate">{PAYMENT_NUMBERS[paymentMethod]}</p>
                      </div>
                      <button type="button" onClick={() => { navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod]); setCopiedNumber(true); setTimeout(() => setCopiedNumber(false), 2000); }} className="shrink-0 px-3 py-1.5 bg-white border-2 border-[#171412] rounded-lg text-[10px] font-bold hover:bg-[#171412] hover:text-white transition-all">
                        {copiedNumber ? 'কপি হয়েছে!' : 'কপি করুন'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold">সেন্ডার নম্বর *</label>
                        <input required value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} type="tel" placeholder="01XXXXXXXXX" className="w-full px-3 py-2.5 rounded-xl border-2 border-[#171412]/10 outline-none focus:border-[#ff7722]" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold">Transaction ID (TrxID) *</label>
                        <input required value={trxId} onChange={(e) => setTrxId(e.target.value)} type="text" placeholder="যেমন: 9K8J7H6G5F" className="w-full px-3 py-2.5 rounded-xl border-2 border-[#171412]/10 outline-none focus:border-[#ff7722] uppercase font-mono" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSendingOtp}
                  className="w-full py-4 bg-[#ff7722] hover:bg-[#ff6600] disabled:opacity-50 text-[#171412] font-black text-lg rounded-2xl border-2 border-[#171412] shadow-[6px_6px_0px_#171412] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  {isSendingOtp ? 'কোড পাঠানো হচ্ছে...' : 'ভেরিফিকেশন কোড পাঠান →'}
                </button>
                <p className="text-center text-[10px] text-[#171412]/50 mt-4 font-medium italic">আপনার ইমেইলে একটি ৬-ডিজিটের গোপন কোড পাঠানো হবে।</p>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: VERIFY */}
        {step === 'VERIFY' && (
          <div className="max-w-md mx-auto bg-white rounded-3xl border-2 border-[#171412] shadow-[8px_8px_0px_#171412] p-8 md:p-10 space-y-8 text-center">
            <div className="w-16 h-16 bg-[#ff7722]/10 text-[#ff7722] rounded-2xl border-2 border-[#ff7722] mx-auto flex items-center justify-center text-3xl">📧</div>
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
                  {isVerifying ? 'যাচাই করা হচ্ছে...' : 'ভেরিফাই ও ভর্তি নিশ্চিত করুন'}
                </button>
                
                <button 
                  type="button" 
                  disabled={resendCooldown > 0 || isSendingOtp}
                  onClick={handleResendOtp}
                  className="text-xs font-bold text-[#171412]/60 hover:text-[#ff7722] disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `পুনরায় কোড পাঠান (${resendCooldown}s)` : 'আবার কোড পাঠান'}
                </button>
              </div>
            </form>

            <button onClick={() => setStep('FORM')} className="text-xs font-bold text-[#171412]/40 hover:text-[#171412] underline">ইমেইল ঠিকানা ভুল? সংশোধন করুন</button>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'SUCCESS' && submittedData && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border-2 border-[#171412] shadow-[10px_10px_0px_#22c55e] p-8 md:p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-[#22c55e] text-white rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl animate-bounce">✓</div>
            <div>
              <h2 className="text-3xl font-black mb-2">রেজিস্ট্রেশন সফল! 🎉</h2>
              <p className="text-[#171412]/70 font-medium">অভিনন্দন <strong>{submittedData.studentName}</strong>! আপনার ভর্তি আবেদনটি পেন্ডিং হিসেবে জমা হয়েছে।</p>
            </div>

            <div className="p-6 bg-[#fbf9ef] rounded-2xl border-2 border-[#171412] text-left space-y-4 font-mono text-xs">
              <div className="flex justify-between border-b border-[#171412]/5 pb-2">
                <span className="text-[#171412]/50 font-sans">কোর্স:</span>
                <span className="font-bold text-right">{submittedData.courseTitle}</span>
              </div>
              <div className="flex justify-between border-b border-[#171412]/5 pb-2">
                <span className="text-[#171412]/50 font-sans">ট্র্যাকিং আইডি:</span>
                <span className="font-bold">{submittedData.id}</span>
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
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-[#171412] text-white font-bold text-sm rounded-xl hover:bg-[#2b2724] transition-all"
              >
                ড্যাশবোর্ড দেখুন
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
