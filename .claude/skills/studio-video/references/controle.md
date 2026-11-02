# Contrôler avant de montrer

## Sommaire

- L'outil : `controle.mjs`
- Quelles frames regarder
- Ce qu'on vérifie sur chaque case
- Les règles de qualité
- Le son
- Le fichier
- Quand l'image scintille

## L'outil : `controle.mjs`

```bash
node .claude/skills/studio-video/scripts/controle.mjs planche <vidéo> <frames> [--cols 5] [--largeur 320] [-o sortie.png]
node .claude/skills/studio-video/scripts/controle.mjs son <vidéo ou audio>
```

- `<frames>` : des numéros séparés par des virgules (`0,75,181,241,899`), ou `auto:12` pour 12 frames réparties sur
  toute la durée.
- La planche s'écrit à côté de la vidéo (`<nom>-planche.png`). Le script liste les cases dans l'ordre (de gauche à
  droite, puis de haut en bas), avec leur frame et leur temps. Ouvre-la avec `Read`.
- Une case de 320 px de large est à peu près ce que voit quelqu'un sur son téléphone : un texte illisible sur la
  planche l'est aussi dans la main.
- Il faut `ffmpeg` et `ffprobe` dans le PATH : celui que Remotion embarque n'a pas les filtres nécessaires (`select`,
  `tile`, `ebur128`). Sans eux : `npx remotion still <id> <sortie.png> --frame=<f>`, une image à la fois, plus lent
  (chaque appel reprépare le projet).

## Quelles frames regarder

Pars des coupes et des impacts d'`edit.ts` :

- la première et la dernière frame ; pour une boucle, les deux côte à côte, qui doivent raccorder ;
- chaque texte une fois entièrement arrivé (son départ plus la durée de son entrée) ;
- chaque coupe : la frame d'avant et celle d'après ;
- chaque impact, chaque moment fort, la signature tenue ;
- une ou deux frames au milieu des plans longs, pour voir que rien n'est figé ni vide.

## Ce qu'on vérifie sur chaque case

- L'image attendue à la frame attendue, ni en avance ni en retard.
- Le texte est lisible, entier, dans la zone sûre (`references/formats.md`) ; aucune lettre coupée par le bord.
- La bonne police, pas une police de secours.
- Seulement les couleurs du brief.
- Rien de vide ni de figé sans raison ; pas de frame noire ou blanche involontaire autour d'une coupe.
- Une seule nouveauté à la fois.
- Pas de bandes dans les dégradés sombres.
- Les règles de marque du storyboard : mots interdits, mention « démo », logos.

## Les règles de qualité

Relis le storyboard et la planche avec cette liste :

1. **Rien de mort** : quelque chose bouge à chaque instant, sauf une tenue voulue.
2. **Le moment fort tient** : 1 s au moins, la signature 2 s, l'image finale 1 s avant la fin.
3. **Le mouvement dure tout le plan** : si les entrées sont finies à la moitié, ajoute un mouvement secondaire (un
   filet qui se trace, une lueur qui respire).
4. **Trois easings différents au moins par plan.**
5. **Jamais deux fois la même transition de suite**, sauf des coupes franches sur le temps.
6. **Sur les réseaux, un moment fort toutes les 5 s environ** : un claquement de texte, une révélation de lumière, un
   mouvement de caméra. Pour une marque calme, un contraste plutôt qu'un effet.
7. **Un claquement arrive après le texte qu'il ponctue**, une fois ce texte entièrement visible.
8. **Le fond est une couche, pas une couleur** : lueur, grain, matière ; ou un noir voulu, qui fait partie de la marque.
9. **Trois flashs par seconde au plus**, et pas de grand flash rouge saturé : risque photosensible (WCAG 2.3.1).
10. **Une vidéo sociale se comprend sans le son.**

## Le son

`controle.mjs son` donne la sonie intégrée, la crête vraie et la plage de sonie.

- Cible : −14 LUFS intégrés (à 1 près), crête vraie de −1 dBTP au plus.
- La durée du son égale celle de la vidéo ; pas de silence au début qui ne soit voulu.
- Une fin 15 dB sous le reste, ou des bruitages plus forts que la voix, sont des défauts.
- Tu ne peux pas écouter : dis-le à la personne, donne les chiffres, et laisse-lui le jugement du goût.

## Le fichier

- `ffprobe` : durée égale à `durationInFrames / fps`, les bonnes dimensions, H.264 en `yuv420p` pour les réseaux.
- Le poids : une copie allégée si l'envoi l'exige (`references/formats.md`).

## Quand l'image scintille

Une frame qui change d'un rendu à l'autre vient presque toujours de `Math.random()` ou `Date.now()` (utiliser
`random('graine')`), d'une animation CSS ou d'un minuteur au lieu de la frame, d'une image chargée sans `<Img>`,
d'une police non attendue, ou d'une animation Lottie non déterministe. Détails dans les `rules/` de
remotion-best-practices. Pour en avoir le cœur net, rends deux fois la même frame et compare-les.
