import React, { useMemo } from 'react';
import { QuickExpense, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';

const CASH_METHOD_ID = 'efectivo';

interface PayQuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: QuickExpense | null;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onConfirm: (expense: QuickExpense, paymentMethodId: string) => void;
  currency: string;
}

const PayQuickExpenseModal: React.FC<PayQuickExpenseModalProps> = ({
  isOpen, onClose, expense, bankAccounts, balancesByMethod, onConfirm, currency
}) => {

  const formatCurrency = (amountValue: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amountValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amountValue);
  };

  const paymentSources = useMemo(() => [
    { id: CASH_METHOD_ID, name: 'Efectivo', balance: balancesByMethod[CASH_METHOD_ID] || 0, color: '#008f39' },
    ...bankAccounts.map(b => ({ id: b.id, name: b.name, balance: balancesByMethod[b.id] || 0, color: b.color }))
  ], [bankAccounts, balancesByMethod]);

  const handlePaymentMethodSelect = (methodId: string) => {
    if (!expense) return;
    const source = paymentSources.find(s => s.id === methodId);
    if (source && source.balance >= expense.amount) {
        onConfirm(expense, methodId);
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{expense.name}</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><CloseIcon className="w-6 h-6" /></button>
        </header>

        <div className="p-4 space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monto Fijo</p>
            <p className="text-3xl font-bold text-red-500">{formatCurrency(expense.amount)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Selecciona un método de pago:</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {paymentSources.map(source => {
                const isDisabled = source.balance < expense.amount;
                return (
                  <button
                    key={source.id}
                    onClick={() => handlePaymentMethodSelect(source.id)}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: source.color }}></span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{source.name}</span>
                    </div>
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{formatCurrency(source.balance)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayQuickExpenseModal;