# CLAUDE.md — Studio Motion Design & Vidéo (Remotion)

> Ce fichier est le **point d'entrée pour toute IA** qui travaille dans ce repo.
> Lis-le en entier avant de produire du code. Il définit comment ce projet
> fonctionne, les règles non négociables, et le workflow pour créer une vidéo.
>
> **Dépôt tout juste cloné ?** Suivre d'abord [ONBOARDING.md](ONBOARDING.md) : installation et vidéo test.

## 1. Ce qu'est ce projet

Un studio de **motion design et de vidéos générées par code** avec
[Remotion](https://www.remotion.dev). Tout le rendu visuel est du **React + TypeScript**.
Une vidéo = un composant React dont l'apparence dépend du numéro de frame courant.

- Stack : **Remotion 4.x**, **React 19**, **TypeScript**, **TailwindCSS v4**.
- Une « composition » = une vidéo rendable, déclarée dans [`src/Root.tsx`](src/Root.tsx).

## 2. Règles non négociables (Remotion)

Deux sources de connaissance Remotion sont disponibles :
- **[docs/remotion-rules.md](docs/remotion-rules.md)** — référence API condensée (autorité rapide).
- **Skill `remotion-best-practices`** (dans `.claude/skills/`) — best practices détaillées
  par sujet (audio, captions, transitions, polices, 3D, ffmpeg…). Le consulter pour les
  cas avancés. Voir `.claude/skills/remotion-best-practices/rules/`.

Les règles critiques à ne jamais enfreindre :

1. **Déterminisme** : `Math.random()` et `Date.now()` sont **interdits**. Pour de
   l'aléatoire, utiliser `random('une-graine')` de `remotion` (retourne 0–1).
2. **Animer avec la frame** : récupérer le temps via `useCurrentFrame()`. Ne jamais
   utiliser `setTimeout`, `requestAnimationFrame` ou des animations CSS pour le timing.
3. **`interpolate()`** : toujours passer `extrapolateLeft: 'clamp'` et
   `extrapolateRight: 'clamp'` par défaut.
4. **Médias** : `<Video>` et `<Audio>` viennent de `@remotion/media` ; `<Img>` et
   `staticFile()` de `remotion` ; `<Gif>` de `@remotion/gif`.
5. **Assets locaux** : placer dans `public/` et référencer avec `staticFile('nom.ext')`.
   Ne jamais utiliser de chemin relatif type `./mon-image.png`.
6. **Superposition** : empiler les calques avec `<AbsoluteFill>`.
7. **Séquençage** : `<Sequence>` / `<Series>` pour le temps ; `<TransitionSeries>`
   (de `@remotion/transitions`) pour les transitions entre plans.
8. **Tout doit être du React/TSX valide.** Pas de code non typé.
9. **Pas de Framer Motion** comme base d'animation : pas d'intégration officielle, et les
   animations non pilotées par `useCurrentFrame()` peuvent **flicker au rendu**. Tout
   passe par frame / `interpolate` / `spring`. (Idem : attention aux expressions Lottie
   non déterministes.)

## 2bis. Packages & licence

- **Ajouter un package `@remotion/*`** → préférer `npx remotion add <pkg>` (aligne les
  versions de tous les packages Remotion). ⚠️ Sur cette machine Windows, `remotion add`
  échoue à lancer npm (`ENOENT spawn npm`) → **fallback** : `npm install --save-exact
  @remotion/<pkg>@<version-de-remotion>` (même version que le package `remotion`, ici
  `4.0.471`, pour garder l'alignement). Les libs **communautaires** : `npm install`.
- **Stack installée et guide complet de choix de packages** (par cas d'usage UGC/social,
  SaaS, premium…) → [docs/references/remotion-stack-packages.md](docs/references/remotion-stack-packages.md).
- **Licence** : Remotion est gratuit pour un individu, une société à but lucratif
  **≤ 3 employés**, les non-profits, ou l'évaluation non commerciale. Au-delà, licence
  entreprise requise. → https://www.remotion.dev/docs/license

## 3. Workflow : créer une nouvelle vidéo

1. Créer un dossier `src/compositions/<NomDeLaVideo>/`.
2. Y écrire le composant principal (voir [HelloWorld](src/compositions/HelloWorld/HelloWorld.tsx) comme modèle).
3. **Enregistrer** la composition dans [`src/Root.tsx`](src/Root.tsx) avec un `id` **unique**
   (`durationInFrames`, `fps`, `width`, `height`, `defaultProps`).
4. Valeurs par défaut : `fps={30}`, `width={1920}`, `height={1080}` (sauf demande contraire,
   ex. `1080x1920` pour du vertical/Reels).
5. Vérifier les types : `npm run typecheck`.

> Conventions : un dossier par composition, PascalCase pour les composants,
> styles via classes Tailwind (préférer aux styles inline, sauf valeurs animées
> qui passent par `style={{...}}`).

## 4. Commandes

| Action | Commande |
|---|---|
| Lancer le Studio (preview) | `npm run dev` |
| Lister les compositions | `npm run compositions` |
| Rendre une vidéo en MP4 | `npm run render <id> out/<id>.mp4` |
| Rendre une image fixe | `npm run still <id> out/<id>.png` |
| Vérifier les types | `npm run typecheck` |
| Mettre à jour Remotion | `npm run upgrade` |

Exemple : `npm run render HelloWorld out/hello.mp4`

## 5. ⚠️ Contexte : Claude Code Desktop (pas de terminal natif)

L'utilisateur travaille depuis **l'application Claude Code Desktop**, pas un terminal.
Conséquences à garder en tête :

- **Le rendu (`render` / `still`) fonctionne sans souci** : c'est headless, ça produit
  un fichier dans `out/`. C'est le mode privilégié pour livrer un résultat à l'utilisateur.
- **Le Studio (`npm run dev`) est un serveur long qui s'ouvre sur `http://localhost:3000`.**
  Je peux le lancer en arrière-plan, mais **l'utilisateur doit ouvrir cette URL dans son
  navigateur** pour voir l'aperçu en direct. → Le lui indiquer explicitement.
- Pour montrer un résultat sans serveur : **rendre une image fixe ou une courte vidéo**
  puis la présenter, plutôt que de compter sur le Studio.

## 6. Structure du repo

```
.
├── CLAUDE.md                      # Ce fichier — règles IA, à lire en premier
├── README.md                      # Présentation humaine du repo
├── package.json                   # Dépendances + scripts
├── remotion.config.ts             # Config Studio/rendu (Tailwind activé ici)
├── tsconfig.json
├── src/
│   ├── index.ts                   # Point d'entrée (registerRoot) — ne pas modifier
│   ├── Root.tsx                   # Registre des compositions (<Composition>)
│   ├── index.css                  # Import Tailwind
│   └── compositions/              # Une vidéo = un dossier ici
│       └── HelloWorld/HelloWorld.tsx   # Modèle de référence
├── public/                        # Assets statiques → staticFile('...')
├── docs/
│   ├── remotion-rules.md          # Référence API Remotion (autorité rapide)
│   └── references/                # Réfs ajoutées au fil de l'eau par l'utilisateur
├── .claude/skills/                # Skill officiel remotion-best-practices (Claude Code)
└── .agents/skills/                # Même skill, format multi-agents (géré par `npx skills`)
```

## 7. Avant de livrer du code

- [ ] La composition est enregistrée dans `Root.tsx` avec un `id` unique.
- [ ] Aucun `Math.random()` / `Date.now()` / timer JS.
- [ ] `interpolate()` avec clamp.
- [ ] `npm run typecheck` passe.
- [ ] Si l'utilisateur veut « voir » : proposer un rendu (`render`/`still`) ou
      le lien `localhost:3000` du Studio.

---
*Pour les détails d'API (Sequence, spring, transitions, Lambda, etc.) → [docs/remotion-rules.md](docs/remotion-rules.md).*
