import React, { useMemo, useRef, useState } from 'react';
import { Send, Upload, Download, Trash2 } from 'lucide-react';
import { SubScreen } from './SubScreen';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';
import { INDICATEURS_RAPPORT, TRIMESTRES, Chiffres, RapportTrimestriel, Trimestre, rapportService } from '../services/rapportService';

const selCls = 'min-h-[44px] px-3 rounded-lg bg-card border border-medium text-main text-[15px]';
const pct = (c?: { n: number; d?: number }) => (c && c.d ? `${((c.n / c.d) * 100).toFixed(1).replace('.', ',')} %` : '');
const val = (c: { n: number; d?: number } | undefined, avecD: boolean) => (!c ? '—' : avecD ? `${c.n} / ${c.d ?? 0}` : String(c.n));

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'etablissement';

export const RapportTrimestrielModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { showToast } = useToast();
  const now = new Date();
  const [annee, setAnnee] = useState(now.getFullYear());
  const [t, setT] = useState<Trimestre>(rapportService.trimestreActuel(now));
  const [tick, setTick] = useState(0);
  const [aSupprimer, setASupprimer] = useState<string | null>(null);
  const fichier = useRef<HTMLInputElement>(null);

  const s = storageService.getSettings();
  const estDistrict = s.niveau === 'district' || s.niveau === 'gst';
  const mes: Chiffres = useMemo(() => rapportService.calculer(annee, t), [annee, t, tick]);
  const conso = useMemo(() => rapportService.consolider(annee, t), [annee, t, tick]);
  const etab = (s.etablissement || '').trim();

  const [inclurePropres, setInclurePropres] = useState(true);
  const estDistrictSeul = s.niveau === 'district';

  const envoyerConsolide = () => {
    const r = rapportService.construireConsolide(annee, t, inclurePropres);
    if (!r) { showToast('Aucun rapport reçu pour cette période', 'error'); return; }
    return envoyer(r);
  };

  const envoyer = async (rapportFourni?: RapportTrimestriel) => {
    const rapport = rapportFourni ?? rapportService.construire(annee, t);
    const nom = `Hygia_rapport_${slug(etab)}_${annee}_${t}.json`;
    const file = new File([JSON.stringify(rapport, null, 2)], nom, { type: 'application/json' });
    try {
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: `Rapport ${t} ${annee}` });
        return;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = nom;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Rapport téléchargé : envoie le fichier à ton district', 'success');
  };

  const lireFichiers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files || []);
    e.target.value = '';
    fs.forEach((f) => {
      const r = new FileReader();
      r.onload = () => {
        const res = rapportService.recevoir(String(r.result ?? ''));
        if (res.ok && res.rapport) {
          showToast(`${res.message} ${res.rapport.etablissement} · ${res.rapport.trimestre} ${res.rapport.annee}`, 'success');
          setAnnee(res.rapport.annee); setT(res.rapport.trimestre);
          setTick((x) => x + 1);
        } else showToast(`${f.name} : ${res.message}`, 'error');
      };
      r.readAsText(f);
    });
  };

  const exporterCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const ents = ['Indicateur', ...conso.rapports.map((r) => r.etablissement), 'Total'];
    const lignes = INDICATEURS_RAPPORT.map((i) => [i.label, ...conso.rapports.map((r) => val(r.chiffres[i.id], !!i.de)), val(conso.total[i.id], !!i.de)]);
    const csv = '﻿' + [ents, ...lignes].map((l) => l.map(esc).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `Hygia_consolidation_${annee}_${t}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const groupes = Array.from(new Set(INDICATEURS_RAPPORT.map((i) => i.groupe)));

  return (
    <SubScreen title="Rapport trimestriel" onBack={onBack}>
      <div className="flex items-center gap-2">
        <select className={selCls} value={annee} onChange={(e) => setAnnee(+e.target.value)} aria-label="Année">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y}>{y}</option>)}
        </select>
        <select className={selCls} value={t} onChange={(e) => setT(e.target.value as Trimestre)} aria-label="Trimestre">
          {TRIMESTRES.map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>

      <section>
        <h3 className="label-caps pb-2 border-b border-medium">Mes chiffres · {etab || 'établissement non renseigné'}</h3>
        <p className="text-[13px] text-sub py-2">Calculés à partir de tes registres et audits. Rien n’est estimé : ce qui n’est pas saisi compte pour zéro.</p>
        {groupes.map((g) => (
          <div key={g}>
            {INDICATEURS_RAPPORT.filter((i) => i.groupe === g).map((i) => (
              <div key={i.id} className="row-rule py-2.5 flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] text-main leading-snug">{i.label}</p>
                  <p className="text-[12px] text-sub">{g}{i.de ? ` · ${i.nu} / ${i.de}` : ''}</p>
                </div>
                <p className="text-[15px] font-semibold text-main whitespace-nowrap">{val(mes[i.id], !!i.de)} <span className="text-[12px] text-sub font-normal">{pct(mes[i.id])}</span></p>
              </div>
            ))}
          </div>
        ))}
        <button onClick={() => envoyer()} disabled={!etab} className="mt-3 w-full min-h-[48px] rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2 disabled:opacity-50">
          <Send className="w-4 h-4" /> {estDistrict ? 'Exporter ce rapport' : 'Envoyer à mon district'}
        </button>
        {!etab && <p className="text-[13px] text-warning pt-2">Renseigne le nom de ton établissement dans ton profil pour pouvoir envoyer le rapport.</p>}
      </section>

      {estDistrict && (
        <section className="pt-2">
          <h3 className="label-caps pb-2 border-b border-medium">Rapports reçus des établissements · {t} {annee}</h3>
          <input ref={fichier} type="file" accept=".json,application/json" multiple className="hidden" onChange={lireFichiers} />
          <button onClick={() => fichier.current?.click()} className="my-3 w-full min-h-[48px] rounded-lg border border-medium text-primary font-medium flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Recevoir des rapports (fichiers)
          </button>
          <p className="text-[13px] text-sub pb-2">{s.niveau === 'gst' ? 'Les districts t’envoient leur rapport consolidé.' : 'Les centres de santé t’envoient leur fichier ; tu transmets ensuite le rapport consolidé au GST.'}</p>
          {conso.rapports.length === 0 ? (
            <p className="text-[14px] text-sub">Aucun rapport reçu pour cette période. Les centres de santé t’envoient leur fichier ; tu peux en choisir plusieurs d’un coup.</p>
          ) : (
            <>
              <p className="text-[13px] text-sub pb-2">{conso.rapports.length} établissement{conso.rapports.length > 1 ? 's' : ''} ont envoyé leur rapport. Les établissements sans rapport ne sont pas comptés.</p>
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="text-[13px] min-w-full">
                  <thead>
                    <tr className="text-left text-sub">
                      <th className="py-2 pr-3 font-medium">Indicateur</th>
                      {conso.rapports.map((r) => <th key={r.etablissement} className="py-2 px-2 font-medium whitespace-nowrap">{r.etablissement}</th>)}
                      <th className="py-2 pl-2 font-semibold text-main">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INDICATEURS_RAPPORT.map((i) => (
                      <tr key={i.id} className="border-t border-soft">
                        <td className="py-2 pr-3 min-w-[170px]">{i.label}</td>
                        {conso.rapports.map((r) => <td key={r.etablissement} className="py-2 px-2 whitespace-nowrap">{val(r.chiffres[i.id], !!i.de)}</td>)}
                        <td className="py-2 pl-2 font-semibold text-main whitespace-nowrap">{val(conso.total[i.id], !!i.de)} <span className="text-sub font-normal">{pct(conso.total[i.id])}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 pt-3">
                <button onClick={exporterCsv} className="flex-1 min-h-[48px] rounded-lg border border-medium text-primary font-medium flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Tableau (CSV)</button>
              </div>
              {estDistrictSeul && (
                <div className="pt-3 space-y-2">
                  <label className="flex items-start gap-3 min-h-[44px] text-[14px] text-main">
                    <input type="checkbox" className="mt-1 w-5 h-5" checked={inclurePropres} onChange={(e) => setInclurePropres(e.target.checked)} />
                    <span>Ajouter mes propres chiffres au total<span className="block text-[12px] text-sub">À décocher si tes activités sont déjà comptées dans les rapports des centres.</span></span>
                  </label>
                  <button onClick={envoyerConsolide} disabled={!etab} className="w-full min-h-[48px] rounded-lg bg-primary text-white dark:text-[#10201a] font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send className="w-4 h-4" /> Envoyer le rapport consolidé au GST
                  </button>
                </div>
              )}
              <ul className="pt-3">
                {conso.rapports.map((r) => (
                  <li key={r.etablissement} className="row-rule py-2 flex items-center justify-between gap-3">
                    <span className="text-[14px] text-main min-w-0">{r.etablissement}<span className="block text-[12px] text-sub truncate">{r.etablissements ? `${r.etablissements.length} établissement${r.etablissements.length > 1 ? 's' : ''} · ` : ''}{r.auteur || ''}{r.auteur ? ' · ' : ''}reçu pour {r.trimestre} {r.annee}</span></span>
                    <button onClick={() => setASupprimer(r.etablissement)} className="w-11 h-11 flex items-center justify-center text-sub" aria-label={`Retirer le rapport de ${r.etablissement}`}><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <ConfirmModal
        isOpen={aSupprimer !== null}
        title="Retirer ce rapport ?"
        message={`Le rapport de « ${aSupprimer ?? ''} » pour ${t} ${annee} est retiré de la consolidation. Tu pourras le recevoir à nouveau.`}
        confirmLabel="Retirer"
        isDestructive={true}
        onConfirm={() => { if (aSupprimer) rapportService.supprimerRecu(aSupprimer, annee, t); setASupprimer(null); setTick((x) => x + 1); }}
        onCancel={() => setASupprimer(null)}
      />
    </SubScreen>
  );
};
