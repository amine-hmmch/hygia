import React, { useState } from 'react';
import { Download, Smartphone, X, Monitor, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean; label?: string }> = ({
  compact = false,
  label,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone mode (PWA installed), hide
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  const buttonText = label || (compact ? 'Installer' : "Installer l'application");

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 font-bold rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white shadow-md transition shrink-0 ${
          compact ? 'min-w-10 min-h-10 justify-center px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm'
        }`}
        title="Installer l'application sur l'appareil pour un fonctionnement 100% hors-ligne"
        aria-label={buttonText}
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        <span className={`whitespace-nowrap ${compact ? 'hidden min-[420px]:inline' : ''}`}>{buttonText}</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-800 border border-slate-700 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-base text-white">Installer l'application</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 flex items-start gap-2.5 text-teal-200">
                <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-bold mb-0.5">Application 100% Hors-Ligne</strong>
                  Une fois installée, l'application fonctionne sans aucune connexion Internet. Toutes vos check-lists et données restent sécurisées sur votre appareil.
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-2.5 pt-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-teal-400" />
                    Sur iPhone / iPad (Safari) :
                  </p>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                    <p>Touchez le bouton <strong>Partager</strong> <span className="text-teal-300 font-bold">⎋</span> dans la barre Safari.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                    <p>Faites défiler et choisissez <strong>« Sur l'écran d'accueil »</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                    <p>Touchez <strong>Ajouter</strong> en haut à droite.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-teal-400" />
                    Sur Android, Chrome ou Edge :
                  </p>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                    <p>Dans la barre d'adresse de votre navigateur, cliquez sur l'icône <strong>Installer (⊕)</strong> ou ouvrez le menu <strong>(⋮)</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                    <p>Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                    <p>L'application s'ouvre alors comme une application native plein écran.</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
