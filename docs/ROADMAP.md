# Hygia — Backlog priorisé

## Critique
- [fait] Dates « du jour » en UTC → décalage d'un jour entre 00h et 01h (Maroc). Helper `utils/dates.ts`.
- [fait] Écritures localStorage qui échouaient sans message → `utils/safeStorage.ts` + toast.
- [fait] Import de sauvegarde sans confirmation ni copie de sécurité.

## Améliorations importantes
- [fait] Bandeau « Nouvelle version disponible » (UpdateBanner).
- [fait] Export/import du plan annuel entre collègues (structure seulement, validation stricte, copie de sécurité).
- Tests automatisés (Playwright) dans le dépôt pour les parcours critiques.
- [fait] Zones tactiles ≥ 44 px (en-tête, accueil, écrans principaux). Reste : champs de recherche (~34 px) et petits cas dans les écrans secondaires.

## Fonctionnalités essentielles manquantes
- [fait] Plan type « district sanitaire » (structure du plan d'action santé-environnement de la délégation ; aucun chiffre repris).
- [fait] Rapport trimestriel, chaîne complète centre de santé → district → GST : le centre exporte un fichier (partage mobile ou téléchargement), le district reçoit, consolide, ajoute au choix ses propres chiffres et envoie un rapport consolidé au GST, qui consolide les districts (CSV en plus) (`rapportService.ts`). Reste : export au format des canevas Excel du GST TTA (accord de l'auteur obtenu), indicateurs supplémentaires validés avec le terrain (gîtes larvaires, inspections), rappel « rapports manquants » par centre attendu.
- Centre de santé : grille d'audit environnemental des CS (citée dans le plan de district, non fournie) et liste de tâches propres au CS.
- GST : suivi consolidé des districts (hors périmètre tant que l'écran trimestriel n'existe pas).
- Limite officielle chlore résiduel : à confirmer avec une source marocaine vérifiée (OMS = repère seulement).

## UX
- Afficher la version de l'application dans « À propos ».
- Simplifier davantage la saisie des registres rarement utilisés.

## Dette technique
- `storageService.ts` : données de démo extraites (`demoService.ts`, 966 → 805 lignes). Reste : audits / actions / sauvegarde — à découper seulement si on y touche, le gain ne justifie pas le risque.
- Chunk principal ~455 ko : poursuivre le chargement différé.
- [fait] Dépendance `motion` et `ComingSoonModal` inutilisées supprimées.

## Opportunités futures
- Synchronisation optionnelle multi-appareils (nécessite backend, auth, validation préalable).
- Export PDF des rapports mensuels / annuels.
