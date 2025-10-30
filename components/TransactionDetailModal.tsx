import React, { useMemo } from 'react';
import { Transaction, Category, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import SwitchIcon from './icons/SwitchIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ScaleIcon from './icons/ScaleIcon';
import CategoryIcon from './CategoryIcon';
import EditIcon from './icons/EditIcon';

const CASH_METHOD_ID = 'efectivo';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  categories: Category[];
  bankAccounts: BankAccount[];
  currency: string;
  onEdit?: (transaction: Transaction) => void;
}

const DetailRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700/50">
        <span className="font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-right text-gray-800 dark:text-gray-100">{children}</span>
    </div>
);

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, onClose, transaction, categories, bankAccounts, currency, onEdit }) => {
    if (!isOpen || !transaction) return null;

    const category = transaction.categoryId ? categories.find(c => c.id === transaction.categoryId) : undefined;
    const paymentMethod = transaction.paymentMethodId === CASH_METHOD_ID
        ? { name: 'Efectivo', color: '#008f39' }
        : bankAccounts.find(b => b.id === transaction.paymentMethodId) || { name: 'Cuenta Eliminada', color: '#64748b' };
    
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    const formattedAmount = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(transaction.amount);

    const formattedDate = new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'full',
        timeZone: 'UTC',
    }).format(new Date(transaction.date + 'T00:00:00Z'));

    const { title, icon, colorClass, sign } = useMemo(() => {
        const isIncome = transaction.type === 'income';
        const isTransfer = !!transaction.transferId;
        const isSaving = category?.name.toLowerCase() === 'ahorro';
        const isLoan = transaction.patrimonioType === 'loan';

        if (isTransfer) return { title: 'Detalle de Transferencia', icon: <SwitchIcon className="w-8 h-8 text-blue-500" />, colorClass: 'text-blue-500', sign: '' };
        if (isSaving && category) return { title: 'Detalle de Ahorro', icon: <CategoryIcon iconName={category.icon} className="w-8 h-8" />, colorClass: 'text-teal-500', sign: '-' };
        if (isLoan) return { title: 'Detalle de Préstamo', icon: <ScaleIcon className="w-8 h-8 text-blue-500" />, colorClass: 'text-blue-500', sign: '-' };
        if (isIncome) return { title: 'Detalle de Ingreso', icon: <ArrowUpIcon className="w-8 h-8 text-green-500" />, colorClass: 'text-green-500', sign: '+' };
        return { title: 'Detalle de Gasto', icon: category ? <CategoryIcon iconName={category.icon} className="w-8 h-8" /> : <ArrowDownIcon className="w-8 h-8 text-red-500" />, colorClass: 'text-red-500', sign: '-' };
    }, [transaction, category]);

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-detail-modal-title"
        >
            <div
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                            {icon}
                        </div>
                        <div>
                            <h2 id="transaction-detail-modal-title" className="text-xl font-bold">{title}</h2>
                            <p className={`text-2xl font-bold ${colorClass}`}>{sign}{formattedAmount}</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        {onEdit && (
                            <button onClick={() => onEdit(transaction)} aria-label="Editar transacción" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                <EditIcon className="w-6 h-6" />
                            </button>
                        )}
                        <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="p-6 space-y-2">
                    <DetailRow label="Descripción">{transaction.description}</DetailRow>
                    <DetailRow label="Fecha">{formattedDate}</DetailRow>
                    <DetailRow label="Método de Pago">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: paymentMethod.color }}></span>
                            <span>{paymentMethod.name}</span>
                        </div>
                    </DetailRow>
                    {category && !transaction.transferId && (
                         <DetailRow label="Categoría">
                            <div className="flex items-center gap-2">
                                <CategoryIcon iconName={category.icon} className="text-xl" />
                                <span>{category.name}</span>
                            </div>
                        </DetailRow>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal;