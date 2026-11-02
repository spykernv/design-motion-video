# Le brief : questions et modèle

## Sommaire

- Inventaire avant de demander
- Questions, par thème
- Valeurs par défaut
- Modèle de `BRIEF.md`

## Inventaire avant de demander

Ne demande jamais ce que le dépôt sait déjà :

- `docs/references/` : chartes, briefs, palettes, specs de formats (index dans son `README.md`).
- `src/compositions/` et `src/private/compositions/` : une vidéo de la même marque ? Son `theme.ts` donne palette,
  polices et zones sûres ; son `STORYBOARD.md` donne le ton, les mots interdits et les décisions déjà prises.
- `public/` : logos, musiques, sons, captures, rendus Blender déjà là.
- Les fichiers joints au message, et ce que la personne a déjà dit dans la conversation.

## Questions, par thème

Pose seulement celles dont la réponse change la vidéo, en une fois, avec des choix.

**But et public**

- À quoi sert la vidéo ? Teaser, pub, présentation d'un produit, explication, intro ou outro, habillage d'une autre
  vidéo, écran dans un lieu.
- Qui la regarde, et où ? Reels, Stories, TikTok, LinkedIn, YouTube, site, envoi direct sur WhatsApp, présentation.
- Que fait le spectateur après ? Un seul appel à l'action.
- La phrase-test : la phrase qu'il doit pouvoir répéter.

**Format**

- Durée : 6 s (bumper), 15 s, 30 s, 60 s, plus.
- Cadre : 9:16 (1080×1920), 16:9 (1920×1080), 4:5 (1080×1350), 1:1 (1080×1080). D'autres formats ensuite ?
- Cadence : 30 fps ; 60 pour une interface qui défile ; 24 pour un rendu cinéma.
- Boucle : la dernière image raccorde-t-elle sur la première (Reel qui tourne en boucle) ?

**Texte, voix, son**

- Texte à l'écran : fourni, à proposer dans le storyboard, aucun.
- Voix : enregistrée (fichier), synthèse, aucune.
- Musique : fournie, à générer, aucune ; tempo ou ambiance voulus.
- Sous-titres : oui ou non.

**Style**

- Une charte, une marque déjà faite ici, ou rien ?
- Couleurs (hex) et polices imposées ?
- Logo, en vectoriel de préférence ?
- Références : vidéos, comptes, films, affiches (« comme X, mais plus calme »).
- Rythme : nerveux (plans de 1 à 2 s), posé (2 à 3 s), contemplatif (3 à 5 s).
- Ce qu'il ne faut surtout pas : mots, effets, couleurs.

**Contraintes**

- Mots interdits, mentions obligatoires (« démo », mentions légales).
- Public ou privé : le dépôt est public.
- Échéance, poids maximal du fichier, canal qui recadre ou compresse.

## Valeurs par défaut

Quand la personne laisse le choix, dis-le dans le brief plutôt que de reposer la question :

| Sujet | Défaut |
|---|---|
| Cadence | 30 fps |
| Cadre | 9:16 pour les réseaux, 16:9 sinon (`CLAUDE.md` : 1920×1080 par défaut) |
| Durée | 15 s pour une pub sociale, 30 s pour un teaser, 45 à 90 s pour une explication |
| Son | sans voix ; musique seulement si elle est fournie ou générée avec des droits connus |
| Sous-titres | oui dès qu'il y a une voix |
| Grille | 120 BPM (15 frames par temps), même sans musique |
| Boucle | oui pour un Reel de moins de 30 s |

## Modèle de `BRIEF.md`

```markdown
# BRIEF : <Titre> (`<slug>`)

> Statut : proposition du JJ/MM/AAAA · validé le JJ/MM/AAAA par <prénom>

| | |
|---|---|
| But | … |
| Public et canal | … |
| Phrase-test | « … » |
| Appel à l'action | « … » (un seul) |
| Format | 9:16 · 1080×1920 · 30 fps · 30 s (900 f) · boucle : oui |
| Composition | `id` Remotion `<Nom>`, dossier `src/compositions/<Nom>/` (ou privé) |

## Texte et son

- Texte à l'écran : … (ou « à proposer dans le storyboard »)
- Voix : …
- Musique : … (source, droits)
- Sous-titres : …

## Style

- Palette : fond `#…`, texte `#…`, accent `#…` (et le rôle de chaque couleur)
- Polices : … (Google Fonts ou fichier), graisses
- Logo : `public/…`
- Références : …
- Rythme : …
- À éviter : …

## Assets

| Fichier | Chemin | Usage |
|---|---|---|
| … | `public/<slug>/…` | … |

## Contraintes

- …

## Livrables

- Master : `out/<slug>/<slug>-v1-9x16.mp4`
- Déclinaisons, après validation du master : …
- Couverture, copie allégée pour le partage : …
```
