import React from 'react';

const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="#4ADE80" d="M16 3 L4 15 l6 0 l0 14 l12 0 l0 -14 l6 0 Z"/>
        <path fill="#22C55E" d="M16 3 L10 15 l3 0 l0 14 l6 0 l0 -14 l3 0 Z"/>
    </svg>
);

export default ArrowUpIcon;