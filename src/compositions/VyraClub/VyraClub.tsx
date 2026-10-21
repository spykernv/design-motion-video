// VYRA « Chaque table a une vue » — vidéo pro pour les boîtes de nuit, 30 s, 1080×1920, sans musique
// (voir STORYBOARD.md). Phrase-test : « Mes clients voient leur table avant de la demander ; la demande
// m'arrive complète, et c'est moi qui décide. » Lieu fictif Lumen Club, étiqueté « démo » de bout en bout.
// Déterministe : tout dépend de la frame.
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame} from 'remotion';
import {Phone} from './Phone';
import {Plan} from './Plan';
import {Request} from './Request';
import {Room} from './Room';
import {Signature} from './Signature';
import {ARCHIVO, CLAMP, CUTS, FPS, OUT, PALETTE, mix} from './theme';
import {Caption, DemoTag, RoomLabels} from './ui';

// ———————————————————————————————————————— Plan 2 : la table demandée à l'aveugle

const QUESTIONS = ['C’est où, la table ?', 'On verra la scène ?', 'C’est combien ?', 'Il reste quoi samedi ?'];

const Blind: React.FC<{f: number}> = ({f}) => {
  const b = f - CUTS.aveugle;
  const pdf = spring({frame: b - 4, fps: FPS, config: {damping: 200}, durationInFrames: 20});
  return (
    <AbsoluteFill style={{fontFamily: ARCHIVO}}>
      {/* La grille de prix en PDF, illisible. */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 560,
          width: 470,
          height: 600,
          background: '#ffffff',
          boxShadow: '0 30px 70px rgba(20,19,26,0.16)',
          transform: `rotate(${-7 + (1 - pdf) * -6}deg) translateY(${(1 - pdf) * 120}px)`,
          opacity: pdf,
          padding: 36,
          filter: 'blur(3.5px)',
        }}
      >
        <div style={{fontSize: 30, fontWeight: 800, color: PALETTE.ink}}>TARIFS TABLES</div>
        {Array.from({length: 11}, (_, i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginTop: 26}}>
            <div style={{height: 14, width: 150 + ((i * 53) % 120), background: '#bdb8ad'}} />
            <div style={{height: 14, width: 70, background: '#bdb8ad'}} />
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 110 + 470 - 96,
          top: 560 - 30,
          transform: `rotate(-7deg)`,
          background: '#c43b2f',
          color: '#fff',
          fontWeight: 800,
          fontSize: 22,
          padding: '8px 14px',
          opacity: pdf,
          filter: 'blur(1px)',
        }}
      >
        PDF
      </div>
      {/* Les questions qui s'empilent. */}
      {QUESTIONS.map((text, i) => {
        const at = 14 + i * 16;
        const s = spring({frame: b - at, fps: FPS, config: {damping: 16, stiffness: 160}, durationInFrames: 16});
        if (b < at) return null;
        return (
          <div
            key={text}
            style={{
              position: 'absolute',
              right: 90,
              top: 880 + i * 136,
              transform: `scale(${0.85 + 0.15 * s})`,
              transformOrigin: 'right bottom',
              opacity: Math.min(1, s * 1.6),
              background: PALETTE.ink,
              color: PALETTE.paper,
              borderRadius: '34px 34px 8px 34px',
              padding: '24px 34px',
              fontSize: 36,
              fontWeight: 600,
              boxShadow: '0 16px 40px rgba(20,19,26,0.18)',
            }}
          >
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ———————————————————————————————————————— Montage

export const VyraClub: React.FC = () => {
  const f = useCurrentFrame();
  const inRoom = f >= CUTS.visite && f < CUTS.club;
  const n = inRoom ? interpolate(f, [CUTS.nuit, CUTS.nuit + 7], [0, 1], {...CLAMP, easing: OUT}) : 0;
  const ink = mix(PALETTE.ink, PALETTE.paper, n);
  const blur = interpolate(f, [CUTS.aveugle, CUTS.aveugle + 14], [0, 7], CLAMP);

  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.paper}}>
      {/* Plans 1–2 : le plan se trace, puis se brouille. */}
      {f < CUTS.visite && (
        <AbsoluteFill style={{filter: f >= CUTS.aveugle ? `blur(${blur}px)` : undefined, opacity: f >= CUTS.aveugle ? 1 - blur / 12 : 1}}>
          <Plan f={f} />
        </AbsoluteFill>
      )}
      {f >= CUTS.aveugle && f < CUTS.visite && <Blind f={f} />}

      {/* Plans 3–5 : la visite 3D, la vue depuis la table, le mode nuit. */}
      <Sequence from={CUTS.visite} durationInFrames={CUTS.club - CUTS.visite} layout="none">
        <Room f={f} />
      </Sequence>
      {/* Bandeau haut fondu dans le décor : l'étiquette « démo » et les phrases restent lisibles sur la 3D. */}
      {inRoom && (
        <AbsoluteFill
          style={{
            backgroundColor: mix(PALETTE.paper, PALETTE.night, n),
            maskImage: 'linear-gradient(180deg, black 0%, black 22%, transparent 34%)',
            WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 22%, transparent 34%)',
            opacity: 0.88,
          }}
        />
      )}
      {inRoom && f < CUTS.vue + 40 && <RoomLabels f={f} />}

      {/* Plan 5 : le téléphone, sur la vue de nuit assombrie. */}
      {f >= CUTS.demande && f < CUTS.club && (
        <>
          <AbsoluteFill
            style={{
              background: 'linear-gradient(180deg, rgba(7,6,12,0.55) 0%, rgba(7,6,12,0.25) 40%, rgba(7,6,12,0.8) 100%)',
              opacity: interpolate(f, [CUTS.demande, CUTS.demande + 12], [0, 1], CLAMP),
            }}
          />
          <Phone f={f} start={CUTS.demande} />
        </>
      )}

      {/* Plans 6–7 : le contrechamp côté club, puis la décision. */}
      {f >= CUTS.club && f < CUTS.signature && <Request f={f} />}

      {/* Plan 8 : la signature, sur le plan en filigrane. */}
      {f >= CUTS.signature && (
        <>
          <AbsoluteFill style={{opacity: 0.07}}>
            <Plan f={f} drawn />
          </AbsoluteFill>
          <Signature f={f} />
        </>
      )}

      <Caption f={f} from={18} to={CUTS.aveugle} text="Chaque table a une vue." color={PALETTE.ink} size={68} />
      <Caption f={f} from={CUTS.aveugle + 6} to={CUTS.visite} text="Aujourd’hui, une table se demande à l’aveugle." color={PALETTE.ink} />
      <Caption f={f} from={CUTS.visite + 12} to={CUTS.vue - 2} text="Vos clients visitent votre club." color={PALETTE.ink} />
      <Caption f={f} from={CUTS.vue + 6} to={CUTS.nuit + 20} text="Ils voient leur table." color={ink} />
      <Caption f={f} from={CUTS.nuit + 22} to={CUTS.demande - 2} text="Avant de la demander." color={PALETTE.paper} />
      <Caption f={f} from={CUTS.demande + 4} to={CUTS.demande + 60} text="Ils choisissent." color={PALETTE.paper} />
      <Caption f={f} from={CUTS.demande + 64} to={CUTS.club - 2} text="Ils demandent." color={PALETTE.paper} />
      <Caption f={f} from={CUTS.club + 4} to={CUTS.decision} text="La demande arrive complète." color={PALETTE.ink} />
      <Caption f={f} from={CUTS.decision + 4} to={CUTS.signature - 2} text="C’est vous qui décidez." color={PALETTE.ink} />

      <DemoTag color={ink} />
    </AbsoluteFill>
  );
};
