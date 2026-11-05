// Données de démonstration (chargées à la demande depuis Réglages).
import { storageService } from './storageService';
import type { AuditItemResponse, DechetPesee } from '../types';
import { dateLocale } from '../utils/dates';

export function loadDemoData(): void {
  const settings = storageService.getSettings();
  const etablissementName = settings.etablissement || '';
  const auditeurName = settings.userName || settings.auditeurDefaut || 'Auditeur';
  const today = dateLocale();

  const initialResponses: Record<string, AuditItemResponse> = {
    c_env_1: { itemId: 'c_env_1', value: 'oui', observation: '2 passages par jour effectués' },
    c_env_2: { itemId: 'c_env_2', value: 'oui', observation: 'Chariot de ménage complet' },
    c_env_3: { itemId: 'c_env_3', value: 'oui', observation: 'Agent formé au bio-nettoyage' },
    c_epi_1: { itemId: 'c_epi_1', value: 'oui', observation: 'Boîtes de masques pleines' },
    c_epi_2: { itemId: 'c_epi_2', value: 'oui', observation: 'Gants tailles M et L dispo' },
    c_epi_3: { itemId: 'c_epi_3', value: 'oui', observation: 'Tenue propre conforme' },
    c_mains_1: { itemId: 'c_mains_1', value: 'oui', observation: 'Lavabo fonctionnel avec commande au coude' },
    c_mains_2: { itemId: 'c_mains_2', value: 'oui', observation: 'Distributeur savon opérationnel' },
    c_mains_3: { itemId: 'c_mains_3', value: 'non', observation: 'Rupture temporaire d’essuie-mains jetables' },
    c_mains_4: { itemId: 'c_mains_4', value: 'oui', observation: 'Flacon de SHA à l’entrée' },
    c_ster_1: { itemId: 'c_ster_1', value: 'oui', observation: 'Autoclave classe B contrôlé' },
    c_ster_2: { itemId: 'c_ster_2', value: 'oui', observation: 'Soudure vérifiée' },
    c_ster_3: { itemId: 'c_ster_3', value: 'oui', observation: 'Eau distillée disponible' },
    c_ster_4: { itemId: 'c_ster_4', value: 'oui', observation: 'Bacs avec couvercle' },
    c_ster_5: { itemId: 'c_ster_5', value: 'oui', observation: 'Solution détergente-désinfectante présente' },
    c_ster_6: { itemId: 'c_ster_6', value: 'na', observation: 'Pas de textile stérilisé dans ce service' },
    c_ster_7: { itemId: 'c_ster_7', value: 'oui', observation: 'Gaines conformes' },
    c_ster_8: { itemId: 'c_ster_8', value: 'oui', observation: 'Témoins de passage virés au noir' },
    c_dmp_1: { itemId: 'c_dmp_1', value: 'oui', observation: 'Sachets rouges en place' },
    c_dmp_2: { itemId: 'c_dmp_2', value: 'na', observation: 'Pas de déchets cytotoxiques' },
    c_dmp_3: { itemId: 'c_dmp_3', value: 'oui', observation: 'Poubelle noire ménagère' },
    c_dmp_4: { itemId: 'c_dmp_4', value: 'oui', observation: 'Boîte de sécurité jaune < 3/4 pleine' },
    c_dmp_5: { itemId: 'c_dmp_5', value: 'oui', observation: 'Tri respecté par le personnel' },
    c_dmp_6: { itemId: 'c_dmp_6', value: 'oui', observation: 'Sacs bien ficelés' },
    c_dmp_7: { itemId: 'c_dmp_7', value: 'oui', observation: 'Ramassage 11h et 16h' },
    c_dmp_8: { itemId: 'c_dmp_8', value: 'non', observation: 'Local de stockage DMP resté non verrouillé' },
    c_dmp_9: { itemId: 'c_dmp_9', value: 'oui', observation: 'Bordereaux de suivi signés' },
  };

  storageService.saveAudit({
    titre: 'Audit Évaluation - Salle de Soins (Tableau 20)',
    version: 'courte',
    service: 'Salle de Soins',
    date: today,
    heure: '10:30',
    auditeur: auditeurName,
    etablissement: etablissementName,
    responses: initialResponses,
    commentairesGeneraux: 'Audit initial d’exemple. Deux points de vigilance : réapprovisionnement essuie-mains et fermeture du local DMP.',
    createdAt: new Date().toISOString(),
  });

  // Cycle stérilisation exemple
  storageService.saveSterilisationCycle({
    numeroCycle: 'Cycle #01',
    date: today,
    heure: '09:15',
    numeroAutoclave: 'Autoclave A1 (Classe B)',
    operateur: auditeurName,
    programme: 'instruments_134',
    programmeLabel: 'Instruments de soins et petite chirurgie (134°C / 18 min)',
    temperature: 134,
    pression: 3.0,
    duree: 18,
    compositionCharge: '2 boîtes de petite chirurgie, tambours de pansement, sachets de pinces',
    bowieDickConforme: true,
    resultatIndicateur: 'conforme',
    sicciteConforme: true,
    integriteEmballageConforme: true,
    observations: 'Test de Bowie-Dick réalisé à 08h30 (virage homogène). Cycle conforme aux spécifications du Guide 2021. Charge libérée.',
  });

  // Pesées déchets exemple
  const formatDate = (d: Date) => dateLocale(d);
  const d0 = new Date();
  const d1 = new Date();
  d1.setDate(d1.getDate() - 1);
  const d2 = new Date();
  d2.setDate(d2.getDate() - 3);

  const demoPesees: Array<Omit<DechetPesee, 'id' | 'createdAt'>> = [
    {
      date: formatDate(d0),
      heure: '11:45',
      service: 'Salle de Soins',
      categorie: 'cat1_infectieux',
      categorieLabel: 'Catégorie 1 : Déchets infectieux & DASRI (sachets rouges)',
      contenantCouleur: 'rouge',
      poidsKg: 7.4,
      numeroBordereau: 'BS-2025-081',
      operateur: auditeurName,
      societeCollecte: 'Prestataire agréé DMP',
      observations: 'Collecte matinale, sacs étanches fermés aux 3/4 sans fuite.',
    },
    {
      date: formatDate(d0),
      heure: '11:50',
      service: 'Salle de Soins',
      categorie: 'cat1_tranchant',
      categorieLabel: 'Catégorie 1 : Piquants & tranchants (boîtes jaunes)',
      contenantCouleur: 'jaune',
      poidsKg: 0.85,
      numeroBordereau: 'BS-2025-081',
      operateur: auditeurName,
      societeCollecte: 'Prestataire agréé DMP',
      observations: '2 boîtes de sécurité polyéthylène fermées définitivement.',
    },
    {
      date: formatDate(d0),
      heure: '12:10',
      service: 'Administration & Accueil',
      categorie: 'cat4_menager',
      categorieLabel: 'Catégorie 4 : Déchets ménagers et assimilés (sacs noirs)',
      contenantCouleur: 'noir',
      poidsKg: 38.0,
      operateur: 'Agent de propreté communal',
      societeCollecte: 'Service communal de propreté',
      observations: 'Papiers, emballages propres, cartons pliés.',
    },
    {
      date: formatDate(d1),
      heure: '16:00',
      service: 'Maternité / Salle d’accouchement',
      categorie: 'cat3_anatomique',
      categorieLabel: 'Catégorie 3 : Déchets anatomiques (sacs blancs)',
      contenantCouleur: 'blanc',
      poidsKg: 3.1,
      numeroBordereau: 'BMH-RAB-042',
      operateur: auditeurName,
      societeCollecte: 'Bureau Municipal d’Hygiène (BMH)',
      observations: 'Double sac plastique blanc hermétique. Évacuation pour inhumation réglementaire.',
    },
    {
      date: formatDate(d1),
      heure: '16:30',
      service: 'Pharmacie / Soins',
      categorie: 'cat2_chimique_pharma',
      categorieLabel: 'Catégorie 2 : Produits chimiques & pharmaceutiques (marron)',
      contenantCouleur: 'marron',
      poidsKg: 1.6,
      numeroBordereau: 'BS-2025-080',
      operateur: auditeurName,
      societeCollecte: 'Prestataire agréé DMP',
      observations: 'Médicaments périmés inventoriés, flacons de désinfectant vides.',
    },
    {
      date: formatDate(d2),
      heure: '10:30',
      service: 'Consultations & Laboratoire',
      categorie: 'cat4_menager',
      categorieLabel: 'Catégorie 4 : Déchets ménagers et assimilés (sacs noirs)',
      contenantCouleur: 'noir',
      poidsKg: 44.2,
      operateur: 'Agent de propreté communal',
      societeCollecte: 'Service communal de propreté',
    },
  ];

  for (const p of demoPesees) {
    storageService.saveDechetPesee(p);
  }
}
