import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CourseItem, PromoCodeItem, evaluatePromoCode, incrementPromoUsage, fetchPromoCodesList } from '../services/courses';
import { fetchSiteSectionContent } from '../services/admin';
import { UserSession } from '../services/auth';
import { submitStudentEnrollment } from '../services/enrollments';
import { AlertCircleSvgIcon, CheckSvgIcon } from './svg/NavIcons';
import { X, Copy, CreditCard, Ticket } from 'lucide-react';

interface CourseEnrollmentModalProps {
  course: CourseItem;
  user: UserSession;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({ course, user, onClose, onSuccess }) => {
  const [step, setStep] = useState<'CHOICE' | 'PAYMENT' | 'PROMO' | 'SUCCESS'>('CHOICE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [senderPhone, setSenderPhone] = useState(user.phone || '');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Promo state
  const [promoCode, setPromoCode] = useState('');
  const [promoCodesList, setPromoCodesList] = useState<PromoCodeItem[]>([]);
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);

  const [paymentNumbers, setPaymentNumbers] = useState<{ bKash: string; Nagad: string }>({
    bKash: '01886-234567',
    Nagad: '01712-345678',
  });

  useEffect(() => {
    fetchPromoCodesList().then(setPromoCodesList);
    fetchSiteSectionContent('payment_settings', paymentNumbers).then(data => {
      if (data && (data.bKash || data.Nagad)) {
        setPaymentNumbers(data);
      }
    });
  }, []);

  const handleCashPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!senderPhone.trim() || !trxId.trim()) {
      setError('পেমেন্ট তথ্য প্রদান করুন।');
      return;
    }

    setLoading(true);
    const finalFee = course.discountPrice ?? course.price;

    const res = await submitStudentEnrollment({
      courseId: course.id,
      courseTitle: course.title,
      courseCategory: course.category,
      studentName: `${user.firstName} ${user.lastName}`.trim(),
      studentPhone: user.phone,
      studentEmail: user.email,
      district: user.district,
      enrollmentType: 'payment',
      paymentMethod: paymentMethod,
      senderPhone: senderPhone.trim(),
      trxId: trxId.trim().toUpperCase(),
      amountPaid: finalFee,
    });

    setLoading(false);
    if (res.success) {
      setStep('SUCCESS');
    } else {
      setError(res.error || 'ভর্তি আবেদন জমা দেওয়া সম্ভব হয়নি।');
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = promoCode.trim().toUpperCase();
    if (!clean) {
      setError('প্রোমো কোড প্রদান করুন।');
      return;
    }

    setIsVerifyingPromo(true);
    const validation = evaluatePromoCode(clean, course, promoCodesList);
    setIsVerifyingPromo(false);

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setLoading(true);
    
    // If it's a valid promo code, we submit the enrollment
    // If it makes the course 100% free, we proceed to success
    // If it's a partial discount, the user might still need to pay? 
    // The requirement said "প্রোমো কোডের মাধ্যমে ঢুকতে হয় তাহলে প্রোমো কোড দেখাবে".
    // Usually, promo codes are for free access in this specific flow according to user description.
    
    const res = await submitStudentEnrollment({
      courseId: course.id,
      courseTitle: course.title,
      courseCategory: course.category,
      studentName: `${user.firstName} ${user.lastName}`.trim(),
      studentPhone: user.phone,
      studentEmail: user.email,
      district: user.district,
      enrollmentType: 'promo_only',
      promoCodeUsed: clean,
      amountPaid: validation.finalPrice,
    });

    if (res.success) {
      await incrementPromoUsage(clean);
      setStep('SUCCESS');
    } else {
      setError(res.error || 'ভর্তি আবেদন জমা দেওয়া সম্ভব হয়নি।');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full h-full sm:h-auto sm:max-w-lg rounded-none sm:rounded-[32px] overflow-y-auto sm:overflow-hidden shadow-2xl relative"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'CHOICE' && (
              <motion.div 
                key="choice"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#059669]/10 rounded-2xl flex items-center justify-center text-[#059669] mx-auto mb-4">
                    <CreditCard size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">ভর্তির মাধ্যম নির্বাচন করুন</h2>
                  <p className="text-sm text-gray-500">আপনার সুবিধাজনক পেমেন্ট পদ্ধতি বেছে নিন</p>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => setStep('PAYMENT')}
                    className="p-6 rounded-2xl border border-gray-100 hover:border-[#059669] hover:bg-[#059669]/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-[#059669]/10 group-hover:text-[#059669]">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">পেমেন্ট (Payment)</p>
                        <p className="text-xs text-gray-500">বিকাশ বা নগদের মাধ্যমে পেমেন্ট করুন</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setStep('PROMO')}
                    className="p-6 rounded-2xl border border-gray-100 hover:border-[#059669] hover:bg-[#059669]/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-[#059669]/10 group-hover:text-[#059669]">
                        <Ticket size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">প্রোমো কোড (Promo Code)</p>
                        <p className="text-xs text-gray-500">যদি আপনার কাছে কোনো স্পেশাল ডিসকাউন্ট কোড থাকে</p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'PAYMENT' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setStep('CHOICE')} className="p-2 -ml-2 text-gray-400 hover:text-gray-900">
                    <X size={20} className="rotate-45" />
                  </button>
                  <h3 className="font-bold text-gray-900">পেমেন্ট নিশ্চিত করুন</h3>
                </div>

                <div className="p-5 bg-[#f0fdf4] rounded-2xl border border-[#059669]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-600">পরিশোধযোগ্য মূল্য:</span>
                    <span className="text-2xl font-black text-[#059669]">৳{(course.discountPrice ?? course.price).toLocaleString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {(['bKash', 'Nagad'] as const).map(m => (
                      <button 
                        key={m} 
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${paymentMethod === m ? 'bg-[#059669] border-[#059669] text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{paymentMethod} Send Money নম্বর</p>
                      <p className="font-mono font-bold text-gray-900">{paymentNumbers[paymentMethod as keyof typeof paymentNumbers]}</p>
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(paymentNumbers[paymentMethod as keyof typeof paymentNumbers]); setCopiedNumber(true); setTimeout(() => setCopiedNumber(false), 2000); }}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      {copiedNumber ? 'কপি হয়েছে!' : 'কপি করুন'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCashPaymentSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                      <AlertCircleSvgIcon className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">সেন্ডার নম্বর *</label>
                    <input 
                      required 
                      value={senderPhone} 
                      onChange={(e) => setSenderPhone(e.target.value)}
                      type="tel" 
                      placeholder="01XXXXXXXXX" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#059669] outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Transaction ID (TrxID) *</label>
                    <input 
                      required 
                      value={trxId} 
                      onChange={(e) => setTrxId(e.target.value)}
                      type="text" 
                      placeholder="যেমন: 9K8J7H6G5F" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#059669] outline-none transition-all uppercase font-mono" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-[#059669] text-white font-black rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'প্রসেসিং হচ্ছে...' : 'আবেদন নিশ্চিত করুন'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'PROMO' && (
              <motion.div 
                key="promo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setStep('CHOICE')} className="p-2 -ml-2 text-gray-400 hover:text-gray-900">
                    <X size={20} className="rotate-45" />
                  </button>
                  <h3 className="font-bold text-gray-900">প্রোমো কোড ব্যবহার করুন</h3>
                </div>

                <form onSubmit={handlePromoSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                      <AlertCircleSvgIcon className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500">আপনার প্রোমো কোডটি দিন *</label>
                    <input 
                      required 
                      value={promoCode} 
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      type="text" 
                      placeholder="e.g. FREEJOIN" 
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 focus:border-[#059669] outline-none transition-all uppercase font-mono text-center text-xl font-black tracking-widest" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || isVerifyingPromo}
                    className="w-full py-4 bg-[#059669] text-white font-black rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isVerifyingPromo ? 'যাচাই করা হচ্ছে...' : loading ? 'আবেদন জমা হচ্ছে...' : 'প্রোমো কোড প্রয়োগ করুন'}
                  </button>
                </form>

                <p className="text-[10px] text-center text-gray-400 font-medium px-8">
                  সঠিক প্রোমো কোড দিলে আপনি সরাসরি এই কোর্সে ভর্তির আবেদন করতে পারবেন। আমাদের ফেসবুক গ্রুপ বা পেজ থেকে প্রোমো কোড সংগ্রহ করতে পারেন।
                </p>
              </motion.div>
            )}

            {step === 'SUCCESS' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
                  <CheckSvgIcon className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">আবেদন সফল হয়েছে!</h3>
                  <p className="text-sm text-gray-500 leading-relaxed px-4">
                    আপনার আবেদনটি পেন্ডিং হিসেবে গ্রহণ করা হয়েছে। অ্যাডমিন প্যানেল থেকে যাচাই করার পর আপনাকে কনফার্ম করা হবে।
                  </p>
                </div>
                <button 
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-[#059669] transition-colors"
                >
                  ঠিক আছে
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
