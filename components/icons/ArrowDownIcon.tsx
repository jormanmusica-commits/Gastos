import React from 'react';

const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="#F87171" d="M16 29 L4 17 l6 0 l0 -14 l12 0 l0 14 l6 0 Z"/>
        <path fill="#EF4444" d="M16 29 L10 17 l3 0 l0 -14 l6 0 l0 14 l3 0 Z"/>
    </svg>
);

export default ArrowDownIcon;