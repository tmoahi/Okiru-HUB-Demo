import React from 'react';

export default function OkiruLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Okiru"
    >
      <defs>
        <linearGradient id="ok-g1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#06CDE1" />
          <stop offset="54%"  stopColor="#BA0DA7" />
          <stop offset="100%" stopColor="#FF7512" />
        </linearGradient>
        <linearGradient id="ok-g2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#06CDE1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#BA0DA7" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* filled background disc */}
      <circle cx="24" cy="24" r="23" fill="url(#ok-g2)" />
      {/* outer ring */}
      <circle cx="24" cy="24" r="22" stroke="url(#ok-g1)" strokeWidth="2" />
      {/* inner circle — the O */}
      <circle cx="24" cy="24" r="10.5" stroke="url(#ok-g1)" strokeWidth="2.5" />
      {/* diagonal bar — the K stem */}
      <line x1="30" y1="12" x2="18" y2="36" stroke="url(#ok-g1)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
