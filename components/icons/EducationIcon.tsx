import React from 'react';

const EducationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 8.48L6.44 8 12 5.12 17.56 8 12 11.48zM18 19v-4h-2v4h-2v2h6v-2h-2z"></path>
  </svg>
);

export default EducationIcon;
