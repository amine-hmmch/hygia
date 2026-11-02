import React, { useState } from 'react';
import {
  ClipboardCheck,
  BookOpen,
  Stethoscope,
  ChefHat,
  WifiOff,
  X,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: ClipboardCheck,
    title: 'Aujourd’hui et carnet de bord',
    text: 'L’accueil liste les tâches du jour, ce qu’il faut faire ce mois-ci et les alertes. Coche les tâches dans le Carnet de bord et ajoute des notes par zone : tout est daté et imprimable.',
  },
  {
    icon: BookOpen,
    title: 'Registres et plan annuel',
    text: 'Onglet Registres : eau, vecteurs, prélèvements, sensibilisation, stérilisation, déchets. Onglet Suivi : plan d’action annuel (réalisé calculé depuis tes registres), actions correctives et rapport mensuel ou trimestriel.',
  },
  {
    icon: Stethoscope,
    title: 'Terrain : audits',
    text: 'Onglet Terrain : audit rapide ou complet, audit cuisine. Réponds Oui, Non ou N/A ; chaque « Non » devient une action corrective avec mesure, source et échéance modifiables. Fiches, glossaire et urgence AES sont dans Plus.',
  },
  {
    icon: ChefHat,
    title: 'Cuisine et restauration',
    text: 'Dans « Cuisine et restauration », note les températures (frigo, réception, cuisson, maintien), fais l’audit HACCP et consulte les fiches. Un relevé hors limite est signalé tout de suite.',
  },
  {
    icon: WifiOff,
    title: 'Hors-ligne et sauvegarde',
    text: 'Tout fonctionne sans internet. Les données restent sur ce téléphone : pense à exporter une sauvegarde depuis Réglages avant de changer d’appareil ou d’effacer les données du navigateur.',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [i, setI] = useState(0);
  if (!isOpen) return null;
  const step = STEPS[i];
  const Icon = step.icon;
  const last = i === STEPS.length - 1;

  const close = () => {
    setI(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tutoriel"
        className="bg-surface border border-medium rounded-t-2xl sm:rounded-xl w-full max-w-md p-6 pb-8"
      >
        <div className="flex items-center justify-between mb-5">
          <span className="label-caps">
            Tutoriel · {i + 1}/{STEPS.length}
          </span>
          <button onClick={close} aria-label="Fermer" className="w-9 h-9 -me-2 flex items-center justify-center text-sub">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Icon className="w-9 h-9 text-primary mb-4" strokeWidth={1.5} />
        <h2 className="text-xl font-semibold text-main mb-2">{step.title}</h2>
        <p className="text-[15px] text-main leading-relaxed min-h-[132px]">{step.text}</p>

        <div className="flex gap-1.5 my-5">
          {STEPS.map((_, k) => (
            <span key={k} className={`h-1 flex-1 rounded ${k <= i ? 'bg-primary' : 'bg-card-subtle'}`} />
          ))}
        </div>

        <div className="flex gap-2">
          {i > 0 ? (
            <button
              onClick={() => setI(i - 1)}
              className="h-12 px-4 rounded-lg border border-medium text-main flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
          ) : (
            <button onClick={close} className="h-12 px-4 rounded-lg text-sub">
              Passer
            </button>
          )}
          <button
            onClick={() => (last ? close() : setI(i + 1))}
            className="flex-1 h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-1.5"
          >
            {last ? 'Terminer' : 'Suivant'}
            {!last && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
