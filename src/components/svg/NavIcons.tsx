import React from 'react';

interface IconProps {
  className?: string;
}

export const HomeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const AboutIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3 19.5C3 16.4624 5.46243 14 8.5 14H9.5C12.5376 14 15 16.4624 15 19.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M16.5 14.5C18.9853 14.5 21 16.5147 21 19"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const LearnIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 4L3 8.5L12 13L21 8.5L12 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M6 10.5V16.5L12 19.5L18 16.5V10.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FaqIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect
      x="3"
      y="4"
      width="18"
      height="15"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M9.5 9.2C9.5 7.98497 10.6193 7 12 7C13.3807 7 14.5 7.98497 14.5 9.2C14.5 10.1757 13.7812 10.875 12.7124 11.2981C12.2633 11.4759 12 11.8551 12 12.3382V12.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="15.8" r="1.1" fill="currentColor" />
  </svg>
);

export const ArrowDownCurvedIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
    <path
      d="M8 6C8 16 18 14 18 28"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M11 22L18 29L25 22"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ArrowRightSvgIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 10H16M16 10L10.5 4.5M16 10L10.5 15.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlusMinusIcon: React.FC<{ expanded: boolean; className?: string }> = ({
  expanded,
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M5 12H19"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {!expanded && (
      <path
        d="M12 5V19"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    )}
  </svg>
);

export const StarRatingSvg: React.FC<{ count?: number; className?: string }> = ({
  count = 5,
  className = 'h-4',
}) => (
  <div className="inline-flex items-center gap-1" role="img" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: count }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 20 20"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M10 1.8L12.45 6.76L17.92 7.56L13.96 11.42L14.89 16.87L10 14.3L5.11 16.87L6.04 11.42L2.08 7.56L7.55 6.76L10 1.8Z"
          fill="#ff7722"
          stroke="#171412"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
);

export const CalendarSvgIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
    <path d="M8 3V6M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect x="7" y="13" width="3" height="3" rx="0.5" fill="currentColor" />
  </svg>
);

export const ChevronLeftSvg: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M12.5 15L7.5 10L12.5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChevronRightSvg: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChevronDownSvg: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckSvgIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 10.5L8 14.5L16 6.5"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AlertCircleSvgIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M10 6V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="13.8" r="1.1" fill="currentColor" />
  </svg>
);

export const CloseSvgIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Hand-built SVG Country Flag / ISO Badge so no emoji or external flag images are used.
 */
export const CountryFlagSvg: React.FC<{ countryCode: string; className?: string }> = ({
  countryCode,
  className = 'w-6 h-4',
}) => {
  const code = (countryCode || 'US').toUpperCase();

  // Render distinctive vector flags for common countries + clean Swiss ISO badge for all 240+ countries
  if (code === 'BD') {
    return (
      <svg viewBox="0 0 24 16" fill="none" className={className} aria-hidden="true">
        <rect width="24" height="16" rx="2" fill="#006A4E" />
        <circle cx="10.5" cy="8" r="4.2" fill="#F42A41" />
      </svg>
    );
  }
  if (code === 'US') {
    return (
      <svg viewBox="0 0 24 16" fill="none" className={className} aria-hidden="true">
        <rect width="24" height="16" rx="2" fill="#B22234" />
        <path d="M0 3H24M0 6H24M0 9H24M0 12H24M0 15H24" stroke="#FFFFFF" strokeWidth="1.3" />
        <rect width="10" height="8.5" rx="1" fill="#3C3B6E" />
      </svg>
    );
  }
  if (code === 'GB') {
    return (
      <svg viewBox="0 0 24 16" fill="none" className={className} aria-hidden="true">
        <rect width="24" height="16" rx="2" fill="#012169" />
        <path d="M0 0L24 16M24 0L0 16" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M12 0V16M0 8H24" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="2.2" />
      </svg>
    );
  }
  if (code === 'IN') {
    return (
      <svg viewBox="0 0 24 16" fill="none" className={className} aria-hidden="true">
        <rect width="24" height="16" rx="2" fill="#FFFFFF" />
        <rect width="24" height="5.3" fill="#FF9933" />
        <rect y="10.7" width="24" height="5.3" fill="#138808" />
        <circle cx="12" cy="8" r="2" stroke="#000080" strokeWidth="1.2" />
      </svg>
    );
  }
  if (code === 'CA') {
    return (
      <svg viewBox="0 0 24 16" fill="none" className={className} aria-hidden="true">
        <rect width="24" height="16" rx="2" fill="#FFFFFF" />
        <rect width="6" height="16" fill="#FF0000" />
        <rect x="18" width="6" height="16" fill="#FF0000" />
        <path d="M12 4L14 8H10L12 4ZM12 8V12" stroke="#FF0000" strokeWidth="1.6" />
      </svg>
    );
  }
  if (code === 'AU') {
    return (
      <svg viewBox="0 0 24 16" fill="none" className={className} aria-hidden="true">
        <rect width="24" height="16" rx="2" fill="#00008B" />
        <path d="M0 4H10M5 0V8" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="18" cy="5" r="1.2" fill="#FFFFFF" />
        <circle cx="16" cy="11" r="1.2" fill="#FFFFFF" />
        <circle cx="20" cy="10" r="1" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 16" fill="none" className={className} aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="15"
        rx="2"
        fill="#171412"
        stroke="#ff7722"
        strokeWidth="1"
      />
      <text
        x="12"
        y="11"
        textAnchor="middle"
        fill="#fbf9ef"
        fontSize="8.5"
        fontWeight="700"
        fontFamily="Instrument Sans, sans-serif"
      >
        {code.slice(0, 2)}
      </text>
    </svg>
  );
};

export const SocialIconX: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 4L10.5 12.8L4 20H6.6L11.8 14.3L16 20H20L13.1 10.7L19.2 4H16.6L11.9 9.2L8 4H4Z"
      fill="currentColor"
    />
  </svg>
);

export const SocialIconInstagram: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect
      x="3.5"
      y="3.5"
      width="17"
      height="17"
      rx="4.5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
  </svg>
);

export const SocialIconYoutube: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect
      x="2.5"
      y="5"
      width="19"
      height="14"
      rx="4"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M10 9L15.5 12L10 15V9Z" fill="currentColor" />
  </svg>
);

export const SocialIconLinkedin: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect
      x="3.5"
      y="3.5"
      width="17"
      height="17"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M8 10.5V16.5M8 7.5V7.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path
      d="M12 16.5V12.8C12 11.4 12.9 10.5 14.2 10.5C15.5 10.5 16.2 11.4 16.2 12.8V16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const DownloadSvgIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 3.5V15.5M12 15.5L7.5 11M12 15.5L16.5 11"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 16.5V18.5C4.5 19.6046 5.39543 20.5 6.5 20.5H17.5C18.6046 20.5 19.5 19.6046 19.5 18.5V16.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

