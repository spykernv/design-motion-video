// VYRA « La Porte » — images de style, une par frame : f0 le seuil, f1 le drop, f2 la signature.
// Fonds rendus dans Blender (blender/vyra-teaser/), typo et effets ici.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ClawMarks, Fringe, GoldDust, GoldText, Grain, Vignette} from './fx';
import {BODONI, JOST, PALETTE} from './theme';

const Plate: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) => (
  <AbsoluteFill>
    <Img src={staticFile(`vyra-teaser/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', ...style}} />
  </AbsoluteFill>
);

const spaced = (size: number, tracking: number, weight = 300): React.CSSProperties => ({
  fontFamily: JOST,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: `${tracking}em`,
  marginRight: `-${tracking}em`, // l'espacement final ne décentre pas la ligne
});

// f0 — Le seuil : le monolithe, la fente d'or, l'accroche.
const Seuil: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETTE.night}}>
    <Plate src="monolith.png" />
    <GoldDust seed="seuil" count={46} x={540} spread={520} top={560} bottom={1480} />
    <Vignette strength={0.55} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      <div style={{...spaced(38, 0.46), color: PALETTE.ink, opacity: 0.86}}>CERTAINES PORTES</div>
      <GoldText style={{fontFamily: BODONI, fontStyle: 'italic', fontWeight: 400, fontSize: 108, lineHeight: 1.2, marginTop: 14}}>
        ne s’ouvrent pas
      </GoldText>
      <div style={{...spaced(38, 0.46), color: PALETTE.ink, opacity: 0.86, marginTop: 18}}>POUR TOUT LE MONDE.</div>
    </AbsoluteFill>
    <Grain opacity={0.08} seed={3} />
  </AbsoluteFill>
);

// f1 — Le drop : la bête de ferrofluide, les griffures d'or, un mot-choc.
const Drop: React.FC = () => {
  const word: React.CSSProperties = {fontFamily: BODONI, fontStyle: 'italic', fontWeight: 500, fontSize: 300, lineHeight: 1};
  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.night}}>
      <Plate src="ferro_black.png" style={{filter: 'sepia(0.32) saturate(1.5) hue-rotate(-6deg) contrast(1.1) brightness(1.05)'}} />
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 90% 70% at 88% 62%, rgba(176,0,30,0.3), transparent 62%)', mixBlendMode: 'screen'}}
      />
      <ClawMarks from={[1010, 600]} to={[230, 1340]} gap={80} width={24} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 330}}>
        <div style={{position: 'relative', transform: 'rotate(-5deg)'}}>
          <Fringe offset={9} style={word}>
            FEU.
          </Fringe>
          <GoldText glow={0.5} style={{...word, position: 'relative'}}>
            FEU.
          </GoldText>
        </div>
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Grain opacity={0.1} seed={7} />
    </AbsoluteFill>
  );
};

// f2 — La signature : la fente en gros plan passe entre le Y et le R, pluie d'or.
const Signature: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETTE.night}}>
    <Plate src="seam_close.png" />
    {/* La fente s'éteint sous le logo : « Bientôt. » et le @ restent sur du noir */}
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
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 30% 52% at 50% 45%, rgba(232,194,122,0.14), transparent 70%)'}} />
    <GoldDust seed="pluie" count={70} x={540} spread={780} top={160} bottom={1560} streak={7} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 160}}>
      <GoldText glow={0.55} style={{...spaced(190, 0.5), display: 'block'}}>
        VYRA
      </GoldText>
      <div style={{fontFamily: BODONI, fontStyle: 'italic', fontSize: 68, color: PALETTE.ink, opacity: 0.92, marginTop: 64}}>
        Bientôt.
      </div>
      <div style={{...spaced(30, 0.22, 400), color: PALETTE.gold, opacity: 0.78, marginTop: 30}}>@vyra.party</div>
    </AbsoluteFill>
    <Vignette strength={0.6} />
    <Grain opacity={0.08} seed={11} />
  </AbsoluteFill>
);

const FRAMES = [Seuil, Drop, Signature];

export const VyraStyleFrames: React.FC = () => {
  const Frame = FRAMES[useCurrentFrame()] ?? Signature;
  return <Frame />;
};
