# Hygia — Architecture

- PWA hors ligne : React 19, Vite, Tailwind v4, vite-plugin-pwa, TypeScript.
- Aucune donnée ne quitte l'appareil : tout est en localStorage (clés `essp_hygiene_*`).
- Navigation par états (`View` dans App.tsx), pas de routeur.

## Décisions
1. **localStorage uniquement** : simplicité, hors ligne, confidentialité. Limite : ~5 Mo, pas de partage → sauvegarde JSON manuelle.
2. **Dates locales** (`utils/dates.ts`) : ne jamais utiliser `toISOString()` pour « aujourd'hui ».
3. **Écritures sûres** (`utils/safeStorage.ts`) : toute écriture signale l'échec à l'utilisateur.
4. **Import de sauvegarde** : validation, confirmation, copie `essp_hygiene_pre_import_backup`.
5. **Personnalisation** : `settings.sujets` (absent = tout actif).
6. **Références réglementaires** : toujours sourcées (manuel du Ministère 2010, normes citées) ; les repères OMS sont signalés comme tels, jamais comme obligations marocaines.
7. **Chargement différé** des modules lourds (React.lazy).

8. **Flux centre → district** : fichier JSON `hygia-rapport` (schemaVersion 1), validé à la réception (types, bornes, numérateur ≤ dénominateur) ; un nouvel envoi du même établissement et de la même période remplace l'ancien. Aucun indicateur n'est étiqueté « officiel » : ce sont des comptages issus des registres.
9. **Plan type district** : rubriques du modèle de plan d'action santé-environnement des délégations, sans aucun chiffre repris.
10. **Consolidation en cascade** : le rapport d'un district utilise le même format que celui d'un centre (+ liste `etablissements`, `inclutPropres`). Le GST n'a donc rien de spécial à lire. Limite connue : la consolidation additionne des comptages ; un établissement qui n'a pas envoyé son rapport n'est pas compté et n'est pas signalé (rappel « rapports manquants » à faire, il faut la liste des centres attendus).
