/**
 * Module Cuisine / Restauration collective.
 *
 * Références : principes HACCP du Codex Alimentarius (CAC/RCP 1-1969),
 * règlement (CE) n° 852/2004, arrêté français du 29 septembre 1997 (restauration
 * collective à caractère social) et textes qui l'ont remplacé.
 * Les valeurs sont des repères de bonne pratique : en cas de doute, la
 * réglementation locale et l'étiquetage du fabricant priment.
 */

export interface PointControle {
  id: string;
  label: string;
  groupe: string;
  /** 'max' : valeur ≤ limite ; 'min' : valeur ≥ limite */
  sens: 'max' | 'min';
  limite: number;
  conduite: string;
}

export const POINTS_CONTROLE: PointControle[] = [
  // Équipements
  { id: 'frigo', label: 'Réfrigérateur / chambre froide positive', groupe: 'Équipements', sens: 'max', limite: 4,
    conduite: 'Vérifier la porte et le thermostat, déplacer les denrées sensibles, recontrôler dans 1 h, appeler la maintenance.' },
  { id: 'congel', label: 'Congélateur / chambre froide négative', groupe: 'Équipements', sens: 'max', limite: -18,
    conduite: 'Vérifier la porte et le thermostat. Si la rupture est prolongée, ne pas recongeler un produit décongelé et alerter le responsable.' },
  // Réception
  { id: 'rec_frais', label: 'Réception : produits réfrigérés (général)', groupe: 'Réception', sens: 'max', limite: 4,
    conduite: 'Refuser ou mettre en quarantaine, noter sur le bon de livraison, prévenir le fournisseur.' },
  { id: 'rec_viande', label: 'Réception : viande fraîche', groupe: 'Réception', sens: 'max', limite: 7,
    conduite: 'Refuser ou mettre en quarantaine, noter sur le bon de livraison, prévenir le fournisseur.' },
  { id: 'rec_hachee', label: 'Réception : viande hachée', groupe: 'Réception', sens: 'max', limite: 2,
    conduite: 'Refuser la livraison et prévenir le fournisseur.' },
  { id: 'rec_poisson', label: 'Réception : poisson frais', groupe: 'Réception', sens: 'max', limite: 2,
    conduite: 'Refuser la livraison et prévenir le fournisseur.' },
  { id: 'rec_surgele', label: 'Réception : produits surgelés', groupe: 'Réception', sens: 'max', limite: -15,
    conduite: 'Refuser si décongelé ou givré. Au-dessus de -15 °C, la livraison n\'est pas acceptable.' },
  // Production
  { id: 'cuisson', label: 'Cuisson : température à cœur', groupe: 'Production', sens: 'min', limite: 63,
    conduite: 'Poursuivre la cuisson. Viandes hachées et volailles : viser 70 °C à cœur.' },
  { id: 'refroid', label: 'Refroidissement : température après 2 h', groupe: 'Production', sens: 'max', limite: 10,
    conduite: 'Éliminer le plat s\'il est resté trop longtemps dans la zone 10-63 °C, ou le consommer immédiatement.' },
  { id: 'remise', label: 'Remise en température : atteinte en 1 h', groupe: 'Production', sens: 'min', limite: 63,
    conduite: 'Poursuivre le chauffage. Au-delà d\'1 h, éliminer le plat.' },
  // Service
  { id: 'chaud', label: 'Maintien au chaud / distribution', groupe: 'Service', sens: 'min', limite: 63,
    conduite: 'Réchauffer à 63 °C minimum ou éliminer si la durée est dépassée.' },
  { id: 'froid_service', label: 'Maintien au froid / distribution', groupe: 'Service', sens: 'max', limite: 4,
    conduite: 'Remettre au froid immédiatement ; au-delà de 2 h hors froid, éliminer.' },
  { id: 'temoin', label: 'Plats témoins (conservation)', groupe: 'Service', sens: 'max', limite: 3,
    conduite: 'Régler le froid. Conserver 100 g par plat pendant au moins 5 jours.' },
];

export function evaluerTemperature(point: PointControle, valeur: number): boolean {
  return point.sens === 'max' ? valeur <= point.limite : valeur >= point.limite;
}

export function libelleLimite(point: PointControle): string {
  return `${point.sens === 'max' ? '≤' : '≥'} ${point.limite} °C`;
}

/* ----------------------------- Audit ----------------------------- */

export interface CuisineAuditItemDef {
  id: string;
  titre: string;
}
export interface CuisineAuditSection {
  id: string;
  titre: string;
  items: CuisineAuditItemDef[];
}

export const CUISINE_AUDIT: CuisineAuditSection[] = [
  {
    id: 'locaux',
    titre: 'Locaux et équipements',
    items: [
      { id: 'l1', titre: 'Marche en avant respectée (réception → stockage → préparation → cuisson → distribution)' },
      { id: 'l2', titre: 'Secteurs propre et sale séparés (ou séparés dans le temps)' },
      { id: 'l3', titre: 'Sols, murs et plafonds en bon état, lisses et lavables' },
      { id: 'l4', titre: 'Lave-mains à commande non manuelle, avec savon et essuie-mains à usage unique' },
      { id: 'l5', titre: 'Ventilation et éclairage suffisants, hottes propres' },
      { id: 'l6', titre: 'Plans de travail et ustensiles en bon état (pas de bois brut, pas de fissures)' },
      { id: 'l7', titre: 'Poubelles à ouverture non manuelle, vidées et lavées régulièrement' },
    ],
  },
  {
    id: 'personnel',
    titre: 'Personnel',
    items: [
      { id: 'p1', titre: 'Tenue propre et complète (blouse, coiffe couvrant les cheveux, chaussures dédiées)' },
      { id: 'p2', titre: 'Pas de bijoux, montre ni vernis ; ongles courts' },
      { id: 'p3', titre: 'Lavage des mains aux moments clés (prise de poste, après WC, changement de tâche)' },
      { id: 'p4', titre: 'Plaies et coupures protégées par un pansement étanche et un gant' },
      { id: 'p5', titre: 'Suivi médical à jour et éviction en cas de maladie digestive ou cutanée' },
      { id: 'p6', titre: 'Personnel formé à l\'hygiène alimentaire et aux principes HACCP' },
    ],
  },
  {
    id: 'reception',
    titre: 'Réception des marchandises',
    items: [
      { id: 'r1', titre: 'Température des produits contrôlée à la livraison et enregistrée' },
      { id: 'r2', titre: 'DLC / DDM, étiquetage et état des emballages vérifiés' },
      { id: 'r3', titre: 'Véhicule de livraison propre, froid maintenu' },
      { id: 'r4', titre: 'Produits non conformes refusés ou mis en quarantaine, avec trace écrite' },
      { id: 'r5', titre: 'Étiquettes de traçabilité conservées (lots, origine)' },
    ],
  },
  {
    id: 'stockage',
    titre: 'Stockage',
    items: [
      { id: 's1', titre: 'Réfrigérateurs à ≤ +4 °C et congélateurs à ≤ -18 °C, avec thermomètre lisible' },
      { id: 's2', titre: 'Produits crus séparés des produits cuits / prêts à consommer' },
      { id: 's3', titre: 'Produits stockés sur étagères, jamais au sol' },
      { id: 's4', titre: 'Respect du FIFO : premier entré, premier sorti' },
      { id: 's5', titre: 'Produits ouverts filmés, étiquetés avec la date d\'ouverture' },
      { id: 's6', titre: 'Aucun produit périmé ni emballage abîmé' },
      { id: 's7', titre: 'Produits d\'entretien stockés à part, loin des denrées' },
    ],
  },
  {
    id: 'preparation',
    titre: 'Préparation et cuisson',
    items: [
      { id: 'c1', titre: 'Légumes crus lavés et désinfectés avant utilisation' },
      { id: 'c2', titre: 'Planches et couteaux distincts (viande crue, légumes, produits cuits)' },
      { id: 'c3', titre: 'Décongélation au réfrigérateur, jamais à température ambiante' },
      { id: 'c4', titre: 'Température à cœur ≥ 63 °C à la cuisson (70 °C pour viande hachée et volaille)' },
      { id: 'c5', titre: 'Huile de friture contrôlée et changée selon la fréquence définie' },
      { id: 'c6', titre: 'Œufs : ovoproduits ou cuisson complète pour les préparations à risque' },
    ],
  },
  {
    id: 'froid_chaud',
    titre: 'Refroidissement, remise en température, distribution',
    items: [
      { id: 'f1', titre: 'Refroidissement rapide (de 63 °C à moins de 10 °C en 2 h) avec relevé' },
      { id: 'f2', titre: 'Remise en température à 63 °C en moins d\'1 h' },
      { id: 'f3', titre: 'Plats chauds maintenus à ≥ 63 °C jusqu\'au service' },
      { id: 'f4', titre: 'Plats froids maintenus à ≤ +4 °C jusqu\'au service' },
      { id: 'f5', titre: 'Aucun reste servi de nouveau ; produits non consommés éliminés' },
      { id: 'f6', titre: 'Chariots et containers de transport propres, fermés' },
    ],
  },
  {
    id: 'nettoyage',
    titre: 'Nettoyage, désinfection et nuisibles',
    items: [
      { id: 'n1', titre: 'Plan de nettoyage-désinfection écrit, affiché et appliqué' },
      { id: 'n2', titre: 'Produits adaptés au contact alimentaire, dilutions respectées' },
      { id: 'n3', titre: 'Enregistrement des opérations de nettoyage (qui, quand)' },
      { id: 'n4', titre: 'Chiffons et éponges à usage unique ou désinfectés, code couleur respecté' },
      { id: 'n5', titre: 'Absence de nuisibles (rongeurs, insectes), contrat de dératisation à jour' },
      { id: 'n6', titre: 'Siphons, évacuations et bacs à graisse propres' },
    ],
  },
  {
    id: 'documents',
    titre: 'Traçabilité et documents',
    items: [
      { id: 'd1', titre: 'Plats témoins prélevés (≈ 100 g par plat, 5 jours, 0 à +3 °C)' },
      { id: 'd2', titre: 'Relevés de température disponibles et signés' },
      { id: 'd3', titre: 'Plan HACCP / analyse des dangers disponible et connu du personnel' },
      { id: 'd4', titre: 'Information sur les allergènes disponible pour les patients' },
      { id: 'd5', titre: 'Régimes spéciaux identifiés et préparés séparément' },
      { id: 'd6', titre: 'Eau potable : résultats d\'analyse disponibles' },
    ],
  },
];

export function allCuisineItems(): { sectionId: string; item: CuisineAuditItemDef }[] {
  return CUISINE_AUDIT.flatMap((s) => s.items.map((item) => ({ sectionId: s.id, item })));
}

/* ----------------------------- Fiches ----------------------------- */

export interface CuisineFiche {
  id: string;
  titre: string;
  resume: string;
  points: string[];
  attention?: string;
}

export const CUISINE_FICHES: CuisineFiche[] = [
  {
    id: 'haccp',
    titre: 'HACCP : les 7 principes',
    resume: 'Méthode du Codex Alimentarius pour maîtriser les dangers à chaque étape.',
    points: [
      '1. Analyser les dangers (biologiques, chimiques, physiques, allergènes).',
      '2. Déterminer les points critiques à maîtriser (CCP) : cuisson, refroidissement, maintien au chaud ou au froid.',
      '3. Fixer des limites critiques (ex. ≥ 63 °C, ≤ 4 °C).',
      '4. Mettre en place une surveillance (relevés, mesures).',
      '5. Définir les actions correctives si la limite n\'est pas respectée.',
      '6. Vérifier que le système fonctionne (audits, analyses).',
      '7. Documenter et conserver les enregistrements.',
    ],
    attention: 'Le HACCP s\'appuie sur des prérequis (PRP) : locaux, personnel, nettoyage, nuisibles, traçabilité.',
  },
  {
    id: 'marche_avant',
    titre: 'Marche en avant et 5 M',
    resume: 'Organiser le flux pour que le propre ne croise jamais le sale.',
    points: [
      'Sens unique : réception → stockage → préparation → cuisson → distribution → plonge.',
      'Séparer les circuits propre et sale. Si ce n\'est pas possible, les séparer dans le temps avec nettoyage-désinfection entre deux.',
      '5 M des causes de contamination : Matière première, Matériel, Méthode, Milieu, Main-d\'œuvre.',
      'Les déchets sortent par un circuit distinct, jamais par la zone propre.',
    ],
  },
  {
    id: 'reception_fiche',
    titre: 'Réception des marchandises',
    resume: 'Premier contrôle : un produit mauvais à l\'arrivée reste mauvais.',
    points: [
      'Prévoir un espace propre, avec thermomètre sonde désinfecté.',
      'Contrôler : température, DLC, étiquette, emballage, propreté du camion.',
      'Référence : frais ≤ 4 °C ; viande ≤ 7 °C ; viande hachée et poisson ≤ 2 °C ; surgelé ≤ -15 °C à la livraison.',
      'Ranger tout de suite les produits froids. Jeter les cartons d\'emballage extérieurs avant d\'entrer en zone propre.',
      'Noter toute anomalie sur le bon de livraison.',
    ],
  },
  {
    id: 'stockage_fiche',
    titre: 'Stockage et FIFO',
    resume: 'Chaque denrée a sa place, sa date et sa température.',
    points: [
      'Réfrigérateur ≤ +4 °C, congélateur ≤ -18 °C. Relever la température au moins une fois par jour.',
      'Du haut vers le bas : produits cuits / prêts à consommer, puis produits crus, avec la viande crue tout en bas.',
      'Pas de contact avec le sol. Pas de carton en chambre froide.',
      'FIFO : premier entré, premier sorti. Étiqueter avec la date d\'ouverture et la DLC secondaire.',
      'Ne pas surcharger : l\'air doit circuler.',
    ],
  },
  {
    id: 'cuisson_fiche',
    titre: 'Cuisson et maintien au chaud',
    resume: 'La cuisson détruit les germes ; le maintien évite leur multiplication.',
    points: [
      'Température à cœur ≥ 63 °C pour tous les plats. Viandes hachées et volailles : 70 °C.',
      'Maintien au chaud ≥ 63 °C jusqu\'au service.',
      'Zone de danger : entre +10 °C et +63 °C, les bactéries se multiplient vite. Limiter le temps passé dans cette zone.',
      'Huile de friture : filtrer, contrôler (composés polaires ≤ 25 %), changer à temps. Ne jamais mélanger vieille et neuve.',
      'Désinfecter la sonde entre chaque mesure.',
    ],
  },
  {
    id: 'refroid_fiche',
    titre: 'Refroidissement et remise en température',
    resume: 'Étape critique de la liaison froide.',
    points: [
      'Refroidir de 63 °C à moins de 10 °C en moins de 2 h : cellule de refroidissement rapide, bacs peu profonds.',
      'Stocker ensuite à 0-3 °C. Respecter la DLC définie par l\'établissement.',
      'Remise en température : atteindre 63 °C en moins d\'1 h.',
      'Un plat remis en température ne se refroidit pas à nouveau : on ne réchauffe qu\'une seule fois.',
      'Enregistrer les temps et températures.',
    ],
    attention: 'Aucun refroidissement à température ambiante, ni sous un tissu ou un couvercle fermé.',
  },
  {
    id: 'perso_fiche',
    titre: 'Hygiène du personnel',
    resume: 'Les mains sont le premier vecteur de contamination en cuisine.',
    points: [
      'Tenue propre, coiffe qui couvre les cheveux, chaussures dédiées. Pas de bijoux, ni de montre.',
      'Lavage des mains (30 secondes, savon, essuie-mains à usage unique) : à la prise de poste, après WC, après manipulation de déchets, de viande crue ou d\'œufs, entre deux tâches.',
      'Plaie : pansement étanche + gant.',
      'Éviction : diarrhée, vomissements, fièvre, lésion cutanée infectée. Signaler au responsable.',
      'Pas de nourriture, de cigarette ni de téléphone en zone de production.',
    ],
  },
  {
    id: 'nd_fiche',
    titre: 'Nettoyage et désinfection',
    resume: 'Un plan écrit, appliqué et enregistré.',
    points: [
      'Les 5 étapes : pré-rinçage, nettoyage (détergent), rinçage, désinfection, rinçage final si nécessaire.',
      'Respecter la dilution et le temps de contact du fabricant.',
      'Ne jamais mélanger deux produits (risque de gaz toxique avec l\'eau de Javel et un acide).',
      'Code couleur des chiffons et des seaux ; matériel dédié à chaque zone.',
      'Le plan précise : quoi, comment, avec quoi, à quelle fréquence, qui, et comment on vérifie.',
    ],
  },
  {
    id: 'temoin_fiche',
    titre: 'Plats témoins et traçabilité',
    resume: 'Permet d\'enquêter en cas de toxi-infection alimentaire.',
    points: [
      'Prélever environ 100 g de chaque plat servi, dans un récipient propre fermé.',
      'Conserver à 0-3 °C pendant au moins 5 jours.',
      'Étiqueter : date, repas, plat.',
      'Conserver les étiquettes des matières premières (lot, origine, DLC).',
      'Garder les relevés de température et les bons de livraison.',
    ],
  },
  {
    id: 'allergenes',
    titre: 'Allergènes',
    resume: 'Les 14 allergènes à déclaration obligatoire.',
    points: [
      'Céréales contenant du gluten, crustacés, œufs, poissons, arachides, soja, lait.',
      'Fruits à coque, céleri, moutarde, graines de sésame, sulfites, lupin, mollusques.',
      'Prévenir la contamination croisée : ustensiles et surfaces dédiés ou nettoyés.',
      'Informer le service de soins des allergènes présents dans chaque plat.',
    ],
  },
  {
    id: 'tiac',
    titre: 'Suspicion de toxi-infection (TIAC)',
    resume: 'Au moins deux cas avec les mêmes symptômes après un même repas.',
    points: [
      'Isoler les denrées suspectes et ne pas les jeter.',
      'Conserver les plats témoins et le plan de table.',
      'Prévenir immédiatement le responsable hygiène et la direction.',
      'Lister les personnes malades, les symptômes et les heures d\'apparition.',
      'Déclarer à l\'autorité sanitaire compétente selon la procédure locale.',
    ],
  },
];
