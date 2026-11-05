import React from 'react';
import { WifiOff, Info, Sun, Moon } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AppLogo } from './AppLogo';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../config/app';

interface HeaderProps {
  onOpenSettings: () => void;
  onNewAudit?: () => void;
  onOpenAPropos?: () => void;
  onGoHome?: () => void;
}

const ghostBtn =
  'w-11 h-11 rounded-lg flex items-center justify-center text-sub hover:text-main hover:bg-card-subtle transition active:scale-95';

export const Header: React.FC<HeaderProps> = ({ onOpenAPropos, onGoHome }) => {
  const isOnline = useOnlineStatus();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-soft px-4 py-2.5 no-print">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onGoHome}
          aria-label="Retour à l’accueil"
          className="flex items-center gap-2.5 min-w-0 text-start rounded-lg -ms-1 ps-1 pe-2 py-1.5 min-h-[44px] active:opacity-70"
        >
          <AppLogo size={28} className="shrink-0" />
          <div className="min-w-0 leading-tight">
            <h1 className="text-[17px] font-semibold text-main truncate">{APP_NAME}</h1>
            {!isOnline && (
              <span className="flex items-center gap-1 text-[11px] text-warning">
                <WifiOff className="w-3 h-3" />
                Hors-ligne
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={toggleTheme}
            className={ghostBtn}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label="Changer le thème d'affichage"
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {onOpenAPropos && (
            <button onClick={onOpenAPropos} className={ghostBtn} title="À propos" aria-label="À propos">
              <Info className="w-[18px] h-[18px]" />
            </button>
          )}

          <PWAInstallButton compact={true} />
        </div>
      </div>
    </header>
  );
};
