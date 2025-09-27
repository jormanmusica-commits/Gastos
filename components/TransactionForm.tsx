import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';
import AmountInput from './AmountInput';
import CustomDatePicker from './CustomDatePicker';
import CategoryIcon from './CategoryIcon';
import BackspaceIcon from './icons/BackspaceIcon';
import CheckIcon from './icons/CheckIcon';

interface TransactionFormProps {
  transactionType: 'income' | 'expense';
  onAddTransaction: (description: string, amount: number, date: string, categoryId?: string, options?: { addAsFixed?: boolean, addAsQuick?: boolean }) => void;
  currency: string;
  categories?: Category[];
  selectedCategoryId?: string;
  onCategorySelectClick?: () => void;
  minDate?: string;
  mode?: 'inline' | 'popover';
  isOpen?: boolean;
  onClose?: () => void;
  anchorEl?: HTMLElement | null;
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

const TransactionForm: React.FC<TransactionFormProps> = ({ 
    transactionType, onAddTransaction, categories = [], selectedCategoryId, onCategorySelectClick,
    minDate, currency, mode = 'inline', isOpen = false, onClose = () => {}, anchorEl = null
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [addAsFixed, setAddAsFixed] = useState(false);
  const [addAsQuick, setAddAsQuick] = useState(false);
  
  const getInitialDate = () => {
    const today = new Date().toISOString().split('T')[0];
    if (transactionType === 'expense' && minDate && today < minDate) {
        return minDate;
    }
    return today;
  };
  
  const [date, setDate] = useState(getInitialDate());
  const [error, setError] = useState('');
  const [currentCategoryId, setCurrentCategoryId] = useState(selectedCategoryId);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setCurrentCategoryId(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    if (transactionType === 'expense' && minDate && date < minDate) {
      setDate(minDate);
    }
  }, [minDate, date, transactionType]);

  const isIncome = transactionType === 'income';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (!description.trim() || !amount.trim() || !date.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, introduce una cantidad válida.');
      return;
    }
    
    onAddTransaction(description, numericAmount, date, currentCategoryId, { addAsFixed, addAsQuick });
  };
  
  const config = isIncome
    ? {
        themeColor: '#008f39',
        buttonClass: 'bg-[#008f39] hover:bg-[#007a33] focus:ring-[#008f39]/50',
      }
    : {
        themeColor: '#ef4444',
        buttonClass: 'bg-[#ef4444] hover:bg-[#dc2626] focus:ring-[#ef4444]/50',
      };
      
  // --- INLINE MODE ---
  if (mode === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg mt-4">
        <h3 className="text-lg font-bold text-center text-gray-800 dark:text-gray-100">{isIncome ? 'Detalles del Ingreso' : 'Detalles del Gasto'}</h3>
        <div className="space-y-4">
          <AmountInput
              value={amount.replace('.', ',')}
              onChange={(v) => setAmount(v.replace(',', '.'))}
              onSubmitted={() => descriptionInputRef.current?.focus()}
              label="Monto"
              themeColor={config.themeColor}
              autoFocus={true}
              placeholder="0,00"
              currency={currency}
          />
          {/* ... other form fields ... */}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className={`w-full text-white font-bold py-3 px-4 rounded-md ${config.buttonClass}`}>
            {isIncome ? 'Añadir Ingreso' : 'Añadir Gasto'}
        </button>
      </form>
    );
  }

  // --- POPOVER MODE ---
  useEffect(() => {
    if (isOpen && anchorEl && formRef.current) {
        const anchorRect = anchorEl.getBoundingClientRect();
        const formRect = formRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 8;

        let top = anchorRect.bottom + margin;
        let left = anchorRect.left + (anchorRect.width / 2) - (formRect.width / 2);

        if (top + formRect.height > viewportHeight - margin) {
            top = anchorRect.top - formRect.height - margin;
        }
        if (left + formRect.width > viewportWidth - margin) {
            left = viewportWidth - formRect.width - margin;
        }
        if (left < margin) {
            left = margin;
        }
        
        setPosition({ top, left });
    } else if (!isOpen) {
        setPosition(null);
    }
  }, [isOpen, anchorEl]);
  
  const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
  const fallbackSymbol = currency === 'EUR' ? '€' : '$';
  const currencySymbol = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0).find(p => p.type === 'currency')?.value || fallbackSymbol;

  const handleNumberClick = (num: string) => {
    setAmount(prev => {
      if (prev === '' || prev === '0') return num;
      if (prev.includes(',')) {
        const parts = prev.split(',');
        if (parts[1] && parts[1].length >= 2) return prev;
      }
      return prev + num;
    });
  };

  const handleCommaClick = () => {
    setAmount(prev => {
      if (prev.includes(',')) return prev;
      if (prev === '') return '0,';
      return prev + ',';
    });
  };

  const handleBackspaceClick = () => {
    setAmount(prev => prev.slice(0, -1));
  };
  
  if (!isOpen) return null;

  const selectedCategory = categories.find(c => c.id === currentCategoryId);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        ref={formRef}
        className="absolute bg-gray-100 dark:bg-gray-900 p-4 rounded-2xl shadow-2xl animate-scale-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...(position || { top: -9999, left: -9999 }),
          visibility: position ? 'visible' : 'hidden',
          width: 'calc(100vw - 16px)',
          maxWidth: '360px',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Amount Display & Keypad */}
          <div className="w-full text-right bg-white dark:bg-black/20 rounded-lg px-4 py-2 mb-3">
            <span className="text-4xl font-light text-gray-800 dark:text-gray-100 break-all">
                {amount || '0'}
            </span>
            <span className="text-2xl font-light text-gray-500 dark:text-gray-400 ml-2">{currencySymbol}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <KeypadButton onClick={() => handleNumberClick('1')} ariaLabel="1">1</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('2')} ariaLabel="2">2</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('3')} ariaLabel="3">3</KeypadButton>
            <KeypadButton onClick={handleBackspaceClick} ariaLabel="Borrar"><BackspaceIcon className="w-6 h-6" /></KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('4')} ariaLabel="4">4</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('5')} ariaLabel="5">5</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('6')} ariaLabel="6">6</KeypadButton>
            <KeypadButton onClick={handleSubmit} ariaLabel="Confirmar" className="row-span-3 text-white" style={{ backgroundColor: config.themeColor }}><CheckIcon className="w-8 h-8" /></KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('7')} ariaLabel="7">7</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('8')} ariaLabel="8">8</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('9')} ariaLabel="9">9</KeypadButton>
            <KeypadButton onClick={handleCommaClick} ariaLabel="Coma">,</KeypadButton>
            <KeypadButton onClick={() => handleNumberClick('0')} ariaLabel="0" className="col-span-2">0</KeypadButton>
          </div>
          
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
             <input
              ref={descriptionInputRef}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isIncome ? "Ej: Salario" : "Ej: Compra de comida"}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-700"
              style={{'--tw-ring-color': config.themeColor} as React.CSSProperties}
            />
            <CustomDatePicker
                value={date}
                onChange={setDate}
                min={transactionType === 'expense' ? minDate : undefined}
                themeColor={config.themeColor}
                displayMode="modal"
            />
            {!isIncome && (
              <>
                <button
                  type="button"
                  onClick={onCategorySelectClick}
                  className="w-full flex items-center text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {selectedCategory ? (
                    <span className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-red-500/50 bg-gray-200 dark:bg-gray-700`}>
                          <CategoryIcon iconName={selectedCategory.icon} className="text-xl" />
                      </div>
                      <span>{selectedCategory.name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Seleccionar categoría (opcional)</span>
                  )}
                </button>
                <div className="flex items-center space-x-4 pt-1">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="add-as-fixed-expense-popover" checked={addAsFixed} onChange={(e) => setAddAsFixed(e.target.checked)} className="h-4 w-4 rounded border-gray-300" style={{ accentColor: '#ef4444' }}/>
                        <label htmlFor="add-as-fixed-expense-popover" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Gasto Fijo</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="add-as-quick-expense-popover" checked={addAsQuick} onChange={(e) => setAddAsQuick(e.target.checked)} className="h-4 w-4 rounded border-gray-300" style={{ accentColor: '#ef4444' }}/>
                        <label htmlFor="add-as-quick-expense-popover" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Gasto Rápido</label>
                    </div>
                </div>
              </>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;