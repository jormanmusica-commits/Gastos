import React, { useState, useRef } from 'react';
// FIX: Import Category and FixedExpense types
import { Page, Profile, Category, FixedExpense, QuickExpense } from '../types';
import TransactionForm from '../components/TransactionForm';
import Summary from '../components/Summary';
import CategoryModal from '../components/CategoryModal';
import BankAccountModal from '../components/BankAccountModal';
import BankSelectionModal from '../components/BankSelectionModal';
import BankIcon from '../components/icons/BankIcon';
import FixedExpenseModal from '../components/FixedExpenseModal';
import BoltIcon from '../components/icons/BoltIcon';
import PayFixedExpenseModal from '../components/PayFixedExpenseModal';
import PayQuickExpenseModal from '../components/PayQuickExpenseModal';
import CategoryIcon from '../components/CategoryIcon';

const CASH_METHOD_ID = 'efectivo';

interface GastosProps {
  profile: Profile;
  balance: number;
  balancesByMethod: Record<string, number>;
  onAddTransaction: (description: string, amount: number, date: string, type: 'income' | 'expense', paymentMethodId: string, categoryId?: string) => void;
  onNavigate: (page: Page) => void;
  onAddCategory: (name: string, icon: string) => void;
  onUpdateCategory: (id: string, name: string, icon: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddBankAccount: (name: string, color: string) => void;
  onUpdateBankAccount: (id: string, name: string, color: string) => void;
  onDeleteBankAccount: (id: string) => void;
  onAddFixedExpense: (name: string, amount: number, categoryId?: string) => void;
  onDeleteFixedExpense: (id: string) => void;
  onAddQuickExpense: (name: string, amount: number, categoryId: string | undefined, icon: string) => void;
  minDateForExpenses?: string;
  onInitiateTransfer: (fromAccountId: string) => void;
  onOpenGiftModal: (expense: FixedExpense) => void;
}

const Gastos: React.FC<GastosProps> = ({ 
    profile, balance, balancesByMethod, onAddTransaction,
    onAddCategory, onUpdateCategory, onDeleteCategory,
    onAddBankAccount, onUpdateBankAccount, onDeleteBankAccount,
    onAddFixedExpense, onDeleteFixedExpense,
    onAddQuickExpense,
    minDateForExpenses,
    onInitiateTransfer,
    onOpenGiftModal
}) => {
    const { data: { categories, bankAccounts, fixedExpenses, quickExpenses, transactions }, currency } = profile;
    const [activeMethodId, setActiveMethodId] = useState<string | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isBankSelectionModalOpen, setIsBankSelectionModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
    const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
    const [fixedExpenseToPay, setFixedExpenseToPay] = useState<FixedExpense | null>(null);
    const [quickExpenseToPay, setQuickExpenseToPay] = useState<QuickExpense | null>(null);
    const formContainerRef = useRef<HTMLDivElement>(null);

    const bankBalance = Object.entries(balancesByMethod)
      .filter(([id]) => id !== CASH_METHOD_ID)
      // FIX: Cast amount to number to resolve TypeScript error where it was inferred as unknown.
      .reduce((sum, [, amount]) => sum + (amount as number), 0);
    const cashBalance = balancesByMethod[CASH_METHOD_ID] || 0;

    const isBankDisabled = bankBalance <= 0;
    const isCashDisabled = cashBalance <= 0;

    const handleSelectMethod = (id: string) => {
        setActiveMethodId(id);
        setIsFormVisible(true);
    };

    const getButtonClass = (isActive: boolean, disabled = false) => {
        const baseClasses = 'w-full flex items-center justify-center gap-2 p-3 font-semibold text-center rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
        
        if (disabled) {
          return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60`;
        }
  
        if (isActive) {
            return `${baseClasses} text-white shadow-md`;
        }
        return `${baseClasses} bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    };

    const selectedBank = bankAccounts.find(b => b.id === activeMethodId);

    const handleBankSelect = (bankId: string) => {
      setIsBankSelectionModalOpen(false);
      handleSelectMethod(bankId);
    };

    const handleFormSubmit = (description: string, amount: number, date: string, categoryId?: string, options?: { addAsFixed?: boolean; addAsQuick?: boolean; }) => {
        if (activeMethodId) {
          onAddTransaction(description, amount, date, 'expense', activeMethodId, categoryId);
          if (options?.addAsFixed) {
            onAddFixedExpense(description, amount, categoryId);
          }
           if (options?.addAsQuick) {
            const category = categories.find(c => c.id === categoryId);
            onAddQuickExpense(description, amount, categoryId, category?.icon || '⚡️');
          }
          setIsFormVisible(false);
        }
    };
    
    const handleAnimationEnd = () => {
      if (!isFormVisible) {
        setActiveMethodId(null);
        setSelectedCategoryId(undefined);
      }
    };

    const handleSelectCategory = (category: Category) => {
        setSelectedCategoryId(category.id);
        setIsCategoryModalOpen(false);
    };

    const handleSelectFixedExpense = (expense: FixedExpense) => {
        setIsFixedExpenseModalOpen(false);
        setFixedExpenseToPay(expense);
    };

     const handleConfirmFixedPayment = (expense: FixedExpense, date: string, paymentMethodId: string) => {
        onAddTransaction(
            expense.name,
            expense.amount,
            date,
            'expense',
            paymentMethodId,
            expense.categoryId
        );
        setFixedExpenseToPay(null);
    };

    const handleConfirmQuickPayment = (expense: QuickExpense, paymentMethodId: string) => {
      const today = new Date().toISOString().split('T')[0];

      if (minDateForExpenses && today < minDateForExpenses) {
          alert(`No puedes registrar un gasto en una fecha anterior a tu primer ingreso.`);
          return;
      }
  
      onAddTransaction(
          expense.name,
          expense.amount,
          today,
          'expense',
          paymentMethodId,
          expense.categoryId
      );
      setQuickExpenseToPay(null);
  };

    const handleOpenGiftModal = (expense: FixedExpense) => {
        setIsFixedExpenseModalOpen(false);
        onOpenGiftModal(expense);
    };

    const formatCurrency = (amount: number) => {
      const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    return (
      <>
        <div className="relative animate-fade-in">
          {/* The Glow Effect */}
          <div className="absolute -inset-2 bg-gradient-to-br from-[#ef4444] to-red-400 rounded-2xl blur-xl animate-glow opacity-50"></div>
          
          {/* The Content Card */}
          <div className="relative p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex justify-center items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#ef4444] dark:text-[#ef4444]">
                      Añadir Gastos
                  </h2>
              </div>

              <div className="mb-8">
                  <Summary 
                      balance={balance} 
                      balancesByMethod={balancesByMethod}
                      bankAccounts={bankAccounts}
                      onAccountClick={onInitiateTransfer}
                      currency={currency}
                  />
              </div>

              <div className="space-y-6">
                <div>
                    <div className="mb-4 space-y-3">
                        {quickExpenses.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Gastos Rápidos</h3>
                                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
                                    {quickExpenses.map(qe => (
                                        <button 
                                            key={qe.id}
                                            onClick={() => setQuickExpenseToPay(qe)}
                                            className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-2 text-center transition-transform hover:scale-105"
                                        >
                                            <CategoryIcon iconName={qe.icon} className="text-3xl" />
                                            <span className="text-xs font-semibold truncate w-full mt-1 text-gray-800 dark:text-gray-200">{qe.name}</span>
                                            <span className="text-xs font-bold text-red-500">{formatCurrency(qe.amount)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsFixedExpenseModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 py-2 px-4 rounded-lg border-2 border-dashed border-amber-400/50 dark:border-amber-600/50 hover:bg-amber-500/10 transition-colors"
                        >
                          <BoltIcon className="w-4 h-4" />
                          Añadir desde Gastos Fijos
                        </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    O selecciona un método para un nuevo gasto
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsBankSelectionModalOpen(true)}
                      className={getButtonClass(!!selectedBank, isBankDisabled)}
                      style={selectedBank ? { backgroundColor: selectedBank.color, color: 'white', borderColor: 'transparent', '--tw-ring-color': selectedBank.color } as React.CSSProperties : {}}
                      disabled={isBankDisabled}
                    >
                      <BankIcon className="w-5 h-5" />
                      {selectedBank ? selectedBank.name : 'Banco / Tarjeta'}
                    </button>
                    <button
                      onClick={() => handleSelectMethod(CASH_METHOD_ID)}
                      className={getButtonClass(activeMethodId === CASH_METHOD_ID, isCashDisabled)}
                      style={activeMethodId === CASH_METHOD_ID ? { backgroundColor: '#008f39', '--tw-ring-color': '#008f39' } as React.CSSProperties : {}}
                      disabled={isCashDisabled}
                    >
                      Efectivo
                    </button>
                  </div>
                </div>
                
                <div 
                  className={`transition-all duration-700 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                  ref={formContainerRef}
                  onTransitionEnd={handleAnimationEnd}
                >
                  {activeMethodId && (
                      <TransactionForm 
                          key={activeMethodId}
                          transactionType="expense" 
                          onAddTransaction={handleFormSubmit}
                          categories={categories}
                          selectedCategoryId={selectedCategoryId}
                          onCategorySelectClick={() => setIsCategoryModalOpen(true)}
                          minDate={minDateForExpenses}
                          currency={currency}
                      />
                  )}
                </div>
              </div>
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
        <BankAccountModal
            isOpen={isBankModalOpen}
            onClose={() => setIsBankModalOpen(false)}
            bankAccounts={bankAccounts}
            onAddBankAccount={onAddBankAccount}
            onUpdateBankAccount={onUpdateBankAccount}
            onDeleteBankAccount={onDeleteBankAccount}
        />
        <BankSelectionModal
          isOpen={isBankSelectionModalOpen}
          onClose={() => setIsBankSelectionModalOpen(false)}
          bankAccounts={bankAccounts}
          balancesByMethod={balancesByMethod}
          onSelect={handleBankSelect}
          onManageBanks={() => {
            setIsBankSelectionModalOpen(false);
            setIsBankModalOpen(true);
          }}
          mode="expense"
          currency={currency}
        />
        <FixedExpenseModal
          mode="select"
          isOpen={isFixedExpenseModalOpen}
          onClose={() => setIsFixedExpenseModalOpen(false)}
          fixedExpenses={fixedExpenses}
          transactions={transactions}
          categories={categories}
          onSelectFixedExpense={handleSelectFixedExpense}
          currency={currency}
          onOpenGiftModal={handleOpenGiftModal}
        />
        <PayFixedExpenseModal
            isOpen={!!fixedExpenseToPay}
            onClose={() => setFixedExpenseToPay(null)}
            expense={fixedExpenseToPay}
            bankAccounts={bankAccounts}
            balancesByMethod={balancesByMethod}
            onConfirm={handleConfirmFixedPayment}
            currency={currency}
            minDateForExpenses={minDateForExpenses}
        />
         <PayQuickExpenseModal
            isOpen={!!quickExpenseToPay}
            onClose={() => setQuickExpenseToPay(null)}
            expense={quickExpenseToPay}
            bankAccounts={bankAccounts}
            balancesByMethod={balancesByMethod}
            onConfirm={handleConfirmQuickPayment}
            currency={currency}
        />
      </>
    );
};

export default Gastos;