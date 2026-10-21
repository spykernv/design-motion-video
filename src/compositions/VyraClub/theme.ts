// VYRA « Chaque table a une vue » — palette, typo et grille de montage (voir STORYBOARD.md).
// Le jour, c'est l'outil VYRA (papier, encre, grammaire du plan) ; la nuit, c'est le club (noir et violet Lumen).
import {Easing} from 'remotion';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 900;

export const PALETTE = {
  paper: '#f3f0e8',
  paperDeep: '#e6e1d4',
  ink: '#14131a',
  inkSoft: '#5d5a66',
  night: '#07060c',
  nightDeep: '#0e0c17',
  lumen: '#8b6cff',
  lumenHi: '#c7b8ff',
};

export const {fontFamily: ARCHIVO} = loadArchivo('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin', 'latin-ext'],
});

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

// Grille à 120 BPM : 1 temps = 15 frames. Les coupes tombent sur les temps.
export const BEAT = 15;
export const CUTS = {
  plan: 0,
  aveugle: 90,
  visite: 210,
  vue: 360,
  nuit: 405,
  demande: 480,
  club: 600,
  decision: 720,
  signature: 810,
};

/** Enveloppe d'un battement : 1 sur le temps, décroît ensuite (à partir de `from`). */
export const pulse = (f: number, from: number, tau = 5) =>
  f < from ? 0 : Math.exp(-((f - from) % BEAT) / tau);

/** Mélange deux couleurs hexadécimales (t de 0 à 1). */
export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const c = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
};

// Zone sûre Reels : rien d'important au-dessus de 260 px ni sous 1500 px, marge droite 140 px.
export const SAFE = {top: 260, bottom: 1500, right: 140};
