import React, { useState, useEffect } from 'react';
import { QuickExpense, Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import CategoryModal from './CategoryModal';
import EditIcon from './icons/EditIcon';
import CheckIcon from './icons/CheckIcon';
import CategoryIcon from './CategoryIcon';
import AmountInput from './AmountInput';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickExpenses: QuickExpense[];
  categories: Category[];
  onAddQuickExpense: (name: string, amount: number, categoryId: string | undefined, icon: string) => void;
  onUpdateQuickExpense: (id: string, name: string, amount: number, categoryId: string | undefined, icon: string) => void;
  onDeleteQuickExpense: (id: string) => void;
  currency: string;
  onAddCategory: (name: string, icon: string) => void;
  onUpdateCategory: (id: string, name: string, icon: string) => void;
  onDeleteCategory: (id: string) => void;
}

const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({ 
    isOpen, onClose, quickExpenses, categories, 
    onAddQuickExpense, onUpdateQuickExpense, onDeleteQuickExpense, 
    currency, onAddCategory, onUpdateCategory, onDeleteCategory
}) => {
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', categoryId: '' });
  const [editingExpense, setEditingExpense] = useState<QuickExpense | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        setEditingExpense(null);
        setNewExpense({ name: '', amount: '', categoryId: '' });
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
  };
  
  const handleSelectCategory = (category: Category) => {
    if (editingExpense) {
      setEditingExpense(prev => prev ? { ...prev, categoryId: category.id, icon: category.icon } : null);
    } else {
      setNewExpense(prev => ({ ...prev, categoryId: category.id }));
    }
    setIsCategoryModalOpen(false);
  };

  const handleSave = () => {
    if (editingExpense) {
      // Update
      const numericAmount = parseFloat(editingExpense.amount.toString().replace(',', '.')) || 0;
      if (editingExpense.name.trim() && numericAmount > 0) {
        onUpdateQuickExpense(editingExpense.id, editingExpense.name, numericAmount, editingExpense.categoryId, editingExpense.icon);
        setEditingExpense(null);
      }
    } else {
      // Add
      const numericAmount = parseFloat(newExpense.amount.replace(',', '.')) || 0;
      if (newExpense.name.trim() && numericAmount > 0) {
        const category = categories.find(c => c.id === newExpense.categoryId);
        onAddQuickExpense(newExpense.name, numericAmount, newExpense.categoryId || undefined, category?.icon || '⚡️');
        setNewExpense({ name: '', amount: '', categoryId: '' });
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto rápido?')) {
      onDeleteQuickExpense(id);
    }
  };

  const renderForm = () => {
    const expenseData = editingExpense || { name: newExpense.name, amount: newExpense.amount, categoryId: newExpense.categoryId };
    const setExpenseData = editingExpense 
      ? (field: keyof QuickExpense, value: any) => setEditingExpense(prev => prev ? { ...prev, [field]: value } : null)
      : (field: keyof typeof newExpense, value: any) => setNewExpense(prev => ({ ...prev, [field]: value }));
      
    const selectedCategory = categories.find(c => c.id === expenseData.categoryId);

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
                type="text"
                value={expenseData.name}
                onChange={(e) => setExpenseData('name', e.target.value)}
                placeholder="Nombre (ej. BiciMAD)"
                className="sm:col-span-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
             <input
                type="text"
                value={expenseData.amount.toString()}
                onChange={(e) => setExpenseData('amount', e.target.value)}
                placeholder="Monto"
                pattern="[0-9]+([,\.][0-9]{1,2})?"
                inputMode="decimal"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
        </div>
        <div>
            <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="w-full flex items-center text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                {selectedCategory ? (
                    <span className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <CategoryIcon iconName={selectedCategory.icon} className="text-xl" />
                        </div>
                        <span className="dark:text-gray-100">{selectedCategory.name}</span>
                    </span>
                ) : (
                    <span className="text-gray-500 dark:text-gray-400">Seleccionar categoría (opcional)</span>
                )}
            </button>
        </div>
      </>
    );
  };
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gastos Rápidos</h2>
            <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><CloseIcon className="w-6 h-6" /></button>
          </header>

          <div className="p-4 space-y-2 overflow-y-auto">
            {quickExpenses.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No has guardado gastos rápidos.</p>
            ) : (
              quickExpenses.map(exp => {
                const category = categories.find(c => c.id === exp.categoryId);
                return (
                  <div key={exp.id} className="group flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            <CategoryIcon iconName={exp.icon} className="text-2xl" />
                        </div>
                        <div>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{exp.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-red-500">{formatCurrency(exp.amount)}</span>
                                {category && <p className="text-xs text-gray-500 dark:text-gray-400">{category.name}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingExpense(exp)} className="p-2 text-gray-400 hover:text-blue-500"><EditIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(exp.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{editingExpense ? 'Editando Gasto Rápido' : 'Añadir Nuevo'}</h3>
            <div className="space-y-2">
                {renderForm()}
                <div className="flex gap-2">
                    {editingExpense && <button onClick={() => setEditingExpense(null)} className="w-full font-bold py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600">Cancelar</button>}
                    <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-[#008f39] text-white font-bold py-2 px-4 rounded-md hover:bg-[#007a33]">
                        {editingExpense ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                        {editingExpense ? 'Guardar' : 'Añadir'}
                    </button>
                </div>
            </div>
          </footer>
        </div>
      </div>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onAddCategory={onAddCategory}
        onUpdateCategory={onUpdateCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </>
  );
};

export default QuickExpenseModal;
