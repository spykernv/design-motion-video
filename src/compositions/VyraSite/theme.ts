// VYRA — the site's films (spykernv/vyra-site, « Ce qui se passe ensuite »): the app's screens on a
// phone, as they are in V1, with the demo venue Lumen Club (fictional, labelled « démo » on the
// site). Colours, materials and type come from the app (src/app/globals.css, docs/design-system.md:
// « Dark Sculpted », VYR-142, since 2026-11-07), the demo's data from clubs/lumen-club/content.json.
import type {CSSProperties} from 'react';
import {loadFont as loadJost} from '@remotion/google-fonts/Jost';
import {cancelRender, continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';

/** A phone's screen in CSS pixels; rendered with --scale=2 (780 × 1688). */
export const SCREEN = {width: 390, height: 844};
export const FPS = 30;

/** Jost: the club's own marks (Lumen's wordmark and screens, the brand film), VYRA's wordmark. */
export const {fontFamily: JOST} = loadJost('normal', {
  weights: ['300', '400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
});

/**
 * Inter, the app's typeface: the very file the app serves (variable in weight and optical size,
 * latin; OFL, public/vyra-site/OFL-Inter.txt), so a 12 px caption and a 34 px title are each drawn
 * for their size, as on a phone.
 */
export const INTER = 'VyraInter';
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  const waiting = delayRender('Inter, the app’s typeface');
  const face = new FontFace(INTER, `url('${staticFile('vyra-site/inter-latin.woff2')}') format('woff2')`, {
    weight: '100 900',
    style: 'normal',
  });
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      continueRender(waiting);
    })
    .catch((error) => cancelRender(error));
}

/** Warm white, the app's light (`--light`), and its halo (`--glow`), at an alpha. */
export const light = (alpha: number) => `rgb(255 246 232 / ${alpha})`;
export const glow = (alpha: number) => `rgb(255 236 214 / ${alpha})`;

/** The app's tokens (globals.css, `.dark`): a charcoal ground, three surfaces, a well, ivory. */
export const DS = {
  ink: '#141414',
  inkHi: '#1d1d1d',
  surface1: '#191919',
  surface2: '#212121',
  surface3: '#2a2a2a',
  sunken: '#0f0f0f',
  rule: '#2c2c2c',
  label: '#f6f2eb',
  label2: '#b8b2a8',
  label3: '#8a857d',
  hairline: light(0.09),
  hairlineStrong: light(0.18),
  fill: light(0.07),
  fill2: light(0.04),
  glassThick: 'rgb(24 23 22 / 0.74)',
  alert: '#ffb4a8',
};

/** The app's materials (globals.css § Materials), as styles. */
export const M = {
  /** A matte charcoal object lifted off the ground, lit from the top left. */
  sculpt: {
    backgroundColor: DS.surface1,
    backgroundImage: `linear-gradient(180deg, ${DS.surface2}, ${DS.surface1} 62%)`,
    boxShadow: `inset 0 1px 0 ${light(0.085)}, inset 0 -1px 0 rgb(0 0 0 / 0.4), 0 1px 0 rgb(0 0 0 / 0.55), 0 18px 34px -16px rgb(0 0 0 / 0.85), -8px -8px 22px -14px ${light(0.04)}`,
  },
  /** A well pressed into the surface: fields, tracks. */
  sunken: {
    backgroundColor: DS.sunken,
    boxShadow: `inset 0 2px 5px rgb(0 0 0 / 0.7), inset 0 0 0 1px rgb(0 0 0 / 0.35), 0 1px 0 ${light(0.06)}`,
  },
  /** A field's well while it has the focus: a fine warm-white light along its edge. */
  sunkenFocus: {
    backgroundColor: DS.sunken,
    boxShadow: `inset 0 2px 5px rgb(0 0 0 / 0.7), 0 0 0 1px ${light(0.75)}, 0 0 14px -4px ${glow(0.55)}`,
  },
  /** The light of precision on what is active. */
  lit: {
    boxShadow: `0 0 0 1px ${light(0.85)}, 0 0 16px -3px ${glow(0.5)}, inset 0 0 12px -4px ${glow(0.22)}, 0 18px 34px -16px rgb(0 0 0 / 0.85)`,
  },
  /** The screen's one primary action: a charcoal pill outlined by the light. */
  brandPill: {
    color: DS.label,
    backgroundColor: DS.surface1,
    backgroundImage: `linear-gradient(180deg, ${DS.surface3}, ${DS.surface1})`,
    textShadow: `0 0 14px ${glow(0.35)}`,
    boxShadow: `0 0 0 1px ${light(0.9)}, 0 0 18px -4px ${glow(0.55)}, inset 0 0 14px -5px ${glow(0.3)}, inset 0 1px 0 ${light(0.12)}, 0 18px 34px -16px rgb(0 0 0 / 0.85)`,
  },
  /** Blur glass, for the sheets read over the 3D. */
  glassThick: {
    backgroundColor: DS.glassThick,
    backdropFilter: 'blur(36px) saturate(120%)',
    boxShadow: `inset 0 1px 0 ${light(0.12)}, inset 0 0 0 1px ${light(0.06)}, 0 40px 80px -28px rgb(0 0 0 / 0.9)`,
  },
  /** The studio behind a VYRA page without 3D: the matte ground, a soft light from above. */
  studio: {
    background: `radial-gradient(90% 60% at 50% -12%, ${light(0.07)}, transparent 70%), radial-gradient(140% 90% at 50% 40%, transparent 55%, rgb(0 0 0 / 0.45)), linear-gradient(180deg, ${DS.inkHi}, ${DS.ink} 60%)`,
  },
} satisfies Record<string, CSSProperties>;

/** The app's type scale (Inter; the optical size follows the size). */
export const T = {
  caption: {fontSize: 12, lineHeight: '16px'},
  footnote: {fontSize: 13, lineHeight: '18px'},
  ui: {fontSize: 14, lineHeight: '20px'},
  callout: {fontSize: 15, lineHeight: '22px'},
  headline: {fontSize: 17, lineHeight: '24px', fontWeight: 600, letterSpacing: '-0.012em'},
  title: {fontSize: 24, lineHeight: '30px', fontWeight: 600, letterSpacing: '-0.022em'},
  display: {fontSize: 34, lineHeight: '38px', fontWeight: 600, letterSpacing: '-0.028em'},
  eyebrow: {fontSize: 11, lineHeight: '14px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase'},
  num: {fontVariantNumeric: 'tabular-nums'},
} satisfies Record<string, CSSProperties>;

/** Lumen Club's brand (brand.json): its brass, which its e-mails and its marks keep. */
export const LUMEN = {
  accent: '#c9a46a',
  on: '#1a1208',
  foil: ['#f1dcb0', '#c9a46a', '#8a6a38'],
};

/**
 * The manager's dashboard (/admin): shadcn's roles on the app's tokens (globals.css), which the
 * dashboard takes as they are. Its primary is VYRA's ivory.
 */
export const ADMIN = {
  background: DS.ink,
  card: DS.surface1,
  popover: DS.surface2,
  border: DS.hairline,
  input: DS.hairlineStrong,
  label: DS.label,
  muted: DS.label2,
  secondary: DS.fill,
  brand: DS.label,
  brandOn: DS.ink,
};

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** interpolate, clamped on both sides, eased when asked. */
export function tween(
  frame: number,
  [from, to]: [number, number],
  [a, b]: [number, number],
  easing: (t: number) => number = EASE,
): number {
  return interpolate(frame, [from, to], [a, b], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

/** The first characters of `text` typed at `cps` characters a second from `start`. */
export function typed(text: string, frame: number, start: number, cps = 26): string {
  const count = Math.max(0, Math.floor(((frame - start) / FPS) * cps));
  return text.slice(0, count);
}

const EURO = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
export const euro = (value: number) => EURO.format(value);
