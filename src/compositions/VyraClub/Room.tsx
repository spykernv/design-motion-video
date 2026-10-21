// La salle du Lumen Club en 3D, en maquette coupée (mur du fond et mur gauche pleins, les deux autres en
// soubassement). Le jour : papier mat et arêtes à l'encre, comme le plan qui se lève. La nuit : noir, arêtes
// violettes, écran « LUMEN », faisceaux qui battent à 120 BPM. Tout dépend de la frame.
import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import {ThreeCanvas} from '@remotion/three';
import {continueRender, delayRender, interpolate} from 'remotion';
import {cameraAt} from './camera';
import {ARCHIVO, CLAMP, CUTS, HEIGHT, OUT, PALETTE, WIDTH, pulse} from './theme';
import {BAR, BOOTH, COLUMNS, FLOOR, HERO, MEZZANINE, ROOM, SCREEN, STAGE, TABLES, VIP} from './layout';

// ———————————————————————————————————————— Ambiance jour / nuit

type Mood = {e: number; n: number; beat: number};
const MoodContext = React.createContext<Mood>({e: 1, n: 0, beat: 0});
const useMood = () => React.useContext(MoodContext);

const lerpColor = (day: string, night: string, n: number) => new THREE.Color(day).lerp(new THREE.Color(night), n);

const PAPER = PALETTE.paper;
const PAPER_DEEP = PALETTE.paperDeep;
const NIGHT_SURFACE = '#15121f';
const NIGHT_FLOOR = '#0b0912';

// ———————————————————————————————————————— Volumes

type VolumeProps = {
  at: [number, number, number]; // x, base y, z
  day?: string;
  night?: string;
  edges?: boolean;
  emissive?: string;
  glow?: number;
};

const Edges: React.FC<{geometry: THREE.BufferGeometry}> = ({geometry}) => {
  const {n} = useMood();
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 25), [geometry]);
  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color={lerpColor(PALETTE.ink, PALETTE.lumen, n)} transparent opacity={0.9 - 0.62 * n} />
    </lineSegments>
  );
};

const Surface: React.FC<{day: string; night: string; emissive?: string; glow?: number}> = ({day, night, emissive, glow = 0}) => {
  const {n} = useMood();
  return (
    <meshStandardMaterial
      color={lerpColor(day, night, n)}
      roughness={0.92}
      metalness={0}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={glow}
    />
  );
};

const Box: React.FC<VolumeProps & {size: [number, number, number]}> = ({
  size,
  at,
  day = PAPER,
  night = NIGHT_SURFACE,
  edges = true,
  emissive,
  glow,
}) => {
  const geometry = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={[at[0], at[1] + size[1] / 2, at[2]]}>
      <mesh geometry={geometry}>
        <Surface day={day} night={night} emissive={emissive} glow={glow} />
      </mesh>
      {edges && <Edges geometry={geometry} />}
    </group>
  );
};

const Cylinder: React.FC<VolumeProps & {r: number; h: number; rTop?: number}> = ({
  r,
  h,
  rTop,
  at,
  day = PAPER,
  night = NIGHT_SURFACE,
  edges = true,
  emissive,
  glow,
}) => {
  const geometry = useMemo(() => new THREE.CylinderGeometry(rTop ?? r, r, h, 48), [r, rTop, h]);
  return (
    <group position={[at[0], at[1] + h / 2, at[2]]}>
      <mesh geometry={geometry}>
        <Surface day={day} night={night} emissive={emissive} glow={glow} />
      </mesh>
      {edges && <Edges geometry={geometry} />}
    </group>
  );
};

const rectBox = (r: {x0: number; x1: number; z0: number; z1: number}, h: number, y = 0) => ({
  size: [r.x1 - r.x0, h, r.z1 - r.z0] as [number, number, number],
  at: [(r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2] as [number, number, number],
});

// ———————————————————————————————————————— Mobilier

/** Table ronde et banquette en U, dos au mur (côté +x pour le carré, côté -x ailleurs). */
const TableSet: React.FC<{x: number; z: number; y: number; side: 1 | -1; sofa?: boolean}> = ({x, z, y, side, sofa = true}) => (
  <group>
    <Cylinder r={0.45} h={0.72} at={[x, y, z]} day="#fbf9f4" night="#1c1828" />
    {sofa && (
      <>
        <Box size={[0.32, 0.85, 1.7]} at={[x + side * 0.95, y, z]} day={PAPER_DEEP} />
        <Box size={[0.95, 0.5, 0.3]} at={[x + side * 0.5, y, z - 0.72]} day={PAPER_DEEP} />
        <Box size={[0.95, 0.5, 0.3]} at={[x + side * 0.5, y, z + 0.72]} day={PAPER_DEEP} />
      </>
    )}
  </group>
);

/** La silhouette du DJ derrière sa cabine. */
const Dj: React.FC = () => {
  const {n} = useMood();
  const color = lerpColor('#3a3744', '#050409', n);
  return (
    <group position={[0, STAGE.h, -8.95]}>
      <mesh position={[0, 0.95, 0]}>
        <capsuleGeometry args={[0.26, 0.85, 8, 16]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <mesh position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.17, 24, 16]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
    </group>
  );
};

// ———————————————————————————————————————— Écran et lumière de nuit

const ScreenWall: React.FC<{texture: THREE.Texture | null; f: number}> = ({texture, f}) => {
  const {n, beat} = useMood();
  const w = SCREEN.x1 - SCREEN.x0;
  const h = SCREEN.y1 - SCREEN.y0;
  if (texture) {
    texture.offset.x = (f * 0.0016) % 1;
  }
  const geometry = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);
  return (
    <group position={[0, SCREEN.y0 + h / 2, ROOM.z0 + 0.06]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={lerpColor(PAPER_DEEP, '#000000', n)} />
      </mesh>
      {texture && n > 0 && (
        <mesh geometry={geometry} position={[0, 0, 0.01]}>
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={n}
            color={new THREE.Color(1, 1, 1).multiplyScalar(0.72 + 0.28 * beat)}
            toneMapped={false}
          />
        </mesh>
      )}
      <Edges geometry={geometry} />
    </group>
  );
};

/** Faisceaux additifs depuis le pont lumière, balayage lent et intensité sur le temps. */
const Beams: React.FC<{f: number}> = ({f}) => {
  const {n, beat} = useMood();
  const geometry = useMemo(() => {
    const g = new THREE.ConeGeometry(1.1, 11, 32, 1, true);
    g.translate(0, -5.5, 0); // la pointe à l'origine, sur le projecteur
    return g;
  }, []);
  if (n <= 0) return null;
  const xs = [-4.2, -2.5, -0.8, 0.8, 2.5, 4.2];
  return (
    <group position={[0, 5.3, -8.4]}>
      {xs.map((x, i) => {
        const sway = Math.sin(f * 0.045 + i * 1.7) * 0.35;
        return (
          <mesh key={i} geometry={geometry} position={[x, 0, 0]} rotation={[0.55 + 0.12 * Math.sin(f * 0.03 + i), 0, sway]}>
            <meshBasicMaterial
              color={i % 2 ? PALETTE.lumen : PALETTE.lumenHi}
              transparent
              opacity={n * (0.05 + 0.11 * beat)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/** Grille du sol de danse : encre le jour, violet battant la nuit. */
const DanceFloor: React.FC = () => {
  const {n, beat} = useMood();
  const grid = useMemo(() => {
    const pts: number[] = [];
    for (let x = FLOOR.x0; x <= FLOOR.x1 + 0.01; x += 0.9) pts.push(x, 0, FLOOR.z0, x, 0, FLOOR.z1);
    for (let z = FLOOR.z0; z <= FLOOR.z1 + 0.01; z += 0.95) pts.push(FLOOR.x0, 0, z, FLOOR.x1, 0, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  const {size, at} = rectBox(FLOOR, 0.04);
  return (
    <group>
      <Box size={size} at={at} day="#ece8de" night="#120e20" emissive={PALETTE.lumen} glow={n * (0.08 + 0.3 * beat)} edges={false} />
      <lineSegments geometry={grid} position={[0, 0.045, 0]}>
        <lineBasicMaterial color={lerpColor(PALETTE.ink, PALETTE.lumenHi, n)} transparent opacity={0.25 + 0.35 * n * (0.4 + 0.6 * beat)} />
      </lineSegments>
    </group>
  );
};

// ———————————————————————————————————————— Repérage de la table 12

const HeroRing: React.FC<{f: number}> = ({f}) => {
  const {n} = useMood();
  const draw = interpolate(f, [318, 346], [0, 1], {...CLAMP, easing: OUT});
  const fade = interpolate(f, [392, 404], [1, 0], CLAMP);
  if (draw <= 0 || fade <= 0) return null;
  const steps = Math.max(2, Math.round(96 * draw));
  const points: [number, number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / 96) * Math.PI * 2;
    points.push([HERO.x + 0.15 + Math.cos(a) * 1.35, HERO.y + 0.03, HERO.z + Math.sin(a) * 1.35]);
  }
  return (
    <Line points={points} color={n > 0.5 ? PALETTE.lumenHi : PALETTE.ink} lineWidth={4} transparent opacity={fade} />
  );
};

// ———————————————————————————————————————— Caméra

const CameraRig: React.FC<{f: number}> = ({f}) => {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  const set = useThree((s) => s.set);
  const {eye, quaternion, fov} = cameraAt(f);
  useLayoutEffect(() => {
    if (ref.current) set({camera: ref.current});
  }, [set]);
  useLayoutEffect(() => {
    ref.current?.updateProjectionMatrix();
  });
  return (
    <perspectiveCamera
      ref={ref}
      fov={fov}
      aspect={WIDTH / HEIGHT}
      near={0.1}
      far={200}
      position={eye.toArray()}
      quaternion={quaternion}
    />
  );
};

// ———————————————————————————————————————— Scène

/** Texture de l'écran de nuit, dessinée une fois la police Archivo chargée. */
const useScreenTexture = () => {
  const [handle] = useState(() => delayRender('Texture de l\'écran LUMEN'));
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    document.fonts.load(`800 300px "${ARCHIVO}"`).then(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 740;
      const ctx = canvas.getContext('2d')!;
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#1a1036');
      bg.addColorStop(0.55, '#3b2a8f');
      bg.addColorStop(1, '#120a26');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(199,184,255,0.18)';
      ctx.lineWidth = 2;
      for (let y = 40; y < canvas.height; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#efeaff';
      ctx.font = `800 300px "${ARCHIVO}"`;
      (ctx as CanvasRenderingContext2D & {letterSpacing: string}).letterSpacing = '60px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#8b6cff';
      ctx.shadowBlur = 60;
      ctx.fillText('LUMEN', canvas.width / 2 + 30, canvas.height / 2 + 12);
      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      setTexture(t);
      continueRender(handle);
    });
  }, [handle]);
  return texture;
};

export const Room: React.FC<{f: number}> = ({f}) => {
  const texture = useScreenTexture();
  const e = Math.max(0.002, interpolate(f, [216, 258], [0, 1], {...CLAMP, easing: OUT}));
  const n = interpolate(f, [CUTS.nuit, CUTS.nuit + 7], [0, 1], {...CLAMP, easing: OUT});
  const beat = pulse(f, CUTS.nuit);
  const mood = {e, n, beat};

  const bg = lerpColor(PALETTE.paper, PALETTE.night, n);
  // Le papier doit rester du papier : en éclairage physique, l'albédo est divisé par π.
  const ambient = 2.05 - 1.98 * n;
  const sun = 1.5 - 1.45 * n;

  return (
    <ThreeCanvas width={WIDTH} height={HEIGHT} flat gl={{antialias: true}} dpr={1}>
      <MoodContext.Provider value={mood}>
        <CameraRig f={f} />
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 14 + 60 * (1 - n), 34 + 160 * (1 - n)]} />
        <ambientLight intensity={ambient} />
        <directionalLight position={[-6, 14, 9]} intensity={sun} />
        <pointLight position={[0, 4.2, -7]} color={PALETTE.lumen} intensity={n * (26 + 30 * beat)} distance={24} decay={1.6} />
        <pointLight position={[HERO.x - 0.2, HERO.y + 1.5, HERO.z]} color="#fff1e0" intensity={n * 3.2} distance={4} decay={1.5} />

        {/* Le plan se lève : tout le volume monte depuis le sol. */}
        <group scale={[1, e, 1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[ROOM.x1 - ROOM.x0, ROOM.z1 - ROOM.z0]} />
            <Surface day={PAPER} night={NIGHT_FLOOR} />
          </mesh>

          {/* Murs : fond et gauche pleins, droite et devant en soubassement (maquette coupée). */}
          <Box size={[16, 5.6, 0.12]} at={[0, 0, ROOM.z0 - 0.06]} day="#f7f5ef" night="#0d0b15" />
          <Box size={[0.12, 5.6, 20]} at={[ROOM.x0 - 0.06, 0, 0]} day="#f7f5ef" night="#0d0b15" />
          <Box size={[0.12, 0.35, 20]} at={[ROOM.x1 + 0.06, 0, 0]} />
          <Box size={[16, 0.35, 0.12]} at={[0, 0, ROOM.z1 + 0.06]} />

          <Box {...rectBox(STAGE, STAGE.h)} />
          <Box {...rectBox(BOOTH, BOOTH.h, STAGE.h)} day="#fbf9f4" emissive={PALETTE.lumen} glow={n * 0.25} />
          <Dj />
          <Box size={[0.9, 1.8, 0.8]} at={[-3.4, STAGE.h, -9.4]} day={PAPER_DEEP} />
          <Box size={[0.9, 1.8, 0.8]} at={[3.4, STAGE.h, -9.4]} day={PAPER_DEEP} />
          <Box size={[10.4, 0.18, 0.18]} at={[0, 5.3, -8.4]} day={PAPER_DEEP} />
          <ScreenWall texture={texture} f={f} />

          <DanceFloor />

          <Box {...rectBox(VIP, VIP.h)} />
          {[-6.2, -4.7, -3.2, -1.7].map((z) => (
            <Cylinder key={z} r={0.05} h={1} at={[VIP.x0 + 0.1, VIP.h, z]} day="#3a3744" night={PALETTE.lumen} edges={false} emissive={PALETTE.lumen} glow={n * 0.3} />
          ))}
          <Box size={[0.04, 0.04, 4.5]} at={[VIP.x0 + 0.1, VIP.h + 0.82, -3.95]} day="#3a3744" night="#4a3a8f" edges={false} emissive={PALETTE.lumen} glow={n * 0.35} />

          <Box {...rectBox(MEZZANINE, 0.3, MEZZANINE.h - 0.3)} />
          <Box size={[16, 0.9, 0.06]} at={[0, MEZZANINE.h, MEZZANINE.z0 + 0.03]} day="#fbf9f4" />
          <Box {...rectBox(BAR, BAR.h)} day={PAPER_DEEP} emissive={PALETTE.lumen} glow={n * 0.18} />

          {COLUMNS.map(([x, z]) => (
            <Cylinder key={`${x}-${z}`} r={0.3} h={5.6} at={[x, 0, z]} day="#f7f5ef" />
          ))}

          {TABLES.map((t) => (
            <TableSet key={t.id} x={t.x} z={t.z} y={t.y} side={t.zone === 'vip' ? 1 : -1} sofa={t.zone !== 'mezz'} />
          ))}
          {/* Sur la table 12 : le seau. */}
          <Cylinder r={0.08} rTop={0.1} h={0.15} at={[HERO.x + 0.12, HERO.y + 0.72, HERO.z - 0.12]} day="#d9d4c7" night="#2a2540" />
        </group>

        <HeroRing f={f} />
        <Beams f={f} />
      </MoodContext.Provider>
    </ThreeCanvas>
  );
};
