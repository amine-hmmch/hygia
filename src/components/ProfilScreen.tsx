import React, { useMemo, useState } from 'react';
import { Search, Download, Check, X, ChevronRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import { extrasService, isoLocal } from '../services/extrasService';
import { construireHistorique, TYPE_LABEL, TypeHisto, LigneHisto } from '../services/historiqueService';
import { RegistreId } from '../data/thmData';
import { useToast } from '../context/ToastContext';

interface Props {
  onOpenAudit: (id: string) => void;
  onOpenRegistre: (id: RegistreId) => void;
  onOpenType: (t: 'sterilisation' | 'dechets' | 'cuisine' | 'action' | 'note') => void;
}

const fmt = (d: string) => d.split('-').reverse().join('/');
const field =
  'w-full h-11 px-3 rounded-lg border border-medium bg-card text-main text-[15px] focus:outline-none focus:border-primary';
const REGS: TypeHisto[] = ['eau', 'vecteurs', 'prelevements', 'sensibilisation'];

export const initiales = (nom?: string) =>
  (nom || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]?.toUpperCase()).join('') || 'H';

export const ProfilScreen: React.FC<Props> = ({ onOpenAudit, onOpenRegistre, onOpenType }) => {
  const { showToast } = useToast();
  const [s, setS] = useState(storageService.getSettings());
  const [type, setType] = useState<'all' | TypeHisto>('all');
  const [periode, setPeriode] = useState<'7' | '30' | 'all'>('30');
  const [seulNc, setSeulNc] = useState(false);
  const [q, setQ] = useState('');
  const [max, setMax] = useState(40);

  const tout = useMemo(() => construireHistorique(), []);
  const moisCourant = isoLocal().slice(0, 7);
  const ceMois = tout.filter((l) => l.date.startsWith(moisCourant) && l.type !== 'action').length;
  const derniere = tout.find((l) => l.type !== 'action');

  const liste = useMemo(() => {
    let limite = '';
    if (periode !== 'all') {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(periode, 10));
      limite = isoLocal(d);
    }
    const mot = q.trim().toLowerCase();
    return tout.filter(
      (l) =>
        (type === 'all' || l.type === type) &&
        (!limite || l.date >= limite) &&
        (!seulNc || l.nc) &&
        (!mot || `${l.titre} ${l.sous} ${TYPE_LABEL[l.type]}`.toLowerCase().includes(mot))
    );
  }, [tout, type, periode, seulNc, q]);

  const maj = (p: Partial<typeof s>) => setS({ ...s, ...p });
  const enregistrer = () => {
    storageService.saveSettings({ ...s, auditeurDefaut: s.auditeurDefaut || s.userName || '' });
    showToast('Profil enregistré', 'success');
  };

  const ouvrir = (l: LigneHisto) => {
    if (l.type === 'audit' && l.refId) return onOpenAudit(l.refId);
    if ((REGS as string[]).includes(l.type)) return onOpenRegistre(l.type as RegistreId);
    onOpenType(l.type as 'sterilisation' | 'dechets' | 'cuisine' | 'action' | 'note');
  };

  const exporter = () => {
    const rows: (string | number)[][] = [['Date', 'Heure', 'Type', 'Détail', 'Précision', 'Non conforme']];
    liste.forEach((l) => rows.push([l.date, l.heure, TYPE_LABEL[l.type], l.titre, l.sous, l.nc ? 'Oui' : '']));
    extrasService.downloadCsv('Hygia_historique', rows);
  };

  const types = Object.keys(TYPE_LABEL) as TypeHisto[];
  const chip = (on: boolean) =>
    `h-9 px-3 rounded-full border text-[13px] whitespace-nowrap shrink-0 ${on ? 'bg-primary text-white dark:text-[#10201a] border-primary' : 'border-medium text-main bg-card'}`;

  return (
    <div className="space-y-7 pb-6">
      <section className="flex items-center gap-4">
        <span className="w-16 h-16 rounded-full bg-primary text-white dark:text-[#10201a] flex items-center justify-center font-serif-display text-[26px] shrink-0">
          {initiales(s.userName)}
        </span>
        <div className="min-w-0">
          <h2 className="font-serif-display text-[26px] leading-tight text-main truncate">{s.userName || 'Profil à compléter'}</h2>
          <p className="text-[13px] text-sub truncate">{[s.userRole, s.etablissement].filter(Boolean).join(' · ') || 'Ajoute ton nom et ta fonction'}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 border border-soft rounded-lg divide-x divide-[var(--color-border-soft)]">
        <div className="p-3 text-center">
          <div className="text-2xl font-serif-display text-main">{ceMois}</div>
          <div className="label-caps mt-0.5">Saisies ce mois-ci</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-[15px] font-medium text-main leading-8">{derniere ? fmt(derniere.date) : '—'}</div>
          <div className="label-caps mt-0.5">Dernière activité</div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="label-caps pb-2 border-b border-medium">Identité</h3>
        <div>
          <label className="text-xs font-semibold text-main block mb-1">Nom</label>
          <input aria-label="Nom" className={field} value={s.userName || ''} onChange={(e) => maj({ userName: e.target.value })} autoComplete="off" />
        </div>
        <div>
          <label className="text-xs font-semibold text-main block mb-1">Fonction</label>
          <input aria-label="Fonction" className={field} value={s.userRole || ''} onChange={(e) => maj({ userRole: e.target.value })} placeholder="ex. Technicien d’hygiène du milieu" />
        </div>
        <div>
          <label className="text-xs font-semibold text-main block mb-1">Établissement</label>
          <input aria-label="Établissement" className={field} value={s.etablissement || ''} onChange={(e) => maj({ etablissement: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-main block mb-1">Point d’eau habituel</label>
          <input aria-label="Point d’eau habituel" className={field} value={s.pointEauDefaut || ''} onChange={(e) => maj({ pointEauDefaut: e.target.value })} placeholder="proposé au premier relevé de chlore" />
        </div>
        <button onClick={enregistrer} className="h-11 px-5 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium">
          Enregistrer
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between pb-2 border-b border-medium">
          <h3 className="label-caps">Mon historique · {liste.length}</h3>
          {liste.length > 0 && (
            <button onClick={exporter} className="text-xs text-sub flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-sub absolute start-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (service, point d’eau…)" aria-label="Rechercher dans l’historique" className={`${field} ps-9`} />
        </div>

        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-1">
          <button className={chip(type === 'all')} onClick={() => setType('all')}>Tout</button>
          {types.map((t) => (
            <button key={t} className={chip(type === t)} onClick={() => setType(t)}>{TYPE_LABEL[t]}</button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {([['7', '7 jours'], ['30', '30 jours'], ['all', 'Tout']] as const).map(([k, l]) => (
            <button key={k} className={chip(periode === k)} onClick={() => setPeriode(k)}>{l}</button>
          ))}
          <button className={chip(seulNc)} onClick={() => setSeulNc(!seulNc)}>Non conformes</button>
        </div>

        {liste.length === 0 ? (
          <p className="py-6 text-sm text-sub">Rien à afficher avec ces filtres.</p>
        ) : (
          <ul>
            {liste.slice(0, max).map((l) => (
              <li key={l.id} className="row-rule">
                <button onClick={() => ouvrir(l)} className="w-full py-3 flex items-start gap-3 text-start">
                  <span className={`mt-0.5 shrink-0 ${l.nc ? 'text-danger' : 'text-success'}`}>
                    {l.nc ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] text-main leading-snug">{l.titre}</span>
                    <span className="block text-[13px] text-sub leading-snug">
                      {TYPE_LABEL[l.type]} · {fmt(l.date)}{l.heure ? ` ${l.heure}` : ''}{l.sous ? ` · ${l.sous}` : ''}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-custom shrink-0 mt-1" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {liste.length > max && (
          <button onClick={() => setMax(max + 40)} className="w-full h-11 rounded-lg border border-medium text-sm text-main">
            Voir plus ({liste.length - max})
          </button>
        )}
      </section>
    </div>
  );
};
