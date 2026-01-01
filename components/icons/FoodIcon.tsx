import React from 'react';

const FoodIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4 12 A12 4 0 0 1 28 12 L28 14 L4 14 Z" fill="#D9A456"/>
    <path d="M4 21 A12 4 0 0 0 28 21 L28 19 L4 19 Z" fill="#D9A456"/>
    <rect x="4" y="14" width="24" height="2" fill="#84B64A"/>
    <rect x="4" y="16" width="24" height="3" fill="#A6634B"/>
    <circle cx="9" cy="11" r="1" fill="#FFFFFF"/>
    <circle cx="15" cy="10" r="1.2" fill="#FFFFFF"/>
    <circle cx="21" cy="11" r="1" fill="#FFFFFF"/>
  </svg>
);

export default FoodIcon;