import type { Language } from '../context/LanguageContext';

/**
 * PLACEHOLDER_CONTENT FLAG
 * ----------------------------------------------------------------------------
 * All benchmark stats, sample case cards, and preview testimonials are marked
 * with PLACEHOLDER_CONTENT = true so you can easily identify and replace them
 * with verified student metrics before launch.
 */
export const PLACEHOLDER_CONTENT = true;

export interface ToolCategoryItem {
  id: string;
  name: string;
  category: string;
}

export const TOOL_CATEGORIES_BN: ToolCategoryItem[] = [
  { id: 'shopify', name: 'Shopify', category: 'স্টোরফ্রন্ট বিল্ডার' },
  { id: 'woocommerce', name: 'WooCommerce', category: 'ওপেন কমার্স' },
  { id: 'aliexpress', name: 'AliExpress', category: 'প্রোডাক্ট ডিসকভারি' },
  { id: 'cj', name: 'CJ Dropshipping', category: 'ফুলফিলমেন্ট ও সোর্সিং' },
  { id: 'meta-ads', name: 'Meta Ads', category: 'পেইড সোশ্যাল অ্যাডস' },
  { id: 'tiktok-ads', name: 'TikTok Ads', category: 'শর্ট-ফর্ম ভিডিও অ্যাডস' },
];

export const TOOL_CATEGORIES_EN: ToolCategoryItem[] = [
  { id: 'shopify', name: 'Shopify', category: 'Storefront' },
  { id: 'woocommerce', name: 'WooCommerce', category: 'Open Commerce' },
  { id: 'aliexpress', name: 'AliExpress', category: 'Product Discovery' },
  { id: 'cj', name: 'CJ Dropshipping', category: 'Fulfillment' },
  { id: 'meta-ads', name: 'Meta Ads', category: 'Paid Social' },
  { id: 'tiktok-ads', name: 'TikTok Ads', category: 'Short-Form Video' },
];

export interface BentoResultItem {
  id: string;
  type: 'illustration' | 'testimonial';
  spanClass: string;
  tag: string;
  title: string;
  metric: string;
  subcopy: string;
  illustrationType?: 'revenue-chart' | 'product-box' | 'storefront' | 'ad-spend-dial' | 'shipping-route';
  quote?: string;
  authorName?: string;
  authorRole?: string;
  authorInitials?: string;
  isPlaceholder: boolean;
}

export const FEATURED_RESULTS_BN: BentoResultItem[] = [
  {
    id: 'result-revenue',
    type: 'illustration',
    spanClass: 'col-span-24 lg:col-span-14 min-h-[380px]',
    tag: 'ইউনিট ইকোনমিক্স · ৯০-দিনের কারিকুলাম লক্ষ্যমাত্রা',
    title: 'শূন্য থেকে ধারাবাহিক ডেইলি প্রফিট মার্জিন তৈরি করার ফ্রেমওয়ার্ক',
    metric: '+৩৪.৮% নিট মার্জিন টার্গেট',
    subcopy: 'ব্রেক-ইভেন ROAS ক্যালকুলেটর ব্যবহারের ফলে প্রথম সপ্তাহেই অলাভজনক অ্যাড ক্যাম্পেইনে টাকা নষ্ট হওয়া বন্ধ হয়।',
    illustrationType: 'revenue-chart',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 'result-product-box',
    type: 'illustration',
    spanClass: 'col-span-24 md:col-span-12 lg:col-span-10 min-h-[380px]',
    tag: 'প্রোডাক্ট সিলেকশন · ১২-পয়েন্ট ফিল্টার',
    title: 'বাস্তব সমস্যার সমাধানকারী হাই-ভ্যালু প্রোডাক্ট নির্বাচন',
    metric: '৩.৫x ন্যূনতম মার্কআপ রুল',
    subcopy: 'সস্তা ও অতিরিক্ত কপি হওয়া গ্যাজেটের বদলে বেশি মার্জিনের হোম, পেট ও লাইফস্টাইল ইউটিলিটি প্রোডাক্ট বাছাই।',
    illustrationType: 'product-box',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 'result-storefront',
    type: 'illustration',
    spanClass: 'col-span-24 md:col-span-12 lg:col-span-8 min-h-[340px]',
    tag: 'স্টোরফ্রন্ট আর্কিটেকচার · মোবাইল ফার্স্ট',
    title: '২ সেকেন্ডের কম লোড স্পিড ও কনভার্সন-ফোকাসড প্রোডাক্ট পেজ',
    metric: '৪.২% টার্গেট চেকআউট CVR',
    subcopy: 'পরিষ্কার টাইপোগ্রাফি, বেনিফিট-ভিত্তিক বান্ডেল অফার এবং মোবাইল ফ্রেন্ডলি স্টিকি কার্ট।',
    illustrationType: 'storefront',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 'result-testimonial-purple',
    type: 'testimonial',
    spanClass: 'col-span-24 md:col-span-12 lg:col-span-8 min-h-[340px]',
    tag: 'কারিকুলাম বেটা রিভিউ',
    title: 'অনুমানের বদলে সুনির্দিষ্ট হিসাব',
    metric: 'ব্যাচ ০১ বেটা ফিডব্যাক',
    subcopy: 'বেটা রিভিউয়ারের অভিজ্ঞতা',
    quote:
      '“ব্রেক-ইভেন ক্যালকুলেটর এবং সাপ্লায়ার যাচাইয়ের স্ক্রিপ্ট থাকার কারণে অ্যাডে এক টাকাও খরচ করার আগেই আমি ৩টি লস হওয়ার মতো প্রোডাক্ট বাদ দিতে পেরেছি।”',
    authorName: 'নাদিয়া কে.',
    authorRole: 'প্রাথমিক কারিকুলাম রিভিউয়ার · ঢাকা',
    authorInitials: 'NK',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 'result-shipping',
    type: 'illustration',
    spanClass: 'col-span-24 md:col-span-12 lg:col-span-8 min-h-[340px]',
    tag: 'ফুলফিলমেন্ট · ডিরেক্ট প্রাইভেট এজেন্ট',
    title: 'কাস্টম প্যাকেজিংসহ ৬–৯ দিনে ট্র্যাকড এয়ার শিপিং',
    metric: '< ১.২% ডিসপিউট রেট বেঞ্চমার্ক',
    subcopy: 'দিনে ১৫টি অর্ডার পার হওয়ার আগেই ধীরগতির মার্কেটপ্লেস সেলার থেকে সরাসরি 3PL লজিস্টিকসে রূপান্তর।',
    illustrationType: 'shipping-route',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
];

export const FEATURED_RESULTS_EN: BentoResultItem[] = [
  {
    id: 'result-revenue',
    type: 'illustration',
    spanClass: 'col-span-24 lg:col-span-14 min-h-[380px]',
    tag: 'Unit Economics · 90-Day Curriculum Benchmark',
    title: 'From zero store to predictable daily contribution margin',
    metric: '+34.8% Net Margin Target',
    subcopy: 'Structured break-even ROAS calculators prevent overspending on unprofitable ad sets during week-one testing.',
    illustrationType: 'revenue-chart',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 'result-product-box',
    type: 'illustration',
    spanClass: 'col-span-24 md:col-span-12 lg:col-span-10 min-h-[380px]',
    tag: 'Product Selection · 12-Point Filter',
    title: 'High-perceived-value problem solvers',
    metric: '3.5x Minimum Markup Rule',
    subcopy: 'We eliminate saturated impulse trinkets in favor of high-margin home, pet, and ergonomic utility goods.',
    illustrationType: 'product-box',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 'result-storefront',
    type: 'illustration',
    spanClass: 'col-span-24 md:col-span-12 lg:col-span-8 min-h-[340px]',
    tag: 'Storefront Architecture · Mobile First',
    title: 'Sub-2-second load speed & editorial product pages',
    metric: '4.2% Target Checkout CVR',
    subcopy: 'Clean visual hierarchy, benefit-driven offer stacks, and friction-free mobile sticky carts.',
    illustrationType: 'storefront',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 'result-testimonial-purple',
    type: 'testimonial',
    spanClass: 'col-span-24 md:col-span-12 lg:col-span-8 min-h-[340px]',
    tag: 'Curriculum Beta Preview',
    title: 'Clarity over guesswork',
    metric: 'Cohort 01 Beta Feedback',
    subcopy: 'Sample beta reader reflection',
    quote:
      '“Having a strict break-even calculator and supplier vetting script stopped me from launching three money-losing products before spending a cent on ads.”',
    authorName: 'Nadia K.',
    authorRole: 'Early Curriculum Reviewer · Dhaka',
    authorInitials: 'NK',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 'result-shipping',
    type: 'illustration',
    spanClass: 'col-span-24 md:col-span-12 lg:col-span-8 min-h-[340px]',
    tag: 'Fulfillment · Direct Private Agents',
    title: '6–9 day tracked air lines with custom packaging',
    metric: '< 1.2% Dispute Rate Benchmark',
    subcopy: 'Transition off slow marketplace sellers to vetted 3PL logistics before scaling past 15 orders a day.',
    illustrationType: 'shipping-route',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
];

export interface CurriculumTabItem {
  id: string;
  label: string;
  stepNumber: string;
  headline: string;
  description: string;
  deliverables: string[];
  tiles: {
    blackTitle: string;
    blackStat: string;
    orangeTitle: string;
    orangeStat: string;
    yellowTitle: string;
    yellowStat: string;
  };
}

export const CURRICULUM_TABS_BN: CurriculumTabItem[] = [
  {
    id: 'product-research',
    label: 'প্রোডাক্ট রিসার্চ',
    stepNumber: '01',
    headline: 'অ্যাড স্পাই টুলে ভাইরাল হওয়ার আগেই চাহিদাসম্পন্ন প্রোডাক্ট খুঁজে বের করুন।',
    description:
      'অন্যের পুরনো ভাইরাল অ্যাড কপি করা বন্ধ করুন। আমাদের ১২-পয়েন্ট স্কোরকার্ডের মাধ্যমে সার্চ ইন্টেন্ট, কাস্টমারদের রিভিউ বিশ্লেষণ এবং প্রফিট মার্জিন যাচাই করা শিখবেন।',
    deliverables: [
      '১২-পয়েন্ট প্রফিট মার্জিন ও ডিমান্ড ভ্যালিডেশন স্প্রেডশিট',
      'কম্পিটিটর অফার বিশ্লেষণ প্রটোকল',
      'নতুনদের জন্য প্রবলেম-সলভিং প্রোডাক্ট অ্যাঙ্গেল ম্যাট্রিক্স',
    ],
    tiles: {
      blackTitle: 'মার্জিন ফ্লোর',
      blackStat: '68%+ Gross',
      orangeTitle: 'ডিমান্ড অডিট',
      orangeStat: '12 Criteria',
      yellowTitle: 'রিসার্চ স্প্রিন্ট',
      yellowStat: '48 Hours',
    },
  },
  {
    id: 'store-setup',
    label: 'স্টোর সেটআপ',
    stepNumber: '02',
    headline: 'সাধারণ ড্রপশিপিং টেমপ্লেট নয়, ব্র্যান্ডের মতো বিশ্বাসযোগ্য স্টোর তৈরি করুন।',
    description:
      'ক্রেতারা নকল কাউন্টডাউন টাইমার ও পপআপ দেখলেই বুঝে ফেলে। আমরা আপনাকে শেখাবো কীভাবে প্রফেশনাল টাইপোগ্রাফি, বান্ডেল অফার এবং হাই-কনভার্টিং প্রোডাক্ট পেজ সাজাতে হয়।',
    deliverables: [
      'হাই-কনভার্টিং প্রোডাক্ট পেজ ওয়্যারফ্রেম ব্লুপ্রিন্ট',
      'অর্ডার ভ্যালু (AOV) বাড়ানোর বান্ডেল ও টিয়ার প্রাইসিং সেটআপ',
      'চেকআউট, পিক্সেল ও ডোমেইন ভেরিফিকেশন চেকলিস্ট',
    ],
    tiles: {
      blackTitle: 'মোবাইল স্পিড',
      blackStat: '< 1.8s LCP',
      orangeTitle: 'অফার স্ট্যাক',
      orangeStat: '3-Tier Bundles',
      yellowTitle: 'লঞ্চ রেডি',
      yellowStat: '5 Days',
    },
  },
  {
    id: 'suppliers',
    label: 'সাপ্লায়ার',
    stepNumber: '03',
    headline: 'নির্ভরযোগ্য প্রোডাক্ট কোয়ালিটি, দ্রুত এয়ার শিপিং এবং ব্যাকআপ ফ্যাক্টরি নিশ্চিত করুন।',
    description:
      'খারাপ সাপ্লায়ার এবং দেরিতে ডেলিভারির কারণে চার্জব্যাক হয়ে লাভজনক স্টোর বন্ধ হয়ে যায়। জিরো MOQ-তে প্রাইভেট সোর্সিং এজেন্টদের সাথে কথা বলা এবং ভিডিও কলের মাধ্যমে কোয়ালিটি চেক করা শিখুন।',
    deliverables: [
      'প্রাইভেট সোর্সিং এজেন্ট আউটরিচ ও নেগোসিয়েশন স্ক্রিপ্ট',
      'শিপমেন্টের আগে কোয়ালিটি ইন্সপেকশন চেকলিস্ট',
      'অটোমেটেড অর্ডার সিঙ্ক ও ডিসপিউট প্রতিরোধ ওয়ার্কফ্লো',
    ],
    tiles: {
      blackTitle: 'ডেলিভারি সময়',
      blackStat: '6–9 Days Air',
      orangeTitle: 'কোয়ালিটি চেক',
      orangeStat: 'Video Verified',
      yellowTitle: 'ব্যাকআপ সাপ্লাই',
      yellowStat: '2x Redundancy',
    },
  },
  {
    id: 'ads',
    label: 'অ্যাডস',
    stepNumber: '04',
    headline: 'নিয়ন্ত্রিত বাজেটে স্ক্রল-স্টপিং ভিডিও ক্রিয়েটিভ টেস্ট করুন।',
    description:
      'আধুনিক পেইড অ্যাডের সাফল্য নির্ভর করে প্রথম ৩ সেকেন্ডের ভিডিও হুকের ওপর। আমরা আপনাকে শেখাবো কীভাবে মডিউলার স্ক্রিপ্ট লিখতে হয় এবং মেটা ও টিকটকে কম বাজেটে অ্যাড টেস্ট করতে হয়।',
    deliverables: [
      '৩-সেকেন্ড হুক ও মডিউলার ভিডিও স্ক্রিপ্টিং ফ্রেমওয়ার্ক',
      'কম বাজেটে ক্রিয়েটিভ টেস্টিং ক্যাম্পেইন স্ট্রাকচার',
      'ডেইলি অ্যাড কিল / স্কেল ডিসিশন রুলবুক (CPA ও ROAS)',
    ],
    tiles: {
      blackTitle: 'হুক রেট',
      blackStat: '32%+ Target',
      orangeTitle: 'ক্রিয়েটিভ ব্যাচ',
      orangeStat: '3x3 Matrix',
      yellowTitle: 'বাজেট কন্ট্রোল',
      yellowStat: '1.5x Max CPA',
    },
  },
  {
    id: 'scaling',
    label: 'স্কেলিং',
    stepNumber: '05',
    headline: 'ক্যাশ-ফ্লো এবং প্রফিট মার্জিন সুরক্ষিত রেখে উইনিং অ্যাড স্কেল করুন।',
    description:
      'হাতে প্রফিট না থাকলে শুধু সেলস বাড়িয়ে কোনো লাভ নেই। হরাইজন্টাল অ্যাড স্কেলিং, পোস্ট-পারচেজ ইমেইল ফ্লো, কাস্টম ব্র্যান্ডেড প্যাকেজিং এবং সাপ্তাহিক লাভ-ক্ষতির হিসাব রাখা শিখুন।',
    deliverables: [
      'হরাইজন্টাল ও ভার্টিক্যাল ক্যাম্পেইন স্কেলিং প্লেবুক',
      'পোস্ট-পারচেজ ইমেইল ও কাস্টমার রিটেনশন ফ্লো',
      'সাপ্তাহিক ক্যাশ-ফ্লো ও প্রফিট মার্জিন ট্র্যাকার',
    ],
    tiles: {
      blackTitle: 'রিপিট ক্রেতা',
      blackStat: '+22% LTV Lift',
      orangeTitle: 'হিসাব নিকাশ',
      orangeStat: 'Weekly Audit',
      yellowTitle: 'ব্র্যান্ড ভ্যালু',
      yellowStat: 'Custom Pack',
    },
  },
];

export const CURRICULUM_TABS_EN: CurriculumTabItem[] = [
  {
    id: 'product-research',
    label: 'Product Research',
    stepNumber: '01',
    headline: 'Spot demand signals before a product peaks on ad spy tools.',
    description:
      'Stop copying viral ads that are already fatigued. You will learn how to audit search intent, analyze customer complaint patterns in marketplace reviews, and validate gross margin potential using our 12-point scorecard.',
    deliverables: [
      '12-Point Margin & Demand Validation Spreadsheet',
      'Competitor Offer Teardown Protocol',
      'Problem-Solving Angle Matrix for Beginners',
    ],
    tiles: {
      blackTitle: 'Margin Floor',
      blackStat: '68%+ Gross',
      orangeTitle: 'Demand Audit',
      orangeStat: '12 Criteria',
      yellowTitle: 'Research Sprint',
      yellowStat: '48 Hours',
    },
  },
  {
    id: 'store-setup',
    label: 'Store Setup',
    stepNumber: '02',
    headline: 'Build a store that looks like a category leader, not a dropship template.',
    description:
      'Customers spot countdown timers and fake popups immediately. We walk you through typography, offer bundling, persuasive comparison blocks, and trust architecture that converts cold mobile traffic.',
    deliverables: [
      'High-Converting Product Page Wireframe Blueprint',
      'AOV-Boosting Bundle & Tiered Pricing Setup',
      'Technical Checkout, Pixel & Domain Verification Checklist',
    ],
    tiles: {
      blackTitle: 'Mobile Speed',
      blackStat: '< 1.8s LCP',
      orangeTitle: 'Offer Stack',
      orangeStat: '3-Tier Bundles',
      yellowTitle: 'Launch Ready',
      yellowStat: '5 Days',
    },
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    stepNumber: '03',
    headline: 'Lock in reliable quality, fast air shipping, and backup factories.',
    description:
      'Bad suppliers kill profitable stores via chargebacks. Learn how to negotiate MOQs of zero with private sourcing agents, inspect sample quality via video call, and automate tracking updates.',
    deliverables: [
      'Private Sourcing Agent Outreach & Negotiation Scripts',
      'Pre-Shipment Quality Inspection Checklist',
      'Automated Order Sync & Dispute Prevention Workflow',
    ],
    tiles: {
      blackTitle: 'Transit Time',
      blackStat: '6–9 Days Air',
      orangeTitle: 'QC Protocol',
      orangeStat: 'Video Verified',
      yellowTitle: 'Backup Lines',
      yellowStat: '2x Redundancy',
    },
  },
  {
    id: 'ads',
    label: 'Ads',
    stepNumber: '04',
    headline: 'Test scroll-stopping creatives with disciplined budget caps.',
    description:
      'Modern paid social is won in the first 3 seconds of video creative. We teach you how to script modular hooks, edit native UGC concepts, and run structured Meta & TikTok tests without burning cash.',
    deliverables: [
      '3-Second Hook & Modular Video Scripting Framework',
      'Low-Budget Creative Testing Campaign Structure',
      'Daily Kill / Scale Decision Rulebook (CPA & ROAS)',
    ],
    tiles: {
      blackTitle: 'Hook Rate',
      blackStat: '32%+ Target',
      orangeTitle: 'Creative Batch',
      orangeStat: '3x3 Matrix',
      yellowTitle: 'Kill Rule',
      yellowStat: '1.5x Max CPA',
    },
  },
  {
    id: 'scaling',
    label: 'Scaling',
    stepNumber: '05',
    headline: 'Scale winning ad sets while protecting cash flow and customer retention.',
    description:
      'Revenue means nothing if you keep zero profit. Master horizontal creative scaling, post-purchase email flows, custom branded packaging upgrades, and weekly P&L bookkeeping.',
    deliverables: [
      'Horizontal & Vertical Campaign Scaling Playbook',
      'Post-Purchase Email & SMS Retention Flows',
      'Weekly Cash-Flow & Contribution Margin Tracker',
    ],
    tiles: {
      blackTitle: 'Repeat Buyers',
      blackStat: '+22% LTV Lift',
      orangeTitle: 'P&L Cadence',
      orangeStat: 'Weekly Audit',
      yellowTitle: 'Brand Moat',
      yellowStat: 'Custom Pack',
    },
  },
];

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  initials: string;
  role: string;
  tag: string;
  rotation: number;
  accentBg: string;
  isPlaceholder: boolean;
}

export const TESTIMONIALS_BN: TestimonialItem[] = [
  {
    id: 't-1',
    quote:
      '“প্রতিটি মডিউলে টাকা খরচ করার আগে আসল লাভ-ক্ষতির হিসাব শেখানো হয়েছে। প্রোডাক্ট স্কোরকার্ডটি আমাকে কম মার্জিনের প্রোডাক্ট নেওয়া থেকে বাঁচিয়েছে।”',
    author: 'রাশেদুল আই.',
    initials: 'RI',
    role: 'নতুন স্টোর উদ্যোক্তা · চট্টগ্রাম',
    tag: 'প্রিভিউ রিডার · মডিউল ০১',
    rotation: -6,
    accentBg: '#ff7722',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 't-2',
    quote:
      '“আমার আগের স্টোরে ভিজিটর আসতো কিন্তু কেনাকাটা করতো না—এর আসল কারণ অবশেষে বুঝতে পেরেছি। প্রোডাক্ট পেজ ওয়্যারফ্রেম গাইডটি দারুণ কাজ করেছে।”',
    author: 'সামিরা টি.',
    initials: 'ST',
    role: 'ফ্রিল্যান্স ডিজাইনার ও বিল্ডার',
    tag: 'প্রিভিউ রিডার · মডিউল ০২',
    rotation: -2,
    accentBg: '#ffc765',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 't-3',
    quote:
      '“সাপ্লায়ার আউটরিচ টেমপ্লেট ব্যবহার করে মাত্র ১০টি অর্ডার পার হওয়ার আগেই আমি দুজন প্রাইভেট ফুলফিলমেন্ট এজেন্টের সাথে কথা চূড়ান্ত করতে পেরেছি।”',
    author: 'মাহমুদুল এইচ.',
    initials: 'MH',
    role: 'নতুন ই-কমার্স অপারেটর',
    tag: 'প্রিভিউ রিডার · মডিউল ০৩',
    rotation: 2,
    accentBg: '#fbc59d',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 't-4',
    quote:
      '“কোনো অবাস্তব প্রতিশ্রুতি নেই—শুধু পরিষ্কার স্প্রেডশিট, ভিডিও অ্যাড হুক স্ক্রিপ্ট এবং লস হওয়া অ্যাড কখন বন্ধ করতে হবে তার সুনির্দিষ্ট নিয়ম।”',
    author: 'ফারহানা এ.',
    initials: 'FA',
    role: 'মার্কেটিং প্রফেশনাল',
    tag: 'প্রিভিউ রিডার · মডিউল ০৪',
    rotation: 6,
    accentBg: '#3d2fa9',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
];

export const TESTIMONIALS_EN: TestimonialItem[] = [
  {
    id: 't-1',
    quote:
      '“Every module focuses on real math before spending money. The product scorecard alone saved me from importing low-margin gadgets.”',
    author: 'Rashedul I.',
    initials: 'RI',
    role: 'Aspiring Store Owner · Chittagong',
    tag: 'Preview Reader · Module 01',
    rotation: -6,
    accentBg: '#ff7722',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 't-2',
    quote:
      '“I finally understand why my old store had clicks but zero checkouts. The product page wireframe and offer stack guide changed everything.”',
    author: 'Samira T.',
    initials: 'ST',
    role: 'Freelance Designer & Builder',
    tag: 'Preview Reader · Module 02',
    rotation: -2,
    accentBg: '#ffc765',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 't-3',
    quote:
      '“The supplier outreach templates helped me get quotes from two private fulfillment agents before I even scaled past ten orders.”',
    author: 'Mahmudul H.',
    initials: 'MH',
    role: 'First-Time E-Commerce Operator',
    tag: 'Preview Reader · Module 03',
    rotation: 2,
    accentBg: '#fbc59d',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
  {
    id: 't-4',
    quote:
      '“No hype, no rented supercars—just clear spreadsheets, creative script hooks, and strict rules on when to cut losing ads.”',
    author: 'Farhana A.',
    initials: 'FA',
    role: 'Marketing Generalist',
    tag: 'Preview Reader · Module 04',
    rotation: 6,
    accentBg: '#3d2fa9',
    isPlaceholder: PLACEHOLDER_CONTENT,
  },
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS_BN: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'জয়েন করার জন্য কি আগে থেকে ই-কমার্স বা অ্যাড চালানোর অভিজ্ঞতা থাকা লাগবে?',
    answer:
      'না, পূর্ব অভিজ্ঞতার প্রয়োজন নেই। ড্রপশিপিং একাডেমিতে একদম শুরু থেকে ধাপে ধাপে ইউনিট ইকোনমিক্স, প্রোডাক্ট ভ্যালিডেশন, স্টোর তৈরি, সাপ্লায়ার নেগোসিয়েশন এবং অ্যাড টেস্টিং শেখানো হয়। প্রতিটি ধাপের সাথে রেডিমেড চেকলিস্ট ও ক্যালকুলেটর দেওয়া থাকে।',
  },
  {
    id: 'faq-2',
    question: 'একাডেমির বাইরে শুরু করার জন্য কী পরিমাণ মূলধন বা বাজেট থাকা ভালো?',
    answer:
      'প্রাথমিক অপারেটিং টুলস (ডোমেইন, শপিফাই ট্রায়াল প্ল্যান, স্যাম্পল অর্ডার এবং কম বাজেটে অ্যাড টেস্টিং) এর জন্য আমরা ৩০০ থেকে ৬০০ ডলার সমপরিমাণ বাজেট হাতে রাখার পরামর্শ দিই। আমরা কঠোর বাজেট কন্ট্রোল রুল শেখাই যাতে আপনার টাকা অযথা নষ্ট না হয়।',
  },
  {
    id: 'faq-3',
    question: 'এখন শুধুমাত্র ওয়েটলিস্টের মাধ্যমে কেন নিবন্ধন নেওয়া হচ্ছে?',
    answer:
      'আমরা প্রতিটি ব্যাচের শিক্ষার্থীদের স্টোর ডিজাইন, প্রোডাক্ট স্কোরকার্ড এবং অ্যাড ক্রিয়েটিভ সরাসরি রিভিউ করি। ব্যাচের সদস্য সংখ্যা সীমিত রাখার ফলে সবাই সরাসরি গাইডলাইন ও ফিডব্যাক পায়।',
  },
  {
    id: 'faq-4',
    question: 'বাংলাদেশ বা যুক্তরাষ্ট্র/ইউরোপের বাইরে থেকে কি এই সিস্টেমে কাজ করা সম্ভব?',
    answer:
      'হ্যাঁ, শতভাগ সম্ভব। আমাদের কারিকুলামে আন্তর্জাতিক পেমেন্ট গেটওয়ে সেটআপ এবং 3PL ফুলফিলমেন্ট এজেন্টের মাধ্যমে সরাসরি আমেরিকা, ইউরোপ ও অস্ট্রেলিয়ার ক্রেতাদের কাছে ৬–৯ কার্যদিবসে প্রোডাক্ট পৌঁছে দেওয়ার সম্পূর্ণ প্রক্রিয়া শেখানো হয়।',
  },
  {
    id: 'faq-5',
    question: 'ওয়েটলিস্টে ইমেইল ভেরিফাই করার পর কী হবে?',
    answer:
      '৬-ডিজিটের কোড দিয়ে আপনার ইমেইল ভেরিফাই করার সাথে সাথে আমাদের ডাটাবেসে আপনার স্থান নিশ্চিত হয়ে যাবে। পরবর্তী ব্যাচ শুরু হওয়ার তারিখ, বিস্তারিত তথ্য এবং আমাদের ফ্রি প্রোডাক্ট মার্জিন ক্যালকুলেটর সবার আগে আপনার ইমেইল ও হোয়াটসঅ্যাপে পাঠানো হবে।',
  },
];

export const FAQ_ITEMS_EN: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Do I need prior e-commerce or paid advertising experience to join?',
    answer:
      'No prior experience is required. Dropshipping Academy is structured sequentially from foundational unit economics and product validation to store building, supplier negotiation, and creative ad testing. Every concept includes step-by-step checklists and calculators.',
  },
  {
    id: 'faq-2',
    question: 'How much starting capital do I need besides the academy?',
    answer:
      'We recommend setting aside $300 to $600 for your initial operating tools (domain, Shopify trial plan, sample orders, and structured low-budget creative testing). We teach strict budget protection rules so you never spend blindly.',
  },
  {
    id: 'faq-3',
    question: 'Why is enrollment currently waitlist-only?',
    answer:
      'We review store builds, product scorecards, and ad creatives directly with each cohort. Capping cohort size ensures every member gets actionable feedback rather than getting lost in a crowded forum.',
  },
  {
    id: 'faq-4',
    question: 'Does this work if I am operating from outside the US or Europe?',
    answer:
      'Yes. Our curriculum covers cross-border payment gateways, international entity considerations, and working with 3PL fulfillment agents that ship directly to customers in North America, Europe, and Australia within 6–9 business days.',
  },
  {
    id: 'faq-5',
    question: 'What happens after I verify my email on the waitlist?',
    answer:
      'Once you verify your 6-digit email code, your spot in line is locked in our database. You will receive early access to our cohort opening dates, tuition details, and our free Product Margin Calculator via email and WhatsApp.',
  },
];

export function getToolCategories(lang: Language) {
  return lang === 'bn' ? TOOL_CATEGORIES_BN : TOOL_CATEGORIES_EN;
}

export function getFeaturedResults(lang: Language) {
  return lang === 'bn' ? FEATURED_RESULTS_BN : FEATURED_RESULTS_EN;
}

export function getCurriculumTabs(lang: Language) {
  return lang === 'bn' ? CURRICULUM_TABS_BN : CURRICULUM_TABS_EN;
}

export function getTestimonials(lang: Language) {
  return lang === 'bn' ? TESTIMONIALS_BN : TESTIMONIALS_EN;
}

export function getFaqItems(lang: Language) {
  return lang === 'bn' ? FAQ_ITEMS_BN : FAQ_ITEMS_EN;
}

// Keep default exports for compatibility
export const TOOL_CATEGORIES = TOOL_CATEGORIES_BN;
export const FEATURED_RESULTS = FEATURED_RESULTS_BN;
export const CURRICULUM_TABS = CURRICULUM_TABS_BN;
export const TESTIMONIALS = TESTIMONIALS_BN;
export const FAQ_ITEMS = FAQ_ITEMS_BN;
