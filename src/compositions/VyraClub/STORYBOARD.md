# STORYBOARD — VYRA « Chaque table a une vue » (vidéo pro, boîtes de nuit)

> Statut : **validé le 21/10/2026** (minimum de démo affiché « 1 200 € · démo », violet `#8b6cff`, textes
> gardés). Composition : `VyraClub`. **v1 validée le 21/10/2026** : `out/vyra-club/vyra-club-v1-9x16.mp4`.
>
> Sur macOS, la 3D a besoin du rendu WebGL ANGLE :
> `npx remotion render VyraClub out/vyra-club/vyra-club-v1-9x16.mp4 --gl=angle`.

**Public :** propriétaire ou directeur de boîte de nuit. **Canal :** Reels, Stories, envoi direct sur WhatsApp.
**Format :** 9:16 · 1080×1920 · 30 fps · **30 s (900 f)** · **sans musique** : tout se comprend sans le son.
Grille de montage à 120 BPM quand même (1 temps = 15 f, 1 mesure = 60 f), pour poser une musique plus tard sans
remonter.
**Lieu :** Lumen Club, fictif, étiqueté « démo » en permanence (coin haut gauche, discret).
**Phrase-test :** « Mes clients voient leur table avant de la demander ; la demande m'arrive complète, et c'est moi
qui décide. » Chaque plan sert une des trois parties de cette phrase.
**Appel à l'action unique :** « Demander une visite privée ».

## Identité

- **VYRA, le plan :** papier `#f3f0e8`, encre `#14131a`, traits fins de plan d'architecte, cotes et étiquettes en
  **Archivo** (capitales espacées pour les étiquettes, Archivo serré pour les phrases).
- **Lumen Club, la nuit :** noir `#07060c` et la couleur du club, un violet lumière `#8b6cff`. Pas d'or : il est
  réservé aux clubs qui l'ont pour couleur.
- **Le geste visuel :** le plan papier se lève en 3D, puis la salle passe en mode nuit. Le jour, c'est l'outil ;
  la nuit, c'est le club.
- **Effets :** caméra lente et posée, coupes sur le temps, texte révélé par masque. Pas de glitch, d'étincelle ni
  de flash.
- **Téléphone :** un boîtier générique (rectangle arrondi, pas de modèle de marque). Aucun logo WhatsApp : la
  notification dit « WhatsApp · e-mail » en texte.

## Plans

| # | Temps (frames) | Image | Texte à l'écran |
|---|---|---|---|
| 1 | 0–3 s (f0–90) | Papier. Le plan du Lumen Club se trace à l'encre, trait par trait : scène, cabine DJ, piste, carré VIP, mezzanine, bar. Les étiquettes apparaissent en Archivo. | « Chaque table a une vue. » |
| 2 | 3–7 s (f90–210) | Le problème. Le plan se brouille et des bulles de message s'empilent, sans marque : « C'est où, la table ? », « On verra la scène ? », « C'est combien ? », « Il reste quoi samedi ? ». Un PDF de prix flou passe derrière. Coupe sèche. | « Aujourd'hui, une table se demande à l'aveugle. » |
| 3 | 7–12 s (f210–360) | Le plan se lève en 3D (murs, scène, tables extrudées, traits d'encre sur les arêtes). La caméra plonge dans la salle et glisse vers le carré VIP. La table 12 s'entoure d'un trait. | « Vos clients visitent votre club. » |
| 4 | 12–16 s (f360–480) | **La vue depuis la table.** La caméra se pose à hauteur d'assis à la table 12 et se tourne vers la scène et le DJ. Sur le temps, mode nuit : la salle passe au noir et violet, les écrans affichent « LUMEN », les faisceaux battent à 120 BPM. | « Ils voient leur table. » · « Avant de la demander. » |
| 5 | 16–20 s (f480–600) | Le téléphone entre dans le cadre avec la même vue en fond. La fiche de la table s'ouvre : Carré VIP · Table 12 · 6 à 8 personnes · Inclus · Minimum. Puis le formulaire court : date, nombre, répartition femmes/hommes, prénom. Le pouce touche « Demander cette table ». | « Ils choisissent. Ils demandent. » |
| 6 | 20–24 s (f600–720) | **Le contrechamp.** Côté club, retour au papier. La demande tombe en notification (« WhatsApp · e-mail »), puis la carte complète : Lumen Club · samedi · Carré VIP, table 12 · 6 personnes (3 F · 3 H) · prénom et téléphone. Chaque ligne se coche à l'encre. | « La demande arrive complète. » |
| 7 | 24–27 s (f720–810) | Deux boutons sous la carte, « Confirmer » et « Proposer une autre table ». La caméra se resserre sur eux sans que rien ne soit cliqué : la décision reste au club. | « C'est vous qui décidez. » |
| 8 | 27–30 s (f810–900) | Signature sur papier : **Lumen Club** en grand, « avec VYRA » en petit dessous. Puis le bouton d'appel. | « Chaque table a une vue. » · « Demander une visite privée » |

## Règles vérifiées

- Jamais « réserver », « réservation confirmée », « payé » ni « payez » : le client **demande**, le club **confirme**.
- Aucune carte bancaire, aucun paiement.
- Marque du club devant (« Lumen Club · avec VYRA »), VYRA en petit, aucune liste de clubs.
- Aucun chiffre de performance, aucun témoignage, aucun vrai logo. Lumen Club reste étiqueté « démo ».

## 3D

- Faite dans Remotion avec `@remotion/three` (three.js), sans Blender : il n'est pas installé sur ce Mac et la
  salle est simple. Tout est piloté par `useCurrentFrame()`.
- Salle low-poly : sol, murs, scène et cabine DJ, piste, 4 zones de tables (carré VIP, mezzanine, bord de piste,
  bar), écrans, colonnes. Matériau papier mat et arêtes à l'encre en mode jour ; noir, émissifs violets et faisceaux
  additifs en mode nuit.

## Décisions prises

1. **Prix sur la fiche :** minimum de démo affiché, « 1 200 € · démo ».
2. **Couleur du Lumen Club :** violet lumière `#8b6cff`.
3. **Textes à l'écran :** gardés tels quels.
