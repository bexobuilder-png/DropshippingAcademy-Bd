import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentUserSession, UserSession } from '../services/auth';
import { Button } from '../components/Button';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [session, setSession] = useState<UserSession | null>(() =>
    getCurrentUserSession()
  );

  if (!session) {
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
            <Button variant="orange" size="lg" onClick={() => navigate('/registration')}>
              {t('রেজিস্ট্রেশন করুন', 'Register Now')}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="py-10 md:py-16 bg-[#fbf9ef] text-[#171412]">
      <div className="specimen-container max-w-2xl">
        
        {/* Simple Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#ff7722]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#ff7722]/20 text-3xl shadow-xs">
            👤
          </div>
          <h1 className="font-display text-[32px] sm:text-[40px] font-extrabold text-[#171412]">
            {session.firstName} {session.lastName}
          </h1>
          <p className="text-[#171412]/60 font-bold uppercase tracking-widest text-[11px] mt-1">
            {t('শিক্ষার্থী প্রোফাইল', 'Student Profile')}
          </p>
        </div>

        {/* Personal Details Card */}
        <div className="rounded-[28px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-10 text-left mb-8 shadow-[6px_6px_0px_#171412]">
          <div className="text-[12px] font-extrabold text-[#813502] uppercase tracking-wider pb-4 border-b border-[#171412]/15 mb-6 flex items-center justify-between">
            <span>{t('ব্যক্তিগত তথ্য বিবরণী', 'Personal Information')}</span>
            <span className="text-[#171412]/40">ID: #{session.email.slice(0, 6).toUpperCase()}</span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-[15px]">
            <div className="space-y-1">
              <dt className="text-[12px] font-bold text-[#171412]/50 uppercase tracking-tight">{t('পূর্ণ নাম', 'Full Name')}</dt>
              <dd className="font-extrabold text-[#171412] text-[17px]">{session.firstName} {session.lastName}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-[12px] font-bold text-[#171412]/50 uppercase tracking-tight">{t('ইমেইল', 'Email')}</dt>
              <dd className="font-bold text-[#171412] break-all">{session.email}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-[12px] font-bold text-[#171412]/50 uppercase tracking-tight">{t('ফোন / হোয়াটসঅ্যাপ', 'Phone / WhatsApp')}</dt>
              <dd className="font-bold text-[#171412] tabular-nums">{session.whatsapp || session.phone}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-[12px] font-bold text-[#171412]/50 uppercase tracking-tight">{t('ঠিকানা / জেলা', 'District / Address')}</dt>
              <dd className="font-bold text-[#171412]">{session.district || 'N/A'}</dd>
            </div>
            
            <div className="space-y-1 sm:col-span-2 pt-4 border-t border-[#171412]/5">
              <dt className="text-[12px] font-bold text-[#171412]/50 uppercase tracking-tight">{t('রেজিস্ট্রেশন স্ট্যাটাস', 'Registration Status')}</dt>
              <dd className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ca8a04]/15 text-[#854d0e] border border-[#ca8a04]/30">
                <span className="w-2 h-2 rounded-full bg-[#ca8a04] animate-pulse" />
                {session.status === 'pending' ? t('যাচাই চলছে', 'Verification Pending') : session.status}
              </dd>
            </div>
          </dl>
        </div>

        {/* Action back home */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/')}>
            {t('হোম পেজে ফিরে যান', 'Back to Home')}
          </Button>
          <Button variant="orange" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/contact')}>
            {t('সাপোর্ট নিন', 'Get Support')}
          </Button>
        </div>
      </div>
    </main>
  );
};
