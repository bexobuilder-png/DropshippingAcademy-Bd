import React from 'react';

/**
 * Original SVG Confetti & Checkmark Seal Illustration for /waitlist-confirmed
 */
export const SuccessIllustration: React.FC<{ className?: string }> = ({
  className = 'w-32 h-32',
}) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
  >
    <title>Waitlist spot confirmed checkmark badge</title>
    {/* Geometric Confetti Shapes */}
    <rect
      x="22"
      y="28"
      width="14"
      height="8"
      rx="4"
      transform="rotate(-25 22 28)"
      fill="#ff7722"
      stroke="#171412"
      strokeWidth="2"
    />
    <rect
      x="124"
      y="22"
      width="14"
      height="8"
      rx="4"
      transform="rotate(30 124 22)"
      fill="#3d2fa9"
      stroke="#171412"
      strokeWidth="2"
    />
    <circle cx="24" cy="116" r="6" fill="#ffc765" stroke="#171412" strokeWidth="2" />
    <circle cx="136" cy="112" r="7" fill="#ff7722" stroke="#171412" strokeWidth="2" />
    <path d="M80 10V20" stroke="#171412" strokeWidth="3" strokeLinecap="round" />
    <path d="M144 72H152" stroke="#171412" strokeWidth="3" strokeLinecap="round" />
    <path d="M8 72H16" stroke="#171412" strokeWidth="3" strokeLinecap="round" />

    {/* Outer Yellow Halo */}
    <circle
      cx="80"
      cy="82"
      r="48"
      fill="#ffc765"
      stroke="#171412"
      strokeWidth="3"
    />
    {/* Inner Orange Badge */}
    <circle
      cx="80"
      cy="82"
      r="36"
      fill="#ff7722"
      stroke="#171412"
      strokeWidth="3"
    />
    {/* Bold Checkmark */}
    <path
      d="M64 82.5L75 93.5L97 71.5"
      stroke="#fbf9ef"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
