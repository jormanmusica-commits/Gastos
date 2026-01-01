
import React, { useState, useMemo } from 'react';
import { FixedExpense, Category, Transaction } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import BoltIcon from './icons/BoltIcon';
import CategoryModal from './CategoryModal';
import CheckIcon from './icons/CheckIcon';
import EyeOffIcon from './icons/EyeOffIcon';
import CategoryIcon from './CategoryIcon';
import AmountInput from './AmountInput';

interface FixedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixedExpenses: FixedExpense[];
  transactions: Transaction[];
  categories: Category[];
  onAddFixedExpense?: (name: string, amount: number, categoryId?: string) => void;
  onDeleteFixedExpense?: (id: string) => void;
  onSelectFixedExpense?: (expense: FixedExpense) => void;
  currency: string;
  onAddCategory?: (name: string, icon: string) => void;
  onUpdateCategory?: (id: string, name: string, icon: string) => void;
  onDeleteCategory?: (id: string) => void;
  onToggleVisualPayment?: (expenseId: string) => void;
  mode?: 'manage' | 'select';
}

const FixedExpenseModal: React.FC<FixedExpenseModalProps> = ({ 
    isOpen, onClose, fixedExpenses, transactions, categories, onAddFixedExpense, onDeleteFixedExpense, onSelectFixedExpense, currency,
    onAddCategory, onUpdateCategory, onDeleteCategory, onToggleVisualPayment, mode = 'manage'
}) => {
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', categoryId: '' });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Map of expense name -> status info
  const expenseStatusMap = useMemo(() => {
    if (!isOpen) return new Map<string, { isPaid: boolean, isReal: boolean }>();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthKey = `${currentYear}-${currentMonth + 1}`;

    const statusMap = new Map<string, { isPaid: boolean, isReal: boolean }>();

    // First check real transactions (real payments)
    transactions
        .filter(t => {
            const [year, month] = t.date.split('-').map(Number);
            return t.type === 'expense' &&
                   year === currentYear &&
                   (month - 1) === currentMonth &&
                   !t.isHidden; // Only care about real transactions here
        })
        .forEach(t => {
            statusMap.set(t.description, { isPaid: true, isReal: true });
        });
    
    // Then check visually marked expenses
    fixedExpenses.forEach(exp => {
        // If already marked as really paid, skip
        if (statusMap.get(exp.name)?.isReal) return;

        if (exp.paidMonths && exp.paidMonths.includes(currentMonthKey)) {
            statusMap.set(exp.name, { isPaid: true, isReal: false });
        }
    });
    
    return statusMap;
  }, [transactions, fixedExpenses, isOpen]);

  const totalFixedExpenses = useMemo(() => {
    return fixedExpenses.reduce((total, expense) => total + expense.amount, 0);
  }, [fixedExpenses]);

  const sortedFixedExpenses = useMemo(() => {
    return [...fixedExpenses].sort((a, b) => {
      const aStatus = expenseStatusMap.get(a.name);
      const bStatus = expenseStatusMap.get(b.name);
      const aIsPaid = !!aStatus?.isPaid;
      const bIsPaid = !!bStatus?.isPaid;
      
      if (aIsPaid === bIsPaid) {
        return a.name.localeCompare(b.name);
      }
      return aIsPaid ? 1 : -1; // Unpaid first
    });
  }, [fixedExpenses, expenseStatusMap]);

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const handleSelectCategory = (category: Category) => {
    setNewExpense(prev => ({ ...prev, categoryId: category.id }));
    setIsCategoryModalOpen(false);
  };
  
  if (!isOpen) return null;

  const handleAdd = () => {
    if (!onAddFixedExpense) return;
    const numericAmount = parseFloat(newExpense.amount);
    if (newExpense.name.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      onAddFixedExpense(newExpense.name.trim(), numericAmount, newExpense.categoryId || undefined);
      setNewExpense({ name: '', amount: '', categoryId: '' });
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent selection when deleting
    if (onDeleteFixedExpense && window.confirm('¿Estás seguro de que quieres eliminar este gasto fijo?')) {
      onDeleteFixedExpense(id);
    }
  };
  
  const selectedCategory = categories.find(c => c.id === newExpense.categoryId);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fixed-expense-modal-title"
      >
        <div 
          className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="fixed-expense-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Gastos Fijos</h2>
            <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <CloseIcon className="w-6 h-6" />
            </button>
          </header>

          <div className="p-4 space-y-2 overflow-y-auto">
            {fixedExpenses.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay gastos fijos guardados.</p>
            ) : (
              sortedFixedExpenses.map(exp => {
                const category = categories.find(c => c.id === exp.categoryId);
                const status = expenseStatusMap.get(exp.name);
                const isPaid = !!status?.isPaid;
                const isRealPayment = !!status?.isReal; // Paid via transaction (money spent)

                const itemContent = (
                  <>
                    <div className="flex items-center space-x-4">
                      {category ? (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            <CategoryIcon iconName={category.icon} className="text-2xl" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            <BoltIcon className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <span className={`font-semibold text-gray-800 dark:text-gray-100 transition-colors ${isPaid ? 'line-through' : ''}`}>{exp.name}</span>
                        {category && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isPaid && isRealPayment && (
                            <span title="Pagado con saldo">
                                <CheckIcon className="w-5 h-5 text-green-500" />
                            </span>
                        )}
                        <span className={`font-mono transition-colors text-gray-700 dark:text-gray-200 ${isPaid ? 'line-through' : ''}`}>{formatCurrency(exp.amount)}</span>
                    </div>
                  </>
                );

                return (
                  <div key={exp.id} className="flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                    {mode === 'select' && onSelectFixedExpense ? (
                      <button
                        onClick={() => onSelectFixedExpense(exp)}
                        disabled={isPaid}
                        className="flex-grow w-full flex items-center justify-between p-3 rounded-lg text-left disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {itemContent}
                      </button>
                    ) : (
                      <div className="flex-grow w-full flex items-center justify-between p-3 rounded-lg text-left">
                        {itemContent}
                      </div>
                    )}
                    
                    <div className="flex items-center">
                        {/* 
                           Toggle Button Logic:
                           - If NOT paid: Gray Eye (Click to toggle ON)
                           - If PAID visually (not real): Teal Eye (Click to toggle OFF)
                           - If PAID really: Hidden (cannot untoggle easily) or Disabled Check
                        */}
                        {mode === 'select' && !isRealPayment && (
                            <button
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (onToggleVisualPayment) onToggleVisualPayment(exp.id);
                                }}
                                className={`p-2 transition-colors ${
                                    isPaid 
                                    ? 'text-teal-500 bg-teal-500/10 hover:bg-teal-500/20' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                                aria-label={isPaid ? "Destachar" : "Tachar visualmente"}
                                title={isPaid ? "Destachar" : "Tachar visualmente (sin saldo)"}
                            >
                                <EyeOffIcon className="w-5 h-5" />
                            </button>
                        )}

                        {mode === 'manage' && (
                            <button 
                            onClick={(e) => handleDelete(e, exp.id)} 
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label={`Eliminar ${exp.name}`}
                            >
                            <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {mode === 'manage' && (
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <div className="flex justify-between items-center mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Total Fijo Mensual</span>
                  <span className="text-xl font-bold text-red-500">{formatCurrency(totalFixedExpenses)}</span>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                    placeholder="Nombre (ej. Alquiler)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                  <AmountInput
                    value={newExpense.amount}
                    onChange={(val) => setNewExpense(prev => ({...prev, amount: val}))}
                    themeColor="#008f39"
                    currency={currency}
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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700`}>
                                <CategoryIcon iconName={selectedCategory.icon} className="text-xl" />
                            </div>
                            <span className="dark:text-gray-100">{selectedCategory.name}</span>
                        </span>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">Seleccionar categoría (opcional)</span>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  aria-label="Añadir nuevo gasto fijo"
                  className="w-full flex items-center justify-center gap-2 bg-[#008f39] text-white font-bold py-2 px-4 rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" /> Añadir Gasto Fijo
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>
      {onAddCategory && onUpdateCategory && onDeleteCategory && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          onSelectCategory={handleSelectCategory}
          onAddCategory={onAddCategory}
          onUpdateCategory={onUpdateCategory}
          onDeleteCategory={onDeleteCategory}
        />
      )}
    </>
  );
};

export default FixedExpenseModal;
