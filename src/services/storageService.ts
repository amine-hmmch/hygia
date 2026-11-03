import {
  Audit,
  CorrectiveAction,
  ChecklistVersion,
  AuditItemResponse,
  ActionStatus,
  SterilisationCycle,
  DechetPesee,
  PeriodiciteAudit,
  ServiceAuditReminder,
} from '../types';
import { DEFAULT_SERVICES, getAllItemsForVersion, getChecklist } from '../data/checklistsData';
import { validateCycleParameters, PROGRAMMES_GUIDE } from '../data/sterilisationData';
import { getRecommandation, addDays } from '../data/planActionData';
import { thmService } from './thmService';
import { CUISINE_RELEVES_KEY, CUISINE_AUDITS_KEY, cuisineService } from './cuisineService';

const AUDITS_STORAGE_KEY = 'essp_hygiene_audits_v1';
const ACTIONS_STORAGE_KEY = 'essp_hygiene_actions_v1';
const SERVICES_STORAGE_KEY = 'essp_hygiene_services_v1';
const SETTINGS_STORAGE_KEY = 'essp_hygiene_settings_v1';
const FAVORITES_STORAGE_KEY = 'essp_hygiene_favorites_v1';
const STERILISATION_STORAGE_KEY = 'essp_hygiene_sterilisation_v1';
const DECHETS_STORAGE_KEY = 'essp_hygiene_dechets_pesee_v1';
const PERIODICITIES_STORAGE_KEY = 'essp_hygiene_periodicities_v1';
const ONBOARDING_STORAGE_KEY = 'essp_hygiene_onboarding_v1';

export interface AppSettings {
  etablissement: string;        // Nom de l'établissement (champ libre)
  userName?: string;            // Nom de l'utilisateur (facultatif)
  userRole?: string;            // Sa fonction (facultatif)
  provinceRegion?: string;      // Province / région (facultatif)
  auditeurDefaut?: string;      // Auditeur par défaut (facultatif)
  pointEauDefaut?: string;      // Point d'eau habituel (facultatif)
  theme: 'dark' | 'light';
}

const DEFAULT_SETTINGS: AppSettings = {
  etablissement: '',
  userName: '',
  userRole: '',
  provinceRegion: '',
  auditeurDefaut: '',
  theme: 'dark',
};

export const storageService = {
  // Settings & Profil Établissement
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      // Sanitize any previous hardcoded test hospital names
      if (
        parsed.etablissement &&
        (parsed.etablissement.includes('Médiouna') ||
          parsed.etablissement.includes('Centre de Santé Urbain / Hôpital ESSP') ||
          parsed.etablissement.includes('Hassan II'))
      ) {
        parsed.etablissement = '';
        this.saveSettings(parsed);
      }
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  // Onboarding first launch
  hasCompletedOnboarding(): boolean {
    try {
      return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    } catch {
      return true;
    }
  },

  setOnboardingCompleted(): void {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      console.error('Failed to save onboarding state', e);
    }
  },

  // Services
  getServices(): string[] {
    try {
      const data = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  },

  saveServices(services: string[]): void {
    try {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to save services', e);
    }
  },

  addService(serviceName: string): string[] {
    const trimmed = serviceName.trim();
    if (!trimmed) return this.getServices();
    const services = this.getServices();
    if (!services.includes(trimmed)) {
      const updated = [...services, trimmed];
      this.saveServices(updated);
      return updated;
    }
    return services;
  },

  // Periodicities & Reminders
  getServicePeriodicities(): Record<string, PeriodiciteAudit> {
    try {
      const data = localStorage.getItem(PERIODICITIES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    // Sensible defaults according to risk level
    return {
      'Salle de Soins': 'hebdomadaire',
      'Unité de Stérilisation': 'hebdomadaire',
      'Maternité / Salle d’accouchement': 'hebdomadaire',
      'Laboratoire': 'bimensuelle',
      'Consultations': 'mensuelle',
      'Cabinet Dentaire': 'bimensuelle',
      'Pharmacie': 'mensuelle',
      'Salle d’attente & Accueil': 'mensuelle',
    };
  },

  setServicePeriodicity(service: string, periodicite: PeriodiciteAudit): void {
    const map = this.getServicePeriodicities();
    map[service] = periodicite;
    try {
      localStorage.setItem(PERIODICITIES_STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save service periodicity', e);
    }
  },

  getAuditReminders(): ServiceAuditReminder[] {
    const services = this.getServices();
    const audits = this.getAudits();
    const periodicities = this.getServicePeriodicities();

    const periodiciteDaysMap: Record<PeriodiciteAudit, number> = {
      hebdomadaire: 7,
      bimensuelle: 14,
      mensuelle: 30,
      trimestrielle: 90,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return services.map((service) => {
      const periodicite: PeriodiciteAudit = periodicities[service] || 'mensuelle';
      const daysInterval = periodiciteDaysMap[periodicite] || 30;

      // Find latest audit for this service
      const serviceAudits = audits.filter(
        (a) => a.service.toLowerCase().trim() === service.toLowerCase().trim()
      );
      const latestAudit = serviceAudits.length > 0 ? serviceAudits[0] : null;

      if (!latestAudit) {
        const nextDateStr = today.toISOString().split('T')[0];
        const res: ServiceAuditReminder = {
          service,
          periodicite,
          periodiciteJours: daysInterval,
          derniereDateAudit: undefined,
          prochaineDateAudit: nextDateStr,
          // Jamais audité : à planifier, pas "en retard"
          statut: 'a_faire',
          joursRestants: 0,
        };
        return res;
      }

      const lastAuditDate = new Date(latestAudit.date);
      lastAuditDate.setHours(0, 0, 0, 0);

      const nextAuditDate = new Date(lastAuditDate);
      nextAuditDate.setDate(nextAuditDate.getDate() + daysInterval);

      const diffTime = nextAuditDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let statut: 'a_jour' | 'a_faire' | 'en_retard' = 'a_jour';
      if (diffDays < 0) {
        statut = 'en_retard';
      } else if (diffDays <= 3) {
        statut = 'a_faire';
      }

      return {
        service,
        periodicite,
        periodiciteJours: daysInterval,
        derniereDateAudit: latestAudit.date,
        dernierScore: latestAudit.scoreGlobal,
        prochaineDateAudit: nextAuditDate.toISOString().split('T')[0],
        statut,
        joursRestants: diffDays,
      };
    }).sort((a, b) => a.joursRestants - b.joursRestants);
  },

  // Fiches Favoris
  getFavoriteFiches(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return data ? JSON.parse(data) : ['mains-friction-sha', 'locaux-zonage', 'epi-masques'];
    } catch {
      return ['mains-friction-sha', 'locaux-zonage', 'epi-masques'];
    }
  },

  toggleFavoriteFiche(ficheId: string): string[] {
    const favs = this.getFavoriteFiches();
    let updated: string[];
    if (favs.includes(ficheId)) {
      updated = favs.filter((id) => id !== ficheId);
    } else {
      updated = [...favs, ficheId];
    }
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
    return updated;
  },

  // Audits
  getAudits(): Audit[] {
    try {
      const data = localStorage.getItem(AUDITS_STORAGE_KEY);
      if (!data) return [];
      const parsed: Audit[] = JSON.parse(data);
      let changed = false;
      const settings = this.getSettings();
      parsed.forEach((a) => {
        if (
          a.etablissement &&
          (a.etablissement.includes('Médiouna') || a.etablissement.includes('Hassan II'))
        ) {
          a.etablissement = settings.etablissement || '';
          changed = true;
        }
      });
      if (changed) {
        try {
          localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(parsed));
        } catch {}
      }
      return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  },

  getAuditById(id: string): Audit | null {
    const audits = this.getAudits();
    return audits.find((a) => a.id === id) || null;
  },

  calculateScores(responses: Record<string, AuditItemResponse>, version: ChecklistVersion) {
    const template = getChecklist(version);
    const scoresParComposante: Audit['scoresParComposante'] = {};

    let totalOui = 0;
    let totalNon = 0;
    let totalNa = 0;

    for (const comp of template.composantes) {
      const itemIds: string[] = [];
      if (comp.items) {
        comp.items.forEach((i) => itemIds.push(i.id));
      }
      if (comp.sousCategories) {
        comp.sousCategories.forEach((sc) => sc.items.forEach((i) => itemIds.push(i.id)));
      }

      let compOui = 0;
      let compNon = 0;
      let compNa = 0;

      for (const id of itemIds) {
        const resp = responses[id];
        if (resp) {
          if (resp.value === 'oui') compOui++;
          else if (resp.value === 'non') compNon++;
          else if (resp.value === 'na') compNa++;
        }
      }

      const evaluated = compOui + compNon;
      const compScore = evaluated > 0 ? Math.round((compOui / evaluated) * 100) : 100;

      scoresParComposante[comp.id] = {
        totalItems: itemIds.length,
        ouiCount: compOui,
        nonCount: compNon,
        naCount: compNa,
        score: compScore,
      };

      totalOui += compOui;
      totalNon += compNon;
      totalNa += compNa;
    }

    const totalEvaluated = totalOui + totalNon;
    const scoreGlobal = totalEvaluated > 0 ? Math.round((totalOui / totalEvaluated) * 100) : 100;

    return {
      scoreGlobal,
      scoresParComposante,
      totalOui,
      totalNon,
      totalNa,
    };
  },

  saveAudit(auditData: Omit<Audit, 'id' | 'scoreGlobal' | 'scoresParComposante' | 'totalOui' | 'totalNon' | 'totalNa' | 'updatedAt'> & { id?: string }): Audit {
    const isNew = !auditData.id;
    const id = auditData.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const { scoreGlobal, scoresParComposante, totalOui, totalNon, totalNa } = this.calculateScores(auditData.responses, auditData.version);

    const completeAudit: Audit = {
      ...auditData,
      id,
      scoreGlobal,
      scoresParComposante,
      totalOui,
      totalNon,
      totalNa,
      createdAt: (auditData as any).createdAt || now,
      updatedAt: now,
    };

    const audits = this.getAudits();
    const existingIndex = audits.findIndex((a) => a.id === id);
    if (existingIndex >= 0) {
      audits[existingIndex] = completeAudit;
    } else {
      audits.unshift(completeAudit);
    }

    try {
      localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(audits));
    } catch (e) {
      console.error('Failed to save audit to localStorage', e);
    }

    // Automatically synchronize corrective actions for any item marked "Non"
    this.syncCorrectiveActionsForAudit(completeAudit);

    return completeAudit;
  },

  deleteAudit(id: string): void {
    const audits = this.getAudits().filter((a) => a.id !== id);
    try {
      localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(audits));
    } catch (e) {
      console.error('Failed to delete audit', e);
    }

    // Also remove associated actions
    const actions = this.getCorrectiveActions().filter((act) => act.auditId !== id);
    try {
      localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actions));
    } catch (e) {
      console.error('Failed to delete associated actions', e);
    }
  },

  // Corrective Actions
  getCorrectiveActions(): CorrectiveAction[] {
    try {
      const data = localStorage.getItem(ACTIONS_STORAGE_KEY);
      if (!data) return [];
      const parsed: CorrectiveAction[] = JSON.parse(data);
      return parsed.sort((a, b) => new Date(a.echeance).getTime() - new Date(b.echeance).getTime());
    } catch {
      return [];
    }
  },

  saveCorrectiveAction(action: CorrectiveAction): CorrectiveAction {
    const actions = this.getCorrectiveActions();
    const index = actions.findIndex((a) => a.id === action.id);
    const updatedAction = {
      ...action,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      actions[index] = updatedAction;
    } else {
      actions.unshift(updatedAction);
    }

    try {
      localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actions));
    } catch (e) {
      console.error('Failed to save action', e);
    }

    return updatedAction;
  },

  updateActionStatus(actionId: string, statut: ActionStatus): void {
    const actions = this.getCorrectiveActions();
    const target = actions.find((a) => a.id === actionId);
    if (target) {
      target.statut = statut;
      target.updatedAt = new Date().toISOString();
      try {
        localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actions));
      } catch (e) {
        console.error('Failed to update action status', e);
      }
    }
  },

  deleteCorrectiveAction(actionId: string): void {
    const actions = this.getCorrectiveActions().filter((a) => a.id !== actionId);
    try {
      localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actions));
    } catch (e) {
      console.error('Failed to delete action', e);
    }
  },

  // Sterilisation Cycles
  getSterilisationCycles(): SterilisationCycle[] {
    try {
      const data = localStorage.getItem(STERILISATION_STORAGE_KEY);
      if (!data) return [];
      const parsed: SterilisationCycle[] = JSON.parse(data);
      return parsed.sort((a, b) => new Date(b.date + ' ' + (b.heure || '00:00')).getTime() - new Date(a.date + ' ' + (a.heure || '00:00')).getTime());
    } catch {
      return [];
    }
  },

  getSterilisationCycleById(id: string): SterilisationCycle | null {
    const cycles = this.getSterilisationCycles();
    return cycles.find((c) => c.id === id) || null;
  },

  saveSterilisationCycle(
    cycleData: Omit<SterilisationCycle, 'id' | 'createdAt' | 'estConforme' | 'anomaliesDetectees'> & { id?: string }
  ): SterilisationCycle {
    const id = cycleData.id || `steril_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const { estConforme, anomalies } = validateCycleParameters({
      programme: cycleData.programme,
      temperature: cycleData.temperature,
      duree: cycleData.duree,
      pression: cycleData.pression,
      bowieDickConforme: cycleData.bowieDickConforme,
      resultatIndicateur: cycleData.resultatIndicateur,
      sicciteConforme: cycleData.sicciteConforme,
      integriteEmballageConforme: cycleData.integriteEmballageConforme,
    });

    const completeCycle: SterilisationCycle = {
      ...cycleData,
      id,
      estConforme,
      anomaliesDetectees: anomalies,
      createdAt: (cycleData as any).createdAt || now,
      updatedAt: now,
    };

    const cycles = this.getSterilisationCycles();
    const existingIndex = cycles.findIndex((c) => c.id === id);
    if (existingIndex >= 0) {
      cycles[existingIndex] = completeCycle;
    } else {
      cycles.unshift(completeCycle);
    }

    try {
      localStorage.setItem(STERILISATION_STORAGE_KEY, JSON.stringify(cycles));
    } catch (e) {
      console.error('Failed to save sterilisation cycle', e);
    }

    return completeCycle;
  },

  deleteSterilisationCycle(id: string): void {
    const cycles = this.getSterilisationCycles().filter((c) => c.id !== id);
    try {
      localStorage.setItem(STERILISATION_STORAGE_KEY, JSON.stringify(cycles));
    } catch (e) {
      console.error('Failed to delete sterilisation cycle', e);
    }
  },

  // Déchets & Pesées (DMP)
  getDechetsPesees(): DechetPesee[] {
    try {
      const data = localStorage.getItem(DECHETS_STORAGE_KEY);
      if (!data) return [];
      const parsed: DechetPesee[] = JSON.parse(data);
      return parsed.sort((a, b) => new Date(b.date + ' ' + (b.heure || '00:00')).getTime() - new Date(a.date + ' ' + (a.heure || '00:00')).getTime());
    } catch {
      return [];
    }
  },

  getDechetPeseeById(id: string): DechetPesee | null {
    const list = this.getDechetsPesees();
    return list.find((p) => p.id === id) || null;
  },

  saveDechetPesee(
    peseeData: Omit<DechetPesee, 'id' | 'createdAt'> & { id?: string }
  ): DechetPesee {
    const id = peseeData.id || `pesee_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const completePesee: DechetPesee = {
      ...peseeData,
      id,
      createdAt: (peseeData as any).createdAt || now,
      updatedAt: now,
    };

    const list = this.getDechetsPesees();
    const existingIndex = list.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      list[existingIndex] = completePesee;
    } else {
      list.unshift(completePesee);
    }

    try {
      localStorage.setItem(DECHETS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save dechet pesee', e);
    }

    return completePesee;
  },

  deleteDechetPesee(id: string): void {
    const list = this.getDechetsPesees().filter((p) => p.id !== id);
    try {
      localStorage.setItem(DECHETS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to delete dechet pesee', e);
    }
  },

  // Automatic action generation from "Non" responses
  syncCorrectiveActionsForAudit(audit: Audit): void {
    const allItems = getAllItemsForVersion(audit.version);
    const existingActions = this.getCorrectiveActions();
    const otherAuditActions = existingActions.filter((a) => a.auditId !== audit.id);
    const currentAuditActions = existingActions.filter((a) => a.auditId === audit.id);

    const updatedCurrentAuditActions: CorrectiveAction[] = [];

    // For each item in this audit
    for (const [itemId, resp] of Object.entries(audit.responses)) {
      if (resp.value === 'non') {
        const itemMeta = allItems.find((i) => i.itemId === itemId);
        const itemTitle = itemMeta ? itemMeta.itemTitle : itemId;
        const componentTitle = itemMeta ? itemMeta.componentTitle : 'Composante';
        const componentId = itemMeta ? itemMeta.componentId : '';

        const reco = getRecommandation(itemId, itemTitle, componentId);
        const constat = resp.observation?.trim() || undefined;

        // Une action existante garde les modifications de l'utilisateur
        const existing = currentAuditActions.find((a) => a.itemId === itemId);
        if (existing) {
          updatedCurrentAuditActions.push({
            ...existing,
            itemTitle,
            componentTitle,
            service: audit.service,
            constat,
            source: existing.source ?? reco.source,
            priorite: existing.priorite ?? reco.priorite,
            updatedAt: new Date().toISOString(),
          });
        } else {
          updatedCurrentAuditActions.push({
            id: `act_${audit.id}_${itemId}`,
            auditId: audit.id,
            itemId,
            itemTitle,
            componentId,
            componentTitle,
            service: audit.service,
            description: reco.mesure,
            constat,
            source: reco.source,
            priorite: reco.priorite,
            responsable: reco.responsable,
            echeance: addDays(audit.date, reco.delaiJours),
            statut: 'a_faire',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    const merged = [...otherAuditActions, ...updatedCurrentAuditActions];
    try {
      localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to synchronize actions', e);
    }
  },

  // Export / Import
  exportFullBackup(): string {
    const backup = {
      app: 'ESSP Sécurité Sanitaire - Ministère de la Santé Maroc',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      audits: this.getAudits(),
      correctiveActions: this.getCorrectiveActions(),
      sterilisationCycles: this.getSterilisationCycles(),
      dechetsPesees: this.getDechetsPesees(),
      cuisineReleves: cuisineService.getReleves(),
      cuisineAudits: cuisineService.getAudits(),
      thm: thmService.exportAll(),
      services: this.getServices(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importFullBackup(jsonString: string): { success: boolean; message: string; count?: { audits: number; actions: number; cycles: number; dechets: number } } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Fichier JSON invalide' };
      }

      if (Array.isArray(data.audits)) {
        localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(data.audits));
      }
      if (Array.isArray(data.correctiveActions)) {
        localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(data.correctiveActions));
      }
      if (Array.isArray(data.sterilisationCycles)) {
        localStorage.setItem(STERILISATION_STORAGE_KEY, JSON.stringify(data.sterilisationCycles));
      }
      if (Array.isArray(data.dechetsPesees)) {
        localStorage.setItem(DECHETS_STORAGE_KEY, JSON.stringify(data.dechetsPesees));
      }
      if (Array.isArray(data.cuisineReleves)) {
        localStorage.setItem(CUISINE_RELEVES_KEY, JSON.stringify(data.cuisineReleves));
      }
      if (Array.isArray(data.cuisineAudits)) {
        localStorage.setItem(CUISINE_AUDITS_KEY, JSON.stringify(data.cuisineAudits));
      }
      if (data.thm) thmService.importAll(data.thm);
      if (Array.isArray(data.services)) {
        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(data.services));
      }
      if (data.settings && typeof data.settings === 'object') {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data.settings));
      }

      return {
        success: true,
        message: 'Importation réussie avec succès !',
        count: {
          audits: data.audits ? data.audits.length : 0,
          actions: data.correctiveActions ? data.correctiveActions.length : 0,
          cycles: data.sterilisationCycles ? data.sterilisationCycles.length : 0,
          dechets: data.dechetsPesees ? data.dechetsPesees.length : 0,
        },
      };
    } catch (e: any) {
      return { success: false, message: `Erreur de lecture du fichier : ${e.message}` };
    }
  },

  // Effacement complet des données (audits, actions, stérilisation, pesées)
  clearAllData(): void {
    try {
      localStorage.removeItem(AUDITS_STORAGE_KEY);
      localStorage.removeItem(ACTIONS_STORAGE_KEY);
      localStorage.removeItem(STERILISATION_STORAGE_KEY);
      localStorage.removeItem(DECHETS_STORAGE_KEY);
      localStorage.removeItem(CUISINE_RELEVES_KEY);
      localStorage.removeItem(CUISINE_AUDITS_KEY);
      thmService.clearAll();
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  },

  // Chargement de données d'exemple génériques à la demande de l'utilisateur
  loadDemoData(): void {
    const settings = this.getSettings();
    const etablissementName = settings.etablissement || '';
    const auditeurName = settings.userName || settings.auditeurDefaut || 'Auditeur';
    const today = new Date().toISOString().split('T')[0];

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

    this.saveAudit({
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
    this.saveSterilisationCycle({
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
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
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
      this.saveDechetPesee(p);
    }
  },

  // Aucune donnée de démonstration : l'application démarre vide.
  seedInitialDataIfEmpty(): void {},

  resetToDemoData(): void {
    this.clearAllData();
  },
};
