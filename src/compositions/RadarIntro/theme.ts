import {loadFont as loadNewsreader} from '@remotion/google-fonts/Newsreader';
import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';

// Load both styles for Newsreader (normal + italic at weight 300)
const _nr = loadNewsreader('normal', {weights: ['300', '400']});
loadNewsreader('italic', {weights: ['300', '400']});
export const NEWSREADER = _nr.fontFamily;

const _jb = loadJetBrainsMono('normal', {weights: ['400']});
export const JETBRAINS = _jb.fontFamily;

// Design tokens
export const C = {
  ink:    '#0b0b0b',
  ink2:   '#2b2b2b',
  paper:  '#ffffff',
  paper2: '#f6f5f2',
  wash:   '#efeee9',
  muted:  '#7c7c78',
  faint:  '#b6b5b0',
  line:   '#e7e5e0',
  line2:  '#d8d6d0',
} as const;
