import React from 'react';

const BillIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <path d="M19.5 2h-15A2.5 2.5 0 0 0 2 4.5v15A2.5 2.5 0 0 0 4.5 22h15a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 19.5 2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm4 4h-2v-2h2v2zm0-4h-2V8h2v2zm4 4h-2v-2h2v2zm0-4h-2V8h2v2z"></path>
  </svg>
);

export default BillIcon;
