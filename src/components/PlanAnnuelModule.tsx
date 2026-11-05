import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Minus, Printer, X, Trash2, RotateCcw, Copy, Pencil } from 'lucide-react';
import { AXES, Activite, PlanAnnuel, NOMS_MOIS, NOMS_MOIS_LONGS, SOURCE_LABEL, SourceAuto } from '../data/thmData';
import { thmService } from '../services/thmService';
import { storageService } from '../services/storageService';
import { ConfirmModal } from './ConfirmModal';
import { APP_NAME } from '../config/app';

const inputCls =
  'w-full min-h-[44px] px-3 py-2 rounded-lg bg-card border border-medium text-main text-[15px] focus:outline-none focus:border-primary';

type Etat = 'vide' | 'fait' | 'partiel' | 'manque' | 'avenir';

export const PlanAnnuelModule: React.FC<{ onBackToHome: () => void; onOpenRegistres: () => void }> = ({
  onBackToHome,
  onOpenRegistres,
}) => {
  const now = new Date();
  const [annee, setAnnee] = useState(now.getFullYear());
  const [plan, setPlan] = useState<PlanAnnuel>(() => thmService.getPlan(annee));
  const [openAxe, setOpenAxe] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [draft, setDraft] = useState<Activite | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [choixPlan, setChoixPlan] = useState<'vide' | 'copie' | null>(null);
  const [nouvelAxe, setNouvelAxe] = useState<string | null>(null);
  const [renAxe, setRenAxe] = useState<{ ancien: string; valeur: string } | null>(null);
  const [supprAxe, setSupprAxe] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => setPlan(thmService.getPlan(annee)), [annee]);
  useEffect(() => {
    if (!printing) return;
    document.body.classList.add('print-report');
    return () => document.body.classList.remove('print-report');
  }, [printing]);

  const debut = plan.suiviDepuis ?? 0;
  const moisCourant = annee === now.getFullYear() ? now.getMonth() : annee < now.getFullYear() ? 11 : -1;

  const persist = (p: PlanAnnuel) => {
    setPlan({ ...p, choisi: true });
    thmService.savePlan(p);
    setTick((t) => t + 1);
  };

  const real = (a: Activite, m: number) => thmService.realise(a, annee, m);

  const etat = (a: Activite, m: number): Etat => {
    const p = a.prevu[m] || 0;
    const r = real(a, m);
    if ((p === 0 && r === 0) || (m < debut && r === 0)) return 'vide';
    if (p > 0 && r >= p) return 'fait';
    if (r > 0) return 'partiel';
    return m <= moisCourant ? (m === now.getMonth() && annee === now.getFullYear() ? 'avenir' : 'manque') : 'avenir';
  };

  const taux = (a: Activite): number | null => {
    let p = 0,
      r = 0;
    for (let m = debut; m <= moisCourant; m++) {
      p += a.prevu[m] || 0;
      r += Math.min(real(a, m), a.prevu[m] || 0);
    }
    return p > 0 ? Math.round((r / p) * 100) : null;
  };

  const global = useMemo(() => {
    let p = 0,
      r = 0;
    plan.activites.forEach((a) => {
      for (let m = debut; m <= moisCourant; m++) {
        p += a.prevu[m] || 0;
        r += Math.min(thmService.realise(a, annee, m), a.prevu[m] || 0);
      }
    });
    return p > 0 ? Math.round((r / p) * 100) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, annee, moisCourant, tick, debut]);

  const aFaire = useMemo(() => {
    if (annee !== now.getFullYear()) return [];
    const m = now.getMonth();
    return plan.activites
      .map((a) => ({ a, p: a.prevu[m] || 0, r: thmService.realise(a, annee, m) }))
      .filter((x) => x.p > x.r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, annee, tick]);

  const retard = useMemo(() => {
    const out: { a: Activite; manque: number }[] = [];
    plan.activites.forEach((a) => {
      let manque = 0;
      for (let m = debut; m < moisCourant; m++) manque += Math.max(0, (a.prevu[m] || 0) - thmService.realise(a, annee, m));
      if (manque > 0) out.push({ a, manque });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, annee, moisCourant, tick]);

  const taxColor = (t: number | null) => (t === null ? 'text-muted-custom' : t >= 80 ? 'text-success' : t >= 50 ? 'text-warning' : 'text-danger');
  const cellCls: Record<Etat, string> = {
    vide: 'bg-card-subtle',
    fait: 'bg-[var(--color-success)]',
    partiel: 'bg-[var(--color-warning)]',
    manque: 'bg-[var(--color-danger)]',
    avenir: 'border border-medium',
  };

  const Strip: React.FC<{ a: Activite }> = ({ a }) => (
    <div className="flex gap-[3px]" aria-hidden="true">
      {NOMS_MOIS.map((_, m) => (
        <span key={m} className={`h-2 flex-1 rounded-[2px] ${cellCls[etat(a, m)]} ${m === moisCourant && annee === now.getFullYear() ? 'ring-1 ring-offset-1 ring-[var(--color-text-main)] ring-offset-[var(--color-bg)]' : ''}`} />
      ))}
    </div>
  );

  const openActivite = (a: Activite) => {
    setSel(a.id);
    setDraft({ ...a, prevu: [...a.prevu], manuel: [...a.manuel] });
    setIsNew(false);
  };
  const addActivite = (axe: string) => {
    const a: Activite = {
      id: thmService.newActiviteId(),
      axe,
      titre: '',
      outil: '',
      indicateur: '',
      responsable: 'Technicien d’hygiène du milieu',
      prevu: Array(12).fill(0),
      manuel: Array(12).fill(0),
    };
    setSel(a.id);
    setDraft(a);
    setIsNew(true);
  };
  const saveDraft = () => {
    if (!draft || !draft.titre.trim()) return;
    const list = isNew ? [...plan.activites, draft] : plan.activites.map((x) => (x.id === draft.id ? draft : x));
    persist({ ...plan, activites: list });
    setSel(null);
    setDraft(null);
  };

  const setNum = (arr: number[], m: number, v: number) => arr.map((x, i) => (i === m ? Math.max(0, v) : x));
  const nomAxeCourt = (axe: string) => axe.split(' ').slice(0, 3).join(' ');

  const axes = (plan.axes ?? [...AXES, ...(plan.axesPerso || [])])
    .concat(plan.activites.map((a) => a.axe))
    .filter((x, i, arr) => arr.indexOf(x) === i);
  const ajouterAxe = () => {
    const nom = (nouvelAxe || '').trim();
    if (!nom || axes.some((x) => x.toLowerCase() === nom.toLowerCase())) { setNouvelAxe(null); return; }
    persist({ ...plan, axes: [...axes, nom] });
    setOpenAxe(nom);
    setNouvelAxe(null);
  };
  const deplacerAxe = (axe: string, sens: -1 | 1) => {
    const i = axes.indexOf(axe);
    const j = i + sens;
    if (i < 0 || j < 0 || j >= axes.length) return;
    const l = [...axes];
    [l[i], l[j]] = [l[j], l[i]];
    persist({ ...plan, axes: l });
  };
  const renommerAxe = () => {
    if (!renAxe) return;
    const nom = renAxe.valeur.trim();
    const { ancien } = renAxe;
    setRenAxe(null);
    if (!nom || nom === ancien || axes.some((x) => x !== ancien && x.toLowerCase() === nom.toLowerCase())) return;
    persist({
      ...plan,
      axes: axes.map((x) => (x === ancien ? nom : x)),
      activites: plan.activites.map((a) => (a.axe === ancien ? { ...a, axe: nom } : a)),
    });
    setOpenAxe(nom);
  };
  const supprimerAxe = () => {
    if (!supprAxe) return;
    persist({ ...plan, axes: axes.filter((x) => x !== supprAxe), activites: plan.activites.filter((a) => a.axe !== supprAxe) });
    setSupprAxe(null);
    setOpenAxe(null);
  };
  const PRESETS: { label: string; prevu: number[] }[] = [
    { label: 'Chaque semaine', prevu: Array(12).fill(4) },
    { label: '2 fois par mois', prevu: Array(12).fill(2) },
    { label: 'Chaque mois', prevu: Array(12).fill(1) },
    { label: 'Chaque trimestre', prevu: Array.from({ length: 12 }, (_, i) => ((i + 1) % 3 === 0 ? 1 : 0)) },
    { label: '2 fois par an', prevu: Array.from({ length: 12 }, (_, i) => ((i + 1) % 6 === 0 ? 1 : 0)) },
    { label: 'Aucun mois', prevu: Array(12).fill(0) },
  ];
  const dupliquer = () => {
    if (!draft) return;
    const copie: Activite = { ...draft, id: thmService.newActiviteId(), titre: `${draft.titre} (copie)`, prevu: [...draft.prevu], manuel: Array(12).fill(0) };
    setSel(copie.id);
    setDraft(copie);
    setIsNew(true);
  };
  const planPrecedent = thmService.hasPlan(annee - 1);

  /* ---------------------------- Fiche d'une activité ---------------------------- */
  const sheet =
    draft &&
    createPortal(
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 sm:p-4">
        <div className="w-full max-w-lg max-h-[94vh] overflow-y-auto rounded-t-2xl sm:rounded-xl bg-surface border border-medium p-5">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-soft">
            <div className="min-w-0">
              <p className="label-caps">{isNew ? 'Nouvelle activité' : 'Activité'}</p>
              <h3 className="text-[16px] font-semibold text-main leading-snug mt-0.5">{draft.titre || 'Sans titre'}</h3>
            </div>
            <button onClick={() => { setSel(null); setDraft(null); }} aria-label="Fermer" className="w-9 h-9 -me-2 flex items-center justify-center text-sub">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3.5 pt-4">
            <label className="block">
              <span className="label-caps block mb-1">Activité</span>
              <input className={inputCls} value={draft.titre} onChange={(e) => setDraft({ ...draft, titre: e.target.value })} />
            </label>

            <div>
              <span className="label-caps block mb-1.5">Fréquence rapide</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((pr) => (
                  <button key={pr.label} type="button" onClick={() => setDraft({ ...draft, prevu: [...pr.prevu] })} className="min-h-[36px] px-3 rounded-full border border-medium text-[13px] text-main active:bg-card-subtle">
                    {pr.label}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-sub mt-1.5">Choisis un rythme, puis ajuste mois par mois si besoin.</p>
            </div>

            <div>
              <span className="label-caps block mb-1.5">Mois : prévu et réalisé</span>
              <div className="border border-soft rounded-lg divide-y divide-[var(--color-border-soft)]">
                {NOMS_MOIS_LONGS.map((nom, m) => {
                  const auto = !!draft.source;
                  const r = auto ? thmService.compter(draft.source!, annee, m) : draft.manuel[m] || 0;
                  const p = draft.prevu[m] || 0;
                  return (
                    <div key={m} className="flex items-center gap-2 px-3 py-1.5">
                      <span className="w-20 text-[14px] text-main capitalize">{nom}</span>
                      <span className="flex items-center gap-1 text-[12px] text-sub">
                        prévu
                        <button aria-label={`Moins prévu ${nom}`} onClick={() => setDraft({ ...draft, prevu: setNum(draft.prevu, m, p - 1) })} className="w-7 h-7 rounded border border-soft flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="w-5 text-center font-mono text-main text-[14px]">{p}</span>
                        <button aria-label={`Plus prévu ${nom}`} onClick={() => setDraft({ ...draft, prevu: setNum(draft.prevu, m, p + 1) })} className="w-7 h-7 rounded border border-soft flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </span>
                      <span className="flex-1" />
                      {auto ? (
                        <span className="font-mono text-[14px] text-main">{r} fait</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[12px] text-sub">
                          fait
                          <button aria-label={`Moins fait ${nom}`} onClick={() => setDraft({ ...draft, manuel: setNum(draft.manuel, m, r - 1) })} className="w-7 h-7 rounded border border-soft flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="w-5 text-center font-mono text-main text-[14px]">{r}</span>
                          <button aria-label={`Plus fait ${nom}`} onClick={() => setDraft({ ...draft, manuel: setNum(draft.manuel, m, r + 1) })} className="w-7 h-7 rounded border border-soft flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {draft.source && (
                <p className="text-[12px] text-sub mt-1.5">Le « fait » est compté automatiquement depuis : {SOURCE_LABEL[draft.source]}.</p>
              )}
            </div>

            <label className="block">
              <span className="label-caps block mb-1">Comment compter le « fait »</span>
              <select
                className={inputCls}
                aria-label="Comment compter le fait"
                value={draft.source || ''}
                onChange={(e) => setDraft({ ...draft, source: (e.target.value || undefined) as SourceAuto | undefined })}
              >
                <option value="">Je le saisis moi-même</option>
                {(Object.keys(SOURCE_LABEL) as SourceAuto[]).map((k) => (
                  <option key={k} value={k}>Automatique : {SOURCE_LABEL[k]}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label-caps block mb-1">Responsable</span>
              <input className={inputCls} value={draft.responsable} onChange={(e) => setDraft({ ...draft, responsable: e.target.value })} />
            </label>
            <label className="block">
              <span className="label-caps block mb-1">Outil de suivi</span>
              <input className={inputCls} value={draft.outil} onChange={(e) => setDraft({ ...draft, outil: e.target.value })} />
            </label>
            <label className="block">
              <span className="label-caps block mb-1">Indicateur</span>
              <input className={inputCls} value={draft.indicateur} onChange={(e) => setDraft({ ...draft, indicateur: e.target.value })} />
            </label>
            <label className="block">
              <span className="label-caps block mb-1">Axe</span>
              <select className={inputCls} value={draft.axe} onChange={(e) => setDraft({ ...draft, axe: e.target.value })}>
                {axes.map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </label>

            <div className="flex gap-2 pt-1">
              {!isNew && (
                <button onClick={dupliquer} className="h-12 w-12 rounded-lg border border-medium text-main flex items-center justify-center" aria-label="Dupliquer l'activité">
                  <Copy className="w-5 h-5" />
                </button>
              )}
              {!isNew && (
                <button onClick={() => setConfirmDelete(true)} className="h-12 w-12 rounded-lg border border-medium text-danger flex items-center justify-center" aria-label="Supprimer l'activité">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button onClick={saveDraft} disabled={!draft.titre.trim()} className="flex-1 h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium disabled:opacity-40">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  /* ------------------------------- Impression ------------------------------- */
  const settings = storageService.getSettings();
  const print =
    printing &&
    createPortal(
      <div className="report-overlay fixed inset-0 z-[70] overflow-y-auto bg-surface">
        <style>{`@media print { @page { size: A4 landscape; margin: 10mm; } }`}</style>
        <div className="no-print sticky top-0 bg-surface border-b border-soft px-4 py-2.5 flex items-center gap-2">
          <span className="flex-1 text-[14px] text-sub">Aperçu : Plan d’action {annee}</span>
          <button onClick={() => window.print()} className="h-10 px-3.5 rounded-lg bg-primary text-white dark:text-[#10201a] text-sm font-medium flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> <span className="whitespace-nowrap">Imprimer</span>
          </button>
          <button onClick={() => setPrinting(false)} aria-label="Fermer" className="w-10 h-10 flex items-center justify-center text-sub"><X className="w-5 h-5" /></button>
        </div>
        <div className="report-sheet px-4 py-6 space-y-6" style={{ maxWidth: '100%' }}>
          <header>
            <p className="label-caps">{settings.etablissement || APP_NAME} · Unité d’hygiène</p>
            <h2 className="font-serif-display text-[26px] text-main">Plan d’action {annee}</h2>
          </header>
          {axes.map((axe) => {
            const acts = plan.activites.filter((a) => a.axe === axe);
            if (!acts.length) return null;
            return (
              <section key={axe} className="break-inside-avoid">
                <h3 className="label-caps pb-1.5 border-b border-medium mb-1">{axe}</h3>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="text-start text-sub">
                      <th className="text-start py-1 pe-2 font-medium">Activité</th>
                      <th className="text-start py-1 pe-2 font-medium">Responsable</th>
                      {NOMS_MOIS.map((x, i) => (<th key={i} className="py-1 px-0.5 font-medium text-center w-8">{x}</th>))}
                      <th className="text-start py-1 ps-2 font-medium">Indicateur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acts.map((a) => (
                      <tr key={a.id} className="border-t border-soft align-top">
                        <td className="py-1.5 pe-2 text-main">{a.titre}</td>
                        <td className="py-1.5 pe-2 text-sub">{a.responsable}</td>
                        {NOMS_MOIS.map((_, m) => {
                          const p = a.prevu[m] || 0;
                          const r = real(a, m);
                          return <td key={m} className="py-1.5 px-0.5 text-center font-mono">{p || r ? `${r}/${p}` : ''}</td>;
                        })}
                        <td className="py-1.5 ps-2 text-sub">{a.indicateur}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
          <p className="text-[11px] text-sub">Chiffres : réalisé / prévu par mois.</p>
          <footer className="pt-4 grid grid-cols-3 gap-8 text-[12px] text-sub">
            <div className="border-t border-medium pt-1.5">Technicien d’hygiène du milieu</div>
            <div className="border-t border-medium pt-1.5">Responsable de l’unité</div>
            <div className="border-t border-medium pt-1.5">Direction</div>
          </footer>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBackToHome} className="w-10 h-10 -ms-2 flex items-center justify-center text-sub" aria-label="Retour à l'accueil">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-main leading-tight">Plan d’action annuel</h2>
          <p className="text-[13px] text-sub leading-tight">Ton programme d’activités, mois par mois</p>
        </div>
        <button onClick={() => setPrinting(true)} className="w-10 h-10 flex items-center justify-center text-sub" aria-label="Imprimer le plan">
          <Printer className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between border-y border-soft py-3">
        <div className="flex items-center gap-1">
          <button onClick={() => setAnnee(annee - 1)} className="w-9 h-9 flex items-center justify-center text-sub" aria-label="Année précédente"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-serif-display text-[22px] text-main w-16 text-center">{annee}</span>
          <button onClick={() => setAnnee(annee + 1)} className="w-9 h-9 flex items-center justify-center text-sub" aria-label="Année suivante"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="text-end">
          <p className={`font-serif-display text-[28px] leading-none ${taxColor(global)}`}>{global === null ? '—' : `${global}%`}</p>
          <p className="label-caps mt-1">Réalisé / prévu</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-sub -mt-3">
        Suivi à partir de
        <select
          value={debut}
          onChange={(e) => persist({ ...plan, suiviDepuis: parseInt(e.target.value, 10) })}
          className="h-8 px-2 rounded-md border border-medium bg-card text-main text-[13px]"
        >
          {NOMS_MOIS_LONGS.map((nm, i) => (
            <option key={i} value={i}>{nm}</option>
          ))}
        </select>
      </label>

      {!plan.choisi && (
        <section className="rounded-lg border border-warning-border bg-warning-tint p-3.5 space-y-2.5">
          <p className="text-[14px] text-main leading-snug">
            <span className="font-semibold">Plan prêt à l’emploi.</span> C’est le plan type du technicien d’hygiène du milieu. Garde-le, modifie-le activité par activité, ou pars d’autre chose.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => persist(plan)} className="min-h-[44px] px-4 rounded-lg bg-primary text-white dark:text-[#10201a] text-[14px] font-medium">Garder ce plan</button>
            <button onClick={() => setChoixPlan('vide')} className="min-h-[44px] px-4 rounded-lg border border-medium text-[14px] text-main">Créer le mien</button>
            {planPrecedent && (
              <button onClick={() => setChoixPlan('copie')} className="min-h-[44px] px-4 rounded-lg border border-medium text-[14px] text-main">Reprendre {annee - 1}</button>
            )}
          </div>
        </section>
      )}

      {annee === now.getFullYear() && (
        <section>
          <h3 className="label-caps pb-2 border-b border-medium">À faire en {NOMS_MOIS_LONGS[now.getMonth()]}</h3>
          {aFaire.length === 0 ? (
            <p className="py-3 text-sm text-sub">Tout est fait pour ce mois-ci.</p>
          ) : (
            aFaire.map(({ a, p, r }) => (
              <button key={a.id} onClick={() => openActivite(a)} className="row-rule w-full py-3 flex items-center gap-3 text-start">
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] text-main leading-snug">{a.titre}</span>
                  <span className="block text-[12px] text-sub">{a.indicateur}</span>
                </span>
                <span className="font-mono text-sm text-main shrink-0">{r}/{p}</span>
                <ChevronRight className="w-4 h-4 text-muted-custom shrink-0" />
              </button>
            ))
          )}
          {retard.length > 0 && (
            <p className="text-[13px] text-danger pt-2">
              En retard sur {retard.length} activité{retard.length > 1 ? 's' : ''} des mois précédents.
            </p>
          )}
        </section>
      )}

      <section>
        <div className="flex items-baseline justify-between pb-2 border-b border-medium">
          <h3 className="label-caps">Axes</h3>
          <button onClick={onOpenRegistres} className="text-xs text-primary font-medium">Registres</button>
        </div>
        {axes.map((axe) => {
          const acts = plan.activites.filter((a) => a.axe === axe);
          const open = openAxe === axe;
          let p = 0, r = 0;
          acts.forEach((a) => { for (let m = debut; m <= moisCourant; m++) { p += a.prevu[m] || 0; r += Math.min(real(a, m), a.prevu[m] || 0); } });
          const t = p > 0 ? Math.round((r / p) * 100) : null;
          return (
            <div key={axe} className="row-rule">
              <button onClick={() => setOpenAxe(open ? null : axe)} className="w-full py-3.5 flex items-center gap-3 text-start">
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-main leading-snug">{axe}</span>
                  <span className="block text-[12px] text-sub">{acts.length} activité{acts.length > 1 ? 's' : ''}</span>
                </span>
                <span className={`font-mono text-sm ${taxColor(t)}`}>{t === null ? '—' : `${t}%`}</span>
                {open ? <ChevronUp className="w-4 h-4 text-sub" /> : <ChevronDown className="w-4 h-4 text-sub" />}
              </button>
              {open && (
                <div className="pb-3">
                  {acts.map((a) => (
                    <button key={a.id} onClick={() => openActivite(a)} className="w-full text-start py-2.5 border-t border-soft">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-[14px] text-main leading-snug">{a.titre}</span>
                        <span className={`font-mono text-xs shrink-0 ${taxColor(taux(a))}`}>{taux(a) === null ? '—' : `${taux(a)}%`}</span>
                      </span>
                      <span className="block mt-1.5"><Strip a={a} /></span>
                    </button>
                  ))}
                  <button onClick={() => addActivite(axe)} className="mt-1 text-[13px] text-primary font-medium flex items-center gap-1 py-1.5">
                    <Plus className="w-4 h-4" /> Ajouter une activité
                  </button>
                  {renAxe?.ancien === axe ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        autoFocus
                        className={inputCls}
                        aria-label="Nouveau nom de l’axe"
                        value={renAxe.valeur}
                        onChange={(e) => setRenAxe({ ancien: axe, valeur: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && renommerAxe()}
                      />
                      <button onClick={renommerAxe} className="px-4 rounded-lg bg-primary text-white dark:text-[#10201a] text-[14px] font-medium">OK</button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-1 text-[12px] text-sub flex-wrap">
                      <button onClick={() => setRenAxe({ ancien: axe, valeur: axe })} className="min-h-[36px] px-2.5 rounded-md border border-soft flex items-center gap-1.5"><Pencil className="w-3.5 h-3.5" /> Renommer l’axe</button>
                      <button onClick={() => deplacerAxe(axe, -1)} aria-label="Monter l’axe" className="w-9 h-9 rounded-md border border-soft flex items-center justify-center"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => deplacerAxe(axe, 1)} aria-label="Descendre l’axe" className="w-9 h-9 rounded-md border border-soft flex items-center justify-center"><ChevronDown className="w-4 h-4" /></button>
                      <button onClick={() => setSupprAxe(axe)} className="min-h-[36px] px-2.5 rounded-md border border-soft text-danger flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Supprimer l’axe</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {nouvelAxe === null ? (
          <button onClick={() => setNouvelAxe('')} className="mt-2 text-[13px] text-primary font-medium flex items-center gap-1 py-1.5">
            <Plus className="w-4 h-4" /> Ajouter un axe
          </button>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              autoFocus
              className={inputCls}
              aria-label="Nom du nouvel axe"
              placeholder="ex. Hygiène du bloc opératoire"
              value={nouvelAxe}
              onChange={(e) => setNouvelAxe(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ajouterAxe()}
            />
            <button onClick={ajouterAxe} disabled={!nouvelAxe.trim()} className="px-4 rounded-lg bg-primary text-white dark:text-[#10201a] text-[14px] font-medium disabled:opacity-40">Ajouter</button>
          </div>
        )}
        <div className="flex items-center gap-3 text-[11px] text-sub pt-3">
          <span className="flex items-center gap-1"><i className="w-2.5 h-2 rounded-[2px] inline-block bg-[var(--color-success)]" /> fait</span>
          <span className="flex items-center gap-1"><i className="w-2.5 h-2 rounded-[2px] inline-block bg-[var(--color-warning)]" /> en partie</span>
          <span className="flex items-center gap-1"><i className="w-2.5 h-2 rounded-[2px] inline-block bg-[var(--color-danger)]" /> manqué</span>
          <span className="flex items-center gap-1"><i className="w-2.5 h-2 rounded-[2px] inline-block border border-medium" /> à venir</span>
        </div>
      </section>

      <button onClick={() => setConfirmReset(true)} className="text-[12px] text-sub flex items-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Revenir au plan type prêt à l’emploi
      </button>

      {sheet}
      {print}

      <ConfirmModal
        isOpen={confirmReset}
        title="Revenir au plan type ?"
        message={`Le plan ${annee} sera remplacé par le plan type. Tes modifications et les chiffres saisis à la main seront perdus (les registres ne sont pas touchés).`}
        confirmLabel="Remplacer"
        onConfirm={() => { setPlan(thmService.resetPlan(annee)); setConfirmReset(false); setTick((t) => t + 1); }}
        onCancel={() => setConfirmReset(false)}
      />
      <ConfirmModal
        isOpen={choixPlan === 'vide'}
        title="Créer ton propre plan ?"
        message={`Le plan ${annee} sera vide : tu ajoutes tes activités axe par axe. Le plan type sera remplacé (les registres ne sont pas touchés).`}
        confirmLabel="Plan vide"
        onConfirm={() => { setPlan(thmService.planVide(annee)); setChoixPlan(null); setTick((t) => t + 1); }}
        onCancel={() => setChoixPlan(null)}
      />
      <ConfirmModal
        isOpen={choixPlan === 'copie'}
        title={`Reprendre le plan ${annee - 1} ?`}
        message={`Les activités et les mois prévus de ${annee - 1} sont copiés dans ${annee}. Les chiffres saisis à la main repartent à zéro. Tu pourras tout modifier.`}
        confirmLabel="Reprendre"
        onConfirm={() => { setPlan(thmService.copierPlan(annee - 1, annee)); setChoixPlan(null); setTick((t) => t + 1); }}
        onCancel={() => setChoixPlan(null)}
      />
      <ConfirmModal
        isOpen={supprAxe !== null}
        title="Supprimer cet axe ?"
        message={`« ${supprAxe ?? ''} » et ses ${plan.activites.filter((a) => a.axe === supprAxe).length} activité(s) seront retirés du plan ${annee}. Les registres ne sont pas touchés.`}
        confirmLabel="Supprimer"
        onConfirm={supprimerAxe}
        onCancel={() => setSupprAxe(null)}
      />
      <ConfirmModal
        isOpen={confirmDelete}
        title="Supprimer cette activité ?"
        message="Elle sera retirée du plan de cette année."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (draft) persist({ ...plan, activites: plan.activites.filter((x) => x.id !== draft.id) });
          setConfirmDelete(false); setSel(null); setDraft(null);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};
