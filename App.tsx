import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Theme, Transaction, Page, Category, BankAccount, FixedExpense, Profile, ProfileData, Asset, Liability, Loan, ExportSummary, ExportPayload } from './types';
import Inicio from './pages/Inicio';
import Resumen from './pages/Resumen';
import Ajustes from './pages/Ajustes';
import BottomNav from './components/BottomNav';
import Ingresos from './pages/Ingresos';
import Gastos from './pages/Gastos';
import Patrimonio from './pages/Patrimonio';
import Loans from './pages/Loans';
import Deudas from './pages/Deudas';
import Ahorros from './pages/Ahorros';
import TransferModal from './components/TransferModal';
import { validateTransactionChange, findFirstIncomeDate } from './utils/transactionUtils';
import ProfileCreationModal from './components/ProfileCreationModal';
import { exportProfileToCsv } from './utils/exportUtils';
import FixedExpenseModal from './components/FixedExpenseModal';
import AssetLiabilityModal from './components/AssetLiabilityModal';
import PlusIcon from './components/icons/PlusIcon';
import ArrowUpIcon from './components/icons/ArrowUpIcon';
import ArrowDownIcon from './components/icons/ArrowDownIcon';
import ScaleIcon from './components/icons/ScaleIcon';
import DebtPaymentModal from './components/DebtPaymentModal';
import LoanRepaymentModal from './components/LoanRepaymentModal';
import AddValueToLoanModal from './components/AddValueToLoanModal';
import EditLoanModal from './components/EditLoanModal';
import LoanDetailModal from './components/LoanDetailModal';
import EditLoanAdditionModal from './components/EditLoanAdditionModal';
import AddValueToDebtModal from './components/AddValueToDebtModal';
import EditDebtModal from './components/EditDebtModal';
import DebtDetailModal from './components/DebtDetailModal';
import EditDebtAdditionModal from './components/EditDebtAdditionModal';
import SpendSavingsModal from './components/SpendSavingsModal';
import GiftFixedExpenseModal from './components/GiftFixedExpenseModal';
import SwitchIcon from './components/icons/SwitchIcon';


const CASH_METHOD_ID = 'efectivo';

const defaultCategories: Category[] = [
  { id: '1', name: 'Comida', icon: '🍔', color: '#008f39' },
  { id: '2', name: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { id: '3', name: 'Ropa', icon: '👕', color: '#ec4899' },
  { id: '4', name: 'Hogar', icon: '🏠', color: '#f97316' },
  { id: '5', name: 'Entretenimiento', icon: '🎬', color: '#8b5cf6' },
  { id: '6', name: 'Salud', icon: '❤️‍🩹', color: '#ef4444' },
  { id: '8', name: 'Ahorro', icon: '💰', color: '#14b8a6' },
  { id: '9', name: 'Préstamos', icon: '🏦', color: '#3b82f6' },
  { id: '7', name: 'General', icon: '🧾', color: '#ef4444' },
];

const defaultBankAccounts: BankAccount[] = [
  { id: 'default-bank', name: 'BBVA', color: '#3b82f6' },
];

const createDefaultProfileData = (): ProfileData => ({
    transactions: [],
    bankAccounts: defaultBankAccounts,
    categories: defaultCategories,
    fixedExpenses: [],
    assets: [],
    liabilities: [],
    loans: [],
});


// =======================================================
// START: FloatingActionButton Component Definition
// =======================================================
export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}

interface FloatingActionButtonProps {
  menuItems: MenuItem[];
  buttonClass: string;
  ringColorClass: string;
  position: { x: number, y: number };
  onPositionChange: (position: { x: number, y: number }) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ menuItems, buttonClass, ringColorClass, position, onPositionChange }) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const dragInfo = useRef({ isDragging: false, offsetX: 0, offsetY: 0, moved: false });

  const handleClick = () => {
    // Si `moved` es true, significa que se acaba de completar un arrastre. No queremos alternar el menú.
    if (!dragInfo.current.moved) {
      setIsAddMenuOpen(prev => !prev);
    }
    // Después de cualquier clic o liberación de arrastre, reiniciamos el estado `moved` para la siguiente interacción.
    dragInfo.current.moved = false;
  };

  const handleMenuClick = (item: MenuItem) => {
    if(item.disabled) return;
    item.onClick();
    setIsAddMenuOpen(false);
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragInfo.current.isDragging) return;
    if (e.type === 'touchmove') {
      e.preventDefault(); // Evita el desplazamiento de la página mientras se arrastra
    }
    dragInfo.current.moved = true; // Se ha producido un arrastre.
    
    const event = 'touches' in e ? e.touches[0] : e;
    const fabSize = 80;
    const margin = 8;
    const bottomNavHeight = 80;

    let newX = event.clientX - dragInfo.current.offsetX;
    let newY = event.clientY - dragInfo.current.offsetY;

    // Limitar al área visible
    newX = Math.max(margin, Math.min(newX, window.innerWidth - fabSize - margin));
    newY = Math.max(margin, Math.min(newY, window.innerHeight - fabSize - margin - bottomNavHeight));

    onPositionChange({ x: newX, y: newY });
  }, [onPositionChange]);

  const handleDragEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);

    if (fabRef.current) {
      fabRef.current.classList.remove('dragging');
    }
    
    dragInfo.current.isDragging = false;
    // La lógica de ajuste a los bordes y de alternar el menú se ha eliminado de aquí.
  }, [handleDragMove]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const event = 'touches' in e ? e.touches[0] : e;
    if (fabRef.current) {
        const rect = fabRef.current.getBoundingClientRect();
        // Reiniciar `moved` al comienzo de cada interacción.
        dragInfo.current = {
            isDragging: true,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
            moved: false,
        };
        fabRef.current.classList.add('dragging');

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
    }
  }, [handleDragMove, handleDragEnd]);
  
  const isFabOnLeft = position.x < window.innerWidth / 2;
  const menuStyle: React.CSSProperties = {
    bottom: window.innerHeight - position.y + 16,
    transformOrigin: isFabOnLeft ? 'bottom left' : 'bottom right',
  };
  if (isFabOnLeft) {
    menuStyle.left = position.x;
  } else {
    menuStyle.left = position.x + 80 - 256;
  }
  
  return (
    <>
      {isAddMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsAddMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      {isAddMenuOpen && (
           <div 
              className="fixed flex flex-col items-center gap-4 w-64 animate-scale-in-up z-50"
              style={menuStyle}
           >
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item)}
                disabled={item.disabled}
                className="w-full flex items-center justify-center gap-3 text-white font-bold py-3 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-offset-gray-900 transition-all duration-300 ease-out transform disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:-translate-y-1 enabled:active:scale-95 enabled:hover:brightness-110"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      <button
        ref={fabRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleClick}
        aria-label={isAddMenuOpen ? "Cerrar menú" : "Abrir menú de acciones"}
        className={`fixed z-50 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
          isAddMenuOpen ? 'bg-gray-500 dark:bg-gray-400 dark:text-gray-800 rotate-45' : `${buttonClass} ${ringColorClass} hover:scale-105`
        }`}
        style={{
          left: 0,
          top: 0,
          transform: `translate(${position.x}px, ${position.y}px)`,
          touchAction: 'none'
        }}
      >
        <PlusIcon className="w-10 h-10" />
      </button>
      <style>{`
        .dragging { cursor: grabbing; transition: none !important; transform: translate(${position.x}px, ${position.y}px) scale(1.05) !important; }
      `}</style>
    </>
  );
};
// =======================================================
// END: FloatingActionButton Component Definition
// =======================================================


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || Theme.DARK;
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const savedProfiles = localStorage.getItem('profiles');
    if (savedProfiles) {
        const parsedProfiles: Profile[] = JSON.parse(savedProfiles);
        // Add originalAmount to liabilities and loans if it's missing for backwards compatibility
        const migratedProfiles = parsedProfiles.map((p: Profile) => ({
            ...p,
            data: {
                ...p.data,
                liabilities: (p.data.liabilities || []).map((l: Liability) => ({
                    ...l,
                    originalAmount: (l as any).originalAmount || l.amount,
                    details: l.details || '',
                    initialAdditions: (l.initialAdditions || []).map((add: any) => ({
                        ...add,
                        id: add.id || crypto.randomUUID(),
                    })),
                })),
                loans: (p.data.loans || []).map((l: Loan) => ({
                    ...l,
                    originalAmount: (l as any).originalAmount || l.amount,
                    details: l.details || '',
                    initialAdditions: (l.initialAdditions || []).map((add: any) => ({
                      ...add,
                      id: add.id || crypto.randomUUID(), // Add id if missing
                    })),
                })),
            }
        }));
        return migratedProfiles;
    }

    const legacyTransactions = localStorage.getItem('transactions');
    if (legacyTransactions) { // Migration logic for existing users
        const transactions = JSON.parse(legacyTransactions);
        const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || 'null') || defaultBankAccounts;
        const categories = JSON.parse(localStorage.getItem('categories') || 'null') || defaultCategories;
        const fixedExpenses = JSON.parse(localStorage.getItem('fixedExpenses') || 'null') || [];
        
        const migratedProfile: Profile = {
            id: crypto.randomUUID(),
            name: 'España',
            countryCode: 'ES',
            currency: 'EUR',
            data: { 
                transactions, bankAccounts, categories, fixedExpenses, 
                assets: [], liabilities: [], loans: []
            }
        };
        return [migratedProfile];
    }

    // New user
    const defaultProfileSpain: Profile = {
        id: crypto.randomUUID(),
        name: 'España',
        countryCode: 'ES',
        currency: 'EUR',
        data: createDefaultProfileData()
    };
    const defaultProfileColombia: Profile = {
        id: crypto.randomUUID(),
        name: 'Colombia',
        countryCode: 'CO',
        currency: 'COP',
        data: createDefaultProfileData()
    };
    return [defaultProfileSpain, defaultProfileColombia];
  });
  
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState<Page>('inicio');
  const [initialTransferFromId, setInitialTransferFromId] = useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isProfileCreationModalOpen, setIsProfileCreationModalOpen] = useState(false);
  const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
  const [isAssetLiabilityModalOpen, setIsAssetLiabilityModalOpen] = useState(false);
  const [isSpendSavingsModalOpen, setIsSpendSavingsModalOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Liability | null>(null);
  const [repayingLoan, setRepayingLoan] = useState<Loan | null>(null);
  const [addingValueToLoan, setAddingValueToLoan] = useState<Loan | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);
  type LoanAddition = { id: string; amount: number; date: string; details?: string };
  const [editingLoanAddition, setEditingLoanAddition] = useState<{ loan: Loan, addition: LoanAddition } | null>(null);
  const [modalConfig, setModalConfig] = useState<{ type: 'asset' | 'liability' | 'loan' } | null>(null);
  const [giftingFixedExpense, setGiftingFixedExpense] = useState<FixedExpense | null>(null);

  // New state for debt modals
  const [addingValueToDebt, setAddingValueToDebt] = useState<Liability | null>(null);
  const [editingDebt, setEditingDebt] = useState<Liability | null>(null);
  const [viewingDebt, setViewingDebt] = useState<Liability | null>(null);
  type DebtAddition = { id: string; amount: number; date: string; details?: string };
  const [editingDebtAddition, setEditingDebtAddition] = useState<{ debt: Liability, addition: DebtAddition } | null>(null);

  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);

    const getDefaultFabPosition = useCallback(() => ({
    x: window.innerWidth - 88, // 80px width + 8px margin
    y: window.innerHeight - 176, // 80px height + 80px bottom nav + 16px margin
  }), []);

  const [fabPosition, setFabPosition] = useState(() => {
    try {
      const savedPosition = localStorage.getItem('fabPosition');
      if (savedPosition) return JSON.parse(savedPosition);
    } catch (e) { console.error("Failed to parse FAB position", e); }
    return getDefaultFabPosition();
  });

  useEffect(() => {
    localStorage.setItem('fabPosition', JSON.stringify(fabPosition));
  }, [fabPosition]);

  useEffect(() => {
    const handleResize = () => {
        setFabPosition(currentPos => {
            const fabSize = 80;
            const margin = 8;
            const bottomNavHeight = 80;
            
            // Simplemente mantener dentro de los límites, sin ajustar a los bordes.
            const newX = Math.max(margin, Math.min(currentPos.x, window.innerWidth - fabSize - margin));
            const newY = Math.max(margin, Math.min(currentPos.y, window.innerHeight - fabSize - margin - bottomNavHeight));

            return { x: newX, y: newY };
        });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('profiles', JSON.stringify(profiles));
    // After first save of profiles, if we migrated, clean up old keys
    if (localStorage.getItem('transactions')) {
        localStorage.removeItem('transactions');
        localStorage.removeItem('bankAccounts');
        localStorage.removeItem('categories');
        localStorage.removeItem('fixedExpenses');
    }
  }, [profiles]);

  const updateActiveProfileData = useCallback((updater: (data: ProfileData) => ProfileData) => {
    if (!activeProfileId) return;
    setProfiles(prevProfiles => prevProfiles.map(p => 
        p.id === activeProfileId ? { ...p, data: updater(p.data) } : p
    ));
  }, [activeProfileId]);

  const handleToggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  }, []);
  
  const handleAddTransaction = useCallback((description: string, amount: number, date: string, type: 'income' | 'expense', paymentMethodId: string, categoryId?: string) => {
    if (!activeProfile) return;

    let finalCategoryId = categoryId;
    if (type === 'expense' && !categoryId) {
        const generalCategory = activeProfile.data.categories.find(c => c.name.toLowerCase() === 'general');
        if (generalCategory) {
            finalCategoryId = generalCategory.id;
        }
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount,
      date,
      type,
      paymentMethodId,
      categoryId: finalCategoryId,
    };

    if (type === 'expense') {
        const firstIncomeDate = findFirstIncomeDate(activeProfile.data.transactions);
        const expenseDate = new Date(date);
        expenseDate.setUTCHours(0, 0, 0, 0);

        if (firstIncomeDate && expenseDate < firstIncomeDate) {
            alert('Error: No puedes registrar un gasto en una fecha anterior a tu primer ingreso.');
            return;
        }
    }

    const updatedTransactions = [newTransaction, ...activeProfile.data.transactions];
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);

    if (validationError) {
        alert(validationError);
        return;
    }
    
    updateActiveProfileData(data => ({ ...data, transactions: updatedTransactions }));
  }, [activeProfile, updateActiveProfileData]);
  
  const handleAddTransfer = useCallback((fromMethodId: string, toMethodId: string, amount: number, date: string): string | void => {
    if (!activeProfile) return "No active profile found.";
    
    const transferId = crypto.randomUUID();

    const fromName = fromMethodId === CASH_METHOD_ID ? 'Efectivo' : activeProfile.data.bankAccounts.find(b => b.id === fromMethodId)?.name || 'Banco';
    const toName = toMethodId === CASH_METHOD_ID ? 'Efectivo' : activeProfile.data.bankAccounts.find(b => b.id === toMethodId)?.name || 'Banco';
    const transferDescription = `Transferencia: ${fromName} → ${toName}`;

    const expenseTransaction: Transaction = { id: crypto.randomUUID(), description: transferDescription, amount, date, type: 'expense', paymentMethodId: fromMethodId, transferId };
    const incomeTransaction: Transaction = { id: crypto.randomUUID(), description: transferDescription, amount, date, type: 'income', paymentMethodId: toMethodId, transferId };
    
    const updatedTransactions = [expenseTransaction, incomeTransaction, ...activeProfile.data.transactions];
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);

    if (validationError) {
      return validationError;
    }

    updateActiveProfileData(data => ({ ...data, transactions: updatedTransactions }));
    setIsTransferModalOpen(false);
    setInitialTransferFromId(null);
    setCurrentPage('resumen');
}, [activeProfile, updateActiveProfileData]);

  const handleDeleteTransaction = useCallback((id: string) => {
    if (!activeProfile) return;

    const transactionToDelete = activeProfile.data.transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    // Build the initial set of changes
    let transactionsToRemoveIds = [id];
    let updatedAssets = [...(activeProfile.data.assets || [])];
    let updatedLoans = [...(activeProfile.data.loans || [])];
    let updatedLiabilities = [...(activeProfile.data.liabilities || [])];

    // Determine confirmation message type
    const isTransfer = !!transactionToDelete.transferId;
    const isPatrimonioCreation = !!transactionToDelete.patrimonioId && (transactionToDelete.patrimonioType === 'asset' || transactionToDelete.patrimonioType === 'loan' || transactionToDelete.patrimonioType === 'liability');
    const isLoanAddition = transactionToDelete.patrimonioType === 'loan-addition';
    const isDebtAddition = transactionToDelete.patrimonioType === 'debt-addition';
    const isDebtPayment = !!transactionToDelete.liabilityId;
    const isLoanRepayment = !!transactionToDelete.loanId;
    
    let confirmMessage = `¿Estás seguro de que quieres eliminar esta transacción?`;
    if (isTransfer) {
        confirmMessage = `Esta es una transferencia. ¿Estás seguro de que quieres eliminar ambas partes de la transacción?`;
    } else if (isPatrimonioCreation) {
        const typeText = transactionToDelete.patrimonioType === 'asset' ? 'el ahorro' : transactionToDelete.patrimonioType === 'loan' ? 'el préstamo' : 'la deuda';
        confirmMessage = `Esta transacción está vinculada a un movimiento de patrimonio. Eliminarla también eliminará ${typeText} asociado. ¿Estás seguro?`;
    } else if (isLoanAddition || isDebtAddition) {
        const typeText = isLoanAddition ? 'préstamo' : 'deuda';
        confirmMessage = `Esta es una ampliación de un(a) ${typeText}. Eliminarlo revertirá el monto en el elemento asociado. ¿Estás seguro?`;
    } else if (isDebtPayment || isLoanRepayment) {
        confirmMessage = `Este es un pago. Eliminarlo revertirá el monto en la deuda/préstamo asociado. ¿Estás seguro?`;
    }
    
    if (!window.confirm(confirmMessage)) {
        return;
    }

    // Prepare state changes based on transaction type
    if (isTransfer) {
        const otherPartOfTransfer = activeProfile.data.transactions.find(t => t.transferId === transactionToDelete.transferId && t.id !== id);
        if (otherPartOfTransfer) transactionsToRemoveIds.push(otherPartOfTransfer.id);
    } 
    else if (isPatrimonioCreation) {
        if (transactionToDelete.patrimonioType === 'asset') updatedAssets = updatedAssets.filter(item => item.id !== transactionToDelete.patrimonioId);
        else if (transactionToDelete.patrimonioType === 'loan') updatedLoans = updatedLoans.filter(item => item.id !== transactionToDelete.patrimonioId);
        else if (transactionToDelete.patrimonioType === 'liability') updatedLiabilities = updatedLiabilities.filter(item => item.id !== transactionToDelete.patrimonioId);
    }
    else if (isLoanAddition) {
        updatedLoans = updatedLoans.map(l => l.id === transactionToDelete.patrimonioId ? { ...l, amount: l.amount - transactionToDelete.amount, originalAmount: l.originalAmount - transactionToDelete.amount } : l);
    }
    else if (isDebtAddition) {
        updatedLiabilities = updatedLiabilities.map(l => l.id === transactionToDelete.patrimonioId ? { ...l, amount: l.amount - transactionToDelete.amount, originalAmount: l.originalAmount - transactionToDelete.amount } : l);
    }
    else if (isDebtPayment) {
        updatedLiabilities = updatedLiabilities.map(l => l.id === transactionToDelete.liabilityId ? { ...l, amount: l.amount + transactionToDelete.amount } : l);
    }
    else if (isLoanRepayment) {
        updatedLoans = updatedLoans.map(l => l.id === transactionToDelete.loanId ? { ...l, amount: l.amount + transactionToDelete.amount } : l);
    }
    
    const updatedTransactions = activeProfile.data.transactions.filter(t => !transactionsToRemoveIds.includes(t.id));

    // Validate the transaction change first
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
    if (validationError) {
        alert(validationError + "\nNo se puede eliminar esta transacción.");
        return;
    }
    
    // If validation passes, commit all state changes
    updateActiveProfileData(data => ({
        ...data,
        transactions: updatedTransactions,
        assets: updatedAssets,
        loans: updatedLoans,
        liabilities: updatedLiabilities,
    }));
  }, [activeProfile, updateActiveProfileData]);

  const handleAddCategory = useCallback((name: string, icon: string, color: string) => {
    const newCategory: Category = { id: crypto.randomUUID(), name, icon, color };
    updateActiveProfileData(data => ({ ...data, categories: [...data.categories, newCategory] }));
  }, [updateActiveProfileData]);

  const handleUpdateCategory = useCallback((id: string, name: string, icon: string, color: string) => {
    updateActiveProfileData(data => ({ ...data, categories: data.categories.map(cat => cat.id === id ? { ...cat, name, icon, color } : cat) }));
  }, [updateActiveProfileData]);

  const handleDeleteCategory = useCallback((id: string) => {
    if (!activeProfile) return;
    if (activeProfile.data.transactions.some(t => t.categoryId === id)) {
      alert("No puedes eliminar una categoría que está siendo utilizada por algún gasto registrado.");
      return;
    }
    updateActiveProfileData(data => ({ ...data, categories: data.categories.filter(cat => cat.id !== id) }));
  }, [activeProfile, updateActiveProfileData]);

  const handleAddBankAccount = useCallback((name: string, color: string) => {
    const newBankAccount: BankAccount = { id: crypto.randomUUID(), name, color };
    updateActiveProfileData(data => ({ ...data, bankAccounts: [...data.bankAccounts, newBankAccount] }));
  }, [updateActiveProfileData, activeProfileId]);

  const handleUpdateBankAccount = useCallback((id: string, name: string, color: string) => {
    updateActiveProfileData(data => ({ ...data, bankAccounts: data.bankAccounts.map(acc => acc.id === id ? { ...acc, name, color } : acc) }));
  }, [updateActiveProfileData, activeProfileId]);

  const handleDeleteBankAccount = useCallback((id: string) => {
    if (!activeProfile) return;
    if (activeProfile.data.transactions.some(t => t.paymentMethodId === id)) {
      alert("No puedes eliminar un banco con transacciones asociadas. Primero, elimina o reasigna las transacciones.");
      return;
    }
    updateActiveProfileData(data => ({ ...data, bankAccounts: data.bankAccounts.filter(acc => acc.id !== id) }));
  }, [activeProfile, updateActiveProfileData]);

  const handleAddFixedExpense = useCallback((name: string, amount: number, categoryId?: string) => {
    const newFixedExpense: FixedExpense = { id: crypto.randomUUID(), name, amount, categoryId };
    updateActiveProfileData(data => ({ ...data, fixedExpenses: [...(data.fixedExpenses || []), newFixedExpense] }));
  }, [updateActiveProfileData, activeProfileId]);

  const handleDeleteFixedExpense = useCallback((id: string) => {
    updateActiveProfileData(data => ({ ...data, fixedExpenses: data.fixedExpenses.filter(expense => expense.id !== id) }));
  }, [updateActiveProfileData, activeProfileId]);

  const handleConfirmFixedExpenseAsGift = useCallback((expenseId: string, date: string, details: string) => {
    if (!activeProfile) return;

    const expense = activeProfile.data.fixedExpenses.find(e => e.id === expenseId);
    if (!expense) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description: expense.name, // Ensure description matches for paid status detection
      amount: expense.amount,
      date: date,
      type: 'expense',
      paymentMethodId: 'gift', // This will be ignored by balance calculations
      categoryId: expense.categoryId,
      isGift: true,
      details: details, // Store user-provided text in details
    };

    const updatedTransactions = [newTransaction, ...activeProfile.data.transactions];
    
    // No validation needed as gift transactions don't affect balance.
    updateActiveProfileData(data => ({ ...data, transactions: updatedTransactions }));
    setGiftingFixedExpense(null); // Close modal
  }, [activeProfile, updateActiveProfileData]);

  // FIX: Moved useMemo for balances before its use in handleCreateSaving
  const { balance, balancesByMethod } = useMemo(() => {
    // FIX: The type of `balancesByMethod` was being inferred as `Record<string, unknown>`, causing type errors. Explicitly typing the returned object fixes this.
    if (!activeProfile) {
      const balancesByMethod: Record<string, number> = {};
      return { balance: 0, balancesByMethod };
    }

    const balances: Record<string, number> = {};
    activeProfile.data.bankAccounts.forEach(acc => balances[acc.id] = 0);
    balances[CASH_METHOD_ID] = 0;
    
    // Sort transactions chronologically to calculate balances correctly
    const sortedTransactions = [...activeProfile.data.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const t of sortedTransactions) {
      if (t.isGift) continue;
      const amount = t.type === 'income' ? t.amount : -t.amount;
      balances[t.paymentMethodId] = (balances[t.paymentMethodId] || 0) + amount;
    }
    const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0);
    return { balance: totalBalance, balancesByMethod: balances };
  }, [activeProfile]);

  const handleCreateSaving = useCallback((value: number, sourceMethodId: string, date: string) => {
    if (!activeProfile) return;

    const sourceBalance = balancesByMethod[sourceMethodId] || 0;
    if (value > sourceBalance) {
        alert("Fondos insuficientes en la cuenta de origen.");
        return;
    }

    const newAsset: Asset = { id: crypto.randomUUID(), name: 'Ahorro', value, date, sourceMethodId };
    const ahorroCategory = activeProfile.data.categories.find(c => c.name.toLowerCase() === 'ahorro');
    const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        description: `Movimiento a Ahorros`,
        amount: value,
        date: date,
        type: 'expense',
        paymentMethodId: sourceMethodId,
        categoryId: ahorroCategory?.id,
        patrimonioId: newAsset.id,
        patrimonioType: 'asset',
    };
    
    const updatedTransactions = [newTransaction, ...activeProfile.data.transactions];
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);

    if (validationError) {
        alert(validationError);
        return;
    }

    updateActiveProfileData(data => ({
        ...data,
        assets: [...(data.assets || []), newAsset],
        transactions: updatedTransactions,
    }));

    setIsAssetLiabilityModalOpen(false);
  }, [activeProfile, balancesByMethod, updateActiveProfileData]);

  const handleSpendFromSavings = useCallback((amountToSpend: number, description: string, date: string, categoryId: string | undefined, sourceMethodId: string) => {
    if (!activeProfile) return;

    const assetsFromSource = (activeProfile.data.assets || []).filter(a => a.sourceMethodId === sourceMethodId);
    const totalSavingsFromSource = assetsFromSource.reduce((sum, asset) => sum + asset.value, 0);

    if (amountToSpend > totalSavingsFromSource) {
        alert("No puedes gastar más de lo que tienes ahorrado de esta fuente.");
        return;
    }

    let remainingToSpend = amountToSpend;
    const updatedAssetsFromSource: Asset[] = [];
    
    const sortedAssetsFromSource = [...assetsFromSource].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const asset of sortedAssetsFromSource) {
        if (remainingToSpend <= 0) {
            updatedAssetsFromSource.push(asset);
            continue;
        }

        if (asset.value > remainingToSpend) {
            updatedAssetsFromSource.push({ ...asset, value: asset.value - remainingToSpend });
            remainingToSpend = 0;
        } else {
            remainingToSpend -= asset.value;
        }
    }

    const otherAssets = (activeProfile.data.assets || []).filter(a => a.sourceMethodId !== sourceMethodId);
    const updatedAssets = [...otherAssets, ...updatedAssetsFromSource];

    const withdrawalTransaction: Transaction = {
        id: crypto.randomUUID(),
        description: `Retiro de Ahorros: ${description}`,
        amount: amountToSpend,
        date: date,
        type: 'income',
        paymentMethodId: CASH_METHOD_ID,
        patrimonioType: 'asset-spend',
    };

    let finalCategoryId = categoryId;
    if (!finalCategoryId) {
        const generalCategory = activeProfile.data.categories.find(c => c.name.toLowerCase() === 'general');
        if (generalCategory) {
            finalCategoryId = generalCategory.id;
        }
    }
    
    const expenseTransaction: Transaction = {
        id: crypto.randomUUID(),
        description: description,
        amount: amountToSpend,
        date: date,
        type: 'expense',
        paymentMethodId: CASH_METHOD_ID,
        categoryId: finalCategoryId,
    };
    
    const updatedTransactions = [expenseTransaction, withdrawalTransaction, ...activeProfile.data.transactions];
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);

    if (validationError) {
        alert(validationError);
        return;
    }
    
    updateActiveProfileData(data => ({
        ...data,
        assets: updatedAssets,
        transactions: updatedTransactions,
    }));

    setIsSpendSavingsModalOpen(false);
  }, [activeProfile, updateActiveProfileData]);

  const handleSaveLiability = useCallback((name: string, details: string, amount: number, destinationMethodId: string, date: string, isInitial: boolean) => {
    if (!activeProfile) return;

    const newLiability: Liability = {
        id: crypto.randomUUID(),
        name,
        details,
        amount,
        originalAmount: amount,
        date,
        destinationMethodId: isInitial ? undefined : destinationMethodId,
        initialAdditions: [],
    };

    let updatedTransactions = [...activeProfile.data.transactions];

    if (!isInitial) {
        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            description: `Deuda Adquirida: ${name}`,
            amount: amount,
            date: date,
            type: 'income',
            paymentMethodId: destinationMethodId,
            patrimonioId: newLiability.id,
            patrimonioType: 'liability',
        };
        updatedTransactions = [newTransaction, ...updatedTransactions];

        const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
        if (validationError) {
            alert(validationError);
            return;
        }
    }

    updateActiveProfileData(data => ({
        ...data,
        liabilities: [...(data.liabilities || []), newLiability],
        transactions: updatedTransactions,
    }));

    setIsAssetLiabilityModalOpen(false);
    setModalConfig(null);
  }, [activeProfile, updateActiveProfileData]);

  const handleSaveLoan = useCallback((name: string, amount: number, sourceMethodId: string, date: string, isInitial: boolean, details: string) => {
    if (!activeProfile) return;

    const newLoan: Loan = {
        id: crypto.randomUUID(),
        name,
        details,
        amount,
        originalAmount: amount,
        date,
        sourceMethodId: isInitial ? undefined : sourceMethodId,
        initialAdditions: [],
    };

    let updatedTransactions = [...activeProfile.data.transactions];
    if (!isInitial) {
        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            description: `Préstamo Concedido: ${name}`,
            amount: amount,
            date: date,
            type: 'expense',
            paymentMethodId: sourceMethodId,
            patrimonioId: newLoan.id,
            patrimonioType: 'loan',
        };
        updatedTransactions = [newTransaction, ...updatedTransactions];
        const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
        if (validationError) {
            alert(validationError);
            return;
        }
    }

    updateActiveProfileData(data => ({
        ...data,
        loans: [...(data.loans || []), newLoan],
        transactions: updatedTransactions,
    }));
    setIsAssetLiabilityModalOpen(false);
    setModalConfig(null);
  }, [activeProfile, updateActiveProfileData]);

    const handleAddProfile = useCallback((name: string, countryCode: string, currency: string) => {
    const newProfile: Profile = {
        id: crypto.randomUUID(),
        name,
        countryCode,
        currency,
        data: createDefaultProfileData(),
    };
    setProfiles(prev => {
        const newProfiles = [...prev, newProfile];
        if (prev.length === 0) {
            setActiveProfileId(newProfile.id);
        }
        return newProfiles;
    });
    setIsProfileCreationModalOpen(false);
  }, []);

  const handleDeleteProfile = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este perfil y todos sus datos? Esta acción es irreversible.')) {
        setProfiles(prev => {
            const newProfiles = prev.filter(p => p.id !== id);
            if (activeProfileId === id) {
                setActiveProfileId(newProfiles[0]?.id || null);
            }
            return newProfiles;
        });
    }
  }, [activeProfileId]);
  
  const handleExportData = useCallback(() => {
    if (!activeProfile) return;
    
    const cashBalance = balancesByMethod[CASH_METHOD_ID] || 0;
    
    // Recalculate summaries for export
    const { totalIncome, totalExpenses, monthlyIncome, monthlyExpenses } = activeProfile.data.transactions.reduce((acc, t) => {
        if (t.isGift || t.transferId || t.patrimonioId) return acc;
        const date = new Date(t.date);
        const isCurrentMonth = date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
        if (t.type === 'income') {
            acc.totalIncome += t.amount;
            if (isCurrentMonth) acc.monthlyIncome += t.amount;
        } else {
            acc.totalExpenses += t.amount;
            if (isCurrentMonth) acc.monthlyExpenses += t.amount;
        }
        return acc;
    }, { totalIncome: 0, totalExpenses: 0, monthlyIncome: 0, monthlyExpenses: 0 });

    const summary: ExportSummary = {
      balance,
      cashBalance,
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses,
    };
    
    const payload: ExportPayload = {
      profile: activeProfile,
      summary,
      balancesByMethod,
    };
    
    const csvContent = exportProfileToCsv(payload);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `export_${activeProfile.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [activeProfile, balance, balancesByMethod]);

  const handleExportAllDataToJson = useCallback(async () => {
    const dataToExport = { profiles, theme, fabPosition };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const now = new Date();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthAbbr = meses[now.getMonth()];
    const day = now.getDate();
    const fileName = `GASTOS-${monthAbbr}-${day}.json`;

    const file = new File([blob], fileName, { type: 'application/json' });

    // Use Web Share API if available (better for mobile)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Copia de Seguridad de Income Tracker',
          text: 'Aquí está tu copia de seguridad de todos los datos de la aplicación.',
        });
      } catch (error) {
        // Log error, but don't show an alert for user cancellation
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Error al compartir el archivo:', error);
            alert('No se pudo compartir el archivo. Por favor, inténtalo de nuevo.');
        }
      }
    } else {
      // Fallback for desktop or unsupported browsers
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the object URL
    }
  }, [profiles, theme, fabPosition]);

  const handleImportDataFromJson = useCallback((file: File) => {
    if (!window.confirm('¿Estás seguro de que quieres importar estos datos? Esto sobreescribirá todos los datos actuales.')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = event.target?.result;
            if (typeof result === 'string') {
                const data = JSON.parse(result);
                if (data.profiles && Array.isArray(data.profiles)) {
                    setProfiles(data.profiles);
                    setActiveProfileId(null);
                    setTheme(data.theme || Theme.DARK);
                    setFabPosition(data.fabPosition || getDefaultFabPosition());
                    alert('Datos importados con éxito.');
                } else {
                    alert('El archivo de importación no tiene el formato correcto.');
                }
            }
        } catch (error) {
            console.error('Error al importar datos:', error);
            alert('Hubo un error al procesar el archivo.');
        }
    };
    reader.readAsText(file);
  }, [getDefaultFabPosition]);

    const { monthlyIncome, monthlyExpenses, monthlyIncomeByBank, monthlyIncomeByCash, monthlyExpensesByBank, monthlyExpensesByCash, totalIncome, totalExpenses, manualAssetsValue, totalLiabilitiesValue, totalLoansValue, savingsBySource } = useMemo(() => {
    // FIX: The type of `savingsBySource` was being inferred as `Record<string, unknown>`, causando type errors. Explicitly typing the returned object fixes this.
    if (!activeProfile) {
        const savingsBySource: Record<string, { total: number, name: string, color: string }> = {};
        return { monthlyIncome: 0, monthlyExpenses: 0, monthlyIncomeByBank: 0, monthlyIncomeByCash: 0, monthlyExpensesByBank: 0, monthlyExpensesByCash: 0, totalIncome: 0, totalExpenses: 0, manualAssetsValue: 0, totalLiabilitiesValue: 0, totalLoansValue: 0, savingsBySource };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let mi = 0, me = 0, mib = 0, mic = 0, meb = 0, mec = 0, ti = 0, te = 0;
    
    const ahorroCategoryId = activeProfile.data.categories.find(c => c.name.toLowerCase() === 'ahorro')?.id;

    for (const t of activeProfile.data.transactions) {
        if (t.isGift) continue;
        const isTransfer = !!t.transferId;
        const isSaving = t.categoryId === ahorroCategoryId;
        const isPatrimonioMovement = t.patrimonioType === 'asset' || t.patrimonioType === 'liability' || t.patrimonioType === 'loan' || t.patrimonioType === 'debt-payment' || t.patrimonioType === 'loan-repayment' || t.patrimonioType === 'loan-addition' || t.patrimonioType === 'debt-addition';
        const isFromSavings = t.patrimonioType === 'asset-spend';

        const date = new Date(t.date);
        const isCurrentMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        const isBank = t.paymentMethodId !== CASH_METHOD_ID;
        
        if (t.type === 'income') {
            if (!isTransfer && !isPatrimonioMovement && !isFromSavings) {
                ti += t.amount;
                if (isCurrentMonth) {
                    mi += t.amount;
                    if (isBank) mib += t.amount; else mic += t.amount;
                }
            }
        } else { // expense
            if (!isTransfer && !isSaving && !isPatrimonioMovement) {
                te += t.amount;
                if (isCurrentMonth) {
                    me += t.amount;
                    if (isBank) meb += t.amount; else mec += t.amount;
                }
            }
        }
    }

    const mav = (activeProfile.data.assets || []).reduce((sum, asset) => sum + asset.value, 0);
    const tlv = (activeProfile.data.liabilities || []).reduce((sum, liability) => sum + liability.amount, 0);
    const tlov = (activeProfile.data.loans || []).reduce((sum, loan) => sum + loan.amount, 0);

    const sbs: Record<string, { total: number, name: string, color: string }> = {};
    const sources = [{ id: CASH_METHOD_ID, name: 'Efectivo', color: '#008f39' }, ...activeProfile.data.bankAccounts];
    (activeProfile.data.assets || []).forEach(asset => {
        const sourceId = asset.sourceMethodId || 'unknown';
        if (!sbs[sourceId]) {
            const sourceInfo = sources.find(s => s.id === sourceId);
            sbs[sourceId] = { total: 0, name: sourceInfo?.name || 'Desconocido', color: sourceInfo?.color || '#64748b' };
        }
        sbs[sourceId].total += asset.value;
    });

    return { monthlyIncome: mi, monthlyExpenses: me, monthlyIncomeByBank: mib, monthlyIncomeByCash: mic, monthlyExpensesByBank: meb, monthlyExpensesByCash: mec, totalIncome: ti, totalExpenses: te, manualAssetsValue: mav, totalLiabilitiesValue: tlv, totalLoansValue: tlov, savingsBySource: sbs };
  }, [activeProfile]);

  const minDateForExpenses = useMemo(() => {
    if (!activeProfile) return undefined;
    const firstIncomeDate = findFirstIncomeDate(activeProfile.data.transactions);
    return firstIncomeDate ? firstIncomeDate.toISOString().split('T')[0] : undefined;
  }, [activeProfile]);
  
    const handlePayDebts = useCallback((payments: { liabilityId: string, amount: number }[], paymentMethodId: string) => {
        if (!activeProfile) return;
        
        const newTransactions: Transaction[] = [];
        let updatedLiabilities = [...(activeProfile.data.liabilities || [])];

        for (const payment of payments) {
            const liability = updatedLiabilities.find(l => l.id === payment.liabilityId);
            if (!liability) continue;

            const newTransaction: Transaction = {
                id: crypto.randomUUID(),
                description: `Pago Deuda: ${liability.name}`,
                amount: payment.amount,
                date: new Date().toISOString().split('T')[0],
                type: 'expense',
                paymentMethodId: paymentMethodId,
                liabilityId: liability.id,
            };
            newTransactions.push(newTransaction);
            updatedLiabilities = updatedLiabilities.map(l => l.id === liability.id ? { ...l, amount: l.amount - payment.amount } : l);
        }

        const updatedTransactions = [...newTransactions, ...activeProfile.data.transactions];
        const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
        if (validationError) {
            alert(validationError);
            return;
        }

        updateActiveProfileData(data => ({ ...data, liabilities: updatedLiabilities, transactions: updatedTransactions }));
        setPayingDebt(null);
    }, [activeProfile, updateActiveProfileData]);

    const handleReceiveLoanPayments = useCallback((payments: { loanId: string, amount: number }[], paymentMethodId: string, date: string) => {
        if (!activeProfile) return;

        const newTransactions: Transaction[] = [];
        let updatedLoans = [...(activeProfile.data.loans || [])];

        for (const payment of payments) {
            const loan = updatedLoans.find(l => l.id === payment.loanId);
            if (!loan) continue;

            const newTransaction: Transaction = {
                id: crypto.randomUUID(),
                description: `Reembolso Préstamo: ${loan.name}`,
                amount: payment.amount,
                date: date,
                type: 'income',
                paymentMethodId: paymentMethodId,
                loanId: loan.id,
            };
            newTransactions.push(newTransaction);
            updatedLoans = updatedLoans.map(l => l.id === loan.id ? { ...l, amount: l.amount - payment.amount } : l);
        }

        const updatedTransactions = [...newTransactions, ...activeProfile.data.transactions];
        const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
        if (validationError) {
            alert(validationError);
            return;
        }

        updateActiveProfileData(data => ({ ...data, loans: updatedLoans, transactions: updatedTransactions }));
        setRepayingLoan(null);
    }, [activeProfile, updateActiveProfileData]);

    const handleAddValueToLoan = useCallback((loanId: string, amount: number, sourceMethodId: string, date: string, isInitial: boolean, details: string) => {
        if (!activeProfile) return;
        
        let updatedLoans = [...(activeProfile.data.loans || [])];
        let updatedTransactions = [...activeProfile.data.transactions];
        
        const loan = updatedLoans.find(l => l.id === loanId);
        if (!loan) return;

        if (isInitial) {
            updatedLoans = updatedLoans.map(l => l.id === loanId ? {
                ...l,
                amount: l.amount + amount,
                originalAmount: l.originalAmount + amount,
                initialAdditions: [...(l.initialAdditions || []), { id: crypto.randomUUID(), amount, date, details }]
            } : l);
        } else {
             const newTransaction: Transaction = {
                id: crypto.randomUUID(),
                description: `Ampliación Préstamo: ${loan.name}`,
                amount: amount,
                date: date,
                type: 'expense',
                paymentMethodId: sourceMethodId,
                patrimonioId: loanId,
                patrimonioType: 'loan-addition',
                details,
            };
            updatedTransactions = [newTransaction, ...updatedTransactions];
            const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
            if (validationError) {
                alert(validationError);
                return;
            }
            updatedLoans = updatedLoans.map(l => l.id === loanId ? { ...l, amount: l.amount + amount, originalAmount: l.originalAmount + amount } : l);
        }

        updateActiveProfileData(data => ({ ...data, loans: updatedLoans, transactions: updatedTransactions }));
        setAddingValueToLoan(null);
    }, [activeProfile, updateActiveProfileData]);

    const handleUpdateLoan = useCallback((loanId: string, name: string, details: string, newOriginalAmountStr: string) => {
        updateActiveProfileData(data => {
            const updatedLoans = (data.loans || []).map(loan => {
                if (loan.id === loanId) {
                    const paidAmount = loan.originalAmount - loan.amount;
                    const newOriginalAmount = parseFloat(newOriginalAmountStr.replace(',', '.')) || loan.originalAmount;
                    return {
                        ...loan,
                        name,
                        details,
                        originalAmount: newOriginalAmount,
                        amount: newOriginalAmount - paidAmount,
                    };
                }
                return loan;
            });
            return { ...data, loans: updatedLoans };
        });
        setEditingLoan(null);
    }, [updateActiveProfileData]);
    
    const handleUpdateLoanAddition = useCallback((loanId: string, additionId: string, newAmount: number, newDetails: string) => {
        updateActiveProfileData(data => {
            const updatedLoans = (data.loans || []).map(loan => {
                if (loan.id === loanId) {
                    let amountDifference = 0;
                    const updatedAdditions = (loan.initialAdditions || []).map(add => {
                        if (add.id === additionId) {
                            amountDifference = newAmount - add.amount;
                            return { ...add, amount: newAmount, details: newDetails };
                        }
                        return add;
                    });
                    return {
                        ...loan,
                        amount: loan.amount + amountDifference,
                        originalAmount: loan.originalAmount + amountDifference,
                        initialAdditions: updatedAdditions
                    };
                }
                return loan;
            });
            return { ...data, loans: updatedLoans };
        });
        setEditingLoanAddition(null);
    }, [updateActiveProfileData]);

    const handleAddValueToDebt = useCallback((debtId: string, amount: number, destinationMethodId: string, date: string, isInitial: boolean, details: string) => {
        if (!activeProfile) return;
        
        let updatedLiabilities = [...(activeProfile.data.liabilities || [])];
        let updatedTransactions = [...activeProfile.data.transactions];
        
        const debt = updatedLiabilities.find(l => l.id === debtId);
        if (!debt) return;

        if (isInitial) {
             updatedLiabilities = updatedLiabilities.map(l => l.id === debtId ? {
                ...l,
                amount: l.amount + amount,
                originalAmount: l.originalAmount + amount,
                initialAdditions: [...(l.initialAdditions || []), { id: crypto.randomUUID(), amount, date, details }]
            } : l);
        } else {
             const newTransaction: Transaction = {
                id: crypto.randomUUID(),
                description: `Ampliación Deuda: ${debt.name}`,
                amount: amount,
                date: date,
                type: 'income',
                paymentMethodId: destinationMethodId,
                patrimonioId: debtId,
                patrimonioType: 'debt-addition',
                details,
            };
            updatedTransactions = [newTransaction, ...updatedTransactions];
            const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
            if (validationError) {
                alert(validationError);
                return;
            }
            updatedLiabilities = updatedLiabilities.map(l => l.id === debtId ? { ...l, amount: l.amount + amount, originalAmount: l.originalAmount + amount } : l);
        }

        updateActiveProfileData(data => ({ ...data, liabilities: updatedLiabilities, transactions: updatedTransactions }));
        setAddingValueToDebt(null);
    }, [activeProfile, updateActiveProfileData]);
    
    const handleUpdateDebt = useCallback((debtId: string, name: string, details: string, newOriginalAmountStr: string) => {
        updateActiveProfileData(data => {
            const updatedLiabilities = (data.liabilities || []).map(debt => {
                if (debt.id === debtId) {
                    const paidAmount = debt.originalAmount - debt.amount;
                    const newOriginalAmount = parseFloat(newOriginalAmountStr.replace(',', '.')) || debt.originalAmount;
                    return {
                        ...debt,
                        name,
                        details,
                        originalAmount: newOriginalAmount,
                        amount: newOriginalAmount - paidAmount,
                    };
                }
                return debt;
            });
            return { ...data, liabilities: updatedLiabilities };
        });
        setEditingDebt(null);
    }, [updateActiveProfileData]);
    
    const handleUpdateDebtAddition = useCallback((debtId: string, additionId: string, newAmount: number, newDetails: string) => {
        updateActiveProfileData(data => {
            const updatedLiabilities = (data.liabilities || []).map(debt => {
                if (debt.id === debtId) {
                    let amountDifference = 0;
                    const updatedAdditions = (debt.initialAdditions || []).map(add => {
                        if (add.id === additionId) {
                            amountDifference = newAmount - add.amount;
                            return { ...add, amount: newAmount, details: newDetails };
                        }
                        return add;
                    });
                    return {
                        ...debt,
                        amount: debt.amount + amountDifference,
                        originalAmount: debt.originalAmount + amountDifference,
                        initialAdditions: updatedAdditions
                    };
                }
                return debt;
            });
            return { ...data, liabilities: updatedLiabilities };
        });
        setEditingDebtAddition(null);
    }, [updateActiveProfileData]);

    const handleAhorroClick = useCallback(() => { setModalConfig({ type: 'asset' }); setIsAssetLiabilityModalOpen(true); }, []);
    const handleDeudaClick = useCallback(() => { setModalConfig({ type: 'liability' }); setIsAssetLiabilityModalOpen(true); }, []);
    const handlePrestamoClick = useCallback(() => { setModalConfig({ type: 'loan' }); setIsAssetLiabilityModalOpen(true); }, []);

    const patrimonioMenuItems: MenuItem[] = useMemo(() => [
        { label: 'Ahorro', icon: <ScaleIcon className="w-6 h-6"/>, onClick: handleAhorroClick, color: '#22c55e' },
        { label: 'Deuda', icon: <ScaleIcon className="w-6 h-6"/>, onClick: handleDeudaClick, color: '#ef4444' },
        { label: 'Préstamo', icon: <ScaleIcon className="w-6 h-6"/>, onClick: handlePrestamoClick, color: '#3b82f6' }
    ], [handleAhorroClick, handleDeudaClick, handlePrestamoClick]);

    const handleGastoClick = useCallback(() => setCurrentPage('gastos'), []);
    const handleIngresoClick = useCallback(() => setCurrentPage('ingresos'), []);

    const resumenMenuItems: MenuItem[] = useMemo(() => [
        { label: 'Gasto', icon: <ArrowDownIcon className="w-6 h-6"/>, onClick: handleGastoClick, color: '#ef4444' },
        { label: 'Ingreso', icon: <ArrowUpIcon className="w-6 h-6"/>, onClick: handleIngresoClick, color: '#008f39' },
    ], [handleGastoClick, handleIngresoClick]);

    const handleInitiateTransfer = (fromAccountId: string) => {
        setInitialTransferFromId(fromAccountId);
        setIsTransferModalOpen(true);
    };


    const menuItems = useMemo((): MenuItem[] => {
      const patrimonioPages: Page[] = ['patrimonio', 'prestamos', 'deudas', 'ahorros'];
      if (currentPage === 'resumen' || currentPage === 'inicio') {
        return resumenMenuItems;
      }
      if (patrimonioPages.includes(currentPage)) {
        return patrimonioMenuItems;
      }
      return [];
    }, [currentPage, resumenMenuItems, patrimonioMenuItems]);

    const handleGoHome = useCallback(() => {
        setActiveProfileId(null);
        setCurrentPage('inicio');
    }, []);

    if (!activeProfileId || !activeProfile) {
        return (
          <div className={`app-container ${theme}`}>
            <Inicio
              profiles={profiles}
              onSelectProfile={(id) => {
                setActiveProfileId(id);
                setCurrentPage('resumen');
              }}
              onAddProfile={() => setIsProfileCreationModalOpen(true)}
              onDeleteProfile={handleDeleteProfile}
            />
            {isProfileCreationModalOpen && (
              <ProfileCreationModal
                isOpen={isProfileCreationModalOpen}
                onClose={() => setIsProfileCreationModalOpen(false)}
                onAddProfile={handleAddProfile}
              />
            )}
          </div>
        );
    }

  return (
    <div className={`app-container ${theme}`}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 pt-12 pb-24 max-w-3xl">
          { (currentPage === 'inicio' || currentPage === 'resumen') && <Resumen 
              profile={activeProfile}
              balance={balance}
              balancesByMethod={balancesByMethod}
              onDeleteTransaction={handleDeleteTransaction}
              onInitiateTransfer={handleInitiateTransfer}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              monthlyIncomeByBank={monthlyIncomeByBank}
              monthlyIncomeByCash={monthlyIncomeByCash}
              monthlyExpensesByBank={monthlyExpensesByBank}
              monthlyExpensesByCash={monthlyExpensesByCash}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
          /> }
          { currentPage === 'ajustes' && <Ajustes 
              theme={theme}
              onToggleTheme={handleToggleTheme}
              categories={activeProfile.data.categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              bankAccounts={activeProfile.data.bankAccounts}
              onAddBankAccount={handleAddBankAccount}
              onUpdateBankAccount={handleUpdateBankAccount}
              onDeleteBankAccount={handleDeleteBankAccount}
              onExportData={handleExportData}
              onExportAllDataToJson={handleExportAllDataToJson}
              onImportDataFromJson={handleImportDataFromJson}
              onManageFixedExpenses={() => setIsFixedExpenseModalOpen(true)}
          /> }
          { currentPage === 'ingresos' && <Ingresos
              profile={activeProfile}
              balance={balance}
              balancesByMethod={balancesByMethod}
              onAddTransaction={handleAddTransaction}
              onNavigate={setCurrentPage}
              onAddBankAccount={handleAddBankAccount}
              onUpdateBankAccount={handleUpdateBankAccount}
              onDeleteBankAccount={handleDeleteBankAccount}
              onInitiateTransfer={handleInitiateTransfer}
          /> }
           { currentPage === 'gastos' && <Gastos
              profile={activeProfile}
              balance={balance}
              balancesByMethod={balancesByMethod}
              onAddTransaction={handleAddTransaction}
              onNavigate={setCurrentPage}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddBankAccount={handleAddBankAccount}
              onUpdateBankAccount={handleUpdateBankAccount}
              onDeleteBankAccount={handleDeleteBankAccount}
              onAddFixedExpense={handleAddFixedExpense}
              onDeleteFixedExpense={handleDeleteFixedExpense}
              minDateForExpenses={minDateForExpenses}
              onInitiateTransfer={handleInitiateTransfer}
              onOpenGiftModal={setGiftingFixedExpense}
          /> }
           { currentPage === 'patrimonio' && <Patrimonio
                profile={activeProfile}
                manualAssetsValue={manualAssetsValue}
                totalLiabilities={totalLiabilitiesValue}
                totalLoans={totalLoansValue}
                assets={activeProfile.data.assets || []}
                liabilities={activeProfile.data.liabilities || []}
                loans={activeProfile.data.loans || []}
                bankAccounts={activeProfile.data.bankAccounts}
                onDeleteAsset={() => {}}
                onDeleteLiability={() => {}}
                onDeleteLoan={() => {}}
                onNavigate={setCurrentPage}
                onOpenSpendSavingsModal={() => setIsSpendSavingsModalOpen(true)}
           /> }
            { currentPage === 'prestamos' && <Loans
                profile={activeProfile}
                loans={activeProfile.data.loans || []}
                transactions={activeProfile.data.transactions}
                onOpenLoanRepaymentModal={setRepayingLoan}
                onOpenAddValueToLoanModal={setAddingValueToLoan}
                onOpenEditLoanModal={setEditingLoan}
                onOpenLoanDetailModal={setViewingLoan}
                onNavigate={setCurrentPage}
                currency={activeProfile.currency}
            /> }
            { currentPage === 'deudas' && <Deudas
                profile={activeProfile}
                liabilities={activeProfile.data.liabilities || []}
                onOpenDebtPaymentModal={setPayingDebt}
                onOpenAddValueToDebtModal={setAddingValueToDebt}
                onOpenEditDebtModal={setEditingDebt}
                onOpenDebtDetailModal={setViewingDebt}
                onNavigate={setCurrentPage}
                currency={activeProfile.currency}
            /> }
            { currentPage === 'ahorros' && <Ahorros
                profile={activeProfile}
                savingsBySource={savingsBySource}
                onNavigate={setCurrentPage}
                onOpenSpendSavingsModal={() => setIsSpendSavingsModalOpen(true)}
                currency={activeProfile.currency}
                manualAssetsValue={manualAssetsValue}
            /> }
        </main>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} onGoHome={handleGoHome} />
      </div>
        <TransferModal 
            isOpen={isTransferModalOpen}
            onClose={() => {
                setIsTransferModalOpen(false);
                setInitialTransferFromId(null);
            }}
            balancesByMethod={balancesByMethod}
            bankAccounts={activeProfile.data.bankAccounts}
            transactions={activeProfile.data.transactions}
            onAddTransfer={handleAddTransfer}
            initialFromId={initialTransferFromId}
            currency={activeProfile.currency}
        />
        <FixedExpenseModal
            isOpen={isFixedExpenseModalOpen}
            onClose={() => setIsFixedExpenseModalOpen(false)}
            fixedExpenses={activeProfile.data.fixedExpenses}
            transactions={activeProfile.data.transactions}
            categories={activeProfile.data.categories}
            onAddFixedExpense={handleAddFixedExpense}
            onDeleteFixedExpense={handleDeleteFixedExpense}
            currency={activeProfile.currency}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
        />
        { modalConfig && <AssetLiabilityModal 
            isOpen={isAssetLiabilityModalOpen}
            onClose={() => setIsAssetLiabilityModalOpen(false)}
            onSaveLiability={handleSaveLiability}
            onSaveLoan={handleSaveLoan}
            onCreateSaving={handleCreateSaving}
            config={modalConfig}
            currency={activeProfile.currency}
            bankAccounts={activeProfile.data.bankAccounts}
            balancesByMethod={balancesByMethod}
            minDate={minDateForExpenses}
        /> }
        <SpendSavingsModal
            isOpen={isSpendSavingsModalOpen}
            onClose={() => setIsSpendSavingsModalOpen(false)}
            onSpend={handleSpendFromSavings}
            savingsBySource={savingsBySource}
            currency={activeProfile.currency}
            categories={activeProfile.data.categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
        />
        <DebtPaymentModal
            isOpen={!!payingDebt}
            onClose={() => setPayingDebt(null)}
            liability={payingDebt}
            bankAccounts={activeProfile.data.bankAccounts}
            balancesByMethod={balancesByMethod}
            onPayDebts={handlePayDebts}
            currency={activeProfile.currency}
        />
        <LoanRepaymentModal
            isOpen={!!repayingLoan}
            onClose={() => setRepayingLoan(null)}
            loan={repayingLoan}
            bankAccounts={activeProfile.data.bankAccounts}
            balancesByMethod={balancesByMethod}
            onReceiveLoanPayments={handleReceiveLoanPayments}
            currency={activeProfile.currency}
        />
        <AddValueToLoanModal
            isOpen={!!addingValueToLoan}
            onClose={() => setAddingValueToLoan(null)}
            loan={addingValueToLoan}
            bankAccounts={activeProfile.data.bankAccounts}
            balancesByMethod={balancesByMethod}
            onAddValue={handleAddValueToLoan}
            currency={activeProfile.currency}
        />
        <EditLoanModal
            isOpen={!!editingLoan}
            onClose={() => setEditingLoan(null)}
            loan={editingLoan}
            onUpdateLoan={handleUpdateLoan}
            currency={activeProfile.currency}
        />
        <LoanDetailModal
            isOpen={!!viewingLoan}
            onClose={() => setViewingLoan(null)}
            loan={viewingLoan}
            transactions={activeProfile.data.transactions}
            bankAccounts={activeProfile.data.bankAccounts}
            currency={activeProfile.currency}
            onOpenEditLoanAdditionModal={(loan, addition) => setEditingLoanAddition({ loan, addition })}
        />
        <EditLoanAdditionModal
            isOpen={!!editingLoanAddition}
            onClose={() => setEditingLoanAddition(null)}
            data={editingLoanAddition}
            onUpdate={handleUpdateLoanAddition}
            currency={activeProfile.currency}
        />
        <AddValueToDebtModal
            isOpen={!!addingValueToDebt}
            onClose={() => setAddingValueToDebt(null)}
            debt={addingValueToDebt}
            bankAccounts={activeProfile.data.bankAccounts}
            balancesByMethod={balancesByMethod}
            onAddValue={handleAddValueToDebt}
            currency={activeProfile.currency}
        />
        <EditDebtModal
            isOpen={!!editingDebt}
            onClose={() => setEditingDebt(null)}
            debt={editingDebt}
            onUpdateDebt={handleUpdateDebt}
            currency={activeProfile.currency}
        />
        <DebtDetailModal
            isOpen={!!viewingDebt}
            onClose={() => setViewingDebt(null)}
            debt={viewingDebt}
            transactions={activeProfile.data.transactions}
            bankAccounts={activeProfile.data.bankAccounts}
            currency={activeProfile.currency}
            onOpenEditDebtAdditionModal={(debt, addition) => setEditingDebtAddition({ debt, addition })}
        />
        <EditDebtAdditionModal
            isOpen={!!editingDebtAddition}
            onClose={() => setEditingDebtAddition(null)}
            data={editingDebtAddition}
            onUpdate={handleUpdateDebtAddition}
            currency={activeProfile.currency}
        />
        <GiftFixedExpenseModal
            isOpen={!!giftingFixedExpense}
            onClose={() => setGiftingFixedExpense(null)}
            expense={giftingFixedExpense}
            onConfirm={handleConfirmFixedExpenseAsGift}
            currency={activeProfile.currency}
            minDateForExpenses={minDateForExpenses}
        />
        {menuItems.length > 0 && (
            <FloatingActionButton
                menuItems={menuItems}
                buttonClass="bg-gradient-to-br from-amber-400 to-amber-500"
                ringColorClass="focus:ring-amber-300"
                position={fabPosition}
                onPositionChange={setFabPosition}
            />
        )}
    </div>
  );
};
// FIX: Added default export to fix module resolution error.
export default App;