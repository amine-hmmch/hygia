import { ChecklistTemplate } from '../types';

export const DEFAULT_SERVICES = [
  'Salle de Soins',
  'Consultation Médicale',
  'Consultation Santé Maternelle et Infantile (SMI)',
  'Salle d’Accouchement',
  'Local de Stérilisation',
  'Laboratoire d’Analyses Médicales',
  'Unité Dentaire',
  'Pharmacie / Dépôt des Médicaments',
  'Urgences / Salle de Tri',
  'Local d’Entreposage des Déchets (DMP)',
  'Salles d’Attente & Accueil',
  'Sanitaires et Parties Communes',
  'Buanderie / Lingerie',
];

export const CHECKLIST_COURTE: ChecklistTemplate = {
  version: 'courte',
  titre: 'Check-list de la Sécurité Sanitaire des ESSP (Version courte)',
  tableauNumero: 'Tableau 20',
  description: 'Évaluation rapide de terrain des 5 composantes clés de sécurité sanitaire selon le Guide du Professionnel (Ministère de la Santé, Maroc).',
  composantes: [
    {
      id: 'env_interne',
      titre: 'L’hygiène de l’environnement interne',
      description: 'Entretien des locaux, passages et moyens de nettoyage.',
      items: [
        { id: 'c_env_1', titre: 'Nombre de passages respecté' },
        { id: 'c_env_2', titre: 'Disponibilité du matériel et produits de nettoyage' },
        { id: 'c_env_3', titre: 'Agent de nettoyage présent et qualifié' },
      ],
    },
    {
      id: 'epi',
      titre: 'Les mesures de protections individuelles',
      description: 'Disponibilité des Équipements de Protection Individuelle (EPI).',
      sousCategories: [
        {
          id: 'c_epi_disp',
          titre: 'Disponibilité des EPI',
          items: [
            { id: 'c_epi_1', titre: 'Masques, visières et lunettes' },
            { id: 'c_epi_2', titre: 'Gants' },
            { id: 'c_epi_3', titre: 'Tenue de travail adaptée' },
          ],
        },
      ],
    },
    {
      id: 'hygiene_mains',
      titre: 'L’hygiène des mains',
      description: 'Points d’eau, consommables et friction hydro-alcoolique.',
      sousCategories: [
        {
          id: 'c_mains_disp',
          titre: 'Disponibilité de',
          items: [
            { id: 'c_mains_1', titre: 'Point d’eau accessible et fonctionnel' },
            { id: 'c_mains_2', titre: 'Savon liquide' },
            { id: 'c_mains_3', titre: 'Essuie-mains à usage unique' },
            { id: 'c_mains_4', titre: 'Solution hydro-alcoolique (SHA)' },
          ],
        },
      ],
    },
    {
      id: 'sterilisation',
      titre: 'La stérilisation',
      description: 'Équipements, consommables et indicateurs du plateau technique.',
      items: [
        { id: 'c_ster_1', titre: 'Autoclave' },
        { id: 'c_ster_2', titre: 'Soudeuse' },
        { id: 'c_ster_3', titre: 'Distillateur' },
        { id: 'c_ster_4', titre: 'Bacs de trempage' },
        { id: 'c_ster_5', titre: 'Solutions désinfectantes' },
        { id: 'c_ster_6', titre: 'Textiles' },
        { id: 'c_ster_7', titre: 'Rouleaux de papier d’emballage' },
        { id: 'c_ster_8', titre: 'Papier de marquage indicateur' },
      ],
    },
    {
      id: 'dechets_dmp',
      titre: 'La gestion des DMP',
      description: 'Gestion des Déchets Médicaux et Pharmaceutiques.',
      sousCategories: [
        {
          id: 'c_dmp_art',
          titre: 'Disponibilité des articles',
          items: [
            { id: 'c_dmp_1', titre: 'Sachets rouges (déchets à risques infectieux anatomiques)' },
            { id: 'c_dmp_2', titre: 'Sachets marrons (déchets chimiques et pharmaceutiques)' },
            { id: 'c_dmp_3', titre: 'Sachets noirs (déchets assimilés aux ordures ménagères)' },
            { id: 'c_dmp_4', titre: 'Conteneurs jaunes (boîtes pour objets piquants, coupants, tranchants)' },
          ],
        },
        {
          id: 'c_dmp_etapes',
          titre: 'Étapes de gestion des déchets',
          items: [
            { id: 'c_dmp_5', titre: 'Tri à la source' },
            { id: 'c_dmp_6', titre: 'Conditionnement adapté et fermé' },
            { id: 'c_dmp_7', titre: 'Ramassage selon circuit sécurisé' },
            { id: 'c_dmp_8', titre: 'Stockage dans un local dédié' },
            { id: 'c_dmp_9', titre: 'Collecte et évacuation conforme' },
          ],
        },
      ],
    },
  ],
};

export const CHECKLIST_EXHAUSTIVE: ChecklistTemplate = {
  version: 'exhaustive',
  titre: 'Check-list de la Sécurité Sanitaire des ESSP (Version exhaustive)',
  tableauNumero: 'Tableau 21',
  description: 'Évaluation complète et approfondie de toutes les dimensions de sécurité sanitaire selon le Guide du Professionnel (Ministère de la Santé, Maroc).',
  composantes: [
    {
      id: 'hygiene_mains',
      titre: 'L’hygiène des mains',
      description: 'Infrastructures, consommables et respect des techniques de lavage/friction.',
      sousCategories: [
        {
          id: 'ex_mains_infra',
          titre: '1. Infrastructure et matériel',
          items: [
            { id: 'ex_hm_1', titre: 'Accès à un point d’eau fonctionnel' },
            { id: 'ex_hm_2', titre: 'Distributeur de savon liquide' },
            { id: 'ex_hm_3', titre: 'Distributeur de solution hydro alcoolique' },
            { id: 'ex_hm_4', titre: 'Poubelle ouverte ou équipée d’une commande non manuelle' },
          ],
        },
        {
          id: 'ex_mains_conso',
          titre: '2. Disponibilité des consommables',
          items: [
            { id: 'ex_hm_5', titre: 'Savon liquide en quantité suffisante' },
            { id: 'ex_hm_6', titre: 'Solution hydro alcoolique (SHA)' },
            { id: 'ex_hm_7', titre: 'Essuie-main à usage unique' },
          ],
        },
        {
          id: 'ex_mains_prat',
          titre: '3. Respect des bonnes pratiques',
          items: [
            { id: 'ex_hm_8', titre: 'Respect des bonnes pratiques (Indication et technique de friction/lavage)' },
          ],
        },
      ],
    },
    {
      id: 'epi',
      titre: 'Les mesures de protections individuelles',
      description: 'Disponibilité et port des équipements de protection individuelle.',
      sousCategories: [
        {
          id: 'ex_epi_disp',
          titre: 'Disponibilité des équipements de protection individuelle (EPI)',
          items: [
            { id: 'ex_epi_1', titre: 'Masques à usage unique (chirurgicaux / FFP2)' },
            { id: 'ex_epi_2', titre: 'Gants (d’examen et de soins)' },
            { id: 'ex_epi_3', titre: 'Blouses de travail' },
            { id: 'ex_epi_4', titre: 'Surblouses étanches / de protection' },
          ],
        },
      ],
    },
    {
      id: 'env_interne',
      titre: 'L’hygiène de l’environnement interne',
      description: 'Produits d’entretien, zonage des locaux (Zones 1, 2, 3) et hygiène des équipements.',
      sousCategories: [
        {
          id: 'ex_env_prod',
          titre: '1. Disponibilité des produits',
          items: [
            { id: 'ex_env_1', titre: 'Savon liquide' },
            { id: 'ex_env_2', titre: 'Détergent' },
            { id: 'ex_env_3', titre: 'Désinfectant (eau de javel ou désinfectant agréé)' },
          ],
        },
        {
          id: 'ex_env_zone1',
          titre: '2. Hygiène des locaux — Zone 1 (Nettoyage quotidien, Propreté macroscopique)',
          items: [
            { id: 'ex_z1_1', titre: 'Halls d’accueil' },
            { id: 'ex_z1_2', titre: 'Bureaux administratifs' },
            { id: 'ex_z1_3', titre: 'Buanderie' },
            { id: 'ex_z1_4', titre: 'Pharmacie' },
            { id: 'ex_z1_5', titre: 'Salle de réunion' },
            { id: 'ex_z1_6', titre: 'Salle de repos' },
          ],
        },
        {
          id: 'ex_env_zone2',
          titre: '2. Hygiène des locaux — Zone 2 (Bio-Nettoyage quotidien, Propreté macroscopique et microscopique)',
          items: [
            { id: 'ex_z2_1', titre: 'Couloirs de circulation' },
            { id: 'ex_z2_2', titre: 'Ascenseurs' },
            { id: 'ex_z2_3', titre: 'Escaliers' },
            { id: 'ex_z2_4', titre: 'Salles d’attente' },
            { id: 'ex_z2_5', titre: 'Salles de Consultation' },
            { id: 'ex_z2_6', titre: 'Salle de rééducation' },
            { id: 'ex_z2_7', titre: 'Locaux d’entreposage des déchets du linge sale' },
            { id: 'ex_z2_8', titre: 'Sanitaires' },
          ],
        },
        {
          id: 'ex_env_zone3',
          titre: '2. Hygiène des locaux — Zone 3 (Bio-Nettoyage bi-quotidien, Propreté macroscopique et microscopique)',
          items: [
            { id: 'ex_z3_1', titre: 'Salle de Soins' },
            { id: 'ex_z3_2', titre: 'Salle d’accouchement' },
            { id: 'ex_z3_3', titre: 'Local de Stérilisation' },
            { id: 'ex_z3_4', titre: 'Unité dentaire' },
            { id: 'ex_z3_5', titre: 'Laboratoire' },
          ],
        },
        {
          id: 'ex_env_equip',
          titre: '3. Hygiène des équipements médicaux',
          items: [
            { id: 'ex_eq_1', titre: 'Nettoyage et désinfection après chaque usage : Matériel sans contact avec le malade ou destiné à être en contact avec la peau saine' },
            { id: 'ex_eq_2', titre: 'Stérilisation après chaque usage : Matériel destiné à être en contact avec les muqueuses ou la peau lésée superficiellement' },
            { id: 'ex_eq_3', titre: 'Stérilisation après chaque usage : Matériel destiné à être introduit dans le système vasculaire, dans une cavité ou tout autre tissu stérile, quelle que soit la voie d’abord' },
          ],
        },
      ],
    },
    {
      id: 'sterilisation',
      titre: 'La stérilisation',
      description: 'Matériel, chaîne opératoire de stérilisation et registre de traçabilité.',
      sousCategories: [
        {
          id: 'ex_ster_mat',
          titre: '1. Disponibilité du matériel',
          items: [
            { id: 'ex_st_1', titre: 'Autoclave fonctionnelle' },
            { id: 'ex_st_2', titre: 'Distillateur d’eau' },
            { id: 'ex_st_3', titre: 'Soudeuse thermique' },
            { id: 'ex_st_4', titre: 'Désinfectant' },
            { id: 'ex_st_5', titre: 'Détergent enzymatique' },
            { id: 'ex_st_6', titre: 'Brosse non abrasive' },
            { id: 'ex_st_7', titre: 'Sachets de conditionnement' },
            { id: 'ex_st_8', titre: 'Conteneurs étanches' },
          ],
        },
        {
          id: 'ex_ster_proc',
          titre: '2. Respect du processus de stérilisation',
          items: [
            { id: 'ex_st_9', titre: 'Pré-désinfection immédiate après utilisation' },
            { id: 'ex_st_10', titre: 'Nettoyage minutieux des instruments' },
            { id: 'ex_st_11', titre: 'Rinçage à l’eau courante' },
            { id: 'ex_st_12', titre: 'Séchage complet du matériel' },
            { id: 'ex_st_13', titre: 'Conditionnement sous emballage scellé' },
            { id: 'ex_st_14', titre: 'Stérilisation par la chaleur humide (Autoclave)' },
            { id: 'ex_st_15', titre: 'Contrôle des paramètres physico-chimiques / bandelettes' },
            { id: 'ex_st_16', titre: 'Stockage à l’abri de l’humidité et de la poussière' },
          ],
        },
        {
          id: 'ex_ster_reg',
          titre: '3. Registre de traçabilité',
          items: [
            { id: 'ex_st_17', titre: 'Tenue du registre de stérilisation (date, lot, température, pression, visa)' },
          ],
        },
      ],
    },
    {
      id: 'dechets_dmp',
      titre: 'La gestion des déchets médicaux et pharmaceutiques',
      description: 'Matériel de tri, filière d’élimination et tenue du registre DMP.',
      sousCategories: [
        {
          id: 'ex_dmp_mat',
          titre: '1. Disponibilité du matériel',
          items: [
            { id: 'ex_dp_1', titre: 'Conteneurs solides jaunes pour objets tranchants / piquants' },
            { id: 'ex_dp_2', titre: 'Sacs en plastique noirs (déchets banals)' },
            { id: 'ex_dp_3', titre: 'Sacs en plastique rouges (déchets anatomiques/infectieux à risque)' },
            { id: 'ex_dp_4', titre: 'Sacs en plastique marron (déchets pharmaceutiques et chimiques)' },
            { id: 'ex_dp_5', titre: 'Conteneurs ou sacs en plastique blancs' },
            { id: 'ex_dp_6', titre: 'Poubelles pour tri avec couvercle' },
            { id: 'ex_dp_7', titre: 'Conteneurs pour stockage intermédiaire/central' },
          ],
        },
        {
          id: 'ex_dmp_fil',
          titre: '2. Respect de la filière de gestion des déchets',
          items: [
            { id: 'ex_dp_8', titre: 'Tri rigoureux et conditionnement à la source' },
            { id: 'ex_dp_9', titre: 'Ramassage sécurisé selon horaire et circuit défini' },
            { id: 'ex_dp_10', titre: 'Stockage dans le local DMP ventilé et sécurisé' },
            { id: 'ex_dp_11', titre: 'Collecte et enlèvement par la société agréée' },
            { id: 'ex_dp_12', titre: 'Tenue du registre de gestion des DMP (poids, bordereaux de suivi)' },
          ],
        },
      ],
    },
  ],
};

export function getChecklist(version: 'courte' | 'exhaustive'): ChecklistTemplate {
  return version === 'courte' ? CHECKLIST_COURTE : CHECKLIST_EXHAUSTIVE;
}

export function getAllItemsForVersion(version: 'courte' | 'exhaustive'): {
  componentId: string;
  componentTitle: string;
  itemId: string;
  itemTitle: string;
}[] {
  const template = getChecklist(version);
  const result: {
    componentId: string;
    componentTitle: string;
    itemId: string;
    itemTitle: string;
  }[] = [];

  for (const comp of template.composantes) {
    if (comp.items) {
      for (const item of comp.items) {
        result.push({
          componentId: comp.id,
          componentTitle: comp.titre,
          itemId: item.id,
          itemTitle: item.titre,
        });
      }
    }
    if (comp.sousCategories) {
      for (const sub of comp.sousCategories) {
        for (const item of sub.items) {
          result.push({
            componentId: comp.id,
            componentTitle: comp.titre,
            itemId: item.id,
            itemTitle: item.titre,
          });
        }
      }
    }
  }

  return result;
}

export const GUIDE_REFERENCES = {
  titre: 'Guide du Professionnel – Sécurité Sanitaire des ESSP',
  edition: 'Ministère de la Santé, Royaume du Maroc, 2021',
  chapitre: 'Chapitre VII : Suivi et Évaluation (Check-lists Tableaux 20 et 21)',
  objectifs: [
    'Améliorer la qualité et la sécurité des prestations de soins et de services.',
    'Vérifier de manière intégrée les standards de sécurité sanitaire.',
    'Identifier et corriger rapidement les dysfonctionnements constatés.',
    'Assurer la traçabilité sans collecter de données nominatives de patients.',
  ],
};
