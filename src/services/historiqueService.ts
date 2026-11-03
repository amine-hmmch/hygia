/** Historique unifié : lit les données existantes, ne copie rien. */
import { REGISTRES } from '../data/thmData';
import { thmService } from './thmService';
import { storageService } from './storageService';
import { cuisineService } from './cuisineService';
import { isoLocal } from './extrasService';

export type TypeHisto =
  | 'eau' | 'vecteurs' | 'prelevements' | 'sensibilisation'
  | 'sterilisation' | 'dechets' | 'cuisine' | 'audit' | 'action' | 'note';

export interface LigneHisto {
  id: string;
  type: TypeHisto;
  date: string; // YYYY-MM-DD
  heure: string;
  titre: string;
  sous: string;
  nc: boolean;
  /** À traiter : action à faire / en cours, résultat en attente (ni conforme, ni non conforme pour l'instant). */
  attente?: boolean;
  refId?: string;
}

export const TYPE_LABEL: Record<TypeHisto, string> = {
  eau: 'Eau',
  vecteurs: 'Vecteurs',
  prelevements: 'Prélèvements',
  sensibilisation: 'Sensibilisation',
  sterilisation: 'Stérilisation',
  dechets: 'Déchets',
  cuisine: 'Cuisine',
  audit: 'Audits',
  action: 'Actions',
  note: 'Notes',
};

const STATUT: Record<string, string> = { a_faire: 'à faire', en_cours: 'en cours', realise: 'réalisée', verifie: 'vérifiée' };

export function construireHistorique(): LigneHisto[] {
  const out: LigneHisto[] = [];
  REGISTRES.forEach((def) => {
    thmService.getRegistre(def.id).forEach((e) =>
      out.push({
        id: `${def.id}_${e.id}`, type: def.id as TypeHisto, date: e.date || '', heure: e.heure || '',
        titre: def.titreLigne(e), sous: def.sousTitre(e), nc: def.conforme?.(e) === false, attente: e.resultat === 'En attente', refId: e.id,
      })
    );
  });
  storageService.getSterilisationCycles().forEach((c) =>
    out.push({
      id: `st_${c.id}`, type: 'sterilisation', date: c.date, heure: c.heure || '',
      titre: `Cycle ${c.numeroCycle || ''} · ${c.programmeLabel}`.trim(), sous: `${c.temperature} °C · ${c.duree} min`, nc: !c.estConforme, refId: c.id,
    })
  );
  storageService.getDechetsPesees().forEach((p) =>
    out.push({
      id: `dc_${p.id}`, type: 'dechets', date: p.date, heure: p.heure || '',
      titre: `${p.categorieLabel} · ${String(p.poidsKg).replace('.', ',')} kg`, sous: p.service, nc: false, refId: p.id,
    })
  );
  cuisineService.getReleves().forEach((r) =>
    out.push({
      id: `cu_${r.id}`, type: 'cuisine', date: r.date, heure: r.heure,
      titre: `${r.pointLabel} · ${String(r.valeur).replace('.', ',')} °C`, sous: r.produit || r.operateur || '', nc: !r.conforme, refId: r.id,
    })
  );
  storageService.getAudits().forEach((a) =>
    out.push({
      id: `au_${a.id}`, type: 'audit', date: a.date, heure: a.heure || '',
      titre: `${a.service} · ${a.scoreGlobal} %`, sous: `${a.version === 'courte' ? 'Audit rapide' : 'Audit complet'} · ${a.totalNon} non conforme${a.totalNon > 1 ? 's' : ''}`,
      nc: a.totalNon > 0, refId: a.id,
    })
  );
  const today = isoLocal();
  storageService.getCorrectiveActions().forEach((a) =>
    out.push({
      id: `ac_${a.id}`, type: 'action', date: (a.createdAt || '').slice(0, 10), heure: (a.createdAt || '').slice(11, 16),
      titre: a.itemTitle || a.description.slice(0, 60), sous: `${STATUT[a.statut] || a.statut} · échéance ${a.echeance.split('-').reverse().join('/')}`,
      nc: (a.statut === 'a_faire' || a.statut === 'en_cours') && a.echeance < today,
      attente: a.statut === 'a_faire' || a.statut === 'en_cours', refId: a.id,
    })
  );
  const jours = thmService.getJours();
  Object.keys(jours).forEach((d) =>
    (jours[d].notes || []).forEach((n) =>
      out.push({ id: `no_${d}_${n.id}`, type: 'note', date: d, heure: n.heure || '', titre: n.texte, sous: n.zone || '', nc: false })
    )
  );
  return out.sort((x, y) => (y.date + y.heure).localeCompare(x.date + x.heure));
}
