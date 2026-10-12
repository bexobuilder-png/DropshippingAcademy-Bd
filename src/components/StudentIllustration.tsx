import React from 'react';

export const StudentIllustration: React.FC = () => {
  return (
    <div className="h3-art" id="heroArt">
      <div className="student-wrap">
        <div className="stage">
          <img
            className="student-photo"
            src="/student-hero.webp"
            alt="A student studying on a laptop beside a stack of books"
            width={982}
            height={1000}
          />
          <i className="st-part head" aria-hidden="true" style={{ backgroundImage: 'url(/student-hero.webp)' }} />
          <i className="st-part hand hl" aria-hidden="true" style={{ backgroundImage: 'url(/student-hero.webp)' }} />
          <i className="st-part hand hr" aria-hidden="true" style={{ backgroundImage: 'url(/student-hero.webp)' }} />
        </div>
        <span className="key k1" aria-hidden="true" />
        <span className="key k2" aria-hidden="true" />
        <span className="key k3" aria-hidden="true" />
        <span className="spark s1" aria-hidden="true" />
        <span className="spark s2" aria-hidden="true" />
        <span className="spark s3" aria-hidden="true" />
        <span className="bub b1" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M3 4h3l2.4 11h9.2L20 7H7" />
            <circle cx="9.5" cy="19.5" r="1.2" />
            <circle cx="17" cy="19.5" r="1.2" />
          </svg>
        </span>
        <span className="bub b2" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
            <path d="M4 8l8 4 8-4M12 12v8" />
          </svg>
        </span>
        <span className="bub b3" aria-hidden="true">৳</span>
      </div>
    </div>
  );
};
