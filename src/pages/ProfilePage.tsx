import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { loadConfirmedWaitlist, ConfirmedWaitlistRecord } from '../services/waitlist';
import { fetchCoursesList } from '../services/courses';
import { CourseItem } from '../config/courses';
import { Button } from '../components/Button';
import { CheckSvgIcon, ArrowRightSvgIcon } from '../components/svg/NavIcons';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [confirmed, setConfirmed] = useState<ConfirmedWaitlistRecord | null>(() =>
    loadConfirmedWaitlist()
  );
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [completedModules, setCompletedModules] = useState<Record<number, boolean>>({ 0: true });

  useEffect(() => {
    fetchCoursesList().then(setCourses);
  }, []);

  if (!confirmed) {
    return (
      <main id="main-content" className="py-20 bg-[#fbf9ef] text-[#171412] text-center">
        <div className="specimen-container max-w-lg">
          <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] p-8 sm:p-10">
            <span className="text-[40px] block mb-3">👤</span>
            <h1 className="font-display text-[26px] sm:text-[32px] font-extrabold text-[#171412] mb-3">
              {t('প্রোফাইল খুঁজে পাওয়া যায়নি', 'No Profile Found')}
            </h1>
            <p className="text-[14px] text-[#171412]/80 mb-6 leading-relaxed">
              {t(
                'আপনি এখনও রেজিস্ট্রেশন বা ইমেইল যাচাই সম্পন্ন করেননি। অনুগ্রহ করে প্রথমে জয়েন করুন।',
                'You have not completed registration or email verification yet. Please join the waitlist first.'
              )}
            </p>
            <Button variant="orange" size="lg" onClick={() => navigate('/join')}>
              {t('রেজিস্ট্রেশন করুন', 'Register Now')}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Find enrolled course
  const enrolledCourse =
    courses.find((c) => c.id === confirmed.selectedCourseId) ||
    courses[0]; // fallback to first course if none explicitly bound yet

  const toggleModule = (index: number) => {
    setCompletedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const highlights = enrolledCourse?.highlights || [
    'জিরো ইনভেন্টরি রিসেলিং মেথডোলজি',
    'ভেরিফাইড লোকাল ও গ্লোবাল হোলসেল সাপ্লায়ার তালিকা',
    'প্রতি অর্ডারে ৩০০–১,৫০০ টাকা নিশ্চিত নিট মার্জিন',
  ];

  const completedCount = Object.values(completedModules).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / highlights.length) * 100);

  return (
    <main id="main-content" className="py-10 md:py-16 bg-[#fbf9ef] text-[#171412]">
      <div className="specimen-container max-w-4xl">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#171412]/15 mb-8">
          <div>
            <span className="text-[12px] font-extrabold text-[#813502] uppercase tracking-wider block">
              {t('শিক্ষার্থী ড্যাশবোর্ড · লার্নিং সেন্টার', 'Student Dashboard · Learning Center')}
            </span>
            <h1 className="font-display text-[30px] sm:text-[38px] font-extrabold text-[#171412]">
              {confirmed.firstName} {confirmed.lastName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/waitlist-confirmed"
              className="px-4 py-2.5 rounded-[50px] bg-[#ff7722] text-[#171412] text-[13px] font-bold border border-[#171412] hover:bg-[#ff8f44] transition-colors shadow-xs"
            >
              {confirmed.selectedCourseId
                ? t('কোর্স পরিবর্তন করুন', 'Change Course')
                : t('কোর্স বেছে নিন', 'Choose Course')}
            </Link>
          </div>
        </div>

        {/* =========================================================================
            PROMINENT ONGOING COURSE CARD WITH LIVE PROGRESS & 3D SVG ANIMATION
        ========================================================================= */}
        <div className="rounded-[28px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-8 mb-8 shadow-[6px_6px_0px_#171412]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#171412]/15 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#2e7d32]/20 text-[#1b5e20] border border-[#2e7d32]/40 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-ping" />
                {t('চলমান কোর্স · লাইভ ব্যাচ', 'Ongoing Course · Live Batch')}
              </span>
              <h2 className="font-display text-[24px] sm:text-[30px] font-extrabold text-[#171412]">
                {confirmed.selectedCourseTitle || enrolledCourse?.title || t('ড্রপশিপিং ও রিসেলিং মাস্টারক্লাস', 'Dropshipping & Reselling Masterclass')}
              </h2>
            </div>

            <div className="text-right bg-[#fbf9ef] border-2 border-[#171412] rounded-2xl p-3.5 shadow-xs">
              <span className="text-[11px] font-extrabold text-[#813502] uppercase block">
                {t('লার্নিং প্রোগ্রেস', 'Learning Progress')}
              </span>
              <span className="font-display text-[24px] font-black text-[#171412] tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#fbf9ef] border-2 border-[#171412] rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[#ff7722] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Interactive Module Checklist (Custom SVG Animated Nodes) */}
            <div className="rounded-[20px] bg-[#fbf9ef] border-2 border-[#171412] p-5 shadow-xs">
              <div className="text-[13px] font-extrabold text-[#813502] uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>{t('মডিউল ও অ্যাকশন সিট (Interactive Modules)', 'Interactive Action Modules & Seats')}</span>
                <span className="text-[11px] text-[#171412]/65 font-bold">({completedCount}/{highlights.length} সম্পন্ন)</span>
              </div>

              <div className="space-y-2.5">
                {highlights.map((highlight, idx) => {
                  const isDone = Boolean(completedModules[idx]);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleModule(idx)}
                      className={`p-3 rounded-[12px] border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isDone
                          ? 'bg-[#e8f5e9] border-[#2e7d32] text-[#1b5e20]'
                          : 'bg-[#f2f0e7]/70 border-[#171412]/20 hover:border-[#171412]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Custom 3D SVG Animated Checkmark Node */}
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-[13px] transition-transform ${
                            isDone
                              ? 'bg-[#2e7d32] text-white border-[#1b5e20] scale-110'
                              : 'bg-white text-[#171412] border-[#171412]/40'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[13px] font-bold ${isDone ? 'line-through opacity-85' : 'text-[#171412]'}`}>
                          {highlight}
                        </span>
                      </div>

                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 border border-[#171412]/15">
                        {isDone ? t('সম্পন্ন', 'Done') : t('বাকি', 'Pending')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom 3D SVG Animation / Live Interactive Seat & Action Stage */}
            <div className="rounded-[20px] bg-[#16110D] border-2 border-[#171412] p-5 text-[#f6ede1] flex flex-col justify-between shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7722]/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#ff7722]">
                    {t('৩ডি অ্যানিমেশন সিট ও লাইভ স্ট্যাটাস', '3D SVG Seat & Live Status')}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#ff7722] animate-pulse" />
                </div>
                <h3 className="font-display text-[18px] font-extrabold text-[#f6ede1] mb-2">
                  {t('লাইভ সিট ও মডিউল অ্যাক্টিভেশন', 'Live Seat & Module Activation')}
                </h3>
                <p className="text-[13px] text-[#f6ede1]/75 leading-relaxed mb-4">
                  {t(
                    'আপনার লার্নিং সিট অ্যাক্টিভ রয়েছে। ওপরের মডিউল চেক বক্সে ক্লিক করে আপনার প্রোগ্রেস আপডেট করুন — ৩ডি অ্যানিমেশন সিট স্বয়ংক্রিয়ভাবে আপডেট হবে।',
                    'Your learning seat is fully active. Click module checkboxes to update your progress in real-time.'
                  )}
                </p>
              </div>

              {/* Custom SVG 3D Animated Illustration Graphic */}
              <div className="py-4 flex justify-center items-center">
                <svg className="w-48 h-28" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Isometric Laptop Base */}
                  <path d="M30 80L100 100L170 80L150 65L100 75L50 65L30 80Z" fill="#EF7F3C" stroke="#F6EDE1" strokeWidth="3" />
                  <rect x="50" y="30" width="100" height="45" rx="6" fill="#211A14" stroke="#F6EDE1" strokeWidth="3" />
                  {/* Screen Glow & Graph */}
                  <path d="M65 55L85 45L105 52L135 38" stroke="#F6C974" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Animated Indicator Pin */}
                  <circle cx="135" cy="38" r="5" fill="#EF7F3C" className="animate-ping" />
                  <circle cx="135" cy="38" r="5" fill="#EF7F3C" />
                </svg>
              </div>

              <div className="pt-3 border-t border-[#f6ede1]/15 flex items-center justify-between text-[12px]">
                <span className="text-[#f6ede1]/60">{t('ব্যাচ স্ট্যাটাস: একটিভ', 'Batch Status: Active')}</span>
                <span className="font-bold text-[#ff7722]">ID: #{confirmed.email.slice(0, 6)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#171412]/15">
            <div className="text-[13px] font-bold text-[#171412]/80">
              {t('প্রোমো কোড ব্যবহার বা কোর্স ফি সম্পর্কিত সহায়তার জন্য সাপোর্টে যোগাযোগ করুন।', 'Need help with promo codes or course admission? Contact support.')}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
              >
                {t('সাপোর্ট নিন', 'Get Support')}
              </Button>
              <Button
                variant="orange"
                onClick={() => navigate('/waitlist-confirmed')}
              >
                <span>{t('ভর্তি রসিদ ও ছাড় দেখুন', 'View Admission Receipt')}</span>
                <ArrowRightSvgIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Personal Details Table Card */}
        <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-8 text-left mb-8 shadow-sm">
          <div className="text-[12px] font-extrabold text-[#813502] uppercase tracking-wider pb-3 border-b border-[#171412]/15 mb-4">
            {t('ব্যক্তিগত তথ্য বিবরণী', 'Personal Information')}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
            <div>
              <dt className="text-[12px] text-[#171412]/65">{t('পূর্ণ নাম', 'Full Name')}</dt>
              <dd className="font-bold text-[#171412] text-[15px] mt-0.5">{confirmed.firstName} {confirmed.lastName}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-[#171412]/65">{t('ইমেইল', 'Email')}</dt>
              <dd className="font-medium text-[#171412] mt-0.5 break-all">{confirmed.email}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-[#171412]/65">{t('ফোন / হোয়াটসঅ্যাপ', 'Phone / WhatsApp')}</dt>
              <dd className="font-semibold text-[#171412] mt-0.5 tabular-nums">{confirmed.whatsapp || confirmed.phone}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-[#171412]/65">{t('জন্ম তারিখ', 'Date of Birth')}</dt>
              <dd className="font-semibold text-[#171412] mt-0.5 tabular-nums">{confirmed.dateOfBirth}</dd>
            </div>
          </dl>
        </div>

        {/* Action back home */}
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            {t('হোম পেজে ফিরে যান', 'Back to Home')}
          </Button>
        </div>
      </div>
    </main>
  );
};
