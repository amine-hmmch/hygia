/**
 * Envoi des saisies vers une feuille Google Sheets via un petit script Google (Apps Script).
 * Hors-ligne : les saisies restent en file d'attente et partent dès que le réseau revient.
 * Aucune dépendance vers les autres services (évite les imports circulaires).
 */
import { REGISTRES } from '../data/thmData';

export interface SheetsConfig {
  url: string;
  code: string;
  actif: boolean;
  dernierEnvoi?: string;
  derniereErreur?: string;
}
export interface LigneFeuille {
  id: string; // identifiant unique : évite les doublons côté feuille
  feuille: string; // nom de l'onglet
  cols: Record<string, string | number>;
}

const CFG_KEY = 'essp_hygiene_sheets_v1';
const QUEUE_KEY = 'essp_hygiene_sheets_queue_v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

const oui = (b: boolean | undefined | null) => (b === undefined || b === null ? '' : b ? 'Oui' : 'Non');

/* ---------- Construction des lignes ---------- */
export const lignes = {
  registre(id: string, e: Record<string, any>): LigneFeuille | null {
    const def = REGISTRES.find((r) => r.id === id);
    if (!def) return null;
    const cols: Record<string, string | number> = { Date: e.date || '', Heure: e.heure || '' };
    def.champs.forEach((c) => {
      if (c.id === 'date' || c.id === 'heure') return;
      cols[c.label] = e[c.id] ?? '';
    });
    cols['Conforme'] = oui(def.conforme?.(e));
    return { id: e.id, feuille: def.titre, cols };
  },
  sterilisation(c: any): LigneFeuille {
    return {
      id: c.id,
      feuille: 'Stérilisation',
      cols: {
        Date: c.date || '', Heure: c.heure || '', 'N° cycle': c.numeroCycle || '', Autoclave: c.numeroAutoclave || '',
        Programme: c.programmeLabel || '', 'Température (°C)': c.temperature ?? '', 'Pression (bar)': c.pression ?? '',
        'Durée (min)': c.duree ?? '', Opérateur: c.operateur || '', Conforme: oui(c.estConforme),
        Anomalies: (c.anomaliesDetectees || []).join(' ; '),
      },
    };
  },
  dechets(p: any): LigneFeuille {
    return {
      id: p.id,
      feuille: 'Déchets',
      cols: {
        Date: p.date || '', Service: p.service || '', Catégorie: p.categorieLabel || '', 'Poids (kg)': p.poidsKg ?? '',
        Bordereau: p.numeroBordereau || '', Opérateur: p.operateur || '', Observations: p.observations || '',
      },
    };
  },
  cuisine(r: any): LigneFeuille {
    return {
      id: r.id,
      feuille: 'Cuisine températures',
      cols: {
        Date: r.date || '', Heure: r.heure || '', Point: r.pointLabel || '', Produit: r.produit || '',
        Valeur: r.valeur ?? '', Conforme: oui(r.conforme), Opérateur: r.operateur || '', 'Action corrective': r.actionCorrective || '',
      },
    };
  },
  audit(a: any): LigneFeuille {
    return {
      id: a.id,
      feuille: 'Audits',
      cols: {
        Date: a.date || '', Service: a.service || '', Type: a.version === 'courte' ? 'Rapide' : 'Complet',
        'Score (%)': a.scoreGlobal ?? '', 'Points non conformes': a.totalNon ?? '', Auditeur: a.auditeur || '',
      },
    };
  },
};

/* ---------- Configuration et file ---------- */
export const sheetsService = {
  getConfig(): SheetsConfig {
    return { url: '', code: '', actif: false, ...read<Partial<SheetsConfig>>(CFG_KEY, {}) };
  },
  saveConfig(c: SheetsConfig) {
    write(CFG_KEY, c);
  },
  getQueue(): LigneFeuille[] {
    const q = read<LigneFeuille[]>(QUEUE_KEY, []);
    return Array.isArray(q) ? q : [];
  },
  /** Ajoute une ligne à envoyer (si la synchronisation est active), puis tente l'envoi. */
  enqueue(l: LigneFeuille | null) {
    if (!l) return;
    const c = this.getConfig();
    if (!c.actif || !c.url) return;
    const q = this.getQueue().filter((x) => x.id !== l.id);
    q.push(l);
    write(QUEUE_KEY, q);
    void this.flush();
  },
  enqueueMany(ls: (LigneFeuille | null)[]) {
    const q = this.getQueue();
    const ids = new Set(q.map((x) => x.id));
    ls.forEach((l) => {
      if (l && !ids.has(l.id)) q.push(l);
    });
    write(QUEUE_KEY, q);
  },
  _busy: false,
  async flush(): Promise<{ envoyees: number; restantes: number; erreur?: string }> {
    const c = this.getConfig();
    if (this._busy) return { envoyees: 0, restantes: this.getQueue().length };
    if (!c.url) return { envoyees: 0, restantes: this.getQueue().length, erreur: 'Adresse du script manquante.' };
    if (typeof navigator !== 'undefined' && navigator.onLine === false)
      return { envoyees: 0, restantes: this.getQueue().length, erreur: 'Hors-ligne.' };
    this._busy = true;
    let envoyees = 0;
    let erreur: string | undefined;
    try {
      let q = this.getQueue();
      while (q.length) {
        const lot = q.slice(0, 25);
        const rep = await postJson(c.url, { code: c.code, lignes: lot });
        if (!rep.ok) {
          erreur = rep.message;
          break;
        }
        envoyees += lot.length;
        q = this.getQueue().filter((x) => !lot.some((l) => l.id === x.id));
        write(QUEUE_KEY, q);
      }
    } catch (e: any) {
      erreur = 'Réseau indisponible.';
    } finally {
      this._busy = false;
    }
    const cfg = this.getConfig();
    this.saveConfig({ ...cfg, dernierEnvoi: envoyees ? new Date().toISOString() : cfg.dernierEnvoi, derniereErreur: erreur });
    return { envoyees, restantes: this.getQueue().length, erreur };
  },
  async tester(url: string, code: string): Promise<{ ok: boolean; message: string }> {
    try {
      return await postJson(url, { code, test: true });
    } catch {
      return { ok: false, message: 'Impossible de joindre le script (réseau ou adresse incorrecte).' };
    }
  },
  clearQueue() {
    write(QUEUE_KEY, []);
  },
};

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; message: string }> {
  // text/plain évite la requête préliminaire (CORS), non gérée par Apps Script
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
  let j: any = null;
  try {
    j = await r.json();
  } catch {}
  if (!j) return { ok: false, message: 'Réponse inattendue : vérifie que le script est déployé pour « Tout le monde ».' };
  return { ok: !!j.ok, message: j.message || (j.ok ? 'OK' : 'Refusé') };
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (sheetsService.getConfig().actif) void sheetsService.flush();
  });
}
