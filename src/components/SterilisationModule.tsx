import React, { useState, useMemo } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Trash2,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  FileCheck,
} from 'lucide-react';
import { SterilisationIcon } from './AppMaskedIcons';
import { SterilisationCycle, SterilisationProgramme } from '../types';
import {
  STERILISATION_PHASES,
  PROGRAMMES_GUIDE,
  validateCycleParameters,
} from '../data/sterilisationData';
import { storageService } from '../services/storageService';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';

interface SterilisationModuleProps {
  onBackToHome?: () => void;
}

export const SterilisationModule: React.FC<SterilisationModuleProps> = ({ onBackToHome }) => {
  const { showToast } = useToast();
  const settings = storageService.getSettings();

  const [activeSubTab, setActiveSubTab] = useState<'registre' | 'formulaire' | 'procedure'>('registre');
  const [cycles, setCycles] = useState<SterilisationCycle[]>(() =>
    storageService.getSterilisationCycles()
  );
  const [cycleToDelete, setCycleToDelete] = useState<SterilisationCycle | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState<string>('');
  const [conformiteFilter, setConformiteFilter] = useState<'all' | 'conforme' | 'non_conforme'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected cycle for detailed printable modal
  const [selectedCycleForPrint, setSelectedCycleForPrint] = useState<SterilisationCycle | null>(null);

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const [formDate, setFormDate] = useState<string>(today);
  const [formHeure, setFormHeure] = useState<string>(currentTime);
  const [formNumeroCycle, setFormNumeroCycle] = useState<string>(() => `Cycle #${cycles.length + 1}`);
  const [formAutoclave, setFormAutoclave] = useState<string>('Autoclave A1 (Classe B)');
  const [formOperateur, setFormOperateur] = useState<string>(
    settings.userName || settings.auditeurDefaut || 'Technicien d’hygiène'
  );
  const [formProgramme, setFormProgramme] = useState<SterilisationProgramme>('instruments_134');
  const [formTemperature, setFormTemperature] = useState<number>(134);
  const [formPression, setFormPression] = useState<number>(3.0);
  const [formDuree, setFormDuree] = useState<number>(18);
  const [formComposition, setFormComposition] = useState<string>('Boîtes d’instruments de soins, plateaux');
  const [formBowieDick, setFormBowieDick] = useState<boolean | 'non_applicable'>(true);
  const [formIndicateur, setFormIndicateur] = useState<'conforme' | 'non_conforme'>('conforme');
  const [formSiccite, setFormSiccite] = useState<boolean>(true);
  const [formIntegrite, setFormIntegrite] = useState<boolean>(true);
  const [formObservations, setFormObservations] = useState<string>('');

  // Real-time validation alerts for the form
  const liveValidation = useMemo(() => {
    return validateCycleParameters({
      programme: formProgramme,
      temperature: formTemperature,
      duree: formDuree,
      pression: formPression,
      bowieDickConforme: formBowieDick,
      resultatIndicateur: formIndicateur,
      sicciteConforme: formSiccite,
      integriteEmballageConforme: formIntegrite,
    });
  }, [
    formProgramme,
    formTemperature,
    formDuree,
    formPression,
    formBowieDick,
    formIndicateur,
    formSiccite,
    formIntegrite,
  ]);

  // Handle program change to auto-set standard guide parameters
  const handleProgrammeChange = (prog: SterilisationProgramme) => {
    setFormProgramme(prog);
    const cfg = PROGRAMMES_GUIDE[prog];
    setFormTemperature(cfg.temperature);
    setFormDuree(cfg.dureeMin);
    setFormPression(cfg.pressionMoyenne);
  };

  // Submit cycle form
  const handleSaveCycle = (e: React.FormEvent) => {
    e.preventDefault();

    const progCfg = PROGRAMMES_GUIDE[formProgramme];
    const saved = storageService.saveSterilisationCycle({
      numeroCycle: formNumeroCycle,
      date: formDate,
      heure: formHeure,
      numeroAutoclave: formAutoclave,
      operateur: formOperateur,
      programme: formProgramme,
      programmeLabel: progCfg.label,
      temperature: formTemperature,
      pression: formPression,
      duree: formDuree,
      compositionCharge: formComposition,
      bowieDickConforme: formBowieDick,
      resultatIndicateur: formIndicateur,
      sicciteConforme: formSiccite,
      integriteEmballageConforme: formIntegrite,
      observations: formObservations,
    });

    setCycles(storageService.getSterilisationCycles());
    setSelectedCycleForPrint(saved);
    setActiveSubTab('registre');
    showToast('Cycle de stérilisation enregistré avec succès !', 'success');

    // Reset cycle number for next entry
    setFormNumeroCycle(`Cycle #${storageService.getSterilisationCycles().length + 1}`);
  };

  // Delete cycle
  const handleConfirmDeleteCycle = () => {
    if (cycleToDelete) {
      storageService.deleteSterilisationCycle(cycleToDelete.id);
      setCycles(storageService.getSterilisationCycles());
      if (selectedCycleForPrint?.id === cycleToDelete.id) {
        setSelectedCycleForPrint(null);
      }
      showToast('Cycle supprimé du registre', 'info');
      setCycleToDelete(null);
    }
  };

  // Filtered cycles
  const filteredCycles = useMemo(() => {
    return cycles.filter((cycle) => {
      // Date filter
      if (dateFilter && cycle.date !== dateFilter) return false;

      // Conformity filter
      if (conformiteFilter === 'conforme' && !cycle.estConforme) return false;
      if (conformiteFilter === 'non_conforme' && cycle.estConforme) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          cycle.numeroCycle.toLowerCase().includes(q) ||
          cycle.numeroAutoclave.toLowerCase().includes(q) ||
          cycle.operateur.toLowerCase().includes(q) ||
          cycle.compositionCharge.toLowerCase().includes(q) ||
          (cycle.observations && cycle.observations.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [cycles, dateFilter, conformiteFilter, searchQuery]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Module Title Banner (hidden in print) */}
      <div className="no-print">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
                Guide ESSP 2021 — Chapitre V
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <SterilisationIcon size={20} className="w-5 h-5 text-teal-400" />
              <span>Stérilisation & Traçabilité</span>
            </h2>
            <p className="text-xs text-slate-400">
              Procédure en 9 étapes, contrôle des cycles d'autoclave et registre officiel
            </p>
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700"
            >
              ← Retour Accueil
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Navigation (hidden in print) */}
      <div className="no-print flex items-center gap-1 p-1 bg-slate-800/90 rounded-2xl border border-slate-700 text-[11px] sm:text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('registre')}
          className={`flex-1 min-w-[90px] py-2 px-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
            activeSubTab === 'registre'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Registre ({cycles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('formulaire')}
          className={`flex-1 min-w-[90px] py-2 px-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
            activeSubTab === 'formulaire'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Nouveau Cycle</span>
        </button>

        <button
          onClick={() => setActiveSubTab('procedure')}
          className={`flex-1 min-w-[90px] py-2 px-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
            activeSubTab === 'procedure'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Procédure (9)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: REGISTRE DES CYCLES                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'registre' && (
        <div className="space-y-4 animate-fadeIn no-print">
          {/* Filters Bar */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Search */}
              <div className="relative sm:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cycle, autoclave, opérateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="p-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs shrink-0"
                    title="Effacer filtre date"
                  >
                    Tous
                  </button>
                )}
              </div>

              {/* Conformité Pills */}
              <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700 text-xs">
                <button
                  onClick={() => setConformiteFilter('all')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    conformiteFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setConformiteFilter('conforme')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    conformiteFilter === 'conforme'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-400'
                  }`}
                >
                  Conformes
                </button>
                <button
                  onClick={() => setConformiteFilter('non_conforme')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    conformiteFilter === 'non_conforme'
                      ? 'bg-rose-600 text-white'
                      : 'text-rose-400'
                  }`}
                >
                  Alertes
                </button>
              </div>
            </div>
          </div>

          {/* List of Registered Cycles */}
          {filteredCycles.length === 0 ? (
            <div className="rounded-2xl p-8 bg-slate-800/40 border border-slate-700/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-750 flex items-center justify-center mx-auto text-slate-400">
                <SterilisationIcon size={28} className="w-7 h-7 text-slate-400" />
              </div>
              <h4 className="font-bold text-white text-base">Aucun cycle trouvé</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {searchQuery || dateFilter || conformiteFilter !== 'all'
                  ? 'Aucun enregistrement ne correspond aux filtres.'
                  : 'Enregistrez votre premier cycle de stérilisation pour débuter la traçabilité.'}
              </p>
              <button
                onClick={() => setActiveSubTab('formulaire')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition"
              >
                Créer un nouveau cycle
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className={`rounded-2xl p-4 border transition shadow-md space-y-3 ${
                    cycle.estConforme
                      ? 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
                      : 'bg-slate-800/95 border-rose-500/60 shadow-rose-950/20 ring-1 ring-rose-500/40'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-white">
                          {cycle.numeroCycle}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {cycle.date} {cycle.heure ? `à ${cycle.heure}` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {cycle.numeroAutoclave}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-rose-300 mt-1">
                        {cycle.programmeLabel}
                      </h4>
                    </div>

                    {/* Conformity Badge */}
                    <div className="shrink-0 text-right">
                      {cycle.estConforme ? (
                        <span className="inline-flex items-center gap-1 font-black text-xs text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-xl border border-emerald-500/40 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Conforme</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-black text-xs text-rose-300 bg-rose-950/90 px-2.5 py-1 rounded-xl border border-rose-500/50 shadow-xs animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Non-conforme</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Température
                      </span>
                      <span
                        className={`font-mono font-black ${
                          (cycle.programme === 'instruments_134' && cycle.temperature === 134) ||
                          (cycle.programme === 'textile_caoutchouc_125' && cycle.temperature === 125)
                            ? 'text-white'
                            : 'text-rose-400'
                        }`}
                      >
                        {cycle.temperature}°C
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Durée Plateau
                      </span>
                      <span
                        className={`font-mono font-black ${
                          cycle.duree >= PROGRAMMES_GUIDE[cycle.programme].dureeMin
                            ? 'text-white'
                            : 'text-rose-400'
                        }`}
                      >
                        {cycle.duree} min
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Pression
                      </span>
                      <span
                        className={`font-mono font-black ${
                          cycle.pression >= 2.8 && cycle.pression <= 3.2
                            ? 'text-white'
                            : 'text-rose-400'
                        }`}
                      >
                        {cycle.pression} bars
                      </span>
                    </div>
                  </div>

                  {/* Charge & Controls Breakdown */}
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>
                      <strong>Charge :</strong> {cycle.compositionCharge}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                      <span>
                        Bowie-Dick :{' '}
                        <strong
                          className={
                            cycle.bowieDickConforme === true
                              ? 'text-emerald-400'
                              : cycle.bowieDickConforme === false
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }
                        >
                          {cycle.bowieDickConforme === true
                            ? 'Conforme'
                            : cycle.bowieDickConforme === false
                            ? 'Non conforme'
                            : 'N/A'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Témoin physico-chimique :{' '}
                        <strong
                          className={
                            cycle.resultatIndicateur === 'conforme'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }
                        >
                          {cycle.resultatIndicateur === 'conforme' ? 'Viré' : 'Non viré'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Siccité :{' '}
                        <strong className={cycle.sicciteConforme ? 'text-emerald-400' : 'text-rose-400'}>
                          {cycle.sicciteConforme ? 'Sèche' : 'Humide'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Anomalies Alert Box if any */}
                  {cycle.anomaliesDetectees && cycle.anomaliesDetectees.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 space-y-1 text-xs">
                      <span className="font-bold text-rose-300 uppercase tracking-wide text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Anomalies réglementaires constatées (Guide 2021) :
                      </span>
                      <ul className="list-disc pl-4 text-rose-200 text-[11px] space-y-0.5">
                        {cycle.anomaliesDetectees.map((anom, idx) => (
                          <li key={idx}>{anom}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Opérateur : <strong>{cycle.operateur}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedCycleForPrint(cycle)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 font-bold text-xs transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Fiche Traçabilité</span>
                      </button>

                      <button
                        onClick={() => setCycleToDelete(cycle)}
                        className="p-1.5 rounded-lg bg-slate-700/60 text-rose-400 hover:bg-rose-950/40 transition"
                        title="Supprimer ce cycle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: FORMULAIRE CYCLE DE STÉRILISATION                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'formulaire' && (
        <form
          onSubmit={handleSaveCycle}
          className="rounded-2xl p-4 sm:p-5 bg-slate-800/80 border border-slate-700/80 space-y-4 shadow-xl no-print animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <div>
              <h3 className="font-extrabold text-base text-white">
                Enregistrer un Cycle de Stérilisation
              </h3>
              <p className="text-xs text-slate-400">
                Vérification automatique en direct par rapport aux valeurs officielles du Guide ESSP 2021
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2 py-1 rounded border border-rose-800">
              {formNumeroCycle}
            </span>
          </div>

          {/* Real-time Visual Alert Banner if parameters are invalid */}
          {!liveValidation.estConforme ? (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-500 shadow-lg text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-300 font-extrabold uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Paramètres non conformes au Guide ESSP 2021</span>
              </div>
              <ul className="list-disc pl-5 text-rose-200 text-[11px] space-y-0.5">
                {liveValidation.anomalies.map((anom, i) => (
                  <li key={i}>{anom}</li>
                ))}
              </ul>
              <p className="text-[10px] text-rose-300 italic pt-1">
                Note : Si vous enregistrez ce cycle avec ces paramètres, il sera marqué comme NON-CONFORME dans le registre.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Paramètres du cycle conformes aux spécifications du Guide 2021 (Chaleur humide).</span>
            </div>
          )}

          {/* Identification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Date du cycle :</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Heure de début :</label>
              <input
                type="time"
                value={formHeure}
                onChange={(e) => setFormHeure(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Numéro d'autoclave :</label>
              <input
                type="text"
                value={formAutoclave}
                onChange={(e) => setFormAutoclave(e.target.value)}
                placeholder="Ex : Autoclave A1 (Classe B)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400"
                required
              />
            </div>
          </div>

          {/* Opérateur & Numéro Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Identité de l'Opérateur :</label>
              <input
                type="text"
                value={formOperateur}
                onChange={(e) => setFormOperateur(e.target.value)}
                placeholder="Nom du technicien ou infirmier"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Numéro / Identifiant du Cycle :</label>
              <input
                type="text"
                value={formNumeroCycle}
                onChange={(e) => setFormNumeroCycle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400"
                required
              />
            </div>
          </div>

          {/* Programme Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Programme de Stérilisation (Chaleur Humide) :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleProgrammeChange('instruments_134')}
                className={`p-3 rounded-xl text-left border transition ${
                  formProgramme === 'instruments_134'
                    ? 'bg-rose-950/80 border-rose-500 text-white shadow'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="font-bold text-xs block text-rose-300">Instruments de soins</span>
                <span className="text-[11px] text-slate-300 block mt-0.5">134°C / 18 min / 3 bars</span>
                <span className="text-[10px] text-slate-400 block mt-1">Petite chirurgie, métaux</span>
              </button>

              <button
                type="button"
                onClick={() => handleProgrammeChange('textile_caoutchouc_125')}
                className={`p-3 rounded-xl text-left border transition ${
                  formProgramme === 'textile_caoutchouc_125'
                    ? 'bg-rose-950/80 border-rose-500 text-white shadow'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="font-bold text-xs block text-rose-300">Caoutchouc & Textile</span>
                <span className="text-[11px] text-slate-300 block mt-0.5">125°C / 20 min / 3 bars</span>
                <span className="text-[10px] text-slate-400 block mt-1">Champs, compresses</span>
              </button>

              <button
                type="button"
                onClick={() => handleProgrammeChange('bowie_dick_134')}
                className={`p-3 rounded-xl text-left border transition ${
                  formProgramme === 'bowie_dick_134'
                    ? 'bg-rose-950/80 border-rose-500 text-white shadow'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="font-bold text-xs block text-rose-300">Test de Bowie-Dick</span>
                <span className="text-[11px] text-slate-300 block mt-0.5">134°C / 3 mn 30 s</span>
                <span className="text-[10px] text-slate-400 block mt-1">Test vapeur matinal</span>
              </button>
            </div>
          </div>

          {/* Physical Parameters Inputs */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Température (°C) :
              </label>
              <input
                type="number"
                step="1"
                value={formTemperature}
                onChange={(e) => setFormTemperature(parseFloat(e.target.value) || 0)}
                className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border text-center font-mono font-bold text-sm ${
                  (formProgramme === 'instruments_134' && formTemperature === 134) ||
                  (formProgramme === 'textile_caoutchouc_125' && formTemperature === 125) ||
                  (formProgramme === 'bowie_dick_134' && formTemperature === 134)
                    ? 'border-emerald-500 text-emerald-300'
                    : 'border-rose-500 text-rose-300 animate-pulse'
                }`}
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Durée (min) :
              </label>
              <input
                type="number"
                step="0.5"
                value={formDuree}
                onChange={(e) => setFormDuree(parseFloat(e.target.value) || 0)}
                className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border text-center font-mono font-bold text-sm ${
                  formDuree >= PROGRAMMES_GUIDE[formProgramme].dureeMin
                    ? 'border-emerald-500 text-emerald-300'
                    : 'border-rose-500 text-rose-300 animate-pulse'
                }`}
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Pression (bars) :
              </label>
              <input
                type="number"
                step="0.1"
                value={formPression}
                onChange={(e) => setFormPression(parseFloat(e.target.value) || 0)}
                className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border text-center font-mono font-bold text-sm ${
                  formPression >= 2.8 && formPression <= 3.2
                    ? 'border-emerald-500 text-emerald-300'
                    : 'border-rose-500 text-rose-300 animate-pulse'
                }`}
                required
              />
            </div>
          </div>

          {/* Composition de la charge */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Composition de la charge (instruments, tambours, sachets) :
            </label>
            <input
              type="text"
              value={formComposition}
              onChange={(e) => setFormComposition(e.target.value)}
              placeholder="Ex : 2 boîtes sutures, 1 spéculum, 3 tambours de compresses"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400 text-xs"
              required
            />
          </div>

          {/* Contrôles réglementaires du cycle (Bowie-Dick, Indicateur, Siccité, Emballage) */}
          <div className="space-y-3 pt-2 border-t border-slate-700 text-xs">
            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
              Contrôles réglementaires du cycle (Guide Section 7)
            </span>

            {/* Test de Bowie-Dick */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700">
              <div>
                <span className="font-semibold text-white block">Test de Bowie et Dick (quotidien) :</span>
                <span className="text-[10px] text-slate-400">Diffusion homogène de vapeur (134°C / 3mn30)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFormBowieDick(true)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    formBowieDick === true ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Conforme
                </button>
                <button
                  type="button"
                  onClick={() => setFormBowieDick(false)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    formBowieDick === false ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Non conforme
                </button>
                <button
                  type="button"
                  onClick={() => setFormBowieDick('non_applicable')}
                  className={`px-2 py-1 rounded-lg text-xs ${
                    formBowieDick === 'non_applicable' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  N/A
                </button>
              </div>
            </div>

            {/* Virage Indicateur physico-chimique */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700">
              <div>
                <span className="font-semibold text-white block">Témoin de passage physico-chimique :</span>
                <span className="text-[10px] text-slate-400">Virage complet et uniforme de couleur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFormIndicateur('conforme')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    formIndicateur === 'conforme' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Viré conforme
                </button>
                <button
                  type="button"
                  onClick={() => setFormIndicateur('non_conforme')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    formIndicateur === 'non_conforme' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Non viré
                </button>
              </div>
            </div>

            {/* Siccité de la charge */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700">
              <div>
                <span className="font-semibold text-white block">Siccité de la charge :</span>
                <span className="text-[10px] text-slate-400">Absence totale de traces d'humidité</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFormSiccite(true)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    formSiccite ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Sèche (Conforme)
                </button>
                <button
                  type="button"
                  onClick={() => setFormSiccite(false)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    !formSiccite ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Traces d'humidité
                </button>
              </div>
            </div>

            {/* Intégrité des conditionnements */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700">
              <div>
                <span className="font-semibold text-white block">Intégrité des emballages :</span>
                <span className="text-[10px] text-slate-400">Ni déchirure, ni perforation, ni ouverture</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFormIntegrite(true)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    formIntegrite ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Intact (Conforme)
                </button>
                <button
                  type="button"
                  onClick={() => setFormIntegrite(false)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    !formIntegrite ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Détérioré
                </button>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Observations / Événements de maintenance :
            </label>
            <textarea
              rows={2}
              value={formObservations}
              onChange={(e) => setFormObservations(e.target.value)}
              placeholder="Ex : Ticket d'enregistrement agrafé, joint de porte nettoyé, eau distillée neuve..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400 text-xs"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('registre')}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-300 font-semibold text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-lg transition active:scale-95 ${
                liveValidation.estConforme
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
              }`}
            >
              Enregistrer au Registre
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: PROCÉDURE DE STÉRILISATION PHASE PAR PHASE                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'procedure' && (
        <div className="space-y-4 animate-fadeIn no-print">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/70 to-slate-900 border border-rose-500/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-extrabold uppercase tracking-wide text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Circuit Fermé de Stérilisation (Guide ESSP 2021)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              « La stérilisation forme un circuit fermé dont le respect de l'ordre des étapes constitue la condition essentielle pour garantir une stérilité parfaite du produit traité. »
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-800/40 font-mono text-[11px] text-rose-200">
              Pré-désinfection → Nettoyage → Rinçage → Séchage → Conditionnement → Stérilisation → Contrôle → Stockage → Traçabilité
            </div>
          </div>

          <div className="space-y-3">
            {STERILISATION_PHASES.map((phase) => (
              <div
                key={phase.numero}
                className="rounded-2xl p-4 bg-slate-800/80 border border-slate-700/80 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black text-xs flex items-center justify-center shrink-0">
                      {phase.numero}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      {phase.titre}
                    </h3>
                  </div>
                </div>

                {phase.regleCle && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-[11px] font-bold text-rose-300">
                    ★ {phase.regleCle}
                  </div>
                )}

                {/* Pourquoi */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Objectif (Pourquoi ?) :
                  </span>
                  <ul className="space-y-1 pl-1 text-xs text-slate-200">
                    {phase.pourquoi.map((pq, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold shrink-0">•</span>
                        <span>{pq}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Comment */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/50">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block mb-1">
                    Mode opératoire (Comment ?) :
                  </span>
                  <ul className="space-y-1 pl-1 text-xs text-slate-300">
                    {phase.comment.map((cm, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-400 font-bold shrink-0">✓</span>
                        <span>{cm}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Précautions */}
                {phase.precautions && phase.precautions.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200">
                    <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">
                      Précautions du guide :
                    </span>
                    <ul className="space-y-0.5 pl-1">
                      {phase.precautions.map((pr, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">!</span>
                          <span>{pr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED PRINTABLE MODAL : FICHE DE TRAÇABILITÉ (OFFICIAL MOROCCAN LAYOUT) */}
      {/* ========================================================================= */}
      {selectedCycleForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 print:bg-white border border-slate-700 print:border-gray-300 p-5 shadow-2xl text-slate-100 print:text-black my-8">
            {/* Modal Actions Header (Hidden in Print) */}
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                <span>Fiche Officielle de Traçabilité de Stérilisation</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedCycleForPrint(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Container */}
            <div className="print-container space-y-4">
              {/* Official Moroccan Ministry Header */}
              <div className="text-center pb-3 border-b-2 border-rose-600 print:border-black space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-rose-500 print:text-black" />
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400 print:text-black">
                    Royaume du Maroc — Ministère de la Santé
                  </span>
                </div>
                <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight text-white print:text-black">
                  Fiche de Traçabilité du Cycle de Stérilisation
                </h3>
                <p className="text-[11px] text-slate-400 print:text-gray-600">
                  Guide du Professionnel – Sécurité Sanitaire des ESSP (Chapitre V)
                </p>
              </div>

              {/* Cycle & Autoclave ID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-800/80 print:bg-gray-100 border border-slate-700 print:border-gray-300 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                    Numéro de cycle
                  </span>
                  <span className="font-black text-sm text-rose-300 print:text-black block">
                    {selectedCycleForPrint.numeroCycle}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                    Date & Heure
                  </span>
                  <span className="font-bold text-slate-200 print:text-black block">
                    {selectedCycleForPrint.date} {selectedCycleForPrint.heure ? `à ${selectedCycleForPrint.heure}` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                    Stérilisateur (Autoclave)
                  </span>
                  <span className="font-bold text-slate-200 print:text-black block">
                    {selectedCycleForPrint.numeroAutoclave}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                    Opérateur
                  </span>
                  <span className="font-bold text-slate-200 print:text-black block">
                    {selectedCycleForPrint.operateur}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-slate-800 print:bg-white border border-slate-700 print:border-gray-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                    Programme exécuté :
                  </span>
                  <span className="font-extrabold text-sm text-white print:text-black">
                    {selectedCycleForPrint.programmeLabel}
                  </span>
                </div>
                <div>
                  {selectedCycleForPrint.estConforme ? (
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 print:bg-emerald-100 print:text-emerald-900 border border-emerald-600 font-black text-xs uppercase">
                      ✓ Charge Déclarée Stérile
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-lg bg-rose-950 text-rose-300 print:bg-rose-100 print:text-rose-900 border border-rose-600 font-black text-xs uppercase">
                      ✕ Non-Conforme / Rejetée
                    </span>
                  )}
                </div>
              </div>

              {/* Physical Parameters Table */}
              <div className="rounded-xl border border-slate-700 print:border-gray-300 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 print:bg-gray-200 text-slate-300 print:text-black font-bold text-[10px] uppercase">
                      <th className="p-2 border-r border-slate-700 print:border-gray-300">Paramètre</th>
                      <th className="p-2 border-r border-slate-700 print:border-gray-300">Valeur Enregistrée</th>
                      <th className="p-2 border-r border-slate-700 print:border-gray-300">Norme Guide 2021</th>
                      <th className="p-2">Résultat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-slate-200 print:text-black text-xs">
                    <tr>
                      <td className="p-2 font-semibold">Température de stérilisation</td>
                      <td className="p-2 font-mono font-bold">{selectedCycleForPrint.temperature} °C</td>
                      <td className="p-2 font-mono text-slate-400 print:text-gray-600">
                        {selectedCycleForPrint.programme === 'textile_caoutchouc_125' ? '125 °C' : '134 °C'}
                      </td>
                      <td className="p-2">
                        {((selectedCycleForPrint.programme === 'instruments_134' && selectedCycleForPrint.temperature === 134) ||
                          (selectedCycleForPrint.programme === 'textile_caoutchouc_125' && selectedCycleForPrint.temperature === 125) ||
                          (selectedCycleForPrint.programme === 'bowie_dick_134' && selectedCycleForPrint.temperature === 134)) ? (
                          <span className="text-emerald-400 print:text-emerald-700 font-bold">Conforme</span>
                        ) : (
                          <span className="text-rose-400 print:text-rose-700 font-bold">Non conforme</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Durée du plateau thermique</td>
                      <td className="p-2 font-mono font-bold">{selectedCycleForPrint.duree} min</td>
                      <td className="p-2 font-mono text-slate-400 print:text-gray-600">
                        ≥ {PROGRAMMES_GUIDE[selectedCycleForPrint.programme].dureeMin} min
                      </td>
                      <td className="p-2">
                        {selectedCycleForPrint.duree >= PROGRAMMES_GUIDE[selectedCycleForPrint.programme].dureeMin ? (
                          <span className="text-emerald-400 print:text-emerald-700 font-bold">Conforme</span>
                        ) : (
                          <span className="text-rose-400 print:text-rose-700 font-bold">Insuffisant</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Pression moyenne de vapeur</td>
                      <td className="p-2 font-mono font-bold">{selectedCycleForPrint.pression} bars</td>
                      <td className="p-2 font-mono text-slate-400 print:text-gray-600">03 bars (Regnault)</td>
                      <td className="p-2">
                        {selectedCycleForPrint.pression >= 2.8 && selectedCycleForPrint.pression <= 3.2 ? (
                          <span className="text-emerald-400 print:text-emerald-700 font-bold">Conforme</span>
                        ) : (
                          <span className="text-rose-400 print:text-rose-700 font-bold">Hors tolérance</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Controls Checklist Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 print:bg-gray-100 border border-slate-700 print:border-gray-300">
                  <span className="text-[10px] text-slate-400 print:text-gray-500 font-bold uppercase block">
                    Test de Bowie et Dick :
                  </span>
                  <span className="font-bold text-slate-200 print:text-black">
                    {selectedCycleForPrint.bowieDickConforme === true
                      ? 'Conforme (virage homogène 134°C / 3mn30)'
                      : selectedCycleForPrint.bowieDickConforme === false
                      ? 'Non conforme (vapeur non pénétrante)'
                      : 'Non applicable ce cycle'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 print:bg-gray-100 border border-slate-700 print:border-gray-300">
                  <span className="text-[10px] text-slate-400 print:text-gray-500 font-bold uppercase block">
                    Témoin physico-chimique de passage :
                  </span>
                  <span className="font-bold text-slate-200 print:text-black">
                    {selectedCycleForPrint.resultatIndicateur === 'conforme'
                      ? 'Virage complet et homogène'
                      : 'Non viré / Virage incomplet'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 print:bg-gray-100 border border-slate-700 print:border-gray-300">
                  <span className="text-[10px] text-slate-400 print:text-gray-500 font-bold uppercase block">
                    Contrôle de siccité à chaud :
                  </span>
                  <span className="font-bold text-slate-200 print:text-black">
                    {selectedCycleForPrint.sicciteConforme
                      ? 'Absence de traces d’humidité (Conforme)'
                      : 'Présence d’humidité résiduelle (Rejeté)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 print:bg-gray-100 border border-slate-700 print:border-gray-300">
                  <span className="text-[10px] text-slate-400 print:text-gray-500 font-bold uppercase block">
                    Intégrité des emballages :
                  </span>
                  <span className="font-bold text-slate-200 print:text-black">
                    {selectedCycleForPrint.integriteEmballageConforme
                      ? 'Emballages intacts et hermétiques'
                      : 'Emballage détérioré / Décacheté'}
                  </span>
                </div>
              </div>

              {/* Composition */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 print:bg-gray-50 border border-slate-700 print:border-gray-300 text-xs">
                <span className="text-[10px] text-slate-400 print:text-gray-500 font-bold uppercase block">
                  Composition de la charge traitée :
                </span>
                <p className="font-semibold text-slate-200 print:text-black mt-0.5">
                  {selectedCycleForPrint.compositionCharge}
                </p>
              </div>

              {/* Observations & Anomalies */}
              {selectedCycleForPrint.observations && (
                <div className="p-2.5 rounded-xl bg-slate-800/80 print:bg-gray-50 border border-slate-700 print:border-gray-300 text-xs">
                  <span className="text-[10px] text-slate-400 print:text-gray-500 font-bold uppercase block">
                    Observations de l'Opérateur :
                  </span>
                  <p className="text-slate-300 print:text-black italic mt-0.5">
                    « {selectedCycleForPrint.observations} »
                  </p>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-700 print:border-gray-400 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-300 print:text-black">Visa de l'Opérateur Stérilisation</p>
                  <div className="h-16 border-b border-dashed border-slate-600 print:border-gray-400 mt-2" />
                  <p className="text-[10px] text-slate-400 print:text-gray-500 mt-1">
                    {selectedCycleForPrint.operateur}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-300 print:text-black">Visa du Médecin Chef / Responsable ESSP</p>
                  <div className="h-16 border-b border-dashed border-slate-600 print:border-gray-400 mt-2" />
                  <p className="text-[10px] text-slate-400 print:text-gray-500 mt-1">
                    Pour libération et conformité
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cycleToDelete}
        title="Supprimer ce cycle de stérilisation ?"
        message={`Voulez-vous vraiment supprimer la fiche du « ${cycleToDelete?.numeroCycle || ''} » du registre officiel de stérilisation ?`}
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={handleConfirmDeleteCycle}
        onCancel={() => setCycleToDelete(null)}
      />
    </div>
  );
};
