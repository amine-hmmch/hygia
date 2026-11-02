import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, Droplets, FlaskConical, NotebookPen, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { thmService } from '../services/thmService';
import { storageService } from '../services/storageService';
import { CorrectiveAction } from '../types';
import { NOMS_MOIS_LONGS, RegistreId } from '../data/thmData';

interface Props {
  actions: CorrectiveAction[];
  onOpenJournal: () => void;
  onOpenPlan: () => void;
  onOpenRegistre: (id: RegistreId) => void;
  onNewAudit: () => void;
  onOpenActions: () => void;
}

const REPERES = [
  { titre: 'Chlore résiduel libre : au moins 0,2 mg/L', texte: 'Un test par semaine et par point d’eau. En dessous, signaler et contrôler la chloration.' },
  { titre: 'Eau de Javel : 0,5 % pour le sang', texte: 'Pour un déversement de sang, utiliser une solution à 0,5 % (5 000 ppm). Préparer chaque jour, ne pas mélanger avec un autre produit.' },
  { titre: 'Du plus propre vers le plus sale', texte: 'Le bionettoyage va du haut vers le bas et du plus propre vers le plus sale, avec le matériel du secteur.' },
  { titre: 'Froid à 4 °C ou moins, chaud à 63 °C ou plus', texte: 'Zone de danger entre 10 et 63 °C : y passer le moins de temps possible.' },
  { titre: 'Collecteurs d’objets piquants : aux deux tiers', texte: 'Les remplacer quand ils sont aux deux tiers pleins et ne jamais recapuchonner une aiguille.' },
  { titre: 'Friction hydro-alcoolique : 20 à 30 secondes', texte: 'Jusqu’au séchage complet. Si les mains sont souillées : eau et savon pendant 40 à 60 secondes.' },
  { titre: 'Plats témoins : 5 jours à 0-3 °C', texte: 'Environ 100 g de chaque plat servi, étiquetés, pour enquêter en cas de toxi-infection.' },
];

const heureMaintenant = () => new Date().toTimeString().slice(0, 5);
const isoLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

export const TodayScreen: React.FC<Props> = ({ actions, onOpenJournal, onOpenPlan, onOpenRegistre, onNewAudit, onOpenActions }) => {
  const [tick, setTick] = useState(0);
  const settings = storageService.getSettings();
  const userName = settings.userName?.trim();
  const etab = settings.etablissement?.trim();
  const now = new Date();
  const date = isoLocal(now);
  const h = now.getHours();
  const hello = h < 5 || h >= 18 ? 'Bonsoir' : h < 12 ? 'Bonjour' : 'Bon après-midi';
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const dateLongue = `${jours[now.getDay()]} ${now.getDate()} ${NOMS_MOIS_LONGS[now.getMonth()]} ${now.getFullYear()}`;

  const taches = useMemo(() => thmService.tachesDuJour(date), [date, tick]);
  const faites = taches.filter((t) => t.fait).length;
  const plan = useMemo(() => thmService.aFaireCeMois(now), [tick]);
  const prelevAttente = useMemo(
    () => thmService.getRegistre('prelevements').filter((e) => e.resultat === 'En attente'),
    [tick]
  );
  const retard = actions.filter(
    (a) => (a.statut === 'a_faire' || a.statut === 'en_cours') && a.echeance < date
  );
  const repere = REPERES[Math.floor(Date.now() / 86400000) % REPERES.length];

  const alertes: { texte: string; onClick: () => void }[] = [];
  if (retard.length)
    alertes.push({ texte: `${retard.length} action${retard.length > 1 ? 's' : ''} corrective${retard.length > 1 ? 's' : ''} en retard`, onClick: onOpenActions });
  if (prelevAttente.length)
    alertes.push({ texte: `${prelevAttente.length} prélèvement${prelevAttente.length > 1 ? 's' : ''} en attente de résultat`, onClick: () => onOpenRegistre('prelevements') });

  const rapide: { label: string; icon: React.ElementType; onClick: () => void }[] = [
    { label: 'Eau', icon: Droplets, onClick: () => onOpenRegistre('eau') },
    { label: 'Prélèvement', icon: FlaskConical, onClick: () => onOpenRegistre('prelevements') },
    { label: 'Note', icon: NotebookPen, onClick: onOpenJournal },
    { label: 'Audit', icon: ClipboardCheck, onClick: onNewAudit },
  ];

  return (
    <div className="space-y-7 pb-6">
      <section className="rise">
        <p className="label-caps">
          {dateLongue}
          {etab ? ` · ${etab}` : ''}
        </p>
        <h2 className="font-serif-display text-[32px] leading-tight text-main mt-1.5">
          {userName ? `${hello}, ${userName}` : hello}
        </h2>
      </section>

      {/* Accès rapide */}
      <section className="rise grid grid-cols-4 gap-2" style={{ animationDelay: '60ms' }}>
        {rapide.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="h-[74px] rounded-lg border border-soft flex flex-col items-center justify-center gap-1.5 text-main active:bg-card-subtle"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-[12px] font-medium">{label}</span>
          </button>
        ))}
      </section>

      {alertes.length > 0 && (
        <section className="rise space-y-2" style={{ animationDelay: '100ms' }}>
          {alertes.map((a) => (
            <button
              key={a.texte}
              onClick={a.onClick}
              className="w-full min-h-[48px] rounded-lg border border-danger-soft bg-danger-tint text-danger px-3.5 py-2.5 flex items-center gap-3 text-start"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-[14px] font-medium leading-snug">{a.texte}</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          ))}
        </section>
      )}

      {/* Tâches du jour */}
      <section className="rise" style={{ animationDelay: '140ms' }}>
        <div className="flex items-baseline justify-between pb-2 border-b border-medium">
          <h3 className="label-caps">Aujourd’hui</h3>
          <span className="font-mono text-xs text-sub">{faites}/{taches.length}</span>
        </div>
        {taches.length === 0 ? (
          <p className="py-4 text-sm text-sub">Aucune tâche pour aujourd’hui.</p>
        ) : (
          taches.slice(0, 6).map(({ tache, fait }) => (
            <button
              key={tache.id}
              onClick={() => { thmService.basculerTache(date, tache.id, heureMaintenant()); setTick((t) => t + 1); }}
              aria-pressed={fait}
              className="row-rule w-full py-3 flex items-center gap-3.5 text-start"
            >
              <span className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${fait ? 'bg-primary border-primary text-white dark:text-[#10201a]' : 'border-medium'}`}>
                {fait && <Check className="w-4 h-4" strokeWidth={2.6} />}
              </span>
              <span className={`flex-1 text-[15px] leading-snug ${fait ? 'text-sub line-through' : 'text-main'}`}>{tache.titre}</span>
            </button>
          ))
        )}
        <button onClick={onOpenJournal} className="pt-3 text-[13px] text-primary font-medium flex items-center gap-1">
          {taches.length > 6 ? `Voir les ${taches.length} tâches et le carnet` : 'Ouvrir le carnet de bord'} <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* Plan du mois */}
      <section className="rise" style={{ animationDelay: '180ms' }}>
        <div className="flex items-baseline justify-between pb-2 border-b border-medium">
          <h3 className="label-caps">À faire en {NOMS_MOIS_LONGS[now.getMonth()]}</h3>
          <button onClick={onOpenPlan} className="text-xs text-primary font-medium">Plan annuel</button>
        </div>
        {plan.length === 0 ? (
          <p className="py-4 text-sm text-sub">Le plan du mois est à jour.</p>
        ) : (
          <>
            {plan.slice(0, 4).map(({ activite, prevu, fait }) => (
              <button key={activite.id} onClick={onOpenPlan} className="row-rule w-full py-3 flex items-center gap-3 text-start">
                <span className="flex-1 text-[15px] text-main leading-snug">{activite.titre}</span>
                <span className="font-mono text-sm text-sub shrink-0">{fait}/{prevu}</span>
              </button>
            ))}
            {plan.length > 4 && (
              <button onClick={onOpenPlan} className="pt-2 text-[13px] text-primary font-medium">
                + {plan.length - 4} autre{plan.length - 4 > 1 ? 's' : ''} activité{plan.length - 4 > 1 ? 's' : ''}
              </button>
            )}
          </>
        )}
      </section>

      {/* Repère */}
      <section className="rise border-s-2 border-primary ps-4 py-0.5" style={{ animationDelay: '220ms' }}>
        <p className="label-caps">Repère du jour</p>
        <p className="font-serif-display text-[18px] leading-snug text-main mt-1.5" style={{ fontWeight: 500 }}>{repere.titre}</p>
        <p className="text-[13px] text-sub leading-snug mt-1">{repere.texte}</p>
      </section>
    </div>
  );
};
