import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Scale,
  Printer,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { SterilisationIcon } from './AppMaskedIcons';
import { Audit, CorrectiveAction, SterilisationCycle, DechetPesee } from '../types';
import { storageService } from '../services/storageService';
import { RapportMensuelModal } from './RapportMensuelModal';

interface TableauDeBordModuleProps {
  onBackToHome: () => void;
  onOpenChecklists: () => void;
  onOpenSterilisation: () => void;
  onOpenDechets: () => void;
  onOpenActions: () => void;
}

export const TableauDeBordModule: React.FC<TableauDeBordModuleProps> = ({
  onBackToHome,
  onOpenChecklists,
  onOpenSterilisation,
  onOpenDechets,
  onOpenActions,
}) => {
  const [showRapportModal, setShowRapportModal] = useState(false);
  const todayStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(todayStr);

  const audits = storageService.getAudits();
  const actions = storageService.getCorrectiveActions();
  const sterilisationCycles = storageService.getSterilisationCycles();
  const dechetsPesees = storageService.getDechetsPesees();
  const settings = storageService.getSettings();

  // Filtered by selected month
  const monthAudits = useMemo(() => {
    return audits.filter((a) => a.date && a.date.startsWith(selectedMonth));
  }, [audits, selectedMonth]);

  const monthCycles = useMemo(() => {
    return sterilisationCycles.filter((c) => c.date && c.date.startsWith(selectedMonth));
  }, [sterilisationCycles, selectedMonth]);

  const monthDechets = useMemo(() => {
    return dechetsPesees.filter((p) => p.date && p.date.startsWith(selectedMonth));
  }, [dechetsPesees, selectedMonth]);

  // Scores
  const globalScore =
    monthAudits.length > 0
      ? Math.round(monthAudits.reduce((acc, curr) => acc + curr.scoreGlobal, 0) / monthAudits.length)
      : audits.length > 0
      ? Math.round(audits.reduce((acc, curr) => acc + curr.scoreGlobal, 0) / audits.length)
      : 100;

  // Component score breakdown
  const componentScores = useMemo(() => {
    const sums: Record<
      string,
      { total: number; count: number; title: string; color: string }
    > = {
      hygiene_mains: { total: 0, count: 0, title: 'Hygiène des mains', color: 'teal' },
      epi: { total: 0, count: 0, title: 'Équipements de protection (EPI)', color: 'emerald' },
      environnement_interne: { total: 0, count: 0, title: 'Environnement & Locaux', color: 'cyan' },
      sterilisation: { total: 0, count: 0, title: 'Stérilisation du matériel', color: 'rose' },
      dechets_dmp: { total: 0, count: 0, title: 'Gestion des Déchets (DMP)', color: 'amber' },
    };

    const targetAudits = monthAudits.length > 0 ? monthAudits : audits;

    targetAudits.forEach((a) => {
      if (a.scoresParComposante) {
        Object.entries(a.scoresParComposante).forEach(([compKey, compData]) => {
          if (sums[compKey]) {
            sums[compKey].total += compData.score;
            sums[compKey].count += 1;
          }
        });
      }
    });

    return Object.entries(sums).map(([id, val]) => ({
      id,
      title: val.title,
      color: val.color,
      score: val.count > 0 ? Math.round(val.total / val.count) : 100,
    }));
  }, [monthAudits, audits]);

  // Actions breakdown
  const actionsEnRetard = actions.filter((a) => {
    if (a.statut === 'realise' || a.statut === 'verifie') return false;
    const today = new Date().toISOString().split('T')[0];
    return a.echeance < today;
  });

  const actionsEnCours = actions.filter((a) => a.statut === 'en_cours');
  const actionsAFaire = actions.filter((a) => a.statut === 'a_faire');
  const actionsSoldees = actions.filter((a) => a.statut === 'realise' || a.statut === 'verifie');

  // Dechets breakdown
  const totalDechetsKg = Number(
    monthDechets.reduce((acc, curr) => acc + (curr.poidsKg || 0), 0).toFixed(2)
  );
  const dasriKg = Number(
    monthDechets
      .filter((p) => p.categorie === 'cat1_infectieux' || p.categorie === 'cat1_tranchant')
      .reduce((acc, curr) => acc + (curr.poidsKg || 0), 0)
      .toFixed(2)
  );
  const menagerKg = Number(
    monthDechets
      .filter((p) => p.categorie === 'cat4_menager')
      .reduce((acc, curr) => acc + (curr.poidsKg || 0), 0)
      .toFixed(2)
  );

  // Sterilisation
  const totalSterilisationCount = monthCycles.length;
  const compliantSterilisationCount = monthCycles.filter((c) => c.estConforme).length;
  const tauxConformiteSterilisation =
    totalSterilisationCount > 0
      ? Math.round((compliantSterilisationCount / totalSterilisationCount) * 100)
      : 100;

  // Monthly audits evolution (group by month)
  const evolutionMensuelle = useMemo(() => {
    const monthlyMap: Record<string, { totalScore: number; count: number }> = {};
    audits.forEach((a) => {
      const m = a.date.substring(0, 7);
      if (!monthlyMap[m]) {
        monthlyMap[m] = { totalScore: 0, count: 0 };
      }
      monthlyMap[m].totalScore += a.scoreGlobal;
      monthlyMap[m].count += 1;
    });

    return Object.entries(monthlyMap)
      .map(([mois, val]) => ({
        mois,
        scoreMoyen: Math.round(val.totalScore / val.count),
        count: val.count,
      }))
      .sort((a, b) => a.mois.localeCompare(b.mois));
  }, [audits]);

  return (
    <div className="min-h-screen bg-surface text-main pb-24 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#12202A]/95 backdrop-blur-md border-b border-soft shadow-soft">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 -ms-2 rounded-xl text-sub hover:bg-card-subtle transition-colors"
              aria-label="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-600 flex items-center justify-center text-white shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading text-base font-bold text-main leading-tight">
                  Tableau de Bord Sanitaire
                </h1>
                <p className="text-xs text-sub font-medium">{settings.etablissement}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRapportModal(true)}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Rapport PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5 text-xs">
        {/* Month selector & Global score banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">
                Performance Globale ESSP
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">
                Synthèse de la Sécurité Sanitaire
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Mois analysé :</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* KPI 1: Score Global */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Score Global d'audit
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-3xl font-black font-mono ${
                    globalScore >= 80 ? 'text-emerald-400' : globalScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {globalScore}%
                </span>
                <CheckCircle2
                  className={`w-5 h-5 ${
                    globalScore >= 80 ? 'text-emerald-400' : globalScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {monthAudits.length} audit{monthAudits.length > 1 ? 's' : ''} ce mois
              </p>
            </div>

            {/* KPI 2: Actions Correctives */}
            <div
              onClick={onOpenActions}
              className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left cursor-pointer hover:border-amber-500/60 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Actions en retard</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-black font-mono text-rose-400 mt-1">
                {actionsEnRetard.length}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {actionsAFaire.length} à faire • {actionsSoldees.length} soldées
              </p>
            </div>

            {/* KPI 3: Stérilisation */}
            <div
              onClick={onOpenSterilisation}
              className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left cursor-pointer hover:border-teal-500/60 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Stérilisation</span>
                <SterilisationIcon size={16} className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-3xl font-black font-mono text-white mt-1">
                {totalSterilisationCount}
              </div>
              <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                {tauxConformiteSterilisation}% cycles conformes
              </p>
            </div>

            {/* KPI 4: Déchets DMP */}
            <div
              onClick={onOpenDechets}
              className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left cursor-pointer hover:border-amber-500/60 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Déchets pesés</span>
                <Scale className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black font-mono text-white mt-1">
                {totalDechetsKg} <span className="text-xs font-bold text-slate-400">kg</span>
              </div>
              <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                {dasriKg} kg DASRI / Piquants
              </p>
            </div>
          </div>
        </div>

        {/* Component Scores Breakdown */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              Conformité par Composante d'Audit (Tableaux 20 & 21)
            </h3>
            <button
              onClick={onOpenChecklists}
              className="text-[11px] text-teal-400 hover:underline font-semibold"
            >
              Voir les audits
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {componentScores.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{c.title}</span>
                  <span
                    className={`font-mono font-bold ${
                      c.score >= 80 ? 'text-emerald-400' : c.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {c.score}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      c.score >= 80
                        ? 'bg-emerald-500'
                        : c.score >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(c.score, 4)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolution Mensuelle des Audits */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Évolution Mensuelle des Scores d'Audit
          </h3>

          {evolutionMensuelle.length > 0 ? (
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {evolutionMensuelle.map((ev) => (
                  <div
                    key={ev.mois}
                    className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center"
                  >
                    <span className="text-[11px] font-bold text-slate-400 block">{ev.mois}</span>
                    <span
                      className={`text-2xl font-black font-mono block mt-1 ${
                        ev.scoreMoyen >= 80
                          ? 'text-emerald-400'
                          : ev.scoreMoyen >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {ev.scoreMoyen}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {ev.count} audit{ev.count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">Aucun historique mensuel enregistré.</p>
          )}
        </div>

        {/* Detailed modules summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Actions Correctives card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Actions Correctives ({actions.length})
              </h4>
              <button
                onClick={onOpenActions}
                className="text-[11px] text-teal-400 hover:underline font-semibold"
              >
                Gérer
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50">
                <span className="text-lg font-black text-rose-400 font-mono">
                  {actionsEnRetard.length}
                </span>
                <p className="text-[10px] text-rose-300 font-bold">En retard</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50">
                <span className="text-lg font-black text-amber-400 font-mono">
                  {actionsEnCours.length + actionsAFaire.length}
                </span>
                <p className="text-[10px] text-amber-300 font-bold">En cours</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {actionsSoldees.length}
                </span>
                <p className="text-[10px] text-emerald-300 font-bold">Soldées</p>
              </div>
            </div>

            {actionsEnRetard.length > 0 && (
              <div className="p-2.5 bg-rose-900/30 border border-rose-600/40 rounded-xl space-y-1">
                <p className="text-[11px] font-bold text-rose-300">
                  Urgences à régulariser en priorité :
                </p>
                {actionsEnRetard.slice(0, 2).map((a) => (
                  <p key={a.id} className="text-[11px] text-rose-200 truncate">
                    • <strong>{a.service} :</strong> {a.itemTitle}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Stérilisation & Déchets summary card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Traçabilité Opérationnelle du Mois
            </h4>

            <div className="space-y-2 text-xs">
              <div
                onClick={onOpenSterilisation}
                className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between cursor-pointer hover:border-slate-600 transition"
              >
                <div className="flex items-center gap-2">
                  <SterilisationIcon size={16} className="w-4 h-4 text-teal-400" />
                  <div>
                    <p className="font-semibold text-slate-200">Stérilisation (Autoclave B)</p>
                    <p className="text-[10px] text-slate-400">
                      {compliantSterilisationCount} conformes sur {totalSterilisationCount} cycles
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>

              <div
                onClick={onOpenDechets}
                className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between cursor-pointer hover:border-slate-600 transition"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-semibold text-slate-200">Filière Déchets (DMP)</p>
                    <p className="text-[10px] text-slate-400">
                      Total {totalDechetsKg} kg ({dasriKg} kg DASRI • {menagerKg} kg noir)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Rapport Mensuel */}
      <RapportMensuelModal
        isOpen={showRapportModal}
        onClose={() => setShowRapportModal(false)}
        defaultMonth={selectedMonth}
      />
    </div>
  );
};
export default TableauDeBordModule;
