import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import { thmService } from '../services/thmService';
import { DEFAULT_SERVICES } from '../data/checklistsData';
import { AXES, AXES_DISTRICT, Activite, NOMS_MOIS_LONGS, TACHES_PAR_DEFAUT, planParDefaut, planDistrict } from '../data/thmData';
import { NIVEAUX, RYTHMES, SUJETS, SujetId, servicesParDefaut, sujetDeActivite, sujetsParDefaut } from '../data/configData';

export const CONFIG_DISMISS_KEY = 'essp_hygiene_config_dismiss_v1';

const inputCls =
  'w-full min-h-[44px] px-3 py-2 rounded-lg bg-card border border-medium text-main text-[15px] focus:outline-none focus:border-primary';

const Choix: React.FC<{ actif: boolean; onClick: () => void; titre: string; desc?: string; role?: 'radio' | 'checkbox' }> = ({
  actif, onClick, titre, desc, role = 'checkbox',
}) => (
  <button
    type="button"
    role={role}
    aria-checked={actif}
    onClick={onClick}
    className={`w-full min-h-[56px] rounded-lg border px-3.5 py-2.5 flex items-center gap-3 text-start ${actif ? 'border-primary bg-card' : 'border-soft'}`}
  >
    <span className={`w-6 h-6 shrink-0 border flex items-center justify-center ${role === 'radio' ? 'rounded-full' : 'rounded-md'} ${actif ? 'bg-primary border-primary text-white dark:text-[#10201a]' : 'border-medium'}`}>
      {actif && <Check className="w-4 h-4" strokeWidth={2.6} />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[15px] text-main leading-snug">{titre}</span>
      {desc && <span className="block text-[12.5px] text-sub leading-snug">{desc}</span>}
    </span>
  </button>
);

export const ConfigurationWizard: React.FC<{ isOpen: boolean; onClose: () => void; onDone: () => void }> = ({ isOpen, onClose, onDone }) => {
  const settings = storageService.getSettings();
  const annee = new Date().getFullYear();
  const planActuel = thmService.getPlan(annee);
  const tousServices = useMemo(() => {
    const saved = storageService.getServices();
    return [...DEFAULT_SERVICES, ...saved.filter((s) => !DEFAULT_SERVICES.includes(s))];
  }, []);

  const [etape, setEtape] = useState(0);
  const [niveau, setNiveau] = useState<string>(settings.niveau || '');
  const [sujets, setSujets] = useState<SujetId[]>((settings.sujets as SujetId[]) || []);
  const [services, setServices] = useState<string[]>(storageService.getServices());
  const [nouveauService, setNouveauService] = useState('');
  const [modePlan, setModePlan] = useState<'generer' | 'vide' | 'garder'>(planActuel.choisi ? 'garder' : 'generer');
  const [incl, setIncl] = useState<Record<string, boolean>>({});
  const [rythme, setRythme] = useState<Record<string, string>>({});
  const [autres, setAutres] = useState('');
  const [depuis, setDepuis] = useState(new Date().getMonth());

  const propose = useMemo(() => {
    if (niveau === 'district') {
      return planDistrict(annee, settings.userRole || undefined).activites.map((a) => ({ a, axeIndex: AXES_DISTRICT.indexOf(a.axe) }));
    }
    const base = planParDefaut(annee).activites;
    return base.map((a) => ({ a, axeIndex: AXES.indexOf(a.axe) }));
  }, [annee, niveau]);
  const listeAxes = niveau === 'district' ? AXES_DISTRICT : AXES;

  const choisirNiveau = (id: string) => {
    setNiveau(id);
    setSujets(sujetsParDefaut(id));
    setServices(servicesParDefaut(id, tousServices));
  };
  const basculer = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const preparerPlan = () => {
    const i: Record<string, boolean> = {};
    propose.forEach(({ a, axeIndex }) => {
      const s = sujetDeActivite(a, niveau === 'district' ? -1 : axeIndex);
      i[a.id] = !s || sujets.includes(s);
    });
    setIncl(i);
  };

  const suivant = () => {
    if (etape === 2) preparerPlan();
    setEtape(etape + 1);
  };

  const terminer = () => {
    const cur = storageService.getSettings();
    storageService.saveSettings({ ...cur, niveau, sujets, configure: true });
    if (services.length) storageService.saveServices(services);

    // Plan d'action de l'année
    const lignes = autres.split('\n').map((l) => l.trim()).filter(Boolean);
    const responsable = cur.userName || 'Technicien d’hygiène du milieu';
    const autresActs: Activite[] = lignes.map((titre) => ({
      id: thmService.newActiviteId(),
      axe: 'Autres activités',
      titre,
      outil: '',
      indicateur: '',
      responsable,
      prevu: Array(12).fill(1),
      manuel: Array(12).fill(0),
    }));
    if (modePlan === 'generer') {
      const acts: Activite[] = propose
        .filter(({ a }) => incl[a.id])
        .map(({ a }) => {
          const r = RYTHMES.find((x) => x.id === (rythme[a.id] || 'type'));
          return { ...a, prevu: r?.prevu ? [...r.prevu] : [...a.prevu], manuel: Array(12).fill(0) };
        });
      const toutes = [...acts, ...autresActs];
      const axes = [...listeAxes.filter((x) => toutes.some((a) => a.axe === x)), ...(autresActs.length ? ['Autres activités'] : [])];
      thmService.savePlan({ ...(niveau === 'district' ? planDistrict(annee) : planParDefaut(annee)), activites: toutes, axes, suiviDepuis: depuis });
    } else if (modePlan === 'vide') {
      const p = thmService.planVide(annee);
      thmService.savePlan({ ...p, activites: autresActs, axes: autresActs.length ? ['Autres activités'] : [], suiviDepuis: depuis });
    }

    // Tâches du jour : on n'adapte que la liste de départ, jamais une liste déjà modifiée
    const actuelles = thmService.getTaches();
    if (JSON.stringify(actuelles) === JSON.stringify(TACHES_PAR_DEFAUT)) {
      const garde = TACHES_PAR_DEFAUT.filter((t) => {
        if (t.zone === 'Cuisine') return sujets.includes('cuisine');
        if (t.zone === 'Déchets') return sujets.includes('dechets');
        if (t.zone === 'Eau') return sujets.includes('eau');
        return true;
      });
      thmService.saveTaches(garde);
    }
    onDone();
  };

  if (!isOpen) return null;

  const TOTAL = 5;
  const peutSuivre = etape === 0 ? !!niveau : etape === 1 ? sujets.length > 0 : true;
  const titres = ['Où travailles-tu ?', 'Que suis-tu dans ton travail ?', 'Tes services', `Ton plan d’action ${annee}`, 'Tout est prêt ?'];
  const nbActs = propose.filter(({ a }) => incl[a.id]).length + autres.split('\n').filter((l) => l.trim()).length;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-surface flex flex-col no-print" role="dialog" aria-modal="true" aria-label="Configurer l’application">
      <div className="px-4 pt-3 pb-2 border-b border-soft flex items-center gap-3">
        {etape > 0 ? (
          <button onClick={() => setEtape(etape - 1)} aria-label="Étape précédente" className="w-11 h-11 -ms-2 flex items-center justify-center text-sub">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <span className="w-10" />
        )}
        <div className="flex-1 min-w-0">
          <p className="label-caps">Étape {etape + 1} sur {TOTAL}</p>
          <div className="h-1 bg-card-subtle rounded mt-1.5">
            <div className="h-1 bg-primary rounded transition-all" style={{ width: `${((etape + 1) / TOTAL) * 100}%` }} />
          </div>
        </div>
        <button onClick={onClose} className="h-11 px-2 -me-2 text-[14px] text-sub flex items-center gap-1">
          Plus tard <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="font-serif-display text-[26px] leading-tight text-main">{titres[etape]}</h2>

          {etape === 0 && (
            <>
              <p className="text-[14px] text-sub">Je prépare l’application selon ton lieu de travail. Tu pourras tout changer ensuite.</p>
              <div className="space-y-2" role="radiogroup" aria-label="Lieu de travail">
                {NIVEAUX.map((n) => (
                  <Choix key={n.id} role="radio" actif={niveau === n.id} onClick={() => choisirNiveau(n.id)} titre={n.label} desc={n.desc} />
                ))}
              </div>
              {(niveau === 'district' || niveau === 'gst') && (
                <p className="text-[13px] text-sub rounded-lg border border-soft px-3 py-2.5">
                  {niveau === 'district'
                    ? 'Un plan d’action type « district » est prêt (eau, plages, hygiène alimentaire, vecteurs, salubrité, formation). Les chiffres à programmer sont les tiens. Les outils de supervision des centres ne sont pas encore dans l’application.'
                    : 'Les outils de supervision des centres ne sont pas encore dans l’application. Tu peux déjà suivre tes propres registres, audits et plan d’action.'}
                </p>
              )}
            </>
          )}

          {etape === 1 && (
            <>
              <p className="text-[14px] text-sub">Coche ce dont tu t’occupes. Ce que tu ne coches pas disparaît des raccourcis et du plan (tu pourras le remettre).</p>
              <div className="space-y-2">
                {SUJETS.map((s) => (
                  <Choix key={s.id} actif={sujets.includes(s.id)} onClick={() => setSujets(basculer(sujets, s.id))} titre={s.label} desc={s.desc} />
                ))}
              </div>
            </>
          )}

          {etape === 2 && (
            <>
              <p className="text-[14px] text-sub">Les services de ton établissement. Ils apparaissent dans les audits et les saisies.</p>
              <div className="space-y-2">
                {tousServices.map((s) => (
                  <Choix key={s} actif={services.includes(s)} onClick={() => setServices(basculer(services, s))} titre={s} />
                ))}
                {services.filter((s) => !tousServices.includes(s)).map((s) => (
                  <Choix key={s} actif onClick={() => setServices(services.filter((x) => x !== s))} titre={s} />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  aria-label="Ajouter un service"
                  placeholder="Un autre service…"
                  value={nouveauService}
                  onChange={(e) => setNouveauService(e.target.value)}
                />
                <button
                  onClick={() => {
                    const v = nouveauService.trim();
                    if (v && !services.includes(v)) setServices([...services, v]);
                    setNouveauService('');
                  }}
                  disabled={!nouveauService.trim()}
                  className="px-4 rounded-lg bg-primary text-white dark:text-[#10201a] disabled:opacity-40"
                  aria-label="Ajouter ce service"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          {etape === 3 && (
            <>
              <p className="text-[14px] text-sub">Je prépare ton plan à partir de ce que tu suis. Décoche ce que tu ne fais pas, change le rythme, ajoute tes propres activités.</p>
              {planActuel.choisi && (
                <div className="space-y-2" role="radiogroup" aria-label="Plan actuel">
                  <Choix role="radio" actif={modePlan === 'garder'} onClick={() => setModePlan('garder')} titre="Garder mon plan actuel" desc="Tu as déjà modifié ton plan : rien n’est remplacé." />
                  <Choix role="radio" actif={modePlan === 'generer'} onClick={() => setModePlan('generer')} titre="Refaire mon plan ici" desc="Remplace le plan de cette année." />
                  <Choix role="radio" actif={modePlan === 'vide'} onClick={() => setModePlan('vide')} titre="Partir d’un plan vide" desc="Tu ajoutes seulement tes activités." />
                </div>
              )}
              {!planActuel.choisi && (
                <div className="space-y-2" role="radiogroup" aria-label="Type de plan">
                  <Choix role="radio" actif={modePlan === 'generer'} onClick={() => setModePlan('generer')} titre="Préparer mon plan avec mes réponses" />
                  <Choix role="radio" actif={modePlan === 'vide'} onClick={() => setModePlan('vide')} titre="Partir d’un plan vide" desc="Tu ajoutes seulement tes activités." />
                </div>
              )}

              {modePlan === 'generer' && (
                <div className="space-y-4 pt-1">
                  {listeAxes.map((axe, ai) => {
                    const acts = propose.filter((p) => p.axeIndex === ai);
                    if (!acts.length) return null;
                    return (
                      <section key={axe}>
                        <h3 className="label-caps pb-1.5 border-b border-medium">{axe}</h3>
                        {acts.map(({ a }) => (
                          <div key={a.id} className="py-2.5 border-b border-soft space-y-1.5">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={!!incl[a.id]}
                              onClick={() => setIncl({ ...incl, [a.id]: !incl[a.id] })}
                              className="w-full flex items-start gap-3 text-start"
                            >
                              <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${incl[a.id] ? 'bg-primary border-primary text-white dark:text-[#10201a]' : 'border-medium'}`}>
                                {incl[a.id] && <Check className="w-3.5 h-3.5" strokeWidth={2.6} />}
                              </span>
                              <span className={`text-[14.5px] leading-snug ${incl[a.id] ? 'text-main' : 'text-sub'}`}>{a.titre}</span>
                            </button>
                            {incl[a.id] && (
                              <select
                                aria-label={`Rythme : ${a.titre}`}
                                className="ms-8 h-9 px-2 rounded-md border border-medium bg-card text-main text-[13px]"
                                value={rythme[a.id] || 'type'}
                                onChange={(e) => setRythme({ ...rythme, [a.id]: e.target.value })}
                              >
                                {RYTHMES.map((r) => (
                                  <option key={r.id} value={r.id}>{r.label}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </section>
                    );
                  })}
                </div>
              )}

              {modePlan !== 'garder' && (
                <div className="space-y-3 pt-1">
                  <label className="block">
                    <span className="label-caps block mb-1">Mes autres activités (une par ligne)</span>
                    <textarea
                      rows={3}
                      className={`${inputCls} h-auto py-2`}
                      aria-label="Mes autres activités"
                      placeholder={'ex. Contrôle de l’air du bloc\nVisite des centres de santé'}
                      value={autres}
                      onChange={(e) => setAutres(e.target.value)}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-sub">
                    Suivi à partir de
                    <select value={depuis} onChange={(e) => setDepuis(parseInt(e.target.value, 10))} className="h-9 px-2 rounded-md border border-medium bg-card text-main text-[13px]">
                      {NOMS_MOIS_LONGS.map((nm, i) => (
                        <option key={i} value={i}>{nm}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </>
          )}

          {etape === 4 && (
            <>
              <p className="text-[14px] text-sub">Voici ce que je vais régler :</p>
              <ul className="space-y-2 text-[15px] text-main">
                <li className="row-rule py-2.5"><span className="text-sub text-[13px] block">Lieu</span>{NIVEAUX.find((n) => n.id === niveau)?.label}</li>
                <li className="row-rule py-2.5"><span className="text-sub text-[13px] block">Sujets suivis</span>{SUJETS.filter((s) => sujets.includes(s.id)).map((s) => s.label).join(', ')}</li>
                <li className="row-rule py-2.5"><span className="text-sub text-[13px] block">Services</span>{services.length} service{services.length > 1 ? 's' : ''}</li>
                <li className="row-rule py-2.5">
                  <span className="text-sub text-[13px] block">Plan d’action {annee}</span>
                  {modePlan === 'garder' ? 'Mon plan actuel est conservé' : modePlan === 'vide' ? `Plan vide, ${nbActs - propose.filter(({ a }) => incl[a.id]).length} activité(s) à toi` : `${nbActs} activités`}
                </li>
              </ul>
              <p className="text-[13px] text-sub">L’écran d’accueil, le bouton + et la liste des saisies ne montrent plus que ce que tu suis. Tu peux relancer cet assistant dans Plus.</p>
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-soft" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="max-w-xl mx-auto">
          {etape < TOTAL - 1 ? (
            <button onClick={suivant} disabled={!peutSuivre} className="w-full h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2 disabled:opacity-40">
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={terminer} className="w-full h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2">
              <Check className="w-5 h-5" /> Configurer mon application
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
