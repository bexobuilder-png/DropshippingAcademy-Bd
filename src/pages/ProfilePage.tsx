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

  const enrolledCourse = courses.find((c) => c.id === confirmed.selectedCourseId);

  return (
    <main id="main-content" className="py-10 md:py-16 bg-[#fbf9ef] text-[#171412]">
      <div className="specimen-container max-w-3xl">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#171412]/15 mb-8">
          <div>
            <span className="text-[12px] font-extrabold text-[#813502] uppercase tracking-wider block">
              {t('শিক্ষার্থী প্রোফাইল · ড্যাশবোর্ড', 'Student Profile · Dashboard')}
            </span>
            <h1 className="font-display text-[30px] sm:text-[38px] font-extrabold text-[#171412]">
              {confirmed.firstName} {confirmed.lastName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/waitlist-confirmed"
              className="px-4 py-2 rounded-[50px] bg-[#ff7722] text-[#171412] text-[13px] font-bold border border-[#171412] hover:bg-[#ff8f44] transition-colors"
            >
              {confirmed.selectedCourseId
                ? t('কোর্স পরিবর্তন করুন', 'Change Course')
                : t('কোর্স বেছে নিন', 'Choose Course')}
            </Link>
          </div>
        </div>

        {/* Admission & Enrolled Course Card */}
        <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#171412]/15 mb-6">
            <div>
              <span className="text-[11px] font-extrabold text-[#813502] uppercase tracking-wider block">
                {t('ভর্তিকৃত কোর্স স্ট্যাটাস', 'Enrollment Status')}
              </span>
              <h2 className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#171412] mt-0.5">
                {confirmed.selectedCourseTitle || t('কোনো কোর্স এখনও নির্বাচন করা হয়নি', 'No Course Selected Yet')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32]"></span>
              <span className="text-[13px] font-bold text-[#1b5e20]">
                {confirmed.selectedCourseId ? t('ভর্তি নিশ্চিত', 'Enrolled') : t('অপেক্ষমাণ', 'Pending Selection')}
              </span>
            </div>
          </div>

          {confirmed.selectedCourseId ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                <div className="p-4 rounded-[14px] bg-[#fbf9ef] border border-[#171412]/20">
                  <span className="text-[12px] text-[#171412]/60 block">{t('ক্যাটাগরি', 'Category')}</span>
                  <span className="font-bold text-[#813502] text-[15px]">{confirmed.selectedCourseCategory}</span>
                </div>

                <div className="p-4 rounded-[14px] bg-[#fbf9ef] border border-[#171412]/20">
                  <span className="text-[12px] text-[#171412]/60 block">{t('মোট কোর্স ফি', 'Total Fee')}</span>
                  <span className="font-display text-[18px] font-extrabold text-[#171412] tabular-nums">
                    ৳{confirmed.finalFee || confirmed.courseFee}
                  </span>
                  {confirmed.promoCode && (
                    <span className="text-[11px] text-[#1b5e20] font-bold ml-2">
                      ({confirmed.promoCode} ছাড়)
                    </span>
                  )}
                </div>
              </div>

              {enrolledCourse?.highlights && (
                <div className="pt-2">
                  <span className="text-[13px] font-bold text-[#171412] block mb-2">
                    {t('কারিকুলাম ও মডিউল:', 'Curriculum & Modules:')}
                  </span>
                  <ul className="space-y-1.5 text-[13px] text-[#171412]/80">
                    {enrolledCourse.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#813502] font-bold">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[14px] text-[#171412]/75 mb-4">
                {t(
                  'আপনি রেজিস্ট্রেশন সম্পন্ন করেছেন কিন্তু এখনও কোর্স বাছাই করেননি। এখনই আপনার পছন্দের কোর্সে ভর্তি নিশ্চিত করুন।',
                  'You completed registration but haven\'t chosen a course yet. Select your course now.'
                )}
              </p>
              <Button variant="orange" onClick={() => navigate('/waitlist-confirmed')}>
                {t('কোর্স বেছে নিন', 'Choose Course Now')}
              </Button>
            </div>
          )}
        </div>

        {/* Personal Details Table Card */}
        <div className="rounded-[20px] bg-[#f2f0e7] border-2 border-[#171412] p-6 text-left mb-8">
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
