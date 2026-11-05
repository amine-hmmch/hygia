import React, { useState } from 'react';
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const initial = storageService.getSettings();
  const dejaInscrit = storageService.hasCompletedOnboarding();
  const [etablissementName, setEtablissementName] = useState(initial.etablissement || '');
  const [userName, setUserName] = useState(initial.userName || '');
  const [userRole, setUserRole] = useState(initial.userRole || '');
  const complet = !!etablissementName.trim() && !!userName.trim() && !!userRole.trim();

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complet) return;
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


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#1C1F1D] border border-slate-200 dark:border-[#2D322E] rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-slate-100 relative my-auto">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-[#1F5A43] dark:text-teal-400 flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6" />
        </div>

        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {dejaInscrit ? 'Complète ton profil' : 'Bienvenue'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
          Ces trois informations sont obligatoires : elles apparaissent sur tes rapports et tes audits.
        </p>

        <form onSubmit={handleSave} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Nom de votre établissement <span className="text-danger" aria-hidden="true">*</span> :
            </label>
            <input
              type="text"
              autoFocus
              required
              aria-label="Établissement"
              value={etablissementName}
              onChange={(e) => setEtablissementName(e.target.value)}
              placeholder="Ex : Centre de Santé Urbain, Clinique..."
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#232724] border border-slate-200 dark:border-[#2D322E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#1F5A43] focus:ring-1 focus:ring-[#1F5A43]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Votre nom <span className="text-danger" aria-hidden="true">*</span> :
              </label>
              <input
                type="text"
                required
                aria-label="Votre nom"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex : Dr. Bennani"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#232724] border border-slate-200 dark:border-[#2D322E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#1F5A43]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fonction ou spécialité <span className="text-danger" aria-hidden="true">*</span> :
              </label>
              <input
                type="text"
                required
                aria-label="Fonction ou spécialité"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                placeholder="Ex : Technicien d'hygiène du milieu"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#232724] border border-slate-200 dark:border-[#2D322E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#1F5A43]"
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center gap-2 sm:justify-end">
            <button
              type="submit"
              disabled={!complet}
              className="disabled:opacity-40 w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl bg-[#1F5A43] hover:bg-[#174835] active:scale-95 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2D322E]/60 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1F5A43] shrink-0" />
          <span>Données enregistrées exclusivement en local sur votre appareil.</span>
        </div>
      </div>
    </div>
  );
};
