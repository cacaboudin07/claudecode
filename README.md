# 🚀 Décolle — Site « Marketing Digital »

Site web complet, clé en main, pour **apprendre le marketing digital, comprendre le rôle de l'IA et lancer son premier produit digital**. Conçu pour être clair, moderne, rapide et facile à revendre.

Le site comprend **3 pages** :

| Page | Fichier | Contenu |
|------|---------|---------|
| **Présentation** | `index.html` | C'est quoi le marketing digital, comment ça marche (l'entonnoir + la formule clé), les canaux, le rôle de l'IA, les chiffres 2026, FAQ. |
| **Guide** | `guide.html` | Bien débuter (état d'esprit), se lancer en 6 étapes, les outils recommandés (avec liens), vidéos utiles, formations gratuites. |
| **Lance-toi 🚀** | `lance-toi.html` | Un **simulateur interactif** : lance ton premier produit digital pas à pas et découvre comment chaque choix influence tes ventes. |

---

## ✨ Points forts

- **100 % autonome** — HTML/CSS/JavaScript pur. **Aucune dépendance, aucun build, aucune installation.** Il suffit d'ouvrir les fichiers.
- **Design soigné & responsive** — fonctionne du mobile au grand écran, thème « décollage » cohérent, animations au défilement, illustrations SVG sur mesure.
- **Simulateur pédagogique** — un mini-jeu qui enseigne la formule `CA = Trafic × Conversion × Prix` à travers des choix concrets et un débrief personnalisé.
- **Performant & respectueux** — vidéos YouTube en chargement différé (au clic uniquement), polices avec repli système, images vectorielles légères.
- **Accessible** — navigation au clavier, libellés ARIA, contrastes soignés, prise en charge de `prefers-reduced-motion`.
- **SEO-ready** — balises `<title>`, méta-descriptions et Open Graph sur chaque page.

---

## 📁 Structure des fichiers

```
.
├── index.html            # Page « Présentation »
├── guide.html            # Page « Guide »
├── lance-toi.html        # Page « Lance-toi » (simulateur)
└── assets/
    ├── css/
    │   ├── style.css     # Design system global (couleurs, composants, responsive)
    │   ├── game.css      # Styles spécifiques au simulateur
    │   └── fx.css        # Effets : transitions de page, scène 3D, cartes 3D, aurores
    ├── js/
    │   ├── main.js       # Navigation, animations, compteurs, vidéos « lite »
    │   ├── game.js       # Logique du simulateur (états, calcul, résultats)
    │   └── fx.js         # Transitions de page, tilt 3D, parallaxe, champ d'étoiles
    └── img/
        └── favicon.svg   # Logo / favicon (fusée)
```

---

## ▶️ Prévisualiser en local

Ouvre simplement `index.html` dans un navigateur. Pour un rendu identique à la production (chemins relatifs, etc.), lance un petit serveur local :

```bash
# Python 3
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

---

## 🌐 Mettre en ligne (déploiement)

C'est un site **statique** : il s'héberge partout, gratuitement ou presque.

- **Netlify / Vercel / Cloudflare Pages** : glisse-dépose le dossier, ou connecte le dépôt Git. Aucune commande de build (laisse le champ vide), dossier de publication = la racine.
- **GitHub Pages** : pousse le dépôt, puis active Pages sur la branche concernée.
- **Hébergement classique (FTP/OVH/etc.)** : téléverse tous les fichiers en respectant la même arborescence.

---

## 🎨 Personnalisation

Tout est pensé pour être modifié rapidement, sans toucher à la logique.

### 1. Couleurs & marque
Les couleurs sont centralisées dans les **variables CSS** en haut de `assets/css/style.css` (`:root`) :

```css
--violet: #7c5cff;   --blue: #2f6bff;   --cyan: #22d3ee;
--coral:  #ff6b5d;   --mint: #34d399;   --gold: #ffc857;
```

Change ces valeurs pour reskiner tout le site d'un coup.

### 2. Nom & logo
- Le nom **« Décolle »** apparaît dans le `<header>` (classe `.brand`) et le `<footer>` de chaque page : remplace-le par ta marque.
- Le logo est le fichier vectoriel `assets/img/favicon.svg` (modifiable dans n'importe quel éditeur SVG).

### 3. Textes & contenu
Le contenu est en clair directement dans les fichiers `.html` — modifie-le librement.

### 4. Outils recommandés (page Guide)
Chaque outil est une carte `<a class="tool">` dans `guide.html` (section `#outils`). Pour en ajouter/retirer, copie/supprime un bloc et adapte le nom, la description, le lien et l'étiquette (`free` / `freemium` / `paid`).

### 5. Vidéos (page Guide)
Les vidéos utilisent un identifiant YouTube via l'attribut `data-yt` :

```html
<div class="lyt" data-yt="IDENTIFIANT_YOUTUBE" data-title="Titre">…</div>
```

Remplace `IDENTIFIANT_YOUTUBE` par l'ID de ta vidéo (la partie après `watch?v=`). La vignette et la lecture se gèrent automatiquement.

### 6. Le simulateur (page Lance-toi)
Toute la matière du jeu est regroupée en **tableaux de données** en haut de `assets/js/game.js` :
`PRODUCTS`, `AUDIENCES`, `CHANNELS`, `HOOKS`. Tu peux y ajouter des options ou ajuster les paramètres (prix, taux de conversion de base, qualité de canal…).

> **Le modèle de calcul** (fonction `simulate()`) est volontairement simplifié à but pédagogique :
> `visiteurs = base × volume du canal × portée de l'audience`, puis
> `conversion = conv. de base × qualité du canal × adéquation du prix × force de l'accroche`,
> et enfin `revenu net = ventes × prix − coût publicitaire`.
> Les seuils de notes (S/A/B/C/D) se règlent dans `gradeFor()`.

### 7. Effets & animations
Tous les effets « wow » sont regroupés dans `assets/css/fx.css` + `assets/js/fx.js` :
transition animée entre les pages, scène 3D du hero (planète, anneaux, lunes),
cartes qui s'inclinent en 3D au survol, boutons magnétiques, champ d'étoiles
interactif, aurores et barre de progression.

- Pour un rendu plus sobre, il suffit de **retirer les deux lignes `fx.css` / `fx.js`** dans les pages HTML : le site reste parfaitement fonctionnel et élégant.
- Tous ces effets sont **automatiquement désactivés** pour les visiteurs ayant activé « réduire les animations » dans leur système (`prefers-reduced-motion`), et le tilt 3D ne s'active que sur les appareils à souris.

---

## 📝 Notes

- La newsletter du pied de page est une **démo front-end** (aucune donnée envoyée). Branche-la à ton outil d'emailing (Brevo, Mailchimp…) via l'attribut `action` du `<form>` si besoin.
- Les liens vers les outils et formations sont fournis à titre informatif ; le site n'est affilié à aucune marque tierce.
- Les vidéos restent hébergées par leurs créateurs sur YouTube.

---

## 🔧 Compatibilité

Testé pour les navigateurs modernes (Chrome, Edge, Firefox, Safari). Pas de polyfill nécessaire ; dégradations gracieuses si JavaScript est désactivé (le contenu reste lisible).
