import React from 'react';
import { NavTab } from '../types';
import { FRANCACHELA_LOGO, ROBERTO_AVATAR } from '../data/mockData';

interface HeaderProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, pendingCount }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-[#141311]/80 backdrop-blur-xl border-b border-[#E8B04B]/20 h-20 z-50 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-3">
        {/* Roberto Avatar in Dashboard mode */}
        <button 
          onClick={() => onNavigate('dashboard')}
          className="relative group transition-transform active:scale-95"
          title="Ver perfil de Roberto"
        >
          <div className="w-10 h-10 rounded-full border border-[#f2ca50]/40 overflow-hidden bg-[#2b2a27]">
            <img 
              src={ROBERTO_AVATAR} 
              alt="Roberto Manager" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#141311] rounded-full" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <img 
            src={FRANCACHELA_LOGO} 
            alt="Francachela Logo" 
            className="h-10 sm:h-12 w-auto object-contain transition-opacity hover:opacity-90"
          />
          <span className="hidden sm:inline-block font-garamond text-xl text-[#f2ca50] font-medium tracking-tight border-l border-[#4d4635] pl-3 ml-1">
            ReviewPulse AI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Review Badge Button */}
        {pendingCount > 0 && (
          <button
            onClick={() => onNavigate('reviews')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-[#f2ca50] text-xs font-semibold hover:bg-[#f2ca50]/20 transition-all"
          >
            <span className="material-symbols-outlined text-sm">rate_review</span>
            <span>{pendingCount} pendientes</span>
          </button>
        )}

        {/* Notifications Icon */}
        <button
          onClick={() => onNavigate('reviews')}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] hover:bg-[#2b2a27]/50 transition-colors"
          title="Notificaciones de reseñas"
        >
          <span className="material-symbols-outlined">notifications</span>
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#f2ca50] rounded-full ring-2 ring-[#141311]" />
          )}
        </button>

        {/* Config button */}
        <button
          onClick={() => onNavigate('config')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            currentTab === 'config'
              ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40'
              : 'text-[#d0c5af] hover:text-[#f2ca50] hover:bg-[#2b2a27]/50'
          }`}
          title="Ajustes y Configuración IA"
        >
          <span className="material-symbols-outlined">tune</span>
        </button>
      </div>
    </header>
  );
};
