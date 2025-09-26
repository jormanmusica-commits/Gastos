import React from 'react';

const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M28.6 14.8 L17.2 3.4 C16.4 2.6 15.2 2 14 2 L4 2 C2.9 2 2 2.9 2 4 L2 14 C2 15.2 2.6 16.4 3.4 17.2 L14.8 28.6 C15.6 29.4 16.8 30 18 30 S20.4 29.4 21.2 28.6 L28.6 21.2 C29.4 20.4 30 19.2 30 18 S29.4 15.6 28.6 14.8 Z" fill="#84B64A"/>
    <circle cx="8" cy="8" r="2" fill="#F5F5F5"/>
  </svg>
);

export default TagIcon;