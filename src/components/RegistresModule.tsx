import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Check, X, Droplets, Bug, FlaskConical, Presentation, Printer, Download, Copy } from 'lucide-react';
import { REGISTRES, RegistreDef, RegistreId } from '../data/thmData';
import { thmService, RegistreEntree } from '../services/thmService';
import { storageService } from '../services/storageService';
import { ConfirmModal } from './ConfirmModal';
import { TrendChart, PointTendance } from './TrendChart';
import { extrasService } from '../services/extrasService';
import { addDays } from '../data/planActionData';
import { CorrectiveAction } from '../types';
import { useToast } from '../context/ToastContext';
import { dateLocale } from '../utils/dates';

const ICONES: Record<RegistreId, React.ElementType> = {
  eau: Droplets,
  vecteurs: Bug,
  prelevements: FlaskConical,
  sensibilisation: Presentation,
};
const TONES: Record<RegistreId, string> = { eau: 'sea', vecteurs: 'clay', prelevements: 'plum', sensibilisation: 'ochre' };

const today = () => dateLocale();
const nowTime = () => new Date().toTimeString().slice(0, 5);
const fmt = (d: string) => (d ? d.split('-').reverse().join('/') : '');

/** Une mesure non conforme crée tout de suite une action corrective à suivre. */
function creerActionAuto(def: RegistreDef, e: RegistreEntree) {
  const lieu = e.point || e.zone || e.lieu || '';
  const mesures: Record<string, { mesure: string; source: string; jours: number }> = {
    eau: {
      mesure:
        'Refaire la mesure au même point, contrôler la chloration (dose, pompe, stock de chlore) et purger le point. Si le résultat reste hors limite, interrompre l’usage pour la boisson et informer le responsable.',
      source: 'NM 03.7.001 (pH) ; repère OMS (chlore résiduel)',
      jours: 1,
    },
    prelevements: {
      mesure:
        'Nettoyer et désinfecter le point prélevé (ou chloration choc du réseau), refaire un prélèvement de contrôle, rechercher la cause et informer la direction.',
      source: 'Résultat d’analyse non conforme',
      jours: 3,
    },
  };
  if (def.id === 'prelevements' && e.nature === 'Surface') {
    mesures.prelevements = {
      mesure:
        'Revoir le protocole de nettoyage et de désinfection de la zone et sa mise en œuvre, refaire un prélèvement de contrôle, et informer l’équipe d’hygiène et la direction. Si S. aureus, entérobactéries, Aspergillus ou Pseudomonas sont retrouvés, reprendre tout le protocole et prévoir de nouveaux contrôles.',
      source: 'Manuel d’hygiène hospitalière, Ministère de la Santé (2010) : seuil de colonies par boîte',
      jours: 3,
    };
  }
  const m = mesures[def.id] || {
    mesure: 'Rechercher la cause de la non-conformité, corriger et vérifier à nouveau.',
    source: def.titre,
    jours: 7,
  };
  const now = new Date().toISOString();
  const action: CorrectiveAction = {
    id: `act_reg_${e.id}`,
    auditId: `registre_${def.id}`,
    itemId: `reg_${e.id}`,
    itemTitle: def.titreLigne(e),
    componentId: 'registres',
    componentTitle: def.titre,
    service: lieu || def.titre,
    description: m.mesure,
    responsable: storageService.getSettings().userName || 'Technicien d’hygiène du milieu',
    echeance: addDays(e.date || today(), m.jours),
    statut: 'a_faire',
    createdAt: now,
    constat: `${def.titre} · ${def.titreLigne(e)} (${fmt(e.date)})`,
    source: m.source,
    priorite: m.jours <= 1 ? 'haute' : 'moyenne',
  };
  storageService.saveCorrectiveAction(action);
}

const inputCls =
  'w-full h-11 px-3 rounded-lg border border-medium bg-card text-main text-[15px] focus:outline-none focus:border-primary';

const Registre: React.FC<{ def: RegistreDef; onBack: () => void; autoOpen?: boolean }> = ({ def, onBack, autoOpen }) => {
  const { showToast } = useToast();
  const [entrees, setEntrees] = useState<RegistreEntree[]>(() => thmService.getRegistre(def.id));
  const [details, setDetails] = useState(false);
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [date, setDate] = useState(today());
  const [heure, setHeure] = useState(nowTime());
  const [toDelete, setToDelete] = useState<string | null>(null);

  const Icon = ICONES[def.id];
  const operateurDefaut = storageService.getSettings().userName || '';

  const start = (modele?: RegistreEntree) => {
    // Saisie rapide : on reprend les champs « fixes » (point, opérateur, type, zone…) de la dernière entrée ou du modèle
    const base = modele || entrees[0];
    const v: Record<string, string> = {};
    if (base) {
      def.champs.forEach((c) => {
        if ((c.type === 'text' || c.type === 'select') && base[c.id] !== undefined) v[c.id] = String(base[c.id]);
        if (modele && c.type !== 'textarea' && base[c.id] !== undefined) v[c.id] = String(base[c.id]);
      });
    }
    if (def.champs.some((c) => c.id === 'operateur') && !v.operateur) v.operateur = operateurDefaut;
    setVals(v);
    setDetails(false);
    setDate(today());
    setHeure(nowTime());
    setOpen(true);
  };

  const OPTIONNELS = ['observation', 'laboratoire', 'operateur', 'intervenant', 'animateur', 'produit'];
  const estOptionnel = (c: { id: string; requis?: boolean }) => OPTIONNELS.includes(c.id) && !c.requis;
  const visible = (c: { si?: { champ: string; valeurs: string[] } }) => !c.si || c.si.valeurs.includes(vals[c.si.champ] ?? '');
  const brut = (): Record<string, any> => {
    const o: Record<string, any> = {};
    def.champs.forEach((c) => (o[c.id] = c.type === 'number' ? (vals[c.id] ?? '').replace(',', '.') : vals[c.id]));
    return o;
  };
  const auto = def.resultatAuto?.(brut());
  const ok = def.champs.every(
    (c) => !c.requis || !visible(c) || (c.id === 'resultat' && auto) || (vals[c.id] ?? '').toString().trim() !== ''
  );

  const save = () => {
    if (!ok) return;
    const data: Record<string, any> = { date, heure };
    def.champs.forEach((c) => {
      if (!visible(c)) return;
      const v = (vals[c.id] ?? '').toString().trim();
      if (v !== '') data[c.id] = c.type === 'number' ? v.replace(',', '.') : v;
    });
    if (auto) data.resultat = auto;
    const saved = thmService.addEntree(def.id, data as any);
    setEntrees(thmService.getRegistre(def.id));
    setOpen(false);
    const c = def.conforme?.(data);
    if (c === false) {
      creerActionAuto(def, saved);
      showToast('Non conforme : une action corrective a été créée', 'warning');
    } else {
      showToast('Enregistré', 'success');
    }
    if (autoOpen) onBack();
  };

  const exporter = () => {
    const cols = def.champs.filter((c) => c.id !== 'date' && c.id !== 'heure');
    const rows: (string | number)[][] = [['Date', 'Heure', ...cols.map((c) => c.label), 'Conforme']];
    entrees.forEach((e) => {
      const c = def.conforme?.(e);
      rows.push([e.date, e.heure || '', ...cols.map((x) => (x.type === 'number' && e[x.id] !== undefined ? String(e[x.id]).replace('.', ',') : e[x.id] ?? '')), c === undefined ? '' : c ? 'Oui' : 'Non']);
    });
    extrasService.downloadCsv(def.titre.replace(/\s+/g, '_'), rows);
  };

  const tendanceEau: PointTendance[] =
    def.id === 'eau'
      ? entrees
          .filter((e) => !isNaN(parseFloat(e.chlore)))
          .map((e) => ({ date: e.date, y: parseFloat(e.chlore), groupe: e.point || 'Point d’eau', ok: def.conforme?.(e) !== false }))
      : [];

  useEffect(() => {
    if (autoOpen) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nc = entrees.filter((e) => def.conforme?.(e) === false).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 no-print">
        <button onClick={onBack} className="w-11 h-11 -ms-2 flex items-center justify-center text-sub" aria-label="Retour">
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
          onClick={() => start()}
          className="w-full h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2 no-print"
        >
          <Plus className="w-5 h-5" /> Nouvelle entrée
        </button>
      ) : (
        <div className="border border-medium rounded-lg p-4 space-y-3 bg-card no-print">
          {def.champs.filter((c) => visible(c) && (!estOptionnel(c) || details)).map((c) => (
            <label key={c.id} className="block">
              <span className="label-caps block mb-1">
                {c.label}
                {c.requis ? ' *' : ''}
              </span>
              {c.type === 'select' ? (
                <select
                  className={inputCls}
                  value={c.id === 'resultat' && auto ? auto : vals[c.id] ?? ''}
                  disabled={c.id === 'resultat' && !!auto}
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
          {!details && def.champs.some((c) => visible(c) && estOptionnel(c)) && (
            <button type="button" onClick={() => setDetails(true)} className="text-[14px] text-primary font-medium flex items-center gap-1.5 min-h-[44px]">
              <Plus className="w-4 h-4" /> Ajouter des détails
            </button>
          )}
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

      {def.id === 'eau' && <TrendChart titre="Chlore résiduel libre" unite="mg/L" donnees={tendanceEau} seuilMin={0.2} />}

      <section>
        <div className="flex items-baseline justify-between pb-2 border-b border-medium">
          <h3 className="label-caps">
            Historique · {entrees.length}
            {def.conforme && nc > 0 ? ` · ${nc} non conforme${nc > 1 ? 's' : ''}` : ''}
          </h3>
          {entrees.length > 0 && (
            <button onClick={exporter} className="text-xs text-sub flex items-center gap-1 no-print me-3">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
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
                  <button onClick={() => start(e)} className="text-sub p-1 -m-1 no-print" aria-label="Refaire la même saisie" title="Refaire la même saisie">
                    <Copy className="w-4 h-4" />
                  </button>
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

export const RegistresModule: React.FC<{ registre: RegistreId; onBack: () => void; autoOpen?: boolean }> = ({ registre, onBack, autoOpen }) => {
  const def = REGISTRES.find((r) => r.id === registre)!;
  return <Registre key={def.id} def={def} onBack={onBack} autoOpen={autoOpen} />;
};
