import { PlanAnnuel, planParDefaut, SOURCE_LABEL, RegistreId, SourceAuto, Activite, TacheJournal, TACHES_PAR_DEFAUT } from '../data/thmData';
import { storageService } from './storageService';
import { cuisineService } from './cuisineService';
import { safeSetItem } from '../utils/safeStorage';

export interface RegistreEntree {
  id: string;
  date: string; // YYYY-MM-DD
  heure?: string;
  createdAt: string;
  [champ: string]: any;
}

const regKey = (id: RegistreId) => `essp_hygiene_reg_${id}_v1`;
const planKey = (annee: number) => `essp_hygiene_plan_${annee}_v1`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    safeSetItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Stockage impossible', e);
  }
}

export interface NoteJournal {
  id: string;
  heure: string;
  texte: string;
  zone?: string;
}
export interface JourJournal {
  /** tâche -> heure de réalisation */
  faits: Record<string, string>;
  notes: NoteJournal[];
}

const TACHES_KEY = 'essp_hygiene_journal_taches_v1';
const JOURS_KEY = 'essp_hygiene_journal_jours_v1';

/** Lundi de la semaine d'une date ISO. */
export function debutSemaine(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const j = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - j);
  return d.toISOString().split('T')[0];
}

const REG_IDS: RegistreId[] = ['eau', 'vecteurs', 'prelevements', 'sensibilisation'];

export const thmService = {
  /* ---------- Registres ---------- */
  getRegistre(id: RegistreId): RegistreEntree[] {
    const list = read<RegistreEntree[]>(regKey(id), []);
    return (Array.isArray(list) ? list : []).sort((x, y) =>
      ((y.date || '') + (y.heure || '')).localeCompare((x.date || '') + (x.heure || ''))
    );
  },
  addEntree(id: RegistreId, data: Omit<RegistreEntree, 'id' | 'createdAt'>): RegistreEntree {
    const full = { ...data, id: uid(), createdAt: new Date().toISOString() } as RegistreEntree;
    write(regKey(id), [full, ...read<RegistreEntree[]>(regKey(id), [])]);
    return full;
  },
  deleteEntree(id: RegistreId, entryId: string) {
    write(regKey(id), read<RegistreEntree[]>(regKey(id), []).filter((e) => e.id !== entryId));
  },

  /* ---------- Carnet de bord ---------- */
  getTaches(): TacheJournal[] {
    const t = read<TacheJournal[] | null>(TACHES_KEY, null);
    if (Array.isArray(t)) return t;
    write(TACHES_KEY, TACHES_PAR_DEFAUT);
    return TACHES_PAR_DEFAUT;
  },
  saveTaches(t: TacheJournal[]) {
    write(TACHES_KEY, t);
  },
  resetTaches(): TacheJournal[] {
    write(TACHES_KEY, TACHES_PAR_DEFAUT);
    return TACHES_PAR_DEFAUT;
  },
  getJours(): Record<string, JourJournal> {
    const j = read<Record<string, JourJournal>>(JOURS_KEY, {});
    return j && typeof j === 'object' ? j : {};
  },
  getJour(date: string): JourJournal {
    const j = this.getJours()[date];
    return { faits: j?.faits || {}, notes: j?.notes || [] };
  },
  saveJour(date: string, jour: JourJournal) {
    const all = this.getJours();
    if (!Object.keys(jour.faits).length && !jour.notes.length) delete all[date];
    else all[date] = jour;
    write(JOURS_KEY, all);
  },
  basculerTache(date: string, tacheId: string, heure: string) {
    const j = this.getJour(date);
    if (j.faits[tacheId]) delete j.faits[tacheId];
    else j.faits[tacheId] = heure;
    this.saveJour(date, j);
  },
  ajouterNote(date: string, note: Omit<NoteJournal, 'id'>) {
    const j = this.getJour(date);
    j.notes = [...j.notes, { ...note, id: uid() }];
    this.saveJour(date, j);
  },
  supprimerNote(date: string, noteId: string) {
    const j = this.getJour(date);
    j.notes = j.notes.filter((n) => n.id !== noteId);
    this.saveJour(date, j);
  },
  /** Une tâche est-elle déjà faite dans la période qui la concerne ? */
  faiteDansPeriode(t: TacheJournal, date: string): boolean {
    const jours = this.getJours();
    if (t.frequence === 'quotidien') return !!jours[date]?.faits[t.id];
    const debutS = debutSemaine(date);
    return Object.entries(jours).some(([d, j]) => {
      if (!j.faits[t.id]) return false;
      if (t.frequence === 'hebdomadaire') return debutSemaine(d) === debutS;
      return d.slice(0, 7) === date.slice(0, 7);
    });
  },
  /** Tâches à afficher pour un jour : quotidiennes + hebdo/mensuelles pas encore faites sur la période (ou faites ce jour-là). */
  tachesDuJour(date: string): { tache: TacheJournal; fait: boolean; heure?: string }[] {
    const jour = this.getJour(date);
    return this.getTaches()
      .map((tache) => {
        const faitCeJour = !!jour.faits[tache.id];
        const faitPeriode = this.faiteDansPeriode(tache, date);
        return { tache, fait: faitCeJour, heure: jour.faits[tache.id], afficher: faitCeJour || !faitPeriode };
      })
      .filter((x) => x.afficher)
      .map(({ tache, fait, heure }) => ({ tache, fait, heure }));
  },
  newTacheId: () => `t_${uid()}`,

  /* ---------- Plan annuel ---------- */
  getPlan(annee: number): PlanAnnuel {
    const stored = read<PlanAnnuel | null>(planKey(annee), null);
    if (stored && Array.isArray(stored.activites)) return stored;
    const plan = planParDefaut(annee);
    write(planKey(annee), plan);
    return plan;
  },
  savePlan(plan: PlanAnnuel) {
    write(planKey(plan.annee), { ...plan, choisi: true, updatedAt: new Date().toISOString() });
  },
  hasPlan(annee: number): boolean {
    const p = read<PlanAnnuel | null>(planKey(annee), null);
    return !!p && Array.isArray(p.activites);
  },
  /** Plan sans aucune activité : l'utilisateur construit le sien. */
  planVide(annee: number): PlanAnnuel {
    const plan: PlanAnnuel = { annee, activites: [], suiviDepuis: annee === new Date().getFullYear() ? new Date().getMonth() : 0, choisi: true, updatedAt: new Date().toISOString() };
    write(planKey(annee), plan);
    return plan;
  },
  /** Reprend le plan d'une autre année : mêmes activités et mêmes mois prévus, réalisé manuel remis à zéro. */
  copierPlan(deAnnee: number, versAnnee: number): PlanAnnuel {
    const src = this.getPlan(deAnnee);
    const plan: PlanAnnuel = {
      ...src,
      annee: versAnnee,
      suiviDepuis: versAnnee === new Date().getFullYear() ? new Date().getMonth() : 0,
      activites: src.activites.map((a) => ({ ...a, id: `act_${uid()}`, prevu: [...a.prevu], manuel: Array(12).fill(0) })),
      choisi: true,
      updatedAt: new Date().toISOString(),
    };
    write(planKey(versAnnee), plan);
    return plan;
  },
  /** Fichier de partage : structure du plan seulement (pas le réalisé saisi, pas d'identité). */
  exporterPlan(annee: number): string {
    const p = this.getPlan(annee);
    return JSON.stringify({
      type: 'hygia-plan',
      schemaVersion: 1,
      annee: p.annee,
      axes: p.axes,
      activites: p.activites.map(({ axe, titre, outil, indicateur, responsable, prevu, source }) => ({ axe, titre, outil, indicateur, responsable, prevu, source })),
    }, null, 2);
  },
  /** Importe un plan partagé dans l'année donnée. Validation stricte ; remplace le plan de cette année (copie de sécurité conservée). */
  importerPlan(contenu: string, annee: number): { ok: boolean; message: string; nb?: number } {
    let d: any;
    try { d = JSON.parse(contenu); } catch { return { ok: false, message: "Ce fichier n'est pas lisible." }; }
    if (!d || d.type !== 'hygia-plan' || !Array.isArray(d.activites)) return { ok: false, message: "Ce fichier n'est pas un plan Hygia." };
    const txt = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '');
    const sources = Object.keys(SOURCE_LABEL);
    const activites: Activite[] = [];
    for (const a of d.activites.slice(0, 200)) {
      if (!a || typeof a !== 'object' || !txt(a.titre).trim()) continue;
      const prevu = Array.isArray(a.prevu) && a.prevu.length === 12 ? a.prevu.map((n: unknown) => (Number.isFinite(n) && (n as number) >= 0 && (n as number) < 1000 ? Math.round(n as number) : 0)) : Array(12).fill(0);
      activites.push({
        id: `act_${uid()}`,
        axe: txt(a.axe, 80) || 'Autres activités',
        titre: txt(a.titre),
        outil: txt(a.outil),
        indicateur: txt(a.indicateur),
        responsable: txt(a.responsable, 80),
        prevu,
        manuel: Array(12).fill(0),
        source: sources.includes(a.source) ? a.source : undefined,
      });
    }
    if (activites.length === 0) return { ok: false, message: 'Aucune activité valide dans ce fichier.' };
    try {
      const ancien = localStorage.getItem(planKey(annee));
      if (ancien) localStorage.setItem(`${planKey(annee)}_avant_import`, ancien);
    } catch { /* ignoré */ }
    const axes = Array.isArray(d.axes) ? d.axes.filter((x: unknown) => typeof x === 'string').map((x: string) => x.slice(0, 80)) : undefined;
    const axesDeduits = Array.from(new Set(activites.map((a) => a.axe)));
    const plan: PlanAnnuel = {
      annee,
      activites,
      axes: axes && axesDeduits.every((x) => axes.includes(x)) ? axes : axesDeduits,
      suiviDepuis: annee === new Date().getFullYear() ? new Date().getMonth() : 0,
      choisi: true,
      updatedAt: new Date().toISOString(),
    };
    write(planKey(annee), plan);
    return { ok: true, message: 'Plan importé.', nb: activites.length };
  },
  resetPlan(annee: number): PlanAnnuel {
    const plan = planParDefaut(annee);
    write(planKey(annee), plan);
    return plan;
  },
  newActiviteId: () => `act_${uid()}`,

  /* ---------- Comptage automatique du réalisé ---------- */
  compter(source: SourceAuto, annee: number, mois0: number): number {
    const prefix = `${annee}-${String(mois0 + 1).padStart(2, '0')}`;
    const dans = (d?: string) => !!d && d.startsWith(prefix);
    const reg = (id: RegistreId) => this.getRegistre(id).filter((e) => dans(e.date));
    switch (source) {
      case 'eau_chlore':
        return reg('eau').length;
      case 'prelev_eau':
        return reg('prelevements').filter((e) => e.nature === 'Eau de boisson').length;
      case 'prelev_hemo':
        return reg('prelevements').filter((e) => e.nature === 'Eau d’hémodialyse').length;
      case 'prelev_aliment':
        return reg('prelevements').filter((e) => e.nature === 'Aliment').length;
      case 'prelev_surface':
        return reg('prelevements').filter((e) => ['Surface', 'Air', 'Matériel ou dispositif'].includes(e.nature)).length;
      case 'derat':
        return reg('vecteurs').filter((e) => e.type === 'Dératisation').length;
      case 'desins':
        return reg('vecteurs').filter((e) => e.type === 'Désinsectisation').length;
      case 'capture':
        return reg('vecteurs').filter((e) => e.type === 'Capture d’animaux').length;
      case 'seances':
        return reg('sensibilisation').length;
      case 'audit_cuisine':
        return cuisineService.getAudits().filter((a) => dans(a.date)).length;
      default: {
        const comp: Record<string, string> = {
          audit_dmp: 'dechets_dmp',
          audit_env: 'env_interne',
          audit_mains: 'hygiene_mains',
          audit_ster: 'sterilisation',
        };
        const c = comp[source];
        return storageService
          .getAudits()
          .filter((a) => dans(a.date) && a.scoresParComposante?.[c] && a.scoresParComposante[c].ouiCount + a.scoresParComposante[c].nonCount > 0).length;
      }
    }
  },
  aFaireCeMois(date = new Date()): { activite: Activite; prevu: number; fait: number }[] {
    const annee = date.getFullYear();
    const m = date.getMonth();
    const plan = this.getPlan(annee);
    return plan.activites
      .map((activite) => ({ activite, prevu: activite.prevu[m] || 0, fait: this.realise(activite, annee, m) }))
      .filter((x) => x.prevu > x.fait);
  },
  realise(act: Activite, annee: number, mois0: number): number {
    return act.source ? this.compter(act.source, annee, mois0) : act.manuel[mois0] || 0;
  },

  /* ---------- Sauvegarde ---------- */
  exportAll(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    REG_IDS.forEach((id) => (out[`reg_${id}`] = read(regKey(id), [])));
    out.journal_taches = read(TACHES_KEY, null);
    out.journal_jours = read(JOURS_KEY, {});
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      const m = k.match(/^essp_hygiene_plan_(\d{4})_v1$/);
      if (m) out[`plan_${m[1]}`] = read(k, null);
    }
    return out;
  },
  importAll(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    REG_IDS.forEach((id) => {
      if (Array.isArray(obj[`reg_${id}`])) write(regKey(id), obj[`reg_${id}`]);
    });
    if (Array.isArray(obj.journal_taches)) write(TACHES_KEY, obj.journal_taches);
    if (obj.journal_jours && typeof obj.journal_jours === 'object') write(JOURS_KEY, obj.journal_jours);
    Object.keys(obj).forEach((k) => {
      const m = k.match(/^plan_(\d{4})$/);
      if (m && obj[k]) write(planKey(parseInt(m[1], 10)), obj[k]);
    });
  },
  clearAll() {
    try {
      REG_IDS.forEach((id) => localStorage.removeItem(regKey(id)));
      localStorage.removeItem(TACHES_KEY);
      localStorage.removeItem(JOURS_KEY);
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (/^essp_hygiene_plan_\d{4}_v1(_avant_import)?$/.test(k)) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  },
};
