// Le téléphone du client : la fiche de la table 12, puis le formulaire court et l'envoi de la demande.
// Boîtier générique (aucun modèle de marque). Vocabulaire : « choisir », « demander », jamais « réserver ».
import React from 'react';
import {interpolate, spring} from 'remotion';
import {ARCHIVO, CLAMP, FPS, OUT, PALETTE} from './theme';

const W = 560;
const H = 1110;
const SCREEN_W = W - 28;

const label: React.CSSProperties = {fontSize: 15, fontWeight: 600, letterSpacing: '0.2em', color: '#9a93b4'};

const Row: React.FC<{k: string; v: string; show: number}> = ({k, v, show}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '15px 0',
      borderBottom: '1px solid rgba(199,184,255,0.16)',
      opacity: show,
      transform: `translateY(${(1 - show) * 14}px)`,
    }}
  >
    <span style={{fontSize: 21, color: '#a49dbd'}}>{k}</span>
    <span style={{fontSize: 23, fontWeight: 600, color: '#f1eeff', textAlign: 'right'}}>{v}</span>
  </div>
);

/** Vue depuis la table, en vignette : la scène, le DJ, l'écran LUMEN et les faisceaux. */
const ViewThumb: React.FC = () => (
  <svg width={SCREEN_W} height={330} viewBox="0 0 532 330">
    <defs>
      <linearGradient id="vc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0d0a18" />
        <stop offset="1" stopColor="#1d1540" />
      </linearGradient>
      <linearGradient id="vc-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c7b8ff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#8b6cff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="532" height="330" fill="url(#vc-sky)" />
    {[90, 190, 300, 410].map((x, i) => (
      <path key={x} d={`M${x},40 L${x - 70 + i * 30},330 L${x + 10 + i * 30},330 Z`} fill="url(#vc-beam)" />
    ))}
    <rect x="110" y="70" width="320" height="110" fill="#2c1f6e" stroke="#8b6cff" strokeWidth="2" />
    <text x="270" y="138" textAnchor="middle" fontFamily={ARCHIVO} fontWeight={800} fontSize="54" letterSpacing="10" fill="#efeaff">
      LUMEN
    </text>
    <rect x="70" y="200" width="400" height="34" fill="#151022" stroke="#8b6cff" strokeOpacity="0.5" />
    <rect x="232" y="176" width="68" height="32" fill="#09070f" />
    <circle cx="266" cy="166" r="11" fill="#09070f" />
    <path d="M0,330 L130,250 L400,250 L532,330 Z" fill="#120e20" />
    <ellipse cx="420" cy="320" rx="120" ry="34" fill="#221c33" stroke="#8b6cff" strokeOpacity="0.6" />
  </svg>
);

const Button: React.FC<{text: string; press: number; done?: boolean}> = ({text, press, done}) => (
  <div
    style={{
      marginTop: 26,
      height: 84,
      borderRadius: 18,
      background: done ? '#1d1838' : PALETTE.lumen,
      color: done ? PALETTE.lumenHi : '#0b0814',
      border: done ? `2px solid ${PALETTE.lumen}` : undefined,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: '0.02em',
      transform: `scale(${1 - 0.04 * press})`,
    }}
  >
    {done && (
      <svg width="26" height="26" viewBox="0 0 26 26">
        <path d="M4 13.5 L10.5 20 L22 6" stroke={PALETTE.lumenHi} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
    {text}
  </div>
);

/** Le doigt : un cercle qui se pose et s'élargit (pas de main dessinée). */
const Touch: React.FC<{p: number; at: number; x: number; y: number}> = ({p, at, x, y}) => {
  const t = p - at;
  if (t < -6 || t > 16) return null;
  const down = interpolate(t, [-6, 0], [0, 1], CLAMP);
  const ring = interpolate(t, [0, 16], [0, 1], {...CLAMP, easing: OUT});
  return (
    <>
      <div style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 999, background: 'rgba(255,255,255,0.55)', opacity: down * (1 - ring)}} />
      <div
        style={{
          position: 'absolute',
          left: x - 34,
          top: y - 34,
          width: 68,
          height: 68,
          borderRadius: 999,
          border: '3px solid rgba(255,255,255,0.8)',
          transform: `scale(${1 + ring * 1.4})`,
          opacity: (1 - ring) * (t >= 0 ? 1 : 0),
        }}
      />
    </>
  );
};

export const Phone: React.FC<{f: number; start: number}> = ({f, start}) => {
  const p = f - start;
  const rise = spring({frame: p, fps: FPS, config: {damping: 200}, durationInFrames: 22});
  const at = (a: number) => interpolate(p, [a, a + 9], [0, 1], {...CLAMP, easing: OUT});

  // Fiche (p 0–62), puis formulaire (glisse depuis la droite).
  const toForm = interpolate(p, [60, 72], [0, 1], {...CLAMP, easing: OUT});
  const sent = p >= 108;

  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - W) / 2,
        top: 470,
        width: W,
        height: H,
        transform: `translateY(${((1 - rise) * 1300).toFixed(1)}px)`,
        borderRadius: 74,
        background: '#050408',
        boxShadow: '0 50px 120px rgba(0,0,0,0.55), inset 0 0 0 2px #2a2733',
        padding: 14,
        fontFamily: ARCHIVO,
      }}
    >
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 60, overflow: 'hidden', background: '#0c0a14'}}>
        {/* Barre du club : la marque du club devant, VYRA en petit. */}
        <div style={{height: 120, padding: '58px 34px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize: 25, fontWeight: 800, letterSpacing: '0.14em', color: '#f1eeff'}}>
            LUMEN CLUB <span style={{fontSize: 14, fontWeight: 500, letterSpacing: '0.1em', color: '#8d86a6'}}>· avec VYRA</span>
          </div>
          <div style={{...label, fontSize: 13, border: '1px solid #5b5475', borderRadius: 99, padding: '3px 10px 3px 12px'}}>DÉMO</div>
        </div>

        <div style={{position: 'absolute', top: 120, left: 0, width: SCREEN_W, transform: `translateX(${-toForm * SCREEN_W}px)`}}>
          <ViewThumb />
          <div style={{padding: '24px 34px 0'}}>
            <div style={{...label, opacity: at(8)}}>CARRÉ VIP · VUE SUR LA SCÈNE</div>
            <div style={{fontSize: 50, fontWeight: 800, color: '#f6f3ff', letterSpacing: '-0.02em', marginTop: 8, opacity: at(10)}}>Table 12</div>
            <div style={{marginTop: 12}}>
              <Row k="Personnes" v="6 à 8" show={at(16)} />
              <Row k="Inclus" v="2 bouteilles · softs" show={at(21)} />
              <Row k="Minimum" v="1 200 € · démo" show={at(26)} />
            </div>
            <div style={{opacity: at(30)}}>
              <Button text="Choisir cette table" press={interpolate(p, [50, 54, 58], [0, 1, 0], CLAMP)} />
            </div>
          </div>
        </div>

        <div style={{position: 'absolute', top: 120, left: 0, width: SCREEN_W, transform: `translateX(${(1 - toForm) * SCREEN_W}px)`}}>
          <div style={{padding: '36px 34px 0'}}>
            <div style={label}>VOTRE DEMANDE</div>
            <div style={{fontSize: 44, fontWeight: 800, color: '#f6f3ff', letterSpacing: '-0.02em', marginTop: 8}}>Carré VIP · Table 12</div>
            <div style={{marginTop: 22}}>
              <Row k="Date" v="Samedi 14 novembre" show={at(74)} />
              <Row k="Groupe" v="6 personnes" show={at(80)} />
              <Row k="Répartition" v="3 femmes · 3 hommes" show={at(86)} />
              <Row k="Prénom" v="Inès" show={at(92)} />
            </div>
            <div style={{opacity: at(96)}}>
              <Button
                text={sent ? 'Demande envoyée au club' : 'Demander cette table'}
                press={interpolate(p, [102, 105, 108], [0, 1, 0], CLAMP)}
                done={sent}
              />
            </div>
            <div style={{marginTop: 18, fontSize: 19, color: '#8d86a6', textAlign: 'center', opacity: interpolate(p, [110, 116], [0, 1], CLAMP)}}>
              Le club vous répond et confirme.
            </div>
          </div>
        </div>

        <Touch p={p} at={52} x={SCREEN_W / 2} y={855} />
        <Touch p={p} at={104} x={SCREEN_W / 2} y={602} />
      </div>
    </div>
  );
};
