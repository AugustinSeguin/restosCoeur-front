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

## Deploiement

## CI / Pipeline (GitHub Actions)

Le frontend est construit avec Vite et peut être déployé via un pipeline CI (build + copie des fichiers statiques vers un hébergeur ou VPS). Dans notre setup, le backend est déployé via `.github/workflows` — pour le frontend, adaptez un workflow similaire qui :

- installe les dépendances (`npm ci`),
- exécute `npm run build`,
- copie le contenu du dossier `dist/` vers le serveur de fichiers statiques ou le CDN.

Variables d'environnement importantes pour le frontend (GitHub Secrets ou env du serveur de build) :

- `VITE_API_URL` : URL publique de l'API (ex: https://api.elix.cleanascode.fr)

Ajouter le secret GitHub pour `VITE_API_URL` si besoin :

```bash
gh secret set VITE_API_URL --body "https://api.elix.cleanascode.fr"
```

## Déploiement manuel (Frontend)

Option A — Serveur statique (nginx)

1. Sur votre machine de build :

```bash
npm install
npm run build
# le build est dans dist/
```

2. Copier `dist/` sur le serveur (ex: `/var/www/app`)

```bash
scp -r dist/* user@server:/var/www/app/
```

3. Configurer `nginx` pour servir le contenu :

```nginx
server {
	listen 80;
	server_name app.monsite.fr;

	root /var/www/app;
	index index.html;

	location / {
		try_files $uri $uri/ /index.html;
	}
}
```

4. Reload nginx :

```bash
sudo systemctl reload nginx
```

Option B — Hébergement statique (Netlify, Vercel, S3 + CloudFront, etc.)

- Connectez le repo et configurez la commande de build `npm run build` et le dossier `dist` comme artefact.
- Définissez la variable d'environnement `VITE_API_URL` dans les settings du site.

Notes importantes :

- Le frontend lit `VITE_API_URL` à la build-time. Pour changer l'API endpoint il faut rebuild ou utiliser un proxy.
- Assurez-vous que `VITE_API_URL` n'inclut pas de slash final si votre code ne l'attend pas.
