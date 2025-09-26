import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import AmountInput from './AmountInput';
import CustomDatePicker from './CustomDatePicker';
import CategoryModal from './CategoryModal';
import FoodIcon from './icons/FoodIcon';
import TransportIcon from './icons/TransportIcon';
import ClothingIcon from './icons/ClothingIcon';
import HouseIcon from './icons/HouseIcon';
import EntertainmentIcon from './icons/EntertainmentIcon';
import HealthIcon from './icons/HealthIcon';
import TagIcon from './icons/TagIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface SpendSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpend: (amount: number, description: string, date: string, categoryId: string | undefined, sourceMethodId: string) => void;
  savingsBySource: Record<string, { total: number; name: string; color: string; }>;
  currency: string;
  categories: Category[];
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

// FIX: Define an explicit type for savings source data to use in type assertions.
type SavingsSourceData = { total: number; name: string; color: string; };

const CategoryIcon: React.FC<{ iconName: string; color: string; }> = ({ iconName, color }) => {
    const iconProps = { className: "w-5 h-5", style: { color } };
    switch (iconName) {
      case 'Food': return <FoodIcon {...iconProps} />;
      case 'Transport': return <TransportIcon {...iconProps} />;
      case 'Clothing': return <ClothingIcon {...iconProps} />;
      case 'House': return <HouseIcon {...iconProps} />;
      case 'Entertainment': return <EntertainmentIcon {...iconProps} />;
      case 'Health': return <HealthIcon {...iconProps} />;
      case 'ArrowDown': return <ArrowDownIcon {...iconProps} />;
      case 'Tag':
      default:
        return <TagIcon {...iconProps} />;
    }
};

const SpendSavingsModal: React.FC<SpendSavingsModalProps> = ({
  isOpen, onClose, onSpend, savingsBySource, currency, categories,
  onAddCategory, onUpdateCategory, onDeleteCategory
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (amountValue: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amountValue % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amountValue);
  };
  
  useEffect(() => {
    if (isOpen) {
      setSelectedSourceId(null);
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedCategoryId(undefined);
      setError('');
    }
  }, [isOpen]);

  const selectedSourceData = selectedSourceId ? savingsBySource[selectedSourceId] as SavingsSourceData : null;

  const handleSubmit = () => {
    if (!selectedSourceId || !selectedSourceData) return;
    setError('');
    const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
    const totalSavingsFromSource = selectedSourceData.total;

    if (numericAmount <= 0) {
      setError('La cantidad debe ser mayor que cero.');
      return;
    }
    if (numericAmount > totalSavingsFromSource) {
      setError('No puedes gastar más de lo que tienes ahorrado de esta fuente.');
      return;
    }
    if (!description.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }
    
    onSpend(numericAmount, description, date, selectedCategoryId, selectedSourceId);
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategoryId(category.id);
    setIsCategoryModalOpen(false);
  };
  
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  // FIX: Corrected a TypeScript error where the `reduce` function was failing due to `Object.values` potentially returning `unknown[]` under strict type checking. The fix ensures that the `total` property is safely accessed and treated as a number, preventing the assignment of `unknown` to a `number` type.
  const totalSavings = (Object.values(savingsBySource) as SavingsSourceData[]).reduce((sum, s) => sum + (s.total || 0), 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="spend-savings-modal-title"
      >
        <div
          className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
                {selectedSourceId && (
                    <button onClick={() => setSelectedSourceId(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <ArrowLeftIcon />
                    </button>
                )}
                <h2 id="spend-savings-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {selectedSourceId ? "Detalles del Gasto" : "Gastar Ahorros"}
                </h2>
            </div>
            <button onClick={onClose} aria-label="Cerrar modal" className="p-2 -mr-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <CloseIcon className="w-6 h-6" />
            </button>
          </header>

          {!selectedSourceId || !selectedSourceData ? (
            // ================== STEP 1: SELECT SOURCE ==================
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Ahorrado</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalSavings)}</p>
              </div>
              <h3 className="font-semibold text-center text-gray-700 dark:text-gray-300">Paso 1: Selecciona el origen de los ahorros a gastar</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.keys(savingsBySource).length > 0 ? (
                  Object.entries(savingsBySource).map(([sourceId, _sourceData]) => {
                    // FIX: Cast sourceData to the correct type to access its properties.
                    const sourceData = _sourceData as SavingsSourceData;
                    return (
                    <button
                      key={sourceId}
                      onClick={() => setSelectedSourceId(sourceId)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: sourceData.color }}></span>
                        <span className="font-semibold">{sourceData.name}</span>
                      </div>
                      <span className="font-mono font-bold text-green-500">{formatCurrency(sourceData.total)}</span>
                    </button>
                  )})
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay ahorros para gastar.</p>
                )}
              </div>
            </div>
          ) : (
            // ================== STEP 2: ENTER DETAILS ==================
            <>
              <div className="p-6 space-y-4">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ahorros disponibles de <span className="font-semibold" style={{ color: selectedSourceData.color }}>{selectedSourceData.name}</span>
                  </p>
                  {/* FIX: Safely access properties from the selectedSourceData object, which is now guaranteed to exist and is correctly typed. This resolves the previous type inference issue. */}
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(selectedSourceData.total)}</p>
                </div>

                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  label="Cantidad a gastar"
                  themeColor="#ef4444"
                  currency={currency}
                  autoFocus={true}
                />
                <div>
                  <label htmlFor="spend-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción del gasto
                  </label>
                  <input
                    type="text"
                    id="spend-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Vacaciones, entrada de piso..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="w-full flex items-center text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {selectedCategory ? (
                      <span className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-red-500/50`} style={{ backgroundColor: `${selectedCategory.color}20`}}>
                            <CategoryIcon iconName={selectedCategory.icon} color={selectedCategory.color} />
                        </div>
                        <span>{selectedCategory.name}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">Seleccionar categoría (opcional)</span>
                    )}
                  </button>
                </div>
                <div>
                  <label htmlFor="spend-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha
                  </label>
                  <CustomDatePicker
                    value={date}
                    onChange={setDate}
                    themeColor="#ef4444"
                    displayMode="modal"
                  />
                </div>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </div>

              <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-red-600"
                >
                  Registrar Gasto
                </button>
              </footer>
            </>
          )}
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

export default SpendSavingsModal;