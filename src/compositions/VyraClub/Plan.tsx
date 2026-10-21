// Le plan du Lumen Club à l'encre, tracé trait par trait (grammaire du plan d'architecte).
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {ARCHIVO, CLAMP, OUT, PALETTE} from './theme';
import {
  BAR,
  BOOTH,
  COLUMNS,
  FLOOR,
  LABELS,
  MEZZANINE,
  PX_PER_M,
  ROOM,
  Rect,
  SCREEN,
  STAGE,
  TABLES,
  VIP,
  planX,
  planY,
} from './layout';

const M = PX_PER_M;

type Stroke = {d: string; w: number; dashed?: boolean};

const rectPath = (r: Rect) =>
  `M${planX(r.x0)},${planY(r.z0)} H${planX(r.x1)} V${planY(r.z1)} H${planX(r.x0)} Z`;

const circlePath = (x: number, z: number, r: number) => {
  const cx = planX(x);
  const cy = planY(z);
  const rp = r * M;
  return `M${cx - rp},${cy} a${rp},${rp} 0 1,0 ${rp * 2},0 a${rp},${rp} 0 1,0 ${-rp * 2},0`;
};

/** Banquette en U autour d'une table (ouverte vers la scène pour le carré, vers la piste ailleurs). */
const sofaPath = (x: number, z: number, side: 1 | -1) => {
  const cx = planX(x);
  const cy = planY(z);
  const o = side * 0.95 * M;
  return `M${cx - o * 0.2},${cy - 0.75 * M} H${cx + o} V${cy + 0.75 * M} H${cx - o * 0.2}`;
};

// Ordre de tracé : la salle, la scène, la piste, les zones, les tables, puis les détails.
const STROKES: Stroke[] = [
  {d: rectPath(ROOM), w: 4},
  {d: `M${planX(SCREEN.x0)},${planY(ROOM.z0) + 7} H${planX(SCREEN.x1)}`, w: 3},
  {d: rectPath(STAGE), w: 2.5},
  {d: rectPath(BOOTH), w: 2},
  {d: rectPath(FLOOR), w: 1.6, dashed: true},
  {d: rectPath(VIP), w: 2.5},
  {d: rectPath(MEZZANINE), w: 2.5},
  {d: rectPath(BAR), w: 2},
  ...TABLES.map((t) => ({d: circlePath(t.x, t.z, 0.45), w: 2})),
  ...TABLES.filter((t) => t.zone !== 'mezz').map((t) => ({
    d: sofaPath(t.x, t.z, t.zone === 'vip' ? 1 : -1),
    w: 1.6,
  })),
  ...COLUMNS.map(([x, z]) => ({d: circlePath(x, z, 0.3), w: 2})),
  // Entrée : ouverture de porte sous la mezzanine.
  {d: `M${planX(-1.5)},${planY(10)} A${3 * M},${3 * M} 0 0,1 ${planX(1.5)},${planY(7)}`, w: 1.4, dashed: true},
  // Cotes.
  {d: `M${planX(-8)},${planY(-10) - 46} H${planX(8)} M${planX(-8)},${planY(-10) - 58} v24 M${planX(8)},${planY(-10) - 58} v24`, w: 1.4},
];

// Hachures de la piste : la grille du sol de danse.
const FLOOR_GRID = (() => {
  const lines: string[] = [];
  for (let x = FLOOR.x0 + 0.9; x < FLOOR.x1 - 0.1; x += 0.9) lines.push(`M${planX(x)},${planY(FLOOR.z0)} V${planY(FLOOR.z1)}`);
  for (let z = FLOOR.z0 + 0.95; z < FLOOR.z1 - 0.1; z += 0.95) lines.push(`M${planX(FLOOR.x0)},${planY(z)} H${planX(FLOOR.x1)}`);
  return lines.join(' ');
})();

// Cordon de velours du carré : poteaux le long du bord.
const ROPE_POSTS = [-6.2, -4.7, -3.2, -1.7].map((z) => [VIP.x0, z] as const);

export const Plan: React.FC<{f: number; start?: number; drawn?: boolean; color?: string}> = ({
  f,
  start = 0,
  drawn = false,
  color = PALETTE.ink,
}) => {
  const local = f - start;
  const n = STROKES.length;
  const strokeProgress = (i: number) =>
    drawn ? 1 : interpolate(local, [4 + i * 1.6, 22 + i * 1.6], [0, 1], {...CLAMP, easing: OUT});
  const details = drawn ? 1 : interpolate(local, [34, 58], [0, 1], CLAMP);
  const labels = drawn ? 1 : interpolate(local, [40, 64], [0, 1], CLAMP);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <path d={FLOOR_GRID} stroke={color} strokeWidth={0.8} opacity={0.22 * details} fill="none" />
        {STROKES.map((s, i) => (
          <path
            key={i}
            d={s.d}
            pathLength={1}
            fill="none"
            stroke={color}
            strokeWidth={s.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={s.dashed ? undefined : '1 1'}
            strokeDashoffset={s.dashed ? undefined : 1 - strokeProgress(i)}
            opacity={s.dashed ? strokeProgress(i) * 0.7 : 1}
            style={s.dashed ? {strokeDasharray: '0.012 0.01'} : undefined}
          />
        ))}
        {ROPE_POSTS.map(([x, z], i) => (
          <circle key={i} cx={planX(x)} cy={planY(z)} r={4} fill={color} opacity={details} />
        ))}
        {/* Hachures de la mezzanine (plancher en hauteur). */}
        <g opacity={0.18 * details}>
          {Array.from({length: 22}, (_, i) => {
            const x = planX(MEZZANINE.x0) + i * 38;
            return <path key={i} d={`M${x},${planY(MEZZANINE.z1)} l${-60},${-5 * M + 2}`} stroke={color} strokeWidth={1} />;
          })}
        </g>
        <g fontFamily={ARCHIVO} fill={color} opacity={labels}>
          {LABELS.map((l) => (
            <text
              key={l.text}
              x={planX(l.x)}
              y={planY(l.z)}
              fontSize={21}
              fontWeight={600}
              letterSpacing={4}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={l.vertical ? `rotate(-90 ${planX(l.x)} ${planY(l.z)})` : undefined}
            >
              {l.text}
            </text>
          ))}
          {TABLES.map((t) => (
            <text
              key={t.id}
              x={planX(t.x)}
              y={planY(t.z) + 1}
              fontSize={15}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {t.id}
            </text>
          ))}
          <text x={540} y={planY(-10) - 66} fontSize={17} fontWeight={500} letterSpacing={3} textAnchor="middle">
            16,0 M
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
