import React from 'react';

const TravelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M28 12 L18 2 L14 2 L14 12 L4 16 L4 20 L14 18 L14 28 L18 28 L18 18 L28 22 L28 18 Z" fill="#E0E0E0"/>
    <path d="M14 2 L18 2 L22 7 L14 12 Z" fill="#5596E6"/>
    <path d="M14 28 L18 28 L22 23 L14 18 Z" fill="#5596E6"/>
  </svg>
);

export default TravelIcon;