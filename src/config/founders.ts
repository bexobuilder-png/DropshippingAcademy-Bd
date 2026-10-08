import founder1Photo from '../assets/founders/founder-1.jpg';
import founder2Photo from '../assets/founders/founder-2.jpg';
import type { Language } from '../context/LanguageContext';

/**
 * PLACEHOLDER_FOUNDERS_CONFIG
 * ----------------------------------------------------------------------------
 * Edit the names, titles, and short bios below with your real founder details.
 * Can also be edited live from the /check Admin Control Center.
 */
export const PLACEHOLDER_FOUNDERS_FLAG = true;

export interface FounderProfile {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  roleEn?: string;
  photo: string;
  alt: string;
  rotationClass: string;
  backdropColor: string;
  chipBg: string;
  chipText: string;
  shortBio: string;
  shortBioEn?: string;
  specialty: string;
  specialtyEn?: string;
  isPlaceholder: boolean;
}

export const FOUNDERS: FounderProfile[] = [
  {
    id: 'founder-1',
    name: 'আরাফাত রহমান',
    nameEn: 'Arafat Rahman',
    role: 'কো-ফাউন্ডার · প্রোডাক্ট ও সাপ্লায়ার স্ট্র্যাটেজি',
    roleEn: 'Co-Founder · Product & Supplier Strategy',
    photo: founder1Photo,
    alt: 'Portrait of Co-Founder leading product research and supplier strategy at Dropshipping Academy',
    rotationClass: '-rotate-3 md:-rotate-4',
    backdropColor: '#ff7722', // --orange
    chipBg: '#171412',
    chipText: '#fbf9ef',
    shortBio:
      '৪০টিরও বেশি সাপ্লায়ার স্যাম্পল টেস্ট করার পর নিজের প্রথম লাভজনক সিঙ্গেল-প্রোডাক্ট স্টোর তৈরি করেন। প্রফিট মার্জিন অডিট, ডিরেক্ট প্রাইভেট এজেন্ট ফুলফিলমেন্ট এবং প্রোডাক্ট ভ্যালিডেশন ফ্রেমওয়ার্কে বিশেষজ্ঞ।',
    shortBioEn:
      'Built his first profitable single-product store after testing 40+ supplier samples. Specializes in unit-economic margin audits, private agent fulfillment lines, and beginner-friendly product validation frameworks.',
    specialty: 'প্রোডাক্ট ভ্যালিডেশন ও ডিরেক্ট এজেন্ট সোর্সিং',
    specialtyEn: 'Product Validation & Direct Agent Sourcing',
    isPlaceholder: PLACEHOLDER_FOUNDERS_FLAG,
  },
  {
    id: 'founder-2',
    name: 'তানভীর হাসান',
    nameEn: 'Tanvir Hasan',
    role: 'কো-ফাউন্ডার · স্টোর আর্কিটেকচার ও পেইড অ্যাডস',
    roleEn: 'Co-Founder · Store Architecture & Paid Ads',
    photo: founder2Photo,
    alt: 'Portrait of Co-Founder leading conversion store design and paid acquisition at Dropshipping Academy',
    rotationClass: 'rotate-3 md:rotate-5',
    backdropColor: '#ffc765', // --yellow
    chipBg: '#171412',
    chipText: '#fbf9ef',
    shortBio:
      'কনভার্সন সাইকোলজি, দ্রুতগতির শপিফাই স্টোর ডিজাইন এবং মেটা ও টিকটক ক্রিয়েটিভ অ্যাড টেস্টিংয়ে অভিজ্ঞ। জটিল মিডিয়া-বায়িং হিসাবকে নতুনদের জন্য সহজ ডেইলি চেকলিস্টে রূপান্তর করেছেন।',
    shortBioEn:
      'Obsessed with conversion psychology, high-speed Shopify storefronts, and creative testing on Meta and TikTok. Turns complex media-buying math into simple daily checklists any first-time founder can follow.',
    specialty: 'কনভার্সন রেট ডিজাইন ও ক্রিয়েটিভ অ্যাড টেস্টিং',
    specialtyEn: 'Conversion Rate Design & Creative Ad Testing',
    isPlaceholder: PLACEHOLDER_FOUNDERS_FLAG,
  },
];

export const FOUNDER_STORY = {
  headline: 'ছোট টিম, বড় ফলাফল',
  lead: 'আমরা ড্রপশিপিং একাডেমি শুরু করেছি কারণ বেশিরভাগ ই-কমার্স কোর্সে আসল ইউনিট ইকোনমিক্সের বদলে পুরনো ট্রিকস শেখানো হয়।',
  body: 'যখন আমরা আমাদের প্রথম স্টোর শুরু করি, তখন ধীরগতির আলিএক্সপ্রেস শিপিং, সাধারণ টেমপ্লেট এবং প্রফিট মার্জিন হিসাব না করেই অ্যাড বাজেট নষ্ট করেছিলাম। পরে যখন আমরা ৪-ধাপের একটি সুনির্দিষ্ট সিস্টেম তৈরি করলাম—প্রোডাক্ট ভ্যালিডেশন, হাই-কনভার্টিং স্টোর আর্কিটেকচার, ডিরেক্ট এজেন্ট ফুলফিলমেন্ট এবং নিয়ন্ত্রিত ক্রিয়েটিভ অ্যাড টেস্টিং—তখনই আসল পরিবর্তন আসে। আমাদের টিম ছোট রাখা হয়েছে যাতে ওয়েটলিস্টের প্রতিটি শিক্ষার্থী সরাসরি আমাদের দৈনন্দিন ওয়ার্কফ্লো শিখতে পারে।',
  ctaLabel: 'টিমের সাথে পরিচিত হোন',
};

export const FOUNDER_STORY_EN = {
  headline: 'Small team, big results',
  lead: 'We started Dropshipping Academy because most e-commerce courses teach outdated hacks instead of real unit economics.',
  body: 'When we launched our first stores, we wasted months on slow AliExpress shipping, generic store templates, and ad budgets burned without tracking contribution margin. Once we stripped away the noise and built a strict four-stage operating system—validation, conversion architecture, direct agent fulfillment, and disciplined creative testing—everything clicked. We kept our team intentionally small so every student on our waitlist learns the exact workflows we use every day.',
  ctaLabel: 'Meet the team',
};

export function getLocalizedFounderStory(lang: Language) {
  return lang === 'bn' ? FOUNDER_STORY : FOUNDER_STORY_EN;
}
