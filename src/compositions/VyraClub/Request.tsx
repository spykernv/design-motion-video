// Le contrechamp, côté club : la notification tombe, la demande s'ouvre complète et chaque ligne se coche
// à l'encre. Puis les deux décisions possibles, sans clic : c'est le club qui décide.
import React from 'react';
import {interpolate, spring} from 'remotion';
import {ARCHIVO, CLAMP, CUTS, FPS, IN_OUT, OUT, PALETTE} from './theme';

const LINES: [string, string][] = [
  ['Date', 'Samedi 14 novembre'],
  ['Table', 'Carré VIP · Table 12'],
  ['Groupe', '6 personnes'],
  ['Répartition', '3 femmes · 3 hommes'],
  ['Minimum', '1 200 € · démo'],
  ['Contact', 'Inès · 06 •• •• •• 47'],
];

const Check: React.FC<{draw: number}> = ({draw}) => (
  <svg width="34" height="34" viewBox="0 0 34 34">
    <circle cx="17" cy="17" r="15" fill="none" stroke={PALETTE.ink} strokeWidth="2" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
    <path
      d="M10 17.5 L15 22.5 L24.5 12"
      fill="none"
      stroke={PALETTE.ink}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - interpolate(draw, [0.4, 1], [0, 1], CLAMP)}
    />
  </svg>
);

const Notification: React.FC<{q: number}> = ({q}) => {
  const drop = spring({frame: q - 2, fps: FPS, config: {damping: 18, stiffness: 140}, durationInFrames: 20});
  const away = interpolate(q, [24, 32], [0, 1], {...CLAMP, easing: IN_OUT});
  if (q > 32) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 560,
        left: 80,
        right: 80,
        transform: `translateY(${((1 - drop) * -260 + away * 40).toFixed(1)}px)`,
        opacity: Math.min(drop * 1.4, 1 - away),
        background: '#ffffff',
        borderRadius: 30,
        padding: '24px 28px',
        display: 'flex',
        gap: 22,
        alignItems: 'center',
        boxShadow: '0 24px 60px rgba(20,19,26,0.18)',
        fontFamily: ARCHIVO,
      }}
    >
      <div style={{width: 64, height: 64, borderRadius: 16, background: PALETTE.ink, color: PALETTE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 30}}>
        V
      </div>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 600, letterSpacing: '0.16em', color: PALETTE.inkSoft}}>
          <span>WHATSAPP · E-MAIL</span>
          <span>MAINTENANT</span>
        </div>
        <div style={{fontSize: 27, fontWeight: 700, color: PALETTE.ink, marginTop: 6}}>Nouvelle demande · Table 12</div>
        <div style={{fontSize: 22, color: PALETTE.inkSoft, marginTop: 2}}>Samedi 14 nov. · 6 personnes</div>
      </div>
    </div>
  );
};

export const Request: React.FC<{f: number}> = ({f}) => {
  const q = f - CUTS.club;
  const open = spring({frame: q - 26, fps: FPS, config: {damping: 200}, durationInFrames: 20});
  const r = f - CUTS.decision;
  const buttons = spring({frame: r, fps: FPS, config: {damping: 200}, durationInFrames: 16});
  // Plan 7 : on se resserre sur la décision.
  const zoom = interpolate(r, [4, 70], [1, 1.1], {...CLAMP, easing: IN_OUT});

  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 1400px', fontFamily: ARCHIVO}}>
      <Notification q={q} />
      {q >= 26 && (
        <div
          style={{
            position: 'absolute',
            top: 560,
            left: 80,
            right: 80,
            background: '#ffffff',
            border: `2px solid ${PALETTE.ink}`,
            borderRadius: 30,
            padding: '34px 40px 22px',
            // Plan 7 : la demande passe au second plan, la décision au premier.
            opacity: Math.min(1, open * 1.5) * (1 - 0.4 * interpolate(r, [4, 30], [0, 1], CLAMP)),
            transform: `translateY(${((1 - open) * 30).toFixed(1)}px)`,
            boxShadow: '0 30px 80px rgba(20,19,26,0.14)',
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontSize: 18, fontWeight: 600, letterSpacing: '0.2em', color: PALETTE.inkSoft}}>NOUVELLE DEMANDE</div>
            <div style={{fontSize: 15, fontWeight: 600, letterSpacing: '0.18em', color: PALETTE.inkSoft, border: `1.5px solid ${PALETTE.inkSoft}`, borderRadius: 99, padding: '3px 10px 3px 13px'}}>
              LUMEN CLUB · DÉMO
            </div>
          </div>
          <div style={{fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em', color: PALETTE.ink, marginTop: 10}}>Inès, pour 6 personnes</div>
          <div style={{marginTop: 18}}>
            {LINES.map(([k, v], i) => {
              const at = 34 + i * 9;
              const show = interpolate(q, [at, at + 8], [0, 1], {...CLAMP, easing: OUT});
              const draw = interpolate(q, [at + 3, at + 14], [0, 1], {...CLAMP, easing: OUT});
              return (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '17px 0',
                    borderTop: `1px solid rgba(20,19,26,0.14)`,
                    opacity: show,
                  }}
                >
                  <Check draw={draw} />
                  <span style={{fontSize: 23, color: PALETTE.inkSoft, width: 170}}>{k}</span>
                  <span style={{fontSize: 26, fontWeight: 600, color: PALETTE.ink}}>{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {r >= 0 && (
        <div
          style={{
            position: 'absolute',
            top: 1290,
            left: 80,
            right: 80,
            display: 'flex',
            gap: 20,
            opacity: buttons,
            transform: `translateY(${((1 - buttons) * 24).toFixed(1)}px)`,
          }}
        >
          <div style={{flex: 1, height: 92, borderRadius: 20, background: PALETTE.ink, color: PALETTE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 27, fontWeight: 700}}>
            Confirmer
          </div>
          <div style={{flex: 1.35, height: 92, borderRadius: 20, border: `2px solid ${PALETTE.ink}`, color: PALETTE.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, fontWeight: 600}}>
            Proposer une autre table
          </div>
        </div>
      )}
    </div>
  );
};
