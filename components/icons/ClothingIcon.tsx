import React from 'react';

const ClothingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M28 8 L24 4 L22 4 L18 8 L18 2 L14 2 L14 8 L10 4 L8 4 L4 8 L4 28 L28 28 Z" fill="#5596E6"/>
    <path d="M14 8 h4 v4 a4 4 0 1 1 -4 0z" fill="#4377B5"/>
    <path d="M14 2 L10 4 L14 8 Z" fill="#4377B5"/>
    <path d="M18 2 L22 4 L18 8 Z" fill="#4377B5"/>
  </svg>
);

export default ClothingIcon;