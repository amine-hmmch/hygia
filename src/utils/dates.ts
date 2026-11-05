/**
 * Date du jour dans le fuseau de l'appareil, au format AAAA-MM-JJ.
 * (toISOString() donne la date UTC : entre minuit et 1 h du matin au Maroc, elle renvoie la veille.)
 */
export function dateLocale(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
}
