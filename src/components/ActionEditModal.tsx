import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CorrectiveAction, ActionStatus } from '../types';
import { PRIORITE_LABEL, Priorite } from '../data/planActionData';
import { storageService } from '../services/storageService';
import { useToast } from '../context/ToastContext';

interface Props {
  action: CorrectiveAction | null;
  onClose: () => void;
  onSaved: () => void;
}

const field =
  'w-full min-h-[44px] px-3 py-2 rounded-lg bg-card border border-medium text-main text-[15px] focus:outline-none focus:border-primary';

export const ActionEditModal: React.FC<Props> = ({ action, onClose, onSaved }) => {
  const { showToast } = useToast();
  const [draft, setDraft] = useState<CorrectiveAction | null>(action);
  React.useEffect(() => setDraft(action), [action]);
  if (!draft) return null;

  const set = (patch: Partial<CorrectiveAction>) => setDraft({ ...draft, ...patch });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveCorrectiveAction({ ...draft, updatedAt: new Date().toISOString() });
    showToast('Action enregistrée');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-xl bg-surface border border-medium p-5">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-soft">
          <div className="min-w-0">
            <p className="label-caps">Modifier l’action</p>
            <h3 className="text-[16px] font-semibold text-main leading-snug mt-0.5">{draft.itemTitle}</h3>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-9 h-9 -me-2 flex items-center justify-center text-sub">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3.5 pt-4">
          {draft.constat && (
            <div className="text-[13px] text-sub">
              <span className="label-caps block mb-0.5">Constat</span>
              {draft.constat}
            </div>
          )}
          <label className="block">
            <span className="label-caps block mb-1">Mesure corrective</span>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              className={`${field} leading-snug`}
            />
          </label>
          <label className="block">
            <span className="label-caps block mb-1">Source</span>
            <input value={draft.source || ''} onChange={(e) => set({ source: e.target.value })} className={field} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label-caps block mb-1">Responsable</span>
              <input value={draft.responsable} onChange={(e) => set({ responsable: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="label-caps block mb-1">Échéance</span>
              <input type="date" value={draft.echeance} onChange={(e) => set({ echeance: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="label-caps block mb-1">Priorité</span>
              <select
                value={draft.priorite || 'moyenne'}
                onChange={(e) => set({ priorite: e.target.value as Priorite })}
                className={field}
              >
                {(Object.keys(PRIORITE_LABEL) as Priorite[]).map((k) => (
                  <option key={k} value={k}>{PRIORITE_LABEL[k]}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label-caps block mb-1">Statut</span>
              <select value={draft.statut} onChange={(e) => set({ statut: e.target.value as ActionStatus })} className={field}>
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="realise">Réalisé</option>
                <option value="verifie">Vérifié</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-12 px-4 rounded-lg border border-medium text-main">
              Annuler
            </button>
            <button type="submit" className="flex-1 h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
