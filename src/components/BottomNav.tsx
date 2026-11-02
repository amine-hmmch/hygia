import React from 'react';
import { Home, ClipboardCheck, AlertTriangle, Settings, BookOpen } from 'lucide-react';

export type NavTab = 'accueil' | 'checklists' | 'fiches' | 'actions' | 'parametres';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  pendingActionsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, pendingActionsCount }) => {
  const tabs = [
    { id: 'accueil' as NavTab, label: 'Accueil', icon: Home },
    { id: 'checklists' as NavTab, label: 'Audits', icon: ClipboardCheck },
    { id: 'fiches' as NavTab, label: 'Fiches', icon: BookOpen },
    { id: 'actions' as NavTab, label: 'Actions', icon: AlertTriangle, badge: pendingActionsCount },
    { id: 'parametres' as NavTab, label: 'Réglages', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 no-print bg-surface border-t border-soft"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-4xl mx-auto grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative min-h-[56px] pt-2 pb-1.5 flex flex-col items-center justify-center gap-1 select-none transition ${
                isActive ? 'text-primary' : 'text-sub'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && <span className="absolute top-0 inset-x-6 h-[2px] bg-primary" />}
              <span className="relative">
                <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.1 : 1.6} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -end-2.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white dark:text-[#1a0d0a] text-[10px] font-semibold flex items-center justify-center font-mono">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </span>
              <span className={`text-[11px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
