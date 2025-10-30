import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Profile, Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import AmountInput from './AmountInput';
import CustomDatePicker from './CustomDatePicker';
import CategoryModal from './CategoryModal';
import CategoryIcon from './CategoryIcon';

const CASH_METHOD_ID = 'efectivo';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onUpdateTransaction: (transaction: Transaction) => void;
  profile: Profile;
  categories: Category[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction, onUpdateTransaction, profile, categories }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const isTransfer = useMemo(() => !!transaction?.transferId, [transaction]);
  const isPatrimonioCreation = useMemo(() => !!transaction?.patrimonioId && ['asset', 'liability', 'loan'].includes(transaction?.patrimonioType || ''), [transaction]);

  useEffect(() => {
    if (isOpen && transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setDate(transaction.date);
      setPaymentMethodId(transaction.paymentMethodId);
      setCategoryId(transaction.categoryId);
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;
  
  const { currency, data: { bankAccounts } } = profile;

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, introduce una cantidad válida.');
      return;
    }
    if (!description.trim()) {
      alert('La descripción no puede estar vacía.');
      return;
    }
    
    const updatedTransaction: Transaction = {
        ...transaction,
        description,
        amount: numericAmount,
        date,
        paymentMethodId,
        categoryId: transaction.type === 'expense' ? categoryId : undefined,
    };
    onUpdateTransaction(updatedTransaction);
  };
  
  const handleSelectCategory = (category: Category) => {
    setCategoryId(category.id);
    setIsCategoryModalOpen(false);
  };

  const paymentMethods = [
    { id: CASH_METHOD_ID, name: 'Efectivo' },
    ...bankAccounts,
  ];
  
  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaction-modal-title"
      >
        <div
          className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="edit-transaction-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Editar Transacción</h2>
            <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <CloseIcon className="w-6 h-6" />
            </button>
          </header>

          <div className="p-4 space-y-4 overflow-y-auto">
            {isPatrimonioCreation ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300">
                    <p className="font-bold">Edición limitada</p>
                    <p className="text-sm">No puedes editar una transacción que crea un elemento de patrimonio (ahorro, deuda o préstamo). Por favor, elimina el elemento y vuelve a crearlo si es necesario.</p>
                </div>
            ) : (
                <>
                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <input
                            type="text"
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isTransfer}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-70"
                        />
                    </div>

                    <AmountInput
                        value={amount}
                        onChange={setAmount}
                        label="Monto"
                        themeColor={transaction.type === 'income' ? '#22c55e' : '#ef4444'}
                        currency={currency}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                        <CustomDatePicker
                            value={date}
                            onChange={setDate}
                            themeColor={transaction.type === 'income' ? '#22c55e' : '#ef4444'}
                            displayMode="modal"
                        />
                    </div>

                    {transaction.type !== 'income' && !isTransfer && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                        <button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
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
                            <span className="text-gray-400">Seleccionar categoría (opcional)</span>
                            )}
                        </button>
                        </div>
                    )}

                    {!isTransfer && (
                        <div>
                        <label htmlFor="edit-payment-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de Pago</label>
                        <select
                            id="edit-payment-method"
                            value={paymentMethodId}
                            onChange={(e) => setPaymentMethodId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            {paymentMethods.map(method => (
                            <option key={method.id} value={method.id}>{method.name}</option>
                            ))}
                        </select>
                        </div>
                    )}
                </>
            )}
          </div>

          {!isPatrimonioCreation && (
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-blue-600"
              >
                Guardar Cambios
              </button>
            </footer>
          )}
        </div>
      </div>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onAddCategory={() => {}} // Not needed here
        onUpdateCategory={() => {}} // Not needed here
        onDeleteCategory={() => {}} // Not needed here
      />
    </>
  );
};

export default EditTransactionModal;
