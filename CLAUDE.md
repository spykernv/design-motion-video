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

## 2ter. Les skills du studio

| Skill | Quand |
|---|---|
| **`studio-video`** (maison, `.claude/skills/studio-video/`) | Toute vidéo à créer, refaire, modifier ou décliner : la méthode du studio, de l'entretien au rendu final (brief et storyboard validés, contrôle des images, formats). **À suivre pour toute nouvelle vidéo.** |
| **`remotion-best-practices`** (officielle, Remotion) | Le détail d'une API : audio, sous-titres, transitions, polices, 3D, vidéos transparentes, ffmpeg. |
| **`video-use`** (Browser Use) | Monter des rushes filmés : transcrire, couper les hésitations et les silences, étalonner, sous-titrer (§ 8). |

- Les skills externes s'installent et se mettent à jour avec `npx skills` (sources dans `skills-lock.json`) :
  `npx skills update`. Ne pas les modifier à la main, une mise à jour écraserait le changement : ce qui est propre
  au studio va dans ce fichier ou dans `studio-video`.
- Les skills HyperFrames (HTML + GSAP) ne sont pas installées, exprès : elles visent un autre moteur et se
  déclarent prioritaires pour toute demande de vidéo.

## 3. Workflow : créer une nouvelle vidéo

**Suivre la skill `studio-video`** : entretien, `BRIEF.md` validé, `STORYBOARD.md` validé, construction, contrôle
des images, brouillon montré, final et déclinaisons. Les étapes techniques de la construction :

1. Créer un dossier `src/compositions/<NomDeLaVideo>/` (projet confidentiel : `src/private/compositions/`, § 6).
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
├── ONBOARDING.md                  # Première vidéo test après un clone
├── README.md                      # Présentation humaine du repo
├── package.json                   # Dépendances + scripts
├── remotion.config.ts             # Config Studio/rendu (Tailwind activé ici)
├── skills-lock.json               # Sources des skills externes (`npx skills`)
├── tsconfig.json
├── src/
│   ├── index.ts                   # Point d'entrée (registerRoot) — ne pas modifier
│   ├── Root.tsx                   # Registre des compositions (<Composition>)
│   ├── index.css                  # Import Tailwind
│   ├── compositions/              # Une vidéo = un dossier ici (BRIEF.md, STORYBOARD.md, composants)
│   │   └── HelloWorld/HelloWorld.tsx   # Modèle de référence
│   └── private/                   # Projets privés, ignorés par git (entrée : src/private/index.ts)
├── public/                        # Assets statiques → staticFile('...') ; public/private/ ignoré par git
├── scripts/                       # Analyse de musique, mixage, films de l'app (un dossier par vidéo)
├── blender/                       # Plans 3D rendus par script (Blender)
├── docs/
│   ├── remotion-rules.md          # Référence API Remotion (autorité rapide)
│   └── references/                # Réfs ajoutées au fil de l'eau par l'utilisateur
├── rushes/                        # Rushes filmés pour video-use, ignorés par git (§ 8)
├── out/                           # Rendus, ignorés par git
├── .claude/skills/                # studio-video (maison), remotion-best-practices, video-use
└── .agents/skills/                # remotion-best-practices, format multi-agents (géré par `npx skills`)
```

**Le dépôt est public.** Une vidéo de client ou confidentielle vit dans `src/private/` : `src/private/index.ts`
enregistre `src/private/Root.tsx`, qui reprend le `Root` partagé et ajoute les compositions privées. Studio :
`npx remotion studio src/private/index.ts` ; rendu : `npx remotion render src/private/index.ts <id> out/<id>.mp4`.
Ses assets vont dans `public/private/<projet>/`. Rien de tout cela n'est commité.

## 7. Avant de livrer du code

- [ ] La composition est enregistrée dans `Root.tsx` avec un `id` unique.
- [ ] Aucun `Math.random()` / `Date.now()` / timer JS.
- [ ] `interpolate()` avec clamp.
- [ ] `npm run typecheck` passe.
- [ ] Les images ont été regardées (planche de contrôle de `studio-video` ouverte avec `Read`) : un typecheck
      vert ne prouve pas que la vidéo est bonne.
- [ ] `git status` ne liste rien de privé (projet client, assets sous licence, rushes).
- [ ] Si l'utilisateur veut « voir » : proposer un rendu (`render`/`still`) ou
      le lien `localhost:3000` du Studio.

## 8. Monter des rushes filmés (video-use)

`video-use` monte une vidéo filmée par la conversation : transcription au mot près (ElevenLabs Scribe), stratégie de
coupe validée avec l'utilisateur, hésitations et silences retirés, étalonnage, sous-titres, son normalisé. Sa skill
(`.claude/skills/video-use/SKILL.md`) donne la méthode ; ce qui suit l'adapte au studio et l'emporte sur elle.

- **Prérequis, une fois par poste** : [`uv`](https://docs.astral.sh/uv/), `ffmpeg` et `ffprobe` dans le PATH, et une
  clé ElevenLabs. L'utilisateur écrit lui-même sa clé dans `.env` à la racine du dépôt (`ELEVENLABS_API_KEY=…`,
  fichier ignoré par git) : ne jamais la demander dans la conversation ni l'afficher. L'environnement Python se crée
  seul au premier lancement.
- **Lancer un script**, depuis la racine du dépôt (Bash comme PowerShell) :
  `uv run --project .claude/skills/video-use python .claude/skills/video-use/helpers/<script>.py …`
  (`transcribe.py`, `transcribe_batch.py`, `pack_transcripts.py`, `timeline_view.py`, `render.py`, `grade.py`).
- **Les rushes** vont dans `rushes/<projet>/`, ignoré par git : ils sont lourds, souvent privés, et le dépôt est
  public. video-use écrit son travail dans `rushes/<projet>/edit/`. La transcription coûte des crédits : elle est
  gardée en cache, ne jamais la relancer sur un fichier inchangé.
- **Les animations d'un montage** sont des compositions de ce studio, faites avec `studio-video`, et non un projet
  Remotion créé dans le dossier du slot comme video-use le propose. Les rendre aux dimensions et à la cadence du
  montage, vers `rushes/<projet>/edit/animations/slot_<id>/render.mp4`, ou en `.mov` ProRes 4444 avec transparence
  pour un habillage posé sur l'image (`rules/transparent-videos.md` de remotion-best-practices).
- **L'analyse de musique** du studio (`scripts/vyra-teaser/analyse.py`, librosa) tourne dans le même environnement :
  `uv run --project .claude/skills/video-use python scripts/vyra-teaser/analyse.py <musique> <timing.json>`.

---
*Pour les détails d'API (Sequence, spring, transitions, Lambda, etc.) → [docs/remotion-rules.md](docs/remotion-rules.md).*
