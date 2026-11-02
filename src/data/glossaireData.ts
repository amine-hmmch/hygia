import { GlossaireItem } from '../types';

export const GLOSSAIRE_CHAPITRE_1: GlossaireItem[] = [
  {
    id: 'asepsie',
    terme: 'Asepsie',
    definition: 'L’ensemble des mesures visant à empêcher tout apport exogène de microorganismes.',
    normeOuRef: 'Norme AFNOR T 72-101',
    categorie: 'asepsie_sterilisation',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Empêche l’introduction de germes dans l’organisme.',
      'S’applique aux gestes invasifs, pansements, petite chirurgie et stérilisation.',
    ],
  },
  {
    id: 'bio-nettoyage',
    terme: 'Bio-nettoyage',
    definition:
      'Un procédé destiné à réduire la contamination biologique des surfaces. Il est obtenu par la combinaison ordonnée en 3 temps : 1) D’un nettoyage, 2) D’une évacuation de la salissure et des produits utilisés, 3) De l’application d’un désinfectant.',
    normeOuRef: 'Norme NF X 50-790 (Activités de nettoyage industriel - Lexique de la propreté)',
    categorie: 'hygiene_locaux',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Temps 1 : Nettoyage avec détergent.',
      'Temps 2 : Rinçage et évacuation des salissures.',
      'Temps 3 : Application du désinfectant (respect du temps de contact).',
    ],
  },
  {
    id: 'desinfection-locaux',
    terme: 'Désinfection des locaux',
    definition:
      'Opération qui peut faire suite aux techniques de nettoyage dans certains secteurs de soins (par exemple : désinfection des surfaces par spray dirigé).',
    categorie: 'hygiene_locaux',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Intervient obligatoirement sur une surface préalablement nettoyée.',
      'Ne remplace jamais le nettoyage initial.',
    ],
  },
  {
    id: 'desinfectant',
    terme: 'Désinfectant',
    definition:
      'Un produit contenant au moins un principe actif doué de propriété antimicrobienne et dont l’activité est déterminée par un système normatif reconnu. Ce produit doit satisfaire aux normes de bactéricide (NF EN 1040), et peut présenter des caractéristiques supplémentaires : fongicide (NF EN 1275), virucide (NF T 72-180), sporicide (NF T 72-230 ou NF T 72-231).',
    normeOuRef: 'NF EN 1040, NF EN 1275, NF T 72-180, NF T 72-230/231',
    categorie: 'produits',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Bactéricidie minimale obligatoire (NF EN 1040).',
      'Spectre d’activité certifié selon normes reconnues.',
    ],
  },
  {
    id: 'detergence',
    terme: 'Détergence',
    definition:
      'Un processus selon lequel des salissures ou des souillures sont détachées de leur substrat et mises en solution ou en dispersion. Au sens ordinaire, la détergence a pour effet le nettoyage des surfaces. Elle est la résultante de la mise en œuvre de plusieurs phénomènes physico-chimiques.',
    normeOuRef: 'Norme NF EN ISO 862',
    categorie: 'produits',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Détachement mécanique et chimique des impuretés.',
      'Mise en suspension sans redéposition sur la surface.',
    ],
  },
  {
    id: 'detergent',
    terme: 'Détergent',
    definition:
      'Un produit dont la composition est spécialement étudiée pour le nettoyage selon un processus mettant en œuvre les phénomènes de détergence. Un détergent comprend des composants essentiels (agents de surface / tensioactifs) et généralement des composants complémentaires (adjuvants, etc.).',
    normeOuRef: 'Norme NF EN ISO 862',
    categorie: 'produits',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Agents tensio-actifs solubilisant graisses et salissures.',
      'Base obligatoire avant toute action de désinfection.',
    ],
  },
  {
    id: 'detergent-desinfectant',
    terme: 'Détergent-désinfectant',
    definition: 'Un produit présentant la double propriété d’être un détergent et un désinfectant.',
    categorie: 'produits',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Permet une opération combinée de nettoyage et de réduction microbienne.',
      'Utilisé pour les sols et surfaces en zone 2 et 3.',
    ],
  },
  {
    id: 'dispositif-medical',
    terme: 'Dispositif médical (DM)',
    definition:
      'Tout instrument, appareil, équipement, matériel, produit, à l’exception des produits d’origine humaine, ou autre article utilisé seul ou en association, y compris les accessoires et logiciels intervenant dans son fonctionnement, destiné par le fabricant à être utilisé chez l’homme à des fins médicales et dont l’action principale voulue n’est pas obtenue par des moyens pharmacologiques ou immunologiques ni par métabolisme, mais dont la fonction peut être assistée par de tels moyens.',
    categorie: 'securite',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Comprend pinces, ciseaux, autoclaves, seringues, thermomètres, etc.',
      'Fait l’objet d’une classification selon le niveau de risque invasif (critique, semi-critique, non critique).',
    ],
  },
  {
    id: 'entretien-locaux',
    terme: 'Entretien des locaux',
    definition:
      'Il concerne les étapes de nettoyage-désinfection permettant une maîtrise du niveau de contamination microbienne de l’environnement d’un bâtiment, à savoir : les sols, les murs et les plafonds.',
    categorie: 'hygiene_locaux',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Maîtrise de la charge biologique ambiante.',
      'S’appuie sur le zonage des locaux (Zone 1, Zone 2, Zone 3).',
    ],
  },
  {
    id: 'flore-residente',
    terme: 'Flore résidente (cutanée)',
    definition:
      'Une flore qui vit et se multiplie dans les couches superficielles de la peau. Elle est essentiellement constituée de corynébactéries, de staphylocoques à coagulase négative et de bactéries anaérobies (ex : Propionibacterium acnes).',
    categorie: 'microbiologie',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Flore commensale protectrice normale de la peau.',
      'Difficile à éliminer totalement, réduite temporairement par l’antisepsie chirurgicale.',
    ],
  },
  {
    id: 'flore-transitoire',
    terme: 'Flore transitoire / transitaire',
    definition:
      'Une flore acquise par le soignant tout au cours de son activité. Elle dépend de l’environnement et de l’activité du sujet. La survie des micro-organismes est habituellement transitoire mais elle peut remplacer la flore naturelle résidente surtout si la peau est irritée ou lésée. Elle est en partie constituée de germes potentiellement pathogènes : Staphylococcus aureus, Pseudomonas, entérobactéries, streptocoques.',
    categorie: 'microbiologie',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Principal vecteur de transmission croisée d’infections associées aux soins.',
      'Facilement éliminée ou inactivée par la friction hydro-alcoolique (FHA) ou le lavage simple des mains.',
    ],
  },
  {
    id: 'geste-aseptique',
    terme: 'Geste aseptique',
    definition:
      'Une activité de soins impliquant un contact direct ou indirect avec une muqueuse, une peau lésée ou un dispositif médical invasif. Pendant l’exécution de ce geste, aucun germe ne doit être transmis au patient.',
    categorie: 'asepsie_sterilisation',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Exemples : injection, pose de perfusion, pansement de plaie, suture, prélèvement sanguin.',
      'Exige une hygiène rigoureuse des mains (FHA), des gants adaptés et du matériel stérile.',
    ],
  },
  {
    id: 'nettoyage',
    terme: 'Nettoyage',
    definition:
      'Une opération d’entretien et de maintenance des locaux et des équipements dont l’objectif principal est d’assurer un aspect agréable (notion de confort) et un niveau de propreté (notion d’hygiène). Cette opération d’élimination (avant tout macroscopique) des salissures particulaires, biologiques, organiques ou liquides est réalisée par un procédé respectant l’état des surfaces traitées et faisant appel, dans des proportions variables, aux facteurs combinés suivants : action chimique, action mécanique, température et temps d’action.',
    categorie: 'hygiene_locaux',
    source: 'Guide ESSP 2021, Chapitre I, Section 2 (Cercle de Sinner)',
    pointsCles: [
      'Élimination macroscopique des impuretés.',
      'Équilibre des 4 facteurs du Cercle de Sinner (Chimie, Mécanique, Temps, Température).',
    ],
  },
  {
    id: 'nettoyage-desinfection',
    terme: 'Nettoyage-désinfection',
    definition:
      'Résulte de l’utilisation d’un produit détergent-désinfectant qui associe en une seule opération nettoyage et désinfection.',
    categorie: 'hygiene_locaux',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Gain de temps sur les surfaces peu souillées.',
      'Nécessite le respect strict de la dilution et du temps de contact.',
    ],
  },
  {
    id: 'norme',
    terme: 'Norme technique',
    definition:
      'Un document qui définit les spécificités techniques d’un produit, d’un service ou d’un bien. Il est élaboré de manière consensuelle et validé par un organisme reconnu (en France l’AFNOR, au niveau Européen le CEN, au Maroc l’IMANOR et à l’international l’ISO).',
    categorie: 'securite',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Garantit l’efficacité et l’interopérabilité des dispositifs et des produits.',
      'Organisme marocain de référence : IMANOR.',
    ],
  },
  {
    id: 'pre-desinfection',
    terme: 'Pré-désinfection',
    definition:
      'Le premier traitement à effectuer en utilisant un produit détergent (ou détergent-désinfectant), sur les objets et matériels souillés dans le but de diminuer la population des micro-organismes, de faciliter le nettoyage ultérieur, et protéger le personnel lors de la manipulation des matériels.',
    categorie: 'asepsie_sterilisation',
    source: 'Guide ESSP 2021, Chapitre I, Section 2 & Chapitre V',
    pointsCles: [
      'Immédiate au point d’utilisation (immersion totale en bac plastique avec couvercle).',
      'Empêche le séchage du sang et des matières organiques sur les instruments.',
      'Protège l’agent contre les AES lors du brossage ultérieur.',
    ],
  },
  {
    id: 'savon-desinfectant',
    terme: 'Savon désinfectant ou antiseptique',
    definition: 'Un savon à action antimicrobienne.',
    categorie: 'produits',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Utilisé pour le lavage hygiénique ou chirurgical.',
      'Moins bien toléré au long cours que la friction hydro-alcoolique (SHA).',
    ],
  },
  {
    id: 'sterile',
    terme: 'Stérile',
    definition: 'L’état d’un produit exempt de micro-organismes viables.',
    normeOuRef: 'Norme NF EN 556',
    categorie: 'asepsie_sterilisation',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Niveau d’assurance de stérilité (NAS) : probabilité théorique inférieure à 1 germe viable pour 1 000 000 unités.',
    ],
  },
  {
    id: 'sterilisation',
    terme: 'Stérilisation',
    definition:
      'Un procédé qui rend un produit stérile et qui permet de conserver cet état pendant une période de temps précisée. C’est une opération qui permet d’éliminer ou de tuer les micro-organismes portés par des milieux inertes contaminés, le résultat de cette opération étant l’état de stérilité.',
    categorie: 'asepsie_sterilisation',
    source: 'Guide ESSP 2021, Chapitre I, Section 2',
    pointsCles: [
      'Comprend 9 phases successives indissociables.',
      'Procédé de choix en ESSP : vapeur d’eau sous pression (autoclave classe B, 134°C / 18 min).',
    ],
  },
  {
    id: 'ias',
    terme: 'Infection Associée aux Soins (IAS)',
    definition:
      'Une infection est dite associée aux soins si elle survient au cours ou au décours d’une prise en charge (diagnostique, thérapeutique, palliative, préventive ou éducative) d’un patient, et si elle n’était ni existante ni en incubation au début de la prise en charge. Les IAS concernent les patients, mais également les professionnels de santé et les visiteurs.',
    categorie: 'securite',
    source: 'Guide ESSP 2021, Chapitre I, Section 1.5',
    pointsCles: [
      'Touche 7% des hospitalisés dans les pays à revenu élevé et 10% dans les pays à revenu faible ou intermédiaire.',
      'Englobe les infections post-actes, post-injections et transmissions manuportées.',
    ],
  },
  {
    id: 'culture-securite',
    terme: 'Culture de sécurité',
    definition:
      'Un ensemble de manières de faire et de manières de penser largement partagées par les acteurs d’une organisation à propos de la maîtrise des risques les plus importants liés à ses activités. Elle repose sur la responsabilité partagée, la priorité à la sécurité devant les contraintes financières, la déclaration non punitive des erreurs et l’apprentissage continu.',
    categorie: 'securite',
    source: 'Guide ESSP 2021, Chapitre I, Section 1.6',
    pointsCles: [
      '5 vertus cardinales de la sécurité des soins.',
      'Culture apprenante qui tire parti des erreurs et des déclarations d’incidents.',
    ],
  },
  {
    id: 'securite-patients',
    terme: 'Sécurité des patients',
    definition:
      'Un domaine des soins de santé qui a émergé avec la complexité croissante des systèmes de santé et la hausse des préjudices causés aux patients au sein des établissements de santé. Il s’agit de prévenir et de réduire les risques et les erreurs causés aux patients dans le cadre de soins de santé.',
    categorie: 'securite',
    source: 'Guide ESSP 2021, Chapitre I, Section 1.1',
    pointsCles: [
      'Pilier de la Couverture Sanitaire Universelle (CSU - ODD 3.8).',
      'Repose sur des politiques claires, un leadership fort et des professionnels formés.',
    ],
  },
];
