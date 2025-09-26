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
  onAddCategory: (name: string, icon: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, icon: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

const iconOptions = [
    'Food', 'ShoppingCart', 'Transport', 'Travel', 'House', 'Bill', 'Clothing', 
    'Entertainment', 'Health', 'Education', 'Pet', 'Gift', 'Subscription', 
    'MoneyBag', 'ArrowDown', 'ColombiaFlag', 'Tag'
];
const colorOptions = [
  '#ef4444', '#f87171', '#f97316', '#fb923c',
  '#eab308', '#facc15', '#22c55e', '#4ade80',
  '#16a34a', '#008f39', '#14b8a6', '#2dd4bf',
  '#3b82f6', '#60a5fa', '#6366f1', '#818cf8',
  '#8b5cf6', '#a78bfa', '#ec4899', '#f472b6',
  '#d946ef', '#e879f9', '#64748b', '#94a3b8',
];

const ColorPicker: React.FC<{selectedColor: string, onSelect: (color: string) => void}> = ({ selectedColor, onSelect }) => (
    <div className="grid grid-cols-8 gap-2 my-2">
      {colorOptions.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className="w-full aspect-square rounded-lg transition-transform duration-150 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-white flex items-center justify-center"
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        >
          {selectedColor === color && <CheckIcon className="w-5 h-5 text-white drop-shadow-md" />}
        </button>
      ))}
    </div>
);

const IconPicker: React.FC<{selectedIcon: string, onSelect: (icon: string) => void, color: string}> = ({ selectedIcon, onSelect, color }) => (
    <div className="grid grid-cols-7 gap-2 my-2">
      {iconOptions.map(iconName => (
        <button
          key={iconName}
          type="button"
          onClick={() => onSelect(iconName)}
          className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-150 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-white ${selectedIcon === iconName ? 'ring-2' : ''}`}
          style={{ backgroundColor: `${color}20`, borderColor: color }}
          aria-label={`Select icon ${iconName}`}
        >
          <CategoryIcon iconName={iconName} color={color} className="w-6 h-6"/>
        </button>
      ))}
    </div>
);


const CategoryModal: React.FC<CategoryModalProps> = ({ 
    isOpen, onClose, categories, onSelectCategory, onAddCategory, onUpdateCategory, onDeleteCategory 
}) => {
  const [newCategory, setNewCategory] = useState({ name: '', icon: iconOptions[15], color: colorOptions[22] });
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string, icon: string, color: string} | null>(null);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCategory.name.trim()) {
      onAddCategory(newCategory.name.trim(), newCategory.icon, newCategory.color);
      setNewCategory({ name: '', icon: iconOptions[15], color: colorOptions[22] });
    }
  };

  const handleUpdate = () => {
    if (editingCategory && editingCategory.name.trim()) {
      onUpdateCategory(editingCategory.id, editingCategory.name.trim(), editingCategory.icon, editingCategory.color);
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
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full px-2 py-1 border border-[#008f39] rounded-md bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#008f39]"
                      autoFocus
                    />
                    <button onClick={handleUpdate} className="p-2 text-[#008f39] hover:text-[#007a33] transition-colors">
                      <CheckIcon className="w-6 h-6" />
                    </button>
                  </div>
                   <div>
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Icono</h4>
                        <IconPicker 
                            selectedIcon={editingCategory.icon}
                            onSelect={(icon) => setEditingCategory({...editingCategory, icon})}
                            color={editingCategory.color}
                        />
                   </div>
                   <div>
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Color</h4>
                        <ColorPicker 
                            selectedColor={editingCategory.color}
                            onSelect={(color) => setEditingCategory({...editingCategory, color})}
                        />
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
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                        <CategoryIcon iconName={cat.icon} color={cat.color} />
                      </div>
                      <span className="text-gray-800 dark:text-gray-100">{cat.name}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color })} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
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
          <div>
            <div className="flex space-x-2">
                <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Nueva categoría..."
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
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Icono</h4>
            <IconPicker 
                selectedIcon={newCategory.icon} 
                onSelect={(icon) => setNewCategory({...newCategory, icon, color: newCategory.color})}
                color={newCategory.color}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Color</h4>
            <ColorPicker 
                selectedColor={newCategory.color}
                onSelect={(color) => setNewCategory({...newCategory, color})}
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CategoryModal;