import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Plus,
  Trash2,
  BookOpen,
  ShieldCheck,
  Building,
  User,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Database,
  RefreshCw,
  Info,
} from 'lucide-react';
import { storageService, AppSettings } from '../services/storageService';
import { DEFAULT_SERVICES, GUIDE_REFERENCES } from '../data/checklistsData';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';

interface DataSettingsModalProps {
  onDataChanged: () => void;
  onOpenAPropos?: () => void;
}

export const DataSettingsModal: React.FC<DataSettingsModalProps> = ({
  onDataChanged,
  onOpenAPropos,
}) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [services, setServices] = useState<string[]>(() => storageService.getServices());
  const [newServiceName, setNewServiceName] = useState('');
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message: string;
  } | null>(null);

  // Confirm modals
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save technician profile settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    showToast('Profil et paramètres enregistrés avec succès', 'success');
    onDataChanged();
  };

  // Add custom service
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceName.trim()) {
      const updated = storageService.addService(newServiceName.trim());
      setServices(updated);
      setNewServiceName('');
      showToast(`Service « ${newServiceName.trim()} » ajouté`, 'success');
      onDataChanged();
    }
  };

  // Delete service
  const handleConfirmDeleteService = () => {
    if (serviceToDelete) {
      const updated = services.filter((s) => s !== serviceToDelete);
      storageService.saveServices(updated);
      setServices(updated);
      showToast(`Service « ${serviceToDelete} » supprimé`, 'info');
      setServiceToDelete(null);
      onDataChanged();
    }
  };

  // Export full backup JSON
  const handleExportJson = () => {
    const jsonStr = storageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `ESSP_Securite_Sanitaire_Sauvegarde_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Sauvegarde complète téléchargée', 'success');
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = storageService.importFullBackup(content);
        if (res.success) {
          setImportStatus({
            success: true,
            message: `${res.message} (${res.count?.audits || 0} audits, ${res.count?.actions || 0} actions)`,
          });
          setServices(storageService.getServices());
          setSettings(storageService.getSettings());
          showToast('Importation réussie', 'success');
          onDataChanged();
        } else {
          setImportStatus({
            success: false,
            message: res.message,
          });
          showToast('Erreur lors de l’importation', 'error');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset / Clear all data
  const handleConfirmResetData = () => {
    storageService.clearAllData();
    setShowResetConfirm(false);
    showToast('Toutes les données ont été effacées', 'info');
    onDataChanged();
  };

  // Charger un jeu de données d'exemple génériques
  const handleLoadDemo = () => {
    storageService.loadDemoData();
    showToast('Données d’exemple chargées avec succès', 'success');
    onDataChanged();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* View Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-main tracking-tight">
            Réglages & Données Locales
          </h2>
          <p className="text-xs sm:text-sm text-sub mt-0.5">
            Paramétrage de l'établissement, des services et sauvegarde 100% hors-ligne
          </p>
        </div>

        {onOpenAPropos && (
          <button
            onClick={onOpenAPropos}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-soft hover:bg-card-subtle text-sub hover:text-main font-semibold text-xs transition"
          >
            <Info className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
            <span>À propos</span>
          </button>
        )}
      </div>

      {/* Section Mon établissement */}
      <div className="rounded-2xl p-5 sm:p-6 bg-card border border-soft space-y-4 shadow-soft">
        <div className="flex items-center gap-2 text-main font-heading font-bold text-base">
          <Building className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
          <span>Mon établissement</span>
        </div>
        <p className="text-xs text-sub leading-relaxed">
          Ces informations sont enregistrées en local sur l'appareil et apparaissent dans les en-têtes de vos audits et rapports PDF.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nom de l'établissement */}
            <div>
              <label className="text-xs font-semibold text-main block mb-1">
                Nom de l'établissement <span className="text-sub font-normal">(champ libre)</span> :
              </label>
              <input
                type="text"
                value={settings.etablissement || ''}
                onChange={(e) => setSettings({ ...settings, etablissement: e.target.value })}
                placeholder="Ex : Centre de Santé Urbain, Hôpital de jour..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            {/* Province / Région */}
            <div>
              <label className="text-xs font-semibold text-main block mb-1">
                Province / région <span className="text-sub font-normal">(facultatif)</span> :
              </label>
              <input
                type="text"
                value={settings.provinceRegion || ''}
                onChange={(e) => setSettings({ ...settings, provinceRegion: e.target.value })}
                placeholder="Ex : Province de Nouaceur, Région Casablanca-Settat..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            {/* Nom de l'utilisateur */}
            <div>
              <label className="text-xs font-semibold text-main block mb-1">
                Nom de l'utilisateur <span className="text-sub font-normal">(facultatif)</span> :
              </label>
              <input
                type="text"
                value={settings.userName || ''}
                onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                placeholder="Ex : Dr. Bennani, A. Alami..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            {/* Fonction / Rôle */}
            <div>
              <label className="text-xs font-semibold text-main block mb-1">
                Fonction de l'utilisateur <span className="text-sub font-normal">(facultatif)</span> :
              </label>
              <input
                type="text"
                value={settings.userRole || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    userRole: e.target.value,
                    auditeurDefaut: e.target.value,
                  })
                }
                placeholder="Ex : Technicien d'hygiène, Médecin chef, Major..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white font-bold text-xs sm:text-sm transition shadow-sm"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>

      {/* Gestion des Services Audités */}
      <div className="rounded-2xl p-5 sm:p-6 bg-card border border-soft space-y-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-main font-heading font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
            <span>Unités & Services de Soins ({services.length})</span>
          </div>
        </div>
        <p className="text-xs text-sub leading-relaxed">
          Ajoutez ou personnalisez les services de votre établissement selon votre structure.
        </p>

        {/* Add service form */}
        <form onSubmit={handleAddService} className="flex gap-2">
          <input
            type="text"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="Ajouter un service (ex: Maternité, Salle d'attente...)"
            className="flex-1 min-h-[44px] text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-card-subtle border border-soft text-main focus:outline-none focus:border-[#0F766E]"
          />
          <button
            type="submit"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </form>

        {/* Services tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card-subtle border border-soft text-xs text-main"
            >
              <span className="font-medium">{srv}</span>
              <button
                type="button"
                onClick={() => setServiceToDelete(srv)}
                className="text-sub hover:text-rose-500 transition p-0.5"
                title="Supprimer ce service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sauvegarde & Import JSON (100% Hors-Ligne) */}
      <div className="rounded-2xl p-5 sm:p-6 bg-card border border-soft space-y-4 shadow-soft">
        <div className="flex items-center gap-2 text-main font-heading font-bold text-base">
          <Database className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
          <span>Sauvegarde, Export & Restauration (JSON)</span>
        </div>
        <p className="text-xs text-sub leading-relaxed">
          Toutes les données sont stockées localement dans votre navigateur. Vous pouvez exporter un fichier de sauvegarde pour sécuriser vos données ou les transférer vers un autre appareil.
        </p>

        {importStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              importStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="min-h-[48px] p-4 rounded-xl bg-card-subtle hover:bg-slate-200 dark:hover:bg-slate-800 border border-soft text-main transition flex items-center justify-between gap-3 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center shrink-0">
                <Download className="w-4.5 h-4.5" />
              </div>
              <div className="text-start">
                <h4 className="font-bold text-xs sm:text-sm text-main">Exporter la sauvegarde</h4>
                <p className="text-[11px] text-sub">Télécharger le fichier .json complet</p>
              </div>
            </div>
          </button>

          {/* Import JSON */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[48px] p-4 rounded-xl bg-card-subtle hover:bg-slate-200 dark:hover:bg-slate-800 border border-soft text-main transition flex items-center justify-between gap-3 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
                  <Upload className="w-4.5 h-4.5" />
                </div>
                <div className="text-start">
                  <h4 className="font-bold text-xs sm:text-sm text-main">Restaurer une sauvegarde</h4>
                  <p className="text-[11px] text-sub">Importer un fichier .json précédemment exporté</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Actions sur les données */}
        <div className="pt-3 border-t border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleLoadDemo}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-card-subtle hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-soft hover:border-teal-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Charger un exemple de données</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-card-subtle hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-soft hover:border-rose-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Effacer toutes les données</span>
          </button>
        </div>
      </div>

      {/* Delete Service Confirmation Modal */}
      <ConfirmModal
        isOpen={!!serviceToDelete}
        title="Supprimer ce service ?"
        message={`Voulez-vous vraiment retirer « ${serviceToDelete} » de la liste des services disponibles ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={handleConfirmDeleteService}
        onCancel={() => setServiceToDelete(null)}
      />

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Effacer toutes les données ?"
        message="Voulez-vous vraiment supprimer tous les audits, cycles de stérilisation, pesées et actions enregistrés ? Cette action est irréversible."
        confirmLabel="Effacer les données"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={handleConfirmResetData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
