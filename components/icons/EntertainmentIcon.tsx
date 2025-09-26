import React from 'react';

const EntertainmentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M25 28 L7 28 L9 5 L23 5 Z" fill="#F5F5F5"/>
    <path d="M9 5 L7 28 L11 28 L13 5 Z" fill="#DD4F40"/>
    <path d="M13 5 L11 28 L15 28 L17 5 Z" fill="#F5F5F5"/>
    <path d="M17 5 L15 28 L19 28 L21 5 Z" fill="#DD4F40"/>
    <path d="M21 5 L19 28 L23 28 L25 5 Z" fill="#F5F5F5"/>
    <path d="M23 5 L21 28 L25 28 L23 5 Z" fill="#DD4F40"/>
    <circle cx="16" cy="6" r="5" fill="#F2B33D"/>
    <circle cx="10" cy="8" r="4" fill="#F2B33D"/>
    <circle cx="22" cy="8" r="4" fill="#F2B33D"/>
    <circle cx="18" cy="11" r="5" fill="#F2B33D"/>
    <circle cx="13" cy="12" r="3" fill="#F2B33D"/>
  </svg>
);

export default EntertainmentIcon;