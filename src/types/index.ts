export type ChecklistVersion = 'courte' | 'exhaustive';

export type ComplianceValue = 'oui' | 'non' | 'na' | null;

export type ActionStatus = 'a_faire' | 'en_cours' | 'realise' | 'verifie';

export interface CorrectiveAction {
  id: string;
  auditId: string;
  itemId: string;
  itemTitle: string;
  componentId: string;
  componentTitle: string;
  service: string;
  description: string;
  responsable: string;
  echeance: string; // ISO date YYYY-MM-DD
  statut: ActionStatus;
  createdAt: string;
  updatedAt?: string;
  commentaires?: string;
}

export interface AuditItemResponse {
  itemId: string;
  value: ComplianceValue;
  observation: string;
}

export interface Audit {
  id: string;
  titre: string;
  version: ChecklistVersion;
  service: string;
  date: string; // YYYY-MM-DD
  heure?: string;
  auditeur: string; // Technicien d'hygiène
  etablissement: string;
  responses: Record<string, AuditItemResponse>;
  scoreGlobal: number; // 0 - 100
  scoresParComposante: Record<string, {
    totalItems: number;
    ouiCount: number;
    nonCount: number;
    naCount: number;
    score: number;
  }>;
  totalOui: number;
  totalNon: number;
  totalNa: number;
  commentairesGeneraux?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItemDef {
  id: string;
  titre: string;
  sousCategorie?: string;
  explication?: string;
}

export interface ChecklistComponentDef {
  id: string;
  titre: string;
  description?: string;
  sousCategories?: {
    id: string;
    titre: string;
    items: ChecklistItemDef[];
  }[];
  items?: ChecklistItemDef[]; // if no subcategories
}

export interface ChecklistTemplate {
  version: ChecklistVersion;
  titre: string;
  tableauNumero: string;
  description: string;
  composantes: ChecklistComponentDef[];
}

export type SterilisationProgramme = 'instruments_134' | 'textile_caoutchouc_125' | 'bowie_dick_134';

export interface SterilisationCycle {
  id: string;
  numeroCycle: string;
  date: string; // YYYY-MM-DD
  heure?: string;
  numeroAutoclave: string;
  operateur: string;
  programme: SterilisationProgramme;
  programmeLabel: string;
  temperature: number; // °C
  pression: number; // bars
  duree: number; // minutes
  compositionCharge: string;
  bowieDickConforme: boolean | 'non_applicable';
  resultatIndicateur: 'conforme' | 'non_conforme';
  sicciteConforme: boolean;
  integriteEmballageConforme: boolean;
  estConforme: boolean;
  anomaliesDetectees: string[];
  observations?: string;
  createdAt: string;
  updatedAt?: string;
}

export type DechetCategorie =
  | 'cat1_infectieux'
  | 'cat1_tranchant'
  | 'cat1_sang'
  | 'cat2_chimique_pharma'
  | 'cat3_anatomique'
  | 'cat4_menager'
  | 'speciaux_mercure';

export interface DechetPesee {
  id: string;
  date: string; // YYYY-MM-DD
  heure?: string;
  service: string;
  categorie: DechetCategorie;
  categorieLabel: string;
  contenantCouleur: 'rouge' | 'jaune' | 'marron' | 'blanc' | 'noir' | 'special';
  poidsKg: number;
  numeroBordereau?: string;
  operateur: string;
  societeCollecte?: string;
  observations?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PeriodiciteAudit = 'hebdomadaire' | 'bimensuelle' | 'mensuelle' | 'trimestrielle';

export interface ServicePeriodiciteSetting {
  service: string;
  periodicite: PeriodiciteAudit;
}

export interface ServiceAuditReminder {
  service: string;
  periodicite: PeriodiciteAudit;
  periodiciteJours: number;
  derniereDateAudit?: string;
  dernierScore?: number;
  prochaineDateAudit: string;
  statut: 'a_jour' | 'a_faire' | 'en_retard';
  joursRestants: number;
}

export interface GlossaireItem {
  id: string;
  terme: string;
  definition: string;
  normeOuRef?: string;
  pointsCles?: string[];
  categorie: 'hygiene_locaux' | 'asepsie_sterilisation' | 'produits' | 'microbiologie' | 'securite';
  source: string;
}

export interface EtablissementProfile {
  etablissementName: string;
  userName?: string;
  userRole?: string;
  provinceRegion?: string;
}



