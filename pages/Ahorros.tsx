import React, { useState } from 'react';
import { Page, Profile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface AhorrosProps {
  profile: Profile;
  savingsBySource: Record<string, { total: number; name: string; color: string; }>;
  onNavigate: (page: Page) => void;
  onOpenSpendSavingsModal: () => void;
  currency: string;
  manualAssetsValue: number;
}

// FIX: Define an explicit type for savings source data to use in type assertions.
type SavingsSourceData = { total: number; name: string; color: string; };

const Ahorros: React.FC<AhorrosProps> = ({
  profile,
  savingsBySource,
  onNavigate,
  onOpenSpendSavingsModal,
  currency,
  manualAssetsValue
}) => {
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00Z');
    const options: Intl.DateTimeFormatOptions = {
      dateStyle: 'long',
      timeZone: 'UTC',
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  };
  
  const handleToggle = (sourceId: string) => {
    setExpandedSourceId(prevId => (prevId === sourceId ? null : sourceId));
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <header className="flex items-center">
        <button
          onClick={() => onNavigate('patrimonio')}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Volver a patrimonio"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">
          Detalle de Ahorros
        </h1>
      </header>

      <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm dark:border dark:border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Ahorrado</h2>
          <p className="text-4xl font-bold mt-1 text-green-500">
            {formatCurrency(manualAssetsValue)}
          </p>
        </div>
        <button
          onClick={onOpenSpendSavingsModal}
          disabled={manualAssetsValue <= 0}
          className="w-full text-lg font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Gastar Ahorros
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Ahorros por Origen</h3>
        <div className="space-y-3">
          {Object.entries(savingsBySource).length > 0 ? (
            Object.entries(savingsBySource).map(([sourceId, _sourceData]) => {
              // FIX: Cast sourceData to the correct type to access its properties.
              const sourceData = _sourceData as SavingsSourceData;
              const isExpanded = expandedSourceId === sourceId;
              const detailedAssets = profile.data.assets
                .filter(asset => asset.sourceMethodId === sourceId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              return (
                <div key={sourceId} className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden transition-all duration-300 shadow-sm">
                  <button
                    onClick={() => handleToggle(sourceId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    aria-expanded={isExpanded}
                    aria-controls={`details-${sourceId}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: sourceData.color }}></span>
                      <span className="font-semibold text-lg text-gray-700 dark:text-gray-200">{sourceData.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-green-500">{formatCurrency(sourceData.total)}</span>
                        <svg className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </button>
                  
                  <div 
                    id={`details-${sourceId}`}
                    className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        {detailedAssets.length > 0 ? (
                          detailedAssets.map(asset => (
                            <div key={asset.id} className="flex items-center justify-between text-sm py-1">
                              <span className="font-semibold text-gray-600 dark:text-gray-300">{formatFullDate(asset.date)}</span>
                              <span className="font-mono font-medium text-green-500">{formatCurrency(asset.value)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">No hay movimientos para esta fuente de ahorro.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 px-4 bg-white dark:bg-gray-800/50 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">No tienes ahorros registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ahorros;
