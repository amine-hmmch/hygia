import React, { useState, useMemo } from 'react';
import {
  Check,
  X,
  Minus,
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
import { getRecommandation, addDays, PRIORITE_LABEL, Priorite } from '../data/planActionData';
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
  'Médecin chef de l’établissement',
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
    Record<string, { description?: string; responsable?: string; echeance?: string; statut?: ActionStatus; priorite?: Priorite }>
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
            ...(override.priorite ? { priorite: override.priorite } : {}),
          });
        }
      }
    }

    showToast(isDraft ? 'Brouillon enregistré' : 'Audit enregistré avec succès !', 'success');
    onSave(saved);
  };

  const fieldCls =
    'w-full min-h-[44px] px-3 py-2 rounded-lg bg-card border border-medium text-main text-[15px] focus:outline-none focus:border-primary';
  const smallField =
    'w-full min-h-[40px] text-[13px] px-2.5 py-1.5 rounded-lg bg-card border border-medium text-main focus:outline-none focus:border-primary';

  const scoreTone = (n: number) => (n >= 80 ? 'text-success' : n >= 50 ? 'text-warning' : 'text-danger');

  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  // Une ligne de check-list
  const renderItemCard = (item: { id: string; titre: string; explication?: string }) => {
    const currentResp = responses[item.id] || { itemId: item.id, value: null, observation: '' };
    const v = currentResp.value;
    const isNon = v === 'non';
    const noteOpen = isNon || !!currentResp.observation || openNotes[item.id];
    const currentOverride = actionOverrides[item.id] || {};

    const choice = (val: 'oui' | 'non' | 'na', label: string, Icon: React.ElementType) => {
      const active = v === val;
      const tone = !active
        ? 'border-soft text-sub'
        : val === 'oui'
        ? 'bg-success-tint text-success border-[var(--color-success)]'
        : val === 'non'
        ? 'bg-danger-tint text-danger border-danger'
        : 'bg-card-subtle text-main border-medium';
      return (
        <button
          type="button"
          onClick={() => handleItemValueChange(item.id, val)}
          aria-pressed={active}
          className={`h-11 rounded-lg border text-[14px] font-medium flex items-center justify-center gap-1.5 transition active:scale-[0.97] select-none ${tone}`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      );
    };

    return (
      <div key={item.id} className="row-rule py-4">
        <p className="text-[15px] text-main leading-snug mb-3">{item.titre}</p>

        <div className="grid grid-cols-3 gap-2">
          {choice('oui', 'Oui', Check)}
          {choice('non', 'Non', X)}
          {choice('na', 'N/A', Minus)}
        </div>

        {!noteOpen && (
          <button
            type="button"
            onClick={() => setOpenNotes((p) => ({ ...p, [item.id]: true }))}
            className="mt-2 text-[12px] text-sub flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Ajouter une note
          </button>
        )}

        {noteOpen && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder={isNon ? 'Constat (ex. flacon de SHA vide)' : 'Note'}
              value={currentResp.observation}
              onChange={(e) => handleItemObsChange(item.id, e.target.value)}
              className={fieldCls}
            />
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_OBSERVATIONS.slice(0, 4).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleItemObsChange(item.id, currentResp.observation ? `${currentResp.observation} - ${chip}` : chip)
                  }
                  className="shrink-0 px-2.5 py-1 rounded-md border border-soft text-[12px] text-sub"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {isNon && (() => {
          const reco = getRecommandation(item.id, item.titre, activeComponent.id);
          const setOv = (patch: Record<string, string>) =>
            setActionOverrides((prev) => ({ ...prev, [item.id]: { ...prev[item.id], ...patch } }));
          const resp = currentOverride.responsable || reco.responsable;
          const options = DEFAULT_RESPONSABLES.includes(resp) ? DEFAULT_RESPONSABLES : [resp, ...DEFAULT_RESPONSABLES];
          return (
            <div className="mt-3 border-s-2 border-danger ps-3 space-y-2.5">
              <p className="label-caps" style={{ color: 'var(--color-danger)' }}>Plan d’action</p>
              <div>
                <label className="text-[12px] text-sub block mb-1">Mesure recommandée (modifiable)</label>
                <textarea
                  rows={3}
                  value={currentOverride.description ?? reco.mesure}
                  onChange={(e) => setOv({ description: e.target.value })}
                  className={`${smallField} leading-snug`}
                />
                <p className="text-[11px] text-sub mt-1">Source : {reco.source}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[12px] text-sub block mb-1">Responsable</label>
                  <select value={resp} onChange={(e) => setOv({ responsable: e.target.value })} className={smallField}>
                    {options.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-sub block mb-1">Échéance</label>
                  <input
                    type="date"
                    value={currentOverride.echeance || addDays(date, reco.delaiJours)}
                    onChange={(e) => setOv({ echeance: e.target.value })}
                    className={smallField}
                  />
                </div>
                <div>
                  <label className="text-[12px] text-sub block mb-1">Priorité</label>
                  <select
                    value={currentOverride.priorite || reco.priorite}
                    onChange={(e) => setOv({ priorite: e.target.value })}
                    className={smallField}
                  >
                    {(Object.keys(PRIORITE_LABEL) as Priorite[]).map((k) => (
                      <option key={k} value={k}>{PRIORITE_LABEL[k]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const isLast = activeCompIndex === template.composantes.length - 1;

  return (
    <div className="space-y-5 pb-32">
      {/* Barre de progression collante */}
      <div className="sticky top-[57px] z-20 bg-surface -mx-4 px-4 pt-2 pb-2.5 border-b border-soft">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button onClick={onCancel} className="h-10 -ms-2 px-2 flex items-center gap-1 text-[14px] text-sub">
            <ChevronLeft className="w-4 h-4" />
            Retour
          </button>
          <p className={`font-serif-display leading-none ${answeredCount === 0 ? 'text-muted-custom' : scoreTone(liveScores.scoreGlobal)}`}>
            <span className="text-[26px]">{answeredCount === 0 ? '—' : liveScores.scoreGlobal}</span>
            {answeredCount > 0 && <span className="text-sm ms-0.5 text-sub">%</span>}
          </p>
          <button
            onClick={() => handleSaveAudit(true)}
            className="h-10 -me-2 px-2 flex items-center gap-1.5 text-[14px] text-sub"
            title="Enregistrer comme brouillon"
          >
            <Save className="w-4 h-4" />
            Brouillon
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-1.5">
          <div className="flex justify-between text-[11px] text-sub mb-1">
            <span>{answeredCount} sur {totalItemsCount} points</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="h-1 bg-card-subtle rounded">
            <div className="h-1 bg-primary rounded transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Informations de l'audit */}
      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-1 p-1 bg-card-subtle rounded-lg">
          {(['courte', 'exhaustive'] as ChecklistVersion[]).map((vv) => (
            <button
              key={vv}
              type="button"
              onClick={() => setVersion(vv)}
              className={`h-10 rounded-md text-[13px] font-medium ${
                version === vv ? 'bg-card text-main border border-medium' : 'text-sub'
              }`}
            >
              {vv === 'courte' ? 'Audit rapide' : 'Audit complet'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="label-caps">Service</span>
              <button type="button" onClick={() => setShowAddService(!showAddService)} className="text-[12px] text-primary font-medium">
                + Nouveau
              </button>
            </div>
            {showAddService ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Nom du service"
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  className={fieldCls}
                />
                <button type="button" onClick={handleAddNewService} className="px-4 rounded-lg bg-primary text-white dark:text-[#10201a] text-sm font-medium">
                  OK
                </button>
              </div>
            ) : (
              <select value={service} onChange={(e) => setService(e.target.value)} className={fieldCls}>
                {availableServices.map((srv, idx) => (
                  <option key={idx} value={srv}>{srv}</option>
                ))}
              </select>
            )}
          </div>
          <label className="block">
            <span className="label-caps block mb-1">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls} />
          </label>
          <label className="block">
            <span className="label-caps block mb-1">Auditeur</span>
            <input type="text" value={auditeur} onChange={(e) => setAuditeur(e.target.value)} placeholder="Nom, fonction" className={fieldCls} />
          </label>
        </div>
        {!settings.etablissement && (
          <label className="block">
            <span className="label-caps block mb-1">Établissement</span>
            <input type="text" value={etablissement} onChange={(e) => setEtablissement(e.target.value)} placeholder="Nom de l’établissement" className={fieldCls} />
          </label>
        )}
      </section>

      {/* Rubriques */}
      <div className="-mx-4 px-4 border-b border-soft flex gap-5 overflow-x-auto no-scrollbar">
        {template.composantes.map((comp, idx) => {
          const sel = idx === activeCompIndex;
          const sc = liveScores.scoresParComposante[comp.id];
          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => setActiveCompIndex(idx)}
              className={`shrink-0 h-11 text-[14px] border-b-2 -mb-px flex items-center gap-1.5 ${
                sel ? 'border-primary text-primary font-medium' : 'border-transparent text-sub'
              }`}
            >
              {comp.titre}
              {sc && sc.ouiCount + sc.nonCount > 0 && (
                <span className={`font-mono text-[11px] ${scoreTone(sc.score)}`}>{sc.score}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* En-tête de la rubrique */}
      <div>
        <p className="label-caps">Rubrique {activeCompIndex + 1} sur {template.composantes.length}</p>
        <h3 className="font-serif-display text-[22px] leading-tight text-main mt-1">{activeComponent.titre}</h3>
        {activeComponent.description && (
          <p className="text-[13px] text-sub mt-1 leading-snug">{activeComponent.description}</p>
        )}
      </div>

      {/* Points */}
      <div>
        {activeComponent.items && <div className="border-t border-medium">{activeComponent.items.map((item) => renderItemCard(item))}</div>}
        {activeComponent.sousCategories &&
          activeComponent.sousCategories.map((sc) => (
            <div key={sc.id} className="mb-4">
              <h4 className="label-caps pb-2 border-b border-medium">{sc.titre}</h4>
              <div>{sc.items.map((item) => renderItemCard(item))}</div>
            </div>
          ))}
      </div>

      {/* Conclusion (dernière rubrique) */}
      {isLast && (
        <label className="block">
          <span className="label-caps block mb-1">Conclusion de l’audit</span>
          <textarea
            rows={3}
            value={commentairesGeneraux}
            onChange={(e) => setCommentairesGeneraux(e.target.value)}
            placeholder="Points forts, points à améliorer en priorité"
            className={`${fieldCls} leading-snug`}
          />
        </label>
      )}

      {/* Barre du bas */}
      <div className="fixed bottom-0 start-0 end-0 z-30 bg-surface border-t border-soft p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] no-print">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5">
          <button
            type="button"
            disabled={activeCompIndex === 0}
            onClick={() => setActiveCompIndex((i) => Math.max(0, i - 1))}
            aria-label="Rubrique précédente"
            className="h-12 w-12 rounded-lg border border-medium text-main flex items-center justify-center disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-mono text-[12px] text-sub w-12 text-center">
            {activeCompIndex + 1}/{template.composantes.length}
          </span>
          {!isLast ? (
            <button
              type="button"
              onClick={() => setActiveCompIndex((i) => Math.min(template.composantes.length - 1, i + 1))}
              className="flex-1 h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSaveAudit(false)}
              className="flex-1 h-12 rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Terminer l’audit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
