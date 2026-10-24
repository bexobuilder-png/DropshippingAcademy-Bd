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

export const DEFAULT_COURSES: CourseItem[] = [];

export const DEFAULT_PROMO_CODES: PromoCodeItem[] = [];

