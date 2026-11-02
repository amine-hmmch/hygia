import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  BookOpen,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  Table,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Filter,
  Calculator,
  Droplet,
  Layers,
} from 'lucide-react';
import { HygieneMainsIcon } from './AppMaskedIcons';
import {
  FICHES_PRATIQUES,
  FichePratique,
  TABLEAU_PH_DETERGENTS,
  TABLEAU_PERIODICITES,
} from '../data/fichesData';
import { storageService } from '../services/storageService';
import { useToast } from '../context/ToastContext';

interface FichesViewProps {
  initialCategory?: 'all' | 'mains' | 'epi' | 'locaux' | 'favoris' | 'tableaux';
  onStartAuditWithFocus?: (componentId?: string) => void;
}

export const FichesView: React.FC<FichesViewProps> = ({
  initialCategory = 'all',
  onStartAuditWithFocus,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'mains' | 'epi' | 'locaux' | 'favoris' | 'tableaux'
  >(initialCategory);
  const [favorites, setFavorites] = useState<string[]>(() =>
    storageService.getFavoriteFiches()
  );
  const [expandedFicheId, setExpandedFicheId] = useState<string | null>(null);

  // Dilution calculator state
  const [initialBleachPercent, setInitialBleachPercent] = useState<number>(5.0);
  const [targetBleachPercent, setTargetBleachPercent] = useState<number>(0.1);

  // Toggle favorite
  const handleToggleFavorite = (ficheId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.toggleFavoriteFiche(ficheId);
    setFavorites(updated);
    const isNowFav = updated.includes(ficheId);
    showToast(isNowFav ? 'Fiche ajoutée aux favoris' : 'Fiche retirée des favoris', 'info');
  };

  // Filtered fiches
  const filteredFiches = useMemo(() => {
    return FICHES_PRATIQUES.filter((fiche) => {
      // Category filter
      if (activeCategory === 'favoris') {
        if (!favorites.includes(fiche.id)) return false;
      } else if (activeCategory !== 'all' && activeCategory !== 'tableaux') {
        if (fiche.category !== activeCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = fiche.titre.toLowerCase().includes(q);
        const inResume = fiche.resume.toLowerCase().includes(q);
        const inTags = fiche.tags.some((t) => t.toLowerCase().includes(q));
        const inIndications = fiche.indications?.some((ind) => ind.toLowerCase().includes(q));
        const inEtapes = fiche.etapes?.some(
          (et) =>
            et.titre.toLowerCase().includes(q) ||
            (et.description && et.description.toLowerCase().includes(q))
        );

        return inTitle || inResume || inTags || inIndications || inEtapes;
      }

      return true;
    });
  }, [activeCategory, favorites, searchQuery]);

  // Chlorine dilution calculator result
  const calculatedWaterParts = useMemo(() => {
    if (initialBleachPercent <= 0 || targetBleachPercent <= 0) return 0;
    const parts = initialBleachPercent / targetBleachPercent - 1;
    return Math.max(0, Math.round(parts * 10) / 10);
  }, [initialBleachPercent, targetBleachPercent]);

  return (
    <div className="space-y-5 pb-24">
      {/* View Header */}
      <div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-main tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
          <span>Fiches Pratiques & Protocoles</span>
        </h2>
        <p className="text-xs sm:text-sm text-sub mt-0.5">
          Directement extraites du Guide Sécurité Sanitaire des ESSP (Ministère de la Santé 2021)
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher une technique, durée, produit, précaution..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] text-xs sm:text-sm ps-10 pe-10 py-2.5 rounded-xl bg-card border border-soft text-main placeholder-slate-400 focus:outline-none focus:border-[#0F766E] shadow-soft transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute end-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 select-none ${
            activeCategory === 'all'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-card text-sub hover:text-main border border-soft shadow-soft'
          }`}
        >
          Toutes ({FICHES_PRATIQUES.length})
        </button>

        <button
          onClick={() => setActiveCategory('mains')}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-2 select-none ${
            activeCategory === 'mains'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-card text-sub hover:text-main border border-soft shadow-soft'
          }`}
        >
          <HygieneMainsIcon size={14} className="w-3.5 h-3.5" />
          <span>Hygiène des mains (5)</span>
        </button>

        <button
          onClick={() => setActiveCategory('epi')}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-2 select-none ${
            activeCategory === 'epi'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-card text-sub hover:text-main border border-soft shadow-soft'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>EPI (5)</span>
        </button>

        <button
          onClick={() => setActiveCategory('locaux')}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-2 select-none ${
            activeCategory === 'locaux'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-card text-sub hover:text-main border border-soft shadow-soft'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Locaux & Matériel (6)</span>
        </button>

        <button
          onClick={() => setActiveCategory('favoris')}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-2 select-none ${
            activeCategory === 'favoris'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'bg-card text-amber-600 dark:text-amber-400 hover:text-amber-700 border border-soft shadow-soft'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Favoris ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('tableaux')}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-2 select-none ${
            activeCategory === 'tableaux'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-card text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 border border-soft shadow-soft'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Tableaux & Périodicités</span>
        </button>
      </div>

      {/* VIEW: Tableaux Consultables & Calculateur de Dilution */}
      {activeCategory === 'tableaux' ? (
        <div className="space-y-5 animate-fadeIn">
          {/* Quick Chlorine Dilution Calculator */}
          <div className="rounded-2xl p-5 bg-card border border-teal-300 dark:border-teal-900/60 shadow-soft space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
                <h3 className="font-heading font-bold text-base text-main uppercase tracking-wider">
                  Calculateur de Dilution d'Eau de Javel (Chlore)
                </h3>
              </div>
              <span className="text-[11px] text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60 font-semibold">
                Guide ESSP 2021
              </span>
            </div>

            <p className="text-xs text-sub leading-relaxed">
              Formule officielle :{' '}
              <code className="text-[#0F766E] dark:text-teal-300 bg-card-subtle px-2 py-0.5 rounded font-mono text-[11px] border border-soft">
                [% chlore initial / % chlore souhaité] – 1 = parts d'eau pour 1 part de Javel
              </code>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="text-xs font-bold text-main block mb-1">
                  Concentration initiale de la Javel disponible :
                </label>
                <select
                  value={initialBleachPercent}
                  onChange={(e) => setInitialBleachPercent(parseFloat(e.target.value))}
                  className="w-full min-h-[44px] text-xs px-3 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
                >
                  <option value={5.0}>5,0% (Eau de Javel 12° courante du commerce)</option>
                  <option value={2.6}>2,6% (Eau de Javel diluée en berlingot)</option>
                  <option value={9.6}>9,6% (Eau de Javel concentrée 36°)</option>
                  <option value={12.0}>12,0% (Solution hospitalière mère)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-main block mb-1">
                  Usage clinique & Concentration souhaitée :
                </label>
                <select
                  value={targetBleachPercent}
                  onChange={(e) => setTargetBleachPercent(parseFloat(e.target.value))}
                  className="w-full min-h-[44px] text-xs px-3 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
                >
                  <option value={0.1}>0,1% (1000 ppm) — COVID-19 & Bio-nettoyage quotidien</option>
                  <option value={0.05}>0,05% (500 ppm) — Rotavirus & Sols standards</option>
                  <option value={0.5}>0,5% (5000 ppm) — Déversements de sang (&gt; 10 ml) / Haut risque</option>
                </select>
              </div>
            </div>

            {/* Result Box */}
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-[#0F766E] dark:text-teal-300 uppercase font-bold block">
                  Préparation recommandée :
                </span>
                <p className="font-heading text-base sm:text-lg font-bold text-main mt-0.5">
                  1 volume de Javel + <span className="text-emerald-700 dark:text-emerald-400 font-black">{calculatedWaterParts} volumes d'eau</span>
                </p>
                <p className="text-xs text-sub mt-1">
                  Exemple pour 1 Litre : {Math.round(1000 / (1 + calculatedWaterParts))} ml de Javel + {Math.round((1000 * calculatedWaterParts) / (1 + calculatedWaterParts))} ml d'eau.
                </p>
              </div>
              <Droplet className="w-8 h-8 text-[#0F766E] dark:text-teal-400 shrink-0" />
            </div>
          </div>

          {/* Table: Périodicités de Nettoyage (Tableaux 7, 8, 9) */}
          <div className="rounded-2xl p-5 bg-card border border-soft space-y-3.5 shadow-soft">
            <h3 className="font-heading font-bold text-base text-main uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              <span>Tableau Comparatif des Périodicités de Nettoyage (Tableaux 7, 8 & 9)</span>
            </h3>
            <p className="text-xs text-sub">
              Fréquences d'entretien par zone de risque : Zone 1 (Faible), Zone 2 (Moyen), Zone 3 (Sévère).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-soft text-[11px] font-bold text-sub uppercase">
                    <th className="py-2.5 pe-3">Éléments / Surfaces</th>
                    <th className="py-2.5 px-2 text-[#0F766E] dark:text-teal-400">Zone 1 (Faible)</th>
                    <th className="py-2.5 px-2 text-amber-700 dark:text-amber-400">Zone 2 (Moyen)</th>
                    <th className="py-2.5 ps-2 text-rose-700 dark:text-rose-400">Zone 3 (Sévère)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft">
                  {TABLEAU_PERIODICITES.map((row, idx) => (
                    <tr key={idx} className="hover:bg-card-subtle/50 transition">
                      <td className="py-2.5 pe-3 font-semibold text-main">
                        {row.element}
                      </td>
                      <td className="py-2.5 px-2 text-sub">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-300 text-[11px] border border-teal-200 dark:border-teal-800/60">
                          {row.z1}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-sub">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] border border-amber-200 dark:border-amber-800/60">
                          {row.z2}
                        </span>
                      </td>
                      <td className="py-2.5 ps-2 text-sub">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[11px] border border-rose-200 dark:border-rose-800/60 font-bold">
                          {row.z3}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table: Classification des pH et Détergents (Tableau 6) */}
          <div className="rounded-2xl p-5 bg-card border border-soft space-y-3.5 shadow-soft">
            <h3 className="font-heading font-bold text-base text-main uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              <span>Classification des Produits selon le pH (Tableau 6)</span>
            </h3>
            <p className="text-xs text-sub">
              Échelle d'acidité et d'alcalinité des détergents pour l'entretien hospitalier.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-soft text-[11px] font-bold text-sub uppercase">
                    <th className="py-2.5 pe-2">pH</th>
                    <th className="py-2.5 px-2">Classification</th>
                    <th className="py-2.5 px-2">Exemples</th>
                    <th className="py-2.5 ps-2">Indications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft">
                  {TABLEAU_PH_DETERGENTS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-card-subtle/50 transition">
                      <td className="py-2.5 pe-2 font-mono font-bold text-[#0F766E] dark:text-teal-300">
                        {item.ph}
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-main">
                        {item.classification}
                      </td>
                      <td className="py-2.5 px-2 text-sub">{item.exemples}</td>
                      <td className="py-2.5 ps-2 text-sub">{item.indications}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW: Liste des Fiches Pratiques */
        <div className="space-y-3.5">
          {filteredFiches.length === 0 ? (
            <div className="rounded-2xl p-8 bg-card border border-soft text-center space-y-3 shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-card-subtle flex items-center justify-center mx-auto text-sub">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-main text-base">Aucune fiche trouvée</h4>
              <p className="text-xs text-sub max-w-xs mx-auto">
                {searchQuery
                  ? `Aucun résultat pour « ${searchQuery} ». Essayez un autre terme.`
                  : activeCategory === 'favoris'
                  ? 'Vous n’avez pas encore ajouté de fiches en favoris. Touchez l’étoile ★ pour en épingler.'
                  : 'Aucune fiche disponible dans cette catégorie.'}
              </p>
            </div>
          ) : (
            filteredFiches.map((fiche) => {
              const isFav = favorites.includes(fiche.id);
              const isExpanded = expandedFicheId === fiche.id;

              return (
                <div
                  key={fiche.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-soft ${
                    isExpanded
                      ? 'bg-card border-[#0F766E] dark:border-teal-500 shadow-md ring-1 ring-[#0F766E]/20'
                      : 'bg-card border-soft hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Header (clickable to expand) */}
                  <div
                    onClick={() => setExpandedFicheId(isExpanded ? null : fiche.id)}
                    className="p-4 sm:p-5 cursor-pointer select-none space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            fiche.category === 'mains'
                              ? 'bg-teal-50 dark:bg-teal-950/80 text-[#0F766E] dark:text-teal-300 border-teal-200 dark:border-teal-800/60'
                              : fiche.category === 'epi'
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
                              : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          }`}
                        >
                          {fiche.categoryLabel}
                        </span>

                        {fiche.duree && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                            <Clock className="w-3 h-3" />
                            <span>{fiche.duree}</span>
                          </span>
                        )}
                      </div>

                      {/* Favorite button */}
                      <button
                        onClick={(e) => handleToggleFavorite(fiche.id, e)}
                        className={`min-h-[36px] min-w-[36px] p-2 rounded-xl transition active:scale-90 ${
                          isFav
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-card-subtle'
                        }`}
                        title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        aria-label="Favori"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-heading font-bold text-base text-main leading-snug">
                          {fiche.titre}
                        </h3>
                        <p className="text-xs text-[#0F766E] dark:text-teal-400 font-semibold mt-0.5">
                          {fiche.chapitre}
                        </p>
                      </div>

                      <div className="text-sub shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-sub leading-relaxed line-clamp-2">
                      {fiche.resume}
                    </p>
                  </div>

                  {/* Expanded Content Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-soft space-y-4 text-xs sm:text-sm animate-fadeIn">
                      {/* Objectif & Mode d'action */}
                      {fiche.objectif && (
                        <div className="p-3.5 rounded-xl bg-card-subtle border border-soft">
                          <span className="font-bold text-[#0F766E] dark:text-teal-400 uppercase tracking-wider text-[11px] block mb-1">
                            Objectif & Mode d'action
                          </span>
                          <p className="text-main leading-relaxed">{fiche.objectif}</p>
                          {fiche.modeAction && (
                            <p className="text-sub text-xs mt-1.5">
                              <strong className="text-main">Mode d'action :</strong> {fiche.modeAction}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Matériel & Produits */}
                      {fiche.materiel && fiche.materiel.length > 0 && (
                        <div>
                          <span className="font-bold text-main uppercase tracking-wider text-[11px] block mb-2">
                            Matériel & Produits requis
                          </span>
                          <ul className="space-y-1.5 ps-1">
                            {fiche.materiel.map((m, i) => (
                              <li key={i} className="flex items-start gap-2 text-main">
                                <span className="text-[#0F766E] dark:text-teal-400 font-bold shrink-0">•</span>
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Indications */}
                      {fiche.indications && fiche.indications.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40">
                          <span className="font-bold text-[#0F766E] dark:text-teal-300 uppercase tracking-wider text-[11px] block mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
                            <span>Indications du Guide ESSP</span>
                          </span>
                          <ul className="space-y-1.5 ps-1">
                            {fiche.indications.map((ind, i) => (
                              <li key={i} className="flex items-start gap-2 text-main text-xs sm:text-sm">
                                <span className="text-[#0F766E] dark:text-teal-400 font-bold shrink-0">✓</span>
                                <span>{ind}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Contre-indications */}
                      {fiche.contreIndications && fiche.contreIndications.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                          <span className="font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider text-[11px] block mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>Contre-indications</span>
                          </span>
                          <ul className="space-y-1.5 ps-1">
                            {fiche.contreIndications.map((ci, i) => (
                              <li key={i} className="flex items-start gap-2 text-rose-900 dark:text-rose-200 text-xs sm:text-sm">
                                <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0">✕</span>
                                <span>{ci}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Étapes chronologiques numérotées */}
                      {fiche.etapes && fiche.etapes.length > 0 && (
                        <div>
                          <span className="font-bold text-main uppercase tracking-wider text-[11px] block mb-2.5">
                            Étapes de la technique
                          </span>
                          <div className="space-y-2">
                            {fiche.etapes.map((step) => (
                              <div
                                key={step.numero}
                                className="flex items-start gap-3 p-3 rounded-xl bg-card-subtle border border-soft"
                              >
                                <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950/70 text-[#0F766E] dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-teal-200 dark:border-teal-800/60">
                                  {step.numero}
                                </span>
                                <div>
                                  <h4 className="font-bold text-main">{step.titre}</h4>
                                  {step.description && (
                                    <p className="text-xs text-sub mt-0.5 leading-relaxed">
                                      {step.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Précautions d'emploi */}
                      {fiche.precautions && fiche.precautions.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                          <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[11px] block mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Précautions & Recommandations strictes</span>
                          </span>
                          <ul className="space-y-1.5 ps-1">
                            {fiche.precautions.map((p, i) => (
                              <li key={i} className="flex items-start gap-2 text-main text-xs sm:text-sm">
                                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">!</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Link to Audit this area */}
                      {onStartAuditWithFocus && (
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              const compFocus =
                                fiche.category === 'mains'
                                  ? 'hygiene_mains'
                                  : fiche.category === 'epi'
                                  ? 'epi'
                                  : 'env_interne';
                              onStartAuditWithFocus(compFocus);
                            }}
                            className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95"
                          >
                            <span>Évaluer ce critère dans un nouvel audit</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
