import React, { useState, useRef, useEffect } from 'react';
import { Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import CategoryIcon from './CategoryIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectCategory?: (category: Category) => void;
  onAddCategory: (name: string, icon: string) => void;
  onUpdateCategory: (id: string, name: string, icon: string) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ 
    isOpen, onClose, categories, onSelectCategory, onAddCategory, onUpdateCategory, onDeleteCategory 
}) => {
  const [editingState, setEditingState] = useState<{ id: string; field: 'name' | 'icon' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '🏷️' });

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsCreating(false);
        setSearchTerm('');
        setNewCategory({ name: '', icon: '🏷️' });
        setEditingState(null);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingState) {
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    }
  }, [editingState]);

  if (!isOpen) return null;

  const handleStartEdit = (cat: Category, field: 'name' | 'icon') => {
      setEditingState({ id: cat.id, field });
      setEditValue(field === 'name' ? cat.name : cat.icon);
  };

  const handleCancelEdit = () => {
      setEditingState(null);
      setEditValue('');
  };

  const handleUpdate = () => {
      if (!editingState) return;
      
      const { id, field } = editingState;
      const categoryToUpdate = categories.find(c => c.id === id);
      
      if (!categoryToUpdate) {
          handleCancelEdit();
          return;
      }
      
      const finalValue = editValue.trim();
      const originalValue = field === 'name' ? categoryToUpdate.name : categoryToUpdate.icon;

      if (finalValue === '' || finalValue === originalValue) {
          handleCancelEdit();
          return;
      }
      
      if (field === 'name') {
          onUpdateCategory(id, finalValue, categoryToUpdate.icon);
      } else {
          onUpdateCategory(id, categoryToUpdate.name, finalValue);
      }
      handleCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
      } else if (e.key === 'Escape') {
          handleCancelEdit();
      }
  };

  const handleAdd = () => {
    if (newCategory.name.trim()) {
      onAddCategory(newCategory.name.trim(), newCategory.icon);
      setNewCategory({ name: '', icon: '🏷️' });
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      onDeleteCategory(id);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.icon.includes(searchTerm)
  );

  const renderCreateView = () => (
    <>
      <div className="p-6 space-y-4">
        <div className="flex space-x-2">
            <input
                type="text"
                value={newCategory.icon}
                placeholder="😀"
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                onFocus={(e) => e.target.select()}
                className="w-20 text-4xl p-2 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Nombre de la categoría..."
                className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
            />
        </div>
      </div>
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <button
          onClick={handleAdd}
          className="w-full bg-[#008f39] text-white font-bold py-3 px-4 rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
        >
          Guardar Categoría
        </button>
      </footer>
    </>
  );

  const renderListView = () => (
    <>
      <div className="p-4 space-y-3 flex flex-col min-h-0">
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <div className="space-y-2 overflow-y-auto">
          {filteredCategories.map(cat => {
            const isEditingName = editingState?.id === cat.id && editingState.field === 'name';
            const isEditingIcon = editingState?.id === cat.id && editingState.field === 'icon';

            return (
              <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50">
                <div onClick={() => onSelectCategory?.(cat)} className="flex-grow flex items-center space-x-4 text-left p-2">
                  {isEditingIcon ? (
                    <input ref={inputRef} type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleUpdate} onKeyDown={handleKeyDown} className="w-16 text-3xl p-1 text-center border border-blue-500 rounded-md bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                  ) : (
                    <div onClick={(e) => { e.stopPropagation(); handleStartEdit(cat, 'icon'); }} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 cursor-pointer">
                      <CategoryIcon iconName={cat.icon} className="text-2xl" />
                    </div>
                  )}
                  {isEditingName ? (
                    <div className="flex-grow">
                      <input ref={inputRef} type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleUpdate} onKeyDown={handleKeyDown} className="w-full px-2 py-1 border border-blue-500 rounded-md bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                    </div>
                  ) : (
                    <span onClick={(e) => { e.stopPropagation(); handleStartEdit(cat, 'name'); }} className="text-gray-800 dark:text-gray-100 cursor-pointer">
                      {cat.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <button
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
        >
          <PlusIcon className="w-6 h-6" /> Crear Nueva Categoría
        </button>
      </footer>
    </>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isCreating ? (
            <>
              <button onClick={() => setIsCreating(false)} aria-label="Volver a la lista" className="p-2 -ml-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h2 id="category-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Crear Categoría</h2>
              <div className="w-10" /> {/* Spacer */}
            </>
          ) : (
            <>
              <h2 id="category-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Categorías</h2>
              <button onClick={onClose} aria-label="Cerrar modal" className="p-2 -mr-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <CloseIcon className="w-6 h-6" />
              </button>
            </>
          )}
        </header>
        
        {isCreating ? renderCreateView() : renderListView()}
      </div>
    </div>
  );
};

export default CategoryModal;
