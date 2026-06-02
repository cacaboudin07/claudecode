# Marketing Digital & IA — Site de présentation

Un petit site web (one-page) qui explique de façon claire et pédagogique :

- **En quoi consiste le marketing digital** (définition)
- **Comment il fonctionne** (l'entonnoir de conversion)
- **Les grands canaux** (SEO, Ads, réseaux sociaux, emailing…)
- **Le rôle majeur de l'IA** dans le marketing d'aujourd'hui

Et un **guide pour bien débuter** (`guide.html`) avec :

- les **7 étapes** pour se lancer pas à pas
- une **boîte à outils** gratuits
- les **erreurs classiques** à éviter
- une **checklist** interactive (progression sauvegardée dans le navigateur)

## Aperçu

Site statique moderne, responsive, avec animations au défilement.
Aucune dépendance à installer.

## Lancer le site

Ouvrir simplement `index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Structure

| Fichier       | Rôle                                            |
| ------------- | ----------------------------------------------- |
| `index.html`  | La présentation (tout-en-un : HTML, CSS, JS)    |
| `guide.html`  | Le guide « comment débuter » (tout-en-un)       |

Chaque page est **autonome** : double-clique sur le fichier pour l'ouvrir
directement dans un navigateur, sans serveur ni installation.
