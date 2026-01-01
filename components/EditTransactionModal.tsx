import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Profile, Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import CategoryModal from './CategoryModal';
import CategoryIcon from './CategoryIcon';

const CASH_METHOD_ID = 'efectivo';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onUpdateTransaction: (transaction: Transaction) => void;
  profile: Profile | undefined;
  categories: Category[];
}

const ReadOnlyField: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {value}
        </div>
    </div>
);


const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction, onUpdateTransaction, profile, categories }) => {
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState<string | undefined>('');
  const [categoryId, setCategoryId] = useState<string | undefined>('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const isTransfer = useMemo(() => !!transaction?.transferId, [transaction]);
  const isPatrimonioCreation = useMemo(() => !!transaction?.patrimonioId && ['asset', 'liability', 'loan'].includes(transaction?.patrimonioType || ''), [transaction]);

  useEffect(() => {
    if (isOpen && transaction) {
      setDescription(transaction.description);
      setDetails(transaction.details);
      setCategoryId(transaction.categoryId);
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction || !profile || !profile.data) {
    return null;
  }
  
  const { currency, data: { bankAccounts } } = profile;

  const handleSubmit = () => {
    if (isPatrimonioCreation) {
      onClose(); // Just close, no editing.
      return;
    }

    if (!description.trim() && !isTransfer) {
      alert('La descripción no puede estar vacía.');
      return;
    }
    
    const updatedTransaction: Transaction = {
        ...transaction,
        description,
        details,
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

  const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
  const formattedAmount = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
  }).format(transaction.amount);

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'full',
      timeZone: 'UTC',
  }).format(new Date(transaction.date + 'T00:00:00Z'));
  
  const paymentMethodName = paymentMethods.find(pm => pm.id === transaction.paymentMethodId)?.name || 'Desconocido';

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
          className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="edit-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detalles (Opcional)</label>
                        <textarea
                            id="edit-details"
                            value={details || ''}
                            onChange={(e) => setDetails(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <ReadOnlyField label="Monto" value={formattedAmount} />
                    <ReadOnlyField label="Fecha" value={formattedDate} />
                    
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
                       <ReadOnlyField label="Método de Pago" value={paymentMethodName} />
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
