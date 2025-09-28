import React, { useState, useEffect, useMemo } from 'react';
import { BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import CustomDatePicker from './CustomDatePicker';
import BackspaceIcon from './icons/BackspaceIcon';

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

const KeypadButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; ariaLabel: string }> = ({ onClick, children, className = '', ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`flex items-center justify-center text-2xl font-light text-gray-800 dark:text-gray-100 rounded-lg h-12 bg-gray-200/50 dark:bg-white/10 active:bg-gray-300/50 dark:active:bg-white/20 transition-colors duration-100 ${className}`}
  >
    {children}
  </button>
);


const AssetLiabilityModal: React.FC<AssetLiabilityModalProps> = ({
    isOpen, onClose, onSaveLiability, onSaveLoan, onCreateSaving, config, currency, bankAccounts = [], balancesByMethod = {}, minDate
}) => {
    const { type } = config;
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [sourceMethodId, setSourceMethodId] = useState<string>('');
    const [isInitial, setIsInitial] = useState(false);
    const [error, setError] = useState('');
    const [isKeypadVisible, setIsKeypadVisible] = useState(false);

    const isAsset = type === 'asset';
    const isLoan = type === 'loan';
    const isLiability = type === 'liability';

    useEffect(() => {
        if (isOpen) {
            setName('');
            setDetails('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsInitial(type === 'liability'); // Debts are always initial now
            setIsKeypadVisible(false);
            
            const firstValidSource = bankAccounts.find(b => (balancesByMethod[b.id] || 0) > 0);
            const cashBalance = balancesByMethod[CASH_METHOD_ID] || 0;
            
            if (cashBalance > 0) {
                setSourceMethodId(CASH_METHOD_ID);
            } else if (firstValidSource) {
                setSourceMethodId(firstValidSource.id);
            } else {
                setSourceMethodId(bankAccounts[0]?.id || CASH_METHOD_ID);
            }
            
            setError('');
        }
    }, [isOpen, type, balancesByMethod, bankAccounts]);

    useEffect(() => {
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
        setError('');
        
        if (numericAmount <= 0) {
            setError('La cantidad debe ser mayor que cero.');
            return;
        }
        if (!isAsset && !name.trim()) {
            setError('La descripción es obligatoria.');
            return;
        }
        if (!date) {
            setError('La fecha es obligatoria.');
            return;
        }
        
        const sourceRequired = isAsset || (isLoan && !isInitial);
        if (sourceRequired) {
             if (!sourceMethodId) {
                setError('Debes seleccionar una cuenta.');
                return;
            }
            const sourceBalance = balancesByMethod[sourceMethodId] || 0;
            if((isAsset || isLoan) && numericAmount > sourceBalance) {
                setError('Fondos insuficientes en la cuenta de origen.');
                return;
            }
        }

        if (isAsset) {
            onCreateSaving(numericAmount, sourceMethodId, date);
        } else if (isLoan) {
            onSaveLoan(name, numericAmount, isInitial ? '' : sourceMethodId, date, isInitial, details);
        } else { // isLiability - always initial now
            onSaveLiability(name, details, numericAmount, '', date, true);
        }
        onClose();
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

    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    const fallbackSymbol = currency === 'EUR' ? '€' : '$';
    const currencySymbol = useMemo(() => 
        new Intl.NumberFormat(locale, { style: 'currency', currency })
            .formatToParts(0).find(p => p.type === 'currency')?.value || fallbackSymbol
    , [locale, currency, fallbackSymbol]);
    
    const handleNumberClick = (num: string) => {
        setError('');
        setAmount(prev => {
            if (prev === '' || prev === '0') return num;
            if (prev.includes(',')) {
                const parts = prev.split(',');
                if (parts[1] && parts[1].length >= 2) return prev;
            }
            return prev + num;
        });
    };

    const handleCommaClick = () => {
        setError('');
        setAmount(prev => {
            if (prev.includes(',')) return prev;
            if (prev === '') return '0,';
            return prev + ',';
        });
    };

    const handleBackspaceClick = () => {
        setError('');
        setAmount(prev => prev.slice(0, -1));
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
                className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="asset-liability-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">{modalConfig.title}</h2>
                    <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {modalConfig.amountLabel}
                        </label>
                        <button 
                            type="button"
                            onClick={() => setIsKeypadVisible(prev => !prev)}
                            className="w-full flex justify-between items-center px-3 py-2 border-2 border-transparent rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-[42px] ring-2"
                            style={{'--tw-ring-color': modalConfig.themeColor} as React.CSSProperties}
                        >
                            <span className="font-mono text-lg">{amount.replace('.', ',') || '0'}</span>
                            <span className="text-gray-500 dark:text-gray-400">{currencySymbol}</span>
                        </button>
                    </div>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isKeypadVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="grid grid-cols-4 gap-2 pt-2">
                            <KeypadButton onClick={() => handleNumberClick('7')} ariaLabel="7">7</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('8')} ariaLabel="8">8</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('9')} ariaLabel="9">9</KeypadButton>
                            <KeypadButton onClick={handleBackspaceClick} ariaLabel="Borrar"><BackspaceIcon className="w-6 h-6" /></KeypadButton>
                            
                            <KeypadButton onClick={() => handleNumberClick('4')} ariaLabel="4">4</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('5')} ariaLabel="5">5</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('6')} ariaLabel="6">6</KeypadButton>
                            <KeypadButton onClick={() => setAmount('')} ariaLabel="Limpiar">C</KeypadButton>

                            <KeypadButton onClick={() => handleNumberClick('1')} ariaLabel="1">1</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('2')} ariaLabel="2">2</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('3')} ariaLabel="3">3</KeypadButton>
                            <div />

                            <KeypadButton onClick={handleCommaClick} ariaLabel="Coma">,</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('0')} className="col-span-2" ariaLabel="0">0</KeypadButton>
                        </div>
                    </div>

                    {!isAsset && (
                        <>
                            <div>
                                <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {isLoan ? "Título" : "Descripción"}
                                </label>
                                <input
                                    type="text"
                                    id="item-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={isLoan ? "Ej: Préstamo a Juan Pérez" : "Ej: Préstamo Coche"}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    style={{'--tw-ring-color': modalConfig.themeColor} as React.CSSProperties}
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
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    style={{'--tw-ring-color': modalConfig.themeColor} as React.CSSProperties}
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="item-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fecha
                        </label>
                        <CustomDatePicker
                            value={date}
                            onChange={setDate}
                            themeColor={modalConfig.themeColor}
                            displayMode="modal"
                            min={isAsset ? minDate : undefined}
                        />
                    </div>
                     {isLoan && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pt-2">
                            <input
                                type="checkbox"
                                id="is-initial-checkbox"
                                checked={isInitial}
                                onChange={(e) => setIsInitial(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
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
                                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 transition-colors"
                                style={{...sourceSelectStyle, '--tw-ring-color': modalConfig.themeColor} as React.CSSProperties}
                            >
                                {sources.map(source => {
                                    const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
                                    const disabled = (isAsset || isLoan) && numericAmount > 0 && source.balance < numericAmount;
                                    return (
                                        <option key={source.id} value={source.id} disabled={disabled} style={{ fontWeight: 'normal', color: 'initial' }}>
                                            {source.name} ({formatCurrency(source.balance)}) {disabled ? " - Fondos insuficientes" : ""}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
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