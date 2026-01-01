import React from 'react';

const ShoppingCartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8 7 L10 21 H25 L28 10 H10" fill="#E0E0E0"/>
    <path d="M6 5 L8 7 M28 10 L10 10" stroke="#575757" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="26" r="3" fill="#3A3A3A"/>
    <circle cx="24" cy="26" r="3" fill="#3A3A3A"/>
    <rect x="2" y="5" width="4" height="2" fill="#A6634B"/>
  </svg>
);

export default ShoppingCartIcon;