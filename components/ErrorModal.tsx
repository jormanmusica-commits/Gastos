import React from 'react';
import CloseIcon from './icons/CloseIcon';
import WarningIcon from './icons/WarningIcon';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  solution?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, title, message, solution }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="error-modal-title" className="text-xl font-bold text-red-500">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 pt-1">
                    <WarningIcon className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300">{message}</p>
            </div>
            
            {solution && (
                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Posibles soluciones:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {solution.split('\n').map((line, index) => <li key={index}>{line}</li>)}
                    </ul>
                </div>
            )}
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <button
                onClick={onClose}
                className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-red-600"
            >
                Entendido
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ErrorModal;
