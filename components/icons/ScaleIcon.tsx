import React from 'react';

const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M12 3v18" />
    <path d="M5 9s-2 5 0 7c2 2 5 2 7 0" />
    <path d="M19 9s2 5 0 7c-2 2-5 2-7 0" />
  </svg>
);

export default ScaleIcon;