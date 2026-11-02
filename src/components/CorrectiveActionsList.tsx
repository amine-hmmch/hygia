import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Building,
  Check,
  Filter,
  Edit2,
  Trash2,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { CorrectiveAction, ActionStatus } from '../types';
import { storageService } from '../services/storageService';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';

interface CorrectiveActionsListProps {
  actions: CorrectiveAction[];
  onRefresh: () => void;
  onViewAudit?: (auditId: string) => void;
}

const STATUS_CONFIG: Record<
  ActionStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  a_faire: {
    label: 'À faire',
    color: 'text-rose-800 dark:text-rose-300',
    bg: 'bg-rose-100 dark:bg-rose-950/80',
    border: 'border-rose-300 dark:border-rose-800',
  },
  en_cours: {
    label: 'En cours',
    color: 'text-amber-800 dark:text-amber-300',
    bg: 'bg-amber-100 dark:bg-amber-950/80',
    border: 'border-amber-300 dark:border-amber-800',
  },
  realise: {
    label: 'Réalisé',
    color: 'text-emerald-800 dark:text-emerald-300',
    bg: 'bg-emerald-100 dark:bg-emerald-950/80',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
  verifie: {
    label: 'Vérifié',
    color: 'text-teal-800 dark:text-teal-300',
    bg: 'bg-teal-100 dark:bg-teal-950/80',
    border: 'border-teal-300 dark:border-teal-800',
  },
};

const NEXT_STATUS: Record<ActionStatus, ActionStatus> = {
  a_faire: 'en_cours',
  en_cours: 'realise',
  realise: 'verifie',
  verifie: 'a_faire',
};

export const CorrectiveActionsList: React.FC<CorrectiveActionsListProps> = ({
  actions,
  onRefresh,
  onViewAudit,
}) => {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | ActionStatus>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [editingAction, setEditingAction] = useState<CorrectiveAction | null>(null);
  const [actionToDelete, setActionToDelete] = useState<CorrectiveAction | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Distinct services in actions
  const actionServices = useMemo(() => {
    const set = new Set<string>();
    actions.forEach((a) => {
      if (a.service) set.add(a.service);
    });
    return Array.from(set);
  }, [actions]);

  // Filter actions
  const filteredActions = useMemo(() => {
    return actions.filter((act) => {
      const matchStatus = statusFilter === 'all' || act.statut === statusFilter;
      const matchService = serviceFilter === 'all' || act.service === serviceFilter;
      return matchStatus && matchService;
    });
  }, [actions, statusFilter, serviceFilter]);

  // Toggle status
  const handleAdvanceStatus = (action: CorrectiveAction) => {
    const next = NEXT_STATUS[action.statut];
    storageService.updateActionStatus(action.id, next);
    const nextLabel = STATUS_CONFIG[next].label;
    showToast(`Statut mis à jour : ${nextLabel}`, 'success');
    onRefresh();
  };

  // Save edit modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAction) {
      storageService.saveCorrectiveAction(editingAction);
      setEditingAction(null);
      showToast('Action corrective modifiée', 'success');
      onRefresh();
    }
  };

  // Delete action
  const handleConfirmDelete = () => {
    if (actionToDelete) {
      storageService.deleteCorrectiveAction(actionToDelete.id);
      setActionToDelete(null);
      showToast('Action corrective supprimée', 'info');
      onRefresh();
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-main tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Plan d'Actions Correctives</span>
          </h2>
          <p className="text-xs sm:text-sm text-sub mt-0.5">
            Suivi et levée des non-conformités issues des audits de sécurité sanitaire
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-soft shadow-soft space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 select-none ${
              statusFilter === 'all'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-card-subtle text-sub hover:text-main border border-soft'
            }`}
          >
            Toutes ({actions.length})
          </button>

          {(Object.keys(STATUS_CONFIG) as ActionStatus[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            const count = actions.filter((a) => a.statut === st).length;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-2 border select-none ${
                  statusFilter === st
                    ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-current`
                    : 'bg-card-subtle text-sub hover:text-main border-soft'
                }`}
              >
                <span>{cfg.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Service filter */}
        {actionServices.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-soft text-xs">
            <span className="text-sub text-xs shrink-0 font-medium">Filtrer par service :</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="min-h-[38px] text-xs px-3 py-1.5 rounded-xl bg-card border border-soft text-main focus:outline-none focus:border-[#0F766E]"
            >
              <option value="all">Tous les services ({actionServices.length})</option>
              {actionServices.map((srv, idx) => (
                <option key={idx} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* List of Actions */}
      {filteredActions.length === 0 ? (
        <div className="rounded-2xl p-8 bg-card border border-soft text-center space-y-3 shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-bold text-main text-base">Aucune action dans cette catégorie</h4>
          <p className="text-xs text-sub max-w-xs mx-auto">
            {statusFilter !== 'all' || serviceFilter !== 'all'
              ? 'Aucune action ne correspond aux critères de filtre sélectionnés.'
              : 'Toutes les non-conformités ont été résolues ou aucun audit n’a généré d’écart.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredActions.map((action) => {
            const isOverdue =
              action.echeance < today &&
              action.statut !== 'realise' &&
              action.statut !== 'verifie';
            const cfg = STATUS_CONFIG[action.statut];

            return (
              <div
                key={action.id}
                className={`rounded-2xl p-4 sm:p-5 bg-card border transition-all shadow-soft space-y-3.5 ${
                  isOverdue
                    ? 'border-rose-400 dark:border-rose-800/80 ring-1 ring-rose-400/30'
                    : 'border-soft hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                        {action.service}
                      </span>
                      <span className="text-xs text-sub font-medium">
                        {action.componentTitle}
                      </span>
                      {isOverdue && (
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Échéance dépassée</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-base text-main mt-1.5">
                      {action.itemTitle}
                    </h3>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleAdvanceStatus(action)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase transition border flex items-center gap-1.5 shadow-xs active:scale-95 shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}
                    title="Toucher pour passer au statut suivant"
                  >
                    <span>{cfg.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-sub leading-relaxed bg-card-subtle/70 p-3 rounded-xl border border-soft">
                  {action.description}
                </p>

                {/* Metadata & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-soft text-xs text-sub">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sub" />
                      <span>{action.responsable}</span>
                    </span>
                    <span className="opacity-40">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sub" />
                      <span>Échéance : {action.echeance}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {action.auditId && onViewAudit && (
                      <button
                        onClick={() => onViewAudit(action.auditId!)}
                        className="min-h-[36px] px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-[#0F766E] dark:text-teal-300 hover:bg-teal-100 font-semibold text-xs border border-teal-200 dark:border-teal-800/60 transition"
                      >
                        Voir audit
                      </button>
                    )}

                    <button
                      onClick={() => setEditingAction(action)}
                      className="min-h-[36px] p-2 rounded-lg bg-card-subtle text-sub hover:text-main border border-soft transition"
                      title="Modifier cette action"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setActionToDelete(action)}
                      className="min-h-[36px] p-2 rounded-lg bg-card-subtle text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-soft transition"
                      title="Supprimer cette action"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Action Modal */}
      {editingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-soft p-6 shadow-floating text-main space-y-4">
            <div className="flex items-center justify-between border-b border-soft pb-3">
              <h3 className="font-heading font-bold text-lg text-main">
                Modifier l'Action Corrective
              </h3>
              <button
                onClick={() => setEditingAction(null)}
                className="p-1.5 rounded-lg text-sub hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-main block mb-1">
                  Description / Plan d'action :
                </label>
                <textarea
                  rows={3}
                  value={editingAction.description}
                  onChange={(e) =>
                    setEditingAction({ ...editingAction, description: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-main block mb-1">Responsable :</label>
                  <input
                    type="text"
                    value={editingAction.responsable}
                    onChange={(e) =>
                      setEditingAction({ ...editingAction, responsable: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-main block mb-1">Échéance :</label>
                  <input
                    type="date"
                    value={editingAction.echeance}
                    onChange={(e) =>
                      setEditingAction({ ...editingAction, echeance: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-main block mb-1">Statut actuel :</label>
                <select
                  value={editingAction.statut}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      statut: e.target.value as ActionStatus,
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="a_faire">À faire</option>
                  <option value="en_cours">En cours</option>
                  <option value="realise">Réalisé</option>
                  <option value="verifie">Vérifié</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-soft">
                <button
                  type="button"
                  onClick={() => setEditingAction(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-card-subtle text-sub hover:text-main font-semibold border border-soft transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold transition shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!actionToDelete}
        title="Supprimer cette action corrective ?"
        message="Voulez-vous vraiment supprimer cette action du plan ? Cette opération est irréversible."
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setActionToDelete(null)}
      />
    </div>
  );
};
