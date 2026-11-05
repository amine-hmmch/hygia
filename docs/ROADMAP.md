# Hygia — Backlog priorisé

## Critique
- [fait] Dates « du jour » en UTC → décalage d'un jour entre 00h et 01h (Maroc). Helper `utils/dates.ts`.
- [fait] Écritures localStorage qui échouaient sans message → `utils/safeStorage.ts` + toast.
- [fait] Import de sauvegarde sans confirmation ni copie de sécurité.

## Améliorations importantes
- [fait] Bandeau « Nouvelle version disponible » (UpdateBanner).
- [fait] Export/import du plan annuel entre collègues (structure seulement, validation stricte, copie de sécurité).
- Tests automatisés (Playwright) dans le dépôt pour les parcours critiques.
- [fait pour l'en-tête et l'accueil] Zones tactiles < 44 px ; reste à scanner les écrans internes.

## Fonctionnalités essentielles manquantes
- Niveaux district / GST / centre de santé (en attente des documents du terrain).
- Limite officielle chlore résiduel : à confirmer avec une source marocaine vérifiée (OMS = repère seulement).

## UX
- Afficher la version de l'application dans « À propos ».
- Simplifier davantage la saisie des registres rarement utilisés.

## Dette technique
- `storageService.ts` volumineux : à découper (audits / actions / sauvegarde).
- Chunk principal ~455 ko : poursuivre le chargement différé.
- [fait] Dépendance `motion` et `ComingSoonModal` inutilisées supprimées.

## Opportunités futures
- Synchronisation optionnelle multi-appareils (nécessite backend, auth, validation préalable).
- Export PDF des rapports mensuels / annuels.
