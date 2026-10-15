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
}

export interface PromoCodeItem {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  description: string;
  isActive: boolean;
  minPrice?: number;
}

export const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'course-dropshipping-reselling',
    title: 'ড্রপশিপিং ও রিসেলিং মাস্টারক্লাস',
    category: 'ড্রপশিপিং রিসেলিং',
    subtitle: 'পণ্য না কিনেই শূন্য ইনভেস্টমেন্টে রিসেলিং ও ড্রপশিপিংয়ের মাধ্যমে নিয়মিত আয়',
    description: 'দেশীয় ও আন্তর্জাতিক সাপ্লায়ারদের সাথে সংযোগ, পণ্যের লাভজনক মার্জিন নির্ধারণ, অটোমেটেড অর্ডার ডেলিভারি এবং ক্যাশ-অন-ডেলিভারি হ্যান্ডলিংয়ের সম্পূর্ণ গাইডলাইন।',
    price: 1000,
    discountPrice: 1000,
    promoCodeEligible: true,
    duration: '৮ সপ্তাহ · লাইভ ক্লাস ও প্রজেক্ট',
    highlights: [
      'জিরো ইনভেন্টরি রিসেলিং মেথডোলজি',
      'ভেরিফাইড লোকাল ও গ্লোবাল হোলসেল সাপ্লায়ার তালিকা',
      'প্রতি অর্ডারে ৩০০–১,৫০০ টাকা নিশ্চিত নিট মার্জিন',
      'ক্যাশ-অন-ডেলিভারি রিটার্ন কমানোর গোপন টেকনিক',
    ],
    badge: 'সবচেয়ে জনপ্রিয়',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'course-marketing-growth',
    title: 'ডিজিটাল মার্কেটিং ও সেলস গ্রোথ (মার্কেটিং কিভাবে করবেন)',
    category: 'মার্কেটিং কিভাবে করবেন',
    subtitle: 'ফেসবুক, টিকটক ও সোশ্যাল মিডিয়ায় কার্যকর বিজ্ঞাপন দিয়ে কাস্টমার পাওয়ার কৌশল',
    description: 'অল্প বাজেটে মেটা ও সোশ্যাল মিডিয়া বিজ্ঞাপন রান করা, হাই-কনভার্টিং ভিডিও অ্যাড তৈরি, কাস্টমার ফানেল ও বিক্রয় বৃদ্ধির প্রমাণিত কৌশল।',
    price: 1000,
    discountPrice: 1000,
    promoCodeEligible: true,
    duration: '৬ সপ্তাহ · প্র্যাকটিক্যাল ক্যাম্পেইন ট্রেনিং',
    highlights: [
      'মেটা (ফেসবুক ও ইনস্টাগ্রাম) হাই-কনভার্সন বিজ্ঞাপন',
      'সেলস ফানেল, অ্যাড কপিরাইটিং ও স্ক্রিপ্ট রাইটিং',
      'কম খরচে বেশি কাস্টমার অর্ডার নিয়ে আসার কৌশল',
      'রিটার্ন অন অ্যাড স্পেন্ড (ROAS) অপ্টিমাইজেশন',
    ],
    badge: 'নতুন ব্যাচ',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'course-ecommerce-shopify',
    title: 'শপিফাই ও কমপ্লিট ই-কমার্স একাডেমি (কোর্স শিখুন)',
    category: 'কোর্স শিখুন',
    subtitle: 'আন্তর্জাতিক ও দেশীয় বাজারে বিশ্বমানের অনলাইন শপ তৈরি ও স্কেলিং',
    description: 'আন্তর্জাতিক মানের শপিফাই ড্রপশিপিং স্টোর বিল্ড করা, ইন্টারন্যাশনাল পেমেন্ট গেটওয়ে সেটআপ এবং ফুলফিলমেন্ট অটোমেশনের এ টু জেড।',
    price: 1000,
    discountPrice: 1000,
    promoCodeEligible: true,
    duration: '১০ সপ্তাহ · প্রজেক্ট ও সার্টিফিকেট',
    highlights: [
      'প্রফেশনাল শপিফাই ড্রপশিপিং স্টোর আর্কিটেকচার',
      'আন্তর্জাতিক পেমেন্ট গেটওয়ে ও কারেন্সি রূপান্তর',
      'প্রাইভেট সোর্সিং এজেন্ট ও দ্রুত এয়ার শিপিং',
      '১-অন-১ মেন্টর সাপোর্ট ও লাইফটাইম এক্সেস',
    ],
    badge: 'ফুল-স্ট্যাক একাডেমি',
    isActive: true,
    sortOrder: 3,
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
];
