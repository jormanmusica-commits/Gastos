import React, { useState } from 'react';
import { Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import CheckIcon from './icons/CheckIcon';
import CategoryIcon from './CategoryIcon';

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
  const [newCategory, setNewCategory] = useState({ name: '', icon: '🏷️' });
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string, icon: string} | null>(null);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCategory.name.trim()) {
      onAddCategory(newCategory.name.trim(), newCategory.icon);
      setNewCategory({ name: '', icon: '🏷️' });
    }
  };

  const handleUpdate = () => {
    if (editingCategory && editingCategory.name.trim()) {
      onUpdateCategory(editingCategory.id, editingCategory.name.trim(), editingCategory.icon);
      setEditingCategory(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Las transacciones existentes no se verán afectadas.')) {
      onDeleteCategory(id);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
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
          <h2 id="category-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Categorías</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full text-gray-800 dark:text-gray-100 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 space-y-2 overflow-y-auto">
          {categories.map(cat => (
            <div key={cat.id} className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50">
              {editingCategory?.id === cat.id ? (
                <div className="flex-grow space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingCategory.icon}
                      placeholder="😀"
                      onChange={(e) => {
                          const lastChar = [...e.target.value].pop() || '🏷️';
                          setEditingCategory({ ...editingCategory, icon: lastChar });
                      }}
                      className="w-20 text-4xl p-2 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full px-2 py-1 border border-[#008f39] rounded-md bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#008f39]"
                      autoFocus
                    />
                    <button onClick={handleUpdate} className="p-2 text-[#008f39] hover:text-[#007a33] transition-colors">
                      <CheckIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                    <button 
                      onClick={() => onSelectCategory && onSelectCategory(cat)}
                      onMouseDown={(e) => e.preventDefault()}
                      className="flex-grow flex items-center space-x-4 text-left p-2"
                      disabled={!onSelectCategory}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <CategoryIcon iconName={cat.icon} className="text-2xl" />
                      </div>
                      <span className="text-gray-800 dark:text-gray-100">{cat.name}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name, icon: cat.icon })} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <EditIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Añadir Nueva Categoría</h3>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newCategory.icon}
                    placeholder="😀"
                    onChange={(e) => {
                        const lastChar = [...e.target.value].pop() || '🏷️';
                        setNewCategory({ ...newCategory, icon: lastChar });
                    }}
                    className="w-20 text-4xl p-2 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Nombre de la categoría..."
                className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                onClick={handleAdd}
                aria-label="Añadir nueva categoría"
                className="flex-shrink-0 bg-[#008f39] text-white p-2 rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                <PlusIcon className="w-6 h-6" />
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default CategoryModal;