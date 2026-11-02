import React from 'react';
import {
  Info,
  X,
  ShieldCheck,
  BookOpen,
  WifiOff,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Award,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { storageService } from '../services/storageService';

interface AProposModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AProposModal: React.FC<AProposModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const auditsCount = storageService.getAudits().length;
  const actionsCount = storageService.getCorrectiveActions().length;
  const cyclesCount = storageService.getSterilisationCycles().length;
  const dechetsCount = storageService.getDechetsPesees().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-card border border-soft rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-floating text-main overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] px-4 sm:px-6 py-4 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  ESSP Maroc
                </span>
                <span className="text-[10px] text-teal-100 font-semibold">v1.2.0</span>
              </div>
              <h2 className="font-heading text-base sm:text-lg font-bold tracking-tight leading-tight mt-0.5 truncate">
                À propos de l'application
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* MANDATORY OFFICIAL NOTICE BANNER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-800 shadow-soft space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-[11px] uppercase font-bold tracking-wider">
                Avertissement Légal & Réglementaire
              </span>
            </div>
            <p className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              « Outil d'aide basé sur le Guide du Professionnel – Sécurité Sanitaire des ESSP (Ministère de la Santé, 2021). Ne remplace pas le guide officiel. »
            </p>
            <p className="text-xs text-sub leading-relaxed">
              Cette application mobile a été conçue pour accompagner sur le terrain les techniciens d'hygiène du milieu, médecins chefs et infirmiers des Établissements de Soins de Santé Primaires (centres de santé ruraux et urbains, dispensaires, maternités) du Royaume du Maroc.
            </p>
          </div>

          {/* Privacy & 100% Offline Technical Guarantees */}
          <div className="rounded-2xl p-4 sm:p-5 bg-card-subtle border border-soft space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0F766E] dark:text-teal-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Garanties Techniques & Confidentialité</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-card border border-soft space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  <span>100% Hors-Ligne (PWA)</span>
                </div>
                <p className="text-xs text-sub leading-normal">
                  Grâce au Service Worker et au cache complet, l'application fonctionne sans aucun accès au réseau Internet.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-soft space-y-1">
                <div className="flex items-center gap-1.5 text-[#0F766E] dark:text-teal-400 font-bold text-xs">
                  <Database className="w-4 h-4 shrink-0" />
                  <span>Stockage Local Strict</span>
                </div>
                <p className="text-xs text-sub leading-normal">
                  Aucun serveur externe, aucune API tierce ni clé API. Vos audits et données restent exclusivement sur votre appareil.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-soft space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Zéro Donnée Patient</span>
                </div>
                <p className="text-xs text-sub leading-normal">
                  Seuls les indicateurs de sécurité d'infrastructure, de matériel et de processus sont enregistrés.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-soft space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Sauvegarde & Export JSON</span>
                </div>
                <p className="text-xs text-sub leading-normal">
                  Exportez ou importez vos données à tout moment pour les archiver ou les partager entre confrères.
                </p>
              </div>
            </div>
          </div>

          {/* Guide Modules & Standards */}
          <div className="rounded-2xl p-4 sm:p-5 bg-card border border-soft space-y-3 shadow-soft">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0F766E] dark:text-teal-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Contenu Conforme au Guide ESSP 2021</span>
            </h3>

            <div className="space-y-2 text-xs text-sub leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-main">Tableaux 20 & 21 (Chapitre VII) :</strong> Check-lists d'audit courte (23 items) et exhaustive (43 items) avec calcul automatique des scores.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-main">Urgence AES (Section 1.10) :</strong> Protocole d'action immédiate, minuteur d'asepsie de 5 min et orientation &lt; 4h.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-main">Hygiène des Locaux (Chapitre II) :</strong> Zonage 1, 2 et 3, bio-nettoyage et calculateur de dilution d'eau de Javel.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-main">Mains & EPI (Chapitres III & IV) :</strong> Les 5 indications OMS, friction hydro-alcoolique et masques de protection.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-main">Stérilisation (Chapitre V) :</strong> 9 étapes, validation autoclave à vapeur 134°C / 125°C, Bowie-Dick et registre traçable.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-main">Déchets DMP (Chapitre VI) :</strong> Tri selon la loi 28-00, pesées en kg, sacs couleur et graphique mensuel.</p>
              </div>
            </div>
          </div>

          {/* Local State KPI */}
          <div className="p-4 rounded-2xl bg-card-subtle border border-soft flex items-center justify-between gap-2 text-center">
            <div>
              <span className="text-[11px] text-sub uppercase font-semibold block">Audits</span>
              <span className="text-base font-bold text-[#0F766E] dark:text-teal-400 font-mono">{auditsCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-[11px] text-sub uppercase font-semibold block">Actions</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">{actionsCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-[11px] text-sub uppercase font-semibold block">Cycles Stéri.</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">{cyclesCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-[11px] text-sub uppercase font-semibold block">Pesées DMP</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">{dechetsCount}</span>
            </div>
          </div>

          {/* Quick Install CTA */}
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-main">Installation PWA</h4>
              <p className="text-xs text-sub">Installez l'outil sur l'écran d'accueil pour un accès instantané.</p>
            </div>
            <PWAInstallButton compact={false} label="Installer" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-card-subtle border-t border-soft flex items-center justify-between text-xs text-sub shrink-0">
          <span>Ministère de la Santé du Maroc • 2021</span>
          <button
            onClick={onClose}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-card border border-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-main font-bold transition text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
