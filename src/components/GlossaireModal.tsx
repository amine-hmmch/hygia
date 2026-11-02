import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  X,
  Filter,
  Bookmark,
  Award,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { GLOSSAIRE_CHAPITRE_1 } from '../data/glossaireData';
import { GlossaireItem } from '../types';

interface GlossaireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaireModal: React.FC<GlossaireModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GlossaireItem | null>(null);

  const categories = [
    { id: 'all', label: 'Toutes les définitions' },
    { id: 'asepsie_sterilisation', label: 'Asepsie & Stérilisation' },
    { id: 'hygiene_locaux', label: 'Bio-nettoyage & Locaux' },
    { id: 'produits', label: 'Produits & Détergence' },
    { id: 'microbiologie', label: 'Microbiologie & Flores' },
    { id: 'securite', label: 'Sécurité & Normes' },
  ];

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return GLOSSAIRE_CHAPITRE_1.filter((item) => {
      const matchSearch =
        !q ||
        item.terme.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        (item.normeOuRef && item.normeOuRef.toLowerCase().includes(q)) ||
        (item.pointsCles && item.pointsCles.some((p) => p.toLowerCase().includes(q)));

      const matchCat = selectedCategory === 'all' || item.categorie === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-card border border-soft rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-floating text-main overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] px-5 py-4 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-base sm:text-lg font-bold tracking-tight leading-tight">
                Glossaire Médical & Technique
              </h2>
              <p className="text-xs text-teal-100 font-medium">
                Guide ESSP 2021 • Chapitre I (Concepts & Définitions)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 border-b border-soft space-y-3 bg-card shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un terme (ex: bio-nettoyage, détergence, stérile, flore...)"
              className="w-full min-h-[44px] ps-10 pe-10 py-2.5 rounded-xl bg-card-subtle border border-soft text-xs sm:text-sm text-main placeholder-slate-400 focus:outline-none focus:border-[#0F766E]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-main p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl font-semibold transition shrink-0 select-none ${
                  selectedCategory === cat.id
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-card-subtle text-sub hover:text-main border border-soft'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Definitions List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sub space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="font-semibold text-main">Aucune définition trouvée pour « {search} »</p>
              <p className="text-xs">Essayez un autre terme ou réinitialisez les filtres.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-card border border-soft hover:border-slate-300 dark:hover:border-slate-700 transition shadow-soft space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold text-base text-main">
                    {item.terme}
                  </h3>
                  {item.normeOuRef && (
                    <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60 shrink-0">
                      {item.normeOuRef}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-sub leading-relaxed">
                  {item.definition}
                </p>

                {item.pointsCles && item.pointsCles.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {item.pointsCles.map((pt, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-card-subtle text-sub font-medium border border-soft"
                      >
                        ✓ {pt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-card-subtle border-t border-soft flex items-center justify-between text-xs text-sub shrink-0">
          <span>{filteredItems.length} définitions disponibles</span>
          <button
            onClick={onClose}
            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-card border border-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-main font-bold transition text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
