# Hygia

Application web (PWA) d'hygiène en établissement de santé : audits, fiches pratiques,
stérilisation, déchets, tableau de bord. Fonctionne hors-ligne, installable sur Android.

> Outil d'aide. Il ne remplace pas les documents officiels de l'établissement.

## Modules
- Soins : audits rapides/complets, urgence AES, fiches, stérilisation, déchets, locaux
- Cuisine et restauration : relevés de température (réception, froid, cuisson, maintien), audit HACCP, fiches pratiques

## Changer le nom
Modifier `src/config/app.ts` (APP_NAME) et la balise `<title>` de `index.html`.

## Développement
```
npm install
npm run dev
npm run build
```
Déploiement GitHub Pages : workflow `.github/workflows/deploy.yml` (BASE_PATH automatique).
