# Travel Map

Application web de planification de voyage sur globe interactif avec vue satellite.

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

## Vue satellite (recommandé)

Par défaut, la carte utilise OpenFreeMap (gratuit, sans clé). Pour activer la **vue satellite avec labels** (pays, villes, rues) :

1. Créer un compte gratuit sur [MapTiler Cloud](https://cloud.maptiler.com/account/keys)
2. Copier votre clé API
3. L'ajouter dans le fichier `.env` à la racine du projet :

```
VITE_MAPTILER_KEY=votre_cle_ici
```

4. Relancer `npm run dev`

Le tier gratuit MapTiler offre 100K requêtes/mois, largement suffisant pour le développement et l'usage personnel.

## Stack

- **React 19** + TypeScript strict
- **Vite 7** (build + dev server)
- **Tailwind CSS v4** (styling, design tokens)
- **MapLibre GL JS v5** (globe 3D, tuiles vectorielles, zoom satellite)
- **react-map-gl v8** (intégration React du globe)
- **Zustand v5** (state management + persistence localStorage)
- **Nominatim / OpenStreetMap** (géocodage, aucune clé API requise)

## Fonctionnalités

- Globe 3D interactif avec projection globe (vue Terre)
- Vue satellite avec zoom jusqu'au niveau rue
- Labels dynamiques : pays, villes, rues, points d'intérêt
- Ajout de destinations par recherche ou clic sur la carte
- Arcs great-circle reliant les destinations
- Panneau latéral d'édition (destination, trajet, sous-lieux)
- Liste d'itinéraire avec drag-to-reorder
- Sauvegarde automatique en localStorage
- Design sombre premium, responsive

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Preview du build |
| `npm run lint` | ESLint |

## Architecture

```
src/
├── components/
│   ├── globe/       Carte MapLibre + overlay
│   ├── panel/       Panneau d'édition
│   ├── itinerary/   Liste d'itinéraire
│   ├── layout/      Structure globale
│   └── ui/          Composants réutilisables
├── store/           Zustand store
├── services/        Géocodage Nominatim
├── hooks/           Hooks utilitaires
├── types/           Types TypeScript
├── constants/       Configuration
└── utils/           Utilitaires
```
