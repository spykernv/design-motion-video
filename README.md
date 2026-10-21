# 🎬 design-motion-video

Studio de **motion design et de vidéos générées par code** avec
[Remotion](https://www.remotion.dev) (React + TypeScript + TailwindCSS v4).

Chaque vidéo est un composant React dont l'apparence dépend de la frame courante,
puis est rendue en MP4/PNG via la CLI Remotion.

## Démarrage rapide

```bash
npm install          # déjà fait lors du setup
npm run dev          # ouvre le Studio Remotion sur http://localhost:3000
```

## Commandes

| Action | Commande |
|---|---|
| Studio (aperçu live) | `npm run dev` |
| Lister les compositions | `npm run compositions` |
| Rendre une vidéo | `npm run render <id> out/<id>.mp4` |
| Rendre une image | `npm run still <id> out/<id>.png` |
| Vérifier les types | `npm run typecheck` |
| Mettre à jour Remotion | `npm run upgrade` |

Exemple : `npm run render HelloWorld out/hello.mp4`

## Travailler avec une IA (Claude Code)

Ce repo est structuré pour qu'un agent IA sache quoi lire :

- **[CLAUDE.md](CLAUDE.md)** — règles et workflow (à lire en premier).
- **[docs/remotion-rules.md](docs/remotion-rules.md)** — référence API Remotion complète.
- **[docs/references/](docs/references/)** — références ajoutées au fil du temps.

## Structure

```
src/
├── index.ts                 # Point d'entrée Remotion
├── Root.tsx                 # Registre des compositions
├── index.css                # Tailwind
└── compositions/            # Une vidéo = un dossier
    └── HelloWorld/          # Exemple de référence
public/                      # Assets → staticFile('...')
docs/                        # Règles & références pour l'IA
```
