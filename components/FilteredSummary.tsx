import React from 'react';

interface FilteredSummaryProps {
  income: number;
  expenses: number;
  currency: string;
}

const FilteredSummary: React.FC<FilteredSummaryProps> = ({ income, expenses, currency }) => {
  const netTotal = income - expenses;

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const netColorClass = netTotal >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg my-4 animate-fade-in">
      <h3 className="font-bold text-blue-800 dark:text-blue-300">Total de la Selección</h3>
      <div className="mt-2 space-y-1 text-sm">
        {income > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Ingresos Filtrados:</span>
            <span className="font-semibold text-green-500">{formatCurrency(income)}</span>
          </div>
        )}
        {expenses > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Gastos Filtrados:</span>
            <span className="font-semibold text-red-500">{formatCurrency(expenses)}</span>
          </div>
        )}
        {(income > 0 || expenses > 0) && (
          <div className="flex justify-between pt-2 mt-1 border-t border-blue-200 dark:border-blue-800">
            <span className="font-bold text-gray-700 dark:text-gray-300">Neto Filtrado:</span>
            <span className={`font-bold ${netColorClass}`}>{formatCurrency(netTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilteredSummary;