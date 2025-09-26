import React, { useState, useEffect, useMemo } from 'react';
import { Filters, TransactionTypeFilter, PaymentMethodFilter, BankAccount, Category } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import CategoryIcon from './CategoryIcon';

interface FilterPanelProps {
  onApply: (filters: Omit<Filters, 'searchTerm'>) => void;
  currentFilters: Omit<Filters, 'searchTerm'> | null;
  bankAccounts: BankAccount[];
  categories: Category[];
}

const defaultFilters: Omit<Filters, 'searchTerm'> = {
  startDate: '',
  endDate: '',
  types: [],
  methods: [],
  bankAccounts: [],
  categories: [],
};

const FilterPanel: React.FC<FilterPanelProps> = ({ onApply, currentFilters, bankAccounts, categories }) => {
  const [localFilters, setLocalFilters] = useState<Omit<Filters, 'searchTerm'>>(currentFilters || defaultFilters);
  const [categorySearch, setCategorySearch] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    onApply(localFilters);
  }, [localFilters, onApply]);

  useEffect(() => {
    setLocalFilters(currentFilters || defaultFilters);
  }, [currentFilters]);

  const isCategoryFilterDisabled = useMemo(() => {
    const relevantTypes: TransactionTypeFilter[] = ['expense', 'saving', 'loan'];
    return localFilters.types.length > 0 && !localFilters.types.some(type => relevantTypes.includes(type));
  }, [localFilters.types]);
  
  useEffect(() => {
    if (isCategoryFilterDisabled) {
      setLocalFilters(prev => ({...prev, categories: []}));
    }
  }, [isCategoryFilterDisabled]);


  const handleClear = () => {
    setLocalFilters(defaultFilters);
    setOpenSections({});
  };

  const handleToggle = (key: 'types' | 'methods' | 'bankAccounts' | 'categories', value: string) => {
    setLocalFilters(prev => {
      const currentValues = prev[key] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const newFilters = { ...prev, [key]: newValues };

      if (key === 'methods' && !newValues.includes('bank')) {
        newFilters.bankAccounts = [];
      }

      return newFilters;
    });
  };

  const typeOptions: { value: TransactionTypeFilter, label: string }[] = [
    { value: 'income', label: 'Ingresos' },
    { value: 'expense', label: 'Gastos' },
    { value: 'transfer', label: 'Transferencias' },
    { value: 'saving', label: 'Ahorros' },
    { value: 'loan', label: 'Préstamos' },
    { value: 'gift', label: 'Regalos' },
  ];

  const methodOptions: { value: PaymentMethodFilter, label: string }[] = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'bank', label: 'Banco' },
  ];

  const ToggleButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${active ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 dark:bg-gray-700 border-transparent'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700/50">
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        
        <div>
          <button type="button" onClick={() => toggleSection('dates')} className="w-full flex justify-between items-center py-1 font-semibold text-gray-700 dark:text-gray-300 text-left">
            <span>Rango de Fechas</span>
            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${openSections.dates ? 'rotate-180' : ''}`} />
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openSections.dates ? 'max-h-48 opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={localFilters.startDate} onChange={e => setLocalFilters(f => ({...f, startDate: e.target.value}))} className="input-style" aria-label="Fecha de inicio"/>
              <input type="date" value={localFilters.endDate} onChange={e => setLocalFilters(f => ({...f, endDate: e.target.value}))} min={localFilters.startDate} className="input-style" aria-label="Fecha de fin"/>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700/50 pt-2">
            <button type="button" onClick={() => toggleSection('types')} className="w-full flex justify-between items-center py-1 font-semibold text-gray-700 dark:text-gray-300 text-left">
                <span>Tipo de Transacción</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${openSections.types ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openSections.types ? 'max-h-48 opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-wrap gap-2">
                    {typeOptions.map(opt => (
                    <ToggleButton key={opt.value} active={localFilters.types.includes(opt.value)} onClick={() => handleToggle('types', opt.value)}>
                        {opt.label}
                    </ToggleButton>
                    ))}
                </div>
            </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700/50 pt-2">
            <button type="button" onClick={() => toggleSection('methods')} className="w-full flex justify-between items-center py-1 font-semibold text-gray-700 dark:text-gray-300 text-left">
                <span>Método de Pago</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${openSections.methods ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openSections.methods ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-wrap gap-2">
                    {methodOptions.map(opt => (
                    <ToggleButton key={opt.value} active={localFilters.methods.includes(opt.value)} onClick={() => handleToggle('methods', opt.value)}>
                        {opt.label}
                    </ToggleButton>
                    ))}
                </div>
                {localFilters.methods.includes('bank') && (
                    <div className="mt-4 space-y-2 animate-fade-in">
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Cuentas Bancarias</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                        {bankAccounts.map(acc => (
                        <label key={acc.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                            <input
                            type="checkbox"
                            checked={localFilters.bankAccounts.includes(acc.id)}
                            onChange={() => handleToggle('bankAccounts', acc.id)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            style={{accentColor: acc.color}}
                            />
                            <span className="font-medium">{acc.name}</span>
                        </label>
                        ))}
                    </div>
                    </div>
                )}
            </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700/50 pt-2">
            <button type="button" onClick={() => toggleSection('categories')} className="w-full flex justify-between items-center py-1 font-semibold text-gray-700 dark:text-gray-300 text-left">
                <span>Categorías</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${openSections.categories ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openSections.categories ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                <div className={`transition-opacity duration-300 ${isCategoryFilterDisabled ? 'opacity-50' : ''}`}>
                    {isCategoryFilterDisabled && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Las categorías solo aplican a gastos, ahorros y préstamos.
                        </p>
                    )}
                    <div className={isCategoryFilterDisabled ? 'pointer-events-none' : ''}>
                        <input
                            type="text"
                            placeholder="Buscar categoría..."
                            value={categorySearch}
                            onChange={e => setCategorySearch(e.target.value)}
                            className="input-style w-full mb-2"
                            disabled={isCategoryFilterDisabled}
                        />
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                        {categories
                            .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                            .map(cat => (
                            <label key={cat.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localFilters.categories.includes(cat.id)}
                                onChange={() => handleToggle('categories', cat.id)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                style={{ accentColor: cat.color }}
                                disabled={isCategoryFilterDisabled}
                            />
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                                    <CategoryIcon iconName={cat.icon} className="text-xl" />
                                </div>
                                <span className="font-medium">{cat.name}</span>
                            </div>
                            </label>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <footer className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
        <button onClick={handleClear} className="w-full font-bold py-3 px-4 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          Limpiar Filtros
        </button>
      </footer>
      <style>{`
          .input-style {
              padding: 0.5rem 0.75rem;
              border: 1px solid;
              border-radius: 0.375rem;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              outline: none;
          }
          html.dark .input-style {
              background-color: #374151;
              border-color: #4b5563;
              color: #f3f4f6;
              color-scheme: dark;
          }
          html:not(.dark) .input-style {
              background-color: white;
              border-color: #d1d5db;
              color: #111827;
          }
      `}</style>
    </div>
  );
};

export default FilterPanel;