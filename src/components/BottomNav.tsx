import React from 'react';
import { Home, ClipboardCheck, AlertTriangle, Settings, BookOpen } from 'lucide-react';

export type NavTab = 'accueil' | 'checklists' | 'fiches' | 'actions' | 'parametres';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  pendingActionsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingActionsCount,
}) => {
  const tabs = [
    { id: 'accueil' as NavTab, label: 'Accueil', icon: Home },
    { id: 'checklists' as NavTab, label: 'Check-lists', icon: ClipboardCheck },
    { id: 'fiches' as NavTab, label: 'Fiches', icon: BookOpen },
    { id: 'actions' as NavTab, label: 'Actions', icon: AlertTriangle, badge: pendingActionsCount },
    { id: 'parametres' as NavTab, label: 'Réglages', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-3 start-3 end-3 sm:start-auto sm:end-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md w-auto z-40 no-print pointer-events-none">
      <div className="pointer-events-auto bg-white/90 dark:bg-[#12202A]/90 backdrop-blur-lg border border-slate-200/80 dark:border-[#1E3342] shadow-floating rounded-2xl p-1.5 flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex-1 min-h-[48px] py-2 px-1 rounded-xl transition-all duration-200 flex flex-col items-center justify-center select-none active:scale-95 ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-[#0F766E] dark:text-teal-300 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
              title={tab.label}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -end-2.5 bg-amber-500 text-slate-950 font-black text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] leading-tight mt-1 truncate transition-all duration-200 ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
