import React from 'react';
import { BankAccount } from '../types';

const CASH_METHOD_ID = 'efectivo';

interface SummaryProps {
  balance: number;
  balancesByMethod: Record<string, number>;
  bankAccounts: BankAccount[];
  onAccountClick: (accountId: string) => void;
  currency: string;
}

const Summary: React.FC<SummaryProps> = ({ balance, balancesByMethod, bankAccounts, onAccountClick, currency }) => {
  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const paymentMethods = [
    { id: CASH_METHOD_ID, name: 'Efectivo', color: '#008f39' },
    ...bankAccounts
  ];

  return (
    <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm dark:border dark:border-gray-800 p-6 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saldo Actual</h2>
        <p className={`text-4xl font-bold mt-1 ${balance >= 0 ? 'text-amber-500' : 'text-[#ef4444]'}`}>
          <span className={balance >= 0 ? "bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-500" : ""}>
             {formatCurrency(balance)}
          </span>
        </p>
      </div>
      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700/50 pt-4">
        {paymentMethods.map(method => {
            const methodBalance = balancesByMethod[method.id] || 0;
            return (
              <button
                key={method.id}
                onClick={() => onAccountClick(method.id)}
                type="button"
                className="w-full flex justify-between items-center p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ '--tw-ring-color': `${method.color}80` } as React.CSSProperties}
                aria-label={`Iniciar transferencia desde ${method.name}`}
                disabled={methodBalance <= 0}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: method.color }}></span>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{method.name}</h3>
                </div>
                <p className="text-lg font-semibold" style={{ color: method.color }}>{formatCurrency(methodBalance)}</p>
              </button>
            )
        })}
      </div>
    </div>
  );
};

export default Summary;
