import React from 'react';

/**
 * Original SVG Illustration for Final CTA:
 * A Swiss keychain ring with a 3D parcel box charm and metal tag.
 */
export const KeychainIllustration: React.FC<{ className?: string }> = ({
  className = 'w-36 h-36 md:w-44 md:h-44',
}) => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
  >
    <title>Keychain with parcel box charm</title>
    {/* Split Key Ring Top */}
    <circle
      cx="90"
      cy="38"
      r="24"
      stroke="#171412"
      strokeWidth="6"
    />
    <circle
      cx="90"
      cy="38"
      r="18"
      stroke="#ff7722"
      strokeWidth="2.5"
    />

    {/* Chain Links */}
    <rect
      x="85"
      y="56"
      width="10"
      height="18"
      rx="5"
      fill="#fbf9ef"
      stroke="#171412"
      strokeWidth="3.5"
    />
    <rect
      x="85"
      y="70"
      width="10"
      height="18"
      rx="5"
      fill="#ffc765"
      stroke="#171412"
      strokeWidth="3.5"
    />

    {/* Side Mini Tag ("DAY 01") */}
    <g transform="rotate(16 112 76)">
      <rect
        x="104"
        y="58"
        width="54"
        height="26"
        rx="13"
        fill="#3d2fa9"
        stroke="#171412"
        strokeWidth="2.5"
      />
      <circle cx="114" cy="71" r="3" fill="#fbf9ef" />
      <text
        x="135"
        y="75"
        textAnchor="middle"
        fill="#fbf9ef"
        fontSize="9"
        fontWeight="800"
        fontFamily="Bricolage Grotesque, sans-serif"
      >
        PROFIT
      </text>
    </g>

    {/* Isometric 3D Box Charm */}
    <g transform="rotate(-5 90 126)">
      <path
        d="M90 82L138 106V150L90 172L42 150V106L90 82Z"
        fill="#ff7722"
        stroke="#171412"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M42 106L90 130L138 106L90 82L42 106Z"
        fill="#ffc765"
        stroke="#171412"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M42 106L90 130V172L42 150V106Z"
        fill="#813502"
        stroke="#171412"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Box Tape */}
      <path
        d="M66 94L114 118"
        stroke="#171412"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Upward Arrow on Box Right Face */}
      <path
        d="M106 146V128M106 128L99 135M106 128L113 135"
        stroke="#fbf9ef"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
