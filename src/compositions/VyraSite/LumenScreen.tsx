// Lumen Club's screen loop for the night « Samedi soir » (demo venue): the LED wall behind the DJ,
// 12 × 4 m, in the club's brass and petrol. 16 beats at 122 BPM, seamless: the wordmark draws in
// on the beat, glows, then draws out to the empty wall it started from. Played on the wall of the
// site's 3D room and in the brand film (« Votre marque d'abord »).
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

import {JOST} from './theme';

/** 16 beats at 122 BPM, at 30 fps. */
export const SCREEN_DURATION = 236;
const BEAT = SCREEN_DURATION / 16;

const BRASS = '#c9a46a';
const BRASS_HI = '#f1dcb0';
const PETROL = '#12a3b4';

/** The LUMEN wordmark (brand.json), in a 78 × 20 box. */
const STROKES = [
  'M1.5 2V18H11',
  'M16 2V13a5 5 0 0 0 10 0V2',
  'M31 18V2L38 13L45 2V18',
  'M59 2H50V18H59M50 10H57.5',
  'M64 18V2L76 18V2',
];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const LumenScreen = () => {
  const frame = useCurrentFrame();
  const beat = frame / BEAT;
  // a pulse on every beat, fading before the next
  const pulse = Math.exp(-(beat % 1) * 4);
  // the wordmark: drawn over beats 0.5–4, held, then drawn out over beats 12–15.5
  const drawIn = interpolate(beat, [0.5, 4], [0, 1], clamp);
  const drawOut = interpolate(beat, [12, 15.5], [0, 1], clamp);
  const shown = drawIn - drawOut;
  // the foil's light sweeping across the letters while they hold
  const sweep = interpolate(beat, [4, 12], [-0.3, 1.3], clamp);
  const night = interpolate(beat, [4.5, 6, 11, 12.5], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{background: '#070504', overflow: 'hidden', fontFamily: JOST}}>
      {/* the warm floor of the wall, breathing on the beat */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 120% at 50% 110%, rgb(201 164 106 / ${0.16 + 0.1 * pulse}) 0%, transparent 60%)`,
        }}
      />
      {/* rails of light running across, brass, one in petrol */}
      {Array.from({length: 9}, (_, i) => {
        const y = 40 + i * 40;
        const speed = 1 + (i % 3) * 0.5;
        const x = ((frame * speed * 7 + i * 260) % 1700) - 250;
        const petrol = i === 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 260,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${petrol ? PETROL : BRASS}, transparent)`,
              opacity: 0.18 + 0.25 * pulse * (petrol ? 1 : 0.6),
              filter: 'blur(0.6px)',
            }}
          />
        );
      })}
      {/* the wordmark */}
      <svg
        viewBox="-4 -4 86 28"
        style={{position: 'absolute', left: 260, top: 70, width: 680, height: 221, overflow: 'visible'}}
      >
        <defs>
          <linearGradient id="foil" x1="0" x2="1" y1="0" y2="0">
            <stop offset={Math.max(0, sweep - 0.18)} stopColor={BRASS} />
            <stop offset={Math.min(1, Math.max(0, sweep))} stopColor={BRASS_HI} />
            <stop offset={Math.min(1, sweep + 0.18)} stopColor={BRASS} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation={0.9 + 0.5 * pulse} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {STROKES.map((d, i) => {
          // each letter draws a little after the one before it
          const local = Math.min(1, Math.max(0, shown * 1.6 - i * 0.15));
          return (
            <path
              key={d}
              d={d}
              pathLength={1}
              fill="none"
              stroke="url(#foil)"
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={1}
              strokeDashoffset={1 - local}
              filter="url(#glow)"
            />
          );
        })}
      </svg>
      {/* the night's name under it */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 302,
          textAlign: 'center',
          color: BRASS,
          fontSize: 26,
          letterSpacing: '0.6em',
          fontWeight: 400,
          opacity: night,
          transform: `translateY(${(1 - night) * 8}px)`,
        }}
      >
        SAMEDI SOIR
      </div>
    </AbsoluteFill>
  );
};
