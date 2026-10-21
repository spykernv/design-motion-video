// VYRA « La Porte » v2 — le montage, calé sur la musique (timing.json, scripts/vyra-teaser/analyse.py).
// 120 BPM : 1 temps = 15 frames, 1 mesure = 60 ; les temps tombent sur 1 + 15k.
import timing from './timing.json';

export const DURATION = 900; // 30 s
export const BEAT = 15;
export const DROP = timing.drop; // 241 : le drop (8,03 s)
export const FINAL = 721; // le dernier impact de la musique : la signature

const at = (f: number) => Math.min(Math.max(Math.round(f), 0), timing.bass.length - 1);
/** Enveloppe de basse 0..1 (attaque immédiate, relâchement 0,18 s). */
export const bass = (f: number) => timing.bass[at(f)];

export type Shot =
  | 'seuil'
  | 'approach'
  | 'open'
  | 'nave'
  | 'truck'
  | 'crane'
  | 'cuts'
  | 'carre'
  | 'relance'
  | 'signature';

// Coupes sur les temps. Blender rend chaque plan du château exactement à ces frames
// (SHOTS de blender/vyra-teaser/chateau.py) ; « cuts » et « relance » enchaînent 4 plans d'un temps.
export const CUTS: ReadonlyArray<readonly [number, Shot]> = [
  [0, 'seuil'],
  [61, 'approach'],
  [181, 'open'],
  [241, 'nave'],
  [301, 'truck'],
  [361, 'crane'],
  [421, 'cuts'],
  [481, 'carre'],
  [661, 'relance'],
  [721, 'signature'],
];

export const shotAt = (f: number): Shot => {
  let current: Shot = 'seuil';
  for (const [from, shot] of CUTS) {
    if (f >= from) current = shot;
  }
  return current;
};

/** Coupes franches du drop et de la relance : un léger coup de zoom, rien de plus. */
export const IMPACTS = [241, 301, 361, 421, 436, 451, 466, 661, 676, 691, 706, FINAL];
/** Temps de l'intro, la basse derrière la porte. */
export const INTRO_BEATS = Array.from({length: 16}, (_, k) => 1 + k * BEAT);

/** 1 à l'instant `from`, puis décroissance exponentielle (tau en frames). */
export const decay = (f: number, from: number, tau: number) => (f < from ? 0 : Math.exp(-(f - from) / tau));
export const peak = (f: number, list: readonly number[], tau: number) =>
  list.reduce((m, from) => Math.max(m, decay(f, from, tau)), 0);
