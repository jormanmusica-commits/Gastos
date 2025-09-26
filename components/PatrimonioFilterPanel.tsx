import React, { useState, useEffect, useMemo } from 'react';
import { PatrimonioFilters, BankAccount, Category } from '../types';
import CloseIcon from './icons/CloseIcon';

interface PatrimonioFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: PatrimonioFilters) => void;
  currentFilters: PatrimonioFilters | null;
  bankAccounts: BankAccount[];
}

const defaultFilters: PatrimonioFilters = {
  types: [],
  sources: [],
};

const PatrimonioFilterPanel: React.FC<PatrimonioFilterPanelProps> = ({ isOpen, onClose, onApply, currentFilters, bankAccounts }) => {
  const [localFilters, setLocalFilters] = useState<PatrimonioFilters>(currentFilters || defaultFilters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters || defaultFilters);
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters(defaultFilters);
    onApply(defaultFilters);
  };

  const handleToggle = <T extends string>(key: keyof PatrimonioFilters, value: T) => {
    setLocalFilters(prev => {
      const currentValues = (prev[key] as T[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [key]: newValues };
    });
  };

  // FIX: Added 'debt-payment' and 'loan-repayment' to the filter options to align with the updated `PatrimonioFilters` type.
  // FIX: Added 'asset-spend' to allow filtering for spending from savings.
  // FIX: Completed the `typeOptions` array to fix a missing property error.
  const typeOptions: { value: 'asset' | 'loan' | 'liability' | 'debt-payment' | 'loan-repayment' | 'loan-addition' | 'debt-addition' | 'asset-spend', label: string }[] = [
    { value: 'asset', label: 'Ahorros' },
    { value: 'loan', label: 'Préstamos (Creación)' },
    { value: 'liability', label: 'Deudas (Creación)' },
    { value: 'debt-payment', label: 'Pagos de Deudas' },
    { value: 'loan-repayment', label: 'Reembolsos de Préstamos' },
    { value: 'loan-addition', label: 'Ampliación Préstamos' },
    { value: 'debt-addition', label: 'Ampliación Deudas' },
    { value: 'asset-spend', label: 'Gasto de Ahorros' },
  ];

  const sourceOptions = useMemo(() => [
    { id: 'efectivo', name: 'Efectivo' },
    ...bankAccounts,
  ], [bankAccounts]);

  const ToggleButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode, disabled?: boolean }> = ({ active, onClick, children, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${active ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 dark:bg-gray-700 border-transparent'} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in ${isOpen ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Filtrar Patrimonio</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tipo de Movimiento</h3>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(opt => (
                <ToggleButton key={opt.value} active={localFilters.types.includes(opt.value)} onClick={() => handleToggle('types', opt.value)}>
                  {opt.label}
                </ToggleButton>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Origen de Fondos</h3>
            <div className="flex flex-wrap gap-2">
              {sourceOptions.map(opt => (
                <ToggleButton key={opt.id} active={localFilters.sources.includes(opt.id)} onClick={() => handleToggle('sources', opt.id)}>
                  {opt.name}
                </ToggleButton>
              ))}
            </div>
          </div>
        </div>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto grid grid-cols-2 gap-3">
          <button onClick={handleClear} className="w-full font-bold py-3 px-4 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-200">
            Limpiar
          </button>
          <button onClick={handleApply} className="w-full font-bold py-3 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">
            Aplicar Filtros
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PatrimonioFilterPanel;
