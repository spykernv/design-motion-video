# Stack & packages Remotion — guide opérationnel

> Référence stratégique pour le choix des packages et libs dans ce studio.
> Cas d'usage cible : **vidéos UGC pro, logos en motion, mini-schémas, graphiques animés,
> captions TikTok/LinkedIn, templates réutilisables.**
> Mission : créer ~10 blocs vidéo réutilisables — pas explorer 25 librairies.

## Règles de base

### ❌ Pas de Framer Motion comme base
Remotion exige des animations **déterministes** pilotées par `useCurrentFrame()`,
`interpolate()` et `spring()`. Les animations non pilotées par la frame peuvent
**flicker au rendu**, et il n'y a **pas d'intégration Framer Motion officielle**.
→ https://www.remotion.dev/docs/flickering

### ✅ Ajouter des packages avec `npx remotion add`
Pour tout package **`@remotion/*`**, utiliser :

```bash
npx remotion add <package-name>
```

C'est mieux que `npm install` direct : la commande **aligne les versions** de tous les
packages Remotion et évite les conflits. → https://www.remotion.dev/docs/cli/add
(Les libs **communautaires** — non `@remotion/*` — s'installent avec `npm install`.)

### Scaffolding officiel (pour mémoire)
```bash
npx create-video@latest          # interactif : choisir Blank + TailwindCSS + Agent Skills
# variante non-interactive : npx create-video@latest --yes --blank --no-tailwind my-video
```
→ https://www.remotion.dev/docs/ai/coding-agents

> ⚠️ Dans CE repo, le projet est **déjà scaffoldé** (build manuel avec Tailwind v4).
> Ne pas relancer `create-video` ici. Voir [CLAUDE.md](../../CLAUDE.md).

## Packages officiels par priorité

### 🟢 Base obligatoire
| Package | Rôle |
|---|---|
| `@remotion/transitions` | **Central.** Transitions entre scènes : `<TransitionSeries>`, `fade()`, `slide()`, `wipe()`, `flip()`, `zoomBlur()`, `filmBurn()`, `ripple()`… → [doc](https://www.remotion.dev/docs/transitions/) |
| `@remotion/shapes` | Mini-schémas, pictos, callouts, flèches, cercles, étoiles, polygones, jauges, pies. Animations pédagogiques type SaaS explainer. → [doc](https://www.remotion.dev/docs/shapes) |
| `@remotion/paths` | SVG avancé : `evolvePath()`, couper/interpoler un path, morphing, flèche qui trace un parcours. → [doc](https://www.remotion.dev/docs/paths) |
| `@remotion/layout-utils` | Layouts dynamiques : mesurer du texte, adapter la police à une boîte, wrapping, éviter que des titres auto-générés explosent le design. → [doc](https://www.remotion.dev/docs/layout-utils/) |
| `@remotion/google-fonts` | Charger proprement les Google Fonts, limiter les variantes, attendre que les fonts soient prêtes (évite les problèmes de rendu texte). → [doc](https://www.remotion.dev/docs/google-fonts) |
| `@remotion/tailwind-v4` | Intégration Tailwind v4 via config Webpack. **Déjà configuré ici.** → [doc](https://www.remotion.dev/docs/tailwind-v4/overview) |

### 🔵 Vidéos UGC / social
| Package | Rôle |
|---|---|
| `@remotion/captions` | **Obligatoire pour le vertical.** Parse/export `.srt`, structure les captions, `createTikTokStyleCaptions()`. → [doc](https://www.remotion.dev/docs/captions/api) |
| `@remotion/rounded-text-box` | Boîtes de texte arrondies façon TikTok/Instagram (SVG propre), souvent combiné à `layout-utils`. → [doc](https://www.remotion.dev/docs/rounded-text-box/) |
| `@remotion/sfx` | Effets sonores prêts à l'emploi : whoosh, whip, click, page turn, ding, shutter. Rend les motions « premium ». → [doc](https://www.remotion.dev/docs/api) |
| `@remotion/motion-blur` | Trail / motion blur caméra / effets de vitesse sur logos, cartes, textes. Rendu premium. → [doc](https://www.remotion.dev/docs/motion-blur/) |

### 🟣 SaaS / product demo
| Package | Rôle |
|---|---|
| `@remotion/media-utils` | Métadonnées audio/vidéo, durée, waveform, visualisation audio, spectrogramme, barre audio animée. → [doc](https://www.remotion.dev/docs/api) |
| `@remotion/preload` | Précharge images/vidéos/audio/fonts (évite délais et flashs au preview). Utile pour un player/app. → [doc](https://www.remotion.dev/docs/api) |
| `@remotion/lottie` | Importer des animations After Effects/Lottie : logos animés, loaders, pictos, micro-anims UI. ⚠️ Certaines expressions Lottie ne sont pas déterministes → flicker possible. → [doc](https://www.remotion.dev/docs/lottie/) |
| `@remotion/gif` | GIFs synchronisés à la timeline (mieux qu'un GIF HTML). **Déjà installé.** → [doc](https://www.remotion.dev/docs/gif) |
| `@remotion/player` | Lecteur Remotion embarquable (si on construit une app/aperçu interactif). |

### ⚪ Selon besoin uniquement (ne pas installer par défaut)
```bash
npx remotion add @remotion/three @remotion/skia @remotion/rive @remotion/noise @remotion/light-leaks @remotion/starburst @remotion/animated-emoji
```
| Package | Rôle |
|---|---|
| `@remotion/three` | 3D via React Three Fiber (mockups SaaS 3D, produits, scènes cinématiques). Installer aussi `three`, `@react-three/fiber`, `@types/three`. → [doc](https://www.remotion.dev/docs/three) |
| `@remotion/skia` | Graphisme bas niveau (React Native Skia), shaders-like. Puissant mais complexe. → [doc](https://www.remotion.dev/docs/skia) |
| `@remotion/rive` | Animations Rive synchronisées à la timeline. → [doc](https://www.remotion.dev/docs/rive) |
| `@remotion/noise` | Bruit procédural : particules, surfaces organiques, fonds animés. → [doc](https://www.remotion.dev/docs/noise) |
| `@remotion/light-leaks` | Light leaks WebGL : transitions cinématiques, « film burn ». → [doc](https://www.remotion.dev/docs/light-leaks) |
| `@remotion/starburst` | Rayons rétro, backgrounds dynamiques, formats TikTok très visuels. → [doc](https://www.remotion.dev/docs/starburst/api) |
| `@remotion/animated-emoji` | Contenus courts/fun/TikTok. Pas pour du B2B sérieux. → [doc](https://www.remotion.dev/docs/animated-emoji/) |

## Librairies communautaires de composants

| Lib | Quand | Installation |
|---|---|---|
| **remotion-bits** | Meilleur choix open-source pour aller vite : animated text, typewriter, gradient transitions, particles, 3D scenes, staggered motion. → [doc](https://remotion-bits.dev/docs/getting-started/) | `npm install remotion-bits` ou copy-in : `npx jsrepo init https://unpkg.com/remotion-bits/registry.json` puis `npx jsrepo add animated-text` |
| **remocn** | « shadcn pour Remotion » : tu copies/possèdes les composants. Bon pour product demos, transitions, backgrounds, typo. → [doc](https://www.remocn.dev/docs/getting-started/introduction) | `npx shadcn@latest init` puis `npx shadcn@latest add @remocn/blur-reveal` |
| **remotion-animated** | Helper déclaratif (move, scale, rotate, fade, size). Bon pour prototyper vite. → [doc](https://www.remotion-animated.dev/docs) | `npm i remotion-animated` |
| **Clippkit** | Video components prêts (text effects, intros, transitions). Bêta. → [site](https://clippkit.com/) | — |

## Classement opérationnel

1. **Base obligatoire** : `@remotion/transitions`, `@remotion/shapes`, `@remotion/paths`, `@remotion/layout-utils`, `@remotion/google-fonts`, `@remotion/tailwind-v4`.
2. **Vidéos UGC / social** : `@remotion/captions`, `@remotion/rounded-text-box`, `@remotion/sfx`, `@remotion/motion-blur`, `remotion-bits`.
3. **SaaS / product demo** : `remocn`, `@remotion/media-utils`, `@remotion/preload`, `@remotion/lottie`, `@remotion/player`.
4. **Motion premium / cinématique** : `@remotion/light-leaks`, `@remotion/starburst`, `@remotion/noise`, `@remotion/three`.
5. **Avancé seulement** : `@remotion/skia`, `@remotion/rive`.

**Recommandation finale :** commencer avec `remotion-bits` + packages officiels.
N'installer `three`, `skia`, `rive` que sur vrai besoin. Danger = confondre « stack
impressionnante » et « pipeline productif ».

## ⚖️ Licence (business/legal)

Remotion est **gratuit** pour : un individu, une organisation à but lucratif **jusqu'à
3 employés**, les non-profits, ou l'évaluation non commerciale. **Au-delà, une licence
entreprise peut être requise.** À vérifier avant tout usage commercial sérieux en
entreprise. → https://www.remotion.dev/docs/license

## État d'installation dans ce repo

Installés au setup : `transitions`, `tailwind-v4`, `gif`, `media` (Video/Audio).
Ajoutés ensuite (tier 1 + 2) : `shapes`, `paths`, `layout-utils`, `google-fonts`,
`captions`, `rounded-text-box`, `sfx`, `motion-blur`, `media-utils`, `preload`, `lottie`,
+ `remotion-bits` (communautaire).
→ Vérifier la liste à jour dans [`package.json`](../../package.json).
