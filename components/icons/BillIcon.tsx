import React from 'react';

const BillIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4 2 h20 l4 4 v22 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 Z" fill="#F5F5F5"/>
    <path d="M24 2 L28 6 H22 V2 Z" fill="#E0E0E0"/>
    <rect x="8" y="12" width="16" height="2" fill="#C1C1C1"/>
    <rect x="8" y="16" width="16" height="2" fill="#C1C1C1"/>
    <rect x="8" y="20" width="10" height="2" fill="#C1C1C1"/>
  </svg>
);

export default BillIcon;