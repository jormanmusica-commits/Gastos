import React from 'react';

const HealthIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="4" y="8" width="24" height="20" rx="3" fill="#F5F5F5"/>
    <rect x="4" y="6" width="24" height="4" rx="2" fill="#DD4F40"/>
    <rect x="14" y="12" width="4" height="12" fill="#DD4F40"/>
    <rect x="10" y="16" width="12" height="4" fill="#DD4F40"/>
    <rect x="10" y="4" width="2" height="4" fill="#3A3A3A"/>
    <rect x="20" y="4" width="2" height="4" fill="#3A3A3A"/>
  </svg>
);

export default HealthIcon;