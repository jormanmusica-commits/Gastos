import React from 'react';

const BeautyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 28 h8 v-12 h-8 z" fill="#3A3A3A"/>
        <path d="M10 16 h12 v-4 h-12 z" fill="#C1C1C1"/>
        <path d="M12 12 h8 v-4 h-8 z" fill="#3A3A3A"/>
        <path d="M14 8 L18 8 L16 4 Z" fill="#FF80A5"/>
    </svg>
);

export default BeautyIcon;