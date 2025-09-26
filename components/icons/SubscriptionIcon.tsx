import React from 'react';

const SubscriptionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M28 28 V4 H4 V28 H28 Z" fill="#F5F5F5"/>
    <path d="M28 4 H4 V8 H28 Z" fill="#5596E6"/>
    <rect x="8" y="12" width="8" height="8" fill="#C1C1C1"/>
    <rect x="18" y="12" width="6" height="2" fill="#A6634B"/>
    <rect x="18" y="16" width="6" height="2" fill="#A6634B"/>
    <rect x="18" y="20" width="6" height="2" fill="#A6634B"/>
    <text x="6" y="7" fontFamily="sans-serif" fontSize="3" fill="#FFFFFF" fontWeight="bold">NEWS</text>
  </svg>
);

export default SubscriptionIcon;