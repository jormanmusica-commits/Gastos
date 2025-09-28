import React from 'react';
import BackspaceIcon from './icons/BackspaceIcon';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  themeColor: string;
  label?: string;
  currency: string;
  maxAmount?: number;
}

const KeypadButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; ariaLabel: string }> = ({ onClick, children, className = '', ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`flex items-center justify-center text-2xl font-light text-gray-800 dark:text-gray-100 rounded-lg h-12 bg-gray-200/50 dark:bg-white/10 active:bg-gray-300/50 dark:active:bg-white/20 transition-colors duration-100 ${className}`}
  >
    {children}
  </button>
);

const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, themeColor, label, currency, maxAmount }) => {
  const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
  const fallbackSymbol = currency === 'EUR' ? '€' : '$';
  const currencySymbol = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0).find(p => p.type === 'currency')?.value || fallbackSymbol;
  
  const handleNumberClick = (num: string) => {
    const currentValue = value.replace('.', ',');
    let newValue;
    
    if (currentValue === '' || currentValue === '0') {
        newValue = num;
    } else {
        if (currentValue.includes(',')) {
            const parts = currentValue.split(',');
            if (parts[1] && parts[1].length >= 2) {
                newValue = currentValue;
            } else {
                newValue = currentValue + num;
            }
        } else {
            newValue = currentValue + num;
        }
    }
    
    if (maxAmount !== undefined) {
        const numericValue = parseFloat(newValue.replace(',', '.'));
        if (numericValue > maxAmount) {
            newValue = maxAmount.toString().replace('.', ',');
        }
    }
    onChange(newValue.replace(',', '.'));
  };

  const handleCommaClick = () => {
    const currentValue = value.replace('.', ',');
    if (!currentValue.includes(',')) {
      onChange((currentValue === '' ? '0,' : currentValue + ',').replace(',', '.'));
    }
  };

  const handleBackspaceClick = () => {
    const currentValue = value.replace('.', ',');
    const newValue = currentValue.slice(0, -1);
    onChange((newValue === '' ? '0' : newValue).replace(',', '.'));
  };
  
  const displayValue = value.replace('.', ',');

  return (
    <div>
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>}
        <div 
            className="w-full flex justify-between items-center px-3 py-2 border-2 border-transparent rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-[42px] ring-2 mb-2"
            style={{'--tw-ring-color': themeColor} as React.CSSProperties}
        >
            <span className="font-mono text-lg">{displayValue || '0'}</span>
            <span className="text-gray-500 dark:text-gray-400">{currencySymbol}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
            <KeypadButton onClick={() => handleNumberClick('1')} ariaLabel="1">1</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('2')} ariaLabel="2">2</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('3')} ariaLabel="3">3</KeypadButton>
            
            <KeypadButton onClick={() => handleNumberClick('4')} ariaLabel="4">4</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('5')} ariaLabel="5">5</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('6')} ariaLabel="6">6</KeypadButton>

            <KeypadButton onClick={() => handleNumberClick('7')} ariaLabel="7">7</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('8')} ariaLabel="8">8</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('9')} ariaLabel="9">9</KeypadButton>

            <KeypadButton onClick={handleCommaClick} ariaLabel="Coma">,</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('0')} ariaLabel="0">0</KeypadButton>
            <KeypadButton onClick={handleBackspaceClick} ariaLabel="Borrar"><BackspaceIcon className="w-6 h-6" /></KeypadButton>
        </div>
    </div>
  );
};

export default AmountInput;
