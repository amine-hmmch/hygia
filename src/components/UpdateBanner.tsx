import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export const UPDATE_EVENT = 'hygia:update-available';
let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;
export const setUpdater = (fn: (reload?: boolean) => Promise<void>) => { applyUpdate = fn; };

/** Bandeau « nouvelle version disponible » : l'utilisateur choisit quand recharger. */
export const UpdateBanner = () => {
  const [dispo, setDispo] = useState(false);
  useEffect(() => {
    const on = () => setDispo(true);
    window.addEventListener(UPDATE_EVENT, on);
    return () => window.removeEventListener(UPDATE_EVENT, on);
  }, []);
  if (!dispo) return null;
  return (
    <div role="status" className="fixed left-3 right-3 bottom-24 z-40 max-w-md mx-auto flex items-center gap-3 rounded-xl bg-card border border-medium shadow-floating px-4 py-3">
      <RefreshCw size={18} className="text-primary shrink-0" aria-hidden />
      <p className="flex-1 text-sm text-main">Nouvelle version disponible. Tes données sont conservées.</p>
      <button onClick={() => applyUpdate?.(true)} className="min-h-[44px] px-3 rounded-lg bg-[#1F5A43] text-white text-sm font-semibold">Mettre à jour</button>
      <button onClick={() => setDispo(false)} className="min-h-[44px] px-2 text-sm text-sub" aria-label="Plus tard">Plus tard</button>
    </div>
  );
};
