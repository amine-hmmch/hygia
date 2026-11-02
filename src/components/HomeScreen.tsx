import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Building2,
  Trash2,
  BarChart3,
  ArrowRight,
  AlertOctagon,
  BookOpen,
  ChevronRight,
  ChefHat,
  Plus,
  Layers,
  Play,
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
  onOpenCuisine: () => void;
  onOpenUrgenceAes: () => void;
  onOpenGlossaire: () => void;
  onOpenTableauDeBord: () => void;
  onOpenAPropos?: () => void;
  onNewAudit: (version?: 'courte' | 'exhaustive', defaultService?: string) => void;
  onViewAudit: (auditId: string) => void;
  onOpenComingSoon: (topic: ComingSoonTopic) => void;
  onOpenActions: () => void;
}

/** Ligne de liste : icône, titre, description, indicateur à droite. */
const Row: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  meta?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ icon, title, desc, meta, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`row-rule w-full min-h-[64px] py-3 flex items-center gap-4 text-start transition ${
      disabled ? 'cursor-default' : 'active:bg-card-subtle'
    }`}
  >
    <span className={`w-6 h-6 shrink-0 flex items-center justify-center ${disabled ? 'text-sub' : 'text-primary'}`}>{icon}</span>
    <span className="min-w-0 flex-1">
      <span className={`block text-[15px] font-medium leading-snug ${disabled ? 'text-sub' : 'text-main'}`}>{title}</span>
      <span className="block text-[13px] text-sub leading-snug truncate">{desc}</span>
    </span>
    {meta && <span className="font-mono text-xs text-sub shrink-0">{meta}</span>}
    {!disabled && <ChevronRight className="w-4 h-4 text-muted-custom shrink-0" />}
  </button>
);

const SectionTitle: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({
  children,
  right,
}) => (
  <div className="flex items-baseline justify-between pb-2 border-b border-medium">
    <h3 className="label-caps">{children}</h3>
    {right}
  </div>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({
  audits,
  actions,
  onOpenChecklists,
  onOpenFiches,
  onOpenSterilisation,
  onOpenDechets,
  onOpenCuisine,
  onOpenUrgenceAes,
  onOpenGlossaire,
  onOpenTableauDeBord,
  onNewAudit,
}) => {
  const [reminders, setReminders] = useState<ServiceAuditReminder[]>(() =>
    storageService.getAuditReminders()
  );

  const refreshReminders = () => setReminders(storageService.getAuditReminders());

  useEffect(() => {
    refreshReminders();
  }, [audits]);

  const handlePeriodicityChange = (service: string, periodicite: PeriodiciteAudit) => {
    storageService.setServicePeriodicity(service, periodicite);
    refreshReminders();
  };

  const totalAudits = audits.length;
  const pendingActions = actions.filter((a) => a.statut === 'a_faire' || a.statut === 'en_cours');
  const latestAudit = audits.length > 0 ? audits[0] : null;
  const hasScore = totalAudits > 0;
  const currentScore = latestAudit
    ? latestAudit.scoreGlobal
    : hasScore
    ? Math.round(audits.reduce((acc, curr) => acc + curr.scoreGlobal, 0) / totalAudits)
    : 0;

  const sterilisationCountThisMonth = useMemo(() => {
    try {
      const month = new Date().toISOString().slice(0, 7);
      return storageService.getSterilisationCycles().filter((c) => c.date.startsWith(month)).length;
    } catch {
      return 0;
    }
  }, []);

  const dechetsKgThisMonth = useMemo(() => {
    try {
      const month = new Date().toISOString().slice(0, 7);
      return storageService
        .getDechetsPesees()
        .filter((p: any) => p.date.startsWith(month))
        .reduce((sum: number, p: any) => sum + (Number(p.poidsKg) || 0), 0)
        .toFixed(1)
        .replace('.', ',');
    } catch {
      return '0,0';
    }
  }, []);

  const frenchDate = useMemo(
    () =>
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const latestAuditRelativeTime = useMemo(() => {
    if (!latestAudit) return '';
    const a = new Date(latestAudit.date);
    const t = new Date();
    a.setHours(0, 0, 0, 0);
    t.setHours(0, 0, 0, 0);
    const d = Math.round((t.getTime() - a.getTime()) / 86400000);
    if (d <= 0) return "aujourd'hui";
    if (d === 1) return 'hier';
    return `il y a ${d} jours`;
  }, [latestAudit]);

  const criteriaSummary = useMemo(() => {
    if (!latestAudit) return '';
    const total = Object.keys(latestAudit.responses).length;
    const ok = Object.values(latestAudit.responses).filter((r) => r.value === 'oui').length;
    return `${ok} critères conformes sur ${total || 27}`;
  }, [latestAudit]);

  const settings = storageService.getSettings();
  const etablissementName = settings.etablissement?.trim();
  const userName = settings.userName?.trim();

  const scoreColor = !hasScore
    ? 'text-muted-custom'
    : currentScore >= 80
    ? 'text-success'
    : currentScore >= 50
    ? 'text-warning'
    : 'text-danger';

  const fmtDate = (iso?: string) =>
    iso ? iso.split('-').reverse().join('/') : '';

  const lateCount = reminders.filter((r) => r.statut === 'en_retard').length;
  const dueCount = reminders.filter((r) => r.statut === 'a_faire').length;

  return (
    <div className="space-y-7 pb-6">
      {/* Salutation */}
      <section>
        <p className="label-caps">
          {frenchDate}
          {etablissementName ? ` · ${etablissementName}` : ''}
        </p>
        <h2 className="text-[28px] leading-tight font-semibold text-main mt-1.5">
          {userName ? `Bonjour, ${userName}` : 'Bonjour'}
        </h2>
      </section>

      {/* Score */}
      <section>
        <div className="border-y border-soft py-5">
          <p className="label-caps whitespace-nowrap">Conformité globale</p>
          {latestAudit ? (
            <div className="flex items-end justify-between gap-4 mt-2.5">
              <p className={`font-mono font-medium leading-none ${scoreColor}`}>
                <span className="text-[56px]">{currentScore}</span>
                <span className="text-2xl ms-0.5 text-sub">%</span>
              </p>
              <div className="text-end text-[13px] text-sub leading-snug max-w-[58%]">
                <p className="text-main font-medium">{latestAudit.service}</p>
                <p>{criteriaSummary}</p>
                <p>Audit {latestAuditRelativeTime}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 mt-2.5">
              <p className="font-mono font-medium leading-none text-muted-custom text-[56px]">—</p>
              <p className="text-[13px] text-sub leading-snug">
                Aucun audit réalisé. Lancez-en un pour obtenir votre premier score.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={() => onNewAudit('courte')}
            className="min-h-[48px] rounded-lg bg-primary hover:bg-primary-hover text-white dark:text-[#10201a] font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.2} />
            Audit rapide
          </button>
          <button
            onClick={() => onNewAudit('exhaustive')}
            className="min-h-[48px] rounded-lg border border-medium text-main font-medium text-[15px] flex items-center justify-center gap-2 active:bg-card-subtle transition"
          >
            <Layers className="w-[18px] h-[18px] text-sub" />
            Audit complet
          </button>
        </div>
      </section>

      {/* Urgence */}
      <section>
        <button
          onClick={onOpenUrgenceAes}
          className="w-full min-h-[60px] rounded-lg border border-danger-soft bg-danger-tint text-danger px-4 py-3 flex items-center gap-3.5 text-start active:scale-[0.99] transition"
        >
          <AlertOctagon className="w-6 h-6 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold leading-snug">Urgence AES</span>
            <span className="block text-[13px] leading-snug opacity-90">
              Conduite à tenir après exposition au sang
            </span>
          </span>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </button>
      </section>

      {/* Soins */}
      <section>
        <SectionTitle>Soins</SectionTitle>
        <div>
          <Row
            icon={<ClipboardCheck className="w-[22px] h-[22px]" strokeWidth={1.7} />}
            title="Audits et check-lists"
            desc="Version rapide ou complète, score en direct"
            meta={totalAudits > 0 ? `${totalAudits}` : undefined}
            onClick={onOpenChecklists}
          />
          <Row
            icon={<Building2 className="w-[22px] h-[22px]" strokeWidth={1.7} />}
            title="Hygiène des locaux"
            desc="Zones à risque, bio-nettoyage, dilutions"
            onClick={() => onOpenFiches('locaux')}
          />
          <Row
            icon={<HygieneMainsIcon size={22} />}
            title="Hygiène des mains et EPI"
            desc="Indications, friction, gants, masques"
            onClick={() => onOpenFiches('mains')}
          />
          <Row
            icon={<SterilisationIcon size={22} />}
            title="Stérilisation"
            desc="Phases, contrôles et traçabilité des cycles"
            meta={sterilisationCountThisMonth > 0 ? `${sterilisationCountThisMonth} ce mois` : undefined}
            onClick={onOpenSterilisation}
          />
          <Row
            icon={<Trash2 className="w-[22px] h-[22px]" strokeWidth={1.7} />}
            title="Déchets de soins"
            desc="Guide de tri, pesées, évolution mensuelle"
            meta={dechetsKgThisMonth !== '0,0' ? `${dechetsKgThisMonth} kg` : undefined}
            onClick={onOpenDechets}
          />
          <Row
            icon={<BarChart3 className="w-[22px] h-[22px]" strokeWidth={1.7} />}
            title="Tableau de bord et rapports"
            desc="Scores par composante, rapport mensuel en PDF"
            meta={pendingActions.length > 0 ? `${pendingActions.length} actions` : undefined}
            onClick={onOpenTableauDeBord}
          />
          <Row
            icon={<BookOpen className="w-[22px] h-[22px]" strokeWidth={1.7} />}
            title="Glossaire"
            desc="Définitions des termes d'hygiène"
            onClick={onOpenGlossaire}
          />
        </div>
      </section>

      {/* Restauration */}
      <section>
        <SectionTitle>Restauration</SectionTitle>
        <div>
          <Row
            icon={<ChefHat className="w-[22px] h-[22px]" strokeWidth={1.7} />}
            title="Cuisine et restauration"
            desc="Relevés de température, audit HACCP, fiches"
            onClick={onOpenCuisine}
          />
        </div>
      </section>

      {/* À planifier */}
      <section>
        <SectionTitle
          right={
            <span className="text-xs text-sub">
              {lateCount > 0 && <span className="text-danger font-medium">{lateCount} en retard</span>}
              {lateCount > 0 && dueCount > 0 && ' · '}
              {dueCount > 0 && `${dueCount} à faire`}
            </span>
          }
        >
          À planifier
        </SectionTitle>

        <div>
          {reminders.slice(0, 5).map((rem) => {
            const isRetard = rem.statut === 'en_retard';
            const isAFaire = rem.statut === 'a_faire';
            const status = isRetard
              ? 'En retard'
              : isAFaire
              ? rem.derniereDateAudit
                ? 'À faire'
                : 'Premier audit'
              : 'À jour';
            const statusColor = isRetard ? 'text-danger' : isAFaire ? 'text-warning' : 'text-success';

            return (
              <div key={rem.service} className="row-rule py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="text-[15px] font-medium text-main truncate">{rem.service}</h4>
                  <span className={`text-xs font-medium shrink-0 ${statusColor}`}>{status}</span>
                </div>
                <p className="text-[13px] text-sub mt-0.5">
                  Dernier : {rem.derniereDateAudit ? fmtDate(rem.derniereDateAudit) : 'aucun'}
                  {rem.dernierScore !== undefined && ` (${rem.dernierScore} %)`} · échéance{' '}
                  {fmtDate(rem.prochaineDateAudit)}
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <select
                    value={rem.periodicite}
                    onChange={(e) =>
                      handlePeriodicityChange(rem.service, e.target.value as PeriodiciteAudit)
                    }
                    className="flex-1 min-h-[40px] text-[13px] px-2.5 rounded-lg bg-card border border-soft text-main focus:outline-none focus:border-primary"
                    aria-label={`Fréquence d'audit : ${rem.service}`}
                  >
                    <option value="hebdomadaire">Chaque semaine</option>
                    <option value="bimensuelle">Tous les 15 jours</option>
                    <option value="mensuelle">Chaque mois</option>
                    <option value="trimestrielle">Chaque trimestre</option>
                  </select>
                  <button
                    onClick={() => onNewAudit('courte', rem.service)}
                    className="min-h-[40px] px-4 rounded-lg border border-primary text-primary font-medium text-[13px] flex items-center gap-1.5 active:bg-primary-tint transition"
                    aria-label={`Lancer un audit pour ${rem.service}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Lancer
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
