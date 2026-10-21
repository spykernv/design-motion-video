# Référence API Remotion (autorité)

> Source : prompt officiel Remotion pour agents IA + https://www.remotion.dev/docs.
> Document de référence faisant autorité pour ce repo. En cas de doute sur une API,
> c'est ici. Pour les bonnes pratiques de haut niveau, voir aussi [CLAUDE.md](../CLAUDE.md).

## À propos de Remotion

Remotion est un framework qui crée des **vidéos par programmation**, basé sur React.js.
Toute sortie doit être du **React valide écrit en TypeScript**.

## Structure d'un projet

Un projet Remotion comprend un fichier d'entrée, un fichier Root, et un nombre quelconque
de fichiers de composants React.

**Fichier d'entrée** (`src/index.ts`) :

```ts
import {registerRoot} from 'remotion';
import {Root} from './Root';

registerRoot(Root);
```

**Fichier Root** (`src/Root.tsx`) :

```tsx
import {Composition} from 'remotion';
import {MyComp} from './MyComp';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComp}
        durationInFrames={120}
        width={1920}
        height={1080}
        fps={30}
        defaultProps={{}}
      />
    </>
  );
};
```

Une `<Composition>` définit une vidéo rendable : un composant React (`component`), un `id`,
une durée (`durationInFrames`), une largeur (`width`), une hauteur (`height`) et une
cadence (`fps`).

- `fps` par défaut : **30**
- `height` par défaut : **1080**, `width` par défaut : **1920**
- `id` par défaut : **"MyComp"**
- `defaultProps` doit avoir la forme des props attendues par le composant.

Dans un composant, `useCurrentFrame()` donne le numéro de frame courant. Les frames
commencent à **0**.

```tsx
export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  return <div>Frame {frame}</div>;
};
```

## Règles des composants

Un composant peut retourner des balises HTML et SVG classiques. Il existe des balises
spéciales pour la vidéo et l'audio, qui acceptent des styles CSS normaux.

### Vidéo — `<Video>` (de `@remotion/media`)

```tsx
import {Video} from '@remotion/media';

export const MyComp: React.FC = () => {
  return (
    <div>
      <Video src="https://remotion.dev/bbb.mp4" style={{width: '100%'}} />
    </div>
  );
};
```

- `trimBefore` : rogne le début de la vidéo d'un nombre de frames.
- `trimAfter` : limite la durée d'affichage de la vidéo.
- `volume` : volume entre 0 et 1.

### Image non animée — `<Img>` (de `remotion`)

```tsx
import {Img} from 'remotion';

export const MyComp: React.FC = () => {
  return <Img src="https://remotion.dev/logo.png" style={{width: '100%'}} />;
};
```

### GIF animé — `<Gif>` (de `@remotion/gif`)

Installer `@remotion/gif`, puis :

```tsx
import {Gif} from '@remotion/gif';

export const MyComp: React.FC = () => {
  return (
    <Gif
      src="https://media.giphy.com/media/l0MYd5y8e1t0m/giphy.gif"
      style={{width: '100%'}}
    />
  );
};
```

### Audio — `<Audio>` (de `@remotion/media`)

```tsx
import {Audio} from '@remotion/media';

export const MyComp: React.FC = () => {
  return <Audio src="https://remotion.dev/audio.mp3" />;
};
```

- `trimBefore` : rogne le début de l'audio d'un nombre de frames.
- `trimAfter` : limite la durée d'affichage.
- `volume` : volume entre 0 et 1.

### Sources d'assets

Une source peut être une **URL distante** ou un asset du dossier `public/`. Pour un asset
de `public/`, utiliser `staticFile()` :

```tsx
import {staticFile} from 'remotion';
import {Audio} from '@remotion/media';

export const MyComp: React.FC = () => {
  return <Audio src={staticFile('audio.mp3')} />;
};
```

### Superposition — `<AbsoluteFill>`

Pour empiler deux éléments l'un sur l'autre :

```tsx
import {AbsoluteFill} from 'remotion';

export const MyComp: React.FC = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'blue'}}>
        <div>Au fond</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'blue'}}>
        <div>Au premier plan</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

## Séquençage

### `<Sequence>` — décaler un élément dans le temps

```tsx
import {Sequence} from 'remotion';

export const MyComp: React.FC = () => {
  return (
    <Sequence from={10} durationInFrames={20}>
      <div>N'apparaît qu'après 10 frames</div>
    </Sequence>
  );
};
```

- `from` : frame d'apparition. Peut être **négatif** (démarre tout de suite mais coupe
  les `from` premières frames).
- `durationInFrames` : durée d'affichage.
- Si un enfant appelle `useCurrentFrame()`, le compteur démarre à 0 à l'apparition de la Sequence :

```tsx
import {Sequence} from 'remotion';

export const Child: React.FC = () => {
  const frame = useCurrentFrame();
  return <div>À la frame 10, ceci vaut 0 : {frame}</div>;
};

export const MyComp: React.FC = () => {
  return (
    <Sequence from={10} durationInFrames={20}>
      <Child />
    </Sequence>
  );
};
```

### `<Series>` — éléments les uns après les autres

```tsx
import {Series} from 'remotion';

export const MyComp: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={20}>
        <div>Apparaît immédiatement</div>
      </Series.Sequence>
      <Series.Sequence durationInFrames={30}>
        <div>Apparaît après 20 frames</div>
      </Series.Sequence>
      <Series.Sequence durationInFrames={30} offset={-8}>
        <div>Apparaît après 42 frames</div>
      </Series.Sequence>
    </Series>
  );
};
```

`Series.Sequence` n'a pas de `from`, mais un `offset` qui décale le départ d'un nombre de frames.

### `<TransitionSeries>` — transitions entre plans (de `@remotion/transitions`)

```tsx
import {
  linearTiming,
  springTiming,
  TransitionSeries,
} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';

export const MyComp: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="blue" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={springTiming({config: {damping: 200}})}
        presentation={fade()}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="black" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={linearTiming({durationInFrames: 30})}
        presentation={wipe()}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="white" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

`TransitionSeries.Sequence` fonctionne comme `Series.Sequence` mais sans `offset`.
**L'ordre compte** : un `TransitionSeries.Transition` doit toujours être **entre** deux
`TransitionSeries.Sequence`.

## Déterminisme & aléatoire

Tout le code React doit être **déterministe**. `Math.random()` est **interdit**. Pour de
l'aléatoire, utiliser `random()` de `remotion` avec une **graine statique** (retourne 0–1) :

```tsx
import {random} from 'remotion';

export const MyComp: React.FC = () => {
  return <div>Nombre aléatoire : {random('my-seed')}</div>;
};
```

## Animation

### `interpolate()` — animer une valeur dans le temps

```tsx
import {interpolate} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [0, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div>
      Frame {frame} : {value}
    </div>
  );
};
```

- 1er argument : la valeur à animer.
- 1er tableau : plage d'entrée ; 2e tableau : plage de sortie.
- 4e argument optionnel : **par défaut, ajouter** `extrapolateLeft: 'clamp'` et
  `extrapolateRight: 'clamp'`.

### `useVideoConfig()` — accéder à fps / durée / dimensions

```tsx
import {useVideoConfig} from 'remotion';

export const MyComp: React.FC = () => {
  const {fps, durationInFrames, height, width} = useVideoConfig();
  return (
    <div>
      fps : {fps} durationInFrames : {durationInFrames} height : {height} width : {width}
    </div>
  );
};
```

### `spring()` — mouvement à ressort

Anime de 0 à 1 par défaut ; la durée n'est pas fixée à l'avance.

```tsx
import {spring} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const value = spring({
    fps,
    frame,
    config: {damping: 200},
  });
  return (
    <div>
      Frame {frame} : {value}
    </div>
  );
};
```

## Rendu

- Rendre une vidéo : `npx remotion render [id]` — ex. `npx remotion render MyComp`
- Rendre une image fixe : `npx remotion still [id]` — ex. `npx remotion still MyComp`

## Rendu sur AWS Lambda

Rendu dans le cloud via AWS Lambda. Setup : https://www.remotion.dev/docs/lambda/setup.
Nécessite une fonction Lambda et un site déployé sur S3.

**Via la CLI :**
- Déployer la fonction : `npx remotion lambda functions deploy`
- Déployer le site : `npx remotion lambda sites create` (1er argument = point d'entrée)
- Rendre : `npx remotion lambda render [comp-id]`

**Via les API Node.js :**
- `deployFunction()` — https://www.remotion.dev/docs/lambda/deployfunction
- `deploySite()` — https://www.remotion.dev/docs/lambda/deploysite
- `renderMediaOnLambda()` — https://www.remotion.dev/docs/lambda/rendermediaonlambda
- Suivre la progression avec `getRenderProgress()` — https://www.remotion.dev/docs/lambda/getrenderprogress
