// Effets du teaser : grain, vignette, texte feuille d'or, griffures d'or, poussière d'or.
// Déterministe : `random(graine)` de remotion, jamais Math.random().
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {GOLD_FOIL, PALETTE} from './theme';

const grainUrl = (seed: number) =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${seed}' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

/** Grain argentique ; `seed` change à chaque frame en animation. */
export const Grain: React.FC<{opacity?: number; seed?: number}> = ({opacity = 0.07, seed = 1}) => (
  <AbsoluteFill style={{backgroundImage: grainUrl(seed), opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}} />
);

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.7}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 60% at 50% 46%, transparent 52%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Texte en feuille d'or, avec un halo doux. */
export const GoldText: React.FC<{style?: React.CSSProperties; glow?: number; children: React.ReactNode}> = ({
  style,
  glow = 0.35,
  children,
}) => (
  <span
    style={{
      backgroundImage: GOLD_FOIL,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      filter: `drop-shadow(0 0 22px rgba(232,194,122,${glow}))`,
      ...style,
    }}
  >
    {children}
  </span>
);

/** Aberration chromatique : franges rouge et cyan derrière un texte (impacts du drop). */
export const Fringe: React.FC<{offset: number; style: React.CSSProperties; children: React.ReactNode}> = ({
  offset,
  style,
  children,
}) => (
  <>
    <span style={{...style, position: 'absolute', color: '#ff1a3c', opacity: 0.55, transform: `translateX(${-offset}px)`, mixBlendMode: 'screen'}}>
      {children}
    </span>
    <span style={{...style, position: 'absolute', color: '#19e6ff', opacity: 0.3, transform: `translateX(${offset}px)`, mixBlendMode: 'screen'}}>
      {children}
    </span>
  </>
);

type Slash = {from: [number, number]; to: [number, number]; width: number};

// Une griffure = un fuseau effilé aux deux bouts, légèrement courbé.
const slashPath = ({from: [x1, y1], to: [x2, y2], width}: Slash, bend: number) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  const c1 = [mx + nx * (width + bend), my + ny * (width + bend)];
  const c2 = [mx - nx * (width - bend), my - ny * (width - bend)];
  return `M ${x1} ${y1} Q ${c1[0]} ${c1[1]} ${x2} ${y2} Q ${c2[0]} ${c2[1]} ${x1} ${y1} Z`;
};

/** Trois griffures d'or qui déchirent le noir. `progress` 0→1 les trace de haut en bas. */
export const ClawMarks: React.FC<{
  from: [number, number];
  to: [number, number];
  gap?: number;
  width?: number;
  progress?: number;
}> = ({from, to, gap = 78, width = 26, progress = 1}) => {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const nx = -(to[1] - from[1]) / len;
  const ny = (to[0] - from[0]) / len;
  const slashes: Slash[] = [-1, 0, 1].map((k) => {
    const shift = k * gap;
    const lag = k * 0.06 * len; // la griffure du milieu est la plus longue
    const s: [number, number] = [from[0] + nx * shift + ((to[0] - from[0]) / len) * Math.abs(lag), from[1] + ny * shift + ((to[1] - from[1]) / len) * Math.abs(lag)];
    const e: [number, number] = [s[0] + (to[0] - from[0]) * progress * (1 - Math.abs(k) * 0.12), s[1] + (to[1] - from[1]) * progress * (1 - Math.abs(k) * 0.12)];
    return {from: s, to: e, width: width * (k === 0 ? 1 : 0.8)};
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="claw-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff6dc" />
            <stop offset="0.35" stopColor={PALETTE.goldHi} />
            <stop offset="0.7" stopColor={PALETTE.gold} />
            <stop offset="1" stopColor={PALETTE.goldDeep} />
          </linearGradient>
          <filter id="claw-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <g style={{mixBlendMode: 'screen'}} filter="url(#claw-glow)" opacity={0.85}>
          {slashes.map((s, i) => (
            <path key={`g${i}`} d={slashPath({...s, width: s.width * 2.2}, 10)} fill={PALETTE.gold} />
          ))}
        </g>
        {slashes.map((s, i) => (
          <path key={i} d={slashPath(s, 10)} fill="url(#claw-gold)" />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Poussière d'or autour d'une colonne (x en px, largeur de dispersion). En animation, `frame` et `speed`
 * (px par frame, > 0 = tombe) la font dériver en boucle entre `top` et `bottom`, et elle scintille.
 */
export const GoldDust: React.FC<{
  seed: string;
  count: number;
  x: number;
  spread: number;
  top: number;
  bottom: number;
  streak?: number;
  frame?: number;
  speed?: number;
  opacity?: number;
}> = ({seed, count, x, spread, top, bottom, streak = 0, frame = 0, speed = 0, opacity = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
    {Array.from({length: count}, (_, i) => {
      const r = random(`${seed}-${i}`);
      const px = x + (random(`${seed}-x-${i}`) - 0.5) * spread * (0.3 + r);
      const range = bottom - top;
      const travel = speed * frame * (0.6 + random(`${seed}-v-${i}`) * 0.8);
      const py = top + ((((random(`${seed}-y-${i}`) * range + travel) % range) + range) % range);
      const size = 2 + random(`${seed}-s-${i}`) * 5;
      const twinkle = frame ? 0.65 + 0.35 * Math.sin(frame * 0.21 + i * 1.7) : 1;
      const alpha = (0.25 + random(`${seed}-a-${i}`) * 0.75) * twinkle;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: px,
            top: py,
            width: size * 0.7,
            height: streak ? size * streak : size,
            borderRadius: streak ? size : '50%',
            background: streak
              ? `linear-gradient(180deg, rgba(246,223,166,0) 0%, rgba(246,223,166,${alpha}) 100%)`
              : `rgba(246,223,166,${alpha})`,
            boxShadow: `0 0 ${size * 3}px rgba(232,194,122,${alpha * 0.8})`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);
