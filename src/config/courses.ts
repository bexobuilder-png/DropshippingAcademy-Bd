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
  discountType?: 'percentage' | 'fixed';
  percentage: number; // Percentage discount (1 to 50%)
  maxPercentage?: number; // Default capped at 50%
  usageLimit: number; // Max redemptions allowed
  usedCount: number; // Current redemptions
  expiresAt?: string; // Optional expiry date ISO or YYYY-MM-DD
  description: string;
  isActive: boolean;
  applicableCourseId?: string; // Specific course ID or empty/all
  minPrice?: number;
  discountValue?: number; // Fallback for fixed discount calculation
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
    enrollmentType: 'payment',
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
    code: 'EARLY20',
    discountType: 'percentage',
    percentage: 20,
    maxPercentage: 50,
    usageLimit: 50,
    usedCount: 12,
    description: 'আর্লি বার্ড স্পেশাল ২০% ছাড়',
    isActive: true,
  },
  {
    id: 'promo-2',
    code: 'RESELLER50',
    discountType: 'percentage',
    percentage: 50,
    maxPercentage: 50,
    usageLimit: 100,
    usedCount: 34,
    description: 'রিসেলার বিশেষ ৫০% চূড়ান্ত ছাড় (সর্বোচ্চ ক্যাপ)',
    isActive: true,
    applicableCourseId: 'dropshipping-reselling',
  },
  {
    id: 'promo-3',
    code: 'WELCOME30',
    discountType: 'percentage',
    percentage: 30,
    maxPercentage: 50,
    usageLimit: 30,
    usedCount: 8,
    description: 'নতুন শিক্ষার্থীদের ৩০% ওয়েলকাম ছাড়',
    isActive: true,
  },
  {
    id: 'promo-4',
    code: 'GLOBAL25',
    discountType: 'percentage',
    percentage: 25,
    maxPercentage: 50,
    usageLimit: 40,
    usedCount: 5,
    description: 'গ্লোবাল ড্রপশিপিং কোর্সে ২৫% ছাড়',
    isActive: true,
    applicableCourseId: 'dropshipping-international',
  },
  {
    id: 'promo-5',
    code: 'SPECIAL15',
    discountType: 'percentage',
    percentage: 15,
    maxPercentage: 50,
    usageLimit: 20,
    usedCount: 20, // Expired by limit
    description: 'লিমিটেড অফার ১৫% ছাড়',
    isActive: true,
  },
];

