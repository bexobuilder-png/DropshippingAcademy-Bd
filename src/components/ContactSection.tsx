import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './Button';
import { CheckSvgIcon } from './svg/NavIcons';
import { fetchContactSettings, submitContactMessage, ContactItem, DEFAULT_CONTACT_ITEMS } from '../services/contact';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const [contactItems, setContactItems] = useState<ContactItem[]>(DEFAULT_CONTACT_ITEMS);
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchContactSettings().then((items) => {
      if (isMounted) setContactItems(items);
    });

    // Listen to custom local update event
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ContactItem[]>;
      if (customEvent.detail && isMounted) {
        setContactItems(customEvent.detail);
      }
    };
    window.addEventListener('contact-settings-updated', handleLocalUpdate as EventListener);

    // Supabase Realtime Subscription
    let channel: any = null;
    if (isSupabaseConfigured) {
      try {
        channel = supabase
          .channel('public:contact_settings')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'contact_settings' },
            () => {
              fetchContactSettings().then((items) => {
                if (isMounted) setContactItems(items);
              });
            }
          )
          .subscribe();
      } catch {
        // Ignore subscription errors
      }
    }

    // Listen for highlight trigger from navbar / hero buttons
    const handleHighlightContact = () => {
      setHighlighted(true);
      setTimeout(() => setHighlighted(false), 2000);
    };
    window.addEventListener('highlight-contact', handleHighlightContact);

    return () => {
      isMounted = false;
      window.removeEventListener('contact-settings-updated', handleLocalUpdate as EventListener);
      window.removeEventListener('highlight-contact', handleHighlightContact);
      if (channel && isSupabaseConfigured) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !contactInfo.trim() || !message.trim()) {
      setFormError(t('দয়া করে নাম, যোগাযোগ তথ্য এবং বার্তা পূরণ করুন।', 'Please fill in your name, contact info, and message.'));
      return;
    }

    setIsSubmitting(true);
    const res = await submitContactMessage({
      name,
      contact_info: contactInfo,
      message,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setName('');
      setContactInfo('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 6000);
    } else {
      setFormError(res.error || t('বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'Failed to send message. Please try again.'));
    }
  };

  const getHrefAndTarget = (item: ContactItem) => {
    const val = item.value.trim();
    switch (item.type) {
      case 'email':
        return { href: `mailto:${val}`, target: '_self' };
      case 'phone':
        return { href: `tel:${val.replace(/\s+/g, '')}`, target: '_self' };
      case 'whatsapp':
        const cleanNumber = val.replace(/[^0-9]/g, '');
        return { href: `https://wa.me/${cleanNumber}`, target: '_blank' };
      case 'facebook':
      case 'telegram':
      case 'website':
        const url = val.startsWith('http') ? val : `https://${val}`;
        return { href: url, target: '_blank' };
      default:
        return { href: '#', target: '_self' };
    }
  };

  const visibleItems = contactItems
    .filter((item) => item.visible && item.value.trim())
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <section
      id="contact"
      aria-label="Contact channels"
      className={`py-16 md:py-24 bg-[#f2f0e7] text-[#171412] border-t border-[#171412]/15 scroll-mt-20 transition-all duration-500 ${
        highlighted ? 'ring-4 ring-[#ff7722] bg-[#ffc765]/20' : ''
      }`}
    >
      <div className="specimen-container">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#fbf9ef] border border-[#171412]/25 text-[#813502] text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
            {t('যোগাযোগের মাধ্যম', 'Contact Channels')}
          </span>
          <h2 className="font-display text-[32px] sm:text-[44px] font-extrabold text-[#171412] leading-[1.1] tracking-[-0.03em] mb-4">
            {t('আমাদের সাথে সরাসরি যোগাযোগ করুন', 'Connect With Our Support Team')}
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#171412]/80 font-medium leading-[1.5]">
            {t(
              'কোর্স, এনরোলমেন্ট বা যেকোনো বিষয়ে সহযোগিতার প্রয়োজন হলে নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করতে পারেন।',
              'Need help with enrollment or course details? Connect with our dedicated support team via any channel below.'
            )}
          </p>
        </div>

        {/* Dynamic Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {visibleItems.map((item) => {
            const { href, target } = getHrefAndTarget(item);
            const isClickable = item.type !== 'address' && item.type !== 'hours' && item.type !== 'custom';

            return (
              <div
                key={item.id}
                className="p-6 rounded-[16px] bg-[#fbf9ef] border border-[#171412]/20 hover:border-[#ff7722] transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#ff7722]/15 text-[#813502] border border-[#171412]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {item.type === 'whatsapp' && (
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.942 2.796.943 3.182 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.768-5.769-5.768zm3.364 8.163c-.141.396-.713.727-1.026.772-.313.045-.719.064-2.179-.533-1.46-.597-2.385-2.096-2.456-2.19-.071-.094-.576-.767-.576-1.464 0-.697.365-1.039.495-1.18.13-.141.284-.177.378-.177.094 0 .189.001.272.005.087.005.203-.033.317.241.118.283.402.981.437 1.052.035.071.059.153.012.247-.047.094-.071.153-.142.236-.071.082-.149.183-.213.246-.071.071-.145.148-.062.29.083.142.368.608.79 1.002.544.509 1.004.667 1.146.738.142.071.224.059.307-.035.082-.095.354-.413.448-.555.094-.141.189-.118.318-.071.13.047.826.39.968.461.142.071.236.106.271.165.035.059.035.342-.106.738z" />
                      </svg>
                    )}
                    {item.type === 'phone' && (
                      <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                    {item.type === 'email' && (
                      <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {(item.type === 'hours' || item.type === 'address' || item.type === 'facebook' || item.type === 'telegram' || item.type === 'website' || item.type === 'custom') && (
                      <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-display text-[18px] font-extrabold text-[#171412] mb-1">
                    {item.label.split('/')[0].trim()}
                  </h3>
                  <p className="text-[13px] text-[#171412]/75 font-medium mb-3 break-all">
                    {item.value}
                  </p>
                </div>

                {isClickable ? (
                  <a
                    href={href}
                    target={target}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#813502] hover:text-[#ff7722] hover:underline cursor-pointer"
                  >
                    <span>{t('যোগাযোগ করুন', 'Access Channel')}</span>
                    <span>→</span>
                  </a>
                ) : (
                  <span className="text-[13px] font-bold text-[#813502]">
                    {t('সক্রিয় ও উপলব্ধ', 'Active & Available')}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Inquiry Form */}
        <div className="max-w-2xl mx-auto rounded-[20px] bg-[#fbf9ef] border-2 border-[#171412] p-6 sm:p-10 shadow-md">
          <div className="mb-6 text-center sm:text-left">
            <h3 className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#171412] mb-2">
              {t('দ্রুত বার্তা পাঠান', 'Send a Quick Message')}
            </h3>
            <p className="text-[14px] text-[#171412]/75 font-medium">
              {t(
                'আপনার প্রশ্ন বা মতামত লিখে পাঠান, আমরা অতি শীঘ্রই আপনার সাথে যোগাযোগ করব।',
                'Fill out this form and our support executive will respond shortly.'
              )}
            </p>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-[10px] bg-[#fff8f8] border border-[#ff3c34] text-[#ff3c34] text-[13px] font-bold">
              {formError}
            </div>
          )}

          {submitted ? (
            <div
              role="status"
              className="p-4 rounded-[12px] bg-[#ff7722]/15 border border-[#ff7722] text-[#813502] flex items-center gap-3 font-bold text-[14px]"
            >
              <CheckSvgIcon className="w-5 h-5 shrink-0" />
              <span>
                {t(
                  'ধন্যবাদ! আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। অ্যাডমিন প্যানেলে জমা হয়েছে এবং আমরা দ্রুত যোগাযোগ করব।',
                  'Thank you! Your message has been saved to the admin panel. We will contact you soon.'
                )}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-[13px] font-bold text-[#171412] mb-1.5">
                    {t('আপনার নাম *', 'Your Name *')}
                  </label>
                  <input
                    id="contact-name"
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('যেমন: তানভীর আহমেদ', 'e.g. Tanvir Ahmed')}
                    className="w-full h-11 px-3.5 rounded-[10px] bg-[#ffffff] border border-[#171412]/25 text-[#171412] placeholder:text-[#171412]/45 text-[14px] focus:outline-none focus:border-[#ff7722]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-[13px] font-bold text-[#171412] mb-1.5">
                    {t('মোবাইল / হোয়াটসঅ্যাপ বা ইমেইল *', 'Phone / WhatsApp or Email *')}
                  </label>
                  <input
                    id="contact-phone"
                    required
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="01XXXXXXXXX / email@example.com"
                    className="w-full h-11 px-3.5 rounded-[10px] bg-[#ffffff] border border-[#171412]/25 text-[#171412] placeholder:text-[#171412]/45 text-[14px] focus:outline-none focus:border-[#ff7722]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[13px] font-bold text-[#171412] mb-1.5">
                  {t('আপনার জিজ্ঞাসা বা বার্তা *', 'Your Message or Question *')}
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('কোর্স বা ভর্তি বিষয়ে যা জানতে চান...', 'Tell us what you would like to know...')}
                  className="w-full p-3 rounded-[10px] bg-[#ffffff] border border-[#171412]/25 text-[#171412] placeholder:text-[#171412]/45 text-[14px] focus:outline-none focus:border-[#ff7722]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full h-12 rounded-[50px] bg-[#ff7722] hover:bg-[#e56310] text-[#171412] border-2 border-[#171412] font-display text-[15px] font-extrabold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
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
