import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import AmountInput from './AmountInput';
import CustomDatePicker from './CustomDatePicker';

const CASH_METHOD_ID = 'efectivo';

interface AssetLiabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveLiability: (name: string, details: string, amount: number, destinationMethodId: string, date: string, isInitial: boolean) => void;
    onSaveLoan: (name: string, amount: number, sourceMethodId: string, date: string, isInitial: boolean, details: string) => void;
    onCreateSaving: (value: number, sourceMethodId: string, date: string) => void;
    config: {
        type: 'asset' | 'liability' | 'loan';
    };
    currency: string;
    bankAccounts: BankAccount[];
    balancesByMethod: Record<string, number>;
    minDate?: string;
}

const AssetLiabilityModal: React.FC<AssetLiabilityModalProps> = ({
    isOpen, onClose, onSaveLiability, onSaveLoan, onCreateSaving, config, currency, bankAccounts = [], balancesByMethod = {}, minDate
}) => {
    const { type } = config;
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [sourceMethodId, setSourceMethodId] = useState<string>(CASH_METHOD_ID);
    const [isInitial, setIsInitial] = useState(false);
    const [error, setError] = useState('');
    const descriptionInputRef = useRef<HTMLInputElement>(null);

    const isAsset = type === 'asset';
    const isLoan = type === 'loan';
    const isLiability = type === 'liability';

    useEffect(() => {
        if (isOpen) {
            setName('');
            setDetails('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsInitial(false);
            if (isAsset || isLoan || isLiability) {
                const cashBalance = balancesByMethod[CASH_METHOD_ID] || 0;
                if (cashBalance >= 0) { // Can be 0 for receiving money
                    setSourceMethodId(CASH_METHOD_ID);
                } else {
                    setSourceMethodId(bankAccounts.find(b => (balancesByMethod[b.id] || 0) > 0)?.id || CASH_METHOD_ID);
                }
            }
            setError('');
        }
    }, [isOpen, isAsset, isLoan, isLiability, balancesByMethod, bankAccounts]);

    useEffect(() => {
        // This effect ensures the date is valid whenever minDate or the modal type changes.
        if (isOpen && isAsset && minDate && date < minDate) {
            setDate(minDate);
        }
    }, [isOpen, isAsset, minDate, date]);

    const sources = useMemo(() => [
        { id: CASH_METHOD_ID, name: 'Efectivo', balance: balancesByMethod[CASH_METHOD_ID] || 0, color: '#008f39' },
        ...bankAccounts.map(b => ({ id: b.id, name: b.name, balance: balancesByMethod[b.id] || 0, color: b.color }))
    ], [bankAccounts, balancesByMethod]);

    const selectedSourceDetails = useMemo(() => {
        return sources.find(s => s.id === sourceMethodId);
    }, [sourceMethodId, sources]);

    const sourceSelectStyle: React.CSSProperties = selectedSourceDetails ? {
        borderColor: selectedSourceDetails.color,
        color: selectedSourceDetails.color,
        fontWeight: '600',
    } : {};


    if (!isOpen) return null;

    const handleSubmit = () => {
        const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
        
        if (!isAsset && !name.trim()) {
            setError('La descripción es obligatoria.');
            return;
        }
        if (!date) {
            setError('La fecha es obligatoria.');
            return;
        }
        if (numericAmount < 0) {
            setError('La cantidad no puede ser negativa.');
            return;
        }
        
        if (!isInitial && (isAsset || isLoan)) {
             if (numericAmount > 0 && !sourceMethodId) {
                setError('Debes seleccionar una cuenta.');
                return;
            }
        }

        if (isAsset) {
            onCreateSaving(numericAmount, sourceMethodId, date);
        } else if (isLoan) {
            onSaveLoan(name, numericAmount, isInitial ? '' : sourceMethodId, date, isInitial, details);
        } else {
            // For liabilities, always treat as initial. No source/destination method is needed.
            onSaveLiability(name, details, numericAmount, '', date, true);
        }
    };

    const modalConfig = isAsset
        ? {
            title: 'Añadir Ahorro',
            amountLabel: 'Valor',
            buttonText: 'Guardar Ahorro',
            themeColor: '#22c55e' // Green
        } : isLoan ? {
            title: 'Añadir Préstamo',
            amountLabel: 'Monto',
            buttonText: 'Guardar Préstamo',
            themeColor: '#3b82f6' // Blue
        } : {
            title: 'Añadir Deuda',
            amountLabel: 'Monto',
            buttonText: 'Guardar Deuda',
            themeColor: '#ef4444' // Red
        };

    const formatCurrency = (amountValue: number) => {
        const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: amountValue % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(amountValue);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-liability-modal-title"
        >
            <div
                className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="asset-liability-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">{modalConfig.title}</h2>
                    <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 space-y-4">
                    {/* REORDERED FORM FOR LOAN & LIABILITY */}
                    { isLoan || isLiability ? (
                        <>
                            <div>
                                <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {isLoan ? "Título" : "Descripción"}
                                </label>
                                <input
                                    ref={descriptionInputRef}
                                    type="text"
                                    id="item-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={isLoan ? "Ej: Préstamo a Juan Pérez" : "Ej: Préstamo Coche"}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                             <div>
                                <label htmlFor="item-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Detalles (Opcional)
                                </label>
                                <textarea
                                    id="item-details"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder={isLoan ? "Ej: Para la entrada del coche" : "Ej: Cuotas, intereses, etc."}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <AmountInput
                                value={amount}
                                onChange={setAmount}
                                label={modalConfig.amountLabel}
                                themeColor={modalConfig.themeColor}
                                currency={currency}
                                onSubmitted={() => {}}
                            />

                            <div>
                                <label htmlFor="item-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha
                                </label>
                                <CustomDatePicker
                                    value={date}
                                    onChange={setDate}
                                    themeColor={modalConfig.themeColor}
                                    displayMode="modal"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* ORIGINAL ORDER FOR ASSET */}
                            <AmountInput
                                value={amount}
                                onChange={setAmount}
                                label={modalConfig.amountLabel}
                                themeColor={modalConfig.themeColor}
                                currency={currency}
                                autoFocus={true}
                                onSubmitted={() => !isAsset && descriptionInputRef.current?.focus()}
                            />
                             <div>
                                <label htmlFor="item-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha
                                </label>
                                <CustomDatePicker
                                    value={date}
                                    onChange={setDate}
                                    themeColor={modalConfig.themeColor}
                                    displayMode="modal"
                                    min={minDate}
                                />
                            </div>
                        </>
                    )}

                    {/* COMMON FIELDS for ASSET, LOAN */}
                    {(isLoan) && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pt-2">
                            <input
                                type="checkbox"
                                id="is-initial-checkbox"
                                checked={isInitial}
                                onChange={(e) => setIsInitial(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                style={{ accentColor: modalConfig.themeColor }}
                            />
                            <label htmlFor="is-initial-checkbox" className="cursor-pointer">
                                Registrar como movimiento inicial (no afectará al saldo actual)
                            </label>
                        </div>
                    )}
                    {(isAsset || (isLoan && !isInitial)) && (
                        <div className="animate-fade-in">
                            <label htmlFor="source-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {isLiability ? "Depositar en" : "Origen de los fondos"}
                            </label>
                            <select
                                id="source-method"
                                value={sourceMethodId}
                                onChange={(e) => setSourceMethodId(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 transition-colors"
                                style={sourceSelectStyle}
                            >
                                {sources.map(source => {
                                    const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
                                    const disabled = (isAsset || isLoan) && numericAmount > 0 && source.balance < numericAmount;
                                    return (
                                        <option key={source.id} value={source.id} disabled={disabled} style={{ fontWeight: 'normal' }}>
                                            {source.name} ({formatCurrency(source.balance)}) {disabled ? " - Fondos insuficientes" : ""}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>

                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <button
                        onClick={handleSubmit}
                        className="w-full text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                        style={{ backgroundColor: modalConfig.themeColor, '--tw-ring-color': modalConfig.themeColor } as React.CSSProperties}
                    >
                        {modalConfig.buttonText}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AssetLiabilityModal;