import React, { useState, useMemo, useEffect } from 'react';
import { BankAccount, Transaction } from '../types';
import { findFirstDateWithSufficientBalance } from '../utils/transactionUtils';
import AmountInput from './AmountInput';
import CloseIcon from './icons/CloseIcon';
import CustomDatePicker from './CustomDatePicker';

const CASH_METHOD_ID = 'efectivo';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balancesByMethod: Record<string, number>;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  onAddTransfer: (fromMethodId: string, toMethodId: string, amount: number, date: string) => string | void;
  initialFromId: string | null;
  currency: string;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen, onClose, balancesByMethod, bankAccounts, transactions, onAddTransfer, initialFromId, currency
}) => {
  const [fromMethod, setFromMethod] = useState<string>('');
  const [toMethod, setToMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [minDate, setMinDate] = useState('');

  const formatCurrency = (amountValue: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amountValue % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amountValue);
  };
  
  const paymentMethods = useMemo(() => [
    { id: CASH_METHOD_ID, name: 'Efectivo', balance: balancesByMethod[CASH_METHOD_ID] || 0 },
    ...bankAccounts.map(ba => ({
      id: ba.id,
      name: ba.name,
      balance: balancesByMethod[ba.id] || 0
    }))
  ], [bankAccounts, balancesByMethod]);

  useEffect(() => {
    if (isOpen) {
        setFromMethod(initialFromId || '');
        // When opening, reset the rest of the form
        setToMethod('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setError('');
    }
  }, [isOpen, initialFromId]);

  useEffect(() => {
    if (fromMethod && fromMethod === toMethod) {
        setToMethod('');
    }
  }, [fromMethod, toMethod]);

  useEffect(() => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (fromMethod && !isNaN(numericAmount) && numericAmount > 0) {
      const firstPossibleDate = findFirstDateWithSufficientBalance(transactions, fromMethod, numericAmount);
      
      setMinDate(firstPossibleDate || '');

      if (firstPossibleDate && date < firstPossibleDate) {
        setDate(firstPossibleDate);
      }
    } else {
      setMinDate('');
    }
  }, [amount, fromMethod, transactions, date]);

  const fromOptions = useMemo(() => 
    paymentMethods.filter(pm => pm.balance > 0),
  [paymentMethods]);

  const toOptions = useMemo(() => 
    paymentMethods.filter(pm => pm.id !== fromMethod),
  [paymentMethods, fromMethod]);

  const pageConfig = { title: 'Realizar Transferencia', buttonText: 'Confirmar Transferencia' };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (!fromMethod || !toMethod || !amount.trim() || !date.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, introduce una cantidad válida.');
      return;
    }

    const sourceAccount = paymentMethods.find(pm => pm.id === fromMethod);
    if (sourceAccount && sourceAccount.balance < numericAmount) {
      setError('Fondos insuficientes en la cuenta de origen.');
      return;
    }

    const errorMsg = onAddTransfer(fromMethod, toMethod, numericAmount, date);
    if (errorMsg) {
        setError(errorMsg);
    }
  };

  const selectedFromMethodDetails = useMemo(() => {
    if (!fromMethod) return null;
    if (fromMethod === CASH_METHOD_ID) {
        return { id: CASH_METHOD_ID, name: 'Efectivo', color: '#008f39' };
    }
    return bankAccounts.find(b => b.id === fromMethod);
}, [fromMethod, bankAccounts]);

const fromSelectStyle: React.CSSProperties = selectedFromMethodDetails ? {
    borderColor: selectedFromMethodDetails.color,
    color: selectedFromMethodDetails.color,
    fontWeight: '600',
} : {};


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="transfer-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">{pageConfig.title}</h2>
            <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>
        
        <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fromMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
                        <select
                            id="fromMethod"
                            value={fromMethod}
                            onChange={(e) => setFromMethod(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-700 transition-colors"
                            style={fromSelectStyle}
                        >
                            <option value="" disabled>Seleccionar origen</option>
                            {fromOptions.map(opt => (
                                <option key={opt.id} value={opt.id} style={{ fontWeight: 'normal' }}>
                                    {opt.name} ({formatCurrency(opt.balance)})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="toMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hacia</label>
                        <select
                            id="toMethod"
                            value={toMethod}
                            onChange={(e) => setToMethod(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="" disabled>Seleccionar destino</option>
                            {toOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <AmountInput
                    value={amount}
                    onChange={setAmount}
                    label="Cantidad"
                    themeColor="#3b82f6"
                    currency={currency}
                />
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                    <CustomDatePicker
                        value={date}
                        onChange={setDate}
                        min={minDate}
                        themeColor="#3b82f6"
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center my-2">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-[#3b82f6] text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out hover:bg-[#2563eb] active:scale-95"
                >
                    {pageConfig.buttonText}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
