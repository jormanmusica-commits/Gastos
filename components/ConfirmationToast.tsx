import React from 'react';

interface ConfirmationToastProps {
  show: boolean;
  message: string;
}

const ConfirmationToast: React.FC<ConfirmationToastProps> = ({ show, message }) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-6 py-3 bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900 rounded-full shadow-lg animate-fade-in-out"
      role="alert"
      aria-live="assertive"
    >
      <p className="font-semibold text-lg">{message}</p>
    </div>
  );
};

export default ConfirmationToast;
