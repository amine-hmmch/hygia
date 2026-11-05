import React from 'react';
import {
  ChevronRight,
  ClipboardCheck,
  Layers,
  ChefHat,
  Stethoscope,
  Trash2,
  Droplets,
  Bug,
  FlaskConical,
  Presentation,
  CalendarCheck,
  ListChecks,
  FileText,
  BarChart3,
  BookOpen,
  Library,
  AlertOctagon,
  Settings,
  GraduationCap,
  Info,
  NotebookPen,
  Thermometer,
  SlidersHorizontal,
} from 'lucide-react';
import { SterilisationIcon } from './AppMaskedIcons';
import { RegistreId } from '../data/thmData';
import { thmService } from '../services/thmService';
import { storageService } from '../services/storageService';
import { sujetActif } from '../data/configData';

type Tone = 'pine' | 'ochre' | 'clay' | 'plum' | 'sea';

export const HubRow: React.FC<{
  icon: React.ReactNode;
  tone?: Tone;
  title: string;
  desc: string;
  meta?: string;
  onClick: () => void;
}> = ({ icon, tone = 'pine', title, desc, meta, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="row-rule w-full min-h-[68px] py-3 flex items-center gap-3.5 text-start active:bg-card-subtle"
  >
    <span className={`tile tile-${tone}`}>{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-[15px] font-medium leading-snug text-main">{title}</span>
      <span className="block text-[13px] text-sub leading-snug truncate">{desc}</span>
    </span>
    {meta && <span className="font-mono text-xs text-sub shrink-0">{meta}</span>}
    <ChevronRight className="w-4 h-4 text-muted-custom shrink-0" />
  </button>
);

export const HubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="pb-2 border-b border-medium">
    <h3 className="label-caps">{children}</h3>
  </div>
);

export const HubHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <header>
    <h2 className="font-serif-display text-[28px] leading-tight text-main">{title}</h2>
    <p className="text-[13px] text-sub mt-1">{subtitle}</p>
  </header>
);

const ic = 'w-5 h-5';

/* ------------------------------- Saisies ------------------------------- */

export const SaisirHub: React.FC<{
  onJournal: () => void;
  onRegistre: (id: RegistreId) => void;
  onSterilisation: () => void;
  onDechets: () => void;
  onCuisineReleves: () => void;
  onCuisineAudit: () => void;
  onAuditRapide: () => void;
  onAuditComplet: () => void;
  onHistorique: () => void;
  nbAudits: number;
}> = ({ onJournal, onRegistre, onSterilisation, onDechets, onCuisineReleves, onCuisineAudit, onAuditRapide, onAuditComplet, onHistorique, nbAudits }) => {
  const n = (id: RegistreId) => String(thmService.getRegistre(id).length);
  const su = storageService.getSettings().sujets;
  const on = (id: Parameters<typeof sujetActif>[1]) => sujetActif(su, id);
  return (
    <div className="space-y-6 pb-6">
      <HubHeader title="Saisies" subtitle="Tes registres et tes audits. Pour noter vite, utilise le bouton +" />
      <section>
        <HubTitle>Au quotidien</HubTitle>
        <HubRow tone="pine" icon={<NotebookPen className={ic} />} title="Carnet de bord" desc="Tâches du jour, notes, calendrier" onClick={onJournal} />
      </section>
      <section>
        <HubTitle>Eau et environnement</HubTitle>
        {on('eau') && <HubRow tone="sea" icon={<Droplets className={ic} />} title="Eau de boisson" desc="Chlore résiduel libre et pH" meta={n('eau')} onClick={() => onRegistre('eau')} />}
        {on('vecteurs') && <HubRow tone="clay" icon={<Bug className={ic} />} title="Lutte antivectorielle" desc="Dératisation, désinsectisation, capture" meta={n('vecteurs')} onClick={() => onRegistre('vecteurs')} />}
        {on('prelevements') && <HubRow tone="plum" icon={<FlaskConical className={ic} />} title="Prélèvements" desc="Eau, aliments, surfaces, air" meta={n('prelevements')} onClick={() => onRegistre('prelevements')} />}
      </section>
      <section>
        <HubTitle>Soins et déchets</HubTitle>
        {on('sterilisation') && <HubRow tone="ochre" icon={<SterilisationIcon size={20} />} title="Stérilisation" desc="Cycles d’autoclave, contrôles, traçabilité" onClick={onSterilisation} />}
        {on('dechets') && <HubRow tone="clay" icon={<Trash2 className={ic} />} title="Déchets de soins" desc="Pesées, tri, évolution mensuelle" onClick={onDechets} />}
      </section>
      <section>
        <HubTitle>Cuisine et formation</HubTitle>
        {on('cuisine') && <HubRow tone="ochre" icon={<Thermometer className={ic} />} title="Relevés de température" desc="Frigos, réception, cuisson, maintien" onClick={onCuisineReleves} />}
        {on('sensibilisation') && <HubRow tone="plum" icon={<Presentation className={ic} />} title="Sensibilisation et formation" desc="Séances, thèmes, participants" meta={n('sensibilisation')} onClick={() => onRegistre('sensibilisation')} />}
      </section>
      <section>
        <HubTitle>Audits</HubTitle>
        <HubRow tone="pine" icon={<ClipboardCheck className={ic} />} title="Audit rapide" desc="5 composantes, tableau 20 du guide" onClick={onAuditRapide} />
        <HubRow tone="sea" icon={<Layers className={ic} />} title="Audit complet" desc="Version détaillée, tableau 21 du guide" onClick={onAuditComplet} />
        {on('cuisine') && <HubRow tone="ochre" icon={<ChefHat className={ic} />} title="Audit cuisine (HACCP)" desc="Supervision de la restauration" onClick={onCuisineAudit} />}
        <HubRow tone="plum" icon={<ListChecks className={ic} />} title="Historique des audits" desc="Rapports, modification, suppression" meta={String(nbAudits)} onClick={onHistorique} />
      </section>
    </div>
  );
};

/* -------------------------------- Suivi -------------------------------- */

export const SuiviHub: React.FC<{
  onPlan: () => void;
  onActions: () => void;
  onRapport: () => void;
  onTableauBord: () => void;
  nbActions: number;
}> = ({ onPlan, onActions, onRapport, onTableauBord, nbActions }) => (
  <div className="space-y-6 pb-6">
    <HubHeader title="Suivi" subtitle="Ce qui est prévu, ce qui est fait, ce qui reste" />
    <section>
      <HubTitle>Planification</HubTitle>
      <HubRow tone="pine" icon={<CalendarCheck className={ic} />} title="Plan d’action annuel" desc="Activités mois par mois, réalisé automatique" onClick={onPlan} />
      <HubRow tone="clay" icon={<AlertOctagon className={ic} />} title="Actions correctives" desc="Issues des audits, échéances et statuts" meta={nbActions ? String(nbActions) : undefined} onClick={onActions} />
    </section>
    <section>
      <HubTitle>Bilans</HubTitle>
      <HubRow tone="sea" icon={<FileText className={ic} />} title="Rapport mensuel ou trimestriel" desc="À imprimer ou enregistrer en PDF" onClick={onRapport} />
      <HubRow tone="plum" icon={<BarChart3 className={ic} />} title="Tableau de bord" desc="Scores par service et par composante" onClick={onTableauBord} />
    </section>
  </div>
);

/* --------------------------------- Plus --------------------------------- */

export const PlusHub: React.FC<{
  nom: string;
  initiales: string;
  sousTitre: string;
  onProfil: () => void;
  onConfigurer: () => void;
  onFiches: () => void;
  onGlossaire: () => void;
  onAes: () => void;
  onReglages: () => void;
  onTutoriel: () => void;
  onAPropos: () => void;
}> = ({ nom, initiales, sousTitre, onProfil, onConfigurer, onFiches, onGlossaire, onAes, onReglages, onTutoriel, onAPropos }) => (
  <div className="space-y-6 pb-6">
    <HubHeader title="Plus" subtitle="Profil, références, réglages et aide" />
    <button
      type="button"
      onClick={onProfil}
      className="w-full flex items-center gap-4 rounded-xl border border-soft bg-card px-4 py-3.5 text-start active:bg-card-subtle"
    >
      <span className="w-12 h-12 rounded-full bg-primary text-white dark:text-[#10201a] flex items-center justify-center font-serif-display text-[20px] shrink-0">{initiales}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-medium text-main leading-snug truncate">{nom}</span>
        <span className="block text-[13px] text-sub leading-snug truncate">{sousTitre}</span>
      </span>
      <ChevronRight className="w-4 h-4 text-muted-custom shrink-0" />
    </button>
    <section>
      <HubTitle>Mon travail</HubTitle>
      <HubRow tone="pine" icon={<SlidersHorizontal className={ic} />} title="Configurer mon application" desc="Ce que je suis, mes services, mon plan d’action" onClick={onConfigurer} />
    </section>
    <section>
      <HubTitle>Références</HubTitle>
      <HubRow tone="pine" icon={<BookOpen className={ic} />} title="Fiches pratiques" desc="Mains, EPI, bionettoyage, dilutions" onClick={onFiches} />
      <HubRow tone="sea" icon={<Library className={ic} />} title="Glossaire" desc="Définitions des termes d’hygiène" onClick={onGlossaire} />
      <HubRow tone="clay" icon={<Stethoscope className={ic} />} title="Accident d’exposition au sang" desc="Conduite à tenir immédiate" onClick={onAes} />
    </section>
    <section>
      <HubTitle>Application</HubTitle>
      <HubRow tone="ochre" icon={<Settings className={ic} />} title="Réglages et sauvegarde" desc="Établissement, services, export des données" onClick={onReglages} />
      <HubRow tone="plum" icon={<GraduationCap className={ic} />} title="Tutoriel" desc="Revoir la présentation de l’application" onClick={onTutoriel} />
      <HubRow tone="sea" icon={<Info className={ic} />} title="À propos" desc="Version, sources, mentions" onClick={onAPropos} />
    </section>
  </div>
);
