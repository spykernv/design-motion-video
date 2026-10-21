// VYRA « La Porte » — palette et typo (voir STORYBOARD.md).
// Noir ~85 % du cadre, or = le luxe, rouge sang en lumière seulement = le sauvage.
import {loadFont as loadJost} from '@remotion/google-fonts/Jost';
import {loadFont as loadBodoni} from '@remotion/google-fonts/BodoniModa';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

export const PALETTE = {
  night: '#060408',
  ink: '#f5f4f7',
  gold: '#e8c27a',
  goldHi: '#f6dfa6',
  goldLo: '#c9984a',
  goldDeep: '#8a5a1c',
  blood: '#b0001e',
};

// Feuille d'or : reflet clair en haut, cœur or, ombre cuivrée, rebond clair en bas.
export const GOLD_FOIL = `linear-gradient(176deg, ${PALETTE.goldHi} 0%, ${PALETTE.gold} 38%, ${PALETTE.goldLo} 64%, #f1dcb0 100%)`;

// Zone sûre Reels : rien d'important au-dessus de 260 px ni sous 1500 px, marge droite 140 px.
export const SAFE = {top: 260, bottom: 1500, right: 140};

export const {fontFamily: JOST} = loadJost('normal', {weights: ['300', '400', '500'], subsets: ['latin']});
export const {fontFamily: BODONI} = loadBodoni('italic', {weights: ['400', '500'], subsets: ['latin']});
