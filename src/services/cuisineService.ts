export interface CuisineReleve {
  id: string;
  date: string; // YYYY-MM-DD
  heure: string;
  pointId: string;
  pointLabel: string;
  produit?: string;
  valeur: number;
  conforme: boolean;
  operateur?: string;
  actionCorrective?: string;
  createdAt: string;
}

export interface CuisineAudit {
  id: string;
  date: string;
  service: string; // ex. Cuisine centrale
  auditeur?: string;
  etablissement?: string;
  reponses: Record<string, 'oui' | 'non' | 'na'>;
  observations: Record<string, string>;
  score: number;
  totalOui: number;
  totalNon: number;
  totalNa: number;
  createdAt: string;
}

export const CUISINE_RELEVES_KEY = 'essp_hygiene_cuisine_releves_v1';
export const CUISINE_AUDITS_KEY = 'essp_hygiene_cuisine_audits_v1';

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Stockage impossible', e);
  }
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const cuisineService = {
  getReleves: (): CuisineReleve[] =>
    read<CuisineReleve>(CUISINE_RELEVES_KEY).sort((a, b) =>
      (b.date + b.heure).localeCompare(a.date + a.heure)
    ),
  addReleve(r: Omit<CuisineReleve, 'id' | 'createdAt'>): CuisineReleve {
    const full = { ...r, id: uid(), createdAt: new Date().toISOString() };
    write(CUISINE_RELEVES_KEY, [full, ...read<CuisineReleve>(CUISINE_RELEVES_KEY)]);
    return full;
  },
  deleteReleve(id: string) {
    write(CUISINE_RELEVES_KEY, read<CuisineReleve>(CUISINE_RELEVES_KEY).filter((r) => r.id !== id));
  },
  getAudits: (): CuisineAudit[] =>
    read<CuisineAudit>(CUISINE_AUDITS_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  addAudit(a: Omit<CuisineAudit, 'id' | 'createdAt'>): CuisineAudit {
    const full = { ...a, id: uid(), createdAt: new Date().toISOString() };
    write(CUISINE_AUDITS_KEY, [full, ...read<CuisineAudit>(CUISINE_AUDITS_KEY)]);
    return full;
  },
  deleteAudit(id: string) {
    write(CUISINE_AUDITS_KEY, read<CuisineAudit>(CUISINE_AUDITS_KEY).filter((a) => a.id !== id));
  },
};
