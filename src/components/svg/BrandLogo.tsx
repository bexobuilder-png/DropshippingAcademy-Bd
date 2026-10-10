import React from 'react';

interface SvgProps {
  className?: string;
  title?: string;
  decorative?: boolean;
}

/**
 * Green Graduation Cap Icon matching the user's Dropshipping Academy BD branding.
 */
export const GraduationCapIcon: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Cap diamond */}
    <path
      d="M24 6L4 16L24 26L44 16L24 6Z"
      fill="#10b981"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Cap under crown */}
    <path
      d="M10 20V31C10 36 16.5 40 24 40C31.5 40 38 36 38 31V20"
      fill="#059669"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Tassel */}
    <path
      d="M40 17V33M37.5 33H42.5"
      stroke="#34d399"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Center button */}
    <circle cx="24" cy="16" r="2.5" fill="#ffffff" />
  </svg>
);

/**
 * Brand Lockup: Green graduation cap + Dropshipping Academy BD wordmark.
 */
export const DropshippingAcademyBdLogo: React.FC<{
  className?: string;
  isDark?: boolean;
}> = ({ className = 'h-10', isDark = true }) => (
  <div className={`inline-flex items-center gap-2.5 ${className}`}>
    <GraduationCapIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
    <div className="flex flex-col leading-tight select-none">
      <span
        className={`font-display text-[15px] sm:text-[17px] font-black tracking-tight ${
          isDark ? 'text-white' : 'text-[#0f172a]'
        }`}
      >
        Dropshipping
      </span>
      <span className="font-display text-[14px] sm:text-[16px] font-black text-[#10b981] tracking-tight">
        Academy BD
      </span>
    </div>
  </div>
);

/**
 * Round SVG badge mark: isometric parcel box + upward growth arrow.
 * Used in Top Nav, Footer, and SVG Favicon.
 */
export const BrandBadgeMark: React.FC<SvgProps> = ({
  className = 'w-10 h-10',
  title = 'Dropshipping Academy Logo Mark',
  decorative = false,
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={decorative ? 'true' : undefined}
    role={decorative ? undefined : 'img'}
  >
    {!decorative && <title>{title}</title>}
    <circle cx="32" cy="32" r="30" fill="#171412" stroke="#ff7722" strokeWidth="2.5" />
    {/* Isometric Parcel Box */}
    <path
      d="M32 16L48 24.5V41.5L32 50L16 41.5V24.5L32 16Z"
      fill="#ff7722"
      stroke="#fbf9ef"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path
      d="M16 24.5L32 33L48 24.5"
      stroke="#171412"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 33V50"
      stroke="#171412"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Upward Arrow on Top Face */}
    <path
      d="M26.5 23.5L32 18L37.5 23.5"
      stroke="#fbf9ef"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 18.5V28.5"
      stroke="#fbf9ef"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Circular orange SVG badge inline inside the giant Hero H1 headline.
 */
export const HeroInlineBoxBadge: React.FC<{ className?: string }> = ({
  className = 'inline-block w-[0.78em] h-[0.78em] align-baseline mx-1 md:mx-2 -translate-y-[0.06em]',
}) => (
  <svg
    viewBox="0 0 72 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="36" cy="36" r="34" fill="#ff7722" stroke="#171412" strokeWidth="3.5" />
    {/* Isometric Box Icon Inside */}
    <path
      d="M36 17L54 26.5V45.5L36 55L18 45.5V26.5L36 17Z"
      fill="#fbf9ef"
      stroke="#171412"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M18 26.5L36 36L54 26.5"
      stroke="#171412"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M36 36V55" stroke="#171412" strokeWidth="3" strokeLinecap="round" />
    <path
      d="M27 21.8L45 31.2"
      stroke="#ff7722"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Small Swiss corner sticker/stamp at the left edge of the Hero section.
 */
export const HeroCornerStamp: React.FC<{ className?: string }> = ({
  className = 'w-28 h-28',
}) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Scalloped / Stamp Outer Ring */}
    <circle
      cx="60"
      cy="60"
      r="54"
      fill="#ffc765"
      stroke="#171412"
      strokeWidth="2.5"
      strokeDasharray="6 4"
    />
    <circle cx="60" cy="60" r="44" fill="#fbf9ef" stroke="#171412" strokeWidth="2" />
    {/* Inner Parcel + Arrow */}
    <path
      d="M60 36L78 45.5V64.5L60 74L42 64.5V45.5L60 36Z"
      fill="#ff7722"
      stroke="#171412"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M42 45.5L60 55L78 45.5" stroke="#171412" strokeWidth="2" />
    <path d="M60 55V74" stroke="#171412" strokeWidth="2" />
    {/* Stamp Top & Bottom Labels */}
    <text
      x="60"
      y="30"
      textAnchor="middle"
      fill="#171412"
      fontSize="8.5"
      fontWeight="800"
      fontFamily="Bricolage Grotesque, sans-serif"
      letterSpacing="0.08em"
    >
      PRACTICAL
    </text>
    <text
      x="60"
      y="91"
      textAnchor="middle"
      fill="#171412"
      fontSize="8.5"
      fontWeight="800"
      fontFamily="Bricolage Grotesque, sans-serif"
      letterSpacing="0.08em"
    >
      SYSTEM · 2026
    </text>
  </svg>
);
