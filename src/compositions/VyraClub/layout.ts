// Le Lumen Club (démo) : une seule source pour le plan 2D et la salle 3D.
// Repère en mètres : x vers la droite, z vers le public (la scène est en z négatif), y vers le haut.
// Vue de dessus, 1 m = 50 px et le point (0, -1) tombe au centre de l'image : le plan 3D vu d'en haut
// recouvre exactement le plan SVG.
export const PX_PER_M = 50;
export const planX = (x: number) => 540 + x * PX_PER_M;
export const planY = (z: number) => 1010 + z * PX_PER_M;

export type Rect = {x0: number; x1: number; z0: number; z1: number};

export const ROOM: Rect = {x0: -8, x1: 8, z0: -10, z1: 10};
export const STAGE: Rect & {h: number} = {x0: -4, x1: 4, z0: -10, z1: -7.5, h: 0.8};
export const BOOTH: Rect & {h: number} = {x0: -1.2, x1: 1.2, z0: -9, z1: -8.2, h: 1.1};
export const FLOOR: Rect = {x0: -3.6, x1: 3.6, z0: -6.8, z1: -1.5};
export const VIP: Rect & {h: number} = {x0: 4.6, x1: 7.8, z0: -6.5, z1: -0.5, h: 0.45};
export const MEZZANINE: Rect & {h: number} = {x0: -8, x1: 8, z0: 5, z1: 10, h: 2.6};
export const BAR: Rect & {h: number} = {x0: -8, x1: -6.9, z0: -0.5, z1: 4, h: 1.1};
export const SCREEN = {x0: -5, x1: 5, y0: 1.6, y1: 5.2};

export const COLUMNS: [number, number][] = [
  [-4.2, 1],
  [4.2, 1],
  [-4.2, 4.6],
  [4.2, 4.6],
];

export type Table = {id: string; x: number; z: number; y: number; zone: 'vip' | 'piste' | 'mezz'};

export const TABLES: Table[] = [
  {id: '10', x: 6.4, z: -5.2, y: VIP.h, zone: 'vip'},
  {id: '11', x: 6.4, z: -3.5, y: VIP.h, zone: 'vip'},
  {id: '12', x: 6.4, z: -1.8, y: VIP.h, zone: 'vip'},
  {id: '20', x: -5.6, z: -5.5, y: 0, zone: 'piste'},
  {id: '21', x: -5.6, z: -3.5, y: 0, zone: 'piste'},
  {id: '22', x: -5.6, z: -1.5, y: 0, zone: 'piste'},
  {id: '30', x: -5, z: 7.6, y: MEZZANINE.h, zone: 'mezz'},
  {id: '31', x: -1.7, z: 7.6, y: MEZZANINE.h, zone: 'mezz'},
  {id: '32', x: 1.7, z: 7.6, y: MEZZANINE.h, zone: 'mezz'},
  {id: '33', x: 5, z: 7.6, y: MEZZANINE.h, zone: 'mezz'},
];

export const HERO = TABLES[2]; // Carré VIP, table 12

/** Étiquettes de zones, placées au même point en 2D et en 3D. */
export const LABELS: {text: string; x: number; z: number; y: number; vertical?: boolean}[] = [
  {text: 'SCÈNE', x: 0, z: -7.9, y: STAGE.h},
  {text: 'PISTE', x: 0, z: -4.2, y: 0},
  {text: 'CARRÉ VIP', x: 6.2, z: -0.1, y: VIP.h},
  {text: 'BORD DE PISTE', x: -6.6, z: -3.5, y: 0, vertical: true},
  {text: 'MEZZANINE', x: 0, z: 9.2, y: MEZZANINE.h},
  {text: 'BAR', x: -7.45, z: 1.75, y: BAR.h, vertical: true},
];
