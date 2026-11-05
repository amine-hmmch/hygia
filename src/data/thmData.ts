/**
 * Données du travail du technicien d'hygiène du milieu (THM) :
 * registres et plan d'action annuel de l'unité d'hygiène.
 * Modèles inspirés de plans d'action d'unités d'hygiène hospitalière.
 */

/* ------------------------------ Registres ------------------------------ */

export type RegistreId = 'eau' | 'vecteurs' | 'prelevements' | 'sensibilisation';

export interface ChampDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea';
  options?: string[];
  suggestions?: string[];
  placeholder?: string;
  requis?: boolean;
  step?: string;
  /** Champ affiché seulement si un autre champ a l'une de ces valeurs. */
  si?: { champ: string; valeurs: string[] };
}

export interface RegistreDef {
  id: RegistreId;
  titre: string;
  description: string;
  champs: ChampDef[];
  /** libellé principal d'une ligne et sous-titre */
  titreLigne: (e: Record<string, any>) => string;
  sousTitre: (e: Record<string, any>) => string;
  /** true = conforme, false = non conforme, undefined = sans objet */
  conforme?: (e: Record<string, any>) => boolean | undefined;
  /** Résultat calculé automatiquement (remplace le choix manuel quand il est connu). */
  resultatAuto?: (e: Record<string, any>) => 'Conforme' | 'Non conforme' | undefined;
  repere?: string;
}

/** Seuils de colonies par boîte pour les prélèvements de surface (manuel d'hygiène hospitalière, 2010). */
export const ZONES_SURFACE = [
  { label: 'Bloc opératoire, salle d’examen invasif (moins de 5)', seuil: 5 },
  { label: 'Stérilisation, conditionnement (moins de 5)', seuil: 5 },
  { label: 'Pharmacie, hotte (moins de 1)', seuil: 1 },
];

function resultatSurface(e: Record<string, any>): 'Conforme' | 'Non conforme' | undefined {
  if (e.nature !== 'Surface') return undefined;
  const z = ZONES_SURFACE.find((x) => x.label === e.zoneSeuil);
  const n = parseFloat(String(e.colonies ?? '').replace(',', '.'));
  if (!z || Number.isNaN(n)) return undefined;
  return n < z.seuil ? 'Conforme' : 'Non conforme';
}

const POINTS_EAU = ['Cuisine', 'Hémodialyse', 'Laboratoire', 'Unités de soins', 'Réservoir', 'Branchement principal'];

export const REGISTRES: RegistreDef[] = [
  {
    id: 'eau',
    titre: 'Eau de boisson',
    description: 'Chlore résiduel libre et pH aux points d’eau',
    repere: 'pH : 6,5 à 8,5 (norme marocaine NM 03.7.001). Chlore résiduel libre : au moins 0,2 mg/L au point d’eau (repère OMS ; 0,5 mg/L en sortie de désinfection). Pas de seuil chiffré marocain trouvé : adapte-le si ta direction en fixe un.',
    champs: [
      { id: 'point', label: 'Point d’eau', type: 'text', suggestions: POINTS_EAU, requis: true, placeholder: 'ex. Cuisine' },
      { id: 'chlore', label: 'Chlore résiduel libre (mg/L)', type: 'number', step: '0.01', requis: true },
      { id: 'ph', label: 'pH', type: 'number', step: '0.1' },
      { id: 'operateur', label: 'Opérateur', type: 'text' },
      { id: 'observation', label: 'Observation', type: 'textarea' },
    ],
    titreLigne: (e) => `${e.point || 'Point d’eau'} · Cl ${String(e.chlore ?? '').replace('.', ',')} mg/L${e.ph ? ` · pH ${String(e.ph).replace('.', ',')}` : ''}`,
    sousTitre: (e) => [e.operateur, e.observation].filter(Boolean).join(' · '),
    conforme: (e) => {
      const cl = parseFloat(e.chlore);
      if (isNaN(cl)) return undefined;
      const ph = parseFloat(e.ph);
      return cl >= 0.2 && (isNaN(ph) || (ph >= 6.5 && ph <= 8.5));
    },
  },
  {
    id: 'vecteurs',
    titre: 'Lutte antivectorielle',
    description: 'Dératisation, désinsectisation, capture d’animaux',
    champs: [
      { id: 'type', label: 'Opération', type: 'select', options: ['Dératisation', 'Désinsectisation', 'Capture d’animaux', 'Autre'], requis: true },
      { id: 'zone', label: 'Zone traitée', type: 'text', placeholder: 'ex. Cuisine, vide sanitaire', requis: true },
      { id: 'produit', label: 'Produit ou méthode', type: 'text' },
      { id: 'intervenant', label: 'Intervenant (société, équipe)', type: 'text' },
      { id: 'observation', label: 'Observation', type: 'textarea' },
    ],
    titreLigne: (e) => `${e.type || 'Opération'} · ${e.zone || ''}`,
    sousTitre: (e) => [e.produit, e.intervenant, e.observation].filter(Boolean).join(' · '),
  },
  {
    id: 'prelevements',
    titre: 'Prélèvements',
    description: 'Eau, aliments, surfaces, air : suivi des résultats',
    repere:
      'Surfaces (manuel d’hygiène hospitalière, Ministère de la Santé 2010) : moins de 5 colonies par boîte au bloc opératoire, en salle d’examen invasif et en stérilisation (conditionnement) ; moins de 1 colonie en pharmacie (hotte). Fréquence conseillée au bloc : surfaces 1 fois par trimestre, air 3 à 4 fois par an et après chaque changement de filtres. Eau d’hémodialyse : moins de 100 CFU par litre, 1 prélèvement par mois.',
    champs: [
      { id: 'nature', label: 'Nature', type: 'select', options: ['Eau de boisson', 'Eau d’hémodialyse', 'Aliment', 'Surface', 'Air', 'Matériel ou dispositif'], requis: true },
      { id: 'lieu', label: 'Lieu ou échantillon', type: 'text', placeholder: 'ex. Cuisine, bloc opératoire', requis: true },
      { id: 'zoneSeuil', label: 'Zone (seuil du manuel)', type: 'select', options: ZONES_SURFACE.map((z) => z.label), si: { champ: 'nature', valeurs: ['Surface'] } },
      { id: 'colonies', label: 'Colonies par boîte', type: 'number', step: '1', si: { champ: 'nature', valeurs: ['Surface'] } },
      { id: 'laboratoire', label: 'Laboratoire', type: 'text' },
      { id: 'resultat', label: 'Résultat', type: 'select', options: ['En attente', 'Conforme', 'Non conforme'], requis: true },
      { id: 'observation', label: 'Observation', type: 'textarea' },
    ],
    titreLigne: (e) => `${e.nature || 'Prélèvement'} · ${e.lieu || ''}`,
    sousTitre: (e) =>
      [resultatSurface(e) || e.resultat, e.colonies !== undefined && e.colonies !== '' ? `${e.colonies} col./boîte` : '', e.laboratoire, e.observation].filter(Boolean).join(' · '),
    resultatAuto: resultatSurface,
    conforme: (e) => {
      const r = resultatSurface(e) || e.resultat;
      return r === 'Conforme' ? true : r === 'Non conforme' ? false : undefined;
    },
  },
  {
    id: 'sensibilisation',
    titre: 'Sensibilisation et formation',
    description: 'Séances pour le personnel : thème, public, participants',
    champs: [
      { id: 'theme', label: 'Thème', type: 'text', suggestions: ['Hygiène des mains', 'Tri des déchets', 'Bionettoyage', 'Sécurité alimentaire', 'Accident d’exposition au sang'], requis: true },
      { id: 'public', label: 'Public concerné', type: 'text', suggestions: ['Agents de nettoyage', 'Personnel de cuisine', 'Infirmiers', 'Médecins'], requis: true },
      { id: 'participants', label: 'Nombre de participants', type: 'number', step: '1' },
      { id: 'animateur', label: 'Animateur', type: 'text' },
      { id: 'observation', label: 'Observation', type: 'textarea' },
    ],
    titreLigne: (e) => `${e.theme || 'Séance'}`,
    sousTitre: (e) => [e.public, e.participants ? `${e.participants} participant(s)` : '', e.animateur].filter(Boolean).join(' · '),
  },
];

/* ------------------------- Plan d'action annuel ------------------------- */

/** Source de comptage automatique du réalisé. */
export type SourceAuto =
  | 'eau_chlore'
  | 'prelev_eau'
  | 'prelev_hemo'
  | 'prelev_aliment'
  | 'prelev_surface'
  | 'derat'
  | 'desins'
  | 'capture'
  | 'seances'
  | 'audit_cuisine'
  | 'audit_dmp'
  | 'audit_env'
  | 'audit_mains'
  | 'audit_ster';

export const SOURCE_LABEL: Record<SourceAuto, string> = {
  eau_chlore: 'Registre eau de boisson',
  prelev_eau: 'Registre prélèvements (eau de boisson)',
  prelev_hemo: 'Registre prélèvements (eau d’hémodialyse)',
  prelev_aliment: 'Registre prélèvements (aliments)',
  prelev_surface: 'Registre prélèvements (surfaces, air, matériel)',
  derat: 'Registre lutte antivectorielle (dératisation)',
  desins: 'Registre lutte antivectorielle (désinsectisation)',
  capture: 'Registre lutte antivectorielle (capture)',
  seances: 'Registre sensibilisation et formation',
  audit_cuisine: 'Audits cuisine',
  audit_dmp: 'Audits (rubrique déchets)',
  audit_env: 'Audits (rubrique environnement)',
  audit_mains: 'Audits (rubrique hygiène des mains)',
  audit_ster: 'Audits (rubrique stérilisation)',
};

export interface Activite {
  id: string;
  axe: string;
  titre: string;
  outil: string;
  indicateur: string;
  responsable: string;
  /** nombre prévu pour chacun des 12 mois */
  prevu: number[];
  /** réalisé saisi à la main (si pas de source auto) */
  manuel: number[];
  source?: SourceAuto;
}

export interface PlanAnnuel {
  annee: number;
  activites: Activite[];
  /** premier mois suivi (0 = janvier) : avant, rien n'est compté en retard */
  suiviDepuis?: number;
  /** true dès que l'utilisateur a choisi ou modifié son plan (sinon : plan type proposé tel quel). */
  choisi?: boolean;
  /** axes ajoutés par l'utilisateur */
  axesPerso?: string[];
  updatedAt: string;
}

const M = (n: number) => Array(12).fill(n);
const mois = (...idx: number[]) => Array.from({ length: 12 }, (_, i) => (idx.includes(i + 1) ? 1 : 0));
const Z = () => Array(12).fill(0);

const THM = 'Technicien d’hygiène du milieu';

export const AXES = [
  'Eau de boisson et eau d’hémodialyse',
  'Hygiène et sécurité alimentaires',
  'Gestion des déchets de soins',
  'Nettoyage et désinfection des locaux',
  'Lutte antivectorielle',
  'Lutte contre les infections nosocomiales',
  'Information, éducation, communication et gestion',
];

let n = 0;
const a = (
  axe: number,
  titre: string,
  outil: string,
  indicateur: string,
  prevu: number[],
  source?: SourceAuto,
  responsable = THM
): Activite => ({
  id: `act_${++n}`,
  axe: AXES[axe],
  titre,
  outil,
  indicateur,
  responsable,
  prevu,
  manuel: Z(),
  source,
});

/** Plan type : à modifier dans l'application. */
export function planParDefaut(annee: number): PlanAnnuel {
  n = 0;
  return {
    annee,
    suiviDepuis: annee === new Date().getFullYear() ? new Date().getMonth() : 0,
    updatedAt: new Date().toISOString(),
    activites: [
      a(0, 'Tests de chlore résiduel libre', 'Registre eau de boisson, grille d’évaluation', 'Nombre de tests (1 fois par semaine)', M(4), 'eau_chlore'),
      a(0, 'Prélèvements d’eau de boisson pour analyse bactériologique', 'Bulletins de prélèvements', 'Nombre d’analyses réalisées, nombre non conformes', mois(2, 6, 10), 'prelev_eau'),
      a(0, 'Prélèvements d’eau d’hémodialyse (bactériologie et physico-chimie)', 'Bulletins de prélèvements', 'Nombre d’analyses réalisées, nombre non conformes', mois(2, 6, 10), 'prelev_hemo'),
      a(1, 'Supervision de la cuisine (grille de supervision)', 'Grille de supervision de la restauration', 'Nombre de supervisions (1 fois par semaine)', M(4), 'audit_cuisine'),
      a(1, 'Prélèvements alimentaires pour analyse bactériologique', 'Bulletins de prélèvements alimentaires', 'Nombre de prélèvements, nombre de TIAC', mois(2, 5, 8, 11), 'prelev_aliment'),
      a(1, 'Suivi médical du personnel de cuisine', 'Dossiers médicaux du personnel', 'Dossiers à jour sur personnel total', mois(3, 9)),
      a(1, 'Séances de sensibilisation à la sécurité alimentaire', 'Compte rendu de séance', 'Nombre de séances', mois(3, 6, 9, 12), 'seances'),
      a(2, 'Supervision de la gestion interne des déchets (unités de soins)', 'Grille de supervision de la gestion interne', 'Nombre de supervisions (1 fois par semaine)', M(4), 'audit_dmp'),
      a(2, 'Supervision du local de stockage central des déchets', 'Grille de supervision de la gestion externe', 'Nombre de supervisions (1 fois par semaine)', M(4)),
      a(2, 'Évaluation des pratiques de tri à la source', 'Rapport d’évaluation des pratiques', 'Résultat de l’évaluation', mois(3, 6, 9, 12)),
      a(3, 'Contrôle des opérations de nettoyage des locaux', 'Grille de supervision du nettoyage', 'Nombre de supervisions (1 fois par semaine)', M(4), 'audit_env'),
      a(3, 'Contrôle des produits de nettoyage et de désinfection', 'Grille de conformité des produits', 'Nombre de contrôles (1 fois par semaine)', M(4)),
      a(3, 'Évaluation des pratiques des agents de nettoyage', 'Grille d’évaluation des pratiques', 'Résultat de l’audit', mois(3, 9)),
      a(3, 'Formation des agents de nettoyage', 'Compte rendu de séance', 'Nombre de séances', mois(2, 6, 10), 'seances'),
      a(4, 'Dératisation', 'Registre des opérations de lutte', 'Nombre d’opérations', mois(1, 2, 3), 'derat'),
      a(4, 'Désinsectisation', 'Registre des opérations de lutte', 'Nombre d’opérations', mois(3, 9), 'desins'),
      a(4, 'Capture d’animaux errants', 'Registre des opérations de lutte', 'Nombre d’opérations, nombre d’animaux capturés', Z(), 'capture'),
      a(5, 'Prélèvements bactériologiques des surfaces, de l’air et du matériel', 'Bulletins de prélèvements', 'Nombre de prélèvements, taux de conformité', mois(2, 3, 7, 10, 11), 'prelev_surface', 'THM avec le laboratoire et le CLIN'),
      a(5, 'Évaluation du circuit du linge (propre et sale)', 'Fiche d’évaluation', 'Nombre de fiches remplies', mois(3, 6, 9, 12)),
      a(5, 'Promotion de l’hygiène des mains', 'Compte rendu de séance', 'Nombre de séances de formation', mois(3, 6, 9, 12), 'audit_mains'),
      a(5, 'Opérations de désinfection (grands ménages)', 'Programme de désinfection', 'Taux de réalisation', mois(6, 12)),
      a(6, 'Rapport trimestriel des activités d’hygiène', 'Rapport', 'Rapports élaborés', mois(3, 6, 9, 12)),
      a(6, 'Bilan annuel et plan d’action suivant', 'Bilan', 'Bilan élaboré', mois(12)),
      a(6, 'Comptes rendus des activités d’hygiène', 'Compte rendu', 'Nombre de comptes rendus', M(1)),
    ],
  };
}

export const NOMS_MOIS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
export const NOMS_MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/* ------------------------------ Carnet de bord ------------------------------ */

export type Frequence = 'quotidien' | 'hebdomadaire' | 'mensuel';

export interface TacheJournal {
  id: string;
  titre: string;
  frequence: Frequence;
  zone?: string;
}

export const FREQUENCE_LABEL: Record<Frequence, string> = {
  quotidien: 'Chaque jour',
  hebdomadaire: 'Chaque semaine',
  mensuel: 'Chaque mois',
};

/** Tâches de départ du THM : à modifier dans l'application. */
export const TACHES_PAR_DEFAUT: TacheJournal[] = [
  { id: 't_1', titre: 'Tournée des services : contrôle du bionettoyage', frequence: 'quotidien' },
  { id: 't_2', titre: 'Contrôle de la cuisine : hygiène, tenue, températures', frequence: 'quotidien', zone: 'Cuisine' },
  { id: 't_3', titre: 'Circuit des déchets : tri, collecte, local de stockage', frequence: 'quotidien', zone: 'Déchets' },
  { id: 't_4', titre: 'Distributeurs de savon et de solution hydro-alcoolique', frequence: 'quotidien' },
  { id: 't_5', titre: 'Test de chlore résiduel libre', frequence: 'hebdomadaire', zone: 'Eau' },
  { id: 't_6', titre: 'Supervision de la cuisine (grille)', frequence: 'hebdomadaire', zone: 'Cuisine' },
  { id: 't_7', titre: 'Supervision de la gestion des déchets dans les unités de soins', frequence: 'hebdomadaire', zone: 'Déchets' },
  { id: 't_8', titre: 'Contrôle des produits de nettoyage et de désinfection', frequence: 'hebdomadaire' },
  { id: 't_9', titre: 'Supervision du local de stockage central des déchets', frequence: 'hebdomadaire', zone: 'Déchets' },
  { id: 't_10', titre: 'Contrôle des bacs à graisse, siphons et abords', frequence: 'mensuel' },
  { id: 't_11', titre: 'Compte rendu mensuel des activités', frequence: 'mensuel' },
];
