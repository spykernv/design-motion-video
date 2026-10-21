// Typo et repères communs : phrases révélées par masque, étiquette « démo », étiquettes posées sur la 3D.
import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {projectAt} from './camera';
import {HERO, LABELS} from './layout';
import {ARCHIVO, CLAMP, FPS, OUT, PALETTE, SAFE} from './theme';

/** Une phrase qui monte depuis un masque, tient, puis s'efface vers le haut. */
export const Caption: React.FC<{
  f: number;
  from: number;
  to: number;
  text: string;
  color: string;
  top?: number;
  size?: number;
}> = ({f, from, to, text, color, top = 330, size = 76}) => {
  if (f < from || f >= to) return null;
  const enter = spring({frame: f - from, fps: FPS, config: {damping: 200}, durationInFrames: 18});
  const exit = interpolate(f, [to - 8, to - 1], [0, 1], {...CLAMP, easing: OUT});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: SAFE.right - 40,
        overflow: 'hidden',
        paddingBottom: 12,
      }}
    >
      <div
        style={{
          fontFamily: ARCHIVO,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: '-0.025em',
          color,
          transform: `translateY(${((1 - enter) * 105 - exit * 30).toFixed(2)}%)`,
          opacity: 1 - exit,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Lumen Club est fictif : il reste étiqueté « démo » du début à la fin. */
export const DemoTag: React.FC<{color: string}> = ({color}) => (
  <div
    style={{
      position: 'absolute',
      top: 262,
      left: 70,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontFamily: ARCHIVO,
      fontSize: 21,
      fontWeight: 600,
      letterSpacing: '0.22em',
      color,
    }}
  >
    <span>LUMEN CLUB</span>
    <span style={{border: `1.5px solid ${color}`, borderRadius: 999, padding: '3px 12px 3px 15px', opacity: 0.85}}>DÉMO</span>
  </div>
);

const Tag: React.FC<{x: number; y: number; text: string; color: string; opacity: number; strong?: boolean}> = ({
  x,
  y,
  text,
  color,
  opacity,
  strong,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
      fontFamily: ARCHIVO,
      fontSize: strong ? 26 : 21,
      fontWeight: strong ? 700 : 600,
      letterSpacing: '0.2em',
      whiteSpace: 'nowrap',
      color,
      opacity,
      background: strong ? PALETTE.paper : undefined,
      padding: strong ? '8px 16px 8px 20px' : undefined,
      border: strong ? `2px solid ${PALETTE.ink}` : undefined,
    }}
  >
    {text}
  </div>
);

/** Étiquettes des zones collées à la salle 3D pendant que le plan se lève, puis l'étiquette de la table 12. */
export const RoomLabels: React.FC<{f: number}> = ({f}) => {
  const zones = interpolate(f, [210, 214, 262, 282], [1, 1, 1, 0], CLAMP);
  const hero = interpolate(f, [330, 342, 388, 398], [0, 1, 1, 0], CLAMP);
  return (
    <AbsoluteFill>
      {zones > 0 &&
        LABELS.filter((l) => !l.vertical).map((l) => {
          const p = projectAt(f, [l.x, l.y + 0.05, l.z]);
          return p && <Tag key={l.text} x={p.x} y={p.y} text={l.text} color={PALETTE.ink} opacity={zones} />;
        })}
      {hero > 0 &&
        (() => {
          const p = projectAt(f, [HERO.x, HERO.y + 1.6, HERO.z]);
          return p && <Tag x={p.x} y={p.y} text="TABLE 12 · CARRÉ VIP" color={PALETTE.ink} opacity={hero} strong />;
        })()}
    </AbsoluteFill>
  );
};
