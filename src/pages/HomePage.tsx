import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CURRICULUM_TABS_BN,
  CURRICULUM_TABS_EN,
  FAQ_ITEMS_BN,
  FAQ_ITEMS_EN,
  FEATURED_RESULTS_BN,
  FEATURED_RESULTS_EN,
  HERO_SLIDES_BN,
  HERO_SLIDES_EN,
  TESTIMONIALS_BN,
  TESTIMONIALS_EN,
  TOOL_CATEGORIES_BN,
  TOOL_CATEGORIES_EN,
  WHY_CHOOSE_US_ITEMS_BN,
  WHY_CHOOSE_US_ITEMS_EN,
  getCurriculumTabs,
  getFaqItems,
  getFeaturedResults,
  getHeroSlides,
  getTestimonials,
  getToolCategories,
  getWhyChooseUsItems,
} from '../config/content';
import { FounderProfile, getLocalizedFounderStory } from '../config/founders';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchFoundersList,
  fetchSiteSectionContent,
  loadLocalFounders,
  subscribeToRealtimeSiteContent,
} from '../services/admin';
import { saveHeroEmailPrefill } from '../services/waitlist';
import { Accordion } from '../components/Accordion';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { HeroSlider } from '../components/HeroSlider';
import { WhyChooseUsBar } from '../components/WhyChooseUsBar';
import { ContactSection } from '../components/ContactSection';
import { Section } from '../components/Section';
import { Tabs } from '../components/Tabs';
import { TestimonialCard } from '../components/TestimonialCard';
import { ArrowRightSvgIcon, CheckSvgIcon } from '../components/svg/NavIcons';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t } = useLanguage();

  const [heroEmail, setHeroEmail] = useState('');
  const [heroEmailError, setHeroEmailError] = useState('');
  const [showTeamBios, setShowTeamBios] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [foundersList, setFoundersList] = useState<FounderProfile[]>(() =>
    loadLocalFounders()
  );

  const [heroSlides, setHeroSlides] = useState(() => getHeroSlides(lang));
  const [whyChooseUs, setWhyChooseUs] = useState(() => getWhyChooseUsItems(lang));
  const [toolCategories, setToolCategories] = useState(() => getToolCategories(lang));
  const [featuredResults, setFeaturedResults] = useState(() => getFeaturedResults(lang));
  const [curriculumTabs, setCurriculumTabs] = useState(() => getCurriculumTabs(lang));
  const [testimonials, setTestimonials] = useState(() => getTestimonials(lang));
  const [faqItems, setFaqItems] = useState(() => getFaqItems(lang));

  useEffect(() => {
    let mounted = true;
    fetchFoundersList().then((list) => {
      if (mounted) setFoundersList(list);
    });

    const handleFoundersUpdated = () => {
      setFoundersList(loadLocalFounders());
    };
    window.addEventListener('founders-updated', handleFoundersUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('founders-updated', handleFoundersUpdated);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAllContent = () => {
      Promise.all([
        fetchSiteSectionContent('hero_slides_bn', HERO_SLIDES_BN),
        fetchSiteSectionContent('hero_slides_en', HERO_SLIDES_EN),
        fetchSiteSectionContent('why_choose_us_bn', WHY_CHOOSE_US_ITEMS_BN),
        fetchSiteSectionContent('why_choose_us_en', WHY_CHOOSE_US_ITEMS_EN),
        fetchSiteSectionContent('tool_categories_bn', TOOL_CATEGORIES_BN),
        fetchSiteSectionContent('tool_categories_en', TOOL_CATEGORIES_EN),
        fetchSiteSectionContent('featured_results_bn', FEATURED_RESULTS_BN),
        fetchSiteSectionContent('featured_results_en', FEATURED_RESULTS_EN),
        fetchSiteSectionContent('curriculum_tabs_bn', CURRICULUM_TABS_BN),
        fetchSiteSectionContent('curriculum_tabs_en', CURRICULUM_TABS_EN),
        fetchSiteSectionContent('testimonials_bn', TESTIMONIALS_BN),
        fetchSiteSectionContent('testimonials_en', TESTIMONIALS_EN),
        fetchSiteSectionContent('faq_items_bn', FAQ_ITEMS_BN),
        fetchSiteSectionContent('faq_items_en', FAQ_ITEMS_EN),
      ]).then(
        ([
          hsBn,
          hsEn,
          wcBn,
          wcEn,
          tcBn,
          tcEn,
          frBn,
          frEn,
          ctBn,
          ctEn,
          tsBn,
          tsEn,
          fqBn,
          fqEn,
        ]) => {
          if (!mounted) return;
          setHeroSlides(lang === 'bn' ? hsBn : hsEn);
          setWhyChooseUs(lang === 'bn' ? wcBn : wcEn);
          setToolCategories(lang === 'bn' ? tcBn : tcEn);
          setFeaturedResults(lang === 'bn' ? frBn : frEn);
          setCurriculumTabs(lang === 'bn' ? ctBn : ctEn);
          setTestimonials(lang === 'bn' ? tsBn : tsEn);
          setFaqItems(lang === 'bn' ? fqBn : fqEn);
        }
      );
    };

    loadAllContent();

    // Subscribe to real-time changes from the server/Supabase
    const unsubscribe = subscribeToRealtimeSiteContent(() => {
      if (mounted) {
        loadAllContent();
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [lang]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [location.hash]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroEmail.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setHeroEmailError(
        t(
          'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।',
          'Please enter a valid email address to continue.'
        )
      );
      return;
    }
    setHeroEmailError('');
    if (trimmed) {
      saveHeroEmailPrefill(trimmed);
    }
    navigate('/join');
  };

  const founderStory = getLocalizedFounderStory(lang);

  return (
    <main id="main-content" className="overflow-x-hidden bg-[#fbf9ef] text-[#171412]">
      {/* =====================================================================
          1. HERO SECTION (Full-Width Interactive Slider Immediately Upon Entry)
      ===================================================================== */}
      <section
        id="hero"
        aria-label="Hero slider introduction"
        className="relative pt-6 pb-12 md:pt-10 md:pb-16 lg:pt-12 lg:pb-20 scroll-mt-20"
      >
        <div className="specimen-container relative">
          {/* Main Hero Slider */}
          <div className="mb-6 lg:mb-8">
            <HeroSlider
              slides={heroSlides}
              onCtaClick={() => navigate('/join')}
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. WHY CHOOSE US (5 Core Pillars)
      ===================================================================== */}
      <section
        id="why-choose"
        aria-label="Why Choose Dropshipping Academy BD"
        className="py-14 md:py-20 bg-[#f2f0e7] border-t border-b border-[#171412]/15"
      >
        <div className="specimen-container">
          <WhyChooseUsBar items={whyChooseUs} />
        </div>
      </section>

      {/* =====================================================================
          3. FEATURED RESULTS (Selected Benchmarks Bento Grid)
      ===================================================================== */}
      <Section id="results" ariaLabel="Featured results and curriculum benchmarks">
        <div className="flex flex-col gap-4 mb-10 md:mb-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f2f0e7] border border-[#171412]/20 text-[#813502] text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
                {t('রিয়েল আউটপুট ও বেঞ্চমার্ক', 'Real Outputs & Benchmarks')}
              </span>
              <h2 className="font-display text-[32px] sm:text-[46px] font-extrabold text-[#171412] leading-[1.1] tracking-[-0.03em]">
                {t('নির্বাচিত', 'Featured')}{' '}
                <span className="text-[#ff7722]">{t('ফলাফল', 'Results')}</span>
              </h2>
              <p className="mt-4 text-[15px] sm:text-[17px] text-[#171412]/80 font-medium leading-[1.6]">
                {t(
                  'প্রতিটি শিক্ষার্থী যে অপারেটিং লক্ষ্যমাত্রা ও প্রফিট মার্জিন অর্জনের জন্য কাজ করে।',
                  'The operating benchmarks and unit economics every student builds toward.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 24-Column Bento Grid */}
        <div className="grid-24 gap-4 md:gap-6">
          {featuredResults.map((item) => (
            <BentoCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      {/* =====================================================================
          4.5. MODERN E-COMMERCE TOOLS STACK
      ===================================================================== */}
      <section className="py-12 md:py-16 bg-[#f2f0e7] border-t border-b border-[#171412]/15">
        <div className="specimen-container">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[13px] font-bold text-[#813502] uppercase tracking-wider">
              {t('গ্লোবাল ই-কমার্স ইকোসিস্টেম', 'Global E-Commerce Ecosystem')}
            </span>
            <h3 className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#171412] mt-1">
              {t(
                'আধুনিক ই-কমার্স ও পেইড মার্কেটিং টুলসের সমন্বয়ে তৈরি',
                'Built around the modern global e-commerce stack'
              )}
            </h3>
          </div>
          <ul
            aria-label="Supported e-commerce platforms and ad networks"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4"
          >
            {toolCategories.map((tool) => (
              <li
                key={tool.id}
                className="py-4 px-4 rounded-[16px] bg-[#fbf9ef] border border-[#171412]/20 hover:border-[#ff7722] shadow-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group"
              >
                <span className="font-display text-[17px] md:text-[19px] font-extrabold text-[#171412] group-hover:text-[#813502] tracking-tight transition-colors">
                  {tool.name}
                </span>
                <span className="text-[12px] text-[#171412]/70 font-medium mt-1">
                  {tool.category}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* =====================================================================
          5. WHAT YOU'LL LEARN (Curriculum Tabs)
      ===================================================================== */}
      <Section id="learn" ariaLabel="What you will learn curriculum">
        <div className="mb-10 md:mb-14 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f2f0e7] border border-[#171412]/20 text-[#813502] text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
            {t('স্টেপ-বাই-স্টেপ রোডম্যাপ', 'Step-by-Step Roadmap')}
          </span>
          <h2 className="font-display text-[32px] sm:text-[46px] font-extrabold text-[#171412] leading-[1.1] tracking-[-0.03em]">
            <span className="block">{t('আপনি যা যা শিখবেন।', "What you'll learn.")}</span>
            <span className="block text-[#813502] mt-1">
              {t('দ্রুত এগিয়ে যাওয়ার বাস্তব কৌশল।', 'Practical ways to move fast.')}
            </span>
          </h2>
        </div>

        <Tabs items={curriculumTabs} />
      </Section>

      {/* =====================================================================
          6. TRUSTED BY FUTURE STORE OWNERS (Testimonials)
      ===================================================================== */}
      <Section id="reviews" ariaLabel="Trusted by future store owners">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f2f0e7] border border-[#171412]/20 text-[#813502] text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
              {t('শিক্ষার্থীদের অভিজ্ঞতা', 'Student Testimonials')}
            </span>
            <h2 className="font-display text-[32px] sm:text-[46px] font-extrabold text-[#171412] leading-[1.1] tracking-[-0.03em]">
              {t('ভবিষ্যৎ স্টোর উদ্যোক্তাদের', 'Trusted by Future')}{' '}
              <span className="text-[#ff7722]">{t('আস্থা', 'Store Owners')}</span>
            </h2>
            <p className="mt-4 text-[15px] sm:text-[17px] text-[#171412]/80 font-medium max-w-[54ch]">
              {t(
                'যারা আমাদের প্রোডাক্ট ভ্যালিডেশন স্কোরকার্ড এবং স্টোরফ্রন্ট ওয়্যারফ্রেম ব্যবহার করে এগিয়ে গেছেন।',
                'Beta students who tested our product validation scorecards and live storefront systems.'
              )}
            </p>
          </div>
        </div>

        <div
          aria-label="Beta reader feedback cards"
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar py-4 md:py-6 px-1"
        >
          {testimonials.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      {/* =====================================================================
          7. ABOUT US & FOUNDERS
      ===================================================================== */}
      <Section id="about" ariaLabel="Small team, big results — The Founders">
        <div className="relative">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f2f0e7] border border-[#171412]/20 text-[#813502] text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
              {t('অভিজ্ঞ অপারেটরদের সরাসরি গাইডলাইন', 'Operators Teaching Operators')}
            </span>
            <h2 className="font-display text-[32px] sm:text-[46px] font-extrabold text-[#171412] leading-[1.1] tracking-[-0.03em]">
              {t('আমাদের', 'About')}{' '}
              <span className="text-[#ff7722]">{t('সম্পর্কে ও টিম', 'Our Team')}</span>
            </h2>
            <p className="mt-3 text-[15px] sm:text-[17px] text-[#171412]/80 font-medium">
              {founderStory.headline}
            </p>
          </div>

          {/* Founders Grid */}
          {foundersList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {foundersList.map((founder, idx) => {
                const imageFailed = Boolean(failedImages[founder.id]);
                return (
                  <div
                    key={founder.id}
                    className="rounded-[22px] bg-[#f2f0e7] border-2 border-[#171412] p-6 flex flex-col items-center text-center shadow-md transition-all duration-300 group"
                  >
                    {/* Founder Photo */}
                    <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-[16px] overflow-hidden bg-[#ffc765] border-2 border-[#171412] shadow-sm mb-5 group-hover:scale-102 transition-transform">
                      {!imageFailed ? (
                        <img
                          src={founder.photo}
                          alt={founder.alt}
                          width={360}
                          height={480}
                          loading="lazy"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [founder.id]: true,
                            }))
                          }
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#f2f0e7] text-[#171412]">
                          <span className="font-display text-[28px] font-extrabold text-[#ff7722]">
                            0{idx + 1}
                          </span>
                          <span className="mt-2 font-display text-[15px] font-bold">
                            {founder.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name & Role */}
                    <h3 className="font-display text-[20px] font-extrabold text-[#171412] leading-tight">
                      {lang === 'en' && founder.nameEn ? founder.nameEn : founder.name}
                    </h3>
                    <div className="text-[13px] text-[#813502] font-bold mt-1">
                      {lang === 'en' && founder.roleEn ? founder.roleEn : founder.role}
                    </div>

                    <p className="mt-3 text-[14px] text-[#171412]/80 leading-[1.5] max-w-[34ch]">
                      {lang === 'en' && founder.shortBioEn
                        ? founder.shortBioEn
                        : founder.shortBio}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Story Paragraph & CTA */}
          <div className="mt-12 md:mt-14 max-w-2xl mx-auto text-center">
            <p className="text-[16px] text-[#171412]/85 leading-[1.6]">
              {founderStory.body}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {foundersList.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowTeamBios((prev) => !prev)}
                  aria-expanded={showTeamBios}
                >
                  {showTeamBios
                    ? t('পরিচিতি সংক্ষিপ্ত করুন', 'Hide founder bios')
                    : founderStory.ctaLabel}
                </Button>
              )}
              <Button variant="orange" onClick={() => navigate('/join')}>
                {t('রেজিস্ট্রেশন করুন', 'Register Now')}
              </Button>
            </div>

            {/* Expandable Bio Drawer */}
            {showTeamBios && foundersList.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {foundersList.map((founder) => (
                  <div
                    key={`bio-${founder.id}`}
                    className="rounded-[16px] bg-[#f2f0e7] border-2 border-[#171412] p-6 shadow-sm"
                  >
                    <div className="text-[12px] font-bold text-[#813502]">
                      {lang === 'en' && founder.specialtyEn
                        ? founder.specialtyEn
                        : founder.specialty}
                    </div>
                    <h4 className="font-display text-[20px] font-extrabold text-[#171412] mt-1">
                      {lang === 'en' && founder.nameEn ? founder.nameEn : founder.name}
                    </h4>
                    <p className="text-[13px] text-[#171412]/70 mt-0.5 mb-3">
                      {lang === 'en' && founder.roleEn ? founder.roleEn : founder.role}
                    </p>
                    <p className="text-[14px] text-[#171412]/85 leading-[1.55]">
                      {lang === 'en' && founder.shortBioEn
                        ? founder.shortBioEn
                        : founder.shortBio}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* =====================================================================
          8. FAQ ACCORDION (সাধারণ জিজ্ঞাসা)
      ===================================================================== */}
      <Section id="faq" ariaLabel="Frequently asked questions">
        <div className="grid-24 gap-y-10">
          <div className="col-span-24 lg:col-span-9">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f2f0e7] border border-[#171412]/20 text-[#813502] text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
              {t('সাধারণ জিজ্ঞাসা', 'Common Questions')}
            </span>
            <h2 className="font-display text-[32px] sm:text-[44px] font-extrabold text-[#171412] leading-[1.08] tracking-[-0.03em] text-balance">
              {t(
                'যুক্ত হওয়ার আগে যা জানা প্রয়োজন।',
                'Everything you need to know before joining.'
              )}
            </h2>
            <p className="mt-4 text-[15px] sm:text-[16px] text-[#171412]/80 leading-[1.6] max-w-[38ch]">
              {t(
                'প্রাথমিক মূলধন, সময় বা আন্তর্জাতিক সাপ্লায়ার নিয়ে আপনার মনে কোনো প্রশ্ন থাকলে সরাসরি নিচের উত্তরগুলো দেখে নিতে পারেন।',
                'Have a specific question about capital, time commitment, or international suppliers? Read our clear answers.'
              )}
            </p>
          </div>

          <div className="col-span-24 lg:col-start-11 lg:col-span-14">
            <Accordion items={faqItems} />
          </div>
        </div>
      </Section>

      {/* =====================================================================
          9. FINAL REGISTRATION CTA BANNER
      ===================================================================== */}
      <section
        id="final-cta"
        aria-label="Join Dropshipping Academy"
        className="py-16 md:py-24 bg-[#fbf9ef]"
      >
        <div className="specimen-container">
          <div className="rounded-[24px] bg-[#ff7722] text-[#171412] p-8 sm:p-12 lg:p-16 border-2 border-[#171412] shadow-[6px_6px_0px_#171412] relative overflow-hidden">
            {/* Ambient warm yellow blur */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#ffc765]/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#fbf9ef] border border-[#171412] text-[#171412] text-[12px] font-extrabold uppercase tracking-wide mb-4">
                <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
                <span>
                  {t(
                    'পরবর্তী ব্যাচে ভর্তি · সীমিত আসন',
                    'Next Cohort Enrollment · Limited Seats'
                  )}
                </span>
              </div>

              <h2 className="font-display text-[32px] sm:text-[46px] lg:text-[54px] font-extrabold text-[#171412] leading-[1.08] tracking-[-0.03em]">
                {t(
                  'প্রতিটি দিনকে লাভজনক করে তুলুন!',
                  'Make every day pay for itself!'
                )}
              </h2>

              <p className="mt-4 text-[16px] sm:text-[18px] text-[#171412]/85 leading-[1.6] max-w-[50ch]">
                {t(
                  'মাত্র ২ মিনিটে আপনার স্থান নিশ্চিত করুন। ইমেইল ভেরিফাই করুন এবং নতুন ব্যাচ শুরু হওয়ার সাথে সাথে সকল আপডেট পান।',
                  'Reserve your spot in under two minutes. Verify your email and get notified the moment live doors open.'
                )}
              </p>

              <div className="mt-8">
                <form
                  onSubmit={handleHeroSubmit}
                  noValidate
                  className="w-full max-w-[520px]"
                >
                  <label htmlFor="cta-waitlist-email" className="sr-only">
                    {t(
                      'ওয়েটলিস্টে যুক্ত হতে আপনার ইমেইল দিন',
                      'Email address to join the waitlist'
                    )}
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-[28px] sm:rounded-[50px] bg-[#fbf9ef] border-2 border-[#171412] shadow-md">
                    <input
                      id="cta-waitlist-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={heroEmail}
                      onChange={(e) => {
                        setHeroEmail(e.target.value);
                        if (heroEmailError) setHeroEmailError('');
                      }}
                      placeholder={t(
                        'আপনার ইমেইল ঠিকানা লিখুন...',
                        'Enter your email address...'
                      )}
                      className="flex-1 h-[52px] min-h-[52px] px-5 py-2 rounded-[50px] bg-transparent text-[#171412] text-[15px] font-medium placeholder:text-[#171412]/50 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full sm:w-auto px-6 h-[52px] min-h-[52px] inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <span>{t('রেজিস্ট্রেশন করুন', 'Register Now')}</span>
                      <ArrowRightSvgIcon className="w-4 h-4 shrink-0 text-[#fbf9ef]" />
                    </Button>
                  </div>
                  {heroEmailError && (
                    <p
                      role="alert"
                      aria-live="polite"
                      className="text-[13px] font-bold text-[#171412] bg-[#fbf9ef] inline-block px-3 py-1 rounded-full mt-2"
                    >
                      {heroEmailError}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          10. CONTACT CHANNELS (যোগাযোগের মাধ্যম - WhatsApp, Hotline, Email, Message)
      ===================================================================== */}
      <ContactSection />
    </main>
  );
};
