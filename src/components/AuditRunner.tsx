import React, { useState, useMemo } from 'react';
import {
  Check,
  X,
  Minus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Calendar,
  Building,
  User,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Audit, ChecklistVersion, ComplianceValue, AuditItemResponse, ActionStatus } from '../types';
import { getChecklist, getAllItemsForVersion } from '../data/checklistsData';
import { storageService } from '../services/storageService';
import { useToast } from '../context/ToastContext';

interface AuditRunnerProps {
  initialAudit?: Audit | null;
  defaultVersion?: ChecklistVersion;
  defaultService?: string;
  defaultFocusComponent?: string;
  onSave: (savedAudit: Audit) => void;
  onCancel: () => void;
}

const QUICK_OBSERVATIONS = [
  'Conforme aux normes',
  'Rupture de stock consommables',
  'Matériel défectueux ou usagé',
  'Protocole non affiché / non respecté',
  'Besoin de sensibilisation du personnel',
  'En attente de réapprovisionnement',
  'Local non verrouillé ou encombré',
];

const DEFAULT_RESPONSABLES = [
  'Agent de bio-nettoyage',
  'Infirmier Chef de Service',
  'Responsable de l’Unité de Stérilisation',
  'Point focal DMP / Société prestataire',
  'Médecin Chef de l’ESSP',
  'Technicien d’hygiène du milieu',
  'Responsable Pharmacie',
];

export const AuditRunner: React.FC<AuditRunnerProps> = ({
  initialAudit,
  defaultVersion = 'courte',
  defaultService,
  defaultFocusComponent,
  onSave,
  onCancel,
}) => {
  const { showToast } = useToast();
  const settings = storageService.getSettings();
  const availableServices = storageService.getServices();

  // Audit metadata state
  const [version, setVersion] = useState<ChecklistVersion>(
    initialAudit?.version || defaultVersion
  );
  const [service, setService] = useState<string>(
    initialAudit?.service || defaultService || availableServices[0] || 'Salle de Soins'
  );
  const [newServiceInput, setNewServiceInput] = useState('');
  const [showAddService, setShowAddService] = useState(false);

  const [date, setDate] = useState<string>(
    initialAudit?.date || new Date().toISOString().split('T')[0]
  );
  const [auditeur, setAuditeur] = useState<string>(
    initialAudit?.auditeur || settings.userName || settings.auditeurDefaut || ''
  );
  const [etablissement, setEtablissement] = useState<string>(
    initialAudit?.etablissement || settings.etablissement || ''
  );
  const [commentairesGeneraux, setCommentairesGeneraux] = useState<string>(
    initialAudit?.commentairesGeneraux || ''
  );

  // Responses state { [itemId]: { itemId, value, observation } }
  const [responses, setResponses] = useState<Record<string, AuditItemResponse>>(
    initialAudit?.responses || {}
  );

  // Inline corrective action overrides for items answered 'non'
  const [actionOverrides, setActionOverrides] = useState<
    Record<string, { description?: string; responsable?: string; echeance?: string; statut?: ActionStatus }>
  >({});

  // Active component navigation
  const template = useMemo(() => getChecklist(version), [version]);
  const [activeCompIndex, setActiveCompIndex] = useState(() => {
    if (defaultFocusComponent) {
      const idx = template.composantes.findIndex((c) => c.id === defaultFocusComponent);
      if (idx >= 0) return idx;
    }
    return 0;
  });

  const activeComponent = template.composantes[activeCompIndex] || template.composantes[0];

  // Calculate live score
  const liveScores = useMemo(() => {
    return storageService.calculateScores(responses, version);
  }, [responses, version]);

  const activeCompScore = liveScores.scoresParComposante[activeComponent.id];

  // Count answered items
  const allItems = useMemo(() => getAllItemsForVersion(version), [version]);
  const totalItemsCount = allItems.length;
  const answeredCount = Object.values(responses).filter((r) => r.value !== null).length;
  const progressPercent = Math.round((answeredCount / (totalItemsCount || 1)) * 100);

  // Helper to handle response changes
  const handleItemValueChange = (itemId: string, value: ComplianceValue) => {
    setResponses((prev) => {
      const existing = prev[itemId] || { itemId, value: null, observation: '' };
      return {
        ...prev,
        [itemId]: {
          ...existing,
          value,
        },
      };
    });
  };

  const handleItemObsChange = (itemId: string, observation: string) => {
    setResponses((prev) => {
      const existing = prev[itemId] || { itemId, value: null, observation: '' };
      return {
        ...prev,
        [itemId]: {
          ...existing,
          observation,
        },
      };
    });
  };

  // Add new service
  const handleAddNewService = () => {
    if (newServiceInput.trim()) {
      storageService.addService(newServiceInput.trim());
      setService(newServiceInput.trim());
      setNewServiceInput('');
      setShowAddService(false);
      showToast('Nouveau service ajouté', 'success');
    }
  };

  // Save audit
  const handleSaveAudit = (isDraft = false) => {
    const defaultTitle = `${template.tableauNumero} - ${service} (${date})`;
    const saved = storageService.saveAudit({
      id: initialAudit?.id,
      titre: initialAudit?.titre || defaultTitle,
      version,
      service,
      date,
      auditeur,
      etablissement,
      responses,
      commentairesGeneraux,
      createdAt: initialAudit?.createdAt || new Date().toISOString(),
    });

    // If there were explicit overrides in actionOverrides, update those actions
    for (const [itemId, override] of Object.entries(actionOverrides)) {
      if (responses[itemId]?.value === 'non') {
        const actionId = `act_${saved.id}_${itemId}`;
        const allActs = storageService.getCorrectiveActions();
        const act = allActs.find((a) => a.id === actionId);
        if (act) {
          storageService.saveCorrectiveAction({
            ...act,
            ...(override.description ? { description: override.description } : {}),
            ...(override.responsable ? { responsable: override.responsable } : {}),
            ...(override.echeance ? { echeance: override.echeance } : {}),
            ...(override.statut ? { statut: override.statut } : {}),
          });
        }
      }
    }

    showToast(isDraft ? 'Brouillon enregistré' : 'Audit enregistré avec succès !', 'success');
    onSave(saved);
  };

  // Render individual check-list item
  const renderItemCard = (item: { id: string; titre: string; explication?: string }, index?: number) => {
    const currentResp = responses[item.id] || { itemId: item.id, value: null, observation: '' };
    const currentValue = currentResp.value;
    const currentObs = currentResp.observation;
    const isNon = currentValue === 'non';
    const isOui = currentValue === 'oui';
    const isNa = currentValue === 'na';

    // Action override for this item
    const currentOverride = actionOverrides[item.id] || {};

    return (
      <div
        key={item.id}
        className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
          isOui
            ? 'bg-card border-emerald-300 dark:border-emerald-800/80 shadow-soft ring-1 ring-emerald-400/20'
            : isNon
            ? 'bg-card border-rose-300 dark:border-rose-800/80 shadow-soft ring-1 ring-rose-400/30'
            : isNa
            ? 'bg-card-subtle/70 border-soft'
            : 'bg-card border-soft shadow-soft hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {/* Header: Criterion index and reference */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/60">
              Critère {item.id.replace('crit_', '').replace('long_', '')}
            </span>
            <span className="text-[11px] text-sub font-medium">Guide ESSP 2021</span>
          </div>

          {currentValue && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isOui
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                  : isNon
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isOui ? 'Conforme' : isNon ? 'Non conforme' : 'Non applicable'}
            </span>
          )}
        </div>

        {/* Item Title */}
        <p className="font-heading font-semibold text-base text-main leading-snug mb-4">
          {item.titre}
        </p>

        {/* Three Large Segmented Buttons: Oui / Non / N/A (Min 48px height) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* OUI Button */}
          <button
            type="button"
            onClick={() => handleItemValueChange(item.id, 'oui')}
            className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 select-none ${
              isOui
                ? 'bg-[#16A34A] text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-400'
                : 'bg-card-subtle text-sub hover:text-main hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-soft'
            }`}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Oui</span>
          </button>

          {/* NON Button */}
          <button
            type="button"
            onClick={() => handleItemValueChange(item.id, 'non')}
            className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 select-none ${
              isNon
                ? 'bg-[#DC2626] text-white shadow-md shadow-rose-900/20 ring-2 ring-rose-400'
                : 'bg-card-subtle text-sub hover:text-main hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-soft'
            }`}
          >
            <X className="w-5 h-5 stroke-[2.5]" />
            <span>Non</span>
          </button>

          {/* N/A Button */}
          <button
            type="button"
            onClick={() => handleItemValueChange(item.id, 'na')}
            className={`min-h-[48px] px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-95 select-none ${
              isNa
                ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-md ring-2 ring-slate-400'
                : 'bg-card-subtle text-sub hover:text-main hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-soft'
            }`}
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
            <span>N/A</span>
          </button>
        </div>

        {/* Collapsible Observation Field (auto-opens if 'non' or if observation exists) */}
        <div className="mt-3.5 pt-3 border-t border-soft/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-sub flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              <span>Observation terrain {isNon && <span className="text-rose-500">*</span>}</span>
            </label>
            {isNon && (
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                Action corrective automatique
              </span>
            )}
          </div>

          <input
            type="text"
            placeholder={
              isNon
                ? 'Précisez le constat (ex: Manque de savon liquide, flacon SHA vide...)'
                : 'Observation ou note particulière...'
            }
            value={currentObs}
            onChange={(e) => handleItemObsChange(item.id, e.target.value)}
            className="w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl bg-card-subtle/80 border border-soft text-main placeholder-slate-400 focus:outline-none focus:border-[#0F766E] transition"
          />

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {QUICK_OBSERVATIONS.slice(0, 4).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  handleItemObsChange(
                    item.id,
                    currentObs ? `${currentObs} - ${chip}` : chip
                  )
                }
                className="shrink-0 px-2.5 py-1 rounded-lg bg-card-subtle hover:bg-slate-200 dark:hover:bg-slate-700 text-sub hover:text-main text-xs border border-soft transition"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Automatic Action Corrective Card when 'NON' is selected */}
        {isNon && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Action corrective à planifier
              </span>
              <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                Plan d'action
              </span>
            </div>

            {/* Editable Assignee & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Responsable désigné :
                </label>
                <select
                  value={
                    currentOverride.responsable ||
                    (activeComponent.id === 'sterilisation'
                      ? 'Responsable de l’Unité de Stérilisation'
                      : activeComponent.id === 'dechets_dmp'
                      ? 'Point focal DMP / Société prestataire'
                      : 'Infirmier Responsable du Service')
                  }
                  onChange={(e) =>
                    setActionOverrides((prev) => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], responsable: e.target.value },
                    }))
                  }
                  className="w-full min-h-[40px] text-xs px-2.5 py-1.5 rounded-lg bg-card border border-rose-300 dark:border-rose-900/80 text-main focus:outline-none focus:border-rose-500"
                >
                  {DEFAULT_RESPONSABLES.map((resp, i) => (
                    <option key={i} value={resp}>
                      {resp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Échéance préconisée :
                </label>
                <input
                  type="date"
                  value={
                    currentOverride.echeance ||
                    (() => {
                      const d = new Date(date);
                      d.setDate(d.getDate() + 7);
                      return d.toISOString().split('T')[0];
                    })()
                  }
                  onChange={(e) =>
                    setActionOverrides((prev) => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], echeance: e.target.value },
                    }))
                  }
                  className="w-full min-h-[40px] text-xs px-2.5 py-1.5 rounded-lg bg-card border border-rose-300 dark:border-rose-900/80 text-main focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-32">
      {/* 1. STICKY TOP PROGRESS BAR & LIVE SCORE */}
      <div className="sticky top-[57px] z-20 bg-white/95 dark:bg-[#12202A]/95 backdrop-blur-md -mx-3 px-3 py-3 sm:-mx-4 sm:px-4 border-b border-soft shadow-soft">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            onClick={onCancel}
            className="min-h-[40px] flex items-center gap-1 text-xs font-semibold text-sub hover:text-main px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>

          {/* Live Score Ring/Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-sub hidden xs:inline">Score en direct :</span>
            <div
              className={`px-3 py-1 rounded-full font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs border ${
                answeredCount === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  : liveScores.scoreGlobal >= 80
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : liveScores.scoreGlobal >= 50
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
              <span>{answeredCount === 0 ? 'Pas encore évalué' : `${liveScores.scoreGlobal}% Conforme`}</span>
            </div>
          </div>

          {/* Quick Draft Save */}
          <button
            onClick={() => handleSaveAudit(true)}
            className="min-h-[40px] flex items-center gap-1.5 bg-slate-100 dark:bg-[#172B38] hover:bg-slate-200 dark:hover:bg-[#19303F] text-slate-700 dark:text-slate-200 border border-soft font-semibold text-xs px-3 py-1.5 rounded-xl transition active:scale-95"
            title="Enregistrer le travail actuel comme brouillon"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Brouillon</span>
          </button>
        </div>

        {/* Live Progress Bar with smooth teal fill */}
        <div className="mt-2.5 max-w-4xl mx-auto space-y-1">
          <div className="flex items-center justify-between text-[11px] text-sub">
            <span className="font-semibold text-main">
              {answeredCount} sur {totalItemsCount} critères évalués
            </span>
            <span className="font-bold text-[#0F766E] dark:text-teal-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. AUDIT CONFIGURATION SECTION (SERVICE, VERSION, DATE) */}
      <div className="rounded-2xl bg-card border border-soft p-4 sm:p-5 space-y-4 shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Version Selector */}
          <div>
            <label className="text-xs font-bold text-main flex items-center gap-1.5 mb-1.5">
              <Layers className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              <span>Version de check-list</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-card-subtle rounded-xl border border-soft">
              <button
                type="button"
                onClick={() => setVersion('courte')}
                className={`min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-lg transition ${
                  version === 'courte'
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'text-sub hover:text-main'
                }`}
              >
                Tableau 20 (Court)
              </button>
              <button
                type="button"
                onClick={() => setVersion('exhaustive')}
                className={`min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-lg transition ${
                  version === 'exhaustive'
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'text-sub hover:text-main'
                }`}
              >
                Tableau 21 (Complet)
              </button>
            </div>
          </div>

          {/* Service audité */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-main flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
                <span>Service audité</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddService(!showAddService)}
                className="text-xs text-[#0F766E] dark:text-teal-400 font-semibold hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau</span>
              </button>
            </div>

            {showAddService ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Nom du nouveau service..."
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  className="w-full min-h-[44px] text-xs px-3 py-2 rounded-xl bg-card border border-[#0F766E] text-main focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNewService}
                  className="px-3 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold"
                >
                  OK
                </button>
              </div>
            ) : (
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full min-h-[44px] text-xs sm:text-sm px-3 py-2 rounded-xl bg-card border border-soft text-main focus:outline-none focus:border-[#0F766E]"
              >
                {availableServices.map((srv, idx) => (
                  <option key={idx} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-main flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              <span>Date d'évaluation</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-[44px] text-xs sm:text-sm px-3 py-2 rounded-xl bg-card border border-soft text-main focus:outline-none focus:border-[#0F766E]"
            />
          </div>
        </div>

        {/* Auditeur & Établissement (expandable / compact) */}
        <div className="pt-3 border-t border-soft grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-sub block text-xs mb-1 font-medium">Technicien / Auditeur :</span>
            <input
              type="text"
              value={auditeur}
              onChange={(e) => setAuditeur(e.target.value)}
              className="w-full min-h-[40px] text-xs px-3 py-1.5 bg-card rounded-xl border border-soft text-main"
              placeholder="Technicien d'hygiène..."
            />
          </div>
          <div>
            <span className="text-sub block text-xs mb-1 font-medium">Établissement de soins :</span>
            <input
              type="text"
              value={etablissement}
              onChange={(e) => setEtablissement(e.target.value)}
              className="w-full min-h-[40px] text-xs px-3 py-1.5 bg-card rounded-xl border border-soft text-main"
              placeholder="Nom de l'établissement..."
            />
          </div>
        </div>
      </div>

      {/* 3. COMPONENT NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        {template.composantes.map((comp, idx) => {
          const compScore = liveScores.scoresParComposante[comp.id];
          const isSelected = idx === activeCompIndex;

          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => setActiveCompIndex(idx)}
              className={`min-h-[44px] shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border select-none ${
                isSelected
                  ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm'
                  : 'bg-card text-sub border-soft hover:bg-card-subtle'
              }`}
            >
              <span>{comp.titre}</span>
              {compScore && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : compScore.score >= 80
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                      : compScore.score >= 50
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {compScore.score}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. ACTIVE COMPONENT HEADER */}
      <div className="rounded-2xl bg-card border border-soft p-4 sm:p-5 flex items-center justify-between gap-3 shadow-soft">
        <div>
          <span className="text-xs font-bold text-[#0F766E] dark:text-teal-400 uppercase tracking-wider">
            Composante {activeCompIndex + 1} sur {template.composantes.length}
          </span>
          <h3 className="font-heading font-bold text-lg text-main mt-0.5">
            {activeComponent.titre}
          </h3>
          {activeComponent.description && (
            <p className="text-xs text-sub mt-1 leading-relaxed">{activeComponent.description}</p>
          )}
        </div>

        {activeCompScore && (
          <div className="text-end shrink-0">
            <div
              className={`font-heading text-2xl font-black ${
                activeCompScore.score >= 80
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : activeCompScore.score >= 50
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {activeCompScore.score}%
            </div>
            <div className="text-[11px] text-sub mt-0.5">
              {activeCompScore.ouiCount} Oui • {activeCompScore.nonCount} Non
            </div>
          </div>
        )}
      </div>

      {/* 5. CHECKLIST ITEMS FOR ACTIVE COMPONENT */}
      <div className="space-y-4">
        {activeComponent.items && (
          <div className="space-y-3.5">
            {activeComponent.items.map((item, i) => renderItemCard(item, i))}
          </div>
        )}

        {activeComponent.sousCategories && (
          <div className="space-y-5">
            {activeComponent.sousCategories.map((sc) => (
              <div key={sc.id} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-4 rounded-full bg-[#0F766E] dark:bg-teal-400" />
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-main">
                    {sc.titre}
                  </h4>
                </div>
                <div className="space-y-3">
                  {sc.items.map((item, i) => renderItemCard(item, i))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. OVERALL CONCLUSIONS & COMMENTS */}
      <div className="rounded-2xl bg-card border border-soft p-4 sm:p-5 shadow-soft">
        <label className="text-xs font-bold text-main flex items-center gap-1.5 mb-2">
          <FileText className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
          <span>Conclusions & Commentaires généraux de l'audit</span>
        </label>
        <textarea
          rows={3}
          value={commentairesGeneraux}
          onChange={(e) => setCommentairesGeneraux(e.target.value)}
          placeholder="Ex : Propreté générale satisfaisante. Points d'amélioration prioritaires : conformité de l'autoclave et réapprovisionnement en savon antiseptique..."
          className="w-full text-xs sm:text-sm p-3.5 rounded-xl bg-card-subtle/80 border border-soft text-main placeholder-slate-400 focus:outline-none focus:border-[#0F766E]"
        />
      </div>

      {/* 7. BOTTOM STICKY ACTION BAR */}
      <div className="fixed bottom-0 start-0 end-0 z-30 bg-white/95 dark:bg-[#12202A]/95 backdrop-blur-md border-t border-soft p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-floating no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5">
          {/* Previous component */}
          <button
            type="button"
            disabled={activeCompIndex === 0}
            onClick={() => setActiveCompIndex((i) => Math.max(0, i - 1))}
            className="min-h-[48px] flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card-subtle hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-main font-bold text-xs transition border border-soft"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Précédent</span>
          </button>

          {/* Component counter */}
          <span className="text-xs font-semibold text-sub">
            {activeCompIndex + 1} / {template.composantes.length}
          </span>

          {/* Next component or Finalize */}
          <div className="flex items-center gap-2">
            {activeCompIndex < template.composantes.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setActiveCompIndex((i) => Math.min(template.composantes.length - 1, i + 1))
                }
                className="min-h-[48px] flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs sm:text-sm transition shadow-sm active:scale-95"
              >
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveAudit(false)}
                className="min-h-[48px] flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#16A34A] hover:from-[#115E59] hover:to-[#15803D] text-white font-bold text-xs sm:text-sm transition shadow-md active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terminer & Enregistrer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
