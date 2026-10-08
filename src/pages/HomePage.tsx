import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CURRICULUM_TABS_BN,
  CURRICULUM_TABS_EN,
  FAQ_ITEMS_BN,
  FAQ_ITEMS_EN,
  FEATURED_RESULTS_BN,
  FEATURED_RESULTS_EN,
  TESTIMONIALS_BN,
  TESTIMONIALS_EN,
  TOOL_CATEGORIES_BN,
  TOOL_CATEGORIES_EN,
  getCurriculumTabs,
  getFaqItems,
  getFeaturedResults,
  getTestimonials,
  getToolCategories,
  PLACEHOLDER_CONTENT,
} from '../config/content';
import { FounderProfile, getLocalizedFounderStory } from '../config/founders';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchFoundersList,
  fetchSiteSectionContent,
  loadLocalFounders,
} from '../services/admin';
import { saveHeroEmailPrefill } from '../services/waitlist';
import { Accordion } from '../components/Accordion';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { Tabs } from '../components/Tabs';
import { TestimonialCard } from '../components/TestimonialCard';
import {
  HeroCornerStamp,
  HeroInlineBoxBadge,
} from '../components/svg/BrandLogo';
import { KeychainIllustration } from '../components/svg/KeychainIllustration';
import { ArrowDownCurvedIcon, ArrowRightSvgIcon } from '../components/svg/NavIcons';

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
    Promise.all([
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
    ]).then(([tcBn, tcEn, frBn, frEn, ctBn, ctEn, tsBn, tsEn, fqBn, fqEn]) => {
      if (!mounted) return;
      setToolCategories(lang === 'bn' ? tcBn : tcEn);
      setFeaturedResults(lang === 'bn' ? frBn : frEn);
      setCurriculumTabs(lang === 'bn' ? ctBn : ctEn);
      setTestimonials(lang === 'bn' ? tsBn : tsEn);
      setFaqItems(lang === 'bn' ? fqBn : fqEn);
    });

    const reloadContent = () => {
      Promise.all([
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
      ]).then(([tcBn, tcEn, frBn, frEn, ctBn, ctEn, tsBn, tsEn, fqBn, fqEn]) => {
        if (!mounted) return;
        setToolCategories(lang === 'bn' ? tcBn : tcEn);
        setFeaturedResults(lang === 'bn' ? frBn : frEn);
        setCurriculumTabs(lang === 'bn' ? ctBn : ctEn);
        setTestimonials(lang === 'bn' ? tsBn : tsEn);
        setFaqItems(lang === 'bn' ? fqBn : fqEn);
      });
    };

    window.addEventListener('site-content-updated', reloadContent);
    return () => {
      mounted = false;
      window.removeEventListener('site-content-updated', reloadContent);
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
    <main id="main-content" className="overflow-x-hidden">
      {/* =====================================================================
          2. HERO SECTION (Specimen Macrostructure)
      ===================================================================== */}
      <section
        id="hero"
        aria-label="Hero introduction"
        className="relative pt-10 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32 scroll-mt-20"
      >
        <div className="specimen-container relative">
          {/* Corner Swiss Stamp Sticker at Left Edge */}
          <div className="hidden lg:block absolute -left-4 xl:left-2 top-2 -rotate-12 pointer-events-none select-none">
            <HeroCornerStamp className="w-28 h-28" />
          </div>

          <div className="grid-24 gap-y-8">
            <div className="col-span-24 xl:col-start-3 xl:col-span-21">
              {/* Editorial Kicker */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] sm:text-[13px] font-bold text-[#813502] mb-5">
                <span>
                  {t('ব্যাচ-ভিত্তিক অপারেটিং সিস্টেম', 'Cohort-Based Operating System')}
                </span>
                <span aria-hidden="true" className="text-[#813502]/60">·</span>
                <span>{t('প্রফিট ও ইউনিট ইকোনমিক্স', 'Unit Economics First')}</span>
                <span aria-hidden="true" className="text-[#813502]/60">·</span>
                <span>{t('ওয়েটলিস্ট চলছে', 'Waitlist Now Open')}</span>
              </div>

              {/* Giant H1 with Inline Circular Orange Box SVG Badge */}
              {lang === 'bn' ? (
                <h1 className="specimen-h1 text-[#171412]">
                  উচ্চাকাঙ্ক্ষী ড্রপশিপারদের
                  <HeroInlineBoxBadge />
                  শেখার বিশ্বস্ত সহযোগী
                </h1>
              ) : (
                <h1 className="specimen-h1 text-[#171412]">
                  The learning partner
                  <HeroInlineBoxBadge />
                  for ambitious dropshippers
                </h1>
              )}
            </div>

            {/* Subcopy + Compact Pill Email Form */}
            <div className="col-span-24 xl:col-start-3 xl:col-span-18 mt-2 md:mt-4 flex flex-col gap-6">
              <p className="text-[18px] md:text-[22px] font-medium text-[#171412] leading-[1.35] max-w-[52ch]">
                {t(
                  'আমরা নতুনদের একদম শুরু থেকে ধাপে ধাপে উইনিং প্রোডাক্ট খোঁজা, প্রফেশনাল স্টোর তৈরি এবং অ্যাডের মাধ্যমে সেলস স্কেল করা শেখাই।',
                  'We teach beginners to find winning products, build stores, and scale with ads, step by step.'
                )}
              </p>

              <form
                onSubmit={handleHeroSubmit}
                noValidate
                className="w-full max-w-[540px]"
              >
                <label htmlFor="hero-waitlist-email" className="sr-only">
                  {t(
                    'ওয়েটলিস্টে যুক্ত হতে আপনার ইমেইল দিন',
                    'Email address to join the waitlist'
                  )}
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-[28px] sm:rounded-[50px] bg-[#fff] border-2 border-[#171412] shadow-sm">
                  <input
                    id="hero-waitlist-email"
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
                    aria-invalid={heroEmailError ? 'true' : 'false'}
                    aria-describedby={heroEmailError ? 'hero-email-error' : undefined}
                    className="flex-1 h-[52px] min-h-[52px] px-4 py-2 rounded-[50px] bg-transparent text-[#171412] text-[16px] font-medium placeholder:text-[#171412]/50 focus:outline-none"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto px-6 h-[52px] min-h-[52px] inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <span>{t('ওয়েটলিস্টে যুক্ত হোন', 'Join waitlist')}</span>
                    <ArrowRightSvgIcon className="w-4 h-4 shrink-0" />
                  </Button>
                </div>

                {heroEmailError && (
                  <p
                    id="hero-email-error"
                    role="alert"
                    aria-live="polite"
                    className="text-[13px] font-bold text-[#ff3c34] mt-2 pl-3"
                  >
                    {heroEmailError}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Tool Categories Wordmark Cloud Row */}
          <div className="mt-14 md:mt-20 pt-8 hairline-t">
            <div className="text-[12px] font-bold text-[#813502] mb-4">
              {t(
                'আধুনিক ই-কমার্স ও পেইড মার্কেটিং টুলসের সমন্বয়ে তৈরি',
                'Built around the modern e-commerce stack'
              )}
            </div>
            <ul
              aria-label="Supported e-commerce platforms and ad networks"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {toolCategories.map((tool) => (
                <li
                  key={tool.id}
                  className="py-3 px-4 rounded-[12px] bg-[#f2f0e7] border border-[#171412]/12 flex flex-col justify-between"
                >
                  <span className="font-display text-[18px] md:text-[20px] font-extrabold text-[#171412] tracking-[-0.03em]">
                    {tool.name}
                  </span>
                  <span className="text-[12px] text-[#171412]/75 mt-1">
                    {tool.category}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. FEATURED RESULTS (Bento Grid of Dark #171412 Cards + Purple Card)
      ===================================================================== */}
      <Section id="results" ariaLabel="Featured results and curriculum benchmarks">
        <div className="flex flex-col gap-4 mb-10 md:mb-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              {lang === 'bn' ? (
                <h2 className="specimen-h2 text-[#171412]">
                  নির্বাচিত <span className="text-[#8e827c]">ফলাফল</span>
                </h2>
              ) : (
                <h2 className="specimen-h2 text-[#171412]">
                  Featured <span className="text-[#8e827c]">results</span>
                </h2>
              )}
              <div className="mt-4 flex items-center gap-3 text-[#171412]">
                <ArrowDownCurvedIcon className="w-7 h-7 text-[#ff7722] shrink-0" />
                <p className="text-[16px] md:text-[18px] font-medium text-[#171412]">
                  {t(
                    'প্রতিটি শিক্ষার্থী যে অপারেটিং লক্ষ্যমাত্রা ও প্রফিট মার্জিন অর্জনের জন্য কাজ করে।',
                    'The operating benchmarks and unit economics every student builds toward.'
                  )}
                </p>
              </div>
            </div>

            {PLACEHOLDER_CONTENT && (
              <p className="text-[13px] text-[#813502] font-semibold max-w-[40ch]">
                {t(
                  'বিঃদ্রঃ নিচের পরিসংখ্যান ও বেটা রিভিউগুলো আমাদের কারিকুলামের লক্ষ্যমাত্রা ও নমুনা প্রিভিউ।',
                  'Note: Metrics and beta quotes below represent curriculum targets and placeholder previews.'
                )}
              </p>
            )}
          </div>
        </div>

        {/* 24-Column Swiss Bento Grid */}
        <div className="grid-24 gap-4 md:gap-6">
          {featuredResults.map((item) => (
            <BentoCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      {/* =====================================================================
          4. WHAT YOU'LL LEARN (Purple Card with Accessible Tabs + Tilted Tiles)
      ===================================================================== */}
      <Section id="learn" ariaLabel="What you will learn curriculum">
        <div className="mb-10 md:mb-14">
          <h2 className="specimen-h2 text-[#171412]">
            <span className="block">
              {t('আপনি যা যা শিখবেন।', "What you'll learn.")}
            </span>
            <span className="block text-[#813502] mt-1">
              {t('দ্রুত এগিয়ে যাওয়ার কৌশল।', 'Our ways to move fast.')}
            </span>
          </h2>
        </div>

        <Tabs items={curriculumTabs} />
      </Section>

      {/* =====================================================================
          5. TRUSTED BY FUTURE STORE OWNERS (Fanned/Rotated Cards)
      ===================================================================== */}
      <Section id="reviews" ariaLabel="Trusted by future store owners">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <h2 className="specimen-h2 text-[#171412]">
              {t(
                'ভবিষ্যৎ স্টোর উদ্যোক্তাদের আস্থা',
                'Trusted by future store owners'
              )}
            </h2>
            <p className="mt-4 text-[16px] md:text-[18px] text-[#171412] max-w-[54ch]">
              {t(
                'যারা আমাদের প্রোডাক্ট ভ্যালিডেশন স্কোরকার্ড এবং স্টোরফ্রন্ট ওয়্যারফ্রেম আগেভাগে ব্যবহার করে দেখেছেন।',
                'Early beta readers who tested our product validation scorecards and storefront wireframes.'
              )}
            </p>
          </div>

          {PLACEHOLDER_CONTENT && (
            <span className="text-[13px] font-bold text-[#813502]">
              {t('বেটা প্রিভিউ মতামত', 'Sample Beta Previews')}
            </span>
          )}
        </div>

        <div
          aria-label="Beta reader feedback cards"
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar py-4 md:py-8 px-1"
        >
          {testimonials.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      {/* =====================================================================
          5.5. FAQ ACCORDION (Between Sections 5 and 6, Linked from Left Rail)
      ===================================================================== */}
      <Section id="faq" ariaLabel="Frequently asked questions">
        <div className="grid-24 gap-y-10">
          <div className="col-span-24 lg:col-span-9">
            <div className="text-[13px] font-bold text-[#813502] mb-3">
              {t('সাধারণ জিজ্ঞাসা', 'Common Questions')}
            </div>
            <h2 className="font-display text-[38px] sm:text-[52px] font-extrabold text-[#171412] leading-[1.02] tracking-[-0.03em] text-balance">
              {t(
                'যুক্ত হওয়ার আগে যা জানা প্রয়োজন।',
                'Everything you need to know before joining.'
              )}
            </h2>
            <p className="mt-4 text-[16px] text-[#171412]/85 leading-[1.45] max-w-[38ch]">
              {t(
                'প্রাথমিক মূলধন, সময় বা আন্তর্জাতিক সাপ্লায়ার নিয়ে আপনার মনে কোনো প্রশ্ন থাকলে নিচের উত্তরগুলো দেখুন।',
                'Have a specific question about capital requirements, time commitment, or international suppliers? Read our straightforward answers.'
              )}
            </p>
          </div>

          <div className="col-span-24 lg:col-start-11 lg:col-span-14">
            <Accordion items={faqItems} />
          </div>
        </div>
      </Section>

      {/* =====================================================================
          6. SMALL TEAM, BIG RESULTS (FOUNDERS OVERLAPPING HEADLINE)
      ===================================================================== */}
      <Section id="about" ariaLabel="Small team, big results — The Founders">
        <div className="relative">
          {/* Giant Full-Width Headline */}
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#813502] mb-3">
              {t('অভিজ্ঞ অপারেটরদের সরাসরি গাইডলাইন', 'Operators Teaching Operators')}
            </div>
            <h2 className="font-display text-[48px] sm:text-[76px] lg:text-[108px] font-extrabold text-[#171412] leading-[0.9] tracking-[-0.04em] uppercase select-none">
              {founderStory.headline}
            </h2>
          </div>

          {/* Founder Photos Overlapping the Headline in Tilted Frames */}
          {foundersList.length > 0 && (
            <div className="mt-6 sm:-mt-4 lg:-mt-10 relative z-10 flex flex-wrap items-center justify-center gap-10 sm:gap-12 lg:gap-20">
              {foundersList.map((founder, idx) => {
                const imageFailed = Boolean(failedImages[founder.id]);
                return (
                  <div
                    key={founder.id}
                    className={`flex flex-col items-center max-w-[300px] sm:max-w-[320px] w-full transition-transform duration-300 ${founder.rotationClass} hover:rotate-0`}
                  >
                    {/* Colored Backdrop Card Frame */}
                    <div
                      style={{ backgroundColor: founder.backdropColor }}
                      className="w-full p-3 rounded-[12px] border-2 border-[#171412] shadow-md"
                    >
                      <div className="relative w-full aspect-[3/4] rounded-[8px] overflow-hidden bg-[#171412]">
                        {!imageFailed ? (
                          <img
                            src={founder.photo}
                            alt={founder.alt}
                            width={360}
                            height={480}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({
                                ...prev,
                                [founder.id]: true,
                              }))
                            }
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#171412] text-[#fbf9ef]">
                            <span className="font-display text-[36px] font-extrabold text-[#ff7722]">
                              0{idx + 1}
                            </span>
                            <span className="mt-2 font-display text-[18px] font-bold">
                              {founder.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name + Role Pill Chip Under Photo */}
                    <div className="mt-4 px-5 py-2.5 rounded-[50px] bg-[#171412] text-[#fbf9ef] text-center border border-[#171412] shadow-sm">
                      <div className="font-display text-[15px] font-extrabold leading-tight">
                        {lang === 'en' && founder.nameEn ? founder.nameEn : founder.name}
                      </div>
                      <div className="text-[12px] text-[#fbc59d] mt-0.5">
                        {lang === 'en' && founder.roleEn ? founder.roleEn : founder.role}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Founder Story Paragraph + "Meet the team" CTA */}
          <div className="mt-12 md:mt-16 max-w-3xl mx-auto text-center">
            <p className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#171412] leading-[1.25] tracking-[-0.02em]">
              {founderStory.lead}
            </p>
            <p className="mt-4 text-[16px] text-[#171412]/90 leading-[1.5]">
              {founderStory.body}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {foundersList.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowTeamBios((prev) => !prev)}
                  aria-expanded={showTeamBios}
                  aria-controls="founder-bios-drawer"
                >
                  {showTeamBios
                    ? t('পরিচিতি সংক্ষিপ্ত করুন', 'Hide founder bios')
                    : founderStory.ctaLabel}
                </Button>
              )}
              <Button variant="primary" onClick={() => navigate('/join')}>
                {t('ওয়েটলিস্টে যুক্ত হোন', 'Join the waitlist')}
              </Button>
            </div>

            {/* Expandable Founder Bios Drawer */}
            {showTeamBios && foundersList.length > 0 && (
              <div
                id="founder-bios-drawer"
                className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
              >
                {foundersList.map((founder) => (
                  <div
                    key={`bio-${founder.id}`}
                    className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6"
                  >
                    <div className="text-[12px] font-bold text-[#813502]">
                      {lang === 'en' && founder.specialtyEn
                        ? founder.specialtyEn
                        : founder.specialty}
                    </div>
                    <h3 className="font-display text-[22px] font-extrabold text-[#171412] mt-1">
                      {lang === 'en' && founder.nameEn ? founder.nameEn : founder.name}
                    </h3>
                    <p className="text-[14px] text-[#171412]/80 mt-0.5 mb-3">
                      {lang === 'en' && founder.roleEn ? founder.roleEn : founder.role}
                    </p>
                    <p className="text-[15px] text-[#171412] leading-[1.45]">
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
          7. FINAL CTA SECTION ("Make every day pay for itself!")
      ===================================================================== */}
      <Section
        id="final-cta"
        ariaLabel="Join the Dropshipping Academy waitlist"
        className="bg-[#f2f0e7]"
      >
        <div className="rounded-[12px] bg-[#171412] text-[#fbf9ef] p-8 sm:p-12 lg:p-16 border-2 border-[#171412]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-3xl">
              <div className="text-[13px] font-bold text-[#ffc765] mb-4">
                {t(
                  'পরবর্তী ব্যাচে ভর্তি · সীমিত ওয়েটলিস্ট আসন',
                  'Next Cohort Enrollment · Limited Waitlist Spots'
                )}
              </div>
              <h2 className="specimen-h2 text-[#fbf9ef]">
                {t(
                  'প্রতিটি দিনকে লাভজনক করে তুলুন!',
                  'Make every day pay for itself!'
                )}
              </h2>
              <p className="mt-6 text-[17px] md:text-[19px] text-[#fbf9ef]/85 leading-[1.4] max-w-[50ch]">
                {t(
                  'মাত্র ২ মিনিটে ওয়েটলিস্টে আপনার স্থান নিশ্চিত করুন। ইমেইল ভেরিফাই করুন এবং নতুন ব্যাচ শুরু হওয়ার সাথে সাথে হোয়াটসঅ্যাপ ও ইমেইলে আপডেট পান।',
                  'Reserve your spot on the waitlist in under two minutes. Verify your email and get notified on WhatsApp and email the moment doors open.'
                )}
              </p>

              <div className="mt-8">
                <form
                  onSubmit={handleHeroSubmit}
                  noValidate
                  className="w-full max-w-[540px]"
                >
                  <label htmlFor="cta-waitlist-email" className="sr-only">
                    {t(
                      'ওয়েটলিস্টে যুক্ত হতে আপনার ইমেইল দিন',
                      'Email address to join the waitlist'
                    )}
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-[28px] sm:rounded-[50px] bg-[#fbf9ef] border-2 border-[#ffc765] shadow-sm">
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
                      className="flex-1 h-[52px] min-h-[52px] px-4 py-2 rounded-[50px] bg-transparent text-[#171412] text-[16px] font-medium placeholder:text-[#171412]/50 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      variant="orange"
                      className="w-full sm:w-auto px-6 h-[52px] min-h-[52px] inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <span>{t('ওয়েটলিস্টে যুক্ত হোন', 'Join waitlist')}</span>
                      <ArrowRightSvgIcon className="w-4 h-4 shrink-0" />
                    </Button>
                  </div>
                  {heroEmailError && (
                    <p
                      role="alert"
                      aria-live="polite"
                      className="text-[13px] font-bold text-[#ffc765] mt-2 pl-3"
                    >
                      {heroEmailError}
                    </p>
                  )}
                </form>
              </div>
            </div>

            {/* Keychain with Small Box Charm SVG Illustration */}
            <div className="shrink-0 self-center lg:self-auto bg-[#fbf9ef] p-6 rounded-[12px] border-2 border-[#ff7722]">
              <KeychainIllustration className="w-36 h-36 md:w-44 md:h-44" />
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
};
