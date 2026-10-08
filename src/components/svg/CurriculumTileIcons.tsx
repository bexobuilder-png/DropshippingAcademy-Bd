import React from 'react';

export const TileAnalyticsIcon: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => (
  <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
    <rect x="6" y="24" width="7" height="14" rx="2" fill="#ff7722" />
    <rect x="18.5" y="16" width="7" height="22" rx="2" fill="#ffc765" />
    <rect x="31" y="8" width="7" height="30" rx="2" fill="#fbf9ef" />
  </svg>
);

export const TileCompassIcon: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => (
  <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
    <circle cx="22" cy="22" r="16" stroke="#171412" strokeWidth="2.5" />
    <path
      d="M27.5 16.5L24 24L16.5 27.5L20 20L27.5 16.5Z"
      fill="#171412"
      stroke="#171412"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const TileBoltIcon: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => (
  <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
    <path
      d="M24 6L10 24H21L19 38L34 20H23L24 6Z"
      fill="#171412"
      stroke="#171412"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
