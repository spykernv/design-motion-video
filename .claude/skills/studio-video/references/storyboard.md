# Le storyboard : modèle, rythme, transitions, calage

## Sommaire

- Modèle de `STORYBOARD.md`
- Diriger un plan
- Le rythme
- Les transitions et ce qu'elles disent
- La grille de tempo
- Caler sur une musique : `timing.json`
- Les versions

## Modèle de `STORYBOARD.md`

Le format maison, celui de `VyraTeaser` et `VyraClub`. Remplis ce qui sert, supprime le reste.

```markdown
# STORYBOARD — <Marque> « <Titre> » (<nature : teaser, pub, vidéo pro…>)

> Statut : **proposition du JJ/MM/AAAA**. Composition : `<Id>`.

**Public :** … **Canal :** …
**Format :** 9:16 · 1080×1920 · 30 fps · **30 s (900 f)** · grille 120 BPM (1 temps = 15 f, 1 mesure = 60 f).
**Phrase-test :** « … » Chaque plan sert une partie de cette phrase.
**Appel à l'action unique :** « … »

## Identité

- **Palette :** fond `#…`, texte `#…`, accent `#…`, et le rôle de chaque couleur.
- **Polices :** …
- **Le geste visuel :** l'idée qui revient d'un plan à l'autre.
- **Effets :** ce qu'on fait, et ce qu'on s'interdit.

## Plans

| # | Temps (frames) | Image | Mouvement | Texte à l'écran | Son |
|---|---|---|---|---|---|
| 1 | 0–2 s (f0–60) | … | … | « … » | … |

Rythme : …

## Son

Musique (source, droits, tempo), voix, bruitages, cible de mixage (−14 LUFS, −1 dBTP).

## Règles vérifiées

Ce que la marque interdit, vérifié plan par plan.

## Décisions à trancher

1. …
```

## Diriger un plan

Un plan est un moment vécu, pas une disposition. Pour chacun :

- **Le concept**, en deux phrases : ce que le spectateur vit et ressent. « On est dehors, la nuit, devant une porte
  qu'on n'a jamais vue ; on entend la basse à travers le mur. »
- **L'image**, en couches : le fond (jamais un aplat mort, sauf un noir voulu), le sujet, les détails.
- **Le mouvement** : un verbe par élément. Un élément sans verbe n'est pas encore dessiné.
- **Le texte** : peu de mots, lisibles en moins de temps qu'ils ne restent à l'écran.
- **Le son** et **la sortie** : comment le plan passe la main au suivant.

Des verbes, rangés par caractère physique (choisis-les d'après le concept du plan, pas d'après son énergie) :

| Caractère | Verbes |
|---|---|
| Impact, poids | claque, frappe, tombe, s'écrase, tamponne, éclate |
| Direction | glisse, pousse, tire, balaie, coupe |
| Révélation | se trace, se remplit, grandit, s'assemble, compte, se dévoile sous un masque |
| Organique | flotte, dérive, respire, pulse, tourne en orbite, se transforme |
| Mécanique | se tape lettre à lettre, clique, se verrouille, s'emboîte, avance pas à pas |

## Le rythme

- **Une durée porte un nombre limité d'idées.** 15 s : une accroche, une idée, un appel. Pas trois fonctionnalités.
- **Trois actes** : l'accroche (environ 20 % de la durée), le corps (55 %), la résolution et la signature (25 %).
- **L'accroche est immédiate** sur les réseaux : la première frame dit déjà quelque chose. Pas de fondu au noir en
  ouverture, sauf pour une boucle pensée comme telle.
- **Nomme le rythme avant de construire** : « lent, lent, RUPTURE, rapide, rapide, tenue ». Il vient de la marque et
  du message, pas d'une recette : 15 s pour un cabinet d'architectes et 15 s pour un jeu vidéo n'ont pas le même.
- **Le moment fort tient au moins 1 s** à l'écran (1,5 s mieux), le logo ou la signature au moins 2 s, et l'image
  finale au moins 1 s avant la fin.
- **Le calme après le chaos** est une récompense : un passage dense qui se résout dans une image tenue.

## Les transitions et ce qu'elles disent

| Transition | Ce qu'elle dit | Avec quoi |
|---|---|---|
| Coupe franche | rupture, énergie ; tout ce qui tombe sur le temps | rien : la séquence suivante commence |
| Fondu | « ça continue » ; lent : « laisse-toi porter » | `fade()` de `@remotion/transitions/fade` |
| Glissé, volet | un même mouvement découpé en plans | `slide()` et `wipe()` de `@remotion/transitions/slide` et `/wipe` |
| Raccord de mouvement | un seul geste de caméra à travers la coupe | sortie qui accélère, entrée qui décélère, flou de mouvement (`@remotion/motion-blur`) |
| Lumière | la révélation, le moment fort | flash blanc, ou `@remotion/light-leaks` (à installer : `CLAUDE.md` § 2bis) |

- Deux transitions identiques ne se suivent pas, sauf une série de coupes franches sur le temps.
- Une ou deux transitions « lumière » par vidéo, pas plus : elles s'usent.
- Dans un `<TransitionSeries>`, la transition chevauche les deux séquences : une transition de 15 frames raccourcit la
  vidéo de 15 frames. Compte-la dans `edit.ts`.

## La grille de tempo

À 30 fps, un temps dure `1800 / BPM` frames :

| BPM | Frames par temps | Frames par mesure |
|---|---|---|
| 90 | 20 | 80 |
| 100 | 18 | 72 |
| 120 | 15 | 60 |
| 150 | 12 | 48 |

Un tempo qui ne tombe pas juste (128 BPM = 14,06 frames) se cale sur les temps mesurés de `timing.json`, pas sur un
arrondi : sinon le décalage s'accumule (4 frames en 30 s à 128 BPM). Dans `VyraTeaser`, les temps tombent sur
`1 + 15k` : la première frame du temps suit l'attaque.

## Caler sur une musique : `timing.json`

`scripts/vyra-teaser/analyse.py` mesure une musique et écrit, frame par frame : le tempo, les temps, le drop,
l'impact final, une enveloppe de basse et d'énergie (de 0 à 1, pour faire pulser une forme) et l'énergie par
seconde. Il a besoin de librosa, que l'environnement Python de video-use fournit :

```bash
uv run --project .claude/skills/video-use python scripts/<slug>/analyse.py public/<slug>/audio/musique.mp3 src/compositions/<Nom>/timing.json
```

Copie d'abord le script dans `scripts/<slug>/` et adapte ses repères à ta musique : il cherche le drop entre 4 s et
la fin moins 6 s, et l'impact final après 20 s, ce qui convient à une musique de 30 s.

Dans la composition, `edit.ts` importe `timing.json` et en tire les coupes, les impacts et les enveloppes (modèle :
`src/compositions/VyraTeaser/edit.ts`). Le mix (`scripts/vyra-teaser/mix.py`) lit le même fichier : image et son
tombent sur les mêmes frames.

## Les versions

Quand une version remplace la précédente, garde l'ancienne sous un trait horizontal, datée, avec ce qui change et
pourquoi : ce qu'on garde, ce qu'on retire. Le storyboard de `VyraTeaser` le fait (« étincelles et griffures
cheap » retirées, l'accroche et la musique gardées). La prochaine personne qui ouvre le dossier sait ce qui a déjà
été essayé.
