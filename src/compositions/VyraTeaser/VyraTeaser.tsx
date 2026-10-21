// VYRA « La Porte » v2 — teaser de lancement, 30 s, 1080×1920 (voir STORYBOARD.md).
// L'entrée au château : plans rendus dans Blender (blender/vyra-teaser/chateau.py), son mixé par
// scripts/vyra-teaser/mix.py, montage calé sur la musique (edit.ts). Retenue premium : pas de gadgets,
// la caméra, la lumière et la typo font le travail. Déterministe : tout dépend de la frame.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {DROP, FINAL, IMPACTS, INTRO_BEATS, Shot, bass, decay, peak, shotAt} from './edit';
import {GoldDust, GoldText, Grain, Vignette} from './fx';
import {BODONI, JOST, PALETTE} from './theme';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** 0 → 1 entre a et b, 1 → 0 entre c et d. */
const window4 = (f: number, a: number, b: number, c: number, d: number) =>
  interpolate(f, [a, b, c, d], [0, 1, 1, 0], CLAMP);

// ———————————————————————————————————————— Plans

const castle = (shot: Shot, f: number) => staticFile(`vyra-teaser/chateau/${shot}/${String(f).padStart(4, '0')}.jpg`);
const IGNITE = [0, 0, 0, 0.55, 0.08, 0.85, 0.25, 1]; // la fente s'allume comme un néon

/** Le plan du moment, avec un léger coup de zoom sur les coupes franches. */
const Plate: React.FC<{f: number}> = ({f}) => {
  const shot = shotAt(f);
  const still = shot === 'seuil' || shot === 'signature';
  let scale = 1 + 0.03 * peak(f, IMPACTS, 6);
  let opacity = 1;
  let glow = f < DROP ? 1 + 0.16 * peak(f, INTRO_BEATS, 5) : 1; // la basse derrière la porte
  if (shot === 'seuil') {
    scale *= interpolate(f, [0, 60], [1.08, 1], {...CLAMP, easing: OUT});
    opacity = f < IGNITE.length ? IGNITE[f] : 1;
  }
  if (shot === 'signature') {
    scale *= interpolate(f, [FINAL, 900], [1, 1.05], CLAMP);
    opacity = interpolate(f, [882, 899], [1, 0], CLAMP); // retour au noir : la boucle repart sur la porte
    glow = 1 + 0.25 * decay(f, FINAL, 12);
  }
  return (
    <AbsoluteFill style={{transform: `scale(${scale.toFixed(4)})`}}>
      <Img
        src={still ? staticFile('vyra-teaser/seam_close.png') : castle(shot, f)}
        style={{width: '100%', height: '100%', objectFit: 'cover', opacity, filter: glow !== 1 ? `brightness(${glow.toFixed(3)})` : undefined}}
      />
    </AbsoluteFill>
  );
};

// ———————————————————————————————————————— Lumière

/** Colonne de lumière qui tombe sur la table d'honneur et respire avec la basse. */
const LightColumn: React.FC<{strength: number}> = ({strength}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 24% 70% at 50% -8%, rgba(246,223,166,${strength.toFixed(3)}), rgba(232,194,122,${(strength * 0.3).toFixed(3)}) 45%, transparent 74%)`,
      mixBlendMode: 'screen',
      pointerEvents: 'none',
    }}
  />
);

/** Blanc dans la porte, une frame de noir (le silence), l'impact du drop, la montée et l'impact final. */
const Flashes: React.FC<{f: number}> = ({f}) => {
  const whiteout = f < 240 ? interpolate(f, [222, 239], [0, 1], {...CLAMP, easing: Easing.in(Easing.quad)}) : 0;
  const hit = 0.85 * decay(f, DROP, 6) + 0.9 * decay(f, FINAL, 10);
  const build = f < FINAL ? interpolate(f, [705, 720], [0, 0.5], {...CLAMP, easing: Easing.in(Easing.quad)}) : 0;
  return (
    <>
      <AbsoluteFill style={{backgroundColor: '#fff6e6', opacity: Math.min(1, Math.max(whiteout, hit, build))}} />
      {f === 240 && <AbsoluteFill style={{backgroundColor: '#000'}} />}
    </>
  );
};

// ———————————————————————————————————————— Typo

const spaced = (size: number, tracking: number, weight = 300): React.CSSProperties => ({
  fontFamily: JOST,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: `${tracking}em`,
  marginRight: `-${tracking}em`, // l'espacement final ne décentre pas la ligne
});

/** Voile sombre et diffus derrière une ligne, pour qu'elle reste lisible sur la lumière. */
const Backdrop: React.FC<{top: number; height: number; opacity: number; width?: number}> = ({top, height, opacity, width = 52}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top,
      height,
      opacity,
      background: `radial-gradient(ellipse ${width}% 50% at 50% 50%, rgba(3,2,4,0.85) 0%, rgba(3,2,4,0.55) 45%, transparent 80%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Capitales Jost très espacées, qui apparaissent lettre à lettre. */
const Spaced: React.FC<{f: number; from: number; to: number; text: string; size?: number; style?: React.CSSProperties}> = ({
  f,
  from,
  to,
  text,
  size = 38,
  style,
}) => (
  <div style={{...spaced(size, 0.46), color: PALETTE.ink, display: 'flex', justifyContent: 'center', ...style}}>
    {[...text].map((ch, i) => (
      <span key={i} style={{opacity: 0.88 * window4(f, from + i * 1.5, from + i * 1.5 + 10, to - 8, to), whiteSpace: 'pre'}}>
        {ch}
      </span>
    ))}
  </div>
);

/** Une ligne qui monte en sortant du flou. */
const Rise: React.FC<{f: number; from: number; to: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  f,
  from,
  to,
  children,
  style,
}) => {
  const p = interpolate(f, [from, from + 18], [0, 1], {...CLAMP, easing: OUT});
  return (
    <div
      style={{
        opacity: window4(f, from, from + 14, to - 10, to),
        transform: `translateY(${((1 - p) * 26).toFixed(1)}px)`,
        filter: `blur(${((1 - p) * 10).toFixed(2)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Une ligne qui sort de sa ligne de base, derrière un masque, sur le temps. */
const Unveil: React.FC<{f: number; from: number; to: number; height: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  f,
  from,
  to,
  height,
  children,
  style,
}) => {
  const p = interpolate(f, [from, from + 16], [0, 1], {...CLAMP, easing: OUT});
  return (
    <div style={{height, overflow: 'hidden', opacity: interpolate(f, [to - 10, to], [1, 0], CLAMP), ...style}}>
      <div style={{transform: `translateY(${((1 - p) * height).toFixed(1)}px)`, filter: `blur(${((1 - p) * 6).toFixed(2)}px)`}}>
        {children}
      </div>
    </div>
  );
};

/** VYRA : l'espacement se resserre en sortant du flou, puis un reflet balaie la feuille d'or. */
const Wordmark: React.FC<{f: number}> = ({f}) => {
  const p = interpolate(f, [FINAL, FINAL + 40], [0, 1], {...CLAMP, easing: OUT});
  const sweep = interpolate(f, [FINAL + 22, FINAL + 70], [-25, 125], CLAMP);
  const base: React.CSSProperties = {...spaced(190, 1.1 - 0.6 * p), display: 'block'};
  return (
    <div
      style={{
        position: 'relative',
        opacity: interpolate(f, [FINAL, FINAL + 14, 868, 884], [0, 1, 1, 0], CLAMP),
        filter: `blur(${((1 - p) * 16).toFixed(2)}px)`,
      }}
    >
      <GoldText glow={0.55} style={base}>
        VYRA
      </GoldText>
      <span
        style={{
          ...base,
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundImage: `linear-gradient(105deg, transparent ${sweep - 10}%, rgba(255,251,240,0.95) ${sweep}%, transparent ${sweep + 10}%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        VYRA
      </span>
    </div>
  );
};

// ———————————————————————————————————————— Composition

export const VyraTeaser: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const inDrop = f >= DROP && f < 481;
  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.night}}>
      <Audio src={staticFile('vyra-teaser/audio/mix.wav')} />

      <Plate f={f} />

      {/* Braises d'or qui montent devant le château, avant l'ouverture */}
      {f < 222 && <GoldDust seed="braises" count={30} x={540} spread={760} top={420} bottom={1600} frame={f} speed={-0.9} opacity={0.75} />}

      {/* Le carré : colonne de lumière, quelques poussières d'or qui descendent dedans */}
      {shot === 'carre' && (
        <>
          <LightColumn strength={0.2 + 0.08 * bass(f)} />
          <GoldDust seed="carre" count={34} x={540} spread={520} top={-40} bottom={1500} frame={f} speed={1.1} opacity={0.8} />
        </>
      )}

      {/* La signature : la fente s'éteint sous le logo */}
      {shot === 'signature' && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 420,
              width: 240,
              top: 840,
              height: 1080,
              background: `linear-gradient(180deg, rgba(6,4,8,0) 0%, ${PALETTE.night} 16%, ${PALETTE.night} 100%)`,
              filter: 'blur(8px)',
            }}
          />
          <AbsoluteFill
            style={{
              background: 'radial-gradient(ellipse 30% 52% at 50% 45%, rgba(232,194,122,0.14), transparent 70%)',
              opacity: interpolate(f, [866, 899], [1, 0], CLAMP),
            }}
          />
          <GoldDust seed="signature" count={26} x={540} spread={700} top={-40} bottom={1500} frame={f} speed={0.8} opacity={interpolate(f, [FINAL, FINAL + 20, 866, 890], [0, 0.8, 0.8, 0], CLAMP)} />
        </>
      )}

      {/* Lisibilité : le haut du cadre s'assombrit doucement pendant le drop */}
      {inDrop && (
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, rgba(3,2,4,0.78) 0%, rgba(3,2,4,0.5) 26%, transparent 48%)',
            opacity: window4(f, DROP + 2, DROP + 12, 470, 480),
          }}
        />
      )}

      {/* Accroche */}
      {f < 181 && <Backdrop top={230} height={400} opacity={window4(f, 2, 14, 168, 178)} />}
      {shot === 'carre' && <Backdrop top={300} height={300} width={78} opacity={window4(f, 492, 504, 645, 657)} />}
      {f < 181 && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
          <Spaced f={f} from={8} to={176} text="CERTAINES PORTES" />
          <Rise f={f} from={64} to={176} style={{marginTop: 14}}>
            <GoldText style={{fontFamily: BODONI, fontStyle: 'italic', fontWeight: 400, fontSize: 108, lineHeight: 1.2}}>
              ne s’ouvrent pas
            </GoldText>
          </Rise>
          <Spaced f={f} from={112} to={176} text="POUR TOUT LE MONDE." style={{marginTop: 18}} />
        </AbsoluteFill>
      )}
      {f >= 181 && f < 240 && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 330}}>
          <Rise f={f} from={186} to={224}>
            <div
              style={{
                fontFamily: BODONI,
                fontStyle: 'italic',
                fontSize: 72,
                color: PALETTE.ink,
                textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 0 38px rgba(0,0,0,0.65)', // épouse les lettres, sans tache
              }}
            >
              Ce soir, elles s’ouvrent pour vous.
            </div>
          </Rise>
        </AbsoluteFill>
      )}

      {/* Le drop : une phrase en trois temps, une ligne par mesure */}
      {inDrop && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 290}}>
          <Unveil f={f} from={DROP + 3} to={478} height={90}>
            <div style={{...spaced(62, 0.34), color: PALETTE.ink}}>VOTRE SOIRÉE</div>
          </Unveil>
          <Unveil f={f} from={303} to={478} height={90} style={{marginTop: 6}}>
            <div style={{...spaced(62, 0.34), color: PALETTE.ink}}>COMMENCE</div>
          </Unveil>
          <Unveil f={f} from={363} to={478} height={150} style={{marginTop: 10}}>
            <GoldText glow={0.45} style={{fontFamily: BODONI, fontStyle: 'italic', fontWeight: 400, fontSize: 120, lineHeight: 1.2}}>
              avant la porte.
            </GoldText>
          </Unveil>
        </AbsoluteFill>
      )}

      {/* Le carré */}
      {shot === 'carre' && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 330}}>
          <Rise f={f} from={496} to={655}>
            <GoldText style={{fontFamily: BODONI, fontStyle: 'italic', fontWeight: 400, fontSize: 94, lineHeight: 1.2}}>
              Choisissez votre table.
            </GoldText>
          </Rise>
          <Spaced f={f} from={571} to={655} text="AVANT TOUT LE MONDE." style={{marginTop: 26}} />
        </AbsoluteFill>
      )}

      {/* Signature */}
      {f >= FINAL && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 160}}>
          <Wordmark f={f} />
          <Rise f={f} from={768} to={884} style={{marginTop: 64}}>
            <div style={{fontFamily: BODONI, fontStyle: 'italic', fontSize: 68, color: PALETTE.ink, opacity: 0.92}}>Bientôt.</div>
          </Rise>
          <div style={{...spaced(30, 0.22, 400), color: PALETTE.gold, marginTop: 30, opacity: 0.8 * window4(f, 792, 808, 870, 884)}}>
            @vyra.party
          </div>
        </AbsoluteFill>
      )}

      <Flashes f={f} />
      <Vignette strength={0.55} />
      <Grain opacity={0.08} seed={(f % 24) + 1} />
    </AbsoluteFill>
  );
};
