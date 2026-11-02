# Formats et livraison

## Sommaire

- Les cadres
- Les zones sûres
- Recomposer, pas recadrer
- Le jeu complet pour une pub sur les réseaux Meta
- Livrer

## Les cadres

| Format | Taille | Pour |
|---|---|---|
| 9:16 | 1080×1920 | Reels, Stories, TikTok, Shorts |
| 4:5 | 1080×1350 | fil Instagram et Facebook : le cadre qui prend le plus de place dans le fil |
| 1:1 | 1080×1080 | fil, carrousels |
| 16:9 | 1920×1080 | YouTube, site, présentation, écran dans un lieu |

30 fps par défaut ; 60 pour une interface qui défile ; 24 pour un rendu cinéma.

## Les zones sûres

Les plateformes posent leurs boutons et leurs légendes par-dessus la vidéo.

- **9:16** : rien d'important au-dessus de 260 px ni sous 1500 px (420 px depuis le bas), ni dans les 140 px de
  droite. C'est `SAFE` dans `src/compositions/VyraTeaser/theme.ts`.
- **4:5 et 1:1** : une marge d'environ 60 px sur chaque bord.
- **16:9** : 5 % de marge (96 px) pour les titres, davantage pour un écran qui rogne l'image.

Déclare-les dans `theme.ts` et vérifie-les sur la planche.

## Recomposer, pas recadrer

Recadrer un 16:9 en 9:16 coupe les deux tiers de l'image ; des bandes noires font amateur. Chaque format a sa mise en
page, avec la même animation, le même montage (`edit.ts`) et le même son.

Dans Remotion, un seul composant lit son cadre avec `useVideoConfig()` et prend sa mise en page dans `theme.ts` :

```ts
// theme.ts
export const LAYOUTS = {
  '9x16': {titre: 132, marge: 80},
  '4x5': {titre: 112, marge: 72},
  '1x1': {titre: 104, marge: 64},
  '16x9': {titre: 120, marge: 96},
} as const;
export type Format = keyof typeof LAYOUTS;

export const formatOf = (width: number, height: number): Format => {
  const ratio = width / height;
  if (ratio < 0.7) return '9x16';
  if (ratio < 0.9) return '4x5';
  if (ratio < 1.2) return '1x1';
  return '16x9';
};
```

```tsx
const {width, height} = useVideoConfig();
const layout = LAYOUTS[formatOf(width, height)];
```

Dans `src/Root.tsx`, le master garde son `id` (`<Nom>`) ; chaque déclinaison ajoute son format (`<Nom>-4x5`,
`<Nom>-1x1`, `<Nom>-16x9`), avec le même composant et la même durée. Fais une planche par format : un texte qui
tenait en 9:16 peut sortir du cadre en 16:9.

## Le jeu complet pour une pub sur les réseaux Meta

Fais d'abord le 9:16 et fais-le valider. Ensuite seulement, propose les trois autres : 9:16, 4:5, 1:1 et 16:9
couvrent tous les emplacements. Même voix, mêmes temps, mêmes sous-titres ; seule la mise en page change. Tous à
−14 LUFS.

## Livrer

- Nommage : `out/<slug>/<slug>-v<N>-<format>.mp4` (`out/vyra-club/vyra-club-v1-9x16.mp4`), la couverture en
  `…-cover.png`.
- Réseaux : H.264 en MP4, le rendu par défaut de `npx remotion render`.
- Habillage à poser sur une autre vidéo, avec transparence : ProRes 4444 en `.mov` (`rules/transparent-videos.md` de
  remotion-best-practices).
- Copie allégée pour un envoi (WhatsApp, e-mail) :

  ```bash
  ffmpeg -i out/<slug>/<slug>-v1-9x16.mp4 -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out/<slug>/<slug>-v1-partage.mp4
  ```

- Avant de livrer : une planche `auto:12` et `controle.mjs son` sur le fichier final.
