import React from 'react';

const TransportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect x="3" y="6" width="26" height="18" rx="4" fill="#5596E6"/>
        <rect x="3" y="16" width="26" height="3" fill="#F2B33D"/>
        <rect x="5" y="8" width="22" height="7" fill="#C1C1C1"/>
        <path d="M7 28 a3 3 0 1 0 0-6 a3 3 0 0 0 0 6z" fill="#3A3A3A"/>
        <path d="M25 28 a3 3 0 1 0 0-6 a3 3 0 0 0 0 6z" fill="#3A3A3A"/>
        <circle cx="7" cy="25" r="1.5" fill="#E0E0E0"/>
        <circle cx="25" cy="25" r="1.5" fill="#E0E0E0"/>
        <rect x="25" y="4" width="2" height="4" rx="1" fill="#F2B33D"/>
        <rect x="5" y="4" width="2" height="4" rx="1" fill="#F2B33D"/>
    </svg>
);

export default TransportIcon;