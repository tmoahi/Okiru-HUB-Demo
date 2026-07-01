import React from 'react';

export default function OkiruLogo({ size = 36, className = '' }) {
  return (
    <img
      src="/okiru-symbol.png"
      alt="Okiru"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}
