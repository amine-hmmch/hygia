import { thmService } from './thmService';
import { storageService } from './storageService';
import { cuisineService } from './cuisineService';
import { safeSetItem } from '../utils/safeStorage';

/**
 * Rapport trimestriel : chiffres calculés à partir des registres de l'établissement (centre de santé, hôpital…),
 * exportés en fichier pour être envoyés au district, qui les consolide.
 * Aucun taux « conforme/non conforme » n'est inventé : on ne compte que ce qui est saisi dans les registres.
 */
export interface IndicateurRapport {
  id: string;
  groupe: string;
  label: string;
  /** libellés numérateur / dénominateur ; sans dénominateur = simple comptage */
  nu: string;
  de?: string;
}

export const INDICATEURS_RAPPORT: IndicateurRapport[] = [
  { id: 'eau_chlore', groupe: 'Eau', label: 'Tests de chlore résiduel réalisés', nu: 'Tests réalisés' },
  { id: 'eau_prelev', groupe: 'Eau', label: 'Eau de boisson : prélèvements non conformes', nu: 'Non conformes', de: 'Prélèvements avec résultat' },
  { id: 'ali_prelev', groupe: 'Alimentation', label: 'Aliments : prélèvements non conformes', nu: 'Non conformes', de: 'Prélèvements avec résultat' },
  { id: 'surf_prelev', groupe: 'Environnement', label: 'Surfaces, air, matériel : prélèvements non conformes', nu: 'Non conformes', de: 'Prélèvements avec résultat' },
  { id: 'derat', groupe: 'Vecteurs', label: 'Dératisations réalisées', nu: 'Opérations' },
  { id: 'desins', groupe: 'Vecteurs', label: 'Désinsectisations réalisées', nu: 'Opérations' },
  { id: 'seances', groupe: 'Sensibilisation', label: 'Séances de sensibilisation ou de formation', nu: 'Séances' },
  { id: 'audits', groupe: 'Audits', label: 'Audits d’hygiène réalisés', nu: 'Audits' },
];

export const TRIMESTRES = ['T1', 'T2', 'T3', 'T4'] as const;
export type Trimestre = (typeof TRIMESTRES)[number];
export type Chiffres = Record<string, { n: number; d?: number }>;

export interface RapportTrimestriel {
  type: 'hygia-rapport';
  schemaVersion: 1;
  etablissement: string;
  niveau?: string;
  auteur?: string;
  annee: number;
  trimestre: Trimestre;
  genereLe: string;
  chiffres: Chiffres;
  /** Rapport consolidé d'un district : établissements dont les chiffres sont additionnés. */
  etablissements?: string[];
  /** true si les chiffres propres du district sont inclus dans le total. */
  inclutPropres?: boolean;
}

const RECUS_KEY = 'essp_hygiene_rapports_recus_v1';

function mois(annee: number, t: Trimestre): string[] {
  const i = TRIMESTRES.indexOf(t);
  return [0, 1, 2].map((k) => `${annee}-${String(i * 3 + k + 1).padStart(2, '0')}`);
}

export const rapportService = {
  trimestreActuel(d = new Date()): Trimestre {
    return TRIMESTRES[Math.floor(d.getMonth() / 3)];
  },

  /** Chiffres du trimestre, tirés des registres de cet appareil. */
  calculer(annee: number, t: Trimestre): Chiffres {
    const ms = mois(annee, t);
    const dans = (d?: string) => !!d && ms.some((m) => d.startsWith(m));
    const reg = (id: 'eau' | 'vecteurs' | 'prelevements' | 'sensibilisation') => thmService.getRegistre(id).filter((e) => dans(e.date));
    const prel = (natures: string[]) => {
      const l = reg('prelevements').filter((e) => natures.includes(e.nature) && (e.resultat === 'Conforme' || e.resultat === 'Non conforme'));
      return { n: l.filter((e) => e.resultat === 'Non conforme').length, d: l.length };
    };
    const audits =
      storageService.getAudits().filter((a) => dans(a.date)).length + cuisineService.getAudits().filter((a) => dans(a.date)).length;
    return {
      eau_chlore: { n: reg('eau').length },
      eau_prelev: prel(['Eau de boisson']),
      ali_prelev: prel(['Aliment']),
      surf_prelev: prel(['Surface', 'Air', 'Matériel ou dispositif']),
      derat: { n: reg('vecteurs').filter((e) => e.type === 'Dératisation').length },
      desins: { n: reg('vecteurs').filter((e) => e.type === 'Désinsectisation').length },
      seances: { n: reg('sensibilisation').length },
      audits: { n: audits },
    };
  },

  construire(annee: number, t: Trimestre): RapportTrimestriel {
    const s = storageService.getSettings();
    return {
      type: 'hygia-rapport',
      schemaVersion: 1,
      etablissement: (s.etablissement || '').trim(),
      niveau: s.niveau,
      auteur: [s.userName, s.userRole].filter(Boolean).join(', '),
      annee,
      trimestre: t,
      genereLe: new Date().toISOString(),
      chiffres: this.calculer(annee, t),
    };
  },

  /**
   * Rapport du district pour le GST : somme des rapports reçus des centres, avec en option les chiffres
   * propres du district. Les noms des établissements inclus sont joints pour que le GST voie ce qui est couvert.
   */
  construireConsolide(annee: number, t: Trimestre, inclurePropres: boolean): RapportTrimestriel | null {
    const { rapports, total } = this.consolider(annee, t);
    if (!rapports.length && !inclurePropres) return null;
    const base = this.construire(annee, t);
    const somme: Chiffres = {};
    for (const ind of INDICATEURS_RAPPORT) {
      const parts = [total[ind.id], inclurePropres ? base.chiffres[ind.id] : undefined].filter(Boolean) as { n: number; d?: number }[];
      if (!parts.length) continue;
      somme[ind.id] = ind.de ? { n: parts.reduce((x, c) => x + c.n, 0), d: parts.reduce((x, c) => x + (c.d ?? 0), 0) } : { n: parts.reduce((x, c) => x + c.n, 0) };
    }
    return { ...base, chiffres: somme, etablissements: rapports.map((r) => r.etablissement), inclutPropres: inclurePropres };
  },

  /* ---------- Réception côté district ---------- */
  getRecus(): RapportTrimestriel[] {
    try {
      const l = JSON.parse(localStorage.getItem(RECUS_KEY) || '[]');
      return Array.isArray(l) ? l : [];
    } catch {
      return [];
    }
  },

  /** Valide un fichier reçu. Un nouvel envoi du même établissement et de la même période remplace l'ancien. */
  recevoir(contenu: string): { ok: boolean; message: string; rapport?: RapportTrimestriel; remplace?: boolean } {
    let d: any;
    try { d = JSON.parse(contenu); } catch { return { ok: false, message: "Ce fichier n'est pas lisible." }; }
    if (!d || d.type !== 'hygia-rapport' || !d.chiffres || typeof d.chiffres !== 'object') return { ok: false, message: "Ce fichier n'est pas un rapport Hygia." };
    const etab = typeof d.etablissement === 'string' ? d.etablissement.trim().slice(0, 100) : '';
    if (!etab) return { ok: false, message: "Le rapport n'indique pas l'établissement." };
    const annee = Number(d.annee);
    if (!Number.isInteger(annee) || annee < 2000 || annee > 2100 || !TRIMESTRES.includes(d.trimestre)) return { ok: false, message: 'Période invalide dans le fichier.' };
    const nb = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 1e6 ? Math.round(v) : 0);
    const chiffres: Chiffres = {};
    for (const ind of INDICATEURS_RAPPORT) {
      const c = d.chiffres[ind.id];
      if (!c) continue;
      chiffres[ind.id] = ind.de ? { n: nb(c.n), d: nb(c.d) } : { n: nb(c.n) };
      if (ind.de && chiffres[ind.id].n > (chiffres[ind.id].d ?? 0)) return { ok: false, message: `Chiffres incohérents pour « ${ind.label} ».` };
    }
    const rapport: RapportTrimestriel = {
      type: 'hygia-rapport', schemaVersion: 1, etablissement: etab,
      niveau: typeof d.niveau === 'string' ? d.niveau.slice(0, 20) : undefined,
      auteur: typeof d.auteur === 'string' ? d.auteur.slice(0, 120) : undefined,
      annee, trimestre: d.trimestre,
      genereLe: typeof d.genereLe === 'string' ? d.genereLe.slice(0, 40) : new Date().toISOString(),
      chiffres,
      etablissements: Array.isArray(d.etablissements) ? d.etablissements.filter((x: unknown) => typeof x === 'string').slice(0, 200).map((x: string) => x.slice(0, 100)) : undefined,
      inclutPropres: typeof d.inclutPropres === 'boolean' ? d.inclutPropres : undefined,
    };
    const cle = (r: RapportTrimestriel) => `${r.etablissement.toLowerCase()}|${r.annee}|${r.trimestre}`;
    const tous = this.getRecus();
    const remplace = tous.some((r) => cle(r) === cle(rapport));
    safeSetItem(RECUS_KEY, JSON.stringify([...tous.filter((r) => cle(r) !== cle(rapport)), rapport]));
    return { ok: true, message: remplace ? 'Rapport mis à jour.' : 'Rapport reçu.', rapport, remplace };
  },

  supprimerRecu(etablissement: string, annee: number, t: Trimestre) {
    safeSetItem(RECUS_KEY, JSON.stringify(this.getRecus().filter((r) => !(r.etablissement === etablissement && r.annee === annee && r.trimestre === t))));
  },

  /** Total des rapports reçus pour une période. */
  consolider(annee: number, t: Trimestre): { rapports: RapportTrimestriel[]; total: Chiffres } {
    const rapports = this.getRecus().filter((r) => r.annee === annee && r.trimestre === t).sort((a, b) => a.etablissement.localeCompare(b.etablissement));
    const total: Chiffres = {};
    for (const ind of INDICATEURS_RAPPORT) {
      const l = rapports.map((r) => r.chiffres[ind.id]).filter(Boolean);
      if (!l.length) continue;
      total[ind.id] = ind.de ? { n: l.reduce((s, c) => s + c.n, 0), d: l.reduce((s, c) => s + (c.d ?? 0), 0) } : { n: l.reduce((s, c) => s + c.n, 0) };
    }
    return { rapports, total };
  },
};
