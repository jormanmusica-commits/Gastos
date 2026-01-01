import React from 'react';

const GiftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="4" y="12" width="24" height="16" rx="2" fill="#5596E6"/>
    <rect x="14" y="4" width="4" height="24" fill="#DD4F40"/>
    <path d="M10 8 C6 8 4 12 4 12 L14 12 L14 8 Z" fill="#DD4F40"/>
    <path d="M22 8 C26 8 28 12 28 12 L18 12 L18 8 Z" fill="#DD4F40"/>
  </svg>
);

export default GiftIcon;