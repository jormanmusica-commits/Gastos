
import React, { useState, useEffect, useMemo } from 'react';
import { Liability, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import AmountInput from './AmountInput';
import CustomDatePicker from './CustomDatePicker';
import EyeOffIcon from './icons/EyeOffIcon';

const CASH_METHOD_ID = 'efectivo';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  liability: Liability | null;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onPayDebts: (payments: { liabilityId: string, amount: number, details?: string }[], paymentMethodId: string, date: string, isReadOnly?: boolean) => void;
  currency: string;
}

const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen, onClose, liability, bankAccounts, balancesByMethod, onPayDebts, currency
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [details, setDetails] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
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
    if (isOpen && liability) {
      setPaymentAmount(liability.amount.toString());
      setError('');
      setDate(new Date().toISOString().split('T')[0]);
      setDetails('');
      setIsReadOnly(false);
      // Pre-select the first available source if none is selected or the current one is invalid
      if (!paymentMethodId || !paymentSources.find(p => p.id === paymentMethodId)) {
        setPaymentMethodId(paymentSources.length > 0 ? paymentSources[0].id : '');
      }
    }
  }, [isOpen, liability, paymentMethodId, paymentSources]);

  const numericPaymentAmount = parseFloat(paymentAmount || '0');
  
  const handleSubmit = () => {
    if (!liability) return;
    setError('');

    if (numericPaymentAmount <= 0) {
        setError('Debes introducir un monto a pagar.');
        return;
    }
    if (!paymentMethodId) {
      setError('Debes seleccionar un método de pago.');
      return;
    }
    if (!date) {
        setError('Debes seleccionar una fecha.');
        return;
    }
    
    if (!isReadOnly) {
        const source = paymentSources.find(s => s.id === paymentMethodId);
        if (!source || source.balance < numericPaymentAmount) {
            setError('Fondos insuficientes en la cuenta de origen.');
            return;
        }
    }
    
    const payment = { liabilityId: liability.id, amount: numericPaymentAmount, details: details.trim() };
    onPayDebts([payment], paymentMethodId, date, isReadOnly);
  };

  if (!isOpen || !liability) return null;
  
  const selectedSourceDetails = paymentSources.find(s => s.id === paymentMethodId);
  const sourceSelectStyle: React.CSSProperties = selectedSourceDetails ? {
      borderColor: selectedSourceDetails.color,
      color: selectedSourceDetails.color,
      fontWeight: '600',
  } : {};

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="debt-payment-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="debt-payment-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Pagar Deuda</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-lg text-gray-800 dark:text-gray-100">{liability.name}</span>
                    <span className="font-mono font-semibold text-red-500">{formatCurrency(liability.amount)}</span>
                </div>
            </div>
            
            <AmountInput
              value={paymentAmount}
              onChange={setPaymentAmount}
              label="Monto a pagar:"
              themeColor="#ef4444"
              currency={currency}
              maxAmount={liability.amount}
            />

            <div>
              <label htmlFor="debt-payment-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Detalles (Opcional)
              </label>
              <textarea
                id="debt-payment-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Añade una nota sobre este abono..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isReadOnly} 
                        onChange={(e) => setIsReadOnly(e.target.checked)} 
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <EyeOffIcon className="w-4 h-4" /> Solo lectura (No afecta al saldo real)
                    </span>
                </label>
            </div>
        </div>


        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-4">
          <div>
            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isReadOnly ? "Referencia de cuenta" : "Pagar con"}
            </label>
            <select
              id="payment-method"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              disabled={numericPaymentAmount <= 0}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 transition-colors disabled:opacity-50"
              style={sourceSelectStyle}
            >
              <option value="" disabled>Seleccionar origen</option>
              {paymentSources.map(source => (
                <option key={source.id} value={source.id} disabled={!isReadOnly && source.balance < numericPaymentAmount} style={{ fontWeight: 'normal' }}>
                  {source.name} {isReadOnly ? '' : `(${formatCurrency(source.balance)})`}
                  {!isReadOnly && source.balance < numericPaymentAmount ? ' - Fondos insuficientes' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Pago
            </label>
            <CustomDatePicker
                value={date}
                onChange={setDate}
                themeColor="#ef4444"
                displayMode="modal"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={numericPaymentAmount <= 0 || !paymentMethodId || (!isReadOnly && (paymentSources.find(s => s.id === paymentMethodId)?.balance || 0) < numericPaymentAmount)}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {isReadOnly ? 'Registrar Pago Visual' : `Pagar ${formatCurrency(numericPaymentAmount)}`}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DebtPaymentModal;
