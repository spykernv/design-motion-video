// Shared pieces of the site's films: the screen, a finger's tap, the app's icons and buttons.
import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

import {GLASS, JOST, LUMEN, SCREEN, tween} from './theme';

/** A phone's screen: 390 × 844 CSS px, Jost, on the night's ink. */
export function Screen({children, background = GLASS.ink}: {children: ReactNode; background?: string}) {
  return (
    <AbsoluteFill
      style={{
        width: SCREEN.width,
        height: SCREEN.height,
        background,
        fontFamily: JOST,
        color: GLASS.label,
        overflow: 'hidden',
        fontFeatureSettings: '"tnum" 1',
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** A finger's tap at (x, y) on frame `at`: the press, then a ring opening out. */
export function Tap({at, x, y, light = true}: {at: number; x: number; y: number; light?: boolean}) {
  const frame = useCurrentFrame();
  if (frame < at - 8 || frame > at + 18) return null;
  const press = tween(frame, [at - 8, at], [0, 1]) * (1 - tween(frame, [at + 4, at + 12], [0, 1]));
  const ring = tween(frame, [at, at + 16], [0, 1]);
  const color = light ? '255 255 255' : '20 18 16';
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: -22,
          top: -22,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: `rgb(${color} / ${0.32 * press})`,
          transform: `scale(${0.7 + 0.3 * press})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -22,
          top: -22,
          width: 44,
          height: 44,
          borderRadius: 22,
          border: `2px solid rgb(${color} / ${0.75 * (1 - ring)})`,
          transform: `scale(${0.8 + 1.1 * ring})`,
          opacity: ring > 0 ? 1 : 0,
        }}
      />
    </div>
  );
}

const STROKE = {fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

/** The app's icons (lucide, as in the app), at `size` px. */
export const Icon = {
  crown: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
      <path d="M5 21h14" />
    </svg>
  ),
  close: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  check: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE} strokeWidth={3}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  chevronLeft: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  chevronDown: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  phone: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  message: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  download: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  users: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  at: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  ),
  file: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4M8 13h2M14 13h2M8 17h2M14 17h2" />
    </svg>
  ),
  sort: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16" />
    </svg>
  ),
};

/** The club's main button: its brass, a pill (« Demander cette table », « Envoyer la demande »). */
export function GoldButton({children, pressed = 0, style}: {children: ReactNode; pressed?: number; style?: CSSProperties}) {
  return (
    <div
      style={{
        height: 50,
        borderRadius: 25,
        background: LUMEN.pill,
        color: LUMEN.on,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 500,
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.45), 0 8px 24px rgb(201 164 106 / 0.18)',
        transform: `scale(${1 - 0.03 * pressed})`,
        filter: `brightness(${1 - 0.08 * pressed})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** The prestige tier's tile: the crown on its copper. */
export function TierTile({size = 48}: {size?: number}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        background: `linear-gradient(160deg, ${LUMEN.prestige} 0%, #b9462a 55%, ${LUMEN.prestigeDeep} 100%)`,
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff5ef',
        flexShrink: 0,
      }}
    >
      {Icon.crown(size * 0.46)}
    </div>
  );
}

/** A section's name in the app's sheets: small spaced capitals. */
export function Eyebrow({children, color = GLASS.label3}: {children: ReactNode; color?: string}) {
  return (
    <div style={{fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color, fontWeight: 500}}>
      {children}
    </div>
  );
}
