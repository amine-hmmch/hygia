import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import { cuisineService } from '../services/cuisineService';
import { getChecklist } from '../data/checklistsData';
import { PRIORITE_LABEL } from '../data/planActionData';
import { APP_NAME } from '../config/app';
import { thmService } from '../services/thmService';
import { REGISTRES, RegistreId } from '../data/thmData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMonth?: string; // YYYY-MM
}

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const fmt = (d: string) => d.split('-').reverse().join('/');
const STATUT = { a_faire: 'À faire', en_cours: 'En cours', realise: 'Réalisé', verifie: 'Vérifié' } as const;

const H: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <h3 className="label-caps pb-2 border-b border-medium mb-2">
    {n}. {children}
  </h3>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[13px] text-sub py-2">{children}</p>
);

export const RapportMensuelModal: React.FC<Props> = ({ isOpen, onClose, defaultMonth }) => {
  const [month, setMonth] = useState(defaultMonth || new Date().toISOString().slice(0, 7));
  const [periode, setPeriode] = useState<'mois' | 'trimestre'>('mois');

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('print-report');
    return () => document.body.classList.remove('print-report');
  }, [isOpen]);

  const data = useMemo(() => {
    if (!isOpen) return null;
    const an = parseInt(month.slice(0, 4), 10);
    const m0 = parseInt(month.slice(5, 7), 10) - 1;
    const debut = periode === 'mois' ? m0 : Math.floor(m0 / 3) * 3;
    const mois0 = periode === 'mois' ? [m0] : [debut, debut + 1, debut + 2];
    const prefixes = mois0.map((x) => `${an}-${String(x + 1).padStart(2, '0')}`);
    const inMonth = (d?: string) => !!d && prefixes.some((pf) => d.startsWith(pf));
    const plan = thmService.getPlan(an);
    const planLignes = plan.activites
      .map((a) => ({
        axe: a.axe,
        titre: a.titre,
        prevu: mois0.reduce((t, x) => t + (a.prevu[x] || 0), 0),
        fait: mois0.reduce((t, x) => t + thmService.realise(a, an, x), 0),
      }))
      .filter((l) => l.prevu > 0 || l.fait > 0);
    const registres = REGISTRES.map((def) => {
      const lignes = thmService.getRegistre(def.id as RegistreId).filter((e) => inMonth(e.date));
      return { id: def.id, titre: def.titre, n: lignes.length, nc: lignes.filter((e) => def.conforme?.(e) === false).length };
    });
    const journalJours = Object.keys(thmService.getJours()).filter((d) => inMonth(d));
    const audits = storageService.getAudits().filter((a) => inMonth(a.date));
    const allActions = storageService.getCorrectiveActions();
    const today = new Date().toISOString().split('T')[0];
    const ouvertes = allActions.filter((a) => a.statut === 'a_faire' || a.statut === 'en_cours');
    const enRetard = ouvertes.filter((a) => a.echeance < today);
    const cloturees = allActions.filter((a) => (a.statut === 'realise' || a.statut === 'verifie') && inMonth((a.updatedAt || a.createdAt).slice(0, 10)));
    const cycles = storageService.getSterilisationCycles().filter((c) => inMonth(c.date));
    const pesees = storageService.getDechetsPesees().filter((p) => inMonth(p.date));
    const releves = cuisineService.getReleves().filter((r) => inMonth(r.date));
    const auditsCuisine = cuisineService.getAudits().filter((a) => inMonth(a.date));

    // Moyenne par rubrique
    const titres: Record<string, string> = {};
    [...getChecklist('courte').composantes, ...getChecklist('exhaustive').composantes].forEach((c) => (titres[c.id] = c.titre));
    const acc: Record<string, { sum: number; n: number }> = {};
    audits.forEach((a) =>
      Object.entries(a.scoresParComposante || {}).forEach(([id, s]) => {
        if (s.ouiCount + s.nonCount === 0) return;
        acc[id] = acc[id] || { sum: 0, n: 0 };
        acc[id].sum += s.score;
        acc[id].n += 1;
      })
    );
    const rubriques = Object.entries(acc).map(([id, v]) => ({ titre: titres[id] || id, score: Math.round(v.sum / v.n) }));

    const parCategorie: Record<string, number> = {};
    pesees.forEach((p) => (parCategorie[p.categorieLabel] = (parCategorie[p.categorieLabel] || 0) + (p.poidsKg || 0)));

    return {
      planLignes,
      registres,
      nbJournal: journalJours.length,
      audits,
      score: audits.length ? Math.round(audits.reduce((s, a) => s + a.scoreGlobal, 0) / audits.length) : null,
      rubriques,
      ouvertes,
      enRetard,
      cloturees,
      cycles,
      cyclesOk: cycles.filter((c) => c.estConforme).length,
      anomalies: cycles.filter((c) => !c.estConforme),
      pesees,
      totalKg: pesees.reduce((s, p) => s + (p.poidsKg || 0), 0),
      parCategorie,
      releves,
      relevesNc: releves.filter((r) => !r.conforme),
      auditsCuisine,
    };
  }, [isOpen, month, periode]);

  if (!isOpen || !data) return null;
  const settings = storageService.getSettings();
  const [y, m] = month.split('-');
  const m0n = parseInt(m, 10) - 1;
  const titreMois =
    periode === 'mois' ? `${MOIS[m0n]} ${y}` : `${Math.floor(m0n / 3) + 1}${Math.floor(m0n / 3) === 0 ? 'er' : 'e'} trimestre ${y}`;
  const tone = (n: number) => (n >= 80 ? 'text-success' : n >= 50 ? 'text-warning' : 'text-danger');

  const Stat: React.FC<{ label: string; value: string; cls?: string }> = ({ label, value, cls = 'text-main' }) => (
    <div className="p-3 text-center">
      <div className={`text-2xl font-serif-display ${cls}`}>{value}</div>
      <div className="label-caps mt-0.5 leading-tight">{label}</div>
    </div>
  );

  return createPortal(
    <div className="report-overlay fixed inset-0 z-[60] overflow-y-auto bg-surface">
      <div className="no-print sticky top-0 z-10 bg-surface border-b border-soft px-4 py-2.5 flex items-center gap-2">
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          className="h-10 px-3 rounded-lg border border-medium bg-card text-main text-[15px]"
          aria-label="Mois du rapport"
        />
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value as 'mois' | 'trimestre')}
          className="h-10 px-2 rounded-lg border border-medium bg-card text-main text-[15px]"
          aria-label="Période"
        >
          <option value="mois">Mois</option>
          <option value="trimestre">Trimestre</option>
        </select>
        <span className="flex-1" />
        <button
          onClick={() => window.print()}
          className="h-10 px-3.5 rounded-lg bg-primary text-white dark:text-[#10201a] text-sm font-medium flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" /> <span className="whitespace-nowrap">Imprimer</span>
        </button>
        <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 flex items-center justify-center text-sub">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="report-sheet max-w-3xl mx-auto px-4 py-6 space-y-7">
        <header>
          <p className="label-caps">{settings.etablissement || APP_NAME} · {periode === 'mois' ? 'Rapport mensuel' : 'Rapport trimestriel'} d’hygiène</p>
          <h2 className="font-serif-display text-[30px] leading-tight text-main mt-1 capitalize">{titreMois}</h2>
          <p className="text-[13px] text-sub mt-1">
            {settings.userName ? `Établi par ${settings.userName}${settings.userRole ? `, ${settings.userRole}` : ''}` : 'Document interne'}
          </p>
        </header>

        <section>
          <H n={1}>Synthèse</H>
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-soft rounded-lg divide-x divide-y sm:divide-y-0 divide-[var(--color-border-soft)]">
            <Stat label="Audits réalisés" value={String(data.audits.length)} />
            <Stat label="Score moyen" value={data.score === null ? '—' : `${data.score}%`} cls={data.score === null ? 'text-muted-custom' : tone(data.score)} />
            <Stat label="Actions ouvertes" value={String(data.ouvertes.length)} />
            <Stat label="En retard" value={String(data.enRetard.length)} cls={data.enRetard.length ? 'text-danger' : 'text-main'} />
          </div>
        </section>

        <section>
          <H n={2}>Audits de la période</H>
          {data.audits.length === 0 ? (
            <Empty>Aucun audit ce mois-ci.</Empty>
          ) : (
            <div>
              {data.audits.map((a) => (
                <div key={a.id} className="row-rule py-2 flex justify-between gap-3 text-[14px]">
                  <span className="text-main">
                    {a.service} <span className="text-sub">· {fmt(a.date)}</span>
                  </span>
                  <span className={`font-mono ${tone(a.scoreGlobal)}`}>{a.scoreGlobal}%</span>
                </div>
              ))}
            </div>
          )}
          {data.rubriques.length > 0 && (
            <div className="mt-4">
              <p className="label-caps mb-1">Moyenne par rubrique</p>
              {data.rubriques.map((r) => (
                <div key={r.titre} className="row-rule py-2 flex justify-between gap-3 text-[14px]">
                  <span className="text-main">{r.titre}</span>
                  <span className={`font-mono ${tone(r.score)}`}>{r.score}%</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <H n={3}>Plan d’action en cours</H>
          {data.ouvertes.length === 0 ? (
            <Empty>Aucune action ouverte.</Empty>
          ) : (
            [...data.ouvertes]
              .sort((a, b) => a.echeance.localeCompare(b.echeance))
              .map((a) => (
                <div key={a.id} className="row-rule py-2.5 break-inside-avoid">
                  <p className="text-[14px] text-main leading-snug">
                    {a.itemTitle} <span className="text-sub">· {a.service}</span>
                  </p>
                  <p className="text-[13px] text-sub leading-snug">{a.description}</p>
                  <p className="text-[12px] text-sub mt-0.5">
                    {a.priorite ? `Priorité ${PRIORITE_LABEL[a.priorite].toLowerCase()} · ` : ''}
                    {a.responsable} · avant le {fmt(a.echeance)}
                    {a.echeance < new Date().toISOString().split('T')[0] ? ' · EN RETARD' : ''} · {STATUT[a.statut]}
                  </p>
                </div>
              ))
          )}
          <p className="text-[12px] text-sub mt-2">{data.cloturees.length} action(s) clôturée(s) ce mois-ci.</p>
        </section>

        <section>
          <H n={4}>Stérilisation</H>
          {data.cycles.length === 0 ? (
            <Empty>Aucun cycle enregistré ce mois-ci.</Empty>
          ) : (
            <>
              <p className="text-[14px] text-main">
                {data.cycles.length} cycle(s), dont {data.cyclesOk} conforme(s) ({Math.round((data.cyclesOk / data.cycles.length) * 100)}%).
              </p>
              {data.anomalies.map((c) => (
                <div key={c.id} className="row-rule py-2 text-[13px]">
                  <span className="text-main">
                    Cycle {c.numeroCycle} · {fmt(c.date)}
                  </span>
                  <span className="text-sub"> · {c.anomaliesDetectees.join(', ') || 'non conforme'}</span>
                </div>
              ))}
            </>
          )}
        </section>

        <section>
          <H n={5}>Déchets de soins</H>
          {data.pesees.length === 0 ? (
            <Empty>Aucune pesée enregistrée ce mois-ci.</Empty>
          ) : (
            <>
              <p className="text-[14px] text-main">Total : {data.totalKg.toFixed(1).replace('.', ',')} kg</p>
              {Object.entries(data.parCategorie).map(([k, v]) => (
                <div key={k} className="row-rule py-2 flex justify-between text-[14px]">
                  <span className="text-main">{k}</span>
                  <span className="font-mono text-sub">{v.toFixed(1).replace('.', ',')} kg</span>
                </div>
              ))}
            </>
          )}
        </section>

        <section>
          <H n={6}>Cuisine et restauration</H>
          {data.releves.length === 0 && data.auditsCuisine.length === 0 ? (
            <Empty>Aucune donnée de cuisine ce mois-ci.</Empty>
          ) : (
            <>
              <p className="text-[14px] text-main">
                {data.releves.length} relevé(s) de température, dont {data.relevesNc.length} non conforme(s).
              </p>
              {data.relevesNc.map((r) => (
                <div key={r.id} className="row-rule py-2 text-[13px]">
                  <span className="text-main">
                    {r.pointLabel} : {r.valeur} °C
                  </span>
                  <span className="text-sub">
                    {' '}· {fmt(r.date)} {r.heure}
                    {r.actionCorrective ? ` · Action : ${r.actionCorrective}` : ''}
                  </span>
                </div>
              ))}
              {data.auditsCuisine.map((a) => (
                <div key={a.id} className="row-rule py-2 flex justify-between text-[14px]">
                  <span className="text-main">Audit cuisine · {fmt(a.date)}</span>
                  <span className={`font-mono ${tone(a.score)}`}>{a.score}%</span>
                </div>
              ))}
            </>
          )}
        </section>

        <section>
          <H n={7}>Réalisation du plan d’action annuel</H>
          {data.planLignes.length === 0 ? (
            <Empty>Aucune activité prévue sur la période.</Empty>
          ) : (
            <div className="border-t border-soft">
              {data.planLignes.map((l, k) => (
                <div key={k} className="row-rule flex items-center gap-3 py-2 text-[14px]">
                  <span className="flex-1 min-w-0 text-main">{l.titre}</span>
                  <span className={`font-mono ${l.fait >= l.prevu ? 'text-success' : 'text-warning'}`}>{l.fait}/{l.prevu}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <H n={8}>Registres et carnet de bord</H>
          <div className="border-t border-soft">
            {data.registres.map((r) => (
              <div key={r.id} className="row-rule flex items-center gap-3 py-2 text-[14px]">
                <span className="flex-1 text-main">{r.titre}</span>
                <span className="font-mono text-sub">{r.n} saisie{r.n > 1 ? 's' : ''}</span>
                <span className={`font-mono w-24 text-end ${r.nc ? 'text-danger' : 'text-success'}`}>{r.nc ? `${r.nc} non conf.` : r.n ? 'conforme' : '—'}</span>
              </div>
            ))}
            <div className="row-rule flex items-center gap-3 py-2 text-[14px]">
              <span className="flex-1 text-main">Carnet de bord (jours renseignés)</span>
              <span className="font-mono text-sub">{data.nbJournal}</span>
            </div>
          </div>
        </section>

        <footer className="pt-6 grid grid-cols-2 gap-8 text-[12px] text-sub">
          <div className="border-t border-medium pt-1.5">Établi par (nom et signature)</div>
          <div className="border-t border-medium pt-1.5">Visa de la direction</div>
        </footer>
        <p className="text-[11px] text-sub">Rapport interne généré par {APP_NAME}. Ce n’est pas un document officiel.</p>
      </div>
    </div>,
    document.body
  );
};
