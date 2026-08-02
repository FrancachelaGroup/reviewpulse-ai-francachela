import React from 'react';
import { NavTab } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  pendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate, pendingCount }) => {
  const tabs: { id: NavTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'reviews', label: 'Reviews', icon: 'rate_review' },
    { id: 'protocol', label: 'AI Assistant', icon: 'psychology' },
    { id: 'config', label: 'Config', icon: 'tune' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-[#0f0e0c]/85 backdrop-blur-2xl border-t border-[#E8B04B]/30 shadow-[0_-4px_20px_rgba(212,175,55,0.12)]">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 relative ${
              isActive
                ? 'text-[#f2ca50] bg-[#f2ca50]/10 rounded-full px-4 py-1.5 font-bold'
                : 'text-[#d0c5af] hover:text-[#f2ca50]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              {tab.id === 'reviews' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#f2ca50] text-[#3c2f00] font-black text-[10px] rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="font-label-caps text-[11px] tracking-wider mt-0.5">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
