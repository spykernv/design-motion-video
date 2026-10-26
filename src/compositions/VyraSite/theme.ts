// VYRA — the site's films (spykernv/vyra-site, « Ce qui se passe ensuite »): the app's screens on a
// phone, as they are in V1, with the demo venue Lumen Club (fictional, labelled « démo » on the
// site). Colours and type come from the app (src/app/globals.css: Night Glass for the guest, the
// admin's dark theme), the demo's data from clubs/lumen-club/content.json.
import {loadFont as loadJost} from '@remotion/google-fonts/Jost';
import {Easing, interpolate} from 'remotion';

/** A phone's screen in CSS pixels; rendered with --scale=2 (780 × 1688). */
export const SCREEN = {width: 390, height: 844};
export const FPS = 30;

export const {fontFamily: JOST} = loadJost('normal', {
  weights: ['300', '400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
});

/** Night Glass, the guest's screens (app globals.css, `.dark`). */
export const GLASS = {
  ink: '#060408',
  label: '#f5f4f7',
  label2: 'rgb(235 233 245 / 0.64)',
  label3: 'rgb(235 233 245 / 0.38)',
  hairline: 'rgb(255 255 255 / 0.09)',
  hairlineStrong: 'rgb(255 255 255 / 0.16)',
  fill: 'rgb(130 126 145 / 0.2)',
  fill2: 'rgb(130 126 145 / 0.12)',
  glass: 'rgb(22 19 27 / 0.56)',
  thick: 'rgb(17 15 21 / 0.86)',
  ok: '#30d158',
  wait: '#ffd60a',
  off: '#8e8e93',
};

/** Lumen Club's brand (brand.json): brass, and the prestige tier's copper. */
export const LUMEN = {
  accent: '#c9a46a',
  on: '#1a1208',
  pill: 'linear-gradient(180deg, #e6c995 0%, #c9a46a 52%, #a8834a 100%)',
  price: '#e2c48e',
  prestige: '#ec6b45',
  prestigeDeep: '#6a2412',
};

/** The manager's dashboard (/admin): the dark theme with VYRA's own gold. */
export const ADMIN = {
  background: '#060408',
  card: '#121016',
  popover: '#16131b',
  border: 'rgb(255 255 255 / 0.09)',
  input: 'rgb(255 255 255 / 0.12)',
  label: '#f5f4f7',
  muted: 'rgb(235 233 245 / 0.6)',
  secondary: 'rgb(130 126 145 / 0.2)',
  brand: '#e8c27a',
  brandOn: '#1d1406',
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
