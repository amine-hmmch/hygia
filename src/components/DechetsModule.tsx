import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Scale,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Printer,
  BarChart2,
  ShieldAlert,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Info,
  ChevronDown,
  X,
  Droplet,
  Check,
  User,
} from 'lucide-react';
import { DechetCategorie, DechetPesee } from '../types';
import { storageService } from '../services/storageService';
import {
  DECHETS_TRI_LIST,
  ETAPES_FILIERE_DECHETS,
  RISQUES_SANTE_ENVIRONNEMENT,
  DechetTriItem,
} from '../data/dechetsData';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';

interface DechetsModuleProps {
  onBackToHome: () => void;
}

type TabType = 'tri' | 'pesee' | 'graphique' | 'fiches';

const COULEUR_BG_MAP: Record<string, { bg: string; text: string; border: string; ring: string; badge: string }> = {
  rouge: {
    bg: 'bg-rose-500/10 dark:bg-rose-950/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-800',
    ring: 'ring-rose-500',
    badge: 'bg-rose-600 text-white',
  },
  jaune: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    ring: 'ring-amber-500',
    badge: 'bg-amber-500 text-slate-950 font-bold',
  },
  marron: {
    bg: 'bg-amber-900/10 dark:bg-amber-950/40',
    text: 'text-amber-900 dark:text-amber-400',
    border: 'border-amber-700 dark:border-amber-900',
    ring: 'ring-amber-700',
    badge: 'bg-amber-800 text-white',
  },
  blanc: {
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    text: 'text-slate-700 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-600',
    ring: 'ring-slate-400',
    badge: 'bg-slate-200 text-slate-800 dark:bg-slate-100 dark:text-slate-900 font-semibold border border-slate-300',
  },
  noir: {
    bg: 'bg-slate-900/5 dark:bg-slate-800/40',
    text: 'text-slate-800 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    ring: 'ring-slate-800',
    badge: 'bg-slate-900 text-white dark:bg-black',
  },
  special: {
    bg: 'bg-purple-500/10 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-800',
    ring: 'ring-purple-500',
    badge: 'bg-purple-600 text-white',
  },
};

const CATEGORIES_OPTIONS: Array<{
  code: DechetCategorie;
  label: string;
  couleur: 'rouge' | 'jaune' | 'marron' | 'blanc' | 'noir' | 'special';
  contenantCourt: string;
}> = [
  {
    code: 'cat1_infectieux',
    label: 'Cat. 1 - Déchets infectieux & DASRI',
    couleur: 'rouge',
    contenantCourt: 'Sacs plastiques ROUGES étanches',
  },
  {
    code: 'cat1_tranchant',
    label: 'Cat. 1 - Matériel piquant & tranchant',
    couleur: 'jaune',
    contenantCourt: 'Boîte polyéthylène rigide JAUNE (≤ 3/4)',
  },
  {
    code: 'cat2_chimique_pharma',
    label: 'Cat. 2 - Produits chimiques & pharmaceutiques',
    couleur: 'marron',
    contenantCourt: 'Conteneurs MARRON étiquetés',
  },
  {
    code: 'cat3_anatomique',
    label: 'Cat. 3 - Déchets anatomiques (fœtus, organes, placentas)',
    couleur: 'blanc',
    contenantCourt: 'Double sac étanche BLANC (au froid / < 24h)',
  },
  {
    code: 'cat4_menager',
    label: 'Cat. 4 - Déchets ménagers et assimilés',
    couleur: 'noir',
    contenantCourt: 'Sacs plastiques étanches NOIRS',
  },
  {
    code: 'speciaux_mercure',
    label: 'Spéciaux - Mercure (thermomètres) & flacons gaz',
    couleur: 'special',
    contenantCourt: 'Flacon hermétique sous eau / Filière spécialisée',
  },
];

export const DechetsModule: React.FC<DechetsModuleProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<TabType>('tri');

  // Tri interactif state
  const [searchTri, setSearchTri] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all');
  const [selectedTriItem, setSelectedTriItem] = useState<DechetTriItem | null>(null);

  // Pesées state
  const [pesees, setPesees] = useState<DechetPesee[]>(() => storageService.getDechetsPesees());
  const [showAddPeseeModal, setShowAddPeseeModal] = useState(false);
  const [services] = useState<string[]>(() => storageService.getServices());
  const [peseeSearch, setPeseeSearch] = useState('');
  const [peseeServiceFilter, setPeseeServiceFilter] = useState<string>('all');
  const [peseeToPrint, setPeseeToPrint] = useState<DechetPesee | null>(null);

  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5);
  const settings = storageService.getSettings();
  const defaultAuditeur = settings.userName || settings.auditeurDefaut || 'Technicien d’hygiène';

  const [formDate, setFormDate] = useState(todayStr);
  const [formHeure, setFormHeure] = useState(nowTimeStr);
  const [formService, setFormService] = useState(services[0] || 'Salle de Soins');
  const [formCategorie, setFormCategorie] = useState<DechetCategorie>('cat1_infectieux');
  const [formPoids, setFormPoids] = useState<string>('');
  const [formBordereau, setFormBordereau] = useState('');
  const [formOperateur, setFormOperateur] = useState<string>(defaultAuditeur);
  const [formSociete, setFormSociete] = useState('Prestataire agréé DMP');
  const [formObservations, setFormObservations] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Monthly Chart state
  const currentMonthValue = todayStr.substring(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthValue);

  // Refresh pesées list
  const refreshPesees = () => {
    setPesees(storageService.getDechetsPesees());
  };

  // Filtered tri items
  const filteredTriItems = useMemo(() => {
    const q = searchTri.toLowerCase().trim();
    return DECHETS_TRI_LIST.filter((item) => {
      const matchSearch =
        !q ||
        item.nom.toLowerCase().includes(q) ||
        item.contenant.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        (item.synonymes && item.synonymes.some((s) => s.toLowerCase().includes(q))) ||
        item.consignes.some((c) => c.toLowerCase().includes(q));

      const matchColor =
        selectedColorFilter === 'all' || item.couleurContenant === selectedColorFilter;

      return matchSearch && matchColor;
    });
  }, [searchTri, selectedColorFilter]);

  const { showToast } = useToast();
  const [peseeToDelete, setPeseeToDelete] = useState<DechetPesee | null>(null);

  // Handle Save Pesee
  const handleSavePesee = (e: React.FormEvent) => {
    e.preventDefault();
    const poidsNum = parseFloat(formPoids.replace(',', '.'));
    if (isNaN(poidsNum) || poidsNum <= 0) {
      showToast('Veuillez saisir un poids valide en kilogrammes (ex: 4.5)', 'warning');
      return;
    }

    const catObj = CATEGORIES_OPTIONS.find((c) => c.code === formCategorie);

    storageService.saveDechetPesee({
      date: formDate,
      heure: formHeure,
      service: formService,
      categorie: formCategorie,
      categorieLabel: catObj ? catObj.label : formCategorie,
      contenantCouleur: catObj ? catObj.couleur : 'rouge',
      poidsKg: Number(poidsNum.toFixed(2)),
      numeroBordereau: formBordereau.trim() || undefined,
      operateur: formOperateur.trim() || 'Technicien d’hygiène',
      societeCollecte: formSociete.trim() || undefined,
      observations: formObservations.trim() || undefined,
    });

    refreshPesees();
    showToast('Pesée enregistrée avec succès dans le registre !', 'success');
    setShowAddPeseeModal(false);
    // Reset poids & obs
    setFormPoids('');
    setFormObservations('');
    setFormBordereau('');
  };

  const handleConfirmDeletePesee = () => {
    if (peseeToDelete) {
      storageService.deleteDechetPesee(peseeToDelete.id);
      refreshPesees();
      showToast('Pesée supprimée du registre', 'info');
      setPeseeToDelete(null);
    }
  };

  // Filtered Pesées list
  const filteredPesees = useMemo(() => {
    const q = peseeSearch.toLowerCase().trim();
    return pesees.filter((p) => {
      const matchSearch =
        !q ||
        p.service.toLowerCase().includes(q) ||
        p.categorieLabel.toLowerCase().includes(q) ||
        (p.numeroBordereau && p.numeroBordereau.toLowerCase().includes(q)) ||
        (p.operateur && p.operateur.toLowerCase().includes(q)) ||
        p.date.includes(q);

      const matchService = peseeServiceFilter === 'all' || p.service === peseeServiceFilter;
      return matchSearch && matchService;
    });
  }, [pesees, peseeSearch, peseeServiceFilter]);

  // Monthly stats calculation
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    pesees.forEach((p) => {
      if (p.date && p.date.length >= 7) {
        monthsSet.add(p.date.substring(0, 7));
      }
    });
    monthsSet.add(currentMonthValue);
    return Array.from(monthsSet).sort().reverse();
  }, [pesees, currentMonthValue]);

  const monthStats = useMemo(() => {
    const monthPesees =
      selectedMonth === 'all'
        ? pesees
        : pesees.filter((p) => p.date && p.date.startsWith(selectedMonth));

    const totalKg = monthPesees.reduce((acc, curr) => acc + (curr.poidsKg || 0), 0);

    const byCategory: Record<
      string,
      { label: string; couleur: 'rouge' | 'jaune' | 'marron' | 'blanc' | 'noir' | 'special'; poids: number; count: number }
    > = {
      cat4_menager: { label: 'Cat. 4 - Déchets ménagers (noir)', couleur: 'noir', poids: 0, count: 0 },
      cat1_infectieux: { label: 'Cat. 1 - Déchets infectieux DASRI (rouge)', couleur: 'rouge', poids: 0, count: 0 },
      cat1_tranchant: { label: 'Cat. 1 - Piquants & tranchants (jaune)', couleur: 'jaune', poids: 0, count: 0 },
      cat2_chimique_pharma: { label: 'Cat. 2 - Chimiques & Pharma (marron)', couleur: 'marron', poids: 0, count: 0 },
      cat3_anatomique: { label: 'Cat. 3 - Anatomiques / placentas (blanc)', couleur: 'blanc', poids: 0, count: 0 },
      speciaux_mercure: { label: 'Spéciaux - Mercure & aérosols', couleur: 'special', poids: 0, count: 0 },
    };

    monthPesees.forEach((p) => {
      const key = p.categorie;
      if (byCategory[key]) {
        byCategory[key].poids += p.poidsKg;
        byCategory[key].count += 1;
      } else {
        byCategory.cat1_infectieux.poids += p.poidsKg;
        byCategory.cat1_infectieux.count += 1;
      }
    });

    return {
      totalKg: Number(totalKg.toFixed(2)),
      count: monthPesees.length,
      categories: byCategory,
    };
  }, [pesees, selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Gestion des Déchets (DMP)
                </h1>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Guide ESSP 2021 • Chapitre VI</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAddPeseeModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Pesée</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none py-1.5">
          <button
            onClick={() => setActiveTab('tri')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'tri'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Guide de Tri
          </button>
          <button
            onClick={() => setActiveTab('pesee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'pesee'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Registre des Pesées ({pesees.length})
          </button>
          <button
            onClick={() => setActiveTab('graphique')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'graphique'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Graphique Mensuel
          </button>
          <button
            onClick={() => setActiveTab('fiches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'fiches'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Étapes & Risques
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {formSuccessMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{formSuccessMessage}</span>
          </div>
        )}

        {/* =========================================================================
            TAB 1: GUIDE DE TRI INTERACTIF
           ========================================================================= */}
        {activeTab === 'tri' && (
          <div className="space-y-4">
            {/* Regulatory banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 dark:from-amber-950/30 dark:via-rose-950/30 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">
                  Règle d'or : Le tri s'effectue immédiatement à la source par le producteur du déchet
                </p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  Ne jamais jeter d'objets piquants/tranchants dans des sacs plastiques. Ne jamais recapuchonner une aiguille. Remplir les contenants aux 3/4 maximum.
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTri}
                  onChange={(e) => setSearchTri(e.target.value)}
                  placeholder="Rechercher un déchet (aiguille, flacon, pansement, placenta, mercure...)"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {searchTri && (
                  <button
                    onClick={() => setSearchTri('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Color filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3 text-slate-600 dark:text-slate-400" /> Couleur :
                </span>
                <button
                  onClick={() => setSelectedColorFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    selectedColorFilter === 'all'
                      ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tous ({DECHETS_TRI_LIST.length})
                </button>
                <button
                  onClick={() => setSelectedColorFilter('jaune')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                    selectedColorFilter === 'jaune'
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  Jaune (Piquants)
                </button>
                <button
                  onClick={() => setSelectedColorFilter('rouge')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                    selectedColorFilter === 'rouge'
                      ? 'bg-rose-600 text-white ring-2 ring-rose-500'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                  Rouge (DASRI)
                </button>
                <button
                  onClick={() => setSelectedColorFilter('noir')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                    selectedColorFilter === 'noir'
                      ? 'bg-slate-950 text-white ring-2 ring-slate-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-950 shrink-0"></span>
                  Noir (Ménager)
                </button>
                <button
                  onClick={() => setSelectedColorFilter('marron')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                    selectedColorFilter === 'marron'
                      ? 'bg-amber-900 text-white ring-2 ring-amber-800'
                      : 'bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-900 shrink-0"></span>
                  Marron (Pharma/Chimique)
                </button>
                <button
                  onClick={() => setSelectedColorFilter('blanc')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                    selectedColorFilter === 'blanc'
                      ? 'bg-white text-slate-900 border border-slate-400 ring-2 ring-slate-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                  Blanc (Anatomique)
                </button>
                <button
                  onClick={() => setSelectedColorFilter('special')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                    selectedColorFilter === 'special'
                      ? 'bg-purple-600 text-white ring-2 ring-purple-500'
                      : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></span>
                  Spéciaux (Mercure)
                </button>
              </div>
            </div>

            {/* List of waste items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTriItems.map((item) => {
                const colorConfig = COULEUR_BG_MAP[item.couleurContenant] || COULEUR_BG_MAP.rouge;
                const isSelected = selectedTriItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTriItem(isSelected ? null : item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 ${
                      isSelected
                        ? `border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/30 shadow-md`
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1.5 ${colorConfig.badge}`}
                        >
                          {item.couleurContenant === 'jaune'
                            ? 'BOÎTE JAUNE'
                            : item.couleurContenant === 'rouge'
                            ? 'SAC ROUGE'
                            : item.couleurContenant === 'noir'
                            ? 'SAC NOIR'
                            : item.couleurContenant === 'marron'
                            ? 'CONTENEUR MARRON'
                            : item.couleurContenant === 'blanc'
                            ? 'SAC BLANC'
                            : 'FLACON SPÉCIAL'}
                        </span>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {item.nom}
                        </h2>
                      </div>
                      <div className="shrink-0">
                        {item.symbole === 'biohazard' && (
                          <span className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xs font-bold" title="Risque biologique">
                            ☣
                          </span>
                        )}
                        {item.symbole === 'chimique' && (
                          <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 flex items-center justify-center text-xs font-bold" title="Risque chimique">
                            ⚗
                          </span>
                        )}
                        {item.symbole === 'toxique' && (
                          <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 flex items-center justify-center text-xs font-bold" title="Toxique mercure">
                            ☠
                          </span>
                        )}
                        {item.symbole === 'menager' && (
                          <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center text-xs font-bold" title="Déchet ménager">
                            ♻
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Container details */}
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        📦 <span className="underline">Contenant requis :</span> {item.contenant}
                      </p>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                        📍 <span className="font-medium">Filière :</span> {item.destination}
                      </p>
                    </div>

                    {/* Consignes preview or full */}
                    {isSelected ? (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 animate-in fade-in duration-200">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Consignes de sécurité du Guide :
                        </p>
                        <ul className="space-y-1 pl-1">
                          {item.consignes.map((c, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                              <span className="text-amber-500 font-bold shrink-0">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-3 pt-2 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormCategorie(item.categorieCode);
                              setShowAddPeseeModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            Peser ce type de déchet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center justify-between">
                        <span>Voir consignes & règles du guide</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredTriItems.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Trash2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Aucun déchet trouvé pour "{searchTri}"
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  Essayez avec un autre mot-clé (ex: compresse, vaccin, aiguille, tube de sang, pile, plâtre...)
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: REGISTRE DES PESÉES
           ========================================================================= */}
        {activeTab === 'pesee' && (
          <div className="space-y-4">
            {/* Header summary & action */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Registre réglementaire des pesées DMP
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                  Conforme à l'art. 32 de la loi n° 28-00 & décret n° 2-09-139 (Traçabilité hospitalière)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddPeseeModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle pesée
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={peseeSearch}
                  onChange={(e) => setPeseeSearch(e.target.value)}
                  placeholder="Recherche service, bordereau, date..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={peseeServiceFilter}
                  onChange={(e) => setPeseeServiceFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Tous les services ({services.length})</option>
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of Recorded Weigh-ins */}
            <div className="space-y-2.5">
              {filteredPesees.map((p) => {
                const colorConfig = COULEUR_BG_MAP[p.contenantCouleur] || COULEUR_BG_MAP.rouge;

                return (
                  <div
                    key={p.id}
                    className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${colorConfig.badge}`}
                          >
                            {p.contenantCouleur.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {p.service}
                          </span>
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3" />
                            {p.date} {p.heure ? `à ${p.heure}` : ''}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {p.categorieLabel}
                        </p>

                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-700 dark:text-slate-300 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" /> {p.operateur}
                          </span>
                          {p.numeroBordereau && (
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-sm">
                              BS: {p.numeroBordereau}
                            </span>
                          )}
                          {p.societeCollecte && (
                            <span>Transporteur: {p.societeCollecte}</span>
                          )}
                        </div>

                        {p.observations && (
                          <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            Obs: {p.observations}
                          </p>
                        )}
                      </div>

                      {/* Weight pill & actions */}
                      <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                            {p.poidsKg}
                          </span>
                          <span className="text-xs font-bold text-slate-500 ml-1">kg</span>
                        </div>

                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => setPeseeToPrint(p)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Bordereau individuel"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPeseeToDelete(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Supprimer cette pesée"
                            aria-label="Supprimer cette pesée"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPesees.length === 0 && (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Scale className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Aucune pesée enregistrée
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    Cliquez sur "Nouvelle pesée" pour consigner la collecte quotidienne d'un service.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: GRAPHIQUE MENSUEL
           ========================================================================= */}
        {activeTab === 'graphique' && (
          <div className="space-y-4">
            {/* Month Filter Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Bilan & Répartition Mensuelle du Poids (kg)
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  Analyse comparative avec les ratios de référence nationaux (Tableau 17 du guide)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Période :
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Toutes périodes confondues</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m === currentMonthValue ? `Ce mois (${m})` : m}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1"
                  title="Imprimer le bilan"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer
                </button>
              </div>
            </div>

            {/* Total cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Poids total collecté
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                  {monthStats.totalKg} <span className="text-xs font-bold text-slate-500">kg</span>
                </p>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 mt-0.5">{monthStats.count} pesées enregistrées</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  Total DASRI + Piquants
                </span>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                  {(
                    monthStats.categories.cat1_infectieux.poids +
                    monthStats.categories.cat1_tranchant.poids
                  ).toFixed(2)}{' '}
                  <span className="text-xs font-bold text-slate-500">kg</span>
                </p>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 mt-0.5">
                  {monthStats.totalKg > 0
                    ? `${(
                        ((monthStats.categories.cat1_infectieux.poids +
                          monthStats.categories.cat1_tranchant.poids) /
                          monthStats.totalKg) *
                        100
                      ).toFixed(1)}% du total`
                    : '0%'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Déchets ménagers (noir)
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                  {monthStats.categories.cat4_menager.poids.toFixed(2)}{' '}
                  <span className="text-xs font-bold text-slate-500">kg</span>
                </p>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 mt-0.5">
                  {monthStats.totalKg > 0
                    ? `${(
                        (monthStats.categories.cat4_menager.poids / monthStats.totalKg) *
                        100
                      ).toFixed(1)}% (Guide: ~80%)`
                    : '0%'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Chimique / Pharma / Bio
                </span>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono mt-1">
                  {(
                    monthStats.categories.cat2_chimique_pharma.poids +
                    monthStats.categories.cat3_anatomique.poids +
                    monthStats.categories.speciaux_mercure.poids
                  ).toFixed(2)}{' '}
                  <span className="text-xs font-bold text-slate-500">kg</span>
                </p>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 mt-0.5">Filières réglementées</p>
              </div>
            </div>

            {/* Visual Bar Chart per Category */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Distribution réelle du poids par type de déchet</span>
                <span className="text-xs font-normal text-slate-700 dark:text-slate-300 font-medium">
                  {selectedMonth === 'all' ? 'Toutes données' : `Mois : ${selectedMonth}`}
                </span>
              </h2>

              <div className="space-y-3 pt-1">
                {Object.entries(monthStats.categories).map(([key, data]) => {
                  const pct =
                    monthStats.totalKg > 0
                      ? ((data.poids / monthStats.totalKg) * 100).toFixed(1)
                      : '0.0';

                  const barColors: Record<string, string> = {
                    cat4_menager: 'bg-slate-900 dark:bg-slate-600',
                    cat1_infectieux: 'bg-rose-600',
                    cat1_tranchant: 'bg-amber-500',
                    cat2_chimique_pharma: 'bg-amber-800',
                    cat3_anatomique: 'bg-slate-300 dark:bg-slate-400 border border-slate-400',
                    speciaux_mercure: 'bg-purple-600',
                  };

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <span
                            className={`w-3 h-3 rounded-xs shrink-0 ${barColors[key] || 'bg-slate-500'}`}
                          ></span>
                          <span>{data.label}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {data.poids.toFixed(2)} kg
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 w-12 text-right font-mono">
                            ({pct}%)
                          </span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColors[key] || 'bg-slate-500'}`}
                          style={{ width: `${Math.min(100, Math.max(parseFloat(pct), 1.5))}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benchmark vs Guide ESSP Table 17 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                    Ratios de référence du Guide Marocain (Tableau 17 - Répartition moyenne ESSP)
                  </h2>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                    Dans une structure de santé bien triée, ~80% des déchets sont assimilés aux ordures ménagères (non infectieux). Un sur-tri de déchets ordinaires dans les sacs rouges engendre des surcoûts majeurs d'incinération.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center">
                {RISQUES_SANTE_ENVIRONNEMENT.repartitionTypiqueESSP.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {item.pourcentage}%
                    </span>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium mt-1 leading-tight line-clamp-2">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: FICHES ÉTAPES ET RISQUES
           ========================================================================= */}
        {activeTab === 'fiches' && (
          <div className="space-y-4">
            {/* 6 Steps of waste cycle */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Les 6 étapes de la filière d'élimination des DMP
              </h2>

              <div className="space-y-3">
                {ETAPES_FILIERE_DECHETS.map((etape) => (
                  <div
                    key={etape.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/80">
                        {etape.numero}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {etape.titre}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] text-slate-700 dark:text-slate-300 mt-1 flex-wrap font-medium">
                          <span>👤 Responsable : <strong className="text-slate-900 dark:text-white">{etape.qui}</strong></span>
                          <span>📍 Emplacement : <strong className="text-slate-900 dark:text-white">{etape.ou}</strong></span>
                        </div>

                        <div className="mt-2.5 space-y-1">
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Procédure réglementaire :
                          </p>
                          <ul className="space-y-1 pl-1">
                            {etape.comment.map((c, i) => (
                              <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {etape.reglesSecurite.length > 0 && (
                          <div className="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl">
                            <p className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1 mb-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Règles de sécurité & précautions :
                            </p>
                            <ul className="space-y-0.5 pl-1">
                              {etape.reglesSecurite.map((r, i) => (
                                <li key={i} className="text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                                  <span>•</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health & Environmental Risks (Tableau 18) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Risques sanitaires & environnementaux des DMP (Tableau 18)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RISQUES_SANTE_ENVIRONNEMENT.risquesSante.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60"
                  >
                    <h3 className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      {r.titre}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Impacts sur l'environnement & prévention
                </h3>
                <ul className="mt-1 space-y-1 pl-1">
                  {RISQUES_SANTE_ENVIRONNEMENT.risquesEnvironnement.map((env, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                      <span>{env}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Reference */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Textes législatifs et réglementaires applicables au Maroc :
                </p>
                <ul className="mt-1 space-y-0.5 pl-1">
                  {RISQUES_SANTE_ENVIRONNEMENT.cadreLegal.map((loi, i) => (
                    <li key={i} className="text-[11px] text-slate-700 dark:text-slate-300 font-medium flex items-start gap-1.5">
                      <span>⚖</span>
                      <span>{loi}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: NOUVELLE PESÉE
         ========================================================================= */}
      {showAddPeseeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Consigner une pesée de déchets
                  </h3>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Bordereau & Registre ESSP</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPeseeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePesee} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date de pesée *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={formHeure}
                    onChange={(e) => setFormHeure(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Service générateur *
                </label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Type de déchet & Contenant *
                </label>
                <div className="space-y-1.5">
                  {CATEGORIES_OPTIONS.map((cat) => {
                    const isSelected = formCategorie === cat.code;
                    const colorConfig = COULEUR_BG_MAP[cat.couleur];

                    return (
                      <div
                        key={cat.code}
                        onClick={() => setFormCategorie(cat.code)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? `${colorConfig.bg} ${colorConfig.border} ring-2 ${colorConfig.ring}`
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full shrink-0 ${
                              cat.couleur === 'jaune'
                                ? 'bg-amber-400'
                                : cat.couleur === 'rouge'
                                ? 'bg-rose-600'
                                : cat.couleur === 'noir'
                                ? 'bg-slate-900 dark:bg-white'
                                : cat.couleur === 'marron'
                                ? 'bg-amber-900'
                                : cat.couleur === 'blanc'
                                ? 'bg-slate-200 border border-slate-400'
                                : 'bg-purple-600'
                            }`}
                          ></span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {cat.label}
                            </p>
                            <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">{cat.contenantCourt}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Poids (en kg) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formPoids}
                      onChange={(e) => setFormPoids(e.target.value)}
                      placeholder="Ex: 4.50"
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    N° Bordereau de suivi (BS)
                  </label>
                  <input
                    type="text"
                    value={formBordereau}
                    onChange={(e) => setFormBordereau(e.target.value)}
                    placeholder="Ex: BS-2025-082"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opérateur (Hygiéniste)
                  </label>
                  <input
                    type="text"
                    value={formOperateur}
                    onChange={(e) => setFormOperateur(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Société / Filière
                  </label>
                  <input
                    type="text"
                    value={formSociete}
                    onChange={(e) => setFormSociete(e.target.value)}
                    placeholder="Prestataire agréé / BMH"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observations / État des contenants
                </label>
                <textarea
                  rows={2}
                  value={formObservations}
                  onChange={(e) => setFormObservations(e.target.value)}
                  placeholder="Ex: Sacs scellés aux 3/4 sans déchirure, boîtes jaunes fermées..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPeseeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Enregistrer la pesée
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BORDEREAU / FICHE DE TRAÇABILITÉ IMPRIMABLE
         ========================================================================= */}
      {peseeToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Bordereau de Traçabilité de Pesée
                </h3>
              </div>
              <button
                onClick={() => setPeseeToPrint(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable ticket */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 font-sans text-xs">
              <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-600 pb-2">
                <p className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">
                  Royaume du Maroc • Ministère de la Santé
                </p>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  Établissement de Soins de Santé Primaires (ESSP)
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  FICHE DE TRAÇABILITÉ DES DÉCHETS MÉDICAUX & PHARMACEUTIQUES
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Date & Heure :</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {peseeToPrint.date} à {peseeToPrint.heure || '10:00'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">N° Bordereau :</span>
                  <p className="font-mono font-semibold text-slate-900 dark:text-white">
                    {peseeToPrint.numeroBordereau || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Service producteur :</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {peseeToPrint.service}
                  </p>
                </div>
                <div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Opérateur hygiène :</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {peseeToPrint.operateur}
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                    {peseeToPrint.categorieLabel}
                  </p>
                  <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                    Contenant couleur : {peseeToPrint.contenantCouleur.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {peseeToPrint.poidsKg}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">kg</span>
                </div>
              </div>

              {peseeToPrint.observations && (
                <div className="text-[11px]">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Observations :</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{peseeToPrint.observations}</p>
                </div>
              )}

              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-3 grid grid-cols-2 gap-4 text-center text-[10px]">
                <div>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium">Visa & Signature Hygiéniste</p>
                  <div className="border-b border-slate-400 dark:border-slate-600"></div>
                </div>
                <div>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium">Visa Transporteur Agréé</p>
                  <div className="border-b border-slate-400 dark:border-slate-600"></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPeseeToPrint(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Fermer
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Imprimer ce bordereau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Pesee Confirmation Modal */}
      <ConfirmModal
        isOpen={!!peseeToDelete}
        title="Supprimer cette pesée ?"
        message={`Voulez-vous vraiment supprimer l'enregistrement de pesée de ${peseeToDelete?.poidsKg || 0} kg du ${peseeToDelete?.date || ''} (${peseeToDelete?.service || ''}) ?`}
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={handleConfirmDeletePesee}
        onCancel={() => setPeseeToDelete(null)}
      />
    </div>
  );
};
export default DechetsModule;
