import React from 'react';
import CheckIcon from './icons/CheckIcon';

interface ConfirmationToastProps {
  show: boolean;
  message: string;
}

const ConfirmationToast: React.FC<ConfirmationToastProps> = ({ show, message }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
      <div
        className="flex flex-col items-center justify-center gap-4 px-8 py-6 bg-gray-900/80 dark:bg-white/80 backdrop-blur-md text-white dark:text-gray-900 rounded-2xl shadow-lg animate-fade-in-out"
        role="alert"
        aria-live="assertive"
      >
        <CheckIcon className="w-12 h-12 text-green-400 dark:text-green-500" />
        <p className="font-semibold text-lg text-center">{message}</p>
      </div>
    </div>
  );
};

export default ConfirmationToast;
