import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChefHat,
  Thermometer,
  ClipboardCheck,
  BookOpen,
  Plus,
  Trash2,
  Printer,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from 'lucide-react';
import {
  POINTS_CONTROLE,
  evaluerTemperature,
  libelleLimite,
  CUISINE_AUDIT,
  allCuisineItems,
  CUISINE_FICHES,
} from '../data/cuisineData';
import { cuisineService, CuisineReleve, CuisineAudit } from '../services/cuisineService';
import { storageService } from '../services/storageService';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';

type Tab = 'releves' | 'audit' | 'fiches';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);
const fmtDate = (d: string) => {
  const [y, m, j] = d.split('-');
  return `${j}/${m}/${y}`;
};

const inputCls =
  'w-full h-11 px-3 rounded-lg border border-medium bg-card text-main text-[15px] focus:outline-none focus:border-primary';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="label-caps block mb-1">{label}</span>
    {children}
  </label>
);

/* ------------------------------ Relevés ------------------------------ */

const Releves: React.FC = () => {
  const { showToast } = useToast();
  const [releves, setReleves] = useState<CuisineReleve[]>(() => cuisineService.getReleves());
  const [open, setOpen] = useState(false);
  const [pointId, setPointId] = useState(POINTS_CONTROLE[0].id);
  const [valeur, setValeur] = useState('');
  const [produit, setProduit] = useState('');
  const [operateur, setOperateur] = useState(() => storageService.getSettings().userName || '');
  const [date, setDate] = useState(today());
  const [heure, setHeure] = useState(nowTime());
  const [action, setAction] = useState('');
  const [toDelete, setToDelete] = useState<string | null>(null);

  const point = POINTS_CONTROLE.find((p) => p.id === pointId)!;
  const num = parseFloat(valeur.replace(',', '.'));
  const valide = !isNaN(num);
  const conforme = valide ? evaluerTemperature(point, num) : null;

  const groupes = useMemo(() => {
    const g: Record<string, typeof POINTS_CONTROLE> = {};
    POINTS_CONTROLE.forEach((p) => (g[p.groupe] = [...(g[p.groupe] || []), p]));
    return g;
  }, []);

  const jour = releves.filter((r) => r.date === today());
  const nc = releves.filter((r) => !r.conforme).length;

  const save = () => {
    if (!valide) return;
    cuisineService.addReleve({
      date,
      heure,
      pointId,
      pointLabel: point.label,
      produit: produit.trim() || undefined,
      valeur: num,
      conforme: !!conforme,
      operateur: operateur.trim() || undefined,
      actionCorrective: !conforme ? action.trim() || undefined : undefined,
    });
    setReleves(cuisineService.getReleves());
    setValeur('');
    setProduit('');
    setAction('');
    setOpen(false);
    showToast(conforme ? 'Relevé enregistré' : 'Relevé non conforme enregistré', conforme ? 'success' : 'warning');
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 border border-soft rounded-lg divide-x divide-[var(--color-border-soft)]">
        {[
          ['Aujourd’hui', String(jour.length)],
          ['Total', String(releves.length)],
          ['Non conformes', String(nc)],
        ].map(([l, v]) => (
          <div key={l} className="p-3 text-center">
            <div className={`text-xl font-semibold ${l === 'Non conformes' && nc > 0 ? 'text-danger' : 'text-main'}`}>{v}</div>
            <div className="label-caps mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <Plus className="w-5 h-5" /> Nouveau relevé
        </button>
      ) : (
        <div className="border border-medium rounded-lg p-4 space-y-3 bg-card">
          <Field label="Point de contrôle">
            <select className={inputCls} value={pointId} onChange={(e) => setPointId(e.target.value)}>
              {Object.entries(groupes).map(([g, pts]) => (
                <optgroup key={g} label={g}>
                  {pts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Température (°C)`}>
              <input
                className={inputCls}
                inputMode="decimal"
                placeholder="ex. 3,5"
                value={valeur}
                onChange={(e) => setValeur(e.target.value)}
              />
            </Field>
            <div>
              <span className="label-caps block mb-1">Limite</span>
              <div className="h-11 flex items-center font-mono text-[15px] text-main">{libelleLimite(point)}</div>
            </div>
          </div>
          {valide && (
            <div
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                conforme ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger'
              }`}
            >
              {conforme ? 'Conforme' : 'Non conforme'}
            </div>
          )}
          {valide && !conforme && (
            <div className="space-y-2">
              <p className="text-[13px] text-sub">{point.conduite}</p>
              <Field label="Action corrective menée">
                <input className={inputCls} value={action} onChange={(e) => setAction(e.target.value)} />
              </Field>
            </div>
          )}
          <Field label="Produit / équipement (facultatif)">
            <input className={inputCls} value={produit} onChange={(e) => setProduit(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Heure">
              <input type="time" className={inputCls} value={heure} onChange={(e) => setHeure(e.target.value)} />
            </Field>
          </div>
          <Field label="Opérateur">
            <input className={inputCls} value={operateur} onChange={(e) => setOperateur(e.target.value)} />
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setOpen(false)} className="h-11 px-4 rounded-lg border border-medium text-main">
              Annuler
            </button>
            <button
              onClick={save}
              disabled={!valide}
              className="flex-1 h-11 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium disabled:opacity-40"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-baseline justify-between pb-2 border-b border-medium">
          <h3 className="label-caps">Historique</h3>
          {releves.length > 0 && (
            <button onClick={() => window.print()} className="text-xs text-sub flex items-center gap-1 no-print">
              <Printer className="w-3.5 h-3.5" /> Imprimer
            </button>
          )}
        </div>
        {releves.length === 0 ? (
          <p className="py-6 text-sm text-sub">Aucun relevé. Commence par le réfrigérateur ou la prochaine livraison.</p>
        ) : (
          <ul>
            {releves.slice(0, 60).map((r) => (
              <li key={r.id} className="row-rule py-3 flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${r.conforme ? 'text-success' : 'text-danger'}`}>
                  {r.conforme ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] text-main leading-snug">{r.pointLabel}</div>
                  <div className="text-[13px] text-sub">
                    {fmtDate(r.date)} {r.heure}
                    {r.produit ? ` · ${r.produit}` : ''}
                    {r.operateur ? ` · ${r.operateur}` : ''}
                  </div>
                  {r.actionCorrective && (
                    <div className="text-[13px] text-warning mt-0.5">Action : {r.actionCorrective}</div>
                  )}
                </div>
                <span className={`font-mono text-sm shrink-0 ${r.conforme ? 'text-main' : 'text-danger font-medium'}`}>
                  {r.valeur} °C
                </span>
                <button
                  onClick={() => setToDelete(r.id)}
                  className="text-sub p-1 -m-1 no-print"
                  aria-label="Supprimer le relevé"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmModal
        isOpen={!!toDelete}
        title="Supprimer ce relevé ?"
        message="Cette action est définitive."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (toDelete) cuisineService.deleteReleve(toDelete);
          setReleves(cuisineService.getReleves());
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

/* ------------------------------- Audit ------------------------------- */

type Rep = 'oui' | 'non' | 'na';

const AuditView: React.FC = () => {
  const { showToast } = useToast();
  const [audits, setAudits] = useState<CuisineAudit[]>(() => cuisineService.getAudits());
  const [mode, setMode] = useState<'list' | 'run' | 'detail'>('list');
  const [detail, setDetail] = useState<CuisineAudit | null>(null);
  const [reponses, setReponses] = useState<Record<string, Rep>>({});
  const [obs, setObs] = useState<Record<string, string>>({});
  const [service, setService] = useState('Cuisine');
  const [auditeur, setAuditeur] = useState(() => storageService.getSettings().userName || '');
  const [date, setDate] = useState(today());
  const [openSec, setOpenSec] = useState<string>(CUISINE_AUDIT[0].id);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const total = allCuisineItems().length;
  const answered = Object.keys(reponses).length;

  const compute = (rep: Record<string, Rep>) => {
    const v = Object.values(rep);
    const oui = v.filter((x) => x === 'oui').length;
    const non = v.filter((x) => x === 'non').length;
    const na = v.filter((x) => x === 'na').length;
    return { oui, non, na, score: oui + non > 0 ? Math.round((oui / (oui + non)) * 100) : 0 };
  };

  const start = () => {
    setReponses({});
    setObs({});
    setDate(today());
    setOpenSec(CUISINE_AUDIT[0].id);
    setMode('run');
  };

  const save = () => {
    const c = compute(reponses);
    const a = cuisineService.addAudit({
      date,
      service: service.trim() || 'Cuisine',
      auditeur: auditeur.trim() || undefined,
      etablissement: storageService.getSettings().etablissement || undefined,
      reponses,
      observations: obs,
      score: c.score,
      totalOui: c.oui,
      totalNon: c.non,
      totalNa: c.na,
    });
    setAudits(cuisineService.getAudits());
    setDetail(a);
    setMode('detail');
    showToast('Audit cuisine enregistré');
  };

  const sectionScore = (rep: Record<string, Rep>, ids: string[]) => {
    const r = ids.map((i) => rep[i]).filter((x) => x === 'oui' || x === 'non');
    return r.length ? Math.round((r.filter((x) => x === 'oui').length / r.length) * 100) : null;
  };

  const scoreColor = (s: number) => (s >= 85 ? 'text-success' : s >= 60 ? 'text-warning' : 'text-danger');

  if (mode === 'run') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Zone / service">
            <input className={inputCls} value={service} onChange={(e) => setService(e.target.value)} />
          </Field>
          <Field label="Date">
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Auditeur">
          <input className={inputCls} value={auditeur} onChange={(e) => setAuditeur(e.target.value)} />
        </Field>

        <div className="sticky top-[57px] z-20 bg-surface py-2 border-b border-soft">
          <div className="flex justify-between text-xs text-sub mb-1">
            <span>
              {answered} / {total} points
            </span>
            <span className="font-mono">{compute(reponses).score}%</span>
          </div>
          <div className="h-1 bg-card-subtle rounded">
            <div className="h-1 bg-primary rounded" style={{ width: `${(answered / total) * 100}%` }} />
          </div>
        </div>

        {CUISINE_AUDIT.map((sec) => {
          const isOpen = openSec === sec.id;
          const done = sec.items.filter((i) => reponses[i.id]).length;
          return (
            <section key={sec.id} className="border border-soft rounded-lg">
              <button
                onClick={() => setOpenSec(isOpen ? '' : sec.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-start"
              >
                <span className="text-[15px] font-medium text-main">{sec.titre}</span>
                <span className="flex items-center gap-2 text-xs text-sub font-mono">
                  {done}/{sec.items.length}
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              {isOpen && (
                <ul className="border-t border-soft">
                  {sec.items.map((it) => {
                    const val = reponses[it.id];
                    return (
                      <li key={it.id} className="row-rule px-4 py-3">
                        <p className="text-[14px] text-main leading-snug mb-2">{it.titre}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(['oui', 'non', 'na'] as Rep[]).map((r) => {
                            const active = val === r;
                            const cls = active
                              ? r === 'oui'
                                ? 'bg-success-tint text-success border-[var(--color-success)]'
                                : r === 'non'
                                ? 'bg-danger-tint text-danger border-danger'
                                : 'bg-card-subtle text-main border-medium'
                              : 'border-soft text-sub';
                            return (
                              <button
                                key={r}
                                onClick={() => setReponses({ ...reponses, [it.id]: r })}
                                className={`h-10 rounded-lg border text-sm font-medium ${cls}`}
                              >
                                {r === 'oui' ? 'Oui' : r === 'non' ? 'Non' : 'N/A'}
                              </button>
                            );
                          })}
                        </div>
                        {val === 'non' && (
                          <input
                            className={`${inputCls} mt-2 h-10 text-sm`}
                            placeholder="Observation / action à mener"
                            value={obs[it.id] || ''}
                            onChange={(e) => setObs({ ...obs, [it.id]: e.target.value })}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}

        <div className="flex gap-2 pt-2">
          <button onClick={() => setMode('list')} className="h-12 px-4 rounded-lg border border-medium text-main">
            Annuler
          </button>
          <button
            onClick={save}
            disabled={answered === 0}
            className="flex-1 h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium disabled:opacity-40"
          >
            Terminer l’audit
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'detail' && detail) {
    const nonItems = allCuisineItems().filter(({ item }) => detail.reponses[item.id] === 'non');
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between no-print">
          <button onClick={() => setMode('list')} className="text-sm text-sub flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Audits
          </button>
          <button onClick={() => window.print()} className="text-sm text-primary flex items-center gap-1">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
        </div>
        <div>
          <div className="label-caps">Rapport d’audit · Cuisine</div>
          {detail.etablissement && <div className="text-sm text-sub">{detail.etablissement}</div>}
          <div className="text-sm text-sub">
            {detail.service} · {fmtDate(detail.date)}
            {detail.auditeur ? ` · ${detail.auditeur}` : ''}
          </div>
        </div>
        <div className="border border-soft rounded-lg p-4 flex items-baseline gap-4">
          <span className={`text-4xl font-semibold ${scoreColor(detail.score)}`}>{detail.score}%</span>
          <span className="text-sm text-sub">
            {detail.totalOui} conformes · {detail.totalNon} non conforme{detail.totalNon > 1 ? "s" : ""} · {detail.totalNa} N/A
          </span>
        </div>
        <section>
          <h3 className="label-caps pb-2 border-b border-medium">Par rubrique</h3>
          {CUISINE_AUDIT.map((s) => {
            const sc = sectionScore(detail.reponses, s.items.map((i) => i.id));
            return (
              <div key={s.id} className="row-rule py-2.5 flex justify-between text-[14px]">
                <span className="text-main">{s.titre}</span>
                <span className={`font-mono ${sc === null ? 'text-sub' : scoreColor(sc)}`}>
                  {sc === null ? '—' : `${sc}%`}
                </span>
              </div>
            );
          })}
        </section>
        <section>
          <h3 className="label-caps pb-2 border-b border-medium">Points non conformes ({nonItems.length})</h3>
          {nonItems.length === 0 ? (
            <p className="py-4 text-sm text-sub">Aucun point non conforme.</p>
          ) : (
            nonItems.map(({ item }) => (
              <div key={item.id} className="row-rule py-3">
                <p className="text-[14px] text-main leading-snug">{item.titre}</p>
                {detail.observations[item.id] && (
                  <p className="text-[13px] text-warning mt-0.5">{detail.observations[item.id]}</p>
                )}
              </div>
            ))
          )}
        </section>
        <p className="text-xs text-sub">
          Audit interne basé sur les principes HACCP. Ce n’est pas un document officiel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={start}
        className="w-full h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Nouvel audit cuisine
      </button>
      <p className="text-[13px] text-sub">
        {total} points répartis en {CUISINE_AUDIT.length} rubriques : locaux, personnel, réception, stockage, cuisson,
        distribution, nettoyage, traçabilité.
      </p>
      <section>
        <h3 className="label-caps pb-2 border-b border-medium">Audits réalisés</h3>
        {audits.length === 0 ? (
          <p className="py-6 text-sm text-sub">Aucun audit pour le moment.</p>
        ) : (
          audits.map((a) => (
            <div key={a.id} className="row-rule flex items-center">
              <button
                onClick={() => {
                  setDetail(a);
                  setMode('detail');
                }}
                className="flex-1 py-3 text-start min-w-0"
              >
                <div className="text-[15px] text-main">{a.service}</div>
                <div className="text-[13px] text-sub">
                  {fmtDate(a.date)} · {a.totalNon} non conforme{a.totalNon > 1 ? 's' : ''}
                </div>
              </button>
              <span className={`font-mono text-lg font-medium ${scoreColor(a.score)}`}>{a.score}%</span>
              <button onClick={() => setToDelete(a.id)} className="ms-3 p-1 text-sub" aria-label="Supprimer l'audit">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </section>
      <ConfirmModal
        isOpen={!!toDelete}
        title="Supprimer cet audit ?"
        message="Cette action est définitive."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (toDelete) cuisineService.deleteAudit(toDelete);
          setAudits(cuisineService.getAudits());
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

/* ------------------------------- Fiches ------------------------------- */

const Fiches: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      <p className="text-[13px] text-sub pb-3">
        Repères inspirés des principes HACCP et de la réglementation en restauration collective. Les valeurs sont
        indicatives : l’étiquette du fabricant et la réglementation locale priment.
      </p>
      <div className="border-t border-medium">
        {CUISINE_FICHES.map((f) => {
          const isOpen = open === f.id;
          return (
            <div key={f.id} className="row-rule">
              <button
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="w-full py-3.5 flex items-center gap-3 text-start"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-main leading-snug">{f.titre}</span>
                  <span className="block text-[13px] text-sub leading-snug">{f.resume}</span>
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-sub" /> : <ChevronDown className="w-4 h-4 text-sub" />}
              </button>
              {isOpen && (
                <div className="pb-4 space-y-2">
                  <ul className="space-y-2">
                    {f.points.map((p, i) => (
                      <li key={i} className="text-[14px] text-main leading-snug ps-3 border-s-2 border-soft">
                        {p}
                      </li>
                    ))}
                  </ul>
                  {f.attention && (
                    <div className="bg-warning-tint text-warning rounded-lg px-3 py-2 text-[13px] font-medium">
                      {f.attention}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------- Module ------------------------------- */

export const CuisineModule: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const [tab, setTab] = useState<Tab>('releves');
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'releves', label: 'Températures', icon: <Thermometer className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'fiches', label: 'Fiches', icon: <BookOpen className="w-4 h-4" /> },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 no-print">
        <button
          onClick={onBackToHome}
          className="w-10 h-10 -ms-2 rounded-lg flex items-center justify-center text-sub"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <ChefHat className="w-6 h-6 text-primary" strokeWidth={1.7} />
        <div>
          <h2 className="text-lg font-semibold text-main leading-tight">Cuisine et restauration</h2>
          <p className="text-[13px] text-sub leading-tight">HACCP · restauration collective</p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-soft no-print">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`h-11 flex items-center justify-center gap-1.5 text-sm border-b-2 -mb-px ${
              tab === t.id ? 'border-primary text-primary font-medium' : 'border-transparent text-sub'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'releves' && <Releves />}
      {tab === 'audit' && <AuditView />}
      {tab === 'fiches' && <Fiches />}
    </div>
  );
};
