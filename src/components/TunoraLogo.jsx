import React from 'react';

export default function TunoraLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { width: 100, height: 28 },
    md: { width: 140, height: 38 },
    lg: { width: 200, height: 54 },
    xl: { width: 280, height: 76 },
  };

  const { width, height } = sizes[size] || sizes.md;

  return (
    <svg
      viewBox="0 0 280 50"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tunora"
    >
      {/* T */}
      <path
        d="M0 8h30v6H18.5v30h-7V14H0V8z"
        fill="url(#logo-gradient)"
      />
      {/* U */}
      <path
        d="M34 8h7v26c0 6 4.5 10 11 10s11-4 11-10V8h7v26c0 10-7.5 16.5-18 16.5S34 44 34 34V8z"
        fill="url(#logo-gradient)"
      />
      {/* N */}
      <path
        d="M78 8h6.5l18 28.5V8h7v36h-6.5l-18-28.5V44h-7V8z"
        fill="url(#logo-gradient)"
      />
      {/* O — waveform style */}
      <path
        d="M122 26c0-11 8.5-19 19-19s19 8 19 19-8.5 19-19 19-19-8-19-19z"
        fill="none"
        stroke="url(#logo-gradient)"
        strokeWidth="6"
        className="tunora-o"
      />
      {/* Waveform bars inside O */}
      <rect x="133" y="20" width="2.5" height="12" rx="1.25" fill="url(#logo-gradient)" opacity="0.7" />
      <rect x="137.5" y="16" width="2.5" height="20" rx="1.25" fill="url(#logo-gradient)" />
      <rect x="142" y="18" width="2.5" height="16" rx="1.25" fill="url(#logo-gradient)" opacity="0.8" />
      <rect x="146.5" y="14" width="2.5" height="24" rx="1.25" fill="url(#logo-gradient)" />
      <rect x="151" y="19" width="2.5" height="14" rx="1.25" fill="url(#logo-gradient)" opacity="0.7" />

      {/* R */}
      <path
        d="M168 8h17c8 0 13 5 13 12.5 0 5.5-3 9.5-8 11.5l10 12h-8.5l-9-11h-7.5v11h-7V8zm7 6v13h10c4 0 6.5-2.5 6.5-6.5S189 14 185 14h-10z"
        fill="url(#logo-gradient)"
      />
      {/* A */}
      <path
        d="M214 8h7.5l17 36h-7.5l-3.5-7.5h-19L205 44h-7.5L214 8zm5.75 7l-7 16h14l-7-16z"
        fill="url(#logo-gradient)"
      />

      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="240" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}
