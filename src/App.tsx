/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { UpdateBanner } from './components/UpdateBanner';
import { useToast } from './context/ToastContext';
import { STORAGE_ERROR_EVENT } from './utils/safeStorage';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { TodayScreen } from './components/TodayScreen';
import { SaisirHub, SuiviHub, PlusHub } from './components/Hubs';
import { QuickAddSheet, AjoutRapide } from './components/QuickAddSheet';
import { SubScreen } from './components/SubScreen';
import { ProfilScreen, initiales } from './components/ProfilScreen';
import { AuditRunner } from './components/AuditRunner';
import { AuditDetailView } from './components/AuditDetailView';
import { AuditHistory } from './components/AuditHistory';
import { CorrectiveActionsList } from './components/CorrectiveActionsList';
const FichesView = lazy(() => import('./components/FichesView').then((m) => ({ default: m.FichesView })));
const SterilisationModule = lazy(() => import('./components/SterilisationModule').then((m) => ({ default: m.SterilisationModule })));
const DechetsModule = lazy(() => import('./components/DechetsModule').then((m) => ({ default: m.DechetsModule })));
const TableauDeBordModule = lazy(() => import('./components/TableauDeBordModule').then((m) => ({ default: m.TableauDeBordModule })));
import { PlanAnnuelModule } from './components/PlanAnnuelModule';
import { RegistresModule } from './components/RegistresModule';
import { JournalModule } from './components/JournalModule';
const CuisineModule = lazy(() => import('./components/CuisineModule').then((m) => ({ default: m.CuisineModule })));
const RapportMensuelModal = lazy(() => import('./components/RapportMensuelModal').then((m) => ({ default: m.RapportMensuelModal })));
import { UrgenceAesModal } from './components/UrgenceAesModal';
import { GlossaireModal } from './components/GlossaireModal';
import { AProposModal } from './components/AProposModal';
import { DataSettingsModal } from './components/DataSettingsModal';
import { TutorialModal } from './components/TutorialModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ConfigurationWizard } from './components/ConfigurationWizard';
import { storageService } from './services/storageService';
import { extrasService } from './services/extrasService';
import { RegistreId } from './data/thmData';
import { Audit, CorrectiveAction, ChecklistVersion } from './types';

type View =
  | 'home'
  | 'runner'
  | 'detail'
  | 'sterilisation'
  | 'dechets'
  | 'cuisine'
  | 'plan'
  | 'registre'
  | 'journal'
  | 'tableau_bord'
  | 'actions'
  | 'fiches'
  | 'reglages'
  | 'historique'
  | 'profil';

const TUTORIAL_KEY = 'essp_hygiene_tutorial_v1';

export default function App() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<NavTab>('accueil');
  const [currentView, setCurrentView] = useState<View>('home');
  const [registreId, setRegistreId] = useState<RegistreId>('eau');
  const [registreAuto, setRegistreAuto] = useState(false);
  const [journalEdit, setJournalEdit] = useState(false);
  const [auditResume, setAuditResume] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [cuisineTab, setCuisineTab] = useState<'releves' | 'audit' | 'fiches'>('releves');

  const [isAesOpen, setIsAesOpen] = useState(false);
  const [isGlossaireOpen, setIsGlossaireOpen] = useState(false);
  const [isAProposOpen, setIsAProposOpen] = useState(false);
  const [isRapportOpen, setIsRapportOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !storageService.hasCompletedOnboarding() || !storageService.profilComplet());
  const [premiereFois] = useState(() => !storageService.hasCompletedOnboarding());
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const closeTutorial = () => {
    try { localStorage.setItem(TUTORIAL_KEY, 'true'); } catch {}
    setIsTutorialOpen(false);
  };
  const openTutorialIfFirstTime = () => {
    let seen = false;
    try { seen = localStorage.getItem(TUTORIAL_KEY) === 'true'; } catch {}
    if (!seen) setIsTutorialOpen(true);
  };

  const [audits, setAudits] = useState<Audit[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [auditVersion, setAuditVersion] = useState<ChecklistVersion>('courte');
  const [focusComponent, setFocusComponent] = useState<string | undefined>(undefined);
  const [auditServiceTarget, setAuditServiceTarget] = useState<string | undefined>(undefined);

  useEffect(() => {
    const onStorageError = () =>
      showToast("Enregistrement impossible : mémoire de l'appareil pleine. Faites une sauvegarde et libérez de l'espace.", 'error');
    window.addEventListener(STORAGE_ERROR_EVENT, onStorageError);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, onStorageError);
  }, []);

  useEffect(() => {
    storageService.seedInitialDataIfEmpty();
    refreshData();
    void extrasService.notifierRappels();
  }, []);

  const refreshData = () => {
    setAudits(storageService.getAudits());
    setActions(storageService.getCorrectiveActions());
  };

  const go = (view: View) => {
    refreshData();
    setCurrentView(view);
    window.scrollTo({ top: 0 });
  };
  const back = () => go('home');

  const handleStartNewAudit = (version: ChecklistVersion = 'courte', compId?: string, defaultService?: string) => {
    setSelectedAudit(null);
    setAuditResume(false);
    setAuditVersion(version);
    setFocusComponent(compId);
    setAuditServiceTarget(defaultService);
    go('runner');
  };

  const handleResumeAudit = () => {
    const d = storageService.getAuditDraft();
    setSelectedAudit(null);
    setAuditResume(true);
    setAuditVersion(d?.version || 'courte');
    setFocusComponent(undefined);
    setAuditServiceTarget(undefined);
    go('runner');
  };

  const handleViewAudit = (auditId: string) => {
    const found = storageService.getAuditById(auditId);
    if (found) {
      setSelectedAudit(found);
      go('detail');
    }
  };

  const handleEditAudit = (audit: Audit) => {
    setSelectedAudit(audit);
    setAuditVersion(audit.version);
    setFocusComponent(undefined);
    go('runner');
  };

  const handleDeleteAudit = (auditId: string) => {
    storageService.deleteAudit(auditId);
    refreshData();
    if (selectedAudit?.id === auditId) {
      setSelectedAudit(null);
      setActiveTab('saisir');
      go('home');
    }
  };

  const handleSaveAudit = (savedAudit: Audit) => {
    refreshData();
    setSelectedAudit(savedAudit);
    go('detail');
  };

  const openRegistre = (id: RegistreId, auto = false) => {
    setRegistreId(id);
    setRegistreAuto(auto);
    go('registre');
  };
  const openCuisine = (tab: 'releves' | 'audit' | 'fiches') => {
    setCuisineTab(tab);
    go('cuisine');
  };

  const pickAjout = (k: AjoutRapide) => {
    setIsAddOpen(false);
    if (k === 'eau' || k === 'prelevements' || k === 'vecteurs' || k === 'sensibilisation') return openRegistre(k, true);
    if (k === 'sterilisation') return go('sterilisation');
    if (k === 'dechets') return go('dechets');
    if (k === 'cuisine') return openCuisine('releves');
    if (k === 'note') return go('journal');
    handleStartNewAudit('courte');
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    go('home');
  };

  const pendingActionsCount = actions.filter((a) => a.statut === 'a_faire' || a.statut === 'en_cours').length;

  const renderView = () => {
    switch (currentView) {
      case 'runner':
        return (
          <AuditRunner
            initialAudit={selectedAudit}
            defaultVersion={auditVersion}
            defaultService={auditServiceTarget}
            defaultFocusComponent={focusComponent}
            reprendre={auditResume}
            onSave={handleSaveAudit}
            onCancel={() => (selectedAudit ? go('detail') : back())}
          />
        );
      case 'detail':
        return selectedAudit ? (
          <AuditDetailView
            audit={selectedAudit}
            onBack={() => {
              setActiveTab('saisir');
              back();
            }}
            onEdit={handleEditAudit}
            onDelete={handleDeleteAudit}
          />
        ) : null;
      case 'sterilisation':
        return <SterilisationModule onBackToHome={back} />;
      case 'dechets':
        return <DechetsModule onBackToHome={back} />;
      case 'cuisine':
        return <CuisineModule onBackToHome={back} initialTab={cuisineTab} />;
      case 'plan':
        return (
          <PlanAnnuelModule
            onBackToHome={back}
            onOpenRegistres={() => {
              setActiveTab('saisir');
              back();
            }}
          />
        );
      case 'registre':
        return <RegistresModule registre={registreId} onBack={back} autoOpen={registreAuto} />;
      case 'journal':
        return <JournalModule onBackToHome={back} openEditor={journalEdit} />;
      case 'tableau_bord':
        return (
          <TableauDeBordModule
            onBackToHome={back}
            onOpenChecklists={() => go('historique')}
            onOpenSterilisation={() => go('sterilisation')}
            onOpenDechets={() => go('dechets')}
            onOpenActions={() => go('actions')}
          />
        );
      case 'actions':
        return (
          <SubScreen title="Actions correctives" onBack={back}>
            <CorrectiveActionsList actions={actions} onRefresh={refreshData} onViewAudit={handleViewAudit} />
          </SubScreen>
        );
      case 'fiches':
        return (
          <SubScreen title="Fiches pratiques" onBack={back}>
            <FichesView initialCategory="all" onStartAuditWithFocus={(compId) => handleStartNewAudit('courte', compId)} />
          </SubScreen>
        );
      case 'reglages':
        return (
          <SubScreen title="Réglages et sauvegarde" onBack={back}>
            <DataSettingsModal
              onDataChanged={refreshData}
              onOpenAPropos={() => setIsAProposOpen(true)}
              onOpenTutorial={() => setIsTutorialOpen(true)}
            />
          </SubScreen>
        );
      case 'profil':
        return (
          <SubScreen title="Mon profil" onBack={back}>
            <ProfilScreen
              onOpenAudit={handleViewAudit}
              onOpenRegistre={(id) => openRegistre(id)}
              onOpenType={(t) => {
                if (t === 'sterilisation') go('sterilisation');
                else if (t === 'dechets') go('dechets');
                else if (t === 'cuisine') openCuisine('releves');
                else if (t === 'action') go('actions');
                else go('journal');
              }}
            />
          </SubScreen>
        );
      case 'historique':
        return (
          <SubScreen title="Historique des audits" onBack={back}>
            <AuditHistory
              audits={audits}
              onNewAudit={(v) => handleStartNewAudit(v || 'courte')}
              onViewAudit={handleViewAudit}
              onEditAudit={handleEditAudit}
              onDeleteAudit={handleDeleteAudit}
            />
          </SubScreen>
        );
      default:
        break;
    }

    switch (activeTab) {
      case 'saisir':
        return (
          <SaisirHub
            nbAudits={audits.length}
            onJournal={() => go('journal')}
            onRegistre={(id) => openRegistre(id)}
            onSterilisation={() => go('sterilisation')}
            onDechets={() => go('dechets')}
            onCuisineReleves={() => openCuisine('releves')}
            onCuisineAudit={() => openCuisine('audit')}
            onAuditRapide={() => handleStartNewAudit('courte')}
            onAuditComplet={() => handleStartNewAudit('exhaustive')}
            onHistorique={() => go('historique')}
          />
        );
      case 'suivi':
        return (
          <SuiviHub
            nbActions={pendingActionsCount}
            onPlan={() => go('plan')}
            onActions={() => go('actions')}
            onRapport={() => setIsRapportOpen(true)}
            onTableauBord={() => go('tableau_bord')}
          />
        );
      case 'plus':
        return (
          <PlusHub
            nom={storageService.getSettings().userName || 'Mon profil'}
            initiales={initiales(storageService.getSettings().userName)}
            sousTitre={[storageService.getSettings().userRole, storageService.getSettings().etablissement].filter(Boolean).join(' · ') || 'Identité et historique'}
            onProfil={() => go('profil')}
            onConfigurer={() => setIsConfigOpen(true)}
            onFiches={() => go('fiches')}
            onGlossaire={() => setIsGlossaireOpen(true)}
            onAes={() => setIsAesOpen(true)}
            onReglages={() => go('reglages')}
            onTutoriel={() => setIsTutorialOpen(true)}
            onAPropos={() => setIsAProposOpen(true)}
          />
        );
      default:
        return (
          <TodayScreen
            actions={actions}
            onOpenJournal={() => { setJournalEdit(false); go('journal'); }}
            onAddTask={() => { setJournalEdit(true); go('journal'); }}
            onResumeAudit={handleResumeAudit}
            onConfigurer={() => setIsConfigOpen(true)}
            onOpenPlan={() => go('plan')}
            onOpenRegistre={openRegistre}
            onNewAudit={() => handleStartNewAudit('courte')}
            onOpenActions={() => go('actions')}
            onOpenReglages={() => go('reglages')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface text-main flex flex-col font-body antialiased selection:bg-[#1F5A43] selection:text-white transition-colors duration-200">
      <Header
        onOpenSettings={() => go('reglages')}
        onOpenAPropos={() => setIsAProposOpen(true)}
        onGoHome={() => handleTabChange('accueil')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 safe-bottom">
        <Suspense fallback={<p className="text-sub text-sm py-10 text-center" role="status">Chargement…</p>}>{renderView()}</Suspense>
      </main>

      <UpdateBanner />
      <UrgenceAesModal isOpen={isAesOpen} onClose={() => setIsAesOpen(false)} />
      <GlossaireModal isOpen={isGlossaireOpen} onClose={() => setIsGlossaireOpen(false)} />
      <AProposModal isOpen={isAProposOpen} onClose={() => setIsAProposOpen(false)} />
      {isRapportOpen && (
        <Suspense fallback={null}>
          <RapportMensuelModal isOpen={isRapportOpen} onClose={() => setIsRapportOpen(false)} />
        </Suspense>
      )}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          refreshData();
          if (premiereFois && !storageService.getSettings().configure) setIsConfigOpen(true);
          else openTutorialIfFirstTime();
        }}
      />
      <ConfigurationWizard
        isOpen={isConfigOpen}
        onClose={() => {
          setIsConfigOpen(false);
          try { localStorage.setItem('essp_hygiene_config_dismiss_v1', '1'); } catch {}
          refreshData();
          openTutorialIfFirstTime();
        }}
        onDone={() => {
          setIsConfigOpen(false);
          refreshData();
          handleTabChange('accueil');
          openTutorialIfFirstTime();
        }}
      />
      <QuickAddSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onPick={pickAjout} />
      <TutorialModal isOpen={isTutorialOpen} onClose={closeTutorial} />

      {currentView !== 'runner' && (
        <BottomNav activeTab={activeTab} onChangeTab={handleTabChange} onAdd={() => setIsAddOpen(true)} pendingActionsCount={pendingActionsCount} />
      )}
    </div>
  );
}
