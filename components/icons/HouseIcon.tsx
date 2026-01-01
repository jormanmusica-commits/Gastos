import React from 'react';

const HouseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 3L2 14v15h28V14L16 3z" fill="#F5F5F5"/>
    <path d="M16 3L2 14h28L16 3z" fill="#DD4F40"/>
    <path d="M22 18h-4v10h4V18z" fill="#A6634B"/>
    <path d="M14 18h-4v5h4v-5z" fill="#C1C1C1"/>
    <path d="M13 24h-2v-3h2v3z" fill="#2D72B8"/>
  </svg>
);

export default HouseIcon;