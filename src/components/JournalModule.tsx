import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Plus, Printer, SlidersHorizontal, Trash2, X, RotateCcw } from 'lucide-react';
import { thmService } from '../services/thmService';
import { storageService } from '../services/storageService';
import { FREQUENCE_LABEL, Frequence, NOMS_MOIS_LONGS, TacheJournal } from '../data/thmData';
import { ConfirmModal } from './ConfirmModal';
import { APP_NAME } from '../config/app';

const iso = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().split('T')[0];
};
const aujourdhui = () => iso(new Date());
const heureMaintenant = () => new Date().toTimeString().slice(0, 5);
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const fmtLong = (d: string) => {
  const x = new Date(d + 'T12:00:00');
  return `${JOURS[x.getDay()]} ${x.getDate()} ${NOMS_MOIS_LONGS[x.getMonth()]}`;
};

const inputCls =
  'w-full min-h-[44px] px-3 py-2 rounded-lg bg-card border border-medium text-main text-[15px] focus:outline-none focus:border-primary';

export const JournalModule: React.FC<{ onBackToHome: () => void; openEditor?: boolean }> = ({ onBackToHome, openEditor }) => {
  const [date, setDate] = useState(aujourdhui());
  const [tick, setTick] = useState(0);
  const [note, setNote] = useState('');
  const [zone, setZone] = useState('');
  const [gerer, setGerer] = useState(false);
  const [imprimer, setImprimer] = useState(false);
  const [mois, setMois] = useState(date.slice(0, 7));

  const refresh = () => setTick((t) => t + 1);
  useEffect(() => setMois(date.slice(0, 7)), [date]);
  useEffect(() => {
    if (!imprimer) return;
    document.body.classList.add('print-report');
    return () => document.body.classList.remove('print-report');
  }, [imprimer]);

  const taches = useMemo(() => thmService.tachesDuJour(date), [date, tick]);
  const jour = useMemo(() => thmService.getJour(date), [date, tick]);
  const jours = useMemo(() => thmService.getJours(), [tick]);
  const tachesTous = useMemo(() => thmService.getTaches(), [tick]);
  const faits = taches.filter((t) => t.fait).length;

  const decaler = (n: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + n);
    setDate(iso(d));
  };

  /* Calendrier du mois */
  const [y, m] = mois.split('-').map(Number);
  const premier = new Date(y, m - 1, 1);
  const nbJours = new Date(y, m, 0).getDate();
  const decalage = (premier.getDay() + 6) % 7;
  const quotidiennes = tachesTous.filter((t) => t.frequence === 'quotidien');
  const etatJour = (d: string): 'plein' | 'partiel' | 'vide' => {
    const j = jours[d];
    if (!j) return 'vide';
    const nb = quotidiennes.filter((t) => j.faits[t.id]).length;
    if (quotidiennes.length > 0 && nb === quotidiennes.length) return 'plein';
    return Object.keys(j.faits).length || j.notes.length ? 'partiel' : 'vide';
  };
  const changeMois = (n: number) => {
    const d = new Date(y, m - 1 + n, 1);
    setMois(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const ajouterNote = () => {
    if (!note.trim()) return;
    thmService.ajouterNote(date, { heure: heureMaintenant(), texte: note.trim(), zone: zone.trim() || undefined });
    setNote('');
    setZone('');
    refresh();
  };

  /* ----------------- Éditeur de tâches ----------------- */
  const [edit, setEdit] = useState<TacheJournal[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const ouvrirGestion = (nouvelle = false) => {
    const liste = thmService.getTaches().map((t) => ({ ...t }));
    if (nouvelle) liste.push({ id: thmService.newTacheId(), titre: '', frequence: 'quotidien' });
    setEdit(liste);
    setGerer(true);
  };
  useEffect(() => {
    if (openEditor) ouvrirGestion(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const enregistrerGestion = () => {
    thmService.saveTaches(edit.filter((t) => t.titre.trim()));
    setGerer(false);
    refresh();
  };

  const gestion =
    gerer &&
    createPortal(
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 sm:p-4">
        <div className="w-full max-w-lg max-h-[94vh] overflow-y-auto rounded-t-2xl sm:rounded-xl bg-surface border border-medium p-5">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-soft">
            <div>
              <p className="label-caps">Carnet de bord</p>
              <h3 className="text-[16px] font-semibold text-main">Mes tâches récurrentes</h3>
            </div>
            <button onClick={() => setGerer(false)} aria-label="Fermer" className="w-9 h-9 -me-2 flex items-center justify-center text-sub">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="pt-4 space-y-3">
            {edit.map((t, i) => (
              <div key={t.id} className="border border-soft rounded-lg p-3 space-y-2">
                <input
                  className={inputCls}
                  value={t.titre}
                  aria-label="Titre de la tâche"
                  onChange={(e) => setEdit(edit.map((x, k) => (k === i ? { ...x, titre: e.target.value } : x)))}
                />
                <div className="flex gap-2">
                  <select
                    className={`${inputCls} flex-1`}
                    value={t.frequence}
                    aria-label="Fréquence"
                    onChange={(e) => setEdit(edit.map((x, k) => (k === i ? { ...x, frequence: e.target.value as Frequence } : x)))}
                  >
                    {(Object.keys(FREQUENCE_LABEL) as Frequence[]).map((f) => (
                      <option key={f} value={f}>{FREQUENCE_LABEL[f]}</option>
                    ))}
                  </select>
                  <button onClick={() => setEdit(edit.filter((_, k) => k !== i))} aria-label="Supprimer la tâche" className="w-11 h-11 rounded-lg border border-medium text-danger flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setEdit([...edit, { id: thmService.newTacheId(), titre: '', frequence: 'quotidien' }])}
              className="text-[14px] text-primary font-medium flex items-center gap-1.5 py-1"
            >
              <Plus className="w-4 h-4" /> Ajouter une tâche
            </button>
            <button onClick={() => setConfirmReset(true)} className="text-[12px] text-sub flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Revenir à la liste type
            </button>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setGerer(false)} className="h-12 px-4 rounded-lg border border-medium text-main">Annuler</button>
              <button onClick={enregistrerGestion} className="flex-1 h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  /* ----------------- Impression du mois ----------------- */
  const settings = storageService.getSettings();
  const titresTaches: Record<string, string> = {};
  tachesTous.forEach((t) => (titresTaches[t.id] = t.titre));
  const joursDuMois = Object.entries(jours)
    .filter(([d]) => d.startsWith(mois))
    .sort(([a], [b]) => a.localeCompare(b));

  const impression =
    imprimer &&
    createPortal(
      <div className="report-overlay fixed inset-0 z-[70] overflow-y-auto bg-surface">
        <div className="no-print sticky top-0 bg-surface border-b border-soft px-4 py-2.5 flex items-center gap-2">
          <span className="flex-1 text-[14px] text-sub">Aperçu du carnet de bord</span>
          <button onClick={() => window.print()} className="h-11 px-3.5 rounded-lg bg-primary text-white dark:text-[#10201a] text-sm font-medium flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> <span className="whitespace-nowrap">Imprimer</span>
          </button>
          <button onClick={() => setImprimer(false)} aria-label="Fermer" className="w-11 h-11 flex items-center justify-center text-sub"><X className="w-5 h-5" /></button>
        </div>
        <div className="report-sheet max-w-3xl mx-auto px-4 py-6 space-y-5">
          <header>
            <p className="label-caps">{settings.etablissement || APP_NAME} · Carnet de bord du THM</p>
            <h2 className="font-serif-display text-[28px] text-main capitalize">{NOMS_MOIS_LONGS[m - 1]} {y}</h2>
            {settings.userName && <p className="text-[13px] text-sub">{settings.userName}</p>}
          </header>
          {joursDuMois.length === 0 ? (
            <p className="text-[14px] text-sub">Aucune activité notée ce mois-ci.</p>
          ) : (
            joursDuMois.map(([d, j]) => (
              <section key={d} className="break-inside-avoid border-t border-medium pt-2">
                <p className="text-[14px] font-medium text-main capitalize">{fmtLong(d)}</p>
                <ul className="text-[13px] text-main mt-1 space-y-0.5">
                  {Object.entries(j.faits).map(([id, h]) => (
                    <li key={id}>✓ {titresTaches[id] || 'Tâche supprimée'} <span className="text-sub">({h})</span></li>
                  ))}
                  {j.notes.map((n) => (
                    <li key={n.id}>• {n.heure} {n.zone ? `[${n.zone}] ` : ''}{n.texte}</li>
                  ))}
                </ul>
              </section>
            ))
          )}
          <footer className="pt-6 grid grid-cols-2 gap-8 text-[12px] text-sub">
            <div className="border-t border-medium pt-1.5">Technicien d’hygiène du milieu</div>
            <div className="border-t border-medium pt-1.5">Visa du responsable</div>
          </footer>
        </div>
      </div>,
      document.body
    );

  const estAujourdhui = date === aujourdhui();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBackToHome} className="w-11 h-11 -ms-2 flex items-center justify-center text-sub" aria-label="Retour">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-main leading-tight">Carnet de bord</h2>
          <p className="text-[13px] text-sub leading-tight">Ce que tu as fait chaque jour</p>
        </div>
        <button onClick={() => ouvrirGestion()} className="min-h-[44px] px-3 rounded-lg border border-medium text-[13px] text-primary font-medium flex items-center gap-1.5" aria-label="Gérer mes tâches">
          <SlidersHorizontal className="w-4 h-4" /> Mes tâches
        </button>
      </div>

      {/* Navigation par jour */}
      <div className="flex items-center justify-between border-y border-soft py-2.5">
        <button onClick={() => decaler(-1)} className="w-11 h-11 flex items-center justify-center text-sub" aria-label="Jour précédent"><ChevronLeft className="w-5 h-5" /></button>
        <div className="text-center">
          <p className="font-serif-display text-[20px] leading-tight text-main capitalize">{fmtLong(date)}</p>
          {!estAujourdhui && (
            <button onClick={() => setDate(aujourdhui())} className="text-[12px] text-primary font-medium">Revenir à aujourd’hui</button>
          )}
        </div>
        <button onClick={() => decaler(1)} className="w-11 h-11 flex items-center justify-center text-sub" aria-label="Jour suivant"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {/* Tâches */}
      <section>
        <div className="flex items-baseline justify-between pb-2 border-b border-medium">
          <h3 className="label-caps">Tâches</h3>
          <span className="font-mono text-xs text-sub">{faits}/{taches.length}</span>
        </div>
        {taches.length === 0 ? (
          <p className="py-4 text-sm text-sub">Aucune tâche. Touche « Ajouter une tâche » ci-dessous.</p>
        ) : (
          taches.map(({ tache, fait, heure }) => (
            <button
              key={tache.id}
              onClick={() => { thmService.basculerTache(date, tache.id, heureMaintenant()); refresh(); }}
              aria-pressed={fait}
              className="row-rule w-full py-3 flex items-center gap-3.5 text-start"
            >
              <span className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${fait ? 'bg-primary border-primary text-white dark:text-[#10201a]' : 'border-medium'}`}>
                {fait && <Check className="w-4 h-4" strokeWidth={2.6} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[15px] leading-snug ${fait ? 'text-sub line-through' : 'text-main'}`}>{tache.titre}</span>
                <span className="block text-[12px] text-sub">
                  {FREQUENCE_LABEL[tache.frequence]}{tache.zone ? ` · ${tache.zone}` : ''}{fait && heure ? ` · fait à ${heure}` : ''}
                </span>
              </span>
            </button>
          ))
        )}
        <button onClick={() => ouvrirGestion(true)} className="mt-3 min-h-[44px] px-3 rounded-lg border border-medium text-[13px] text-primary font-medium flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Ajouter une tâche
        </button>
      </section>

      {/* Notes */}
      <section>
        <h3 className="label-caps pb-2 border-b border-medium">Notes du jour</h3>
        {jour.notes.map((n) => (
          <div key={n.id} className="row-rule py-3 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] text-main leading-snug">{n.texte}</p>
              <p className="text-[12px] text-sub">{n.heure}{n.zone ? ` · ${n.zone}` : ''}</p>
            </div>
            <button onClick={() => { thmService.supprimerNote(date, n.id); refresh(); }} className="text-sub p-1 -m-1" aria-label="Supprimer la note"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <div className="pt-3 space-y-2">
          <textarea
            rows={2}
            className={`${inputCls} leading-snug`}
            placeholder="Ex. Désinfection de la salle 3 après un cas de gale"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-label="Nouvelle note"
          />
          <div className="flex gap-2">
            <input className={`${inputCls} flex-1`} placeholder="Service ou zone (facultatif)" value={zone} onChange={(e) => setZone(e.target.value)} aria-label="Zone" />
            <button onClick={ajouterNote} disabled={!note.trim()} className="px-4 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium disabled:opacity-40">Ajouter</button>
          </div>
        </div>
      </section>

      {/* Calendrier */}
      <section>
        <div className="flex items-center justify-between pb-2 border-b border-medium">
          <div className="flex items-center gap-1">
            <button onClick={() => changeMois(-1)} className="w-11 h-11 flex items-center justify-center text-sub" aria-label="Mois précédent"><ChevronLeft className="w-4 h-4" /></button>
            <h3 className="label-caps w-32 text-center capitalize">{NOMS_MOIS_LONGS[m - 1]} {y}</h3>
            <button onClick={() => changeMois(1)} className="w-11 h-11 flex items-center justify-center text-sub" aria-label="Mois suivant"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setImprimer(true)} className="text-xs text-sub flex items-center gap-1 min-h-[44px]"><Printer className="w-3.5 h-3.5" /> Imprimer</button>
        </div>
        <div className="grid grid-cols-7 gap-1 pt-3 text-center">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((x, i) => (<span key={i} className="label-caps">{x}</span>))}
          {Array.from({ length: decalage }, (_, i) => (<span key={`v${i}`} />))}
          {Array.from({ length: nbJours }, (_, i) => {
            const d = `${mois}-${String(i + 1).padStart(2, '0')}`;
            const e = etatJour(d);
            const sel = d === date;
            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                aria-label={`Jour ${i + 1}`}
                className={`h-11 rounded-lg text-[14px] flex flex-col items-center justify-center ${sel ? 'border border-primary text-primary font-medium' : 'text-main'}`}
              >
                {i + 1}
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${e === 'plein' ? 'bg-[var(--color-success)]' : e === 'partiel' ? 'bg-[var(--color-warning)]' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 text-[11px] text-sub pt-2">
          <span className="flex items-center gap-1"><i className="w-1.5 h-1.5 rounded-full inline-block bg-[var(--color-success)]" /> tâches du jour faites</span>
          <span className="flex items-center gap-1"><i className="w-1.5 h-1.5 rounded-full inline-block bg-[var(--color-warning)]" /> en partie</span>
        </div>
      </section>

      {gestion}
      {impression}
      <ConfirmModal
        isOpen={confirmReset}
        title="Revenir à la liste type ?"
        message="Tes tâches seront remplacées par la liste de départ. Ce que tu as déjà coché reste enregistré."
        confirmLabel="Remplacer"
        onConfirm={() => { setEdit(thmService.resetTaches().map((t) => ({ ...t }))); setConfirmReset(false); }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};
