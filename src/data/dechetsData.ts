import { DechetCategorie } from '../types';

export interface DechetTriItem {
  id: string;
  nom: string;
  synonymes?: string[];
  categorieCode: DechetCategorie;
  categorieTitre: string;
  contenant: string;
  couleurContenant: 'rouge' | 'jaune' | 'marron' | 'blanc' | 'noir' | 'special';
  symbole: 'biohazard' | 'chimique' | 'menager' | 'anatomique' | 'toxique';
  destination: string;
  consignes: string[];
}

export interface EtapeFiliereDechets {
  id: string;
  numero: number;
  titre: string;
  qui: string;
  ou: string;
  comment: string[];
  reglesSecurite: string[];
}

export const DECHETS_TRI_LIST: DechetTriItem[] = [
  // --- MATÉRIEL PIQUANT & TRANCHANT (JAUNE) ---
  {
    id: 'aiguille-seringue',
    nom: 'Aiguilles de seringues (avec ou sans seringue)',
    synonymes: ['aiguille', 'injection', 'seringue avec aiguille', 'trocart'],
    categorieCode: 'cat1_tranchant',
    categorieTitre: 'Catégorie 1 : Matériel piquant et tranchant',
    contenant: 'Récipient solide / Boîte en polyéthylène hermétiquement fermée de couleur JAUNE',
    couleurContenant: 'jaune',
    symbole: 'biohazard',
    destination: 'Filière DASRI agréée (Incinération à 850°C - 1100°C ou banalisation par autoclavage)',
    consignes: [
      'Jeter immédiatement après le geste sans recapuchonner l’aiguille.',
      'Ne jamais forcer l’introduction de l’aiguille.',
      'Remplir au maximum aux 3/4 de la capacité du conteneur.',
      'Fermer définitivement le conteneur jaune de manière hermétique et inviolable.',
      'Placer le conteneur jaune fermé dans un sac en plastique de couleur ROUGE pour l’évacuation.',
    ],
  },
  {
    id: 'lame-scalpel-bistouri',
    nom: 'Lames de bistouri et scalpels',
    synonymes: ['scalpel', 'bistouri', 'lame chirurgicale', 'cutter médical'],
    categorieCode: 'cat1_tranchant',
    categorieTitre: 'Catégorie 1 : Matériel piquant et tranchant',
    contenant: 'Conteneur rigide imperforable de couleur JAUNE',
    couleurContenant: 'jaune',
    symbole: 'biohazard',
    destination: 'Filière DASRI agréée',
    consignes: [
      'Évacuation directe dans la boîte jaune sans démontage risqué à mains nues.',
      'Limite de remplissage aux 3/4.',
      'Fermeture hermétique puis ensachage dans sac rouge étiqueté.',
    ],
  },
  {
    id: 'verre-brise-contamine',
    nom: 'Ampoules cassées et verre brisé souillé',
    synonymes: ['ampoule injectable cassée', 'verre souillé', 'tube en verre brisé'],
    categorieCode: 'cat1_tranchant',
    categorieTitre: 'Catégorie 1 : Matériel piquant et tranchant',
    contenant: 'Conteneur rigide de couleur JAUNE',
    couleurContenant: 'jaune',
    symbole: 'biohazard',
    destination: 'Filière DASRI',
    consignes: [
      'Tout objet coupant même petit doit être mis en boîte rigide jaune pour éviter la perforation des sacs.',
      'Ne jamais ramasser le verre brisé souillé avec les mains nues.',
    ],
  },
  {
    id: 'mandrin-cathéter',
    nom: 'Mandrins de cathéters et aiguilles à ailettes',
    synonymes: ['mandrin', 'épicrânienne', 'stylet', 'cathéter'],
    categorieCode: 'cat1_tranchant',
    categorieTitre: 'Catégorie 1 : Matériel piquant et tranchant',
    contenant: 'Conteneur rigide de couleur JAUNE',
    couleurContenant: 'jaune',
    symbole: 'biohazard',
    destination: 'Filière DASRI',
    consignes: [
      'Éliminer immédiatement dans le conteneur jaune au lit du malade ou en salle de soins.',
    ],
  },

  // --- DÉCHETS INFECTIEUX (ROUGE) ---
  {
    id: 'pansements-compresses-sang',
    nom: 'Pansements, compresses et cotons souillés de sang ou pus',
    synonymes: ['compresse', 'pansement', 'coton souillé', 'gaze', 'sparadrap souillé'],
    categorieCode: 'cat1_infectieux',
    categorieTitre: 'Catégorie 1 : Déchets à risques infectieux (DASRI)',
    contenant: 'Sac en plastique résistant et étanche de couleur ROUGE',
    couleurContenant: 'rouge',
    symbole: 'biohazard',
    destination: 'Traitement obligatoire par société agréée (Incinération / Autoclavage broyage)',
    consignes: [
      'Sacs en plastique étanches pour éviter toute fuite de liquides ou suintements biologiques.',
      'Fermer le sac lorsqu’il est rempli aux 3/4.',
      'Étiqueter : nom de l’ESSP, unité génératrice, date, nature des déchets.',
      'Déposer dans le grand conteneur intermédiaire muni d’un couvercle.',
    ],
  },
  {
    id: 'gants-souilles',
    nom: 'Gants de soins et d’examen souillés de sang ou liquides biologiques',
    synonymes: ['gant souillé', 'gants latex ensanglantés', 'gants de soins usagés'],
    categorieCode: 'cat1_infectieux',
    categorieTitre: 'Catégorie 1 : Déchets à risques infectieux (DASRI)',
    contenant: 'Sac en plastique étanche de couleur ROUGE',
    couleurContenant: 'rouge',
    symbole: 'biohazard',
    destination: 'Filière DASRI',
    consignes: [
      'Retirer les gants en les retournant et les déposer directement dans la poubelle à sac rouge avec pédale.',
      'Friction SHA des mains immédiate après le retrait.',
    ],
  },
  {
    id: 'cultures-laboratoire',
    nom: 'Milieux de culture et prélèvements de laboratoire',
    synonymes: ['boîtes de pétri', 'culture bactérienne', 'écouvillon contaminé', 'lame de frottis'],
    categorieCode: 'cat1_infectieux',
    categorieTitre: 'Catégorie 1 : Déchets à risques infectieux (DASRI)',
    contenant: 'Sac en plastique résistant et étanche de couleur ROUGE',
    couleurContenant: 'rouge',
    symbole: 'biohazard',
    destination: 'Filière DASRI spécialisée (Incinération haute température)',
    consignes: [
      'Conditionnement doublé si risque de perforation ou d’écoulement.',
      'Stockage dans le local DMP ventilé et sécurisé.',
    ],
  },
  {
    id: 'produits-sanguins-labiles',
    nom: 'Poches et dérivés sanguins avariés, périmés ou incomplètement utilisés',
    synonymes: ['poche de sang', 'culot globulaire périmé', 'plasma avarié', 'tubulure avec sang'],
    categorieCode: 'cat1_sang',
    categorieTitre: 'Catégorie 1 : Produits et dérivés du sang',
    contenant: 'Sacs en plastique résistants et étanches de couleur ROUGE',
    couleurContenant: 'rouge',
    symbole: 'biohazard',
    destination: 'Filière DASRI spécialisée',
    consignes: [
      'Vérifier l’absence totale de fuite.',
      'Enregistrement de la traçabilité au registre de collecte avec bordereau de suivi.',
    ],
  },
  {
    id: 'materiel-usage-unique-souille',
    nom: 'Sondes, canules, tubulures et drains souillés',
    synonymes: ['sonde urinaire souillée', 'tubulure perfusion sang', 'drain', 'canule aspiration'],
    categorieCode: 'cat1_infectieux',
    categorieTitre: 'Catégorie 1 : Déchets à risques infectieux (DASRI)',
    contenant: 'Sac en plastique résistant et étanche de couleur ROUGE',
    couleurContenant: 'rouge',
    symbole: 'biohazard',
    destination: 'Filière DASRI',
    consignes: ['Vidanger les poches à urine ou liquides dans les vidoirs sanitaires avant élimination si requis.'],
  },

  // --- DÉCHETS CHIMIQUES & PHARMACEUTIQUES (MARRON) ---
  {
    id: 'medicaments-perimes',
    nom: 'Médicaments, sirops, comprimés et gélules périmés ou avariés',
    synonymes: ['médicaments périmés', 'flacons de comprimés périmés', 'ampoules médicamenteuses'],
    categorieCode: 'cat2_chimique_pharma',
    categorieTitre: 'Catégorie 2 : Déchets chimiques et pharmaceutiques',
    contenant: 'Sac en plastique résistant et étanche de couleur MARRON',
    couleurContenant: 'marron',
    symbole: 'chimique',
    destination: 'Filière de destruction pharmaceutique agréée (Incinération haute température)',
    consignes: [
      'Conserver dans les boîtes et conditionnements d’origine si possible.',
      'Ne jamais jeter dans les égouts ni dans les sacs noirs ménagers.',
      'Entreposer séparément des autres déchets dans le local de stockage.',
    ],
  },
  {
    id: 'vaccins-avaries',
    nom: 'Vaccins périmés ou ayant subi une rupture de chaîne du froid',
    synonymes: ['vaccin avarié', 'flacons de vaccin', 'vaccins périmés'],
    categorieCode: 'cat2_chimique_pharma',
    categorieTitre: 'Catégorie 2 : Déchets chimiques et pharmaceutiques',
    contenant: 'Sac en plastique résistant et étanche de couleur MARRON',
    couleurContenant: 'marron',
    symbole: 'chimique',
    destination: 'Filière agréée de traitement pharmaceutique',
    consignes: [
      'Enregistrer le lot et la quantité au registre de pharmacie et de gestion des DMP.',
    ],
  },
  {
    id: 'dechets-cytotoxiques',
    nom: 'Résidus cytostatiques, anticancéreux et produits cytotoxiques',
    synonymes: ['chimiothérapie', 'cytostatique', 'cytotoxique', 'flacon anticancéreux'],
    categorieCode: 'cat2_chimique_pharma',
    categorieTitre: 'Catégorie 2 : Déchets cytostatiques et cytotoxiques',
    contenant: 'Sac étanche de couleur MARRON avec mention indélébile « Cytotoxique »',
    couleurContenant: 'marron',
    symbole: 'toxique',
    destination: 'Incinération spéciale à très haute température (1100°C)',
    consignes: [
      'Manipulation avec sur-blouse, gants étanches et masque.',
      'Risque mutagène et cancérigène majeur. Jamais dans la filière ménagère.',
    ],
  },
  {
    id: 'produits-chimiques-labo',
    nom: 'Réactifs de laboratoire périmés et solvants usagés',
    synonymes: ['réactif laboratoire', 'solvant', 'colorant usagé', 'produit chimique'],
    categorieCode: 'cat2_chimique_pharma',
    categorieTitre: 'Catégorie 2 : Produits chimiques et biologiques non utilisés',
    contenant: 'Bidons d’origine étanches dans sac de couleur MARRON',
    couleurContenant: 'marron',
    symbole: 'chimique',
    destination: 'Traitement physico-chimique spécialisé hors ESSP',
    consignes: ['Ne jamais mélanger les réactifs entre eux (risque d’explosion ou de vapeurs toxiques).'],
  },

  // --- DÉCHETS ANATOMIQUES (BLANC) ---
  {
    id: 'placentas',
    nom: 'Placentas issus de la salle d’accouchement',
    synonymes: ['placenta', 'délivrance', 'maternité placenta'],
    categorieCode: 'cat3_anatomique',
    categorieTitre: 'Catégorie 3 : Déchets anatomiques (Placentas)',
    contenant: 'Deux sacs en plastique de couleur BLANCHE non transparente',
    couleurContenant: 'blanc',
    symbole: 'anatomique',
    destination: 'Bureaux Municipaux d’Hygiène (BMH) pour enfouissement selon rites ou incinération',
    consignes: [
      'Conditionner dans de préférence DEUX sacs en plastique blancs non transparents.',
      'Placer dans un congélateur réservé exclusivement à cet effet en attente de collecte.',
      'Si l’établissement ne possède pas de congélateur : collecte impérative dans les 24 heures.',
    ],
  },
  {
    id: 'pieces-anatomiques-identifiables',
    nom: 'Organes, fœtus et tissus humains aisément identifiables par un non-spécialiste',
    synonymes: ['organe', 'fœtus', 'tissu identifiable', 'membre', 'biopsie volumineuse'],
    categorieCode: 'cat3_anatomique',
    categorieTitre: 'Catégorie 3 : Organes et tissus humains identifiables',
    contenant: 'Récipient ou sac en plastique BLANC non transparent hermétique',
    couleurContenant: 'blanc',
    symbole: 'anatomique',
    destination: 'Remis aux services compétents (Bureaux Municipaux d’Hygiène) pour enfouissement selon rites',
    consignes: [
      'Les organes doivent être désinfectés et bien emballés.',
      'Remis aux services compétents pour enfouissement selon les rites religieux et la réglementation en vigueur.',
    ],
  },

  // --- DÉCHETS MÉNAGERS ASSIMILÉS (NOIR - 80% des déchets) ---
  {
    id: 'papier-carton-administratif',
    nom: 'Papier de bureau, cartons d’emballage et emballages propres',
    synonymes: ['carton propre', 'papier administratif', 'emballage carton', 'journal'],
    categorieCode: 'cat4_menager',
    categorieTitre: 'Catégorie 4 : Déchets assimilés aux ordures ménagères (non infectieux)',
    contenant: 'Sac en plastique résistant et étanche de couleur NOIRE',
    couleurContenant: 'noir',
    symbole: 'menager',
    destination: 'Circuit communal des ordures ménagères / Décharge publique communale',
    consignes: [
      'Représente 80% des déchets de l’ESSP.',
      'Ne doit contenir AUCUN déchet contaminé par du sang ni objet piquant.',
    ],
  },
  {
    id: 'dechets-cuisine-repas',
    nom: 'Restes de repas, emballages alimentaires et déchets de balayage',
    synonymes: ['ordures ménagères', 'reste nourriture', 'bouteille eau vide', 'balayure bureau'],
    categorieCode: 'cat4_menager',
    categorieTitre: 'Catégorie 4 : Déchets assimilés aux ordures ménagères',
    contenant: 'Sac en plastique de couleur NOIRE',
    couleurContenant: 'noir',
    symbole: 'menager',
    destination: 'Collecte communale régulière',
    consignes: ['Poubelle classique fermée avec couvercle et commande à pédale.'],
  },
  {
    id: 'emballage-compresse-propre',
    nom: 'Blisters plastiques, emballages de seringues ou compresses ouverts non souillés',
    synonymes: ['blister seringue', 'papier emballage stérile ouvert', 'sachet vide propre'],
    categorieCode: 'cat4_menager',
    categorieTitre: 'Catégorie 4 : Déchets assimilés aux ordures ménagères',
    contenant: 'Sac en plastique de couleur NOIRE',
    couleurContenant: 'noir',
    symbole: 'menager',
    destination: 'Circuit des ordures ménagères',
    consignes: [
      'Seuls les emballages non entrés en contact avec le malade ou les liquides biologiques vont dans le sac noir.',
    ],
  },

  // --- DÉCHETS SPÉCIAUX (MERCURE & MÉTAUX LOURDS) ---
  {
    id: 'thermometre-mercure',
    nom: 'Thermomètres au mercure cassés et métaux lourds',
    synonymes: ['mercure', 'thermomètre cassé', 'métaux lourds', 'amalgame dentaire'],
    categorieCode: 'speciaux_mercure',
    categorieTitre: 'Déchets spéciaux : Métaux lourds et mercure',
    contenant: 'Récipient étanche spécifique hermétique collecté séparément',
    couleurContenant: 'special',
    symbole: 'toxique',
    destination: 'Filière spécialisée d’élimination des métaux lourds',
    consignes: [
      'Ne jamais jeter dans le sac noir ni dans l’évier.',
      'Ramasser les billes de mercure avec une feuille ou bande adhésive sans aspirateur.',
      'Conserver dans un flacon étanche fermé avec de l’eau pour limiter l’évaporation toxique.',
    ],
  },
];

export const ETAPES_FILIERE: EtapeFiliereDechets[] = [
  {
    id: 'etape-tri',
    numero: 1,
    titre: 'Le Tri à la source',
    qui: 'Personnel soignant et médical sur le lieu de génération',
    ou: 'Salle de soins, consultation, accouchement, laboratoire, unité dentaire',
    comment: [
      'Chaque catégorie de déchets est mise immédiatement dans le sac ou conteneur approprié (rouge, jaune, marron, blanc, noir).',
      'Une grande vigilance doit caractériser le tri pour éviter que les déchets à risque ne se mélangent avec les ordures ménagères.',
    ],
    reglesSecurite: [
      'Ne jamais transférer des déchets d’un sac à un autre après le tri initial.',
      'Ne jamais compacter ou tasser les déchets à la main dans les poubelles.',
    ],
  },
  {
    id: 'etape-conditionnement',
    numero: 2,
    titre: 'Le Conditionnement',
    qui: 'Personnel soignant',
    ou: 'Cellules de soins (point d’utilisation)',
    comment: [
      'Chaque cellule de soins doit disposer de : 1 conteneur jaune piquants/tranchants, 1 collecteur à couvercle pour déchets infectieux (sac rouge), 1 collecteur pour déchets ménagers (sac noir).',
      'Conteneurs rigides étanches de 40 à 50 litres avec couvercles à pédale.',
      'Boîtes en polyéthylène jaunes de 1,4 L, 3 L ou 7,6 L pour aiguilles et scalpels.',
    ],
    reglesSecurite: [
      'Règle des 3/4 : fermer définitivement tout sac et toute boîte jaune dès qu’il est rempli aux 3/4 de sa capacité.',
      'Étiquetage obligatoire : nature du déchet, nom de l’ESSP, unité génératrice, date.',
      'Le conteneur jaune fermé doit être placé dans un sac plastique rouge avant évacuation.',
    ],
  },
  {
    id: 'etape-ramassage',
    numero: 3,
    titre: 'Le Ramassage interne',
    qui: 'Personnel formé et dédié',
    ou: 'Depuis les unités de soins jusqu’au local de stockage intermédiaire',
    comment: [
      'Suivre les horaires fixes et le planning établi par le responsable.',
      'Utiliser des chariots munis de roues, lavables, sans bords tranchants, réservés exclusivement aux déchets.',
      'Respecter les flux propres et sales de l’établissement.',
    ],
    reglesSecurite: [
      'Port obligatoire des EPI par l’agent (gants de ménage épais, blouse/tablier, chaussures fermées).',
      'Évacuation rapide des déchets contenant des sécrétions biologiques.',
      'Désinfection obligatoire des chariots après chaque tournée de ramassage.',
    ],
  },
  {
    id: 'etape-stockage',
    numero: 4,
    titre: 'Le Stockage (Local DMP)',
    qui: 'Personnel formé sous la supervision du point focal',
    ou: 'Local de stockage extérieur aux bâtiments de soins mais dans l’enceinte fermée',
    comment: [
      'Local dédié, aéré, éclairé, fermé à clé avec accès strictement réservé.',
      'Grand conteneurs de 240 à 1000 litres étanches, rigides et étiquetés.',
      'Sol lisse, imperméable avec siphon d’évacuation des eaux de lavage.',
      'Point d’eau, poste de lavage des mains et aire de lavage des conteneurs à côté.',
      'Entreposer les déchets chimiques et pharmaceutiques séparément.',
      'Placentas en congélateur dédié en sacs blancs (ou collecte sous 24h).',
    ],
    reglesSecurite: [
      'Interdiction absolue de déposer les sacs à même le sol.',
      'Nettoyage et désinfection quotidienne des surfaces du local de stockage.',
    ],
  },
  {
    id: 'etape-collecte',
    numero: 5,
    titre: 'La Collecte & Supervision',
    qui: 'Professionnel désigné de l’ESSP (supervision) et société prestataire agréée',
    ou: 'Aire de collecte de l’établissement',
    comment: [
      'Vérification de l’étiquetage indélébile avec symbole international de risque biologique.',
      'Pesée précise de chaque catégorie de déchets enlevée.',
      'Tenue et signature du Registre de gestion des DMP de l’ESSP.',
      'Renseignement du Bordereau de suivi réglementaire (art. 32 loi 28-00 / décret 2-09-139).',
    ],
    reglesSecurite: [
      'Contrôle du cachet et de la signature du transporteur agréé.',
      'Conservation et archivage des bordereaux de suivi pour audits et traçabilité.',
    ],
  },
  {
    id: 'etape-transport-elimination',
    numero: 6,
    titre: 'Transport, Traitement & Élimination',
    qui: 'Sociétés spécialisées et Bureaux Municipaux d’Hygiène (hors ESSP)',
    ou: 'Centres de traitement agréés / Décharges contrôlées',
    comment: [
      'Incinération moderne en four atteignant 850°C à 1100°C avec épuration des gaz.',
      'Technologies alternatives : autoclavage avec broyage, micro-ondes, désinfection chimique ou ozone.',
      'Enfouissement des pièces anatomiques et placentas par les BMH selon les rites religieux.',
      'Déchets ménagers (sacs noirs) évacués vers la décharge communale.',
    ],
    reglesSecurite: [
      'Éviter le brûlage à l’air libre ou l’incinération non contrôlée (émission cancérigène de dioxines et furanes).',
    ],
  },
];

export const ETAPES_FILIERE_DECHETS: EtapeFiliereDechets[] = ETAPES_FILIERE;

export const RISQUES_SANTE_ENVIRONNEMENT = {
  cadreLegal: [
    'Loi n° 28-00 relative à la gestion des déchets et à leur élimination (art. 6 et 32)',
    'Décret n° 2-09-139 relatif à la gestion des déchets médicaux et pharmaceutiques (DMP)',
    'Loi n° 11-03 relative à la protection et à la mise en valeur de l’environnement',
    'Décret n° 2.07.253 fixant la liste des déchets dangereux',
  ],
  risquesSante: [
    {
      titre: 'Risque de piqûre accidentelle (AES)',
      description: 'Risque majeur par aiguilles ou objets tranchants souillés, responsable de transmission du VHB (hépatite B), VHC (hépatite C) et VIH (SIDA).',
    },
    {
      titre: 'Risques infectieux multiples (Tableau 18)',
      description: 'Gastro-entérites (Salmonella, Shigella, choléra), infections respiratoires (tuberculose, rougeole), méningites, septicémies à staphylocoque.',
    },
    {
      titre: 'Risques chimiques et toxicologiques',
      description: 'Brûlures acides, intoxication par solvants, médicaments cytotoxiques ou métaux lourds (mercure des thermomètres cassés, amalgames dentaires).',
    },
    {
      titre: 'Risques psycho-émotionnels et manutention',
      description: 'Crainte et choc visuel lors de la vue de sang ou pièces anatomiques ; dorsalgies et lombalgies lors de la manipulation de charges lourdes.',
    },
  ],
  risquesEnvironnement: [
    'Contamination des sols et des nappes phréatiques en cas de déversement incontrôlé.',
    'Rejet de dioxines et furanes cancérogènes en cas d’incinération imparfaite (< 850°C) de matières chlorées.',
    'Dissémination dans l’environnement et la faune de micro-organismes pharmaco-résistants hospitaliers.',
  ],
  repartitionTypiqueESSP: [
    { label: 'Déchets assimilés aux ordures ménagères (non infectieux)', pourcentage: 80, couleur: '#0f172a', code: 'cat4_menager' },
    { label: 'Déchets infectieux et pathologiques (DASRI)', pourcentage: 15, couleur: '#ef4444', code: 'cat1_infectieux' },
    { label: 'Déchets piquants et tranchants', pourcentage: 1, couleur: '#eab308', code: 'cat1_tranchant' },
    { label: 'Déchets chimiques ou pharmaceutiques', pourcentage: 3, couleur: '#854d0e', code: 'cat2_chimique_pharma' },
    { label: 'Flacons pressurisés, thermomètres cassés (mercure)...', pourcentage: 1, couleur: '#a855f7', code: 'speciaux_mercure' },
  ],
};
