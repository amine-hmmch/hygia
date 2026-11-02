/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { AuditRunner } from './components/AuditRunner';
import { AuditDetailView } from './components/AuditDetailView';
import { AuditHistory } from './components/AuditHistory';
import { CorrectiveActionsList } from './components/CorrectiveActionsList';
import { FichesView } from './components/FichesView';
import { SterilisationModule } from './components/SterilisationModule';
import { DechetsModule } from './components/DechetsModule';
import { TableauDeBordModule } from './components/TableauDeBordModule';
import { UrgenceAesModal } from './components/UrgenceAesModal';
import { GlossaireModal } from './components/GlossaireModal';
import { AProposModal } from './components/AProposModal';
import { DataSettingsModal } from './components/DataSettingsModal';
import { ComingSoonModal, ComingSoonTopic } from './components/ComingSoonModal';
import { OnboardingModal } from './components/OnboardingModal';
import { storageService } from './services/storageService';
import { Audit, CorrectiveAction, ChecklistVersion } from './types';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('accueil');
  const [currentView, setCurrentView] = useState<
    'home' | 'runner' | 'detail' | 'sterilisation' | 'dechets' | 'tableau_bord'
  >('home');

  // Modals state
  const [isAesOpen, setIsAesOpen] = useState(false);
  const [isGlossaireOpen, setIsGlossaireOpen] = useState(false);
  const [isAProposOpen, setIsAProposOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !storageService.hasCompletedOnboarding());

  // Audit data state
  const [audits, setAudits] = useState<Audit[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [auditVersion, setAuditVersion] = useState<ChecklistVersion>('courte');
  const [focusComponent, setFocusComponent] = useState<string | undefined>(undefined);
  const [auditServiceTarget, setAuditServiceTarget] = useState<string | undefined>(undefined);

  // Fiches Category filter state
  const [fichesCategory, setFichesCategory] = useState<
    'all' | 'mains' | 'epi' | 'locaux' | 'favoris' | 'tableaux'
  >('all');

  // Coming soon modal topic
  const [comingSoonTopic, setComingSoonTopic] = useState<ComingSoonTopic | null>(null);

  // Initial load & seed
  useEffect(() => {
    storageService.seedInitialDataIfEmpty();
    refreshData();
  }, []);

  const refreshData = () => {
    setAudits(storageService.getAudits());
    setActions(storageService.getCorrectiveActions());
  };

  // Launch New Audit
  const handleStartNewAudit = (
    version: ChecklistVersion = 'courte',
    compId?: string,
    defaultService?: string
  ) => {
    setSelectedAudit(null);
    setAuditVersion(version);
    setFocusComponent(compId);
    setAuditServiceTarget(defaultService);
    setCurrentView('runner');
  };

  // View Audit Details
  const handleViewAudit = (auditId: string) => {
    const found = storageService.getAuditById(auditId);
    if (found) {
      setSelectedAudit(found);
      setCurrentView('detail');
    }
  };

  // Edit Existing Audit
  const handleEditAudit = (audit: Audit) => {
    setSelectedAudit(audit);
    setAuditVersion(audit.version);
    setFocusComponent(undefined);
    setCurrentView('runner');
  };

  // Delete Audit
  const handleDeleteAudit = (auditId: string) => {
    storageService.deleteAudit(auditId);
    refreshData();
    if (selectedAudit?.id === auditId) {
      setSelectedAudit(null);
      setCurrentView('home');
      setActiveTab('checklists');
    }
  };

  // Save audit from runner
  const handleSaveAudit = (savedAudit: Audit) => {
    refreshData();
    setSelectedAudit(savedAudit);
    setCurrentView('detail');
  };

  // Open Fiches directly with pre-selected category
  const handleOpenFiches = (
    category: 'all' | 'mains' | 'epi' | 'locaux' | 'favoris' | 'tableaux' = 'all'
  ) => {
    setFichesCategory(category);
    setActiveTab('fiches');
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Sterilisation Module directly
  const handleOpenSterilisation = () => {
    setCurrentView('sterilisation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Déchets Module directly
  const handleOpenDechets = () => {
    setCurrentView('dechets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Change tab from bottom bar
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'fiches') {
      setFichesCategory('all');
    }
    setActiveTab(tab);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingActionsCount = actions.filter(
    (a) => a.statut === 'a_faire' || a.statut === 'en_cours'
  ).length;

  return (
    <div className="min-h-screen bg-surface text-main flex flex-col font-body antialiased selection:bg-[#0F766E] selection:text-white transition-colors duration-200">
      {/* Header */}
      <Header
        onOpenSettings={() => handleTabChange('parametres')}
        onNewAudit={() => handleStartNewAudit('courte')}
        onOpenAPropos={() => setIsAProposOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 safe-bottom">
        {/* VIEW: Running an Audit (Edit or Create) */}
        {currentView === 'runner' ? (
          <AuditRunner
            initialAudit={selectedAudit}
            defaultVersion={auditVersion}
            defaultService={auditServiceTarget}
            defaultFocusComponent={focusComponent}
            onSave={handleSaveAudit}
            onCancel={() => {
              if (selectedAudit) {
                setCurrentView('detail');
              } else {
                setCurrentView('home');
              }
            }}
          />
        ) : currentView === 'detail' && selectedAudit ? (
          /* VIEW: Audit Detail / Print / Report */
          <AuditDetailView
            audit={selectedAudit}
            onBack={() => {
              setCurrentView('home');
              setActiveTab('checklists');
            }}
            onEdit={handleEditAudit}
            onDelete={handleDeleteAudit}
          />
        ) : currentView === 'sterilisation' ? (
          /* VIEW: Sterilisation Module */
          <SterilisationModule onBackToHome={() => setCurrentView('home')} />
        ) : currentView === 'dechets' ? (
          /* VIEW: Déchets (DMP) Module */
          <DechetsModule onBackToHome={() => setCurrentView('home')} />
        ) : currentView === 'tableau_bord' ? (
          /* VIEW: Tableau de Bord Sanitaire */
          <TableauDeBordModule
            onBackToHome={() => setCurrentView('home')}
            onOpenChecklists={() => {
              setActiveTab('checklists');
              setCurrentView('home');
            }}
            onOpenSterilisation={() => setCurrentView('sterilisation')}
            onOpenDechets={() => setCurrentView('dechets')}
            onOpenActions={() => {
              setActiveTab('actions');
              setCurrentView('home');
            }}
          />
        ) : (
          /* TAB VIEWS */
          <>
            {activeTab === 'accueil' && (
              <HomeScreen
                audits={audits}
                actions={actions}
                onOpenChecklists={() => {
                  setActiveTab('checklists');
                  setCurrentView('home');
                }}
                onOpenFiches={handleOpenFiches}
                onOpenSterilisation={handleOpenSterilisation}
                onOpenDechets={handleOpenDechets}
                onOpenUrgenceAes={() => setIsAesOpen(true)}
                onOpenGlossaire={() => setIsGlossaireOpen(true)}
                onOpenTableauDeBord={() => setCurrentView('tableau_bord')}
                onOpenAPropos={() => setIsAProposOpen(true)}
                onNewAudit={(v, s) => handleStartNewAudit(v || 'courte', undefined, s)}
                onViewAudit={handleViewAudit}
                onOpenComingSoon={(topic) => setComingSoonTopic(topic)}
                onOpenActions={() => {
                  setActiveTab('actions');
                  setCurrentView('home');
                }}
              />
            )}

            {activeTab === 'checklists' && (
              <AuditHistory
                audits={audits}
                onNewAudit={(v) => handleStartNewAudit(v || 'courte')}
                onViewAudit={handleViewAudit}
                onEditAudit={handleEditAudit}
                onDeleteAudit={handleDeleteAudit}
              />
            )}

            {activeTab === 'fiches' && (
              <FichesView
                initialCategory={fichesCategory}
                onStartAuditWithFocus={(compId) => handleStartNewAudit('courte', compId)}
              />
            )}

            {activeTab === 'actions' && (
              <CorrectiveActionsList
                actions={actions}
                onRefresh={refreshData}
                onViewAudit={handleViewAudit}
              />
            )}

            {activeTab === 'parametres' && (
              <DataSettingsModal
                onDataChanged={refreshData}
                onOpenAPropos={() => setIsAProposOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Urgence AES Modal */}
      <UrgenceAesModal isOpen={isAesOpen} onClose={() => setIsAesOpen(false)} />

      {/* Glossaire Modal */}
      <GlossaireModal isOpen={isGlossaireOpen} onClose={() => setIsGlossaireOpen(false)} />

      {/* A Propos Modal */}
      <AProposModal isOpen={isAProposOpen} onClose={() => setIsAProposOpen(false)} />

      {/* Onboarding First Launch Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          refreshData();
        }}
      />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        topic={comingSoonTopic}
        onClose={() => setComingSoonTopic(null)}
        onStartAuditWithFocus={(compId) => {
          setComingSoonTopic(null);
          handleStartNewAudit('courte', compId);
        }}
      />

      {/* Bottom Navigation */}
      {currentView !== 'runner' && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          pendingActionsCount={pendingActionsCount}
        />
      )}
    </div>
  );
}
