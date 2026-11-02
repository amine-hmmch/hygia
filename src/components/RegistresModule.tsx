import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Check, X, Droplets, Bug, FlaskConical, Presentation, Printer } from 'lucide-react';
import { REGISTRES, RegistreDef, RegistreId } from '../data/thmData';
import { thmService, RegistreEntree } from '../services/thmService';
import { storageService } from '../services/storageService';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';

const ICONES: Record<RegistreId, React.ElementType> = {
  eau: Droplets,
  vecteurs: Bug,
  prelevements: FlaskConical,
  sensibilisation: Presentation,
};
const TONES: Record<RegistreId, string> = { eau: 'sea', vecteurs: 'clay', prelevements: 'plum', sensibilisation: 'ochre' };

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);
const fmt = (d: string) => (d ? d.split('-').reverse().join('/') : '');

const inputCls =
  'w-full h-11 px-3 rounded-lg border border-medium bg-card text-main text-[15px] focus:outline-none focus:border-primary';

const Registre: React.FC<{ def: RegistreDef; onBack: () => void }> = ({ def, onBack }) => {
  const { showToast } = useToast();
  const [entrees, setEntrees] = useState<RegistreEntree[]>(() => thmService.getRegistre(def.id));
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [date, setDate] = useState(today());
  const [heure, setHeure] = useState(nowTime());
  const [toDelete, setToDelete] = useState<string | null>(null);

  const Icon = ICONES[def.id];
  const operateurDefaut = storageService.getSettings().userName || '';

  const start = () => {
    setVals(def.champs.some((c) => c.id === 'operateur') ? { operateur: operateurDefaut } : {});
    setDate(today());
    setHeure(nowTime());
    setOpen(true);
  };

  const ok = def.champs.every((c) => !c.requis || (vals[c.id] ?? '').toString().trim() !== '');

  const save = () => {
    if (!ok) return;
    const data: Record<string, any> = { date, heure };
    def.champs.forEach((c) => {
      const v = (vals[c.id] ?? '').toString().trim();
      if (v !== '') data[c.id] = c.type === 'number' ? v.replace(',', '.') : v;
    });
    thmService.addEntree(def.id, data as any);
    setEntrees(thmService.getRegistre(def.id));
    setOpen(false);
    const c = def.conforme?.(data);
    showToast(c === false ? 'Enregistré : non conforme' : 'Enregistré', c === false ? 'warning' : 'success');
  };

  const nc = entrees.filter((e) => def.conforme?.(e) === false).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 no-print">
        <button onClick={onBack} className="w-10 h-10 -ms-2 flex items-center justify-center text-sub" aria-label="Retour">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className={`tile tile-${TONES[def.id]}`}>
          <Icon className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-main leading-tight">{def.titre}</h2>
          <p className="text-[13px] text-sub leading-tight">{def.description}</p>
        </div>
      </div>

      {def.repere && <p className="text-[13px] text-sub">{def.repere}</p>}

      {!open ? (
        <button
          onClick={start}
          className="w-full h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2 no-print"
        >
          <Plus className="w-5 h-5" /> Nouvelle entrée
        </button>
      ) : (
        <div className="border border-medium rounded-lg p-4 space-y-3 bg-card no-print">
          {def.champs.map((c) => (
            <label key={c.id} className="block">
              <span className="label-caps block mb-1">
                {c.label}
                {c.requis ? ' *' : ''}
              </span>
              {c.type === 'select' ? (
                <select
                  className={inputCls}
                  value={vals[c.id] ?? ''}
                  onChange={(e) => setVals({ ...vals, [c.id]: e.target.value })}
                >
                  <option value="">Choisir</option>
                  {c.options!.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : c.type === 'textarea' ? (
                <textarea
                  rows={2}
                  className={`${inputCls} h-auto py-2`}
                  value={vals[c.id] ?? ''}
                  onChange={(e) => setVals({ ...vals, [c.id]: e.target.value })}
                />
              ) : (
                <>
                  <input
                    className={inputCls}
                    type={c.type === 'number' ? 'text' : c.type}
                    inputMode={c.type === 'number' ? 'decimal' : undefined}
                    list={c.suggestions ? `sg_${def.id}_${c.id}` : undefined}
                    placeholder={c.placeholder}
                    value={vals[c.id] ?? ''}
                    onChange={(e) => setVals({ ...vals, [c.id]: e.target.value })}
                  />
                  {c.suggestions && (
                    <datalist id={`sg_${def.id}_${c.id}`}>
                      {c.suggestions.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  )}
                </>
              )}
            </label>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label-caps block mb-1">Date</span>
              <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="label-caps block mb-1">Heure</span>
              <input type="time" className={inputCls} value={heure} onChange={(e) => setHeure(e.target.value)} />
            </label>
          </div>
          {def.conforme && (() => {
            const preview: Record<string, any> = {};
            def.champs.forEach((c) => (preview[c.id] = c.type === 'number' ? (vals[c.id] ?? '').replace(',', '.') : vals[c.id]));
            const r = def.conforme!(preview);
            return r === undefined ? null : (
              <div className={`rounded-lg px-3 py-2 text-sm font-medium ${r ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger'}`}>
                {r ? 'Conforme' : 'Non conforme'}
              </div>
            );
          })()}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setOpen(false)} className="h-11 px-4 rounded-lg border border-medium text-main">
              Annuler
            </button>
            <button onClick={save} disabled={!ok} className="flex-1 h-11 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium disabled:opacity-40">
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-baseline justify-between pb-2 border-b border-medium">
          <h3 className="label-caps">
            Historique · {entrees.length}
            {def.conforme && nc > 0 ? ` · ${nc} non conforme${nc > 1 ? 's' : ''}` : ''}
          </h3>
          {entrees.length > 0 && (
            <button onClick={() => window.print()} className="text-xs text-sub flex items-center gap-1 no-print">
              <Printer className="w-3.5 h-3.5" /> Imprimer
            </button>
          )}
        </div>
        {entrees.length === 0 ? (
          <p className="py-6 text-sm text-sub">Aucune entrée pour le moment.</p>
        ) : (
          <ul>
            {entrees.slice(0, 80).map((e) => {
              const c = def.conforme?.(e);
              return (
                <li key={e.id} className="row-rule py-3 flex items-start gap-3">
                  {c !== undefined && (
                    <span className={`mt-0.5 shrink-0 ${c ? 'text-success' : 'text-danger'}`}>
                      {c ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] text-main leading-snug">{def.titreLigne(e)}</div>
                    <div className="text-[13px] text-sub leading-snug">
                      {fmt(e.date)} {e.heure}
                      {def.sousTitre(e) ? ` · ${def.sousTitre(e)}` : ''}
                    </div>
                  </div>
                  <button onClick={() => setToDelete(e.id)} className="text-sub p-1 -m-1 no-print" aria-label="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmModal
        isOpen={!!toDelete}
        title="Supprimer cette entrée ?"
        message="Cette action est définitive."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (toDelete) thmService.deleteEntree(def.id, toDelete);
          setEntrees(thmService.getRegistre(def.id));
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export const RegistresModule: React.FC<{ registre: RegistreId; onBack: () => void }> = ({ registre, onBack }) => {
  const def = REGISTRES.find((r) => r.id === registre)!;
  return <Registre key={def.id} def={def} onBack={onBack} />;
};
