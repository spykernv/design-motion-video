# STORYBOARD — VYRA « La Porte » (teaser de lancement n° 1)

> Statut : **v2 validée par Jonathan le 17/10/2026** : `out/vyra-teaser/vyra-la-porte-v2-9x16.mp4` (copie
> allégée `…-partage.mp4`, couverture `…-v2-cover.png`). Composition : `VyraTeaser` (montage dans `edit.ts`).
> Images de style de la v1 : `out/vyra-teaser/styleframes/`.

## v2 — l'entrée au château

Retour sur la v1 : étincelles et griffures « cheap », mots « Feu. Velours. Or. » sans message, boule de
ferrofluide hors sujet ; l'accroche « Certaines portes… » et la musique sont à garder, l'entrée de château à
renforcer. La v2 remplace le ferrofluide par un château (blender/vyra-teaser/chateau.py) traversé par la caméra.

| Temps (frames) | Plan Blender | Texte |
|---|---|---|
| f0–60 | Gros plan de la fente (image fixe) qui s'allume | « CERTAINES PORTES » |
| f61–180 | `approach` : du parvis, on gravit l'escalier aux nez de marche dorés vers les portes au V d'or, sous l'ogive, entre deux flambeaux | « ne s'ouvrent pas » · « POUR TOUT LE MONDE. » |
| f181–240 | `open` : les deux vantaux s'ouvrent, le V se fend, la lumière déferle, la caméra entre ; blanc, f240 noir | « Ce soir, elles s'ouvrent pour vous. » |
| f241–300 | `nave` : au ras du tapis rouge, la nef de colonnes d'obsidienne filetées d'or | « VOTRE SOIRÉE » |
| f301–360 | `truck` : travelling latéral derrière les colonnes | « COMMENCE » |
| f361–420 | `crane` : la grue s'élève et révèle toute la nef jusqu'à la fente de lumière | « avant la porte. » |
| f421–480 | `cuts` : 4 plans d'un temps (colonne en contre-plongée, plongée sur le tapis, cadre penché, la fente) | — |
| f481–660 | `carre` : orbite autour de la table d'honneur (champagne dans son seau d'or), derrière le cordon de velours, sous une colonne de lumière | « Choisissez votre table. » · « AVANT TOUT LE MONDE. » |
| f661–720 | `relance` : 4 plans d'un temps (le tapis, contrechamp sur les portes ouvertes, plongée sur la table, la fente) | — |
| f721–900 | La fente en gros plan, VYRA naît de l'impact final | « VYRA » · « Bientôt. » · « @vyra.party » |

Sons ajoutés : les portes du château (f184, coupées au drop), quatre passages de caméra sur les coupes rapides.
Retirés : griffures, étincelles, flashs photo, franges, éclats rouges, tremblé. Plus aucun « réserver » : une
demande n'est jamais présentée comme une réservation confirmée.

---

Version 1 (16/10/2026), remplacée :

## Montage réel (calé sur la musique générée, 120 BPM, drop à 8,03 s)

La musique ElevenLabs a placé son drop à 8,03 s (f241) et son dernier impact à 24,03 s (f721) : le montage suit
la musique, pas l'inverse. Temps sur 1 + 15k, mesures de 60 frames.

| Temps (frames) | Plan | Texte | Son |
|---|---|---|---|
| f0–60 | La fente en gros plan s'allume (néon) | « CERTAINES PORTES » | battement, musique derrière la porte (passe-bas) |
| f61–180 | Travelling vers le monolithe (Blender `dolly`) | « ne s'ouvrent pas » · « POUR TOUT LE MONDE. » | battement, foule étouffée |
| f181–240 | La fente puis la poussée dedans, la porte s'ouvre (`push`, 2×) ; blanc ; f240 noir | « Ce soir, elle s'ouvre. » | serrure (f181), montée, aspiration, 3 frames de silence |
| f241–300 | Ferrofluide A (horizon d'épines) | « VELOURS. » | impact du drop, passe-bas ouvert |
| f301–360 | Ferrofluide B (rasant) + griffures d'or | « FEU. » | griffure |
| f361–420 | Ferrofluide C (la bête déborde du cadre) + flashs | « OR. » | flashs photo |
| f421–480 | Coupes à chaque temps A/B/C + gerbes d'étincelles | — | étincelles |
| f481–660 | Le carré : liquide noir constellé, colonne de lumière, pluie d'or | « Les plus belles tables. » · « AVANT TOUT LE MONDE. » | — |
| f661–720 | Relance : coupes à chaque temps B/A/C/B, griffures, flashs, blanc | — | flashs, griffure |
| f721–900 | Signature sur la fente, la fente s'éteint sous le logo ; retour au noir (boucle) | « VYRA » · « Bientôt. » · « @vyra.party » | boum final, « Vyra » chuchoté (25,4 s) |

Flashs limités à 2 par seconde (seuil de risque photosensible : 3/s).

---

Proposition initiale (avant la musique) :

**Format :** 9:16 · 1080×1920 · 30 fps · **30 s (900 f)** · tempo cible 120 BPM (1 temps = 15 f, 1 mesure = 60 f,
15 mesures). La dernière image raccorde sur la première : le Reel boucle sans couture.
**Loi de la série (lancement) :** jamais l'application, jamais un club qu'on modélise. Rien que la sensation :
hype, mystère, VIP mais sauvage, la nuit de luxe.
**Marque :** noir `#060408` (~85 % du cadre) · or VYRA `#e8c27a` (rampe `#f6dfa6 → #e8c27a → #c9984a`) = le luxe ·
rouge sang `#b0001e` en lumière seulement (strobes, contre-jours), jamais en texte = le sauvage · Jost (VYRA) en
capitales fines très espacées · Bodoni Moda italique pour les mots-chocs.
**Texte :** zone sûre Reels (y 260–1500, marge droite 140 px). Aucun prix, aucun lieu, aucune promesse de
réservation.

## Idée maîtresse

**La porte.** On est dehors, la nuit, devant une porte qu'on n'a jamais vue : un monolithe d'obsidienne fendu
d'une ligne d'or. On entend la basse à travers le mur. La porte s'ouvre et la nuit déborde : un ferrofluide noir
qui hérisse ses épines comme une bête, des griffures d'or qui déchirent le noir, des flashs de paparazzi, des
gerbes d'étincelles. Puis le calme du carré : une colonne de lumière, une pluie d'or, la signature VYRA.

## Beats

| # | Beat | Temps (frames) | Image | Son | Texte |
|---|------|----------------|-------|-----|-------|
| 1 | Le seuil (accroche) | 0–2 s (f0–60) | Noir. Une ligne d'or verticale s'allume au centre, éclat optique ; la fumée accroche la lumière | Battement de cœur sub, basse étouffée au loin | « Certaines portes » |
| 2 | Le monolithe | 2–6 s (f60–180) | Travelling bas et lent vers le monolithe d'obsidienne (Blender, A) ; sol miroir mouillé ; rayons dans la fumée ; contre-jour rouge très léger | Basse filtrée comme derrière un mur, rumeur de foule | « ne s'ouvrent pas » → « pour tout le monde. » |
| 3 | La fente | 6–8 s (f180–240) | Gros plan : la fente pulse au rythme, poussières d'or en suspension | Pulsations, serrure lourde | « Ce soir, elle s'ouvre. » |
| 4 | L'ouverture | 8–10 s (f240–300) | Poussée dans la fente → blanc d'or plein cadre | Riser, aspiration inversée, 2 frames de silence | — |
| 5 | Le drop sauvage | 10–18 s (f300–540) | Coupes sur le temps : ferrofluide noir dont les épines jaillissent (Blender, B) ; griffures d'or qui déchirent le noir ; flashs de paparazzi ; gerbes d'étincelles ; tremblé caméra et aberration chromatique sur les impacts | Drop : percussions tribales, sub distordu, cuivres sombres ; griffures, déclics photo, étincelles | « VELOURS. » « FEU. » « OR. » (un mot par mesure, Bodoni italique géant) |
| 6 | Le carré | 18–24 s (f540–720) | Ralenti : colonne de lumière venue d'en haut, pluie de particules d'or ; le ferrofluide passe à l'or liquide (Blender, C) | Nappe de cordes sombres, la batterie se retire | « Les plus belles tables. » → « Avant tout le monde. » |
| 7 | Signature | 24–30 s (f720–900) | Les particules se rassemblent en VYRA (Jost fin, feuille d'or, reflet qui balaie), puis le noir et la ligne d'or du début (boucle) | Dernier impact, queue de réverbération, « Vyra » chuchoté | « VYRA » · « Bientôt. » · « @vyra.party » |

## Son (ElevenLabs uniquement : musique générée, droits commerciaux)

- **Musique** 30 s instrumentale, ~120 BPM : tech-house tribal sombre et hypnotique. Intro retenue, montée à 8 s,
  drop à 10 s (percussions tribales, sub distordu, cuivres sombres), cordes luxueuses à 18 s, impact final à 24 s.
  L'effet « derrière la porte » (passe-bas de 0 à 10 s) se fait au mixage, pas dans le modèle.
- **Sons** : battement sub, serrure lourde, rumeur de foule étouffée, riser, aspiration inversée, impact sub et
  verre, griffure, déclic et flash photo, étincelles, « Vyra » chuchoté (voix ElevenLabs).
- **Calage** : tempo et drop détectés dans la musique générée, les coupes se calent dessus (pas l'inverse).
  Mix final −14 LUFS, crête −1 dBTP.

## 3D (Blender 5.1, Cycles sur la RTX 4070 — formes abstraites uniquement)

- **A. Monolithe** : deux dalles d'obsidienne biseautées, fente d'or émissive, lumière arrière qui ne passe que
  par la fente, sol miroir mouillé, fumée hétérogène.
- **B. Ferrofluide noir** : sphère à épines (réseau de Fibonacci, hauteurs modulées par un bruit = « dos de
  bête »), épines animées sur l'enveloppe de la basse ; contre-jour or, kicker rouge.
- **C. Or liquide** : la même forme en or poli, pour le carré et la signature.
- **2D Remotion** : griffures d'or (tracés SVG et lueur), flashs, étincelles et pluie d'or (particules seedées),
  grain argentique, aberration chromatique, typo.

Scripts : `blender/vyra-teaser/` (un script par forme, `common.py` pour le rendu). Rendus : `public/vyra-teaser/`.

## Décisions à trancher

1. Les textes : accroche « Certaines portes ne s'ouvrent pas pour tout le monde. », mots du drop « VELOURS. FEU.
   OR. », indice produit « Les plus belles tables. Avant tout le monde. », fin « Bientôt. » ?
2. Le rouge sang en lumière : oui, ou or et noir purs ?
3. Le chuchotement « Vyra » à la fin : oui ou non ?
4. Logo : wordmark Jost tant qu'aucun logo n'est fourni.
