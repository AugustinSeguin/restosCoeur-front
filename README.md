# Workshop Client Front

Frontend React + Vite.

## Configuration `.env`

Ce projet utilise `axios` avec `import.meta.env.VITE_API_URL` (voir `src/api/axiosConfig.ts`).

Important: avec Vite, seules les variables préfixées par `VITE_` sont exposées au code frontend.

### Fichiers

- `.env` (local): valeurs réelles pour ton environnement.
- `.env.example`: exemple versionnable pour l'équipe.

### Variable requise

```env
VITE_API_URL=https://api.elix.cleanascode.fr
```

Notes:

- Ne pas utiliser `API_URL` sans préfixe: elle ne sera pas accessible côté React.
- Évite le slash final si ton backend n'en a pas besoin, pour éviter les doubles `/` dans les routes.

## Installation

```bash
npm install
```

## Lancer le projet (dev)

```bash
npm run dev
```

Le serveur Vite sera disponible sur l'URL affichée dans le terminal (souvent `http://localhost:5173`).

## Build production

```bash
npm run build
```

## Prévisualiser le build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```
