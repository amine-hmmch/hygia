import React, { useMemo, useState } from 'react';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
import { Audit, ChecklistVersion } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  audits: Audit[];
  onNewAudit: (version?: ChecklistVersion) => void;
  onViewAudit: (auditId: string) => void;
  onEditAudit: (audit: Audit) => void;
  onDeleteAudit: (auditId: string) => void;
}

const tone = (n: number) => (n >= 80 ? 'text-success' : n >= 50 ? 'text-warning' : 'text-danger');
const fmt = (d: string) => d.split('-').reverse().join('/');

export const AuditHistory: React.FC<Props> = ({ audits, onNewAudit, onViewAudit, onEditAudit, onDeleteAudit }) => {
  const [q, setQ] = useState('');
  const [version, setVersion] = useState<'all' | ChecklistVersion>('all');
  const [toDelete, setToDelete] = useState<Audit | null>(null);

  const list = useMemo(
    () =>
      audits.filter(
        (a) =>
          (version === 'all' || a.version === version) &&
          (!q.trim() || `${a.service} ${a.auditeur} ${a.date}`.toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [audits, q, version]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-sub absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un service, une date"
            aria-label="Rechercher"
            className="w-full h-11 ps-9 pe-3 rounded-lg border border-medium bg-card text-main text-[15px] focus:outline-none focus:border-primary"
          />
        </div>
        <button onClick={() => onNewAudit()} className="h-11 px-4 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Audit
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1 bg-card-subtle rounded-lg">
        {([['all', 'Tous'], ['courte', 'Rapides'], ['exhaustive', 'Complets']] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setVersion(k)}
            className={`h-11 rounded-md text-[13px] font-medium ${version === k ? 'bg-card text-main border border-medium' : 'text-sub'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-8 text-sm text-sub">{audits.length === 0 ? 'Aucun audit pour le moment.' : 'Aucun résultat.'}</p>
      ) : (
        <div className="border-t border-medium">
          {list.map((a) => (
            <div key={a.id} className="row-rule flex items-center gap-2">
              <button onClick={() => onViewAudit(a.id)} className="flex-1 min-w-0 py-3.5 text-start">
                <span className="block text-[15px] text-main leading-snug truncate">{a.service}</span>
                <span className="block text-[13px] text-sub">
                  {fmt(a.date)} · {a.version === 'courte' ? 'rapide' : 'complet'} · {a.totalNon} non conforme{a.totalNon > 1 ? 's' : ''}
                </span>
              </button>
              <span className={`font-mono text-lg font-medium ${tone(a.scoreGlobal)}`}>{a.scoreGlobal}%</span>
              <button onClick={() => onEditAudit(a)} aria-label="Modifier l'audit" className="w-9 h-9 flex items-center justify-center text-sub"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => setToDelete(a)} aria-label="Supprimer l'audit" className="w-9 h-9 -me-2 flex items-center justify-center text-sub"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!toDelete}
        title="Supprimer cet audit ?"
        message={toDelete ? `L'audit « ${toDelete.service} » du ${fmt(toDelete.date)} et ses actions correctives seront supprimés.` : ''}
        confirmLabel="Supprimer"
        onConfirm={() => { if (toDelete) onDeleteAudit(toDelete.id); setToDelete(null); }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
