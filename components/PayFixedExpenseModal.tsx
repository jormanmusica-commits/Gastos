import React, { useState, useEffect, useMemo } from 'react';
import { FixedExpense, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import CustomDatePicker from './CustomDatePicker';

const CASH_METHOD_ID = 'efectivo';

interface PayFixedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: FixedExpense | null;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onConfirm: (expense: FixedExpense, date: string, paymentMethodId: string) => void;
  currency: string;
  minDateForExpenses?: string;
}

const PayFixedExpenseModal: React.FC<PayFixedExpenseModalProps> = ({
  isOpen, onClose, expense, bankAccounts, balancesByMethod, onConfirm, currency, minDateForExpenses
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const paymentSources = useMemo(() => [
    { id: CASH_METHOD_ID, name: 'Efectivo', balance: balancesByMethod[CASH_METHOD_ID] || 0, color: '#008f39' },
    ...bankAccounts.map(b => ({ id: b.id, name: b.name, balance: balancesByMethod[b.id] || 0, color: b.color }))
  ], [bankAccounts, balancesByMethod]);

  useEffect(() => {
    if (isOpen && expense) {
      const today = new Date().toISOString().split('T')[0];
      setDate(minDateForExpenses && today < minDateForExpenses ? minDateForExpenses : today);
      setError('');
      // Pre-select the first source with sufficient balance
      const firstValidSource = paymentSources.find(p => p.balance >= expense.amount);
      setPaymentMethodId(firstValidSource ? firstValidSource.id : (paymentSources.length > 0 ? paymentSources[0].id : ''));
    }
  }, [isOpen, expense, minDateForExpenses, paymentSources]);

  const handleSubmit = () => {
    if (!expense) return;
    setError('');

    if (!paymentMethodId) {
      setError('Debes seleccionar un método de pago.');
      return;
    }
    const source = paymentSources.find(s => s.id === paymentMethodId);
    if (!source || source.balance < expense.amount) {
      setError('Fondos insuficientes en la cuenta de origen.');
      return;
    }
    onConfirm(expense, date, paymentMethodId);
  };

  if (!isOpen || !expense) return null;

  const selectedSourceDetails = paymentSources.find(s => s.id === paymentMethodId);
  const sourceSelectStyle: React.CSSProperties = selectedSourceDetails ? {
      borderColor: selectedSourceDetails.color,
      color: selectedSourceDetails.color,
      fontWeight: '600',
  } : {};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Pagar Gasto Fijo</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><CloseIcon className="w-6 h-6" /></button>
        </header>

        <div className="p-4 space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium text-gray-800 dark:text-gray-100">{expense.name}</span>
              <span className="font-mono font-semibold text-red-500">{formatCurrency(expense.amount)}</span>
            </div>
          </div>
          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Gasto</label>
            <CustomDatePicker value={date} onChange={setDate} min={minDateForExpenses} themeColor="#ef4444" displayMode="modal"/>
          </div>
          <div>
            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pagar con</label>
            <select
              id="payment-method"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 transition-colors"
              style={sourceSelectStyle}
            >
              <option value="" disabled>Seleccionar origen</option>
              {paymentSources.map(source => (
                <option key={source.id} value={source.id} disabled={source.balance < expense.amount} style={{ color: 'initial', fontWeight: 'normal' }}>
                  {source.name} ({formatCurrency(source.balance)})
                  {source.balance < expense.amount ? ' - Fondos insuficientes' : ''}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button
            onClick={handleSubmit}
            disabled={!paymentMethodId || (paymentSources.find(s => s.id === paymentMethodId)?.balance || 0) < expense.amount}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirmar Pago
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PayFixedExpenseModal;