---
name: studio-video
description: >-
  La méthode du studio pour fabriquer une vidéo Remotion de bout en bout : entretien en une passe, BRIEF.md
  validé, STORYBOARD.md calé en frames sur la musique ou la voix, compositions, contrôle des images avant de
  montrer quoi que ce soit, brouillon, rendu final et déclinaisons de formats (9:16, 4:5, 1:1, 16:9). À utiliser
  dès qu'on demande de faire, créer, refaire, modifier ou décliner une vidéo, un teaser, une pub, un Reel, une
  bande-annonce, une intro, un logo animé, un motion design ou une vidéo produit dans ce dépôt, même sans dire
  « Remotion » (make a video, teaser, promo, ad, reel, motion graphics). Pas pour monter des rushes filmés
  (couper, retirer les hésitations, étalonner) : c'est video-use. Pour une question d'API Remotion seule :
  remotion-best-practices.
---

# Studio vidéo : de l'idée au MP4

Ce dépôt fabrique des vidéos en code avec Remotion. Cette skill est la méthode du studio, celle qui a produit
`VyraTeaser` et `VyraClub` : chaque étape laisse un fichier que la suivante utilise, et rien n'est montré à la
personne sans avoir été regardé avant.

Les règles techniques (déterminisme, `interpolate` bornés, médias, `staticFile`) sont dans `CLAUDE.md`, le détail
de l'API dans la skill `remotion-best-practices`. Ici, c'est la façon de travailler.

**Pourquoi des étapes.** Un malentendu coûte un paragraphe dans un brief, une heure dans un storyboard, une
journée dans le code. Les deux validations (brief, puis storyboard) attrapent les malentendus tant qu'ils ne
coûtent presque rien. Une retouche sur une vidéo validée (« décale ce texte », « plus lent ») ne repasse pas par
là : lis son `STORYBOARD.md` (statut, versions, décisions) et va directement à l'étape 5. Un changement de fond
(message, durée, structure) repasse par le storyboard.

**Avec des rushes filmés** (interview, prise de parole), le montage se fait d'abord avec `video-use` ; ses
animations sont des compositions de ce studio, faites avec cette skill (`CLAUDE.md` § 8).

## Les étapes

| # | Étape | Ce qu'elle laisse | On attend la personne ? |
|---|---|---|---|
| 1 | Cadrer : inventaire, puis entretien | ses réponses | oui |
| 2 | Brief | `BRIEF.md` | oui, un « oui » franc |
| 3 | Storyboard | `STORYBOARD.md` | oui, « validé » |
| 4 | Son et calage | `timing.json`, le mix | non |
| 5 | Construction | composants, `theme.ts`, `edit.ts`, `Root.tsx` | non |
| 6 | Contrôle | planches de contrôle regardées | non |
| 7 | Brouillon | `out/<slug>/<slug>-v1-brouillon.mp4` | oui |
| 8 | Final et déclinaisons | `out/<slug>/<slug>-v1-9x16.mp4`… | non |

Tout vit dans le dossier de la vidéo, `src/compositions/<Nom>/` en PascalCase (ou `src/private/compositions/<Nom>/`,
voir « Public ou privé »). Le slug est le nom en minuscules à tirets (`vyra-club`) ; les rendus vont dans
`out/<slug>/`, ignoré par git.

## 1. Cadrer

Regarde d'abord ce qui existe, pour ne pas demander ce qui est déjà là : `docs/references/` (chartes, briefs),
`public/`, les fichiers joints, et les vidéos d'une même marque. Leur `theme.ts` donne la palette, les polices et
les zones sûres ; leur `STORYBOARD.md` donne le ton et les règles de marque. Une vidéo VYRA repart de
`src/compositions/VyraTeaser/` ou `src/compositions/VyraClub/`.

Puis pose d'un bloc, avec `AskUserQuestion` (quatre questions par appel, donc deux appels au plus) et des choix quand
c'est possible, les questions dont la réponse change la vidéo :

- **À quoi elle sert et pour qui** : le canal, le public, ce que le spectateur fait après (un seul appel à l'action).
- **La phrase-test** : la phrase que le spectateur doit pouvoir répéter. Celle de VyraClub : « Mes clients voient
  leur table avant de la demander ; la demande m'arrive complète, et c'est moi qui décide. » Chaque plan en sert
  une partie. Sans elle, la vidéo n'a pas de centre.
- **Durée et format** : 15, 30, 60 s ; 9:16, 16:9, 4:5, 1:1 ; d'autres formats ensuite ?
- **Le son** : musique, voix, sous-titres. Une vidéo pour les réseaux doit se comprendre sans le son.
- **Le style** : charte ou marque existante, références, ce qu'il ne faut surtout pas.
- **Public ou privé** (voir plus bas).

Banque complète de questions et valeurs par défaut : `references/brief.md`. Ne pose pas tout : « un teaser de
15 s pour le lancement, même style que La Porte » répond déjà à la moitié.

## 2. Le brief

Écris `BRIEF.md` dans le dossier de la vidéo, sur le modèle de `references/brief.md` : but, public, phrase-test,
appel à l'action, format, durée, son, style (couleurs en hex, polices), assets avec leurs chemins, contraintes et
mots interdits, livrables. Montre-le et attends un « oui » franc avant d'écrire le storyboard : le silence n'est pas
un oui.

Sans style donné, propose deux directions contrastées (`references/direction-creative.md`) plutôt que d'en imposer
une : c'est la marque de la personne, pas la nôtre.

## 3. Le storyboard

`STORYBOARD.md` décrit la vidéo plan par plan, **en frames**, avant toute ligne de code. Suis le format maison de
`src/compositions/VyraTeaser/STORYBOARD.md` et `src/compositions/VyraClub/STORYBOARD.md` (modèle, rythme et
transitions dans `references/storyboard.md`) :

- en tête : statut (« proposition », puis « validé le JJ/MM/AAAA »), format, durée, public, phrase-test, appel à
  l'action, identité (palette, polices, le geste visuel) ;
- la table des plans : temps en frames, image, mouvement, texte à l'écran, son ;
- les règles vérifiées (ce que la marque interdit) et les **décisions à trancher**, numérotées, pour qu'on y
  réponde en une ligne.

Décris ce que le spectateur vit, pas des pixels : « les portes s'ouvrent et la lumière déferle » dit quoi
construire, « rectangle doré, opacité de 0 à 1 » ne dit rien du plan. Chaque élément qui bouge a un verbe (glisse,
claque, se trace, respire) : un élément sans verbe n'est pas encore dessiné.

Cale les coupes sur une grille de tempo, même sans musique : à 120 BPM et 30 fps, un temps fait 15 frames, une
mesure 60. Une musique se pose ensuite sans tout remonter (c'est ce que fait VyraClub).

Montre le storyboard avec ses décisions à trancher, itère jusqu'au « validé », puis date le statut.

## 4. Le son et le calage

- **Musique** : le montage suit la musique, pas l'inverse. Mesure son tempo, ses temps et son drop dans un
  `timing.json` à côté des compositions (modèle : `scripts/vyra-teaser/analyse.py`, commande dans
  `references/storyboard.md`). Les coupes et les impacts lisent ce fichier, jamais des secondes recopiées.
- **Voix** : le moment fort d'une animation tombe sur le mot qui le porte. Les temps des mots viennent d'une
  transcription au mot près (`transcribe.py` de video-use).
- **Bruitages** : peu, et chacun attaché à ce qu'on voit (une coupe, un impact, une porte). Vingt « whoosh » en
  30 s sonnent bon marché ; huit sonnent dessinés.
- **Mixage** : un seul mix final, normalisé en deux passes à −14 LUFS intégrés, crête vraie −1 dBTP (modèle :
  `scripts/vyra-teaser/mix.py`). Note dans le storyboard d'où viennent la musique et les sons, et leurs droits.

## 5. Construire

- Un dossier par vidéo : le composant principal `<Nom>.tsx`, `theme.ts` (palette, polices chargées par
  `@remotion/google-fonts`, zones sûres, dimensions), `edit.ts` (coupes et impacts en frames, `DURATION`), et un
  composant par plan ou par élément récurrent. Exemple complet : `src/compositions/VyraTeaser/`.
- Déclare la composition dans `src/Root.tsx` (ou `src/private/Root.tsx`) : `id` unique, durée importée de `edit.ts`
  ou `theme.ts`, et un commentaire `{/* === Marque — « Titre », nature (durée, format) === */}` comme les autres.
- Les choix visuels (palette, typographie, mise en page, mouvement, transitions) : `references/direction-creative.md`.
  Relis sa liste de réflexes à questionner avant de choisir une couleur ou un effet.
- `npm run typecheck` doit passer. Il ne prouve pas que la vidéo est bonne : c'est l'étape suivante.

## 6. Contrôler avant de montrer

Un typecheck vert ne dit rien de l'image. Regarde-la toi-même avant de la montrer :

1. Rends un brouillon rapide : `npx remotion render <id> out/<slug>/<slug>-v1-brouillon.mp4 --scale=0.5`
   (composition 3D dont l'image sort noire : ajouter `--gl=angle`).
2. Fais une planche des moments qui comptent (chaque texte arrivé, chaque coupe, chaque impact, la première et la
   dernière frame) :
   `node .claude/skills/studio-video/scripts/controle.mjs planche out/<slug>/<slug>-v1-brouillon.mp4 0,75,181,241,899`
   (`auto:12` prend 12 frames réparties sur toute la durée).
3. Ouvre la planche avec `Read` et vérifie chaque case avec `references/controle.md` : l'image attendue à la frame
   attendue, texte lisible et dans la zone sûre, rien de coupé, la bonne police (pas une police de secours), la
   palette du brief, rien de vide ni de figé sans raison.
4. Pour un texte fin, rends la frame en pleine taille : `npx remotion still <id> out/<slug>/f241.png --frame=241`.
5. Mesure le son au lieu de le supposer : `node .claude/skills/studio-video/scripts/controle.mjs son <fichier>`.
   Tu ne peux pas écouter : dis-le, et donne les chiffres.

Corrige, rends, revérifie. Au bout de trois passes, s'il reste un défaut, dis-le franchement au lieu de boucler.

## 7. Le brouillon

Donne à la personne le chemin du brouillon et la planche, avec ce que tu as vérifié et ce que tu n'as pas pu
vérifier (l'écoute, par exemple). Pour l'aperçu en direct : `npm run dev`, puis http://localhost:3000 (`CLAUDE.md`
§ 5). Attends son retour. Chaque série de retours donne une version (`-v2`), et le storyboard en garde
l'historique (ce qui change, pourquoi, ce qu'on garde), comme celui de VyraTeaser.

## 8. Final et déclinaisons

- Rendu final en pleine qualité, `out/<slug>/<slug>-v<N>-<format>.mp4`, puis une planche `auto:12` et une mesure du
  son sur ce fichier : un encodage final peut différer du brouillon.
- Une couverture si le canal en veut une : `npx remotion still <id> out/<slug>/<slug>-v<N>-cover.png --frame=<f>`.
- Les autres formats se recomposent, ils ne se recadrent pas : une composition par format, la même animation et le
  même son, une mise en page propre à chaque cadre. Pour une pub sur les réseaux, fais d'abord le 9:16, fais-le
  valider, puis propose le jeu complet (9:16, 4:5, 1:1, 16:9). Détails, zones sûres et copie allégée :
  `references/formats.md`.
- Mets à jour le statut du storyboard (« v2 validée le JJ/MM/AAAA : `out/…` »).

## Public ou privé

Ce dépôt est **public** sur GitHub. Une vidéo de client, un projet confidentiel ou un asset sous licence n'y est
jamais commité. Pose la question à l'étape 1 dès que ce n'est pas une vidéo déjà publique.

- Le privé vit dans `src/private/`, ignoré par git, avec son propre point d'entrée : `src/private/index.ts`
  enregistre `src/private/Root.tsx`, qui reprend le `Root` partagé et ajoute les compositions privées.
  Studio : `npx remotion studio src/private/index.ts` ; rendu : `npx remotion render src/private/index.ts <id> <sortie>`.
- Si `src/private/` n'existe pas sur ce poste, crée ces deux fichiers sur ce modèle.
- Ses assets vont dans `public/private/<projet>/`, ignoré par git : `staticFile('private/<projet>/logo.png')`.
- Avant un commit, `git status` ne liste aucun fichier du projet privé.

## Ce qui ne bouge pas

- Pas de code avant un brief validé, pas de rendu final avant un storyboard validé.
- Rien n'est montré qui n'a pas été regardé : la planche est ouverte avec `Read`.
- Chaque couleur et chaque police viennent du brief : la marque de la personne, jamais la nôtre.
- Une seule nouveauté à la fois à l'écran : l'œil ne suit pas deux arrivées en même temps.
- Pas plus de trois flashs par seconde (risque photosensible) ; le teaser s'en tient à deux.
- Les droits de chaque musique, son, police et image sont connus et notés dans le storyboard.
