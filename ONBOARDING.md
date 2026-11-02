# ONBOARDING — première vidéo test après un `git clone`

> Ce guide s'adresse à **l'agent IA** (Claude Code ou équivalent) d'une personne qui vient de cloner ce dépôt.
> But : installer le studio, rendre une vidéo test de 6 s, la montrer à la personne. Compte 5 à 10 minutes.
> La personne n'a qu'à te dire : « Suis ONBOARDING.md ».

Lis [CLAUDE.md](CLAUDE.md) avant d'écrire du code : il fixe les règles Remotion de ce studio. Pour tout détail
d'API, ouvre le skill `remotion-best-practices` (`.claude/skills/`, fourni avec le dépôt).

## Règles pendant l'onboarding

- Ne commite rien, ne pousse rien. La vidéo test reste sur le poste ; propose de la supprimer à la fin.
- Ne lance pas Blender ni le rendu de `VyraTeaser` : ses images de château ne sont pas dans le dépôt
  (210 Mo, recalculées en ~50 min par `blender/vyra-teaser/chateau.py`). Ce n'est pas un test.
- Lance les commandes toi-même et montre le résultat ; ne demande pas à la personne de taper quoi que ce soit.

## 1. Prérequis

Vérifie, et arrête-toi en disant ce qui manque :

- `node -v` : 20 ou plus (le studio est développé sous Node 24).
- `npm -v`.
- Rien d'autre : Remotion embarque son ffmpeg et télécharge son propre Chrome au premier rendu.

## 2. Installation

```bash
npm ci
npm run compositions
```

`npm run compositions` doit lister au moins `VyraTeaser`, `VyraFeedPost`, `VyraTeaser-StyleFrames`, `HelloWorld`,
`RadarIntro` et `MarqueeMotion`. Une erreur ici = installation cassée : lis-la et corrige avant d'aller plus loin.

## 3. Rendu de contrôle

```bash
npx remotion render HelloWorld out/hello.mp4
```

Le premier rendu télécharge Chrome Headless Shell (une fois). Le MP4 arrive dans `out/` (ignoré par git).

## 4. La vidéo test

Demande à la personne une phrase courte (sinon : « Ma première vidéo »), puis crée-la :

1. `src/compositions/TestVideo/TestVideo.tsx`, sur le modèle de
   [HelloWorld](src/compositions/HelloWorld/HelloWorld.tsx) :
   - fond noir, la phrase centrée en blanc, grande ;
   - entrée de 0 à 1 s avec `spring()` (montée + fondu), maintien, sortie en fondu sur la dernière seconde ;
   - tout est piloté par `useCurrentFrame()` ; chaque `interpolate()` avec `extrapolateLeft` et `extrapolateRight`
     à `'clamp'` ; pas de `Math.random()`, `Date.now()`, minuteur ni animation CSS.
2. Déclare-la dans [src/Root.tsx](src/Root.tsx) : `id="TestVideo"`, `durationInFrames={180}`, `fps={30}`,
   `width={1080}`, `height={1920}` (vertical, format Reels), la phrase en `defaultProps`.
3. Vérifie et rends :

   ```bash
   npm run typecheck
   npx remotion still TestVideo out/test-video.png --frame=60
   npx remotion render TestVideo out/test-video.mp4
   ```

4. **Regarde l'image `out/test-video.png`** avant d'annoncer quoi que ce soit : texte lisible, centré, pas coupé.
   Corrige et relance si besoin. Un typecheck qui passe ne prouve pas que la vidéo est bonne.

## 5. Ce que tu rends à la personne

- Le chemin de `out/test-video.mp4` et l'image de contrôle.
- Pour l'aperçu en direct : `npm run dev` ouvre Remotion Studio sur http://localhost:3000 (port pris :
  `npx remotion studio --port 3001`). La personne doit ouvrir l'adresse dans son navigateur.
- Une proposition : supprimer `src/compositions/TestVideo/` et retirer sa déclaration de `src/Root.tsx`, pour
  laisser le dépôt propre.

## En cas de souci

| Symptôme | Correction |
| --- | --- |
| Écran noir ou erreur WebGL sur une composition 3D | Ajouter `--gl=angle` au rendu (Windows) |
| `remotion add` échoue (`ENOENT spawn npm`, Windows) | `npm install --save-exact @remotion/<pkg>@<version de remotion>` |
| Police absente au rendu | Charger la police avec `@remotion/google-fonts`, jamais une police système |
| Le rendu se bloque au téléchargement de Chrome | Vérifier l'accès réseau, puis relancer |

## Pour aller plus loin

Une vraie vidéo suit la skill `studio-video` (`.claude/skills/studio-video/`) : brief et storyboard validés avant le
code, montage calé sur la musique, contrôle des images avant livraison. Exemple complet :
`src/compositions/VyraTeaser/`. Pour monter des rushes filmés (interview, prise de parole) : `video-use`, voir
[CLAUDE.md](CLAUDE.md) § 8.
