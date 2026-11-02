import React, { useState } from 'react';
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [etablissementName, setEtablissementName] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const current = storageService.getSettings();
    storageService.saveSettings({
      ...current,
      etablissement: etablissementName.trim(),
      userName: userName.trim(),
      userRole: userRole.trim(),
      auditeurDefaut: userRole.trim() || current.auditeurDefaut,
    });
    storageService.setOnboardingCompleted();
    onComplete();
  };

  const handleSkip = () => {
    storageService.setOnboardingCompleted();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#12202A] border border-slate-200 dark:border-[#1E3342] rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-slate-100 relative my-auto">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400 flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6" />
        </div>

        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bienvenue
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
          Indiquez le nom de votre établissement de soins pour personnaliser l'application et vos rapports d'audit.
        </p>

        <form onSubmit={handleSave} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Nom de votre établissement :
            </label>
            <input
              type="text"
              autoFocus
              value={etablissementName}
              onChange={(e) => setEtablissementName(e.target.value)}
              placeholder="Ex : Centre de Santé Urbain, Clinique..."
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#172B38] border border-slate-200 dark:border-[#1E3342] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Votre nom <span className="font-normal text-slate-400">(facultatif)</span> :
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex : Dr. Bennani"
                className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#172B38] border border-slate-200 dark:border-[#1E3342] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#0F766E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Votre fonction <span className="font-normal text-slate-400">(facultatif)</span> :
              </label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                placeholder="Ex : Technicien d'hygiène"
                className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#172B38] border border-slate-200 dark:border-[#1E3342] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172B38] text-xs font-semibold transition text-center"
            >
              Passer
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E3342]/60 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
          <span>Données enregistrées exclusivement en local sur votre appareil.</span>
        </div>
      </div>
    </div>
  );
};
