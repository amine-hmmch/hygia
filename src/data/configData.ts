import { Activite, SourceAuto } from './thmData';

/** Où travaille l'utilisateur : sert à préremplir les réponses de l'assistant. */
export const NIVEAUX = [
  { id: 'hopital', label: 'Hôpital ou clinique', desc: 'Services de soins, cuisine, stérilisation, déchets…' },
  { id: 'centre', label: 'Centre de santé', desc: 'Soins de base, consultations, maternité, laboratoire' },
  { id: 'district', label: 'District sanitaire', desc: 'Suivi des centres de santé du district' },
  { id: 'gst', label: 'Groupement sanitaire territorial', desc: 'Suivi des districts et des établissements du territoire' },
  { id: 'autre', label: 'Autre', desc: 'Je choisis moi-même mes sujets' },
] as const;
export type NiveauId = (typeof NIVEAUX)[number]['id'];

/** Les sujets que l'utilisateur peut suivre. Ils décident des écrans, des raccourcis et du plan. */
export const SUJETS = [
  { id: 'eau', label: 'Eau de boisson', desc: 'Chlore résiduel et pH aux points d’eau' },
  { id: 'prelevements', label: 'Prélèvements et analyses', desc: 'Eau, aliments, surfaces, air' },
  { id: 'cuisine', label: 'Cuisine et restauration', desc: 'Températures, supervision, hygiène alimentaire' },
  { id: 'dechets', label: 'Déchets de soins', desc: 'Tri, pesées, local de stockage' },
  { id: 'sterilisation', label: 'Stérilisation', desc: 'Cycles d’autoclave et contrôles' },
  { id: 'locaux', label: 'Nettoyage et désinfection des locaux', desc: 'Bionettoyage, produits, audits' },
  { id: 'vecteurs', label: 'Lutte antivectorielle', desc: 'Dératisation, désinsectisation' },
  { id: 'sensibilisation', label: 'Sensibilisation et formation', desc: 'Séances pour le personnel' },
] as const;
export type SujetId = (typeof SUJETS)[number]['id'];

const TOUS: SujetId[] = SUJETS.map((s) => s.id);

/** Sujets cochés au départ selon le lieu de travail. */
export function sujetsParDefaut(niveau: string): SujetId[] {
  if (niveau === 'centre') return TOUS.filter((s) => s !== 'cuisine');
  return TOUS;
}

/** Services préchoisis selon le lieu de travail. */
export function servicesParDefaut(niveau: string, tous: string[]): string[] {
  if (niveau === 'centre') return tous.filter((s) => !/bloc|buanderie/i.test(s));
  return tous;
}

/** true si le sujet est suivi (tout est actif tant que l'assistant n'a pas été rempli). */
export function sujetActif(sujets: string[] | undefined, id: SujetId): boolean {
  return !sujets || sujets.includes(id);
}

/** Sujet auquel appartient une activité du plan type (null = toujours gardée). */
export function sujetDeActivite(a: Activite, axeIndex: number): SujetId | null {
  const parSource: Partial<Record<SourceAuto, SujetId>> = {
    eau_chlore: 'eau',
    prelev_eau: 'prelevements',
    prelev_hemo: 'prelevements',
    prelev_aliment: 'prelevements',
    prelev_surface: 'prelevements',
    derat: 'vecteurs',
    desins: 'vecteurs',
    capture: 'vecteurs',
    seances: 'sensibilisation',
    audit_cuisine: 'cuisine',
    audit_dmp: 'dechets',
    audit_ster: 'sterilisation',
    audit_env: 'locaux',
  };
  if (a.source && parSource[a.source]) return parSource[a.source]!;
  return ([ 'eau', 'cuisine', 'dechets', 'locaux', 'vecteurs' ] as SujetId[])[axeIndex] ?? null;
}

/** Rythmes proposés pour une activité (null = garder le rythme du plan type). */
export const RYTHMES: { id: string; label: string; prevu: number[] | null }[] = [
  { id: 'type', label: 'Rythme du plan type', prevu: null },
  { id: 'semaine', label: 'Chaque semaine', prevu: Array(12).fill(4) },
  { id: 'quinzaine', label: '2 fois par mois', prevu: Array(12).fill(2) },
  { id: 'mois', label: 'Chaque mois', prevu: Array(12).fill(1) },
  { id: 'trimestre', label: 'Chaque trimestre', prevu: Array.from({ length: 12 }, (_, i) => ((i + 1) % 3 === 0 ? 1 : 0)) },
  { id: 'semestre', label: '2 fois par an', prevu: Array.from({ length: 12 }, (_, i) => ((i + 1) % 6 === 0 ? 1 : 0)) },
];
