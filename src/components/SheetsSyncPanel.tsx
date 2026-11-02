import React, { useState } from 'react';
import { Sheet, Copy, Check, Send } from 'lucide-react';
import { sheetsService, lignes } from '../services/sheetsService';
import { storageService } from '../services/storageService';
import { cuisineService } from '../services/cuisineService';
import { thmService } from '../services/thmService';
import { REGISTRES } from '../data/thmData';
import { useToast } from '../context/ToastContext';

export const APPS_SCRIPT = `// Hygia : réception des saisies dans Google Sheets
var CODE = 'CHOISIS-UN-CODE-SECRET'; // le même code que dans l'application

function doPost(e) {
  var out = function (o) {
    return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  };
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.code !== CODE) return out({ ok: false, message: 'Code incorrect.' });
    if (d.test) return out({ ok: true, message: 'Connexion réussie.' });
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    (d.lignes || []).forEach(function (l) {
      var sh = ss.getSheetByName(l.feuille) || ss.insertSheet(l.feuille);
      var cles = Object.keys(l.cols);
      if (sh.getLastRow() === 0) {
        sh.appendRow(['ID'].concat(cles));
        sh.setFrozenRows(1);
        sh.getRange(1, 1, 1, cles.length + 1).setFontWeight('bold');
      }
      var lastCol = sh.getLastColumn();
      var entetes = sh.getRange(1, 1, 1, lastCol).getValues()[0];
      cles.forEach(function (k) {
        if (entetes.indexOf(k) < 0) {
          sh.getRange(1, entetes.length + 1).setValue(k).setFontWeight('bold');
          entetes.push(k);
        }
      });
      var ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(function (r) { return String(r[0]); });
      var ligne = entetes.map(function (h, i) { return i === 0 ? l.id : (l.cols[h] !== undefined ? l.cols[h] : ''); });
      var pos = ids.indexOf(String(l.id));
      if (pos > 0) sh.getRange(pos + 1, 1, 1, ligne.length).setValues([ligne]);
      else sh.appendRow(ligne);
    });
    return out({ ok: true, message: 'Reçu.' });
  } catch (err) {
    return out({ ok: false, message: String(err) });
  }
}`;

export const SheetsSyncPanel: React.FC = () => {
  const { showToast } = useToast();
  const [cfg, setCfg] = useState(sheetsService.getConfig());
  const [restantes, setRestantes] = useState(sheetsService.getQueue().length);
  const [busy, setBusy] = useState(false);
  const [copie, setCopie] = useState(false);
  const [guide, setGuide] = useState(false);

  const maj = (p: Partial<typeof cfg>) => {
    const n = { ...cfg, ...p };
    setCfg(n);
    sheetsService.saveConfig(n);
  };

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      showToast('Copie impossible : sélectionne le code à la main.', 'error');
    }
  };

  const tester = async () => {
    setBusy(true);
    const r = await sheetsService.tester(cfg.url.trim(), cfg.code.trim());
    setBusy(false);
    showToast(r.message, r.ok ? 'success' : 'error');
  };

  const envoyer = async () => {
    setBusy(true);
    const r = await sheetsService.flush();
    setBusy(false);
    setCfg(sheetsService.getConfig());
    setRestantes(r.restantes);
    showToast(r.erreur ? r.erreur : r.envoyees ? `${r.envoyees} ligne(s) envoyée(s).` : 'Rien à envoyer.', r.erreur ? 'error' : 'success');
  };

  const toutEnvoyer = async () => {
    sheetsService.enqueueMany([
      ...REGISTRES.flatMap((d) => thmService.getRegistre(d.id).map((e) => lignes.registre(d.id, e))),
      ...storageService.getSterilisationCycles().map(lignes.sterilisation),
      ...storageService.getDechetsPesees().map(lignes.dechets),
      ...cuisineService.getReleves().map(lignes.cuisine),
      ...storageService.getAudits().map(lignes.audit),
    ]);
    setRestantes(sheetsService.getQueue().length);
    await envoyer();
  };

  const field = 'w-full h-11 px-3 rounded-lg border border-medium bg-card text-main text-[14px] focus:outline-none focus:border-primary';

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-card border border-soft space-y-4 shadow-soft">
      <div className="flex items-center gap-2 text-main font-heading font-bold text-base">
        <Sheet className="w-5 h-5 text-[#1F5A43] dark:text-teal-400" />
        <span>Registre en ligne (Google Sheets)</span>
      </div>
      <p className="text-xs text-sub leading-relaxed">
        Chaque saisie (registres, stérilisation, déchets, cuisine, audits) est envoyée dans ta feuille Google. Sans réseau, elle attend puis part toute seule.
        Vérifie que ton établissement autorise ce type de stockage.
      </p>

      <button onClick={() => setGuide(!guide)} className="text-sm font-medium text-primary">
        {guide ? 'Masquer' : 'Voir'} la mise en place (5 minutes)
      </button>
      {guide && (
        <div className="space-y-3 text-[13px] text-main leading-relaxed">
          <ol className="list-decimal ps-5 space-y-1.5">
            <li>Crée une feuille Google vide (sheets.google.com).</li>
            <li>Menu <b>Extensions</b>, puis <b>Apps Script</b>.</li>
            <li>Efface le contenu, colle le code ci-dessous, et remplace <code>CHOISIS-UN-CODE-SECRET</code> par un code de ton choix.</li>
            <li>Clique <b>Déployer</b>, <b>Nouveau déploiement</b>, type <b>Application Web</b>. « Exécuter en tant que » : <b>Moi</b>. « Qui a accès » : <b>Tout le monde</b>. Autorise l’accès quand Google le demande.</li>
            <li>Copie l’adresse qui se termine par <code>/exec</code> et colle-la ci-dessous avec ton code. Touche <b>Tester</b>.</li>
          </ol>
          <button onClick={copier} className="h-10 px-3.5 rounded-lg border border-medium text-sm font-medium flex items-center gap-1.5">
            {copie ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />} {copie ? 'Copié' : 'Copier le code du script'}
          </button>
          <p className="text-sub">Seules les personnes qui ont l’adresse et le code peuvent écrire dans la feuille : ne les partage pas.</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-main block mb-1">Adresse du script (se termine par /exec)</label>
          <input value={cfg.url} onChange={(e) => maj({ url: e.target.value })} placeholder="https://script.google.com/macros/s/…/exec" className={field} inputMode="url" />
        </div>
        <div>
          <label className="text-xs font-semibold text-main block mb-1">Code secret</label>
          <input value={cfg.code} onChange={(e) => maj({ code: e.target.value })} className={field} autoComplete="off" />
        </div>
        <label className="flex items-center gap-3 min-h-[44px] text-sm text-main">
          <input type="checkbox" checked={cfg.actif} onChange={(e) => maj({ actif: e.target.checked })} className="w-5 h-5 accent-[#1F5A43]" />
          Envoyer automatiquement les nouvelles saisies
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button disabled={busy || !cfg.url} onClick={tester} className="h-11 px-4 rounded-lg border border-medium text-sm font-medium disabled:opacity-50">Tester</button>
        <button disabled={busy || !cfg.url} onClick={envoyer} className="h-11 px-4 rounded-lg bg-primary text-white dark:text-[#10201a] text-sm font-medium flex items-center gap-1.5 disabled:opacity-50">
          <Send className="w-4 h-4" /> Envoyer maintenant
        </button>
        <button disabled={busy || !cfg.url} onClick={toutEnvoyer} className="h-11 px-4 rounded-lg border border-medium text-sm font-medium disabled:opacity-50">Envoyer tout l’existant</button>
      </div>

      <p className="text-xs text-sub">
        En attente : <b className="text-main">{restantes}</b>
        {cfg.dernierEnvoi ? ` · dernier envoi ${new Date(cfg.dernierEnvoi).toLocaleString('fr-FR')}` : ''}
        {cfg.derniereErreur ? ` · ${cfg.derniereErreur}` : ''}
      </p>
    </div>
  );
};
