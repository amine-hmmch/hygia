/** Sauvegarde, CSV, rappels : petits utilitaires partagés. */
import { thmService, debutSemaine } from './thmService';

const BACKUP_KEY = 'essp_hygiene_last_backup_v1';
const NOTIF_KEY = 'essp_hygiene_notif_v1';
const NOTIF_LAST = 'essp_hygiene_notif_last_v1';

const get = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const set = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

export const isoLocal = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const extrasService = {
  /* ---------- Sauvegarde ---------- */
  markBackup() {
    set(BACKUP_KEY, new Date().toISOString());
  },
  lastBackup(): Date | null {
    const v = get(BACKUP_KEY);
    return v ? new Date(v) : null;
  },
  /** Nombre de jours depuis la dernière sauvegarde (null = jamais). */
  daysSinceBackup(): number | null {
    const d = this.lastBackup();
    return d ? Math.floor((Date.now() - d.getTime()) / 86400000) : null;
  },
  /** Une sauvegarde est conseillée s'il y a des données et qu'elle date de plus de 7 jours. */
  backupDue(): boolean {
    const has = (['eau', 'vecteurs', 'prelevements', 'sensibilisation'] as const).some((id) => thmService.getRegistre(id).length > 0) ||
      Object.keys(thmService.getJours()).length > 0;
    if (!has) return false;
    const n = this.daysSinceBackup();
    return n === null || n >= 7;
  },

  /* ---------- CSV ---------- */
  toCsv(rows: (string | number | undefined | null)[][]): string {
    const esc = (v: any) => {
      const s = v === undefined || v === null ? '' : String(v);
      return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    // point-virgule + BOM : s'ouvre correctement dans Excel en français
    return '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n');
  },
  downloadCsv(nom: string, rows: (string | number | undefined | null)[][]) {
    const blob = new Blob([this.toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nom}_${isoLocal()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /* ---------- Rappels ---------- */
  /** Test de chlore : un par semaine (lundi à dimanche). */
  chloreFaitCetteSemaine(): boolean {
    const debut = debutSemaine(isoLocal());
    return thmService.getRegistre('eau').some((e) => e.date >= debut);
  },
  rappelsActifs(): boolean {
    return get(NOTIF_KEY) === 'on';
  },
  notifSupportee(): boolean {
    return typeof Notification !== 'undefined';
  },
  async activerRappels(): Promise<boolean> {
    if (!this.notifSupportee()) return false;
    const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (p === 'granted') {
      set(NOTIF_KEY, 'on');
      return true;
    }
    return false;
  },
  desactiverRappels() {
    set(NOTIF_KEY, 'off');
  },
  /** Liste des rappels en cours (texte court). */
  rappels(): string[] {
    const r: string[] = [];
    if (!this.chloreFaitCetteSemaine()) r.push('Test de chlore de la semaine pas encore fait');
    const plan = thmService.aFaireCeMois().length;
    if (plan) r.push(`${plan} activité${plan > 1 ? 's' : ''} du plan à faire ce mois-ci`);
    if (this.backupDue()) r.push('Sauvegarde conseillée (plus de 7 jours)');
    return r;
  },
  /** Notification à l'ouverture de l'application, une fois par jour. */
  async notifierRappels() {
    if (!this.rappelsActifs() || !this.notifSupportee() || Notification.permission !== 'granted') return;
    const today = isoLocal();
    if (get(NOTIF_LAST) === today) return;
    const r = this.rappels();
    if (!r.length) return;
    set(NOTIF_LAST, today);
    const titre = 'Hygia : à faire';
    const options = { body: r.join('\n'), icon: undefined as string | undefined, tag: 'hygia-rappels' };
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) await reg.showNotification(titre, options);
      else new Notification(titre, options);
    } catch {}
  },
};

