import React from 'react';

const ColombiaFlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" {...props}>
        <rect width="900" height="300" fill="#FFCD00"/>
        <rect y="300" width="900" height="150" fill="#003893"/>
        <rect y="450" width="900" height="150" fill="#CE1126"/>
    </svg>
);

export default ColombiaFlagIcon;
