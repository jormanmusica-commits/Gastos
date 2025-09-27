export interface BankAccount {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  paymentMethodId: string;
  categoryId?: string;
  transferId?: string;
  patrimonioId?: string;
  // FIX: Widened patrimonioType to include 'debt-payment' and 'loan-repayment' to resolve intersection type issues with HistoryItemType.
  patrimonioType?: 'asset' | 'loan' | 'liability' | 'debt-payment' | 'loan-repayment' | 'loan-addition' | 'debt-addition' | 'asset-spend';
  loanId?: string;
  liabilityId?: string;
  details?: string;
  isGift?: boolean;
}

export interface Category {
  id:string;
  name: string;
  icon: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  categoryId?: string;
}

export interface QuickExpense {
  id: string;
  name: string;
  amount: number;
  categoryId?: string;
  icon: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  date: string;
  sourceMethodId?: string;
}

export interface Liability {
  id: string;
  name: string;
  details?: string;
  amount: number;
  originalAmount: number;
  date: string;
  destinationMethodId?: string;
  initialAdditions?: { id: string; amount: number; date: string; details?: string; }[];
}

export interface Loan {
  id: string;
  name: string;
  details?: string;
  amount: number;
  originalAmount: number;
  date: string;
  sourceMethodId?: string;
  initialAdditions?: { id: string; amount: number; date: string; details?: string; }[];
}

export interface ProfileData {
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  fixedExpenses: FixedExpense[];
  quickExpenses: QuickExpense[];
  assets: Asset[];
  liabilities: Liability[];
  loans: Loan[];
}

export interface Profile {
  id: string;
  name: string;
  countryCode: string; // e.g., 'ES'
  currency: string; // e.g., 'EUR'
  data: ProfileData;
}


export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export type Page = 'inicio' | 'resumen' | 'ajustes' | 'ingresos' | 'gastos' | 'patrimonio' | 'prestamos' | 'deudas' | 'ahorros';

export type TransactionTypeFilter = 'income' | 'expense' | 'transfer' | 'saving' | 'loan' | 'gift';
export type PaymentMethodFilter = 'cash' | 'bank';

export interface Filters {
  searchTerm: string;
  startDate: string;
  endDate: string;
  types: TransactionTypeFilter[];
  methods: PaymentMethodFilter[];
  bankAccounts: string[];
  categories: string[];
}

export interface PatrimonioFilters {
  // FIX: Widened the `types` array to include all possible values from `HistoryItemType['patrimonioType']` to fix cascading type errors.
  types: ('asset' | 'loan' | 'liability' | 'debt-payment' | 'loan-repayment' | 'loan-addition' | 'debt-addition' | 'asset-spend')[];
  sources: string[];
}

// FIX: Added `sourceDetails` to `liability` and `debt-addition` types to match usage in `Patrimonio.tsx`.
// FIX: Added 'asset-spend' type to correctly represent spending from savings in the patrimony history.
export type HistoryItemType = (Asset & { patrimonioType: 'asset', amount: number, sourceDetails?: { name: string, color: string } }) |
                       (Liability & { patrimonioType: 'liability', amount: number, sourceDetails?: { name: string, color: string } }) |
                       (Loan & { patrimonioType: 'loan', amount: number, sourceDetails?: { name: string, color: string } }) |
                       (Transaction & { patrimonioType: 'debt-payment', name: string }) |
                       (Transaction & { patrimonioType: 'loan-repayment', name: string }) |
                       (Transaction & { patrimonioType: 'loan-addition', name: string }) |
                       (Transaction & { patrimonioType: 'debt-addition', name: string, sourceDetails?: { name: string, color: string } }) |
                       (Transaction & { patrimonioType: 'asset-spend', name: string });

// FIX: Moved ExportSummary and ExportPayload to centralize types and resolve import errors.
export interface ExportSummary {
  balance: number;
  cashBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface ExportPayload {
  profile: Profile;
  summary: ExportSummary;
  balancesByMethod: Record<string, number>;
}