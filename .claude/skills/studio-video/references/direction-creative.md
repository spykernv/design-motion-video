# Direction créative

## Sommaire

- La marque d'abord
- Réflexes à questionner
- Couleur
- Typographie
- Mise en page pour la vidéo
- Le mouvement dans Remotion
- Images, vidéos, 3D

## La marque d'abord

Une charte, un `theme.ts` d'une vidéo de la même marque ou un brief validé fixent les couleurs, les polices et les
interdits : on les applique tels quels. Ce qui suit sert à **appliquer** une marque à la vidéo (tailles, intensité,
mouvement) et à proposer une direction quand il n'y en a pas. Une marque ne dit pas comment composer un plan ; une
vidéo ne change pas les couleurs d'une marque.

## Réflexes à questionner

Ce sont les signatures d'une vidéo faite par une IA sans regard. Avant d'en utiliser un, demande-toi si c'est un
choix pour **ce** contenu ou un réflexe :

- texte en dégradé ; dégradés violet-bleu, cyan sur noir, néons par défaut ;
- `#000` et `#fff` purs ;
- tout centré, avec le même poids ;
- grilles de cartes identiques, liseré coloré à gauche des encadrés ;
- chaque élément qui entre par un petit glissé vers le haut et un fondu, avec le même easing ;
- Inter ou Roboto partout ;
- un zoom lent sur chaque plan ;
- étincelles, particules, glitch et flashs ajoutés « pour faire premium ». La v1 de La Porte en avait : jugés bon
  marché, retirés en v2.

Si le contenu l'appelle (un centrage solennel pour une signature), c'est un choix. Sinon, c'est un réflexe.

## Couleur

Sans marque, propose deux directions contrastées, en adaptant les teintes au sujet :

| Direction | Pour | Fond | Texte | Accent |
|---|---|---|---|---|
| Nuit premium | luxe, cinéma, finance | `#0b0a0f` | `#f4f1ea` | `#d9b26f` |
| Éditorial chaud | récit, documentaire | `#f3ede3` | `#1d1a16` | `#b5452b` |
| Clair net | explication, logiciel | `#f7f8fa` | `#14161a` | `#2f5bea` |
| Énergie | lancement, sport, réseaux | `#121212` | `#fafafa` | `#ff5a1f` |
| Électrique | nuit, jeu, tech | `#08070d` | `#e9e7f5` | `#8b6cff` |
| Doux | mode, beauté, bien-être | `#f6efeb` | `#2b2326` | `#d98c9a` |
| Monochrome | typographie pure, drame | `#0e0e0e` | `#f2f2f2` | `#8a8a8a` |

- **Un accent, cinq couleurs au plus, chacune avec un rôle.** Dans La Porte, l'or est le luxe et le rouge sang le
  sauvage, en lumière seulement, jamais en texte. Déclare la palette dans `theme.ts` avant d'écrire un plan ; aucune
  couleur ne s'invente plan par plan.
- **Les neutres tirent vers l'accent** : un noir teinté (`#060408` dans La Porte) plutôt que `#000`, un blanc cassé
  plutôt que `#fff`.
- **Pas de grand dégradé linéaire sur fond sombre** : il fait des bandes une fois compressé en H.264. Un dégradé
  radial, un aplat avec une lueur locale ou du grain tiennent.
- **L'accent se voit** : 15 à 25 % d'opacité pour une ambiance, pleine saturation pour ce qu'on doit regarder. Une
  lueur à 5 % disparaît à la compression.
- **Le texte se lit sans les décors** : contraste d'au moins 4,5:1 pour une phrase (WCAG AA).

## Typographie

- **Une police expressive, une neutre.** Croise les familles (serif et sans, sans et mono) plutôt que deux
  sans-serif proches, et que la tension veuille dire quelque chose : Jost fine et Bodoni Moda italique dans La Porte,
  la retenue et le choc.
- **Contraste de graisse franc** : 300 contre 800, pas 400 contre 700. En mouvement, une petite différence ne se
  voit pas.
- **Tailles pour un cadre de 1080 px de large** : titres de 80 à 160 px, phrases de 44 à 64 px, étiquettes de 28 px
  au moins. Une taille sous 28 px se justifie.
- **Temps de lecture** : un texte affiché 3 s doit se lire en 2. Compte trois mots par seconde au plus, moins pour
  une accroche.
- **L'approche** se règle pour la vidéo : serrée en grand corps (−0,02 à −0,04 em), ou très espacée en capitales
  fines pour le luxe (VYRA). La marque décide.
- **Sur fond sombre**, le texte clair paraît plus gras : une graisse un cran plus légère et un interligne un peu plus
  ouvert.
- **Chargement** : `loadFont()` de `@remotion/google-fonts/<Famille>` avec graisses et sous-ensembles explicites
  (`src/compositions/VyraTeaser/theme.ts`) ; une police locale : `rules/local-fonts.md` de remotion-best-practices.
  Une police qui n'a pas chargé passe à une police de secours sans erreur : vérifie-la sur une image rendue.
- **Un titre long** ne déborde pas : `fitText()` et `measureText()` de `@remotion/layout-utils`.

## Mise en page pour la vidéo

- **Le style décide de la densité.** Un teaser de luxe vit de noir et d'un seul sujet (La Porte : environ 85 % de
  noir). Une vidéo produit ou une explication a besoin de couches (un fond vivant, le contenu, des détails :
  étiquettes, filets, repères, données) pour ne pas ressembler à une diapositive : vise trois couches et six à dix
  éléments par plan.
- **Deux points d'intérêt au moins**, pour que l'œil voyage.
- **Le titre principal occupe 60 à 80 % de la largeur.** Les tailles du web sont invisibles en vidéo.
- **Ancre aux bords ou sur un axe fort.** Le tout-centré-flottant est un réflexe de page web.
- **Les zones sûres du canal d'abord** : rien d'important sous les boutons d'Instagram ou de TikTok
  (`references/formats.md`).
- **Filets, cadres, séparateurs** tracent des chemins pour l'œil et s'animent bien (`scaleX` de 0 à 1).

## Le mouvement dans Remotion

L'easing est l'adverbe du mouvement : le même glissé est assuré, rêveur ou joueur selon sa courbe.

| Intention | Dans Remotion |
|---|---|
| Entrée assurée, qui se pose | `Easing.out(Easing.cubic)` ou `Easing.bezier(0.16, 1, 0.3, 1)` |
| Sortie, qui s'en va | `Easing.in(Easing.cubic)` |
| Déplacement d'un point à un autre | `Easing.inOut(Easing.cubic)` |
| Rêveur, lent | `Easing.inOut(Easing.sin)` |
| Physique, sans rebond | `spring({frame, fps, config: {damping: 200}})` |
| Joueur, qui rebondit | `spring({frame, fps})` (le défaut rebondit) ou `Easing.out(Easing.back(1.7))` |
| Mouvement continu : défilement, rotation, dérive | linéaire, et seulement là |

```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();
// Entrée de 18 frames, 6 frames après le début du plan.
const t = interpolate(frame, [6, 24], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
const pose = spring({frame: frame - 6, fps, config: {damping: 200}});
```

La vitesse dit le poids :

| Effet | Durée | Frames à 30 fps |
|---|---|---|
| Énergie, urgence | 0,15 à 0,3 s | 5 à 9 |
| Professionnel | 0,3 à 0,5 s | 9 à 15 |
| Gravité, luxe | 0,5 à 0,8 s | 15 à 24 |
| Cinéma, émotion | 0,8 à 2 s | 24 à 60 |

- **Varie les easings, les vitesses et les directions** : trois easings différents au moins par plan, et le plan le
  plus lent trois fois plus lent que le plus rapide.
- **Les entrées durent plus que les sorties** : 12 frames pour entrer, 8 pour sortir.
- **Ce qui bouge en premier paraît le plus important** : décale les entrées dans l'ordre d'importance, chevauche-les,
  toute la cascade en moins de 15 frames.
- **Construire, respirer, résoudre** : les entrées dans le premier tiers du plan, un seul mouvement d'ambiance au
  milieu, une sortie ou une fin décidée à la fin.
- **Ne commence pas à la frame 0 d'une séquence** : 3 à 9 frames de retard, sinon l'entrée ressemble à une coupe
  sèche. Exception : une boucle, dont la première frame doit raccorder sur la dernière.
- **Rien de figé plus d'une seconde sans intention** : une lueur qui respire, une dérive lente, du grain. Une image
  tenue est un choix (le calme après le chaos), pas un oubli.
- **Une seule nouveauté à la fois** : l'œil ne suit pas deux arrivées indépendantes.
- **Un claquement arrive après le texte qu'il ponctue**, une fois ce texte entièrement visible (3 à 8 frames plus
  tard), sinon la chute tombe avant la phrase.
- **Une entrée et un zoom lent sur le même élément** : mets l'un sur un parent et l'autre sur l'enfant, plutôt
  qu'une chaîne `transform` qui mélange les deux.

## Images, vidéos, 3D

- **Une image n'est jamais posée à plat** : un zoom lent (de 1 à 1,04 sur le plan), une légère perspective, un cadre
  d'appareil (le téléphone générique de VyraClub), une parallaxe entre couches.
- **Une interface** se compose à la taille de l'écran réel et se rend avec `--scale=2` pour rester nette
  (`VyraSite` : 390×844).
- **Une vidéo dans la composition** passe par `<Video>` de `@remotion/media`.
- **3D légère** : `@remotion/three`, pilotée par la frame (`VyraClub`). **3D lourde** : Blender en images
  précalculées, par script (`blender/vyra-teaser/`), rendues dans `public/<slug>/seq/` ou `public/<slug>/chateau/`
  (ignorés par git) et recalculées par le script.
