import React, { useState, useEffect, useMemo } from 'react';
import { Liability, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import CustomDatePicker from './CustomDatePicker';
import AmountInput from './AmountInput';

const CASH_METHOD_ID = 'efectivo';

interface AddValueToDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Liability | null;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onAddValue: (debtId: string, amount: number, destinationMethodId: string, date: string, isInitial: boolean, details: string) => void;
  currency: string;
}

const AddValueToDebtModal: React.FC<AddValueToDebtModalProps> = ({
  isOpen, onClose, debt, bankAccounts, balancesByMethod, onAddValue, currency
}) => {
  const [amountToAdd, setAmountToAdd] = useState('');
  const [destinationMethodId, setDestinationMethodId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInitial, setIsInitial] = useState(false);
  const [details, setDetails] = useState('');
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
  
  const paymentDestinations = useMemo(() => [
    { id: CASH_METHOD_ID, name: 'Efectivo', balance: balancesByMethod[CASH_METHOD_ID] || 0, color: '#008f39' },
    ...bankAccounts.map(b => ({ id: b.id, name: b.name, balance: balancesByMethod[b.id] || 0, color: b.color }))
  ], [bankAccounts, balancesByMethod]);

  useEffect(() => {
    if (isOpen && debt) {
      setAmountToAdd('');
      setError('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsInitial(false);
      setDetails('');
      if (!destinationMethodId || !paymentDestinations.find(p => p.id === destinationMethodId)) {
        setDestinationMethodId(paymentDestinations.length > 0 ? paymentDestinations[0].id : '');
      }
    }
  }, [isOpen, debt, paymentDestinations, destinationMethodId]);
  
  const numericAmountToAdd = parseFloat(amountToAdd || '0');

  const handleSubmit = () => {
    if (!debt) return;
    setError('');

    if (numericAmountToAdd < 0) {
        setError('La cantidad no puede ser negativa.');
        return;
    }
    
    // If it's not an initial movement and an amount is being transferred, validate the destination.
    if (!isInitial && numericAmountToAdd > 0) {
        if (!destinationMethodId) {
            setError('Debes seleccionar una cuenta de destino.');
            return;
        }
    }
    
    if (!date) {
        setError('Debes seleccionar una fecha.');
        return;
    }
    onAddValue(debt.id, numericAmountToAdd, destinationMethodId, date, isInitial, details);
  };

  if (!isOpen || !debt) return null;

  const selectedDestinationDetails = paymentDestinations.find(s => s.id === destinationMethodId);
  const destinationSelectStyle: React.CSSProperties = selectedDestinationDetails ? {
      borderColor: selectedDestinationDetails.color,
      color: selectedDestinationDetails.color,
      fontWeight: '600',
  } : {};
  
  const destinationIsInvalid = !isInitial && numericAmountToAdd > 0 && !destinationMethodId;
  
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-value-debt-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="add-value-debt-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Añadir Valor a la Deuda</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Title displayed here */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-lg text-gray-800 dark:text-gray-100">{debt.name}</span>
              <span className="font-mono font-semibold text-red-500">{formatCurrency(debt.amount)}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Deuda original: {formatCurrency(debt.originalAmount)}
            </div>
          </div>

          {/* Details */}
          <div>
            <label htmlFor="debt-add-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Detalles (Opcional)
            </label>
            <textarea
              id="debt-add-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Añade una nota sobre esta ampliación..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
            />
          </div>

          {/* Amount */}
          <AmountInput
            value={amountToAdd}
            onChange={setAmountToAdd}
            label="Monto a añadir"
            themeColor="#ef4444"
            currency={currency}
          />

          {/* Date */}
          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha
            </label>
            <CustomDatePicker
              value={date}
              onChange={setDate}
              themeColor="#ef4444"
              displayMode="modal"
            />
          </div>

          {/* Other settings */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                id="is-initial-add-value-debt-checkbox"
                checked={isInitial}
                onChange={(e) => setIsInitial(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                style={{ accentColor: '#ef4444' }}
              />
              <label htmlFor="is-initial-add-value-debt-checkbox" className="cursor-pointer">
                Registrar como movimiento inicial (no afectará al saldo actual)
              </label>
            </div>
            
            {!isInitial && (
            <div className="animate-fade-in">
              <label htmlFor="destination-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Depositar en
              </label>
              <select
                id="destination-method"
                value={destinationMethodId}
                onChange={(e) => setDestinationMethodId(e.target.value)}
                disabled={numericAmountToAdd <= 0}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 transition-colors disabled:opacity-50"
                style={destinationSelectStyle}
              >
                <option value="" disabled>Seleccionar destino</option>
                {paymentDestinations.map(dest => (
                  <option key={dest.id} value={dest.id} style={{ fontWeight: 'normal' }}>
                    {dest.name} ({formatCurrency(dest.balance)})
                  </option>
                ))}
              </select>
            </div>
            )}
          </div>
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={numericAmountToAdd < 0 || destinationIsInvalid}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Añadir {formatCurrency(numericAmountToAdd)}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AddValueToDebtModal;