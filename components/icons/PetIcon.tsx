import React from 'react';

const PetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2.5 12.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM7 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5-4.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path>
  </svg>
);

export default PetIcon;
