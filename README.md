# ESSP Sécurité Sanitaire

Application web installable (PWA), 100 % hors-ligne, d'aide à l'hygiène en établissement de soins :
check-lists d'audit (tableaux 20 et 21), fiches pratiques, stérilisation, déchets, actions correctives et rapports.
Basée sur le *Guide du Professionnel – Sécurité Sanitaire des ESSP* (Ministère de la Santé, Maroc, 2021).

> Outil d'aide. Il ne remplace pas le guide officiel.
> Aucune donnée patient ne doit être saisie. Les données restent sur l'appareil (stockage local du navigateur).

## Lancer en local
```
npm install
npm run dev
```

## Publier sur GitHub Pages
1. Poussez ce dossier sur la branche `main` d'un dépôt **public**.
2. Dans le dépôt : **Settings → Pages → Source : GitHub Actions**.
3. Le workflow `.github/workflows/deploy.yml` compile et publie automatiquement.
4. L'application est disponible sur `https://<votre-pseudo>.github.io/<nom-du-depot>/`.

Sur téléphone (Chrome) : ouvrir le lien, puis menu ⋮ → **Installer l'application**.
