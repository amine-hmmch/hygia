import React, { useState } from 'react';
import {
  Printer,
  Edit3,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  AlertTriangle,
  Building,
  Calendar,
  User,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Audit } from '../types';
import { getChecklist, getAllItemsForVersion } from '../data/checklistsData';
import { storageService } from '../services/storageService';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';

interface AuditDetailViewProps {
  audit: Audit;
  onBack: () => void;
  onEdit: (audit: Audit) => void;
  onDelete: (auditId: string) => void;
}

export const AuditDetailView: React.FC<AuditDetailViewProps> = ({
  audit,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const template = getChecklist(audit.version);
  const allItems = getAllItemsForVersion(audit.version);

  // Get actions linked to this audit
  const allActions = storageService.getCorrectiveActions();
  const linkedActions = allActions.filter((a) => a.auditId === audit.id);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export single audit as JSON
  const handleExportAuditJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(audit, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Audit_${audit.service.replace(/\s+/g, '_')}_${audit.date}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Fichier JSON téléchargé', 'success');
  };

  const handleConfirmDelete = () => {
    onDelete(audit.id);
    showToast('Audit supprimé avec succès', 'info');
  };

  // SVG Gauge calculations
  const gaugeRadius = 38;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const strokeDashoffset = gaugeCircumference - (audit.scoreGlobal / 100) * gaugeCircumference;

  return (
    <div className="space-y-6 pb-24">
      {/* Action Header (hidden in print) */}
      <div className="no-print flex items-center justify-between gap-2.5 flex-wrap pb-2 border-b border-soft">
        <button
          onClick={onBack}
          className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-soft hover:bg-card-subtle text-sub hover:text-main font-semibold text-xs sm:text-sm transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retour aux audits</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditJson}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-soft hover:bg-card-subtle text-sub hover:text-main font-semibold text-xs transition"
            title="Télécharger les données en JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline">JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
            title="Imprimer ou enregistrer le rapport officiel en PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Rapport PDF</span>
          </button>

          <button
            onClick={() => onEdit(audit)}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-[#0F766E]/30 text-[#0F766E] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 font-semibold text-xs transition active:scale-95"
            title="Modifier cet audit"
          >
            <Edit3 className="w-4 h-4" />
            <span>Modifier</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="min-h-[44px] p-2.5 rounded-xl bg-card border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition active:scale-95"
            title="Supprimer cet audit"
            aria-label="Supprimer cet audit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Report Wrapper */}
      <div className="print-container bg-surface print:bg-white text-main print:text-black space-y-6">
        {/* Official Header */}
        <div className="text-center pb-4 border-b-2 border-[#0F766E] print:border-black space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#0F766E] print:text-teal-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] print:text-teal-800">
              Royaume du Maroc — Ministère de la Santé
            </span>
          </div>
          <h2 className="font-heading text-lg sm:text-2xl font-bold text-main print:text-black tracking-tight uppercase">
            Rapport d'Audit de Sécurité Sanitaire des ESSP
          </h2>
          <p className="text-xs text-sub print:text-gray-600 font-medium">
            Guide du Professionnel (2021) — {template.tableauNumero} ({template.version === 'courte' ? 'Version courte' : 'Version exhaustive'})
          </p>
        </div>

        {/* Audit Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-2xl bg-card print:bg-gray-100 border border-soft print:border-gray-300 text-xs shadow-soft">
          <div>
            <span className="text-[11px] uppercase font-bold text-sub print:text-gray-500 block">
              Service Audité
            </span>
            <span className="font-heading font-bold text-sm sm:text-base text-[#0F766E] dark:text-teal-400 print:text-teal-900 block mt-0.5">
              {audit.service}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-bold text-sub print:text-gray-500 block">
              Date de réalisation
            </span>
            <span className="font-bold text-main print:text-gray-900 block mt-0.5 text-xs sm:text-sm">
              {audit.date} {audit.heure ? `à ${audit.heure}` : ''}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-bold text-sub print:text-gray-500 block">
              Auditeur (Technicien)
            </span>
            <span className="font-bold text-main print:text-gray-900 block mt-0.5 text-xs sm:text-sm">
              {audit.auditeur || 'Technicien d’hygiène'}
            </span>
          </div>

          {audit.etablissement?.trim() || storageService.getSettings().etablissement?.trim() ? (
            <div>
              <span className="text-[11px] uppercase font-bold text-sub print:text-gray-500 block">
                Établissement
              </span>
              <span className="font-bold text-main print:text-gray-900 block mt-0.5 text-xs sm:text-sm">
                {audit.etablissement?.trim() || storageService.getSettings().etablissement?.trim()}
              </span>
            </div>
          ) : null}
        </div>

        {/* Hero Score Ring & Summary Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card print:bg-white border border-soft print:border-gray-400 shadow-soft">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Score Ring */}
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    className={
                      audit.scoreGlobal >= 80
                        ? 'stroke-emerald-500'
                        : audit.scoreGlobal >= 50
                        ? 'stroke-amber-500'
                        : 'stroke-rose-500'
                    }
                    strokeWidth="8"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-2xl font-black text-main print:text-black">
                    {audit.scoreGlobal}%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sub print:text-gray-600">
                  Conformité Globale
                </span>
                <h3 className="font-heading text-lg font-bold text-main print:text-black mt-0.5">
                  {audit.scoreGlobal >= 80
                    ? 'Conforme aux standards ESSP'
                    : audit.scoreGlobal >= 50
                    ? 'Conformité partielle (vigilance)'
                    : 'Non conforme aux normes'}
                </h3>
                <p className="text-xs text-sub mt-1">
                  Évaluation basée sur les règles d'hygiène du Ministère de la Santé (2021)
                </p>
              </div>
            </div>

            {/* Quick Count Badges */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs shrink-0">
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 print:bg-gray-100 border border-emerald-200 dark:border-emerald-800/60 text-center">
                <span className="block text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold">
                  Conformes
                </span>
                <span className="font-heading font-bold text-lg text-emerald-600 dark:text-emerald-400 print:text-emerald-800">
                  {audit.totalOui}
                </span>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 print:bg-gray-100 border border-rose-200 dark:border-rose-800/60 text-center">
                <span className="block text-[10px] text-rose-800 dark:text-rose-300 uppercase font-bold">
                  Non-conf.
                </span>
                <span className="font-heading font-bold text-lg text-rose-600 dark:text-rose-400 print:text-rose-800">
                  {audit.totalNon}
                </span>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-card-subtle print:bg-gray-100 border border-soft text-center">
                <span className="block text-[10px] text-sub print:text-gray-500 uppercase font-bold">
                  N/A
                </span>
                <span className="font-heading font-bold text-lg text-sub print:text-gray-700">
                  {audit.totalNa}
                </span>
              </div>
            </div>
          </div>

          {/* Scores by Component Miniature Progress Bars */}
          <div className="mt-5 pt-5 border-t border-soft print:border-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {template.composantes.map((comp) => {
              const compScore = audit.scoresParComposante[comp.id];
              if (!compScore) return null;
              return (
                <div
                  key={comp.id}
                  className="p-3 rounded-xl bg-card-subtle/80 print:bg-gray-50 border border-soft print:border-gray-200"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-main print:text-gray-800 truncate mr-2">
                      {comp.titre}
                    </span>
                    <span
                      className={`font-bold ${
                        compScore.score >= 80
                          ? 'text-emerald-600 dark:text-emerald-400 print:text-emerald-800'
                          : compScore.score >= 50
                          ? 'text-amber-600 dark:text-amber-400 print:text-amber-800'
                          : 'text-rose-600 dark:text-rose-400 print:text-rose-800'
                      }`}
                    >
                      {compScore.score}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 print:bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        compScore.score >= 80
                          ? 'bg-emerald-500'
                          : compScore.score >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${compScore.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-sub print:text-gray-500 mt-1.5">
                    <span>{compScore.ouiCount} conformes</span>
                    <span>{compScore.nonCount} non conformes</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan d'Actions Correctives (Non-Conformités) */}
        {linkedActions.length > 0 && (
          <div className="rounded-2xl p-5 bg-card print:bg-white border border-rose-300 dark:border-rose-900/60 print:border-gray-400 space-y-3.5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm sm:text-base font-bold text-rose-700 dark:text-rose-300 print:text-rose-800 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Plan d'Actions Correctives ({linkedActions.length} non-conformités)</span>
              </h3>
              <span className="text-xs text-sub print:text-gray-500 font-medium">
                Générées automatiquement
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-soft print:border-gray-300 text-[11px] font-bold text-sub print:text-gray-600 uppercase">
                    <th className="py-2.5 pe-3">Point d'audit</th>
                    <th className="py-2.5 px-3">Description / Action</th>
                    <th className="py-2.5 px-3">Responsable</th>
                    <th className="py-2.5 px-3">Échéance</th>
                    <th className="py-2.5 ps-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft print:divide-gray-200">
                  {linkedActions.map((action) => (
                    <tr key={action.id} className="text-xs">
                      <td className="py-3 pe-3 font-semibold text-main print:text-black">
                        {action.itemTitle}
                      </td>
                      <td className="py-3 px-3 text-sub print:text-gray-700">
                        {action.description}
                      </td>
                      <td className="py-3 px-3 font-medium text-sub print:text-gray-700 whitespace-nowrap">
                        {action.responsable}
                      </td>
                      <td className="py-3 px-3 font-medium text-sub print:text-gray-700 whitespace-nowrap">
                        {action.echeance}
                      </td>
                      <td className="py-3 ps-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            action.statut === 'realise' || action.statut === 'verifie'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                              : action.statut === 'en_cours'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300'
                          }`}
                        >
                          {action.statut.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Item Breakdown */}
        <div className="rounded-2xl p-5 bg-card print:bg-white border border-soft print:border-gray-300 space-y-4 shadow-soft">
          <h3 className="font-heading text-sm sm:text-base font-bold text-main print:text-black uppercase tracking-wider">
            Détail Complet de l'Évaluation
          </h3>

          <div className="space-y-4">
            {template.composantes.map((comp) => {
              const compItems: { id: string; titre: string; sousCategorie?: string }[] = [];
              if (comp.items) {
                comp.items.forEach((i) => compItems.push(i));
              }
              if (comp.sousCategories) {
                comp.sousCategories.forEach((sc) =>
                  sc.items.forEach((i) => compItems.push({ ...i, sousCategorie: sc.titre }))
                );
              }

              return (
                <div
                  key={comp.id}
                  className="rounded-xl border border-soft print:border-gray-200 p-4 bg-card-subtle/50 print:bg-white print-card"
                >
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#0F766E] dark:text-teal-400 print:text-teal-900 uppercase tracking-wide mb-2.5">
                    {comp.titre}
                  </h4>

                  <div className="divide-y divide-soft print:divide-gray-200">
                    {compItems.map((item) => {
                      const resp = audit.responses[item.id] || {
                        itemId: item.id,
                        value: null,
                        observation: '',
                      };
                      return (
                        <div
                          key={item.id}
                          className="py-2.5 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            {item.sousCategorie && (
                              <span className="text-[10px] text-sub print:text-gray-500 block mb-0.5 font-medium">
                                {item.sousCategorie}
                              </span>
                            )}
                            <p className="font-medium text-main print:text-gray-900">
                              {item.titre}
                            </p>
                            {resp.observation && (
                              <p className="text-[11px] text-sub print:text-gray-600 italic mt-0.5">
                                Constat : {resp.observation}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            {resp.value === 'oui' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300 print:text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 print:bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] border border-emerald-300 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Oui</span>
                              </span>
                            ) : resp.value === 'non' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-rose-800 dark:text-rose-300 print:text-rose-700 bg-rose-100 dark:bg-rose-950/80 print:bg-rose-50 px-2.5 py-1 rounded-full text-[11px] border border-rose-300 dark:border-rose-800">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Non</span>
                              </span>
                            ) : resp.value === 'na' ? (
                              <span className="inline-flex items-center gap-1 text-sub print:text-gray-600 bg-card-subtle print:bg-gray-100 px-2.5 py-1 rounded-full text-[11px] border border-soft">
                                <MinusCircle className="w-3.5 h-3.5" />
                                <span>N/A</span>
                              </span>
                            ) : (
                              <span className="text-sub italic text-[11px]">Non évalué</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* General Comments */}
        {audit.commentairesGeneraux && (
          <div className="p-4 sm:p-5 rounded-2xl bg-card print:bg-white border border-soft print:border-gray-300 text-xs shadow-soft">
            <h4 className="font-bold text-sub print:text-gray-700 uppercase tracking-wider text-[11px] mb-1.5">
              Observations & Recommandations de l'Auditeur
            </h4>
            <p className="text-main print:text-black italic leading-relaxed text-sm">
              « {audit.commentairesGeneraux} »
            </p>
          </div>
        )}

        {/* Signatures Block for Official Print */}
        <div className="pt-6 border-t border-soft print:border-gray-400 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="font-bold text-main print:text-black">
              Visa du Technicien d'Hygiène
            </p>
            <div className="h-16 border-b border-dashed border-soft print:border-gray-400 mt-2" />
            <p className="text-[11px] text-sub print:text-gray-500 mt-1">
              {audit.auditeur || 'Technicien d’hygiène'}
            </p>
          </div>

          <div>
            <p className="font-bold text-main print:text-black">
              Visa du Responsable du Service / ESSP
            </p>
            <div className="h-16 border-b border-dashed border-soft print:border-gray-400 mt-2" />
            <p className="text-[11px] text-sub print:text-gray-500 mt-1">
              Service : {audit.service}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Supprimer cet audit ?"
        message={`Cette action est irréversible. L'audit du service « ${audit.service} » du ${audit.date} ainsi que ses actions correctives associées seront définitivement supprimés.`}
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
