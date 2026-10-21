// VYRA « La Porte » — image de fil 4:5 (1080×1350) : les portes du château et l'accroche du teaser.
// Fond rendu par blender/vyra-teaser/chateau.py (--shot feed --uplights 6000). La grille du profil recadre en 3:4 :
// ~34 px de chaque côté, donc rien d'important près des bords latéraux.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {GoldText, Grain, Vignette} from './fx';
import {BODONI, JOST, PALETTE} from './theme';

const spaced = (size: number, tracking: number, weight = 300): React.CSSProperties => ({
  fontFamily: JOST,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: `${tracking}em`,
  marginRight: `-${tracking}em`, // l'espacement final ne décentre pas la ligne
});

export const VyraFeedPost: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETTE.night}}>
    <Img src={staticFile('vyra-teaser/feed_doors.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(3,2,4,0.7) 0%, rgba(3,2,4,0.35) 17%, transparent 28%)'}} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 58}}>
      <div style={{...spaced(34, 0.46), color: PALETTE.ink, opacity: 0.9}}>CERTAINES PORTES</div>
      <GoldText style={{fontFamily: BODONI, fontStyle: 'italic', fontWeight: 400, fontSize: 100, lineHeight: 1.18, marginTop: 8}}>
        ne s’ouvrent pas
      </GoldText>
      <div style={{...spaced(34, 0.46), color: PALETTE.ink, opacity: 0.9, marginTop: 12}}>POUR TOUT LE MONDE.</div>
    </AbsoluteFill>
    <Vignette strength={0.45} />
    <Grain opacity={0.06} seed={5} />
  </AbsoluteFill>
);
