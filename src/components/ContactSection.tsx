import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './Button';
import { Input } from './Input';
import { CheckSvgIcon } from './svg/NavIcons';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 6000);
    }, 600);
  };

  return (
    <section
      id="contact"
      aria-label="Contact channels"
      className="py-16 md:py-24 bg-[#08121e] text-white border-t border-white/10 scroll-mt-20"
    >
      <div className="specimen-container">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#00d27a]/15 border border-[#00d27a]/30 text-[#00d27a] text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00d27a] animate-pulse"></span>
            {t('যোগাযোগের মাধ্যম', 'Contact Channels')}
          </span>
          <h2 className="font-display text-[32px] sm:text-[44px] font-extrabold text-white leading-[1.1] tracking-[-0.03em] mb-4">
            {t('আমাদের সাথে সরাসরি যোগাযোগ করুন', 'Connect With Our Support Team')}
          </h2>
          <p className="text-[16px] sm:text-[18px] text-slate-300 font-medium leading-[1.5]">
            {t(
              'কোর্স, এনরোলমেন্ট বা যেকোনো বিষয়ে সহযোগিতার প্রয়োজন হলে নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করতে পারেন।',
              'Need help with enrollment or course details? Connect with our dedicated support team via any channel below.'
            )}
          </p>
        </div>

        {/* 4 Quick Contact Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {/* Channel 1: WhatsApp */}
          <div className="p-6 rounded-[16px] bg-[#0d1e33] border border-white/10 hover:border-[#00d27a]/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#00d27a]/15 text-[#00d27a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.942 2.796.943 3.182 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.768-5.769-5.768zm3.364 8.163c-.141.396-.713.727-1.026.772-.313.045-.719.064-2.179-.533-1.46-.597-2.385-2.096-2.456-2.19-.071-.094-.576-.767-.576-1.464 0-.697.365-1.039.495-1.18.13-.141.284-.177.378-.177.094 0 .189.001.272.005.087.005.203-.033.317.241.118.283.402.981.437 1.052.035.071.059.153.012.247-.047.094-.071.153-.142.236-.071.082-.149.183-.213.246-.071.071-.145.148-.062.29.083.142.368.608.79 1.002.544.509 1.004.667 1.146.738.142.071.224.059.307-.035.082-.095.354-.413.448-.555.094-.141.189-.118.318-.071.13.047.826.39 968.461.142.071.236.106.271.165.035.059.035.342-.106.738z" />
                </svg>
              </div>
              <h3 className="font-display text-[18px] font-extrabold text-white mb-1">
                {t('হোয়াটসঅ্যাপ সাপোর্ট', 'WhatsApp Chat')}
              </h3>
              <p className="text-[13px] text-slate-300 font-medium mb-3">
                {t('যেকোনো সময় সরাসরি মেসেজ দিন আমাদের অফিসিয়াল সাপোর্টে।', 'Instant real-time support from our verified counselors.')}
              </p>
            </div>
            <a
              href="https://wa.me/8801800000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00d27a] hover:underline cursor-pointer"
            >
              <span>{t('চ্যাট শুরু করুন', 'Chat on WhatsApp')}</span>
              <span>→</span>
            </a>
          </div>

          {/* Channel 2: Direct Hotline */}
          <div className="p-6 rounded-[16px] bg-[#0d1e33] border border-white/10 hover:border-[#00d27a]/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#00d27a]/15 text-[#00d27a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-display text-[18px] font-extrabold text-white mb-1">
                {t('হটলাইন ও ফোন কল', 'Hotline & Direct Call')}
              </h3>
              <p className="text-[13px] text-slate-300 font-medium mb-3">
                {t('+৮৮০ ১৮০০-০০০০০০ (সকাল ১০:০০ - রাত ১০:০০)', '+880 1800-000000 (10 AM - 10 PM daily)')}
              </p>
            </div>
            <a
              href="tel:+8801800000000"
              className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00d27a] hover:underline cursor-pointer"
            >
              <span>{t('সরাসরি কল দিন', 'Call Hotline')}</span>
              <span>→</span>
            </a>
          </div>

          {/* Channel 3: Official Email */}
          <div className="p-6 rounded-[16px] bg-[#0d1e33] border border-white/10 hover:border-[#00d27a]/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#00d27a]/15 text-[#00d27a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display text-[18px] font-extrabold text-white mb-1">
                {t('অফিশিয়াল ইমেইল', 'Official Email')}
              </h3>
              <p className="text-[13px] text-slate-300 font-medium mb-3 truncate">
                support@dropshippingacademy.io
              </p>
            </div>
            <a
              href="mailto:support@dropshippingacademy.io"
              className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00d27a] hover:underline cursor-pointer"
            >
              <span>{t('ইমেইল পাঠান', 'Send an Email')}</span>
              <span>→</span>
            </a>
          </div>

          {/* Channel 4: Support Hours & Location */}
          <div className="p-6 rounded-[16px] bg-[#0d1e33] border border-white/10 hover:border-[#00d27a]/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#00d27a]/15 text-[#00d27a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-[18px] font-extrabold text-white mb-1">
                {t('২৪/৭ অনলাইন সাপোর্ট', '24/7 Online Support')}
              </h3>
              <p className="text-[13px] text-slate-300 font-medium mb-3">
                {t('ঢাকা, বাংলাদেশ (অনলাইন ও লাইভ ল্যাব)', 'Dhaka, Bangladesh · Live Online Labs')}
              </p>
            </div>
            <span className="text-[13px] font-bold text-slate-400">
              {t('সপ্তাহের ৭ দিন সক্রিয়', 'Active 7 Days a Week')}
            </span>
          </div>
        </div>

        {/* Quick Inquiry Form */}
        <div className="max-w-2xl mx-auto rounded-[20px] bg-[#0d1e33] border border-white/10 p-6 sm:p-10 shadow-2xl">
          <div className="mb-6 text-center sm:text-left">
            <h3 className="font-display text-[22px] sm:text-[26px] font-extrabold text-white mb-2">
              {t('দ্রুত বার্তা পাঠান', 'Send a Quick Message')}
            </h3>
            <p className="text-[14px] text-slate-300 font-medium">
              {t(
                'আপনার প্রশ্ন বা মতামত লিখে পাঠান, আমরা অতি শীঘ্রই আপনার সাথে যোগাযোগ করব।',
                'Fill out this form and our support executive will respond shortly.'
              )}
            </p>
          </div>

          {submitted ? (
            <div
              role="status"
              className="p-4 rounded-[12px] bg-[#00d27a]/20 border border-[#00d27a] text-[#00d27a] flex items-center gap-3 font-bold text-[14px]"
            >
              <CheckSvgIcon className="w-5 h-5 shrink-0" />
              <span>
                {t(
                  'ধন্যবাদ! আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমরা দ্রুত যোগাযোগ করব।',
                  'Thank you! Your inquiry has been received. We will contact you soon.'
                )}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-[13px] font-bold text-slate-200 mb-1.5">
                    {t('আপনার নাম *', 'Your Name *')}
                  </label>
                  <input
                    id="contact-name"
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('যেমন: তানভীর আহমেদ', 'e.g. Tanvir Ahmed')}
                    className="w-full h-11 px-3.5 rounded-[10px] bg-[#07111e] border border-white/20 text-white placeholder:text-white/40 text-[14px] focus:outline-none focus:border-[#00d27a]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-[13px] font-bold text-slate-200 mb-1.5">
                    {t('মোবাইল / হোয়াটসঅ্যাপ নম্বর *', 'Phone / WhatsApp *')}
                  </label>
                  <input
                    id="contact-phone"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full h-11 px-3.5 rounded-[10px] bg-[#07111e] border border-white/20 text-white placeholder:text-white/40 text-[14px] focus:outline-none focus:border-[#00d27a]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-[13px] font-bold text-slate-200 mb-1.5">
                  {t('ইমেইল ঠিকানা (ঐচ্ছিক)', 'Email Address (Optional)')}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3.5 rounded-[10px] bg-[#07111e] border border-white/20 text-white placeholder:text-white/40 text-[14px] focus:outline-none focus:border-[#00d27a]"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[13px] font-bold text-slate-200 mb-1.5">
                  {t('আপনার জিজ্ঞাসা বা বার্তা', 'Your Message or Question')}
                </label>
                <textarea
                  id="contact-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('কোর্স বা ভর্তি বিষয়ে যা জানতে চান...', 'Tell us what you would like to know...')}
                  className="w-full p-3 rounded-[10px] bg-[#07111e] border border-white/20 text-white placeholder:text-white/40 text-[14px] focus:outline-none focus:border-[#00d27a]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full h-12 rounded-[50px] bg-[#00d27a] hover:bg-[#00ba6c] text-[#07111e] font-display text-[15px] font-extrabold transition-all cursor-pointer shadow-lg shadow-[#00d27a]/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>{t('পাঠানো হচ্ছে...', 'Sending...')}</span>
                ) : (
                  <span>{t('বার্তা পাঠান →', 'Send Message →')}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
