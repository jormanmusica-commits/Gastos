
import React, { useState, useEffect } from 'react';
import { FixedExpense } from '../types';
import CloseIcon from './icons/CloseIcon';
import CustomDatePicker from './CustomDatePicker';
import EyeOffIcon from './icons/EyeOffIcon';

interface GiftFixedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: FixedExpense | null;
  onConfirm: (expenseId: string, date: string, details: string) => void;
  currency: string;
  minDateForExpenses?: string;
}

const GiftFixedExpenseModal: React.FC<GiftFixedExpenseModalProps> = ({
  isOpen, onClose, expense, onConfirm, currency, minDateForExpenses
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [details, setDetails] = useState('');

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (isOpen && expense) {
      const today = new Date().toISOString().split('T')[0];
      setDate(minDateForExpenses && today < minDateForExpenses ? minDateForExpenses : today);
      setDetails(expense.name);
    }
  }, [isOpen, expense, minDateForExpenses]);

  const handleSubmit = () => {
    if (!expense) return;
    onConfirm(expense.id, date, details.trim());
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Marcar como Pagado (Sin Saldo)</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><CloseIcon className="w-6 h-6" /></button>
        </header>

        <div className="p-4 space-y-4">
          <div className="flex flex-col items-center justify-center p-4">
             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                <EyeOffIcon className="w-10 h-10 text-gray-500 dark:text-gray-400" />
             </div>
             <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
                Esta acción marcará el gasto como completado en la lista de este mes, pero <b>no restará dinero</b> de ninguna de tus cuentas.
             </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium text-gray-800 dark:text-gray-100">{expense.name}</span>
              <span className="font-mono font-semibold text-gray-500 dark:text-gray-400 decoration-slate-500 line-through decoration-2">{formatCurrency(expense.amount)}</span>
            </div>
          </div>
           <div>
            <label htmlFor="gift-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción / Nota (Opcional)</label>
            <textarea
                id="gift-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                placeholder="Ej: Pagado por adelantado, regalo, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
        </div>
          <div>
            <label htmlFor="gift-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
            <CustomDatePicker value={date} onChange={setDate} min={minDateForExpenses} themeColor="#6b7280" displayMode="modal"/>
          </div>
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button
            onClick={handleSubmit}
            className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-gray-700"
          >
            Marcar como Pagado
          </button>
        </footer>
      </div>
    </div>
  );
};

export default GiftFixedExpenseModal;
