import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { extrasService } from '../services/extrasService';
import { useToast } from '../context/ToastContext';

export const RappelsPanel: React.FC = () => {
  const { showToast } = useToast();
  const [actif, setActif] = useState(extrasService.rappelsActifs() && extrasService.notifSupportee() && Notification.permission === 'granted');
  const dernier = extrasService.lastBackup();

  const basculer = async (on: boolean) => {
    if (!on) {
      extrasService.desactiverRappels();
      setActif(false);
      return;
    }
    const ok = await extrasService.activerRappels();
    setActif(ok);
    if (!ok) showToast('Notifications refusées ou non disponibles sur cet appareil.', 'error');
  };

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-card border border-soft space-y-3 shadow-soft">
      <div className="flex items-center gap-2 text-main font-heading font-bold text-base">
        <Bell className="w-5 h-5 text-[#1F5A43] dark:text-teal-400" />
        <span>Rappels</span>
      </div>
      <p className="text-xs text-sub leading-relaxed">
        L’accueil signale le test de chlore de la semaine, les activités du plan à faire et la sauvegarde. Avec les notifications, un rappel s’affiche aussi quand tu ouvres l’application (une fois par jour).
        Elles ne se déclenchent pas application fermée.
      </p>
      <label className="flex items-center gap-3 min-h-[44px] text-sm text-main">
        <input
          type="checkbox"
          checked={actif}
          disabled={!extrasService.notifSupportee()}
          onChange={(e) => void basculer(e.target.checked)}
          className="w-5 h-5 accent-[#1F5A43]"
        />
        Activer les notifications de rappel
      </label>
      <p className="text-xs text-sub">
        Dernière sauvegarde : <b className="text-main">{dernier ? dernier.toLocaleDateString('fr-FR') : 'jamais'}</b>
      </p>
    </div>
  );
};
