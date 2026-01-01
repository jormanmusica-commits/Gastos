import React from 'react';

const EducationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 4 L2 12 L16 20 L30 12 Z" fill="#3A3A3A"/>
    <path d="M7 15 L7 22 L16 27 L25 22 L25 15 L16 20 Z" fill="#575757"/>
    <path d="M28 10 L28 15 L25 15 L25 22 L28 22 L28 24 L24 24 L24 10 Z" fill="#F2B33D"/>
  </svg>
);

export default EducationIcon;