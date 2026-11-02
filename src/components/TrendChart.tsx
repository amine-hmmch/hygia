import React, { useMemo, useState } from 'react';

export interface PointTendance {
  date: string; // YYYY-MM-DD
  y: number;
  groupe: string;
  ok?: boolean;
}

interface Props {
  titre: string;
  unite: string;
  donnees: PointTendance[];
  seuilMin?: number;
  seuilMax?: number;
  jours?: number;
}

const fmt = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

/** Courbe simple sur N jours, un groupe (point d'eau, enceinte…) à la fois. */
export const TrendChart: React.FC<Props> = ({ titre, unite, donnees, seuilMin, seuilMax, jours = 30 }) => {
  const groupes = useMemo(() => Array.from(new Set(donnees.map((d) => d.groupe))), [donnees]);
  const [choix, setChoix] = useState<string>('');
  const groupe = groupes.includes(choix) ? choix : groupes[0];

  const pts = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - jours);
    const dmin = `${limite.getFullYear()}-${String(limite.getMonth() + 1).padStart(2, '0')}-${String(limite.getDate()).padStart(2, '0')}`;
    return donnees.filter((d) => d.groupe === groupe && d.date >= dmin).sort((a, b) => a.date.localeCompare(b.date));
  }, [donnees, groupe, jours]);

  if (!groupes.length) return null;

  const W = 340, H = 150, L = 34, R = 10, T = 12, B = 22;
  const t0 = Date.now() - jours * 86400000;
  const tx = (d: string) => L + ((new Date(d + 'T12:00:00').getTime() - t0) / (jours * 86400000)) * (W - L - R);
  const vals = pts.map((p) => p.y).concat([seuilMin, seuilMax].filter((v): v is number => v !== undefined));
  let lo = Math.min(...vals, 0), hi = Math.max(...vals, 1);
  if (lo === hi) hi = lo + 1;
  const pad = (hi - lo) * 0.1;
  hi += pad;
  const ty = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

  const ligne = pts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.date).toFixed(1)},${ty(p.y).toFixed(1)}`).join(' ');

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="label-caps">{titre} · {jours} jours</h3>
        {groupes.length > 1 && (
          <select
            value={groupe}
            onChange={(e) => setChoix(e.target.value)}
            aria-label="Choisir le point"
            className="h-9 px-2 rounded-lg border border-medium bg-card text-main text-[13px] max-w-[55%]"
          >
            {groupes.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        )}
      </div>
      {pts.length === 0 ? (
        <p className="text-[13px] text-sub py-2">Aucune mesure sur {jours} jours pour « {groupe} ».</p>
      ) : (
        <div className="border border-soft rounded-lg bg-card p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Courbe : ${titre}, ${groupe}`}>
            {[lo, (lo + hi) / 2, hi - pad].map((v, i) => (
              <g key={i}>
                <line x1={L} x2={W - R} y1={ty(v)} y2={ty(v)} stroke="var(--color-border-soft)" strokeWidth="1" />
                <text x={L - 4} y={ty(v) + 3} textAnchor="end" fontSize="9" fill="var(--color-text-sub)">{fmt(v)}</text>
              </g>
            ))}
            {seuilMin !== undefined && (
              <line x1={L} x2={W - R} y1={ty(seuilMin)} y2={ty(seuilMin)} stroke="var(--color-danger)" strokeWidth="1" strokeDasharray="4 3" />
            )}
            {seuilMax !== undefined && (
              <line x1={L} x2={W - R} y1={ty(seuilMax)} y2={ty(seuilMax)} stroke="var(--color-danger)" strokeWidth="1" strokeDasharray="4 3" />
            )}
            <path d={ligne} fill="none" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={tx(p.date)} cy={ty(p.y)} r="3.2" fill={p.ok === false ? 'var(--color-danger)' : 'var(--color-primary)'} />
            ))}
            <text x={L} y={H - 6} fontSize="9" fill="var(--color-text-sub)">il y a {jours} j</text>
            <text x={W - R} y={H - 6} textAnchor="end" fontSize="9" fill="var(--color-text-sub)">aujourd’hui</text>
          </svg>
          <p className="text-[12px] text-sub px-1">
            Dernière mesure : <span className="font-mono text-main">{fmt(pts[pts.length - 1].y)} {unite}</span>
            {seuilMin !== undefined && <> · seuil mini {fmt(seuilMin)}</>}
            {seuilMax !== undefined && <> · seuil maxi {fmt(seuilMax)}</>}
          </p>
        </div>
      )}
    </section>
  );
};
