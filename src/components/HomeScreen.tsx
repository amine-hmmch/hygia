import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Sparkles,
  Building2,
  Trash2,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertOctagon,
  BookOpen,
  Bell,
  Clock,
  ChevronRight,
  Play,
  Layers,
} from 'lucide-react';
import { HygieneMainsIcon, SterilisationIcon } from './AppMaskedIcons';
import { Audit, CorrectiveAction, PeriodiciteAudit, ServiceAuditReminder } from '../types';
import { ComingSoonTopic } from './ComingSoonModal';
import { storageService } from '../services/storageService';

interface HomeScreenProps {
  audits: Audit[];
  actions: CorrectiveAction[];
  onOpenChecklists: () => void;
  onOpenFiches: (category?: 'all' | 'mains' | 'epi' | 'locaux' | 'favoris' | 'tableaux') => void;
  onOpenSterilisation: () => void;
  onOpenDechets: () => void;
  onOpenUrgenceAes: () => void;
  onOpenGlossaire: () => void;
  onOpenTableauDeBord: () => void;
  onOpenAPropos?: () => void;
  onNewAudit: (version?: 'courte' | 'exhaustive', defaultService?: string) => void;
  onViewAudit: (auditId: string) => void;
  onOpenComingSoon: (topic: ComingSoonTopic) => void;
  onOpenActions: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  audits,
  actions,
  onOpenChecklists,
  onOpenFiches,
  onOpenSterilisation,
  onOpenDechets,
  onOpenUrgenceAes,
  onOpenGlossaire,
  onOpenTableauDeBord,
  onOpenAPropos,
  onNewAudit,
  onViewAudit,
  onOpenComingSoon,
  onOpenActions,
}) => {
  const [reminders, setReminders] = useState<ServiceAuditReminder[]>(() =>
    storageService.getAuditReminders()
  );

  const refreshReminders = () => {
    setReminders(storageService.getAuditReminders());
  };

  useEffect(() => {
    refreshReminders();
  }, [audits]);

  const handlePeriodicityChange = (service: string, periodicite: PeriodiciteAudit) => {
    storageService.setServicePeriodicity(service, periodicite);
    refreshReminders();
  };

  // Calculations
  const totalAudits = audits.length;
  const pendingActions = actions.filter((a) => a.statut === 'a_faire' || a.statut === 'en_cours');
  const latestAudit = audits.length > 0 ? audits[0] : null;

  const currentScore = latestAudit
    ? latestAudit.scoreGlobal
    : totalAudits > 0
    ? Math.round(audits.reduce((acc, curr) => acc + curr.scoreGlobal, 0) / totalAudits)
    : 0;
  const hasScore = totalAudits > 0;

  // Sterilisation cycles this month
  const sterilisationCountThisMonth = useMemo(() => {
    try {
      const cycles = storageService.getSterilisationCycles();
      const currentMonth = new Date().toISOString().slice(0, 7);
      return cycles.filter((c) => c.date.startsWith(currentMonth)).length;
    } catch {
      return 0;
    }
  }, []);

  // Déchets kg this month
  const dechetsKgThisMonth = useMemo(() => {
    try {
      const pesees = storageService.getDechetsPesees();
      const currentMonth = new Date().toISOString().slice(0, 7);
      return pesees
        .filter((p: any) => p.date.startsWith(currentMonth))
        .reduce((sum: number, p: any) => sum + (Number(p.poidsKg) || 0), 0)
        .toFixed(1);
    } catch {
      return '0.0';
    }
  }, []);

  // Format dynamic French Date
  const frenchDate = useMemo(() => {
    const now = new Date();
    const str = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  // Relative time for latest audit
  const latestAuditRelativeTime = useMemo(() => {
    if (!latestAudit) return "Aucun audit réalisé";
    const auditDate = new Date(latestAudit.date);
    const today = new Date();
    auditDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - auditDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  }, [latestAudit]);

  // Conformance summary text
  const criteriaSummary = useMemo(() => {
    if (!latestAudit) return "Prêt pour votre première évaluation";
    const totalCrit = Object.keys(latestAudit.responses).length;
    const conformes = Object.values(latestAudit.responses).filter((r) => r.value === 'oui').length;
    return `${conformes}/${totalCrit || 27} critères conformes`;
  }, [latestAudit]);

  // SVG Gauge calculations
  const gaugeRadius = 42;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const strokeDashoffset = gaugeCircumference - (currentScore / 100) * gaugeCircumference;

  const settings = storageService.getSettings();
  const etablissementName = settings.etablissement?.trim();
  const userName = settings.userName?.trim();

  return (
    <div className="space-y-6 pb-8">
      {/* 1. GREETING & CONTEXT HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div>
          <div className="flex items-center gap-2 text-sub text-xs sm:text-sm font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400 shrink-0" />
            <span>{frenchDate}</span>
            {etablissementName ? (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {etablissementName}
                </span>
              </>
            ) : null}
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-main mt-0.5 tracking-tight">
            {userName ? `Bonjour, ${userName}` : 'Bonjour'}
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onOpenGlossaire}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#12202A] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E3342] shadow-soft hover:bg-slate-50 dark:hover:bg-[#172B38] transition flex items-center gap-2 text-xs font-semibold active:scale-95"
            title="Consulter le glossaire du guide ESSP"
          >
            <BookOpen className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
            <span>Glossaire</span>
          </button>
        </div>
      </section>

      {/* 2. STATUS HERO CARD WITH CIRCULAR COMPLIANCE GAUGE */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] via-[#0E6C65] to-[#115E59] text-white p-5 sm:p-6 shadow-floating border border-teal-500/20">
        <div className="absolute -end-12 -top-12 w-48 h-48 rounded-full bg-teal-300/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left: Summary and Action */}
          <div className="flex-1 text-center md:text-start space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-teal-50 text-xs font-semibold border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conformité Sécurité Sanitaire ESSP</span>
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white leading-tight">
              {latestAudit
                ? `Dernier audit : ${latestAudit.service}`
                : "Évaluation de la sécurité sanitaire"}
            </h3>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-teal-100">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                {criteriaSummary}
              </span>
              <span className="opacity-60">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-amber-200" />
                {latestAuditRelativeTime}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <button
                onClick={() => onNewAudit('courte')}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md shadow-amber-900/20 transition active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Nouvel audit rapide (Tab. 20)</span>
              </button>

              <button
                onClick={() => onNewAudit('exhaustive')}
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs border border-white/25 transition active:scale-95 flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Complet (Tab. 21)</span>
              </button>
            </div>
          </div>

          {/* Right: Circular Compliance SVG Gauge */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={gaugeRadius}
                  className="stroke-white/20"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={gaugeRadius}
                  className={`${
                    !hasScore
                      ? 'stroke-white/0'
                      : currentScore >= 80
                      ? 'stroke-emerald-300'
                      : currentScore >= 50
                      ? 'stroke-amber-300'
                      : 'stroke-rose-300'
                  } transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-heading text-3xl font-extrabold tracking-tight text-white leading-none">
                  {hasScore ? `${currentScore}%` : '—'}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-100 mt-1">
                  {!hasScore ? 'Aucun audit' : currentScore >= 80 ? 'Conforme' : currentScore >= 50 ? 'Améliorable' : 'Critique'}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-teal-100/90 mt-2 font-medium">
              Score global actuel
            </span>
          </div>
        </div>
      </section>

      {/* 3. PROMINENT ELEGANT RED URGENCE AES BUTTON */}
      <section>
        <button
          onClick={onOpenUrgenceAes}
          className="w-full min-h-[58px] p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 active:scale-[0.99] text-white shadow-md shadow-rose-900/20 border border-red-400/40 transition-all flex items-center justify-between gap-3 text-start group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-700 flex items-center justify-center shadow shrink-0 group-hover:scale-105 transition">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 font-mono">
                  SECTION 1.10
                </span>
                <span className="text-xs font-semibold text-rose-100">
                  Minuteur 5 min Dakin / Javel
                </span>
              </div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                URGENCE AES – Conduite à tenir immédiate
              </h3>
              <p className="text-xs text-rose-100/90 truncate hidden xs:block">
                Ne pas faire saigner • Nettoyer & tremper • Prophylaxie antirétrovirale sous 4h
              </p>
            </div>
          </div>

          <div className="shrink-0 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition">
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition" />
          </div>
        </button>
      </section>

      {/* 4. MODULE GRID (2 COLUMNS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base sm:text-lg font-bold text-main">
            Domaines de Sécurité Sanitaire
          </h3>
          <span className="text-xs text-sub font-medium">Guide Officiel 2021</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Check-lists */}
          <button
            onClick={onOpenChecklists}
            className="min-h-[110px] p-4 sm:p-5 rounded-2xl bg-card border border-soft shadow-soft hover:shadow-hover hover:border-[#0F766E]/40 transition text-start flex items-start justify-between gap-3 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <ClipboardCheck className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                    {totalAudits} {totalAudits === 1 ? 'audit' : 'audits'} réalisés
                  </span>
                </div>
                <h4 className="font-heading text-base font-bold text-main group-hover:text-[#0F766E] dark:group-hover:text-teal-300 transition">
                  Check-lists d'audit
                </h4>
                <p className="text-xs text-sub mt-0.5 line-clamp-1">
                  Tableaux 20 (court) & 21 (exhaustif) avec notation en direct
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F766E] dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition shrink-0 mt-3" />
          </button>

          {/* Card 2: Hygiène des locaux */}
          <button
            onClick={() => onOpenFiches('locaux')}
            className="min-h-[110px] p-4 sm:p-5 rounded-2xl bg-card border border-soft shadow-soft hover:shadow-hover hover:border-emerald-500/40 transition text-start flex items-start justify-between gap-3 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    5 fiches pratiques
                  </span>
                </div>
                <h4 className="font-heading text-base font-bold text-main group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  Hygiène des locaux
                </h4>
                <p className="text-xs text-sub mt-0.5 line-clamp-1">
                  Zonage 1-2-3, bio-nettoyage, dilutions Javel & périodicités
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0 mt-3" />
          </button>

          {/* Card 3: Hygiène des mains & EPI */}
          <button
            onClick={() => onOpenFiches('mains')}
            className="min-h-[110px] p-4 sm:p-5 rounded-2xl bg-card border border-soft shadow-soft hover:shadow-hover hover:border-[#0F766E]/40 transition text-start flex items-start justify-between gap-3 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <HygieneMainsIcon size={28} className="w-7 h-7 text-[#0F766E] dark:text-teal-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                    8 fiches pratiques
                  </span>
                </div>
                <h4 className="font-heading text-base font-bold text-main group-hover:text-[#0F766E] dark:group-hover:text-teal-300 transition">
                  Hygiène mains & EPI
                </h4>
                <p className="text-xs text-sub mt-0.5 line-clamp-1">
                  5 indications OMS, friction SHA 30s, masques FFP & gants
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F766E] dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition shrink-0 mt-3" />
          </button>

          {/* Card 4: Stérilisation */}
          <button
            onClick={onOpenSterilisation}
            className="min-h-[110px] p-4 sm:p-5 rounded-2xl bg-card border border-soft shadow-soft hover:shadow-hover hover:border-[#0F766E]/40 transition text-start flex items-start justify-between gap-3 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <SterilisationIcon size={28} className="w-7 h-7 text-[#0F766E] dark:text-teal-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                    {sterilisationCountThisMonth} cycles ce mois
                  </span>
                </div>
                <h4 className="font-heading text-base font-bold text-main group-hover:text-[#0F766E] dark:group-hover:text-teal-300 transition">
                  Stérilisation
                </h4>
                <p className="text-xs text-sub mt-0.5 line-clamp-1">
                  9 phases de chaîne, autoclave 134°C, Bowie-Dick & registre
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F766E] dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition shrink-0 mt-3" />
          </button>

          {/* Card 5: Déchets (DMP) */}
          <button
            onClick={onOpenDechets}
            className="min-h-[110px] p-4 sm:p-5 rounded-2xl bg-card border border-soft shadow-soft hover:shadow-hover hover:border-amber-500/40 transition text-start flex items-start justify-between gap-3 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                    {dechetsKgThisMonth} kg pesés ce mois
                  </span>
                </div>
                <h4 className="font-heading text-base font-bold text-main group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  Déchets de soins (DMP)
                </h4>
                <p className="text-xs text-sub mt-0.5 line-clamp-1">
                  Guide de tri interactif, code couleur, pesées & graphique
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0 mt-3" />
          </button>

          {/* Card 6: Tableau de bord */}
          <button
            onClick={onOpenTableauDeBord}
            className="min-h-[110px] p-4 sm:p-5 rounded-2xl bg-card border border-soft shadow-soft hover:shadow-hover hover:border-[#0F766E]/40 transition text-start flex items-start justify-between gap-3 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                    {pendingActions.length} {pendingActions.length === 1 ? 'action en attente' : 'actions en attente'}
                  </span>
                </div>
                <h4 className="font-heading text-base font-bold text-main group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  Tableau de bord
                </h4>
                <p className="text-xs text-sub mt-0.5 line-clamp-1">
                  Scores par composante, synthèse et rapport PDF officiel
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0 mt-3" />
          </button>
        </div>
      </section>

      {/* 5. REMINDERS SECTION (RAPPELS D'AUDIT PAR SERVICE) */}
      <section className="rounded-2xl bg-card border border-soft p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-soft pb-3">
          <div>
            <h3 className="font-heading text-base font-bold text-main flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              <span>Rappels d'audit par service</span>
            </h3>
            <p className="text-xs text-sub mt-0.5">
              Planification selon la périodicité réglementaire du niveau de risque infectieux
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            {reminders.filter((r) => r.statut === 'en_retard').length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800/60">
                {reminders.filter((r) => r.statut === 'en_retard').length} en retard
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#172B38] text-slate-700 dark:text-slate-300 font-medium border border-soft">
              {reminders.filter((r) => r.statut === 'a_faire').length} à faire sous 3j
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {reminders.slice(0, 5).map((rem) => {
            const isRetard = rem.statut === 'en_retard';
            const isAFaire = rem.statut === 'a_faire';

            return (
              <div
                key={rem.service}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isRetard
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                    : isAFaire
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                    : 'bg-card-subtle/50 border-soft hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isRetard
                          ? 'bg-rose-600 text-white'
                          : isAFaire
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                      }`}
                    >
                      {isRetard ? 'En retard' : isAFaire ? (rem.derniereDateAudit ? 'À faire sous 3j' : 'Premier audit à faire') : 'À jour'}
                    </span>
                    <h4 className="font-heading text-sm font-bold text-main truncate">
                      {rem.service}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-sub flex-wrap">
                    <span>
                      Dernier audit :{' '}
                      <strong className="text-main font-semibold">
                        {rem.derniereDateAudit || 'Aucun'}
                      </strong>
                      {rem.dernierScore !== undefined && (
                        <span
                          className={`ms-1.5 font-bold ${
                            rem.dernierScore >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : rem.dernierScore >= 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          ({rem.dernierScore}%)
                        </span>
                      )}
                    </span>
                    <span className="opacity-40">•</span>
                    <span>
                      Échéance :{' '}
                      <strong className="text-main font-semibold">{rem.prochaineDateAudit}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <select
                    value={rem.periodicite}
                    onChange={(e) =>
                      handlePeriodicityChange(rem.service, e.target.value as PeriodiciteAudit)
                    }
                    className="min-h-[44px] text-xs px-2.5 py-1.5 rounded-xl bg-card border border-soft text-main focus:outline-none focus:border-[#0F766E]"
                    title="Changer la fréquence"
                  >
                    <option value="hebdomadaire">Hebdo (7j)</option>
                    <option value="bimensuelle">Bimensuel (14j)</option>
                    <option value="mensuelle">Mensuel (30j)</option>
                    <option value="trimestrielle">Trimestriel (90j)</option>
                  </select>

                  <button
                    onClick={() => onNewAudit('courte', rem.service)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                    title={`Lancer un audit pour ${rem.service}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Lancer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
