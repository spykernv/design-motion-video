// Shared pieces of the site's films: the screen, a finger's tap, the app's icons, and its kit as
// it is today (app: src/components/experience/ui.tsx, « Dark Sculpted »): the light-ringed pill,
// the raised and pressed-in surfaces, the steps, the stepper, the switch, the fields' wells.
import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

import {DS, glow, INTER, light, M, SCREEN, T, tween} from './theme';

/** A phone's screen: 390 × 844 CSS px, in the app's Inter on its charcoal ground. */
export function Screen({
  children,
  background = DS.ink,
  font = INTER,
  tabular = false,
}: {
  children: ReactNode;
  background?: string;
  /** The typeface the screen is drawn in: the app's Inter unless a film keeps its own. */
  font?: string;
  /** Tabular figures everywhere (the films drawn before the redesign set them so). */
  tabular?: boolean;
}) {
  return (
    <AbsoluteFill
      style={{
        width: SCREEN.width,
        height: SCREEN.height,
        background,
        fontFamily: font,
        color: DS.label,
        overflow: 'hidden',
        fontFeatureSettings: tabular ? '"tnum" 1' : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** A finger's tap at (x, y) on frame `at`: the press, then a ring opening out. */
export function Tap({at, x, y, light: onDark = true}: {at: number; x: number; y: number; light?: boolean}) {
  const frame = useCurrentFrame();
  if (frame < at - 8 || frame > at + 18) return null;
  const press = tween(frame, [at - 8, at], [0, 1]) * (1 - tween(frame, [at + 4, at + 12], [0, 1]));
  const ring = tween(frame, [at, at + 16], [0, 1]);
  const color = onDark ? '255 255 255' : '20 18 16';
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
  crown: (size = 22, strokeWidth = 2) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE} strokeWidth={strokeWidth}>
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
      <path d="M5 21h14" />
    </svg>
  ),
  close: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  check: (size = 14, strokeWidth = 3) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE} strokeWidth={strokeWidth}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  circleCheck: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  minus: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE} strokeWidth={2.25}>
      <path d="M5 12h14" />
    </svg>
  ),
  plus: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE} strokeWidth={2.25}>
      <path d="M5 12h14M12 5v14" />
    </svg>
  ),
  copy: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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

/** How far a press has gone at `frame` for a tap on frame `at`: down, then back up. */
export function pressAt(frame: number, at: number): number {
  return tween(frame, [at - 5, at], [0, 1]) * (1 - tween(frame, [at + 2, at + 8], [0, 1]));
}

/**
 * The app's button (`Btn`), large: `brand` is the screen's one primary action, in the light;
 * `glass` a raised matte pill (the send button before everything needed is filled in).
 */
export function Btn({
  children,
  variant = 'brand',
  lit,
  pressed = 0,
  style,
}: {
  children: ReactNode;
  variant?: 'brand' | 'glass';
  /** From 0 (`glass`, its words dimmed) to 1 (`brand`): the send button lighting up. */
  lit?: number;
  pressed?: number;
  style?: CSSProperties;
}) {
  const on = lit ?? (variant === 'brand' ? 1 : 0);
  return (
    <div style={{position: 'relative', height: 52, transform: `scale(${1 - 0.03 * pressed})`, ...style}}>
      <div
        style={{
          ...M.sculpt,
          position: 'absolute',
          inset: 0,
          borderRadius: 26,
          opacity: 1 - on,
        }}
      />
      <div
        style={{
          ...M.brandPill,
          position: 'absolute',
          inset: 0,
          borderRadius: 26,
          opacity: on,
          textShadow: undefined,
        }}
      />
      <div
        style={{
          ...T.callout,
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '0 24px',
          whiteSpace: 'nowrap',
          fontWeight: on > 0.5 ? 600 : 500,
          color: on > 0.5 ? DS.label : DS.label2,
          textShadow: `0 0 14px ${glow(0.35 * on)}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** A zone's tile: a raised matte squircle, its glyph in ivory (the prestige tier's crown). */
export function ZoneTile({size = 48}: {size?: number}) {
  return (
    <div
      style={{
        ...M.sculpt,
        width: size,
        height: size,
        borderRadius: '30%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: DS.label,
        flexShrink: 0,
      }}
    >
      {Icon.crown(size * 0.46, 1.6)}
    </div>
  );
}

/** A section's name: small spaced capitals, in the third text level. */
export function Eyebrow({children, color = DS.label3, style}: {children: ReactNode; color?: string; style?: CSSProperties}) {
  return <div style={{...T.eyebrow, color, ...style}}>{children}</div>;
}

/** The round close button of a sheet (`IconBtn` « Fermer »). */
export function CloseButton() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        background: light(0.08),
        color: DS.label2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {Icon.close(16)}
    </div>
  );
}

/** The rim of glass: a hairline lit at its top left, on a positioned, rounded element. */
export function GlassRim() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        padding: 1,
        background: `linear-gradient(155deg, ${light(0.42)}, ${light(0.08)} 30%, ${light(0.02)} 60%, ${light(0.12)})`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
      }}
    />
  );
}

const STEPS = ['Table', 'Coordonnées', 'Envoi'] as const;

/** Where the buyer is in the request; a phone keeps only the current step's name. */
export function Steps({current, style}: {current: 1 | 2 | 3; style?: CSSProperties}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, ...style}}>
      {STEPS.map((label, index) => {
        const step = index + 1;
        const state = step < current ? 'done' : step === current ? 'current' : 'todo';
        return (
          <div key={label} style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <div
              style={{
                ...T.num,
                width: 18,
                height: 18,
                borderRadius: 9,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 600,
                color: state === 'todo' ? DS.label3 : DS.label,
                background: state === 'done' ? DS.fill : 'transparent',
                boxShadow:
                  state === 'todo'
                    ? `inset 0 0 0 1px ${DS.hairlineStrong}`
                    : state === 'current'
                      ? `0 0 0 1px ${light(0.85)}, 0 0 10px -2px ${glow(0.55)}`
                      : 'none',
              }}
            >
              {state === 'done' ? Icon.check(10, 3) : step}
            </div>
            {state === 'current' ? <span style={{...T.caption, fontWeight: 500, color: DS.label}}>{label}</span> : null}
            {step < STEPS.length ? <div style={{width: 12, height: 1, background: DS.hairlineStrong, flexShrink: 0}} /> : null}
          </div>
        );
      })}
    </div>
  );
}

const stepperButton = (enabled: boolean): CSSProperties => ({
  ...M.sculpt,
  width: 34,
  height: 34,
  borderRadius: 17,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: DS.label,
  opacity: enabled ? 1 : 0.3,
});

/** − value +: a track pressed into the surface, two raised buttons. */
export function Stepper({value, canLess = true, canMore = true}: {value: number; canLess?: boolean; canMore?: boolean}) {
  return (
    <div style={{...M.sunken, height: 40, borderRadius: 20, padding: 3, display: 'flex', alignItems: 'center'}}>
      <div style={stepperButton(canLess)}>{Icon.minus(14)}</div>
      <div style={{...T.ui, ...T.num, width: 48, textAlign: 'center', fontWeight: 600}}>{value}</div>
      <div style={stepperButton(canMore)}>{Icon.plus(14)}</div>
    </div>
  );
}

/** A switch: a pressed-in track; on (0 → 1), the knob slides across in ivory light. */
export function SwitchTrack({on}: {on: number}) {
  return (
    <div style={{...M.sunken, position: 'relative', width: 51, height: 31, borderRadius: 16, flexShrink: 0}}>
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          width: 27,
          height: 27,
          borderRadius: 14,
          transform: `translateX(${20 * on}px)`,
          background: on > 0.5 ? DS.label : '#3a3a3a',
          boxShadow:
            on > 0.5
              ? `0 0 14px -2px ${glow(0.7)}, 0 3px 8px rgb(0 0 0 / 0.5)`
              : `0 3px 8px rgb(0 0 0 / 0.5), inset 0 1px 0 ${light(0.18)}`,
        }}
      />
    </div>
  );
}

/** A text caret, ivory, blinking as on a phone. */
export function Caret({height = 18}: {height?: number}) {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: 'inline-block',
        width: 1.5,
        height,
        marginLeft: 1,
        verticalAlign: 'middle',
        background: DS.label,
        opacity: Math.floor(frame / 15) % 2 ? 0 : 1,
      }}
    />
  );
}

/**
 * A field in its own pressed well (14 px corners): its name on the left, what is typed on the
 * right; with the focus, the light along its edge and a caret.
 */
export function Field({
  label,
  value,
  placeholder,
  focus = false,
  suffix,
  prefix,
}: {
  label: string;
  value: string;
  placeholder: string;
  focus?: boolean;
  suffix?: ReactNode;
  prefix?: ReactNode;
}) {
  return (
    <div
      style={{
        ...(focus ? M.sunkenFocus : M.sunken),
        borderRadius: 14,
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
      }}
    >
      <span style={{...T.ui, color: DS.label2, width: 104, flexShrink: 0}}>{label}</span>
      <span style={{...T.ui, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, whiteSpace: 'nowrap'}}>
        {prefix}
        <span style={{color: value ? DS.label : DS.label3}}>
          {value || (focus ? '' : placeholder)}
          {focus ? <Caret /> : null}
        </span>
        {suffix}
      </span>
    </div>
  );
}

/** A group of rows in one well, its lines in a faint light, under an eyebrow. */
export function Group({title, children, footer, style}: {title?: string; children: ReactNode; footer?: ReactNode; style?: CSSProperties}) {
  return (
    <div style={style}>
      {title ? <Eyebrow style={{marginBottom: 8, padding: '0 4px'}}>{title}</Eyebrow> : null}
      {children}
      {footer ? <div style={{...T.caption, color: DS.label3, marginTop: 6, padding: '0 4px'}}>{footer}</div> : null}
    </div>
  );
}

/** The list inside a group: one well, rows divided by a faint line of light. */
export function List({children}: {children: ReactNode}) {
  return <div style={{...M.sunken, borderRadius: 16, overflow: 'hidden'}}>{children}</div>;
}

export const DIVIDER = light(0.07);

/** « Démo », on a demo's screen: a quiet tag with a hairline. */
export function DemoTag() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 6px',
        borderRadius: 6,
        fontSize: 11,
        lineHeight: 1,
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: DS.label2,
        boxShadow: `inset 0 0 0 1px ${DS.hairlineStrong}`,
      }}
    >
      Démo
    </span>
  );
}

/**
 * Which side the scene shows, and what happens there: a pinned capsule, the side in ivory for the
 * club (its dashboard's colour), ringed with light for the guest (the app's).
 */
export function SideLabel({club, text}: {club: boolean; text: string}) {
  return (
    <div style={{position: 'absolute', top: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          height: 28,
          padding: '0 12px 0 3px',
          borderRadius: 14,
          background: 'rgb(18 18 18 / 0.9)',
          boxShadow: `inset 0 1px 0 ${light(0.22)}, inset 0 0 0 1px ${light(0.1)}, 0 8px 20px -10px rgb(0 0 0 / 0.8)`,
        }}
      >
        <span
          style={{
            ...T.eyebrow,
            fontWeight: 600,
            letterSpacing: '0.14em',
            height: 22,
            padding: '0 9px',
            borderRadius: 11,
            display: 'flex',
            alignItems: 'center',
            ...(club
              ? {background: DS.label, color: DS.ink}
              : {color: DS.label, boxShadow: `inset 0 0 0 1px ${light(0.85)}, 0 0 10px -2px ${glow(0.55)}`}),
          }}
        >
          {club ? 'Côté club' : 'Côté client'}
        </span>
        <span style={{...T.footnote, fontWeight: 500, color: DS.label}}>{text}</span>
      </div>
    </div>
  );
}
