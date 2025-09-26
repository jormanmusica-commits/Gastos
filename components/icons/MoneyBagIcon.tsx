import React from 'react';

const MoneyBagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 2 C8 2 4 10 4 14 C4 22 8 30 16 30 C24 30 28 22 28 14 C28 10 24 2 16 2Z" fill="#84B64A"/>
    <path d="M11 2 L11 8 C11 9.1 10.1 10 9 10 S7 9.1 7 8 L7 4 C9 2.5 11 2 11 2Z" fill="#43A047"/>
    <path d="M21 2 L21 8 C21 9.1 21.9 10 23 10 S25 9.1 25 8 L25 4 C23 2.5 21 2 21 2Z" fill="#43A047"/>
    <text x="16" y="22" fontFamily="Arial, sans-serif" fontSize="16" fill="#F2B33D" fontWeight="bold" textAnchor="middle">$</text>
  </svg>
);

export default MoneyBagIcon;