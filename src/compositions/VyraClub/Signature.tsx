// La signature : la marque du club devant, VYRA en petit, la promesse et l'appel à l'action unique.
import React from 'react';
import {interpolate, spring} from 'remotion';
import {ARCHIVO, CLAMP, CUTS, FPS, OUT, PALETTE} from './theme';

const Reveal: React.FC<{s: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({s, at, children, style}) => {
  const t = spring({frame: s - at, fps: FPS, config: {damping: 200}, durationInFrames: 18});
  return (
    <div style={{overflow: 'hidden', paddingBottom: 8, ...style}}>
      <div style={{transform: `translateY(${((1 - t) * 105).toFixed(2)}%)`}}>{children}</div>
    </div>
  );
};

export const Signature: React.FC<{f: number}> = ({f}) => {
  const s = f - CUTS.signature;
  const rule = interpolate(s, [10, 30], [0, 1], {...CLAMP, easing: OUT});
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: ARCHIVO, color: PALETTE.ink}}>
      <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Reveal s={s} at={0}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, fontSize: 118, fontWeight: 800, letterSpacing: '-0.03em'}}>
            <span style={{width: 30, height: 30, borderRadius: 99, background: PALETTE.lumen, marginTop: 10}} />
            Lumen Club
          </div>
        </Reveal>
        <Reveal s={s} at={8}>
          <div style={{fontSize: 30, fontWeight: 500, letterSpacing: '0.24em', color: PALETTE.inkSoft, marginTop: 4}}>
            AVEC <span style={{fontWeight: 800, color: PALETTE.ink}}>VYRA</span>
          </div>
        </Reveal>
        <div style={{width: 420 * rule, height: 2, background: PALETTE.ink, margin: '54px 0 50px'}} />
        <Reveal s={s} at={20}>
          <div style={{fontSize: 70, fontWeight: 700, letterSpacing: '-0.025em'}}>Chaque table a une vue.</div>
        </Reveal>
        <Reveal s={s} at={34} style={{marginTop: 56}}>
          <div
            style={{
              height: 104,
              padding: '0 54px',
              borderRadius: 999,
              background: PALETTE.ink,
              color: PALETTE.paper,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            Demander une visite privée
            <svg width="30" height="30" viewBox="0 0 30 30">
              <path d="M5 15 H24 M16 7 L24 15 L16 23" stroke={PALETTE.paper} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
