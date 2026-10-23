export interface CourseItem {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  price: number;
  discountPrice?: number;
  promoCodeEligible: boolean;
  duration: string;
  highlights: string[];
  badge?: string;
  isActive: boolean;
  sortOrder: number;
  isRunning?: boolean;
  batchName?: string;
  isVisible?: boolean;
  thumbnailUrl?: string;
  enrollmentType?: 'payment' | 'promo_only' | 'both';
  requiredPromoCode?: string;
}

export interface PromoCodeItem {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  description: string;
  isActive: boolean;
  minPrice?: number;
  applicableCourseId?: string; // If restricted to specific course, or empty for all
}

export const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'dropshipping-reselling',
    title: 'ড্রপশিপিং রিসেলিং',
    category: 'ড্রপশিপিং রিসেলিং',
    subtitle: 'বিনা পুঁজিতে পণ্য স্টক না রেখে পাইকারি সাপ্লায়ারদের মাধ্যমে ব্যবসা শুরু করুন।',
    description: 'সরাসরি ভেরিফাইড পাইকারি সাপ্লায়ারদের থেকে পণ্য নিয়ে সোশ্যাল মিডিয়া ও রিসেলিং প্ল্যাটফর্মে বিক্রি করুন। কোনো নিজস্ব ইনভেস্টমেন্ট ছাড়াই নিয়মিত লাভ নিশ্চিত।',
    price: 1000,
    discountPrice: 500,
    promoCodeEligible: true,
    enrollmentType: 'payment',
    thumbnailUrl: '/images/course_dropshipping_basic_1791567728755.jpg',
    duration: '৪ সপ্তাহ · প্র্যাকটিক্যাল গাইডলাইন',
    highlights: [
      'জিরো ইনভেস্টমেন্ট রিসেলিং মেথড',
      'ভেরিফাইড হোলসেল সাপ্লায়ার ডিরেক্টরি',
      'প্রতি অর্ডারে নিশ্চিত প্রফিট মার্জিন',
    ],
    isActive: true,
    isVisible: true,
    sortOrder: 1,
  },
  {
    id: 'dropshipping-international',
    title: 'গ্লোবাল ড্রপশিপিং',
    category: 'গ্লোবাল ড্রপশিপিং',
    subtitle: 'আন্তর্জাতিক বাজারে শপিফাই ও ফুল-স্ট্যাক ড্রপশিপিং একাডেমি।',
    description: 'আন্তর্জাতিক মানের শপিফাই ড্রপশিপিং স্টোর বিল্ড করা, ইন্টারন্যাশনাল পেমেন্ট গেটওয়ে সেটআপ এবং ফুলফিলমেন্ট অটোমেশনের এ টু জেড।',
    price: 5000,
    discountPrice: 2500,
    promoCodeEligible: true,
    enrollmentType: 'promo_only',
    requiredPromoCode: 'INTL100',
    thumbnailUrl: '/images/course_dropshipping_basic_1791567728755.jpg',
    duration: '৮ সপ্তাহ · লাইভ ক্লাস ও প্রজেক্ট',
    highlights: [
      'গ্লোবাল মার্কেটপ্লেস এনালাইসিস',
      'শপিফাই স্টোর ডিজাইন ও অটোমেশন',
      'ইন্টারন্যাশনাল পেমেন্ট গেটওয়ে সেটআপ',
    ],
    isActive: true,
    isVisible: true,
    sortOrder: 2,
  },
];


export const DEFAULT_PROMO_CODES: PromoCodeItem[] = [
  {
    id: 'promo-1',
    code: 'PROMO1000',
    discountType: 'fixed',
    discountValue: 300,
    description: 'স্পেশাল ১,০০০ টাকা প্রোমো কোড (৳৩০০ ছাড়)',
    isActive: true,
  },
  {
    id: 'promo-2',
    code: 'RESELLER500',
    discountType: 'fixed',
    discountValue: 500,
    description: 'রিসেলার বিশেষ ছাড় (৳৫০০ সরাসরি ছাড়)',
    isActive: true,
  },
  {
    id: 'promo-3',
    code: 'WELCOME50',
    discountType: 'percentage',
    discountValue: 50,
    description: 'নতুন শিক্ষার্থীদের ৫০% ওয়েলকাম ছাড় (৳৫০০ ছাড়)',
    isActive: true,
  },
  {
    id: 'promo-4',
    code: 'DISCOUNT200',
    discountType: 'fixed',
    discountValue: 200,
    description: 'স্টুডেন্ট স্পেশাল ছাড় (৳২০০ অফ)',
    isActive: true,
  },
  {
    id: 'promo-5',
    code: 'FREE1000',
    discountType: 'fixed',
    discountValue: 1000,
    description: '১০০% ফ্রি স্কলারশিপ কোড (৳১,০০০ সম্পূর্ণ ফ্রি)',
    isActive: true,
  },
  {
    id: 'promo-6',
    code: 'DROP1000',
    discountType: 'fixed',
    discountValue: 1000,
    description: 'ড্রপশিপিং স্পেশাল ১০০০ টাকা ছাড় (৳১,০০০ অফ)',
    isActive: true,
  },
  {
    id: 'promo-7',
    code: 'BD1000',
    discountType: 'fixed',
    discountValue: 1000,
    description: 'বাংলাদেশ একাডেমি ১০০০ টাকা স্কলারশিপ',
    isActive: true,
  },
];
