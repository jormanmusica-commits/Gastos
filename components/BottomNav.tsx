import React, { useRef } from 'react';
import { Page } from '../types';
import HomeIcon from './icons/HomeIcon';
import GearIcon from './icons/GearIcon';
import ScaleIcon from './icons/ScaleIcon';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onGoHome: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, onGoHome }) => {
  const lastClickTimeRef = useRef(0);

  const handleHomeClick = () => {
      const now = new Date().getTime();
      const timeSinceLastClick = now - lastClickTimeRef.current;

      if (timeSinceLastClick < 300 && timeSinceLastClick > 0) { // Double click
          onGoHome();
          lastClickTimeRef.current = 0; // Reset to avoid triple click issues
      } else { // Single click
          if (currentPage !== 'resumen' && currentPage !== 'inicio') {
              onNavigate('resumen');
          }
      }
      lastClickTimeRef.current = now;
  };

  const NavButton: React.FC<{
    onClick: () => void;
    label: string;
    isActive: boolean;
    children: React.ReactNode;
  }> = ({ onClick, label, isActive, children }) => (
    <button
      onClick={onClick}
      aria-label={`Ir a ${label}`}
      className={`flex flex-col items-center justify-center transition-colors duration-300 w-20 h-full focus:outline-none rounded-2xl ${
        isActive ? 'text-[#008f39]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
      <span className="text-xs font-bold mt-1">{label}</span>
    </button>
  );

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-none dark:border-t dark:border-white/10 h-[calc(5rem+var(--sab))]">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-2 pb-[var(--sab)]">
          <NavButton 
              onClick={handleHomeClick} 
              label="Resumen" 
              isActive={currentPage === 'resumen' || currentPage === 'inicio'}>
              <HomeIcon className="w-7 h-7" />
          </NavButton>
          <NavButton onClick={() => onNavigate('patrimonio')} label="Patrimonio" isActive={currentPage === 'patrimonio'}>
              <ScaleIcon className="w-7 h-7" />
          </NavButton>
          <NavButton onClick={() => onNavigate('ajustes')} label="Ajustes" isActive={currentPage === 'ajustes'}>
              <GearIcon className="w-7 h-7" />
          </NavButton>
      </div>
    </footer>
  );
};

export default BottomNav;