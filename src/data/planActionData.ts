/**
 * Plan d'action : mesure corrective recommandée pour chaque point non conforme,
 * avec la source utilisée. Tout est modifiable ensuite par l'utilisateur.
 */

export type Priorite = 'haute' | 'moyenne' | 'basse';

export interface Recommandation {
  mesure: string;
  source: string;
  priorite: Priorite;
  delaiJours: number;
  responsable: string;
}

export const PRIORITE_LABEL: Record<Priorite, string> = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse',
};

const S = {
  env: 'Guide ESSP 2021, ch. II (hygiène de l’environnement)',
  mains: 'Guide ESSP 2021, ch. III (hygiène des mains)',
  epi: 'Guide ESSP 2021, ch. IV (EPI)',
  ster: 'Guide ESSP 2021, ch. V (stérilisation)',
  dmp: 'Guide ESSP 2021, ch. VI (déchets de soins)',
  haccp: 'Principes HACCP (Codex Alimentarius), règlement (CE) 852/2004',
};

const R_INF = 'Infirmier responsable du service';
const R_NET = 'Responsable du bio-nettoyage';
const R_STE = 'Responsable de la stérilisation';
const R_DMP = 'Point focal déchets (DMP)';
const R_CUI = 'Responsable de cuisine';

const rec = (
  mesure: string,
  source: string,
  priorite: Priorite,
  delaiJours: number,
  responsable: string
): Recommandation => ({ mesure, source, priorite, delaiJours, responsable });

const CUISINE_SPEC: Record<string, Recommandation> = {
  r1: rec('Se doter d’un thermomètre sonde, contrôler et enregistrer la température à chaque livraison, refuser les produits hors limite.', S.haccp, 'haute', 3, R_CUI),
  s1: rec('Réparer ou régler le froid, placer un thermomètre visible dans chaque enceinte et relever la température chaque jour.', S.haccp, 'haute', 3, R_CUI),
  s4: rec('Mettre en place le FIFO : étiqueter par date, ranger les anciens lots devant et contrôler chaque semaine.', S.haccp, 'moyenne', 7, R_CUI),
  p3: rec('Rappeler les 5 moments de lavage des mains (savon, 30 s, essuie-mains à usage unique) et vérifier la disponibilité du matériel au lave-mains.', S.haccp, 'haute', 7, R_CUI),
  c4: rec('Contrôler la température à cœur à chaque cuisson (≥ 63 °C, 70 °C pour viande hachée et volaille) avec une sonde désinfectée, et enregistrer.', S.haccp, 'haute', 3, R_CUI),
  f1: rec('Mettre en place un refroidissement rapide (de 63 °C à moins de 10 °C en 2 h) avec bacs peu profonds ou cellule, et un relevé de temps.', S.haccp, 'haute', 7, R_CUI),
  f2: rec('Contrôler la remise en température : 63 °C atteints en moins d’1 h, relevé et élimination du plat si le délai est dépassé.', S.haccp, 'haute', 7, R_CUI),
  d1: rec('Prélever environ 100 g de chaque plat, conserver 5 jours à 0-3 °C, étiqueter (date, repas, plat).', S.haccp, 'haute', 3, R_CUI),
  d3: rec('Rédiger ou mettre à jour l’analyse des dangers et les points critiques (CCP), puis former le personnel.', S.haccp, 'moyenne', 30, R_CUI),
  n1: rec('Rédiger un plan de nettoyage-désinfection (quoi, comment, avec quoi, quand, qui), l’afficher et l’enregistrer.', S.haccp, 'moyenne', 14, R_CUI),
  n5: rec('Faire intervenir un prestataire de lutte contre les nuisibles, boucher les accès et renouveler le contrat.', S.haccp, 'haute', 7, R_CUI),
};

/** Mesures spécifiques à certains points. */
const SPECIFIQUES: Record<string, Recommandation> = {
  // Hygiène des mains
  ex_hm_8: rec(
    'Former l’équipe à la friction (20 à 30 s) et au lavage (40 à 60 s), puis observer les pratiques sur 10 opportunités et noter le taux de conformité.',
    S.mains, 'haute', 14, R_INF),
  c_mains_4: rec(
    'Installer ou réapprovisionner la solution hydro-alcoolique aux points de soins et vérifier le stock chaque semaine.',
    S.mains, 'haute', 7, R_INF),
  ex_hm_3: rec(
    'Installer un distributeur de solution hydro-alcoolique au point de soins et le fixer à hauteur de main.',
    S.mains, 'haute', 7, R_INF),
  ex_hm_6: rec(
    'Réapprovisionner la solution hydro-alcoolique et vérifier le stock chaque semaine.',
    S.mains, 'haute', 7, R_INF),
  // EPI
  ex_epi_1: rec(
    'Commander des masques chirurgicaux et FFP2 (FFP2 pour les risques aéroportés comme la tuberculose) et fixer un seuil de réapprovisionnement.',
    S.epi, 'haute', 10, R_INF),
  // Environnement
  c_env_1: rec(
    'Fixer par écrit le nombre de passages par zone (deux par jour au minimum pour les zones à risque), l’afficher et le faire signer à chaque passage.',
    S.env, 'moyenne', 7, R_NET),
  c_env_3: rec(
    'Affecter un agent formé au bio-nettoyage et organiser une formation (produits, dilutions, ordre du propre vers le sale).',
    S.env, 'moyenne', 21, R_NET),
  ex_env_3: rec(
    'Approvisionner un désinfectant adapté. Pour l’eau de Javel : diluer à 0,5 % (5 000 ppm) pour les déversements de sang, préparer la solution chaque jour.',
    S.env, 'haute', 7, R_NET),
  // Stérilisation
  c_ster_1: rec(
    'Faire intervenir la maintenance sur l’autoclave et ne plus l’utiliser tant que le cycle (134 °C, 18 min) n’est pas validé.',
    S.ster, 'haute', 3, R_STE),
  ex_st_1: rec(
    'Faire intervenir la maintenance sur l’autoclave et ne plus l’utiliser tant que le cycle (134 °C, 18 min) n’est pas validé.',
    S.ster, 'haute', 3, R_STE),
  ex_st_15: rec(
    'Réaliser le test de Bowie et Dick et utiliser des indicateurs à chaque cycle. Enregistrer le résultat dans le registre.',
    S.ster, 'haute', 3, R_STE),
  ex_st_17: rec(
    'Mettre en place un registre de stérilisation (date, lot, température, pression, visa) et le remplir à chaque cycle.',
    S.ster, 'haute', 7, R_STE),
  ex_st_9: rec(
    'Rappeler à l’équipe la pré-désinfection immédiate après usage, sans laisser sécher les instruments. Afficher la consigne.',
    S.ster, 'haute', 7, R_STE),
  // Déchets
  c_dmp_4: rec(
    'Installer des conteneurs jaunes pour objets piquants à chaque point de soins, à hauteur de main, et les remplacer aux deux tiers pleins.',
    S.dmp, 'haute', 5, R_DMP),
  ex_dp_1: rec(
    'Installer des conteneurs jaunes pour objets piquants à chaque point de soins, à hauteur de main, et les remplacer aux deux tiers pleins.',
    S.dmp, 'haute', 5, R_DMP),
  ex_dp_12: rec(
    'Ouvrir un registre des déchets : quantités, catégorie, date, bordereaux de suivi. Désigner la personne qui le remplit.',
    S.dmp, 'moyenne', 7, R_DMP),
  ex_dp_8: rec(
    'Reprendre le tri à la source : affichage des couleurs au-dessus de chaque poubelle et rappel à l’équipe.',
    S.dmp, 'haute', 7, R_DMP),
  ex_dp_11: rec(
    'Vérifier le contrat avec la société de collecte et le calendrier d’enlèvement. Conserver les bordereaux.',
    S.dmp, 'haute', 10, R_DMP),
};

function parGroupe(itemId: string, titre: string, componentId: string): Recommandation {
  const t = titre.replace(/\s+/g, ' ').trim();
  if (componentId === 'cuisine') {
    if (CUISINE_SPEC[itemId]) return CUISINE_SPEC[itemId];
    return rec(
      `Corriger le point : « ${t} ». Définir qui fait quoi, former le personnel concerné, puis vérifier à nouveau lors du prochain audit.`,
      S.haccp, 'moyenne', 14, R_CUI);
  }
  if (/^(c_mains|ex_hm|ex_mains)/.test(itemId) || componentId === 'hygiene_mains') {
    return rec(
      `Rétablir la disponibilité de : ${t}. Désigner un responsable du réapprovisionnement et contrôler chaque semaine.`,
      S.mains, 'haute', 7, R_INF);
  }
  if (/^(c_epi|ex_epi)/.test(itemId) || componentId === 'epi') {
    return rec(
      `Réapprovisionner : ${t}. Fixer un stock minimum et vérifier la disponibilité à chaque prise de poste.`,
      S.epi, 'moyenne', 10, R_INF);
  }
  if (/^(c_ster|ex_st)/.test(itemId) || componentId === 'sterilisation') {
    const proc = /^ex_st_(9|1[0-6])$/.test(itemId);
    return rec(
      proc
        ? `Reprendre l’étape « ${t} » selon la procédure écrite, former l’opérateur et contrôler les cycles suivants.`
        : `Fournir ou réparer : ${t}. Ne pas stériliser tant que le matériel ou le consommable n’est pas conforme.`,
      S.ster, 'haute', proc ? 7 : 10, R_STE);
  }
  if (/^(c_dmp|ex_dp)/.test(itemId) || componentId === 'dechets_dmp') {
    return rec(
      `Mettre en conformité : ${t}. Vérifier les couleurs de sacs et conteneurs, la fermeture et le circuit d’évacuation.`,
      S.dmp, 'moyenne', 10, R_DMP);
  }
  if (/^ex_eq/.test(itemId)) {
    return rec(
      `Appliquer le niveau de traitement requis pour ce matériel (${t}) et l’afficher dans le local.`,
      S.env, 'haute', 7, R_NET);
  }
  return rec(
    `Reprendre le nettoyage et le bio-nettoyage de : ${t}. Utiliser le détergent puis le désinfectant, du plus propre vers le plus sale, et tracer le passage.`,
    S.env, 'moyenne', 7, R_NET);
}

export function getRecommandation(itemId: string, titre: string, componentId = ''): Recommandation {
  return SPECIFIQUES[itemId] ?? parGroupe(itemId, titre, componentId);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
