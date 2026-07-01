import React from 'react';

export default function OkiruLogo({ height = 36, className = '' }) {
  return (
    <img
      src="/okiru-logo.png"
      alt="Okiru Learn"
      height={height}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}
