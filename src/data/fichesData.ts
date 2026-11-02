export interface FicheEtape {
  numero: number;
  titre: string;
  description?: string;
}

export interface FichePratique {
  id: string;
  category: 'mains' | 'epi' | 'locaux';
  categoryLabel: string;
  titre: string;
  chapitre: string;
  resume: string;
  duree?: string;
  objectif?: string;
  modeAction?: string;
  materiel?: string[];
  indications?: string[];
  contreIndications?: string[];
  etapes?: FicheEtape[];
  precautions?: string[];
  tags: string[];
}

export const FICHES_PRATIQUES: FichePratique[] = [
  // --- HYGIÈNE DES MAINS ---
  {
    id: 'mains-indications',
    category: 'mains',
    categoryLabel: 'Hygiène des mains',
    titre: 'Les 5 indications d’hygiène des mains (OMS)',
    chapitre: 'Chapitre III : Hygiène des Mains (Section 1)',
    resume: 'L’hygiène des mains constitue une arme simple, efficace et capitale pour la prévention de la transmission par manuportage des agents infectieux du soignant au patient, du patient au soignant et de l’environnement au patient ou soignant.',
    objectif: 'Limiter la transmission manu-portée d’agents infectieux et la transmission croisée de bactéries résistantes.',
    indications: [
      '1. Avant de toucher un patient (avant un contact ou une procédure de soins)',
      '2. Avant un geste aseptique (prévenir tout risque de transmission microbienne au patient)',
      '3. Après l’exposition à un liquide biologique (prévenir la transmission au soignant et à l’environnement)',
      '4. Après avoir touché un patient',
      '5. Après avoir touché l’environnement d’un patient',
    ],
    precautions: [
      'Les deux premières indications s’appliquent avant un contact ou une procédure de soins (protection du patient).',
      'Les trois autres s’appliquent après un contact ou une exposition à des liquides biologiques (protection du personnel et de l’environnement).',
    ],
    tags: ['indications', 'oms', 'manuportage', '5 moments', 'prévention', 'mains'],
  },
  {
    id: 'mains-lavage-simple',
    category: 'mains',
    categoryLabel: 'Hygiène des mains',
    titre: 'Lavage simple des mains',
    chapitre: 'Chapitre III : Hygiène des Mains (Tableau 10 & Figure 4)',
    resume: 'Opération ayant pour but d’éliminer les salissures et de réduire la flore transitoire par action mécanique, en utilisant de l’eau et du savon doux non désinfectant.',
    duree: '40 à 60 secondes',
    objectif: 'Réduire la flore transitoire et éliminer les salissures.',
    modeAction: 'Action strictement mécanique.',
    materiel: [
      'Accès à un point d’eau (eau du robinet)',
      'Savon doux non désinfectant (savon liquide)',
      'Essuie-mains à usage unique en distributeur',
      'Poubelle ouverte ou équipée d’une commande non manuelle',
    ],
    indications: [
      'En début et en fin de journée',
      'En cas de contact avec un liquide biologique',
      'En cas de mains visiblement sales et/ou souillées (par liquide biologique ou poudre de gants)',
    ],
    precautions: [
      'Tenue professionnelle adaptée à manches courtes',
      'Ongles courts, propres et sans vernis',
      'Mains et poignets sans bijoux ni montre',
      'Ne pas rincer à l’eau chaude pour éviter les dermatites',
      'Sécher par tamponnement et non par frottement abrasif',
    ],
    etapes: [
      { numero: 0, titre: 'Mouiller les mains abondamment', description: 'Sous l’eau du réseau.' },
      { numero: 1, titre: 'Appliquer le savon', description: 'Prendre une dose de savon liquide non désinfectant pour recouvrir toutes les surfaces des mains.' },
      { numero: 2, titre: 'Paume contre paume', description: 'Par mouvement de rotation.' },
      { numero: 3, titre: 'Dos de la main', description: 'Le dos de la main gauche avec un mouvement d’avant en arrière exercé par la paume de la main droite, et vice versa.' },
      { numero: 4, titre: 'Espaces interdigitaux', description: 'Paume contre paume et doigts entrelacés, en exerçant un mouvement d’avant en arrière.' },
      { numero: 5, titre: 'Dos des doigts', description: 'Le dos des doigts dans la paume de la main opposée, avec un mouvement d’aller-retour latéral.' },
      { numero: 6, titre: 'Pouces', description: 'Le pouce de la main gauche par rotation dans la main droite, et vice versa.' },
      { numero: 7, titre: 'Pulpe des doigts', description: 'La pulpe des doigts de la main droite dans la paume de la main gauche, et vice versa.' },
      { numero: 8, titre: 'Rincer abondamment', description: 'Rincer les mains à l’eau du réseau.' },
      { numero: 9, titre: 'Sécher soigneusement', description: 'Sécher par tamponnement à l’aide d’un essuie-mains à usage unique.' },
      { numero: 10, titre: 'Fermer le robinet', description: 'Fermer le robinet à l’aide du même essuie-mains.' },
      { numero: 11, titre: 'Élimination', description: 'Jeter l’essuie-mains dans la poubelle sans contact avec les mains.' },
    ],
    tags: ['lavage simple', 'savon', 'eau', 'flore transitoire', '40-60s', 'mains'],
  },
  {
    id: 'mains-lavage-hygienique',
    category: 'mains',
    categoryLabel: 'Hygiène des mains',
    titre: 'Lavage hygiénique des mains',
    chapitre: 'Chapitre III : Hygiène des Mains (Tableau 11)',
    resume: 'Opération ayant pour but d’éliminer la totalité de la flore transitoire par lavage en utilisant un savon liquide désinfectant.',
    duree: '40 à 60 secondes (selon fabricant)',
    objectif: 'Éliminer la totalité de la flore transitoire.',
    modeAction: 'Action mécanique combinée à l’activité chimique du savon désinfectant.',
    materiel: [
      'Eau du réseau',
      'Savon désinfectant liquide',
      'Essuie-mains à usage unique en distributeur',
      'Poubelle ouverte ou équipée d’une commande non manuelle',
    ],
    indications: [
      'Après tout contact avec un objet ou du linge potentiellement contaminé',
      'Après tout contact avec un patient infecté ou porteur d’une bactérie multi-résistante (BMR) ou avec son environnement',
      'Avant tout contact avec un patient immunodéprimé',
      'Avant toute manipulation de dispositifs médicaux (pinces à pansement, aérosol…)',
      'Avant la réalisation d’un geste invasif',
      'En cas de succession de gestes contaminants pour le même patient',
      'Après tout contact accidentel avec du sang ou des liquides biologiques',
    ],
    precautions: [
      'Tenue professionnelle adaptée à manches courtes',
      'Ongles courts, propres et sans vernis ; mains et poignets sans bijoux ni montre',
      'Ne pas utiliser simultanément le savon et le produit hydro-alcoolique',
      'Bien rincer pour éliminer tout résidu de principe actif antiseptique',
    ],
    etapes: [
      { numero: 1, titre: 'Préalables stricts', description: 'Ongles courts, sans vernis, ni bijou ni montre, manches courtes.' },
      { numero: 2, titre: 'Mouiller et savonner', description: 'Mouiller les mains et appliquer une dose de savon liquide désinfectant.' },
      { numero: 3, titre: 'Savonner 40 à 60 secondes', description: 'Même technique que le lavage simple (paumes, dos, espaces interdigitaux, dos des doigts, pouces, pulpe) pendant 40 à 60 secondes selon indications du fabricant.' },
      { numero: 4, titre: 'Rinçage et séchage', description: 'Rincer à l’eau du réseau, sécher avec essuie-mains usage unique, fermer le robinet avec le dernier essuie-mains.' },
    ],
    tags: ['lavage hygiénique', 'savon antiseptique', 'bmr', 'geste invasif', 'flore transitoire', 'mains'],
  },
  {
    id: 'mains-friction-sha',
    category: 'mains',
    categoryLabel: 'Hygiène des mains',
    titre: 'Friction hydro-alcoolique (SHA)',
    chapitre: 'Chapitre III : Hygiène des Mains (Tableau 12 & Figure 5)',
    resume: 'Traitement hygiénique des mains par friction en utilisant une solution ou un gel hydro-alcoolique conforme aux normes. Méthode de choix sur mains non souillées.',
    duree: '20 à 30 secondes',
    objectif: 'Éliminer la flore transitoire et réduire la flore résidente.',
    modeAction: 'Action chimique avec activité bactéricide prolongée.',
    materiel: ['Solution hydro-alcoolique (SHA) liquide ou gel, conforme aux normes'],
    indications: [
      'Immédiatement avant tout contact direct avec un patient',
      'Avant tout soin propre ou tout acte invasif',
      'Entre un soin contaminant et un soin propre ou un acte invasif chez un même patient',
      'Après le dernier contact direct ou soin auprès d’un patient',
      'Avant d’enfiler des gants pour un soin',
      'Immédiatement après avoir retiré des gants',
    ],
    contreIndications: [
      'Mains visiblement souillées (dans ce cas, laver d’abord à l’eau et au savon)',
      'Mains mouillées',
      'Mains poudrées',
    ],
    precautions: [
      'Appliquer exclusivement sur mains sèches, propres et non poudrées',
      'Ne pas utiliser simultanément du savon et un produit hydro-alcoolique',
      'Frictionner jusqu’au séchage complet (ne pas essuyer)',
      'Sécher complètement les mains avant d’enfiler des gants',
    ],
    etapes: [
      { numero: 1, titre: 'Remplir la paume', description: 'Déposer une dose de produit hydro-alcoolique (creux de la main), recouvrir toutes les surfaces des mains.' },
      { numero: 2, titre: 'Paume contre paume', description: 'Par mouvement de rotation.' },
      { numero: 3, titre: 'Dos des mains', description: 'Le dos de la main gauche avec un mouvement d’avant en arrière exercé par la paume droite, et vice versa.' },
      { numero: 4, titre: 'Espaces interdigitaux', description: 'Paume contre paume et doigts entrelacés, mouvement d’avant en arrière.' },
      { numero: 5, titre: 'Dos des doigts', description: 'Le dos des doigts dans la paume opposée, mouvement d’aller-retour latéral.' },
      { numero: 6, titre: 'Pouces', description: 'Le pouce de la main gauche par rotation dans la main droite, et vice versa.' },
      { numero: 7, titre: 'Pulpe des doigts', description: 'La pulpe des doigts de la main droite dans la paume gauche, et vice versa.' },
      { numero: 8, titre: 'Séchage complet', description: 'Une fois sèches (20-30 secondes), vos mains sont prêtes pour le soin.' },
    ],
    tags: ['friction', 'sha', 'hydro-alcoolique', '20-30s', 'gel', 'mains'],
  },
  {
    id: 'mains-usage-gants',
    category: 'mains',
    categoryLabel: 'Hygiène des mains',
    titre: 'Hygiène des mains et usage des gants',
    chapitre: 'Chapitre III : Hygiène des Mains (Sections 3 & 4)',
    resume: 'L’usage des gants médicaux ne se substitue en aucun cas à la pratique de l’hygiène des mains. Précautions essentielles pour éviter la contamination et les dermatites.',
    precautions: [
      'Le port de gants ne dispense JAMAIS du lavage ou de la friction hydro-alcoolique des mains.',
      'L’hygiène des mains doit être pratiquée lorsqu’elle est indiquée, indépendamment de l’usage des gants.',
      'L’hygiène des mains est impérative après le retrait des gants (risque de contamination par micro-perforations ou lors du retrait).',
      'Facteurs de mauvaise tolérance : lavages non nécessaires, très fréquents, rinçage insuffisant, eau trop chaude, séchage abrasif, application de SHA sur mains humides.',
      'Ne jamais laver les gants ni appliquer de SHA ou d’antiseptique sur les gants.',
      'Sécher complètement les mains après lavage ou friction avant d’enfiler des gants.',
    ],
    tags: ['gants', 'tolérance', 'dermatite', 'retrait', 'mains'],
  },

  // --- ÉQUIPEMENTS DE PROTECTION INDIVIDUELLE (EPI) ---
  {
    id: 'epi-gants',
    category: 'epi',
    categoryLabel: 'EPI',
    titre: 'Gants médicaux : types, indications et règles',
    chapitre: 'Chapitre IV : Équipements de Protection Individuelle (Section 1 & Tableau 13)',
    resume: 'Règle d’or : « Une paire de gants = un geste = un patient ». Les gants protègent le soignant contre les risques infectieux, chimiques et physiques, et préviennent les transmissions croisées.',
    objectif: 'Éviter les transmissions croisées et protéger le personnel soignant contre les expositions au sang et liquides biologiques.',
    indications: [
      'Gants NON STÉRILES à usage unique : Chaque fois qu’il y a un risque de contact avec du sang ou produit biologique, peau lésée, muqueuse, linge/matériel souillé, lésion cutanée au niveau des mains du soignant (ex : prélèvements sanguins, pose/dépose VVP, ablation pansement souillé, vidange sonde urinaire, injections SC/IM/IV, examen muqueuses, soins dentaires non invasifs, manipulation déchets).',
      'Gants STÉRILES à usage unique : Pour tous les gestes nécessitant un haut niveau d’asepsie et toute manipulation de produits et matériels stériles (ex : suture, pose d’une sonde urinaire, pose d’un stérilet, traitement d’une plaie, soins dentaires invasifs).',
      'NE PAS PORTER de gants lors des contacts avec la peau saine du patient.',
    ],
    precautions: [
      'Se portent sur des mains à ongles courts sans bague ni autre bijou.',
      'Mis juste avant le geste et retirés immédiatement après le geste.',
      'Changés entre deux patients et entre deux activités chez le même patient.',
      'Hygiène des mains impérative avant l’enfilage et immédiatement après le retrait.',
      'Le lavage des gants ou l’application d’antiseptiques sur les gants sont formellement proscrits.',
      'Matériaux : caoutchouc (latex, nitrile) et polymères thermoplastiques (vinyle).',
    ],
    tags: ['gants', 'stériles', 'non stériles', 'règle d’or', 'epi'],
  },
  {
    id: 'epi-blouse',
    category: 'epi',
    categoryLabel: 'EPI',
    titre: 'Tenue vestimentaire professionnelle : Blouse',
    chapitre: 'Chapitre IV : Équipements de Protection Individuelle (Section 2.1)',
    resume: 'La blouse est la tenue professionnelle de base pour la réalisation de tout soin au sein de l’établissement de santé.',
    precautions: [
      'La blouse doit impérativement avoir des manches courtes.',
      'Portée sur des vêtements à manches courtes ou soigneusement retroussées.',
      'Changée quotidiennement.',
      'Changée immédiatement chaque fois qu’elle est visiblement souillée.',
    ],
    tags: ['blouse', 'tenue', 'manches courtes', 'quotidien', 'epi'],
  },
  {
    id: 'epi-surblouse',
    category: 'epi',
    categoryLabel: 'EPI',
    titre: 'Sur-blouse de protection à usage unique',
    chapitre: 'Chapitre IV : Équipements de Protection Individuelle (Section 2.2)',
    resume: 'Règle fondamentale : « Une sur-blouse = un seul patient ». Vêtement barrière destiné aux soins à risque d’éclaboussures ou en isolement contact.',
    indications: [
      'Au cours de soins pouvant exposer les vêtements du soignant à des projections de sang ou des liquides biologiques.',
      'Au cours de soins chez un patient relevant de précautions complémentaires de type contact.',
    ],
    precautions: [
      'Une sur-blouse = un seul patient.',
      'À usage unique, éliminée dès la fin du soin dans la filière des déchets appropriée (DASRI).',
      'Friction hydro-alcoolique après le retrait.',
    ],
    tags: ['sur-blouse', 'usage unique', 'projections', 'précautions contact', 'epi'],
  },
  {
    id: 'epi-masques',
    category: 'epi',
    categoryLabel: 'EPI',
    titre: 'Masques à usage unique : types, filtration et choix',
    chapitre: 'Chapitre IV : Équipements de Protection Individuelle (Section 2.3 & Tableaux 14-15)',
    resume: 'Deux grandes catégories : Masques médicaux (chirurgicaux et anti-projections) et Masques de protection respiratoire jetables (FFP1, FFP2, FFP3 selon la norme EN 149).',
    duree: '3 heures maximum (ou dès qu’il est mouillé ou souillé)',
    objectif: 'Éviter l’émission de gouttelettes vers le patient ou protéger le soignant contre les projections et l’inhalation d’aérosols infectieux.',
    indications: [
      'Masque de soins / chirurgical : porté par le soignant pour protéger le patient lors des actes de soins sans risque de projection. Porté par le patient en cas de symptomatologie respiratoire.',
      'Masque anti-projection (couche imperméable ± visière) : protège le soignant et le patient lors d’actes de petite chirurgie ou soins à risque de projections.',
      'Appareil FFP2 (protection respiratoire filtrant ≥ 94%) : Tuberculose bacillifère ou suspicion de tuberculose pulmonaire, suspicion de maladie infectieuse émergente à transmission respiratoire.',
      'Lieux et situations : Consultation grippe/bronchiolite (chirurgical patient et soignant), Tuberculose (chirurgical patient retiré lors de l’examen, FFP2 soignant lors de l’examen), Petite chirurgie/KT central/accouchement (chirurgical soignant et patient).',
    ],
    precautions: [
      'Changer le masque toutes les 3 heures au maximum et dès qu’il est mouillé ou souillé.',
      'Ôter le masque dès la fin du soin (ne pas le laisser pendre au cou).',
      'Éliminer immédiatement dans le circuit des DASRI.',
      'Réaliser une friction hydro-alcoolique des mains après l’avoir retiré.',
      'Les masques médicaux ne protègent PAS contre l’inhalation de particules infectieuses en suspension (aérosols).',
      'Norme EN 149 pour les FFP : FFP1 (filtre ≥ 80%, fuite < 22%), FFP2 (filtre ≥ 94%, fuite < 8%), FFP3 (filtre ≥ 99%, fuite < 2%).',
    ],
    tags: ['masques', 'chirurgical', 'ffp2', 'en 149', 'tuberculose', '3 heures', 'epi'],
  },
  {
    id: 'epi-autres',
    category: 'epi',
    categoryLabel: 'EPI',
    titre: 'Autres équipements : Lunettes et accessoires',
    chapitre: 'Chapitre IV : Équipements de Protection Individuelle (Section 2.4)',
    resume: 'Protection des yeux, muqueuses faciales et de la tête lors des soins à risque d’exposition.',
    indications: [
      'Lunettes de protection / Écran facial : obligatoires en cas de risque de projection de liquides biologiques ou de solutions chimiques.',
      'Calots / Calottes médicaux et sur-chaussures : accessoires requis dans certaines circonstances aseptiques particulières (petite chirurgie, stérilisation).',
    ],
    precautions: [
      'Les lunettes de protection doivent obligatoirement comporter une protection latérale.',
      'Nettoyer et désinfecter les lunettes réutilisables après chaque utilisation.',
    ],
    tags: ['lunettes', 'écran facial', 'projections', 'calot', 'sur-chaussures', 'epi'],
  },

  // --- HYGIÈNE DE L’ENVIRONNEMENT INTERNE (LOCAUX & MATÉRIEL) ---
  {
    id: 'locaux-zonage',
    category: 'locaux',
    categoryLabel: 'Hygiène des locaux',
    titre: 'Classification des locaux selon le risque infectieux',
    chapitre: 'Chapitre II : Hygiène de l’Environnement Interne (Sections 1 à 3, Tableaux 1 & 2)',
    resume: 'L’évaluation des risques permet de hiérarchiser les locaux en 3 zones distinctes pour adapter la fréquence, les méthodes et les produits de nettoyage.',
    indications: [
      'ZONE 1 (Risque faible) : Halls, Bureaux, Buanderie, Pharmacie, Salle de réunion, Salle de repos. -> Mesure : Nettoyage quotidien, propreté macroscopique.',
      'ZONE 2 (Risque moyen) : Couloirs, Ascenseurs, Escaliers, Salles d’attente, Salles de Consultation, Salle de rééducation, Locaux d’entreposage des déchets et du linge sale, Sanitaires. -> Mesure : Bio-Nettoyage quotidien, propreté macroscopique et microscopique.',
      'ZONE 3 (Risque sévère) : Salle de Soins, Salle d’accouchement, Local de Stérilisation, Unité dentaire, Laboratoire. -> Mesure : Bio-nettoyage bi-quotidien, propreté macroscopique et microscopique.',
    ],
    precautions: [
      'Zone 1 = Propreté macroscopique visuelle (1 passage/jour minimum).',
      'Zone 2 = Propreté macroscopique et microscopique (détergence + désinfection quotidienne).',
      'Zone 3 = Propreté macroscopique et microscopique bi-quotidienne (2 passages/jour au minimum).',
      'Toute surface souillée doit être nettoyée immédiatement dès que nécessaire.',
    ],
    tags: ['zonage', 'zone 1', 'zone 2', 'zone 3', 'locaux', 'bio-nettoyage'],
  },
  {
    id: 'locaux-equipements',
    category: 'locaux',
    categoryLabel: 'Hygiène des locaux',
    titre: 'Classification des équipements selon le risque infectieux',
    chapitre: 'Chapitre II : Hygiène de l’Environnement Interne (Section 4, Tableau 3)',
    resume: 'Classification en 3 groupes selon la nature du contact anatomique lors de l’utilisation des dispositifs médicaux.',
    indications: [
      '1. Matériel sans contact avec le malade ou en contact avec la peau saine (Niveau de risque FAIBLE) : Garrot, stéthoscope, tensiomètre, thermomètre, sonde d’échographie classique, autoclave, distillateur, soudeuse, ECG... -> Mesure : À nettoyer et désinfecter après chaque usage.',
      '2. Matériel en contact avec les muqueuses ou la peau lésée superficiellement (Niveau de risque MÉDIAN) : Canule de Guedel, pince de Magill, spéculums vaginaux, sonde échographie endovaginale, laryngoscope... -> Mesure : À stériliser après chaque usage.',
      '3. Matériel introduit dans le système vasculaire, dans une cavité ou tout autre tissu stérile quelle que soit la voie d’abord (Niveau de risque HAUT) : Matériel d’injection et matériel dentaire... -> Mesure : À stériliser après chaque usage.',
    ],
    precautions: [
      'Le traitement du matériel comprend plusieurs étapes indissociables : pré-désinfection, nettoyage, rinçage, séchage et stérilisation.',
      'Toujours nettoyer avant de désinfecter.',
    ],
    tags: ['équipements', 'spéculum', 'guedel', 'stéthoscope', 'stérilisation', 'désinfection'],
  },
  {
    id: 'locaux-techniques',
    category: 'locaux',
    categoryLabel: 'Hygiène des locaux',
    titre: 'Techniques d’entretien : Dépoussiérage et Lavage',
    chapitre: 'Chapitre II : Hygiène de l’Environnement Interne (Section 5, Tableaux 4 & 5)',
    resume: 'Principes généraux et 3 techniques principales : Dépoussiérage (essuyage et balayage humide), Lavage des sols (manuel ou mécanisé) et entretien par la vapeur.',
    objectif: 'Éliminer jusqu’à 90% des poussières et le biofilm microbien sans remise en suspension des particules dans l’air.',
    precautions: [
      'Ordre logique fondamental : Commencer par les locaux les moins contaminés.',
      'Aller du propre vers le sale et du haut vers le bas.',
      'Toujours nettoyer avant de désinfecter.',
      'Préalable absolu au lavage des sols : toute opération de lavage sera précédée d’un balayage humide.',
      'Port obligatoire de tenue propre et de gants à manchettes longues éliminés entre chaque local (ou gants de ménage individuels lavés entre chaque local).',
      'Le matériel utilisé sera nettoyé et désinfecté après utilisation.',
    ],
    etapes: [
      { numero: 1, titre: 'Essuyage humide des surfaces', description: 'Enlever d’une surface autre que le sol des salissures en évitant de les remettre en suspension dans l’air. Vaporiser sur la lavette et non directement sur la surface.' },
      { numero: 2, titre: 'Balayage humide des sols', description: 'Récupérer les salissures non adhérentes sur sols secs et lisses. Élimine jusqu’à 90% des poussières.' },
      { numero: 3, titre: 'Lavage des sols (manuel ou mécanisé)', description: 'Balai de lavage à plat, balai réservoir, balai Faubert, ou monobrosse/autolaveuse. Action chimique et mécanique pour éliminer les salissures adhérentes et le biofilm.' },
      { numero: 4, titre: 'Technique vapeur', description: 'Vapeur réunissant en un seul temps une activité détersive et biocide (effets conjugués température et pression).' },
    ],
    tags: ['dépoussiérage', 'balayage humide', 'lavage des sols', 'vapeur', 'locaux'],
  },
  {
    id: 'locaux-produits',
    category: 'locaux',
    categoryLabel: 'Hygiène des locaux',
    titre: 'Choix et caractéristiques des produits d’entretien',
    chapitre: 'Chapitre II : Hygiène de l’Environnement Interne (Section 5.3, Tableau 6)',
    resume: 'Typologie des 4 grandes classes de produits : Détergents, Désinfectants, Détergents-désinfectants et Détergents-détartrants-désinfectants selon le pH et les normes AFNOR.',
    materiel: [
      'Détergent : tensio-actifs favorisant l’élimination par l’eau de souillures non solubles. Action mécanique uniquement, ne détruit pas les micro-organismes.',
      'Désinfectant : principes actifs antimicrobiens pour milieux inertes, répondant aux normes AFNOR (bactéricide NFT 72 152 / EN 1040, fongicide NFT 72 202, virucide NFT 72 180, sporicide NFT 72 230). Familles : chlorés, ammoniums quaternaires, phénols, alcools, amphotères, biguanides, oxydants. Les aldéhydes sont à éviter (toxicité).',
      'Détergent-désinfectant : double propriété, gain de temps, sans rinçage en général.',
      'Détergent-détartrant-désinfectant : triple propriété, adapté aux sanitaires, nécessite un temps de contact puis action mécanique et rinçage obligatoire.',
    ],
    precautions: [
      'Un nettoyage doit impérativement précéder l’application d’un désinfectant.',
      'Ne JAMAIS mélanger les produits (risque de réactions chimiques dangereuses et d’inactivation).',
      'Ne jamais verser l’eau dans le produit, mais verser lentement le produit dans l’eau.',
      'Respecter les dosages, les temps de contact et la température de l’eau préconisée.',
      'Vaporiser sur les articles d’essuyage et non sur les surfaces pour limiter l’aérosolisation.',
      'Étiqueter, dater et fermer tout flacon ou pulvérisateur nécessitant une dilution.',
      'Proscrire formellement l’utilisation d’emballages alimentaires.',
    ],
    tags: ['détergent', 'désinfectant', 'ph', 'afnor', 'sécurité', 'locaux'],
  },
  {
    id: 'locaux-chlore',
    category: 'locaux',
    categoryLabel: 'Hygiène des locaux',
    titre: 'Produits à base de chlore (Eau de Javel) et dilutions',
    chapitre: 'Chapitre II : Hygiène de l’Environnement Interne (Section 5.5)',
    resume: 'Règles de concentration, spectre antimicrobien et formule exacte de calcul des dilutions d’hypochlorite de sodium selon le Guide ESSP 2021.',
    indications: [
      '0,05 % (500 ppm) : Suffit par exemple pour lutter contre le rotavirus.',
      '0,1 % (1000 ppm) : Recommandé dans le cadre de la COVID-19 et suffisant pour inactiver la majeure partie des autres agents pathogènes courants en milieu de soins.',
      '0,5 % (5000 ppm) : Nécessaire pour éliminer certains agents pathogènes particulièrement résistants ou les déversements importants de sang et fluides corporels (> 10 ml).',
    ],
    precautions: [
      'Formule officielle de calcul des dilutions :',
      '[% de chlore dans l’hypochlorite liquide / % de chlore souhaité] – 1 = Nombre total de parts d’eau pour chaque part d’hypochlorite de sodium.',
      'Exemple du guide : [5 % de chlore initial / 0,5 % souhaité] - 1 = 9 parts d’eau pour 1 part d’eau de Javel.',
      'Ne jamais mélanger avec un acide ou détartrant (dégagement mortel de chlore gazeux toxique).',
      'Préparer les solutions extemporanément et conserver à l’abri de la lumière et de la chaleur.',
    ],
    tags: ['chlore', 'eau de javel', 'dilution', '500ppm', '1000ppm', '5000ppm', 'locaux'],
  },
  {
    id: 'locaux-periodicites',
    category: 'locaux',
    categoryLabel: 'Hygiène des locaux',
    titre: 'Périodicités d’entretien des locaux (Zones 1, 2, 3)',
    chapitre: 'Chapitre II : Hygiène de l’Environnement Interne (Section 5.4, Tableaux 7, 8 & 9)',
    resume: 'Calendrier réglementaire d’entretien des différentes surfaces et équipements selon les 3 zones de risque infectieux dans les ESSP.',
    indications: [
      'Zone 1 (Risque faible) : Déchets, linge sale, téléphones, poignées, interrupteurs, sanitaires, balayage et lavage des sols = TOUS LES JOURS. Supports poubelles = 1x/semaine. Lavage mécanisé, intérieur mobilier = 1x/mois. Vitres = 1x/3 mois. Murs, portes, grilles = 1x/6 mois ou 1x/an.',
      'Zone 2 (Risque moyen) : Déchets, téléphones, poignées, interrupteurs, sanitaires, balayage et lavage sols = TOUS LES JOURS. Supports poubelles = 1x/semaine. Lavage mécanisé, placards = 1x/mois. Vitres, murs, portes, grilles = 1x/3 mois.',
      'Zone 3 (Risque sévère) : Déchets, poignées, sanitaires, balayage et lavage sols = PLURI-QUOTIDIEN (minimum 2 fois/jour). Extérieur mobilier = tous les jours. Supports poubelles = 1x/semaine. Lavage mécanisé, mobilier intérieur = 1x/mois. Vitres, murs, portes = 1x/mois à 1x/3 mois.',
    ],
    precautions: [
      'Toute surface sale doit être nettoyée chaque fois que nécessaire indépendamment du calendrier.',
      'La traçabilité écrite des passages d’entretien fait partie intégrante de la démarche qualité.',
    ],
    tags: ['périodicité', 'calendrier', 'fréquence', 'zone 1', 'zone 2', 'zone 3', 'locaux'],
  },
];

// Reference Table: Classification des pH et détergents (Tableau 6)
export const TABLEAU_PH_DETERGENTS = [
  { ph: '0 à 3', classification: 'Fortement acide', exemples: 'Détartrant', indications: 'Sanitaires' },
  { ph: '3 à 6', classification: 'Faiblement acide', exemples: 'Désincrustant', indications: 'Carrelages' },
  { ph: '7', classification: 'Neutre', exemples: 'Détergent neutre', indications: 'Tous sols' },
  { ph: '8 à 11', classification: 'Faiblement alcalin', exemples: 'Détergent alcalin', indications: 'Sols très encrassés' },
  { ph: '11 à 14', classification: 'Fortement alcalin', exemples: 'Dégraissant surpuissant', indications: 'Décapant, locaux de cuisine, élimination des couches d’émulsion' },
];

// Reference Table: Périodicités comparatives (Tableaux 7, 8, 9)
export const TABLEAU_PERIODICITES = [
  { element: 'Évacuation déchets et linge sale', z1: 'Tous les jours', z2: 'Tous les jours', z3: 'Pluri-quotidien' },
  { element: 'Téléphones, poignées de porte, interrupteurs, sonnettes', z1: 'Tous les jours', z2: 'Tous les jours', z3: 'Pluri-quotidien' },
  { element: 'Extérieur du mobilier', z1: 'Tous les jours', z2: 'Tous les jours', z3: 'Tous les jours' },
  { element: 'Sanitaires, lavabos, WC', z1: 'Tous les jours', z2: 'Tous les jours', z3: 'Pluri-quotidien' },
  { element: 'Balayage humide des sols', z1: 'Tous les jours', z2: 'Tous les jours', z3: 'Pluri-quotidien' },
  { element: 'Lavage des sols', z1: 'Tous les jours', z2: 'Tous les jours', z3: 'Pluri-quotidien' },
  { element: 'Supports poubelles', z1: '1 fois / semaine', z2: '1 fois / semaine', z3: '1 fois / semaine' },
  { element: 'Lavage mécanisé des sols', z1: '1 fois / mois', z2: '1 fois / mois', z3: '1 fois / mois' },
  { element: 'Intérieur mobilier, placard', z1: '1 fois / mois', z2: '1 fois / mois', z3: '1 fois / mois' },
  { element: 'Vitres', z1: '1 fois / 3 mois', z2: '1 fois / 3 mois', z3: '1 fois / mois' },
  { element: 'Murs - Portes - Grilles de ventilation', z1: '1 fois / 6 mois à 1 an', z2: '1 fois / 3 mois', z3: '1 fois / 3 mois' },
];
