import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  X,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ShieldAlert,
  FileText,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { URGENCE_AES_DATA, EtapeAes } from '../data/urgenceAesData';
import { storageService } from '../services/storageService';

interface UrgenceAesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UrgenceAesModal: React.FC<UrgenceAesModalProps> = ({ isOpen, onClose }) => {
  // 5 minutes timer (300 seconds) for immediate antiseptic contact
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<number>(1);
  const [contactUrgence, setContactUrgence] = useState<string>(() => {
    const etablissement = storageService.getSettings().etablissement?.trim();
    return etablissement
      ? `Urgences ${etablissement} / Référent AES : 05 XX XX XX XX`
      : 'Service des Urgences / Référent AES : 05 XX XX XX XX';
  });

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-card border-2 border-rose-500 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-floating text-main overflow-hidden my-auto">
        {/* Header Urgence Flash */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 py-4 flex items-center justify-between text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 animate-pulse shrink-0">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white text-rose-700 px-2 py-0.5 rounded-full font-mono">
                  Protocole d'Urgence
                </span>
                <span className="text-xs text-rose-100 font-medium">Guide ESSP 2021 • Section 1.10</span>
              </div>
              <h2 className="font-heading text-base sm:text-lg font-bold tracking-tight leading-tight mt-0.5">
                Accident d'Exposition au Sang (AES)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Quick Timer for 5-minute contact */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="font-heading font-bold text-rose-900 dark:text-rose-200 text-sm sm:text-base">
                  Minuteur d'Asepsie (Temps de contact ≥ 5 min)
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Dakin, Javel 2,6% diluée 1/5ème, dérivé iodé ou alcool 70°
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-black text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 shadow-inner">
                {formattedTime}
              </span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                  isTimerRunning
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-rose-600 text-white shadow-md'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTimerRunning ? 'Pause' : 'Démarrer'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(300);
                }}
                className="min-h-[44px] p-2.5 rounded-xl bg-card border border-soft text-sub hover:text-main"
                title="Réinitialiser à 5 min"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Critical DO NOT SQUEEZE warning */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-800 flex items-start gap-3 shadow-soft">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-bold text-amber-900 dark:text-amber-200 text-sm">
                Règle absolue : Ne jamais faire saigner !
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                Ne pas presser, frotter ou comprimer la plaie (risque d'inoculation en profondeur des agents pathogènes VHB, VHC, VIH).
              </p>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-card-subtle rounded-2xl border border-soft">
            {URGENCE_AES_DATA.etapes.map((step) => {
              const isSelected = activeStepTab === step.numero;
              return (
                <button
                  key={step.numero}
                  onClick={() => setActiveStepTab(step.numero)}
                  className={`min-h-[44px] py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#0F766E] text-white font-bold shadow-sm'
                      : 'text-sub hover:text-main'
                  }`}
                >
                  <span className="text-[11px] font-bold">Étape {step.numero}</span>
                  <span className="text-[10px] truncate max-w-[80px] hidden xs:block">{step.titre}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Detailed Content */}
          {(() => {
            const currentStep = URGENCE_AES_DATA.etapes.find((e) => e.numero === activeStepTab) || URGENCE_AES_DATA.etapes[0];
            return (
              <div className="p-5 rounded-2xl bg-card border border-soft space-y-3.5 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#0F766E] dark:text-teal-400 uppercase tracking-wider">
                      Étape {currentStep.numero} sur {URGENCE_AES_DATA.etapes.length} • {currentStep.delai}
                    </span>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-main mt-0.5">
                      {currentStep.titre}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-sub leading-relaxed">
                  {currentStep.actions.map((act, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card-subtle border border-soft text-main">
                      <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-[#0F766E] dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>

                {currentStep.interdictions && currentStep.interdictions.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <strong className="block font-bold">Interdictions absolues :</strong>
                    {currentStep.interdictions.map((interd, idx) => (
                      <p key={idx}>✕ {interd}</p>
                    ))}
                  </div>
                )}

                {currentStep.details && (
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 text-xs text-[#0F766E] dark:text-teal-300">
                    <p className="leading-relaxed">{currentStep.details}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Medical Contacts */}
          <div className="p-4 rounded-2xl bg-card-subtle border border-soft flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#0F766E] dark:text-teal-400 shrink-0" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">
                  Numéro d'urgence ESSP / Hôpital
                </span>
                <p className="font-semibold text-main text-xs sm:text-sm">{contactUrgence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-card-subtle border-t border-soft flex items-center justify-between text-xs text-sub shrink-0">
          <button
            onClick={handlePrint}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-card border border-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-main font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer la fiche</span>
          </button>
          <button
            onClick={onClose}
            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold transition text-xs"
          >
            Compris / Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
