import React from 'react';

const PetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 16 A6 6 0 0 1 22 22 A6 6 0 0 1 10 22 A6 6 0 0 1 16 16 Z" fill="#A6634B"/>
    <circle cx="8" cy="14" r="3.5" fill="#A6634B"/>
    <circle cx="24" cy="14" r="3.5" fill="#A6634B"/>
    <circle cx="12" cy="8" r="3" fill="#A6634B"/>
    <circle cx="20" cy="8" r="3" fill="#A6634B"/>
  </svg>
);

export default PetIcon;