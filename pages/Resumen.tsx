import React, { useMemo, useState, useCallback } from 'react';
import { Profile, Filters, TransactionTypeFilter, Transaction, Category } from '../types';
import Summary from '../components/Summary';
import TransactionList from '../components/IncomeList';
import MonthlySummary from '../components/MonthlySummary';
import GlobalSummary from '../components/GlobalSummary';
import MonthlyBreakdownModal from '../components/MonthlyBreakdownModal';
import FilterPanel from '../components/FilterPanel';
import FilterIcon from '../components/icons/FilterIcon';
import TransactionDetailModal from '../components/TransactionDetailModal';
import FilteredSummary from '../components/FilteredSummary';

interface ResumenProps {
  profile: Profile;
  balance: number;
  balancesByMethod: Record<string, number>;
  onDeleteTransaction: (id: string) => void;
  onInitiateTransfer: (fromAccountId: string) => void;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyIncomeByBank: number;
  monthlyIncomeByCash: number;
  monthlyExpensesByBank: number;
  monthlyExpensesByCash: number;
  totalIncome: number;
  totalExpenses: number;
  categories: Category[];
}

const CASH_METHOD_ID = 'efectivo';

const Resumen: React.FC<ResumenProps> = ({ 
  profile, balance, balancesByMethod, onDeleteTransaction,
  onInitiateTransfer,
  monthlyIncome, monthlyExpenses,
  monthlyIncomeByBank, monthlyIncomeByCash,
  monthlyExpensesByBank, monthlyExpensesByCash,
  totalIncome, totalExpenses,
  categories
}) => {
  const { data: { transactions, bankAccounts, liabilities = [], loans = [] }, currency } = profile;
  const [modalType, setModalType] = useState<'income' | 'expense' | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Omit<Filters, 'searchTerm'> | null>(null);

  const ahorroCategoryId = useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === 'ahorro')?.id;
  }, [categories]);
  
  const handleApplyAdvancedFilters = useCallback((newFilters: Omit<Filters, 'searchTerm'>) => {
    const { startDate, endDate, types, methods, bankAccounts, categories } = newFilters;
    const isFilterActive = !!startDate || !!endDate || types.length > 0 || methods.length > 0 || bankAccounts.length > 0 || categories.length > 0;
    setAdvancedFilters(isFilterActive ? newFilters : null);
  }, []);

  const formatDateForSearch = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00Z');
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date).toLowerCase();
  };

  const filteredTransactions = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
    const hasSearchTerm = lowerCaseSearchTerm.length > 0;

    let results = transactions;

    if (hasSearchTerm) {
      const numericSearchTerm = lowerCaseSearchTerm.replace(',', '.');
      results = results.filter(t => {
        
        // --- Intelligent Keyword Search ---
        const isIncome = t.type === 'income';
        const isExpense = t.type === 'expense';
        const isTransfer = !!t.transferId;
        const isGift = !!t.isGift;

        if (('ingreso'.startsWith(lowerCaseSearchTerm) || 'ingresos'.startsWith(lowerCaseSearchTerm)) && isIncome && !isTransfer) return true;
        if (('gasto'.startsWith(lowerCaseSearchTerm) || 'gastos'.startsWith(lowerCaseSearchTerm)) && isExpense && !isTransfer && !isGift) return true;
        if (('transferencia'.startsWith(lowerCaseSearchTerm) || 'transferencias'.startsWith(lowerCaseSearchTerm)) && isTransfer) return true;
        if (('regalo'.startsWith(lowerCaseSearchTerm) || 'regalos'.startsWith(lowerCaseSearchTerm)) && isGift) return true;

        const isSavingRelated = t.patrimonioType === 'asset' || t.patrimonioType === 'asset-spend' || t.categoryId === ahorroCategoryId;
        const isDebtRelated = t.patrimonioType === 'liability' || t.patrimonioType === 'debt-addition' || t.patrimonioType === 'debt-payment' || !!t.liabilityId;
        const isLoanRelated = t.patrimonioType === 'loan' || t.patrimonioType === 'loan-addition' || t.patrimonioType === 'loan-repayment' || !!t.loanId;
        const isPatrimonyRelated = isSavingRelated || isDebtRelated || isLoanRelated;

        if (('ahorro'.startsWith(lowerCaseSearchTerm) || 'ahorros'.startsWith(lowerCaseSearchTerm)) && isSavingRelated) return true;
        if (('deuda'.startsWith(lowerCaseSearchTerm) || 'deudas'.startsWith(lowerCaseSearchTerm)) && isDebtRelated) return true;
        if (('préstamo'.startsWith(lowerCaseSearchTerm) || 'prestamo'.startsWith(lowerCaseSearchTerm) || 'préstamos'.startsWith(lowerCaseSearchTerm) || 'prestamos'.startsWith(lowerCaseSearchTerm)) && isLoanRelated) return true;
        if (('patrimonio'.startsWith(lowerCaseSearchTerm)) && isPatrimonyRelated) return true;
        
        // --- Fallback to Field Search ---
        if (t.description.toLowerCase().includes(lowerCaseSearchTerm)) return true;

        const category = categories.find(c => c.id === t.categoryId);
        if (category && category.name.toLowerCase().includes(lowerCaseSearchTerm)) return true;

        const paymentMethodName = t.paymentMethodId === CASH_METHOD_ID
            ? 'efectivo'
            : bankAccounts.find(b => b.id === t.paymentMethodId)?.name.toLowerCase();
        if (paymentMethodName && paymentMethodName.includes(lowerCaseSearchTerm)) return true;

        if (formatDateForSearch(t.date).includes(lowerCaseSearchTerm)) return true;
        
        if (t.amount.toString().includes(numericSearchTerm)) return true;

        if (t.details && t.details.toLowerCase().includes(lowerCaseSearchTerm)) return true;

        const liabilityId = t.liabilityId ?? ((t.patrimonioType === 'liability' || t.patrimonioType === 'debt-addition') ? t.patrimonioId : undefined);
        if (liabilityId) {
            const relatedLiability = liabilities.find(l => l.id === liabilityId);
            if (relatedLiability) {
                if (relatedLiability.name.toLowerCase().includes(lowerCaseSearchTerm)) return true;
                if (relatedLiability.details && relatedLiability.details.toLowerCase().includes(lowerCaseSearchTerm)) return true;
            }
        }

        const loanId = t.loanId ?? ((t.patrimonioType === 'loan' || t.patrimonioType === 'loan-addition') ? t.patrimonioId : undefined);
        if (loanId) {
            const relatedLoan = loans.find(l => l.id === loanId);
            if (relatedLoan) {
                if (relatedLoan.name.toLowerCase().includes(lowerCaseSearchTerm)) return true;
                if (relatedLoan.details && relatedLoan.details.toLowerCase().includes(lowerCaseSearchTerm)) return true;
            }
        }

        return false;
      });
    }
    
    if (!advancedFilters) return results;

    const { startDate, endDate, types, methods, bankAccounts: filteredBankAccounts, categories: filteredCategories } = advancedFilters;
    
    const start = startDate ? new Date(startDate) : null;
    if (start) start.setUTCHours(0,0,0,0);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setUTCHours(23,59,59,999);

    const hasTypeFilter = types.length > 0;
    const hasMethodFilter = methods.length > 0;
    const hasBankFilter = filteredBankAccounts.length > 0;
    const hasCategoryFilter = filteredCategories.length > 0;

    return results.filter(t => {
        const transactionDate = new Date(t.date);

        if (start && transactionDate < start) return false;
        if (end && transactionDate > end) return false;

        if (hasTypeFilter) {
            let transactionTypeForFilter: TransactionTypeFilter;
            if (t.isGift) transactionTypeForFilter = 'gift';
            else if (t.transferId) transactionTypeForFilter = 'transfer';
            else if (t.type === 'expense' && t.categoryId === ahorroCategoryId) transactionTypeForFilter = 'saving';
            else if (t.type === 'expense' && t.patrimonioType === 'loan') transactionTypeForFilter = 'loan';
            else transactionTypeForFilter = t.type;
            if (!types.includes(transactionTypeForFilter)) return false;
        }
        
        if (hasMethodFilter || hasBankFilter) {
            const isCash = t.paymentMethodId === CASH_METHOD_ID;
            const methodType = isCash ? 'cash' : 'bank';
            if (hasMethodFilter && !methods.includes(methodType)) return false;
            if (!isCash && hasBankFilter && !filteredBankAccounts.includes(t.paymentMethodId)) return false;
        }
        
        if (hasCategoryFilter) {
            if (!t.categoryId || !filteredCategories.includes(t.categoryId)) return false;
        }

        return true;
    });
  }, [transactions, searchTerm, advancedFilters, categories, bankAccounts, ahorroCategoryId, liabilities, loans]);

  const { totalFilteredIncome, totalFilteredExpenses } = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
        // Exclude internal movements from filtered summary to be consistent with global summaries
        const isInternalExpense = t.transferId || t.patrimonioType === 'asset' || t.patrimonioType === 'loan' || t.patrimonioType === 'loan-addition';
        const isInternalIncome = t.transferId || t.patrimonioType === 'liability' || t.patrimonioType === 'debt-addition' || t.patrimonioType === 'asset-spend';

        if (t.type === 'income' && !isInternalIncome) {
            acc.totalFilteredIncome += t.amount;
        } else if (t.type === 'expense' && !isInternalExpense) {
            acc.totalFilteredExpenses += t.amount;
        }
        return acc;
    }, { totalFilteredIncome: 0, totalFilteredExpenses: 0 });
  }, [filteredTransactions]);

  const isFilterActive = searchTerm.trim().length > 0 || !!advancedFilters;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Resumen General
      </h1>
      <Summary 
        balance={balance} 
        balancesByMethod={balancesByMethod}
        bankAccounts={bankAccounts}
        onAccountClick={onInitiateTransfer}
        currency={currency}
      />
      
      <div className="mt-8">
        <MonthlySummary 
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          onIncomeClick={() => setModalType('income')}
          onExpenseClick={() => setModalType('expense')}
          currency={currency}
        />
      </div>

      <div className="mt-8">
        <GlobalSummary
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          currency={currency}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">Historial de Transacciones</h2>
        
        <div className="flex items-center gap-2 mb-4">
            <input
                type="text"
                placeholder="Buscar por tipo, categoría, descripción, monto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008f39]/50 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-label="Buscar en transacciones"
            />
            <button
                onClick={() => setIsAdvancedFilterOpen(prev => !prev)}
                aria-label="Filtros avanzados"
                className={`relative flex-shrink-0 p-3 rounded-full transition-colors ${isAdvancedFilterOpen ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-500' : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' } focus:outline-none focus:ring-2 focus:ring-[#008f39]`}
            >
                <FilterIcon className="w-5 h-5" />
                {advancedFilters && (
                    <span className="absolute top-1 right-1 block w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                )}
            </button>
        </div>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isAdvancedFilterOpen ? 'max-h-[1000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
          <FilterPanel
            onApply={handleApplyAdvancedFilters}
            currentFilters={advancedFilters}
            bankAccounts={bankAccounts}
            categories={categories}
          />
        </div>
        
        {isFilterActive && filteredTransactions.length > 0 && (
          <FilteredSummary
            income={totalFilteredIncome}
            expenses={totalFilteredExpenses}
            currency={currency}
          />
        )}

        <TransactionList 
          transactions={filteredTransactions} 
          categories={categories}
          bankAccounts={bankAccounts}
          onDeleteTransaction={onDeleteTransaction}
          onItemClick={setDetailTransaction}
          currency={currency}
        />
      </div>
      <MonthlyBreakdownModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType}
        incomeByBank={monthlyIncomeByBank}
        incomeByCash={monthlyIncomeByCash}
        expenseByBank={monthlyExpensesByBank}
        expenseByCash={monthlyExpensesByCash}
        currency={currency}
      />
      <TransactionDetailModal
        isOpen={!!detailTransaction}
        onClose={() => setDetailTransaction(null)}
        transaction={detailTransaction}
        categories={categories}
        bankAccounts={bankAccounts}
        currency={currency}
      />
    </div>
  );
};

export default Resumen;