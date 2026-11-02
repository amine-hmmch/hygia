import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Edit3,
  Trash2,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Audit, ChecklistVersion } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';

interface AuditHistoryProps {
  audits: Audit[];
  onNewAudit: (version?: ChecklistVersion) => void;
  onViewAudit: (auditId: string) => void;
  onEditAudit: (audit: Audit) => void;
  onDeleteAudit: (auditId: string) => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({
  audits,
  onNewAudit,
  onViewAudit,
  onEditAudit,
  onDeleteAudit,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [versionFilter, setVersionFilter] = useState<'all' | 'courte' | 'exhaustive'>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'conforme' | 'vigilance' | 'alerte'>('all');

  // Deletion modal state
  const [auditToDelete, setAuditToDelete] = useState<Audit | null>(null);

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        audit.service.toLowerCase().includes(q) ||
        audit.titre.toLowerCase().includes(q) ||
        audit.date.includes(q) ||
        (audit.auditeur && audit.auditeur.toLowerCase().includes(q));

      // Version filter
      const matchVersion = versionFilter === 'all' || audit.version === versionFilter;

      // Score filter
      let matchScore = true;
      if (scoreFilter === 'conforme') matchScore = audit.scoreGlobal >= 80;
      else if (scoreFilter === 'vigilance')
        matchScore = audit.scoreGlobal >= 50 && audit.scoreGlobal < 80;
      else if (scoreFilter === 'alerte') matchScore = audit.scoreGlobal < 50;

      return matchSearch && matchVersion && matchScore;
    });
  }, [audits, searchQuery, versionFilter, scoreFilter]);

  const handleConfirmDelete = () => {
    if (auditToDelete) {
      onDeleteAudit(auditToDelete.id);
      showToast('Audit supprimé avec succès', 'info');
      setAuditToDelete(null);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-main tracking-tight">
            Historique des Audits
          </h2>
          <p className="text-xs sm:text-sm text-sub mt-0.5">
            {audits.length} {audits.length === 1 ? 'audit enregistré' : 'audits enregistrés'} dans votre appareil
          </p>
        </div>

        <button
          onClick={() => onNewAudit()}
          className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Audit</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-card border border-soft shadow-soft space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par service, date, auditeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] text-xs sm:text-sm ps-10 pe-4 py-2.5 rounded-xl bg-card-subtle border border-soft text-main placeholder-slate-400 focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {/* Version Pills */}
          <div className="flex items-center bg-card-subtle rounded-xl p-1 border border-soft shrink-0">
            <button
              onClick={() => setVersionFilter('all')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                versionFilter === 'all'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-sub hover:text-main'
              }`}
            >
              Tous ({audits.length})
            </button>
            <button
              onClick={() => setVersionFilter('courte')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                versionFilter === 'courte'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-sub hover:text-main'
              }`}
            >
              Tab. 20 (Court)
            </button>
            <button
              onClick={() => setVersionFilter('exhaustive')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                versionFilter === 'exhaustive'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-sub hover:text-main'
              }`}
            >
              Tab. 21 (Complet)
            </button>
          </div>

          {/* Score Range Pills */}
          <div className="flex items-center bg-card-subtle rounded-xl p-1 border border-soft shrink-0">
            <button
              onClick={() => setScoreFilter('all')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                scoreFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-sub hover:text-main'
              }`}
            >
              Tous scores
            </button>
            <button
              onClick={() => setScoreFilter('conforme')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                scoreFilter === 'conforme'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:text-main'
              }`}
            >
              ≥ 80% (Conforme)
            </button>
            <button
              onClick={() => setScoreFilter('vigilance')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                scoreFilter === 'vigilance'
                  ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:text-main'
              }`}
            >
              50-79% (Vigilance)
            </button>
            <button
              onClick={() => setScoreFilter('alerte')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                scoreFilter === 'alerte'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-400 hover:text-main'
              }`}
            >
              &lt; 50% (Alerte)
            </button>
          </div>
        </div>
      </div>

      {/* Audits List */}
      {filteredAudits.length === 0 ? (
        <div className="rounded-2xl p-8 bg-card border border-soft text-center space-y-3 shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-card-subtle flex items-center justify-center mx-auto text-sub">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-bold text-main text-base">Aucun audit trouvé</h4>
          <p className="text-xs text-sub max-w-xs mx-auto">
            {searchQuery || versionFilter !== 'all' || scoreFilter !== 'all'
              ? 'Aucun enregistrement ne correspond aux filtres sélectionnés.'
              : 'Commencez par réaliser votre premier audit de sécurité sanitaire.'}
          </p>
          <button
            onClick={() => onNewAudit()}
            className="min-h-[44px] px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition"
          >
            Démarrer un audit maintenant
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAudits.map((audit) => {
            const isConforme = audit.scoreGlobal >= 80;
            const isVigilance = audit.scoreGlobal >= 50 && audit.scoreGlobal < 80;

            return (
              <div
                key={audit.id}
                className="rounded-2xl p-4 sm:p-5 bg-card border border-soft hover:border-slate-300 dark:hover:border-slate-700 transition shadow-soft space-y-3.5 group"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                        {audit.version === 'courte' ? 'Tableau 20 (Court)' : 'Tableau 21 (Complet)'}
                      </span>
                      <span className="text-xs text-sub flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{audit.date}</span>
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base sm:text-lg text-main mt-1 truncate">
                      {audit.service}
                    </h3>

                    {audit.auditeur && (
                      <p className="text-xs text-sub mt-0.5">Auditeur : {audit.auditeur}</p>
                    )}
                  </div>

                  {/* Score Badge */}
                  <div className="shrink-0 text-end">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-heading font-bold text-sm shadow-xs border ${
                        isConforme
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : isVigilance
                          ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {isConforme ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : isVigilance ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      )}
                      <span>{audit.scoreGlobal}%</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Line */}
                <div className="flex items-center gap-3 pt-2.5 border-t border-soft text-xs text-sub">
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                    <strong className="font-bold">{audit.totalOui}</strong> conformes
                  </span>
                  <span className="opacity-40">•</span>
                  <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
                    <strong className="font-bold">{audit.totalNon}</strong> non-conformités
                  </span>
                  {audit.totalNa > 0 && (
                    <>
                      <span className="opacity-40">•</span>
                      <span className="text-sub font-medium">{audit.totalNa} N/A</span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onViewAudit(audit.id)}
                    className="min-h-[40px] flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-[#0F766E] dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/60 font-bold text-xs transition active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Consulter</span>
                  </button>

                  <button
                    onClick={() => onEditAudit(audit)}
                    className="min-h-[40px] flex items-center gap-1 px-3 py-1.5 rounded-xl bg-card-subtle text-sub hover:text-main hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold text-xs transition border border-soft active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    onClick={() => setAuditToDelete(audit)}
                    className="min-h-[40px] p-2 rounded-xl bg-card-subtle text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 transition border border-soft active:scale-95"
                    title="Supprimer cet audit"
                    aria-label="Supprimer cet audit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={!!auditToDelete}
        title="Supprimer cet audit ?"
        message={
          auditToDelete
            ? `Voulez-vous vraiment supprimer l'audit du service « ${auditToDelete.service} » du ${auditToDelete.date} ? Cette opération est irréversible et supprimera également les actions correctives associées.`
            : ''
        }
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAuditToDelete(null)}
      />
    </div>
  );
};
