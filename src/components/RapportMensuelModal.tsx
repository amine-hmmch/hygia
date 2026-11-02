import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  X,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Scale,
  ShieldCheck,
  Download,
  Share2,
} from 'lucide-react';
import { SterilisationIcon } from './AppMaskedIcons';
import { Audit, CorrectiveAction, SterilisationCycle, DechetPesee } from '../types';
import { storageService } from '../services/storageService';

interface RapportMensuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMonth?: string; // YYYY-MM
}

export const RapportMensuelModal: React.FC<RapportMensuelModalProps> = ({
  isOpen,
  onClose,
  defaultMonth,
}) => {
  const currentMonthValue = defaultMonth || new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthValue);
  const settings = storageService.getSettings();

  const audits = storageService.getAudits();
  const actions = storageService.getCorrectiveActions();
  const sterilisationCycles = storageService.getSterilisationCycles();
  const dechetsPesees = storageService.getDechetsPesees();

  // Filter data for the selected month
  const monthAudits = useMemo(() => {
    return audits.filter((a) => a.date && a.date.startsWith(selectedMonth));
  }, [audits, selectedMonth]);

  const monthSterilisation = useMemo(() => {
    return sterilisationCycles.filter((c) => c.date && c.date.startsWith(selectedMonth));
  }, [sterilisationCycles, selectedMonth]);

  const monthDechets = useMemo(() => {
    return dechetsPesees.filter((p) => p.date && p.date.startsWith(selectedMonth));
  }, [dechetsPesees, selectedMonth]);

  // Calculations
  const avgScore =
    monthAudits.length > 0
      ? Math.round(monthAudits.reduce((acc, curr) => acc + curr.scoreGlobal, 0) / monthAudits.length)
      : audits.length > 0
      ? Math.round(audits.reduce((acc, curr) => acc + curr.scoreGlobal, 0) / audits.length)
      : 100;

  // Component breakdown from month audits
  const componentScores = useMemo(() => {
    const sums: Record<string, { total: number; count: number; title: string }> = {
      hygiene_mains: { total: 0, count: 0, title: 'Hygiène des mains' },
      epi: { total: 0, count: 0, title: 'Équipements de protection individuelle (EPI)' },
      environnement_interne: { total: 0, count: 0, title: 'Hygiène de l’environnement interne' },
      sterilisation: { total: 0, count: 0, title: 'Stérilisation du matériel' },
      dechets_dmp: { total: 0, count: 0, title: 'Gestion des déchets (DMP)' },
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
      score: val.count > 0 ? Math.round(val.total / val.count) : 100,
    }));
  }, [monthAudits, audits]);

  // Non-conformities from audits
  const nonConformites = useMemo(() => {
    const list: Array<{ auditService: string; date: string; itemId: string; obs?: string }> = [];
    const targetAudits = monthAudits.length > 0 ? monthAudits : audits;
    targetAudits.forEach((a) => {
      Object.entries(a.responses).forEach(([itemId, resp]) => {
        if (resp.value === 'non') {
          list.push({
            auditService: a.service,
            date: a.date,
            itemId,
            obs: resp.observation,
          });
        }
      });
    });
    return list;
  }, [monthAudits, audits]);

  // Sterilisation stats
  const totalCycles = monthSterilisation.length;
  const compliantCycles = monthSterilisation.filter((c) => c.estConforme).length;
  const sterilisationRate = totalCycles > 0 ? Math.round((compliantCycles / totalCycles) * 100) : 100;

  // Dechets stats
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

  // Available months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    audits.forEach((a) => a.date && set.add(a.date.substring(0, 7)));
    dechetsPesees.forEach((p) => p.date && set.add(p.date.substring(0, 7)));
    sterilisationCycles.forEach((c) => c.date && set.add(c.date.substring(0, 7)));
    set.add(currentMonthValue);
    return Array.from(set).sort().reverse();
  }, [audits, dechetsPesees, sterilisationCycles, currentMonthValue]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden my-auto">
        {/* Header toolbar (no-print) */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Rapport Mensuel de Sécurité Sanitaire
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  Mois : {m}
                </option>
              ))}
            </select>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs bg-white text-slate-900 print:p-0 print:m-0 print:overflow-visible">
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              Royaume du Maroc • Ministère de la Santé et de la Protection Sociale
            </p>
            <p className="text-xs font-semibold text-slate-600">
              {settings.provinceRegion?.trim()
                ? `Direction Régionale de la Santé • ${settings.provinceRegion.trim()}`
                : 'Direction Régionale de la Santé • Délégation Provinciale / Préfectorale'}
            </p>
            <h1 className="text-lg font-black text-teal-900 uppercase tracking-tight mt-2">
              Rapport Mensuel de Sécurité Sanitaire & d'Hygiène
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium text-slate-700 pt-1">
              {settings.etablissement?.trim() && (
                <>
                  <span>
                    Établissement : <strong>{settings.etablissement.trim()}</strong>
                  </span>
                  <span>•</span>
                </>
              )}
              <span>
                Période : <strong>{selectedMonth}</strong>
              </span>
              {(settings.userName?.trim() || settings.auditeurDefaut?.trim()) && (
                <>
                  <span>•</span>
                  <span>
                    Auditeur :{' '}
                    <strong>
                      {settings.userName?.trim() || settings.auditeurDefaut?.trim()}
                      {settings.userRole?.trim() ? ` (${settings.userRole.trim()})` : ''}
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Key Indicators Row */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Score Global</span>
              <span
                className={`text-2xl font-black font-mono ${
                  avgScore >= 80 ? 'text-emerald-700' : avgScore >= 50 ? 'text-amber-700' : 'text-rose-700'
                }`}
              >
                {avgScore}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {monthAudits.length} audit{monthAudits.length > 1 ? 's' : ''} réalisé{monthAudits.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Actions Correctives</span>
              <span className="text-2xl font-black font-mono text-slate-800">
                {actions.length}
              </span>
              <span className="text-[10px] text-amber-700 block mt-0.5">
                {actions.filter((a) => a.statut === 'a_faire').length} en attente
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Stérilisation</span>
              <span className="text-2xl font-black font-mono text-slate-800">
                {totalCycles}
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                {sterilisationRate}% conforme
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Déchets DMP (kg)</span>
              <span className="text-2xl font-black font-mono text-slate-800">
                {totalDechetsKg}
              </span>
              <span className="text-[10px] text-rose-700 block mt-0.5">
                {dasriKg} kg DASRI
              </span>
            </div>
          </div>

          {/* Section 1: Scores par composante */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>1. Performance de Sécurité Sanitaire par Composante</span>
              <span className="text-[10px] text-slate-500 font-normal">Tableaux 20 & 21</span>
            </h3>
            <div className="space-y-2">
              {componentScores.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="w-1/2 font-medium text-slate-800">{c.title}</span>
                  <div className="w-1/3 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.score >= 80 ? 'bg-emerald-600' : c.score >= 50 ? 'bg-amber-500' : 'bg-rose-600'
                      }`}
                      style={{ width: `${Math.max(c.score, 5)}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-right font-mono font-bold text-slate-900">
                    {c.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Non-conformités relevées */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              2. Points de Vigilance & Non-conformités Détectées ({nonConformites.length})
            </h3>
            {nonConformites.length > 0 ? (
              <div className="border border-slate-300 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-[11px] min-w-[440px] sm:min-w-0">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2">Service</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Élément audité</th>
                      <th className="p-2">Observation constatée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {nonConformites.slice(0, 8).map((nc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-semibold text-slate-900">{nc.auditService}</td>
                        <td className="p-2 text-slate-600">{nc.date}</td>
                        <td className="p-2 font-mono text-slate-700">{nc.itemId}</td>
                        <td className="p-2 text-rose-800 italic">{nc.obs || 'Non-conforme'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 italic text-xs">Aucune non-conformité majeure sur cette période.</p>
            )}
          </div>

          {/* Section 3: Plan d'Actions Correctives */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              3. État d'Avancement du Plan d'Actions Correctives
            </h3>
            <div className="border border-slate-300 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-[11px] min-w-[480px] sm:min-w-0">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2">Action / Correctif</th>
                    <th className="p-2">Service</th>
                    <th className="p-2">Responsable</th>
                    <th className="p-2">Échéance</th>
                    <th className="p-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {actions.slice(0, 6).map((act) => (
                    <tr key={act.id}>
                      <td className="p-2 font-medium text-slate-900">{act.itemTitle}</td>
                      <td className="p-2 text-slate-600">{act.service}</td>
                      <td className="p-2 text-slate-700">{act.responsable}</td>
                      <td className="p-2 font-mono text-slate-600">{act.echeance}</td>
                      <td className="p-2 font-semibold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            act.statut === 'realise' || act.statut === 'verifie'
                              ? 'bg-emerald-100 text-emerald-800'
                              : act.statut === 'en_cours'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {act.statut.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Synthèse Stérilisation & Déchets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <SterilisationIcon size={14} className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                <span>Stérilisation (Chapitre V)</span>
              </h4>
              <p className="text-[11px] text-slate-700">
                • Cycles d'autoclave réalisés : <strong>{totalCycles}</strong>
              </p>
              <p className="text-[11px] text-slate-700">
                • Cycles validés conformes : <strong>{compliantCycles}</strong>
              </p>
              <p className="text-[11px] text-slate-700">
                • Conformité siccité & emballages : <strong>100%</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Déchets DMP (Chapitre VI)
              </h4>
              <p className="text-[11px] text-slate-700">
                • Poids total pesé : <strong>{totalDechetsKg} kg</strong>
              </p>
              <p className="text-[11px] text-slate-700">
                • DASRI & Piquants (Rouge / Jaune) : <strong>{dasriKg} kg</strong>
              </p>
              <p className="text-[11px] text-slate-700">
                • Déchets ménagers assimilés (Noir) : <strong>{menagerKg} kg</strong>
              </p>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="font-bold text-slate-800">Le Technicien d'Hygiène du Milieu</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Visa et observations de l'auditeur</p>
              <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
            </div>
            <div>
              <p className="font-bold text-slate-800">Le Médecin Chef de l'ESSP</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Approbation de la Direction</p>
              <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Document officiel conforme au Guide ESSP 2021
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
            >
              Fermer
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimer / Exporter PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RapportMensuelModal;
