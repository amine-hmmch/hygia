import React, { useEffect } from 'react';
import {
  Droplets, FlaskConical, Bug, Presentation, Thermometer, Trash2, NotebookPen, ClipboardCheck, X,
} from 'lucide-react';
import { SterilisationIcon } from './AppMaskedIcons';
import { storageService } from '../services/storageService';
import { sujetActif, SujetId } from '../data/configData';

export type AjoutRapide =
  | 'eau' | 'prelevements' | 'vecteurs' | 'sensibilisation'
  | 'sterilisation' | 'dechets' | 'cuisine' | 'note' | 'audit';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPick: (k: AjoutRapide) => void;
}

const ITEMS: { k: AjoutRapide; label: string; icon: React.ReactNode; tone: string }[] = [
  { k: 'eau', label: 'Eau (chlore, pH)', icon: <Droplets className="w-5 h-5" />, tone: 'sea' },
  { k: 'prelevements', label: 'Prélèvement', icon: <FlaskConical className="w-5 h-5" />, tone: 'plum' },
  { k: 'vecteurs', label: 'Lutte antivectorielle', icon: <Bug className="w-5 h-5" />, tone: 'clay' },
  { k: 'cuisine', label: 'Température cuisine', icon: <Thermometer className="w-5 h-5" />, tone: 'ochre' },
  { k: 'sterilisation', label: 'Cycle de stérilisation', icon: <SterilisationIcon size={20} />, tone: 'ochre' },
  { k: 'dechets', label: 'Pesée de déchets', icon: <Trash2 className="w-5 h-5" />, tone: 'clay' },
  { k: 'sensibilisation', label: 'Sensibilisation', icon: <Presentation className="w-5 h-5" />, tone: 'plum' },
  { k: 'note', label: 'Note du carnet', icon: <NotebookPen className="w-5 h-5" />, tone: 'pine' },
  { k: 'audit', label: 'Audit', icon: <ClipboardCheck className="w-5 h-5" />, tone: 'pine' },
];

export const QuickAddSheet: React.FC<Props> = ({ isOpen, onClose, onPick }) => {
  const sujets = storageService.getSettings().sujets;
  const items = ITEMS.filter((it) => it.k === 'note' || it.k === 'audit' || sujetActif(sujets, it.k as SujetId));
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 no-print" role="dialog" aria-modal="true" aria-label="Que veux-tu noter ?">
      <button className="absolute inset-0 bg-black/45" onClick={onClose} aria-label="Fermer" />
      <div
        className="absolute inset-x-0 bottom-0 bg-surface border-t border-medium rounded-t-2xl max-w-4xl mx-auto px-4 pt-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif-display text-[22px] text-main">Que veux-tu noter ?</h2>
          <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 -me-2 flex items-center justify-center text-sub">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.map((it) => (
            <button
              key={it.k}
              onClick={() => onPick(it.k)}
              className="min-h-[92px] rounded-xl border border-soft bg-card px-1.5 py-3 flex flex-col items-center justify-center gap-2 active:bg-card-subtle"
            >
              <span className={`tile tile-${it.tone}`}>{it.icon}</span>
              <span className="text-[12.5px] leading-tight text-main text-center">{it.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
