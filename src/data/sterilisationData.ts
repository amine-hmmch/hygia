import { SterilisationProgramme, SterilisationCycle } from '../types';

export interface SterilisationPhase {
  numero: number;
  titre: string;
  pourquoi: string[];
  comment: string[];
  precautions: string[];
  regleCle?: string;
}

export const STERILISATION_PHASES: SterilisationPhase[] = [
  {
    numero: 1,
    titre: 'Phase de Pré-désinfection',
    pourquoi: [
      'Éliminer les souillures visibles',
      'Diminuer la population de micro-organismes',
      'Protéger le personnel lors de la manipulation des instruments',
      'Éviter la contamination de l’environnement',
      'Faciliter le nettoyage ultérieur',
    ],
    comment: [
      'Premier traitement à effectuer sur les objets et matériels souillés, le plus rapidement possible et le plus près du lieu d’utilisation.',
      'Démonter les instruments et les immerger totalement dans un bac contenant un produit détergent-désinfectant.',
      'Fermer hermétiquement le bac de pré-désinfection.',
      'Respecter scrupuleusement la concentration du produit et la durée de trempage recommandée par le fabricant.',
      'Rincer à l’eau du robinet après trempage.',
    ],
    precautions: [
      'Étape indispensable avant toute désinfection ou stérilisation.',
      'Port des EPI obligatoire (blouse/surblouse, gants de protection, masque, lunettes si risque de projection).',
    ],
    regleCle: 'Le plus rapidement possible et le plus près du lieu d’utilisation.',
  },
  {
    numero: 2,
    titre: 'Phase de Nettoyage des instruments',
    pourquoi: [
      'Éliminer le produit pré-désinfectant et les salissures adhérentes.',
      'Atteindre le minimum de contamination avant la stérilisation.',
    ],
    comment: [
      'Effectuer un tri pour séparer le matériel défectueux de celui en bon état.',
      'Utiliser un produit détergent ou détergent bactéricide de préférence.',
      'Brosser le matériel avec une brosse non abrasive (pour éviter la formation de microfissures, lieu privilégié pour la formation d’un biofilm).',
      'Ouvrir largement les instruments articulés et démonter les instruments à doigt.',
      'Irriguer tout matériel creux à l’aide d’une seringue à usage unique.',
    ],
    precautions: [
      'Ne jamais utiliser de brosse métallique ou abrasive.',
      'Vérifier minutieusement les crémaillères, mâchoires et charnières des pinces.',
    ],
  },
  {
    numero: 3,
    titre: 'Phase de Rinçage',
    pourquoi: ['Obtenir un matériel médical propre exempt de tout résidu de détergent.'],
    comment: [
      'Rinçage abondant à l’eau courante du réseau.',
      'Réalisé de façon manuelle ou automatique.',
      'Un rinçage abondant est obligatoire après l’action de détersion.',
    ],
    precautions: ['Rincer soigneusement les canaux et cavités des instruments creux.'],
  },
  {
    numero: 4,
    titre: 'Phase de Séchage',
    pourquoi: ['Optimiser l’efficacité de la stérilisation (la vapeur n’agit efficacement que sur du matériel sec).'],
    comment: [
      'Égouttage puis séchage soigné du matériel.',
      'Sécher à l’aide d’un torchon propre absorbant ou à usage unique.',
    ],
    precautions: [
      'L’humidité résiduelle empêche la bonne montée en température et favorise la survie microbienne.',
    ],
    regleCle: 'ON NE STÉRILISE BIEN QUE CE QUI EST PROPRE ET SEC',
  },
  {
    numero: 5,
    titre: 'Phase de Conditionnement & Étiquetage',
    pourquoi: [
      'Avant la stérilisation : protéger le dispositif médical propre d’un risque de recontamination.',
      'Pendant la stérilisation : permettre le passage et la pénétration de l’agent stérilisant (la vapeur d’eau).',
      'Après la stérilisation : assurer la conservation de l’état stérile et permettre la mise à disposition aseptique.',
    ],
    comment: [
      'Remonter les instruments dans leur format initial.',
      'Mettre le matériel dans le conditionnement adéquat, perméable à l’air et à la vapeur, sans qu’il soit trop tassé ou serré.',
      'Emballage à usage unique : papier crêpé, papier lisse, sachets thermo-soudés (disposés plastique contre plastique).',
      'Emballage réutilisable : conteneurs (boîtes spécifiques) munis de filtres ou de valves pour la chaleur humide.',
      'Contrôler la fermeture étanche de chaque emballage (thermo-soudure continue ≥ 8 mm).',
      'Étiquetage : noter la date, le numéro de cycle et la nature du matériel sur l’emballage.',
      'Coller un ruban adhésif avec témoin de passage chimique (qui vire de couleur lors du cycle).',
    ],
    precautions: [
      'Ne pas surcharger les boîtes ni tasser les sachets.',
      'Un conditionnement percé, déchiré ou mouillé annule immédiatement la stérilité.',
    ],
  },
  {
    numero: 6,
    titre: 'Phase de Stérilisation (Autoclave chaleur humide)',
    pourquoi: ['Éliminer ou tuer tous les micro-organismes (bactéries, spores, virus, champignons) sur le matériel thermorésistant.'],
    comment: [
      'La stérilisation par la chaleur humide (autoclave) est la méthode de référence, plus fiable, plus facile à valider et à contrôler.',
      'Utiliser obligatoirement de l’eau distillée (évite les dépôts de sels minéraux et cuivre transportés par la vapeur).',
      '3 phases du cycle : Préchauffage (alternance de dépressions), Phase de stérilisation (plateau thermique), Séchage (abaissement de la pression).',
      'Paramètres réglementaires préconisés par le guide :',
      '• 134°C pendant 18 minutes sous 3 bars pour les instruments de soins et de petite chirurgie.',
      '• 125°C pendant 20 minutes sous 3 bars pour le caoutchouc et le textile.',
      'Chargement : les articles ne doivent pas toucher les parois de la cuve ; sachets disposés face plastique contre face plastique sans être tassés ; boîtes non superposées ; charges lourdes en bas et faces creuses vers le bas pour éviter la condensation.',
    ],
    precautions: [
      'Le temps de stérilisation est compté uniquement à partir du moment où la température et la pression choisies sont atteintes (début du plateau).',
      'Ne jamais interrompre le cycle avant la fin de la phase de séchage.',
    ],
    regleCle: 'Chaleur humide à l’eau distillée : 134°C / 18 min ou 125°C / 20 min sous 3 bars',
  },
  {
    numero: 7,
    titre: 'Phase de Contrôle',
    pourquoi: ['Garantir une stérilité parfaite du matériel avant toute libération pour les soins.'],
    comment: [
      'Contrôle avant stérilisation (quotidien) : Test de Bowie et Dick chaque jour avant la première charge (paquet standard traité à 134°C pendant 3 min 30 s). Contrôle la bonne diffusion de la vapeur par virage homogène de l’indicateur coloré.',
      'Contrôle pendant le cycle : vérifier le diagramme enregistreur ou le ticket d’enregistrement (montée de température, durée du plateau, pression selon le diagramme de Regnault).',
      'Contrôle lors du déchargement :',
      '-- Siccité de la charge : vérifier l’absence de toute trace d’humidité sur chaque paquet.',
      '-- Indicateur de passage : vérifier le virage complet et homogène des témoins physico-chimiques (rubans ou encres auto-virantes).',
      '-- Intégrité des conditionnements : vérifier l’absence de perforation, déchirure ou décollement.',
    ],
    precautions: [
      'En cas d’échec du test de Bowie-Dick : ne pas utiliser le stérilisateur avant réparation.',
      'Un article dont l’emballage est détérioré ou humide est déclaré NON-CONFORME.',
      'Le résultat de TOUS les contrôles doit être conforme pour déclarer une charge stérile.',
    ],
    regleCle: 'Tous les contrôles doivent être conformes pour libérer la charge stérile.',
  },
  {
    numero: 8,
    titre: 'Phase de Stockage',
    pourquoi: ['Maintenir la stérilité du matériel jusqu’au moment de son utilisation aseptique.'],
    comment: [
      'Conserver dans des conditions aseptiques : endroit propre, sec, à l’abri de la lumière solaire directe et de toute contamination.',
      'Stockage sur un rayonnage dans un local spécifique ou placard/tiroir propre fermé.',
      'Respecter les dates limites d’utilisation et la rotation des stocks (premier entré, premier sorti).',
    ],
    precautions: ['Manipuler les paquets stériles avec des mains propres et sèches sans les comprimer.'],
  },
  {
    numero: 9,
    titre: 'Phase de Traçabilité (Registre de Stérilisation)',
    pourquoi: ['Documenter, archiver et prouver la conformité des cycles pour chaque acte de soin.'],
    comment: [
      'Les ESSP doivent établir obligatoirement un « Registre de stérilisation ».',
      'Renseigner pour chaque cycle : Date et heure, Numéro d’autoclave et de cycle, Identité de l’opérateur, Programme sélectionné (T°, durée, pression), Composition de la charge, Résultat du test de Bowie-Dick, Virage des indicateurs de contrôle, Siccité et intégrité de l’emballage, Visa de libération et observations/maintenance.',
    ],
    precautions: ['Archivage sécurisé du registre permettant de relier un lot stérile à son cycle de traitement.'],
  },
];

export const PROGRAMMES_GUIDE = {
  instruments_134: {
    id: 'instruments_134' as SterilisationProgramme,
    label: 'Instruments de soins et petite chirurgie (134°C / 18 min)',
    temperature: 134,
    dureeMin: 18,
    pressionMoyenne: 3,
    description: 'Programme de référence pour tout le matériel métallique thermorésistant, instruments chirurgicaux et boîtes de soins.',
  },
  textile_caoutchouc_125: {
    id: 'textile_caoutchouc_125' as SterilisationProgramme,
    label: 'Caoutchouc et textile (125°C / 20 min)',
    temperature: 125,
    dureeMin: 20,
    pressionMoyenne: 3,
    description: 'Programme spécifique pour les champs opératoires, compresses textiles et pièces en caoutchouc.',
  },
  bowie_dick_134: {
    id: 'bowie_dick_134' as SterilisationProgramme,
    label: 'Test de Bowie et Dick (134°C / 3 min 30 s)',
    temperature: 134,
    dureeMin: 3.5,
    pressionMoyenne: 3,
    description: 'Test quotidien d’évacuation de l’air et de pénétration de la vapeur avant la première charge de la journée.',
  },
};

/**
 * Validates cycle parameters strictly according to Chapter V of the Moroccan Guide.
 * Returns an array of anomaly alert messages if parameters deviate from official standards.
 */
export function validateCycleParameters(data: {
  programme: SterilisationProgramme;
  temperature: number;
  duree: number;
  pression: number;
  bowieDickConforme: boolean | 'non_applicable';
  resultatIndicateur: 'conforme' | 'non_conforme';
  sicciteConforme: boolean;
  integriteEmballageConforme: boolean;
}): { estConforme: boolean; anomalies: string[] } {
  const anomalies: string[] = [];
  const progCfg = PROGRAMMES_GUIDE[data.programme];

  // 1. Température check
  if (data.programme === 'instruments_134' && data.temperature !== 134) {
    anomalies.push(
      `Température non conforme (${data.temperature}°C). La valeur réglementaire du guide pour les instruments est de 134°C.`
    );
  } else if (data.programme === 'textile_caoutchouc_125' && data.temperature !== 125) {
    anomalies.push(
      `Température non conforme (${data.temperature}°C). La valeur réglementaire du guide pour le textile et caoutchouc est de 125°C.`
    );
  } else if (data.programme === 'bowie_dick_134' && data.temperature !== 134) {
    anomalies.push(
      `Température non conforme (${data.temperature}°C). Le test de Bowie-Dick doit être réalisé à 134°C.`
    );
  }

  // 2. Durée check
  if (data.duree < progCfg.dureeMin) {
    anomalies.push(
      `Durée du plateau insuffisante (${data.duree} min). Minimum réglementaire du guide : ${progCfg.dureeMin} min.`
    );
  }

  // 3. Pression check (Guide specifies: "La pression moyenne est de 03 bars")
  if (data.pression < 2.8 || data.pression > 3.2) {
    anomalies.push(
      `Pression hors norme (${data.pression} bars). La pression de vapeur saturée préconisée par le guide est de 3 bars (diagramme de Regnault).`
    );
  }

  // 4. Test Bowie-Dick check
  if (data.bowieDickConforme === false) {
    anomalies.push(
      'Test de Bowie et Dick NON CONFORME. Le stérilisateur ne doit pas être utilisé avant réparation (défaut de pénétration de vapeur).'
    );
  }

  // 5. Indicateur physico-chimique
  if (data.resultatIndicateur === 'non_conforme') {
    anomalies.push(
      'Indicateur physico-chimique non conforme. Le témoin de passage n’a pas viré de façon homogène.'
    );
  }

  // 6. Siccité check
  if (!data.sicciteConforme) {
    anomalies.push(
      'Siccité non conforme : présence d’humidité résiduelle au déchargement (risque de contamination microbienne secondaire).'
    );
  }

  // 7. Intégrité emballage check
  if (!data.integriteEmballageConforme) {
    anomalies.push(
      'Intégrité du conditionnement non conforme. Un article dont l’emballage est détérioré est déclaré non-conforme selon le guide.'
    );
  }

  return {
    estConforme: anomalies.length === 0,
    anomalies,
  };
}
