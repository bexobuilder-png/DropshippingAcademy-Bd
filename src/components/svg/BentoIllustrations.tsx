import React from 'react';

/**
 * 1. Rising Revenue & Contribution Margin Chart Illustration
 */
export const RevenueChartIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-48',
}) => (
  <svg
    viewBox="0 0 480 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Subtle Graph Grid Lines */}
    <line x1="24" y1="36" x2="456" y2="36" stroke="#fbf9ef" strokeOpacity="0.1" strokeDasharray="4 4" />
    <line x1="24" y1="86" x2="456" y2="86" stroke="#fbf9ef" strokeOpacity="0.1" strokeDasharray="4 4" />
    <line x1="24" y1="136" x2="456" y2="136" stroke="#fbf9ef" strokeOpacity="0.18" />
    <line x1="24" y1="176" x2="456" y2="176" stroke="#fbf9ef" strokeOpacity="0.1" />

    {/* Break-even Threshold Tag */}
    <g className="illo-float">
      <rect x="28" y="122" width="96" height="20" rx="4" fill="#813502" />
      <text x="76" y="135" textAnchor="middle" fill="#fbc59d" fontSize="9.5" fontWeight="700" fontFamily="Instrument Sans, sans-serif">
        BREAK-EVEN ROAS
      </text>
    </g>

    {/* Revenue Bars */}
    <rect className="illo-bar" x="64" y="142" width="28" height="34" rx="4" fill="#fbf9ef" fillOpacity="0.15" />
    <rect className="illo-bar" x="122" y="126" width="28" height="50" rx="4" fill="#fbf9ef" fillOpacity="0.22" />
    <rect className="illo-bar" x="180" y="102" width="28" height="74" rx="4" fill="#fbc59d" fillOpacity="0.55" />
    <rect className="illo-bar" x="238" y="78" width="28" height="98" rx="4" fill="#ffc765" />
    <rect className="illo-bar" x="296" y="54" width="28" height="122" rx="4" fill="#ff7722" />
    <rect className="illo-bar" x="354" y="28" width="28" height="148" rx="4" fill="#ff7722" />

    {/* Rising Contribution Margin Curve */}
    <path
      className="illo-curve"
      d="M44 156C96 152 140 132 194 102C248 72 308 42 418 22"
      stroke="#fbf9ef"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Highlight Nodes */}
    <circle className="illo-pop" cx="194" cy="102" r="5" fill="#171412" stroke="#ffc765" strokeWidth="3" />
    <circle className="illo-pop" cx="310" cy="52" r="5.5" fill="#171412" stroke="#ff7722" strokeWidth="3" />
    <circle className="illo-pulse" cx="418" cy="22" r="7" fill="#ff7722" stroke="#fbf9ef" strokeWidth="3" />

    {/* Floating Callout Pill */}
    <g className="illo-float-delayed">
      <rect x="362" y="42" width="94" height="32" rx="16" fill="#fbf9ef" />
      <text x="409" y="62" textAnchor="middle" fill="#171412" fontSize="11.5" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">
        3.4x ROAS
      </text>
    </g>
  </svg>
);

/**
 * 2. Isometric Product Parcel Box & Margin Seal Illustration
 */
export const ProductBoxIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-48',
}) => (
  <svg
    viewBox="0 0 320 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Background Orbit Ring */}
    <ellipse
      className="illo-dash-flow"
      cx="160"
      cy="112"
      rx="118"
      ry="42"
      stroke="#fbc59d"
      strokeOpacity="0.3"
      strokeWidth="1.5"
      strokeDasharray="6 5"
    />

    {/* Isometric Cube Group */}
    <g className="illo-float">
      {/* Isometric Cube Base */}
      <path
        d="M160 36L236 76V152L160 188L84 152V76L160 36Z"
        fill="#ff7722"
        stroke="#fbf9ef"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Left Shaded Face */}
      <path
        d="M84 76L160 114V188L84 152V76Z"
        fill="#813502"
        stroke="#fbf9ef"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Top Open Flaps Accent */}
      <path
        d="M84 76L160 36L236 76L160 114L84 76Z"
        fill="#ffc765"
        stroke="#171412"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Packing Tape Strip */}
      <path
        d="M122 56L198 95"
        stroke="#171412"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </g>

    {/* Floating Margin Tag Left */}
    <g className="illo-float-delayed">
      <rect x="18" y="44" width="82" height="28" rx="14" fill="#fbf9ef" />
      <text x="59" y="62" textAnchor="middle" fill="#171412" fontSize="10.5" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">
        COGS: $11
      </text>
    </g>

    {/* Floating Price Tag Right */}
    <g className="illo-float">
      <rect x="218" y="118" width="86" height="28" rx="14" fill="#ffc765" />
      <text x="261" y="136" textAnchor="middle" fill="#171412" fontSize="10.5" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">
        AOV: $54
      </text>
    </g>
  </svg>
);

/**
 * 3. High-Converting Storefront Wireframe Illustration
 */
export const StorefrontIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-44',
}) => (
  <svg
    viewBox="0 0 320 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Browser Window Frame */}
    <rect
      x="28"
      y="16"
      width="264"
      height="150"
      rx="10"
      fill="#231f1c"
      stroke="#fbf9ef"
      strokeOpacity="0.25"
      strokeWidth="2"
    />
    {/* Top Bar Dots */}
    <circle cx="44" cy="30" r="3" fill="#ff7722" />
    <circle cx="55" cy="30" r="3" fill="#ffc765" />
    <circle cx="66" cy="30" r="3" fill="#fbc59d" />
    <line x1="28" y1="42" x2="292" y2="42" stroke="#fbf9ef" strokeOpacity="0.15" />

    {/* Product Gallery Box */}
    <rect x="44" y="54" width="102" height="96" rx="6" fill="#ff7722" fillOpacity="0.2" stroke="#ff7722" strokeWidth="1.8" />
    <g className="illo-pulse">
      <circle cx="95" cy="96" r="22" fill="#ff7722" />
      <path d="M87 96L93 102L105 90" stroke="#fbf9ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Offer Stack / Bundle Rows */}
    <rect x="160" y="54" width="84" height="10" rx="3" fill="#fbf9ef" />
    <rect x="160" y="70" width="114" height="18" rx="4" fill="#fbf9ef" fillOpacity="0.12" stroke="#ffc765" strokeWidth="1.2" />
    <rect x="160" y="94" width="114" height="18" rx="4" fill="#fbf9ef" fillOpacity="0.08" />

    {/* Sticky CTA Button */}
    <g className="illo-float">
      <rect x="160" y="122" width="114" height="28" rx="14" fill="#ffc765" />
      <text x="217" y="140" textAnchor="middle" fill="#171412" fontSize="10" fontWeight="800" fontFamily="Instrument Sans, sans-serif">
        ADD TO BAG · $49
      </text>
    </g>
  </svg>
);

/**
 * 4. Global Express Shipping Route Illustration
 */
export const ShippingRouteIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-44',
}) => (
  <svg
    viewBox="0 0 320 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Radar / Coordinate Grid */}
    <circle cx="160" cy="140" r="95" stroke="#fbf9ef" strokeOpacity="0.12" strokeWidth="1.5" />
    <circle cx="160" cy="140" r="60" stroke="#fbf9ef" strokeOpacity="0.12" strokeWidth="1.5" />

    {/* Arc Flight Trajectory */}
    <path
      className="illo-dash-flow"
      d="M42 136C92 42 228 42 278 136"
      stroke="#ff7722"
      strokeWidth="3"
      strokeDasharray="6 5"
      strokeLinecap="round"
    />

    {/* Origin Factory Node */}
    <circle cx="42" cy="136" r="9" fill="#fbc59d" stroke="#171412" strokeWidth="2.5" />
    <text x="42" y="162" textAnchor="middle" fill="#fbc59d" fontSize="9.5" fontWeight="700" fontFamily="Instrument Sans, sans-serif">
      3PL AGENT
    </text>

    {/* Mid-Flight Express Badge */}
    <g className="illo-float">
      <rect x="112" y="46" width="96" height="28" rx="14" fill="#ffc765" />
      <text x="160" y="64" textAnchor="middle" fill="#171412" fontSize="10" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">
        6–9 DAYS AIR
      </text>
    </g>

    {/* Destination Customer Node */}
    <circle className="illo-pulse" cx="278" cy="136" r="10" fill="#ff7722" stroke="#fbf9ef" strokeWidth="2.5" />
    <text x="278" y="162" textAnchor="middle" fill="#fbf9ef" fontSize="9.5" fontWeight="700" fontFamily="Instrument Sans, sans-serif">
      DOORSTEP
    </text>
  </svg>
);
