import React from 'react';

const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M11 4h2v8h4l-5 5-5-5h4z"/>
  </svg>
);

export default ArrowDownIcon;