import React, { useMemo } from 'react';
import { Transaction, Category, BankAccount } from '../types';
import TrashIcon from './icons/TrashIcon';
import SwitchIcon from './icons/SwitchIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import GiftIcon from './icons/GiftIcon';
import CategoryIcon from './CategoryIcon';

const CASH_METHOD_ID = 'efectivo';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  bankAccounts: BankAccount[];
  onDelete: (id: string) => void;
  onItemClick: (transaction: Transaction) => void;
  currency: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, category, bankAccounts, onDelete, onItemClick, currency 
}) => {

  const isIncome = transaction.type === 'income';
  const isTransfer = !!transaction.transferId;
  const isSaving = !isIncome && !isTransfer && category?.name.toLowerCase() === 'ahorro';
  const isGift = transaction.isGift;

  const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: transaction.amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(transaction.amount);

  const formattedDate = useMemo(() => {
    const date = new Date(transaction.date + 'T00:00:00Z');
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    };
    
    const parts = new Intl.DateTimeFormat('es-ES', options).formatToParts(date);
    
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
    
    const weekday = getPart('weekday');
    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    
    return `${capitalize(weekday)} ${day} ${capitalize(month)} ${year}`;
  }, [transaction.date]);

  const amountColor = isIncome ? 'text-[#008f39] dark:text-[#008f39]' : 'text-[#ef4444] dark:text-[#ef4444]';
  const sign = isIncome ? '+' : '-';

  const paymentMethodDetails = (() => {
    if (transaction.paymentMethodId === CASH_METHOD_ID) {
      return { name: 'Efectivo', color: '#008f39' };
    }
    const bank = bankAccounts.find(b => b.id === transaction.paymentMethodId);
    if (bank) {
      return { name: bank.name, color: bank.color };
    }
    return { name: 'Cuenta eliminada', color: '#64748b' };
  })();

  const expenseIconBorderClass = isSaving ? 'border-2 border-[#14b8a6]/50' : 'border-2 border-red-500/50';
  const containerBorderClass = isSaving ? 'border-[#14b8a6]' : 'border-gray-200 dark:border-gray-700/50';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(transaction.id);
  };

  return (
    <div 
      onClick={() => onItemClick(transaction)} 
      className={`flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl border ${containerBorderClass} transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800`}
      aria-label={`Ver detalles de la transacción ${transaction.description}`}
      role="button"
    >
      <div className="flex items-center space-x-4 min-w-0 flex-grow">
        {isGift ? (
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-teal-500/10 border-2 border-teal-500/50">
            <GiftIcon className="w-5 h-5 text-teal-500" />
          </div>
        ) : isTransfer ? (
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#3b82f6]/10 border-2 border-[#3b82f6]/50">
            <SwitchIcon className="w-5 h-5 text-[#3b82f6]" />
          </div>
        ) : isIncome ? (
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#008f39]/10 border-2 border-[#008f39]/50">
                <ArrowUpIcon className="w-5 h-5 text-[#008f39]" />
            </div>
        ) : category ? (
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!isIncome ? expenseIconBorderClass : ''} bg-gray-200 dark:bg-gray-700`}>
            <CategoryIcon iconName={category.icon} className="text-2xl" />
          </div>
        ) : null}
        <div className={`min-w-0 flex-grow ${!category && !isTransfer && !isIncome && !isGift ? 'ml-14' : ''}`}>
          <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{transaction.description}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {isGift ? (
              <span className="text-teal-500 font-medium">Recibido como Regalo</span>
            ) : isTransfer ? (
              <span className="text-[#3b82f6] dark:text-[#3b82f6] font-medium">Transferencia</span>
            ) : (
              <>
                <span className="font-semibold" style={{ color: paymentMethodDetails.color }}>
                  {paymentMethodDetails.name}
                </span>
                {category && (
                  <>
                    <span>&bull;</span>
                    <span>{category.name}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-right">
            <p className={`font-bold ${isGift ? 'text-teal-500' : amountColor} text-lg whitespace-nowrap`}>{isGift ? formattedAmount : `${sign}${formattedAmount}`}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formattedDate}</p>
        </div>
        
        <button
            onClick={handleDelete}
            aria-label={`Eliminar ${transaction.type}`}
            className="p-2 rounded-full text-gray-400 hover:bg-[#ef4444]/10 dark:hover:bg-[#ef4444]/20 hover:text-[#ef4444] dark:hover:text-[#ef4444] focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
            <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;