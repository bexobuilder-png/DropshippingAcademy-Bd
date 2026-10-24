import type { Language } from '../context/LanguageContext';

export const PLACEHOLDER_CONTENT = false;

export interface ToolCategoryItem {
  id: string;
  name: string;
  category: string;
}

export const TOOL_CATEGORIES_BN: ToolCategoryItem[] = [];
export const TOOL_CATEGORIES_EN: ToolCategoryItem[] = [];

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

export const FEATURED_RESULTS_BN: BentoResultItem[] = [];
export const FEATURED_RESULTS_EN: BentoResultItem[] = [];

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

export const CURRICULUM_TABS_BN: CurriculumTabItem[] = [];
export const CURRICULUM_TABS_EN: CurriculumTabItem[] = [];

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

export const TESTIMONIALS_BN: TestimonialItem[] = [];
export const TESTIMONIALS_EN: TestimonialItem[] = [];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS_BN: FaqItem[] = [];
export const FAQ_ITEMS_EN: FaqItem[] = [];

export interface CourseItem {
  id: string;
  badge?: string;
  badgeType?: 'popular' | 'upcoming' | 'new';
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  date: string;
  dateEn?: string;
  time: string;
  timeEn?: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  seatsTotal?: number;
  seatsBooked?: number;
}

export const DEFAULT_COURSES_BN: CourseItem[] = [];
export const DEFAULT_COURSES_EN: CourseItem[] = [];

export interface HeroSlideItem {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  tags: { label: string; sub: string }[];
  ctaText: string;
  image: string;
  floatingScriptText: string;
}

export const HERO_SLIDES_BN: HeroSlideItem[] = [];
export const HERO_SLIDES_EN: HeroSlideItem[] = [];

export interface WhyChooseUsItem {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

export const WHY_CHOOSE_US_ITEMS_BN: WhyChooseUsItem[] = [];
export const WHY_CHOOSE_US_ITEMS_EN: WhyChooseUsItem[] = [];
