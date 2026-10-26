// « Votre marque, jusque dans la salle » — what VYRA brings of a club's brand into its night, on the
// demo venue Lumen Club: its LED wall playing the night's loop (filmed in the site's 3D room,
// public/vyra-site/brand-screens.mp4), a bottle at its colours with its show (three.js), and its
// neon sign on the brick (drawn). 4:5, a loop; the site's text names each element.
import {Environment, Lightformer} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {Video} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import type {ReactNode} from 'react';
import {useMemo} from 'react';
import {AbsoluteFill, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';

import {FPS, JOST, tween} from './theme';

export const BRAND_SIZE = {width: 720, height: 900};
export const BRAND_DURATION = 360;

const SHOTS = [
  {from: 0, length: 126, caption: 'Vos écrans'},
  {from: 114, length: 132, caption: 'Vos bouteilles'},
  {from: 234, length: 126, caption: 'Vos enseignes'},
] as const;
const OVERLAP = 12;

/** The LUMEN wordmark (brand.json), in a 78 × 20 box. */
const WORDMARK = [
  'M1.5 2V18H11',
  'M16 2V13a5 5 0 0 0 10 0V2',
  'M31 18V2L38 13L45 2V18',
  'M59 2H50V18H59M50 10H57.5',
  'M64 18V2L76 18V2',
];
const BRASS = '#c9a46a';

/** A shot of its own: its frames start at 0, it fades in over the one before. */
function Shot({from, length, children}: {from: number; length: number; children: ReactNode}) {
  return (
    <Sequence from={from} durationInFrames={length}>
      <FadeIn>{children}</FadeIn>
    </Sequence>
  );
}

function FadeIn({children}: {children: ReactNode}) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{opacity: tween(frame, [0, OVERLAP], [0, 1])}}>{children}</AbsoluteFill>;
}

/* ── the bottle ─────────────────────────────────────────────────────────────────────────── */

/** A champagne bottle's profile (radius, height), 3 units tall. */
const PROFILE: [number, number][] = [
  [0, 0], [0.4, 0], [0.45, 0.05], [0.45, 1.9], [0.44, 2.0], [0.38, 2.15], [0.27, 2.32],
  [0.18, 2.48], [0.155, 2.6], [0.148, 2.9], [0.165, 2.94], [0.15, 3.0], [0, 3.0],
];

/** The label: matte black, the wordmark in brass between two fine rules. */
function labelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#0d0b09';
  g.fillRect(0, 0, 1024, 512);
  const gold = g.createLinearGradient(0, 0, 1024, 0);
  gold.addColorStop(0, '#8a6a38');
  gold.addColorStop(0.45, '#f1dcb0');
  gold.addColorStop(1, '#8a6a38');
  g.strokeStyle = gold;
  g.lineWidth = 3;
  for (const y of [70, 442]) {
    g.beginPath();
    g.moveTo(330, y);
    g.lineTo(694, y);
    g.stroke();
  }
  g.save();
  g.translate(340, 176);
  g.scale(4.4, 4.4);
  g.lineWidth = 1.5;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const d of WORDMARK) g.stroke(new Path2D(d));
  g.restore();
  // the loge's name under it, in fine capitals drawn as dots: no font to wait for
  g.fillStyle = gold;
  for (let i = 0; i < 7; i++) g.fillRect(452 + i * 18, 330, 6, 6);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Sparks of the bottle's show: born at the sparkler's tip, thrown up, falling, fading. */
function sparksAt(time: number, count: number) {
  const positions = new Float32Array(count * 3);
  const heat = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const life = 0.55 + random(`life-${i}`) * 0.6;
    const age = (time + random(`birth-${i}`) * life) % life;
    const angle = random(`a-${i}`) * Math.PI * 2;
    const spread = 0.6 + random(`s-${i}`) * 1.6;
    const up = 2.2 + random(`u-${i}`) * 2.4;
    positions[i * 3] = Math.cos(angle) * spread * age;
    positions[i * 3 + 1] = up * age - 4.9 * age * age;
    positions[i * 3 + 2] = Math.sin(angle) * spread * age;
    heat[i] = 1 - age / life;
  }
  return {positions, heat};
}

const SPARK_VERTEX = /* glsl */ `
  attribute float aHeat;
  varying float vHeat;
  void main() {
    vHeat = aHeat;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (3.0 + 12.0 * aHeat) * (8.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const SPARK_FRAGMENT = /* glsl */ `
  varying float vHeat;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float glow = exp(-d * d * 3.5);
    vec3 col = mix(vec3(1.0, 0.55, 0.18), vec3(1.0, 0.95, 0.82), vHeat);
    gl_FragColor = vec4(col * glow * (0.4 + 1.6 * vHeat), 1.0);
  }
`;

function Bottle() {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const time = frame / FPS;
  const bottle = useMemo(() => new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 96), []);
  const foil = useMemo(
    () =>
      new THREE.LatheGeometry(
        PROFILE.filter(([, y]) => y >= 2.3).map(([r, y]) => new THREE.Vector2(r > 0 ? r + 0.008 : 0, y + 0.004)),
        96,
      ),
    [],
  );
  const label = useMemo(labelTexture, []);
  const sparkGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  const {positions, heat} = sparksAt(time, 520);
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  sparkGeometry.setAttribute('aHeat', new THREE.BufferAttribute(heat, 1));
  const ice = useMemo(
    () =>
      Array.from({length: 16}, (_, i) => ({
        position: [
          Math.cos(i * 2.4) * (0.45 + random(`ix-${i}`) * 0.28),
          1.28 + random(`iy-${i}`) * 0.12,
          Math.sin(i * 2.4) * (0.45 + random(`iz-${i}`) * 0.28),
        ] as [number, number, number],
        size: 0.1 + random(`is-${i}`) * 0.08,
        turn: random(`ir-${i}`) * Math.PI,
      })),
    [],
  );
  // the camera turns slowly round the bottle, rising a little
  const turn = tween(frame, [0, 132], [-0.32, 0.22], (t) => t);
  camera.position.set(Math.sin(turn) * 7.4, 2.4 + 0.5 * (turn + 0.32), Math.cos(turn) * 7.4);
  camera.lookAt(0.2, 2.25, 0);
  camera.fov = 34;
  camera.updateProjectionMatrix();
  const flicker = 0.75 + 0.25 * random(`flicker-${frame}`);
  return (
    <>
      <color attach="background" args={['#070504']} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.4} color="#ffcf8a" position={[-4, 3, 2]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#12a3b4" position={[4, 2, -3]} scale={[2, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
      </Environment>
      <ambientLight intensity={0.15} />
      <spotLight position={[-3, 5, 3]} angle={0.5} penumbra={0.8} intensity={60} color="#ffd9a0" />
      <pointLight position={[0.02, 3.55, 0.3]} intensity={18 * flicker} distance={7} color="#ffc27a" />
      {/* the table */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#141010" roughness={0.28} metalness={0.1} />
      </mesh>
      {/* behind it, the bucket, brushed brass, its ice and a second bottle */}
      <group position={[1.35, 0, -1.1]}>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.86, 0.68, 1.44, 96, 1, true]} />
          <meshStandardMaterial color="#b8935a" metalness={0.75} roughness={0.34} side={THREE.DoubleSide} />
        </mesh>
        {ice.map(({position, size, turn: r}, i) => (
          <mesh key={i} position={position} rotation={[r, r * 2, 0]}>
            <icosahedronGeometry args={[size * 0.8, 1]} />
            <meshPhysicalMaterial color="#eef6ff" roughness={0.08} metalness={0} transmission={0.5} thickness={0.2} transparent opacity={0.85} />
          </mesh>
        ))}
        <mesh geometry={bottle} position={[0, 0.25, 0]} rotation={[0, 0, -0.22]}>
          <meshPhysicalMaterial color="#0a2216" roughness={0.06} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} />
        </mesh>
      </group>
      {/* the bottle of the show, its label to the camera */}
      <group position={[0, 0, 0]}>
        <mesh geometry={bottle}>
          <meshPhysicalMaterial color="#0a2216" roughness={0.06} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} />
        </mesh>
        <mesh geometry={foil}>
          <meshStandardMaterial color="#d8b77a" metalness={1} roughness={0.22} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation-y={-1.2}>
          <cylinderGeometry args={[0.458, 0.458, 0.82, 96, 1, true, 0, 2.4]} />
          <meshStandardMaterial map={label} roughness={0.55} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* the sparkler on its neck, and its sparks */}
        <mesh position={[0.02, 3.22, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.4} />
        </mesh>
        <points position={[0.02, 3.44, 0]} geometry={sparkGeometry}>
          <shaderMaterial
            vertexShader={SPARK_VERTEX}
            fragmentShader={SPARK_FRAGMENT}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </>
  );
}

function BottleShot() {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#070504'}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true}} camera={{fov: 30, near: 0.1, far: 100, position: [0, 2, 4.6]}}>
        <Bottle />
      </ThreeCanvas>
      {/* the club's night behind it, out of focus */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 18% 22%, rgb(255 179 71 / 0.16), transparent 22%), radial-gradient(circle at 82% 30%, rgb(18 163 180 / 0.14), transparent 20%), radial-gradient(circle at 70% 12%, rgb(255 207 138 / 0.1), transparent 14%)',
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
}

/* ── the neon sign ──────────────────────────────────────────────────────────────────────── */

function NeonShot() {
  const frame = useCurrentFrame();
  // the sign lights up as a neon does: a few hesitations, then steady, with its hum
  const on = frame < 26 ? (random(`on-${Math.floor(frame / 2)}`) > 0.45 ? 1 : 0.15) : 0.94 + 0.06 * random(`hum-${frame}`);
  const zoom = tween(frame, [0, 126], [1, 1.08], (t) => t);
  const tube = (color: string, width: number, blur: number, opacity: number) => (
    <g style={{filter: blur ? `blur(${blur}px)` : undefined}} opacity={opacity * on}>
      {WORDMARK.map((d) => (
        <path key={d} d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
  );
  return (
    <AbsoluteFill style={{background: '#1a0c08', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <svg width="100%" height="100%" viewBox="0 0 720 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="brick" width="96" height="56" patternUnits="userSpaceOnUse">
              <rect width="96" height="56" fill="#140806" />
              <rect x="2" y="2" width="92" height="24" fill="#3b1810" />
              <rect x="-46" y="30" width="92" height="24" fill="#36160f" />
              <rect x="50" y="30" width="92" height="24" fill="#3e1a11" />
            </pattern>
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
            </filter>
            <radialGradient id="light" cx="50%" cy="44%" r="55%">
              <stop offset="0%" stopColor="#ff9a3c" stopOpacity={0.55 * on} />
              <stop offset="60%" stopColor="#ff9a3c" stopOpacity={0.08 * on} />
              <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <rect width="720" height="900" fill="url(#brick)" />
          <rect width="720" height="900" filter="url(#grain)" />
          <rect width="720" height="900" fill="url(#light)" style={{mixBlendMode: 'screen'}} />
          <g transform="translate(110 300) scale(6.4)">
            {/* the tubes' clips on the brick */}
            {[[6, 10], [21, 10], [38, 10], [54, 10], [70, 10]].map(([x, y]) => (
              <rect key={x} x={x - 0.6} y={y - 0.6} width={1.2} height={1.2} fill="#0b0605" />
            ))}
            {tube('#ff8a2a', 3.4, 9, 0.75)}
            {tube('#ffb35c', 2.0, 2.5, 0.9)}
            {tube('#fff1d8', 0.75, 0, 1)}
          </g>
          <g opacity={on} style={{filter: 'drop-shadow(0 0 6px #4fd8ff) drop-shadow(0 0 16px #12a3b4)'}}>
            <text x="360" y="520" textAnchor="middle" fill="#e6fbff" fontFamily={JOST} fontSize="30" letterSpacing="14">
              SAMEDI SOIR
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ── the film ───────────────────────────────────────────────────────────────────────────── */

function Caption() {
  const frame = useCurrentFrame();
  const shot = [...SHOTS].reverse().find((s) => frame >= s.from + OVERLAP / 2) ?? SHOTS[0];
  const local = frame - shot.from;
  const shown = tween(local, [OVERLAP, OVERLAP + 10], [0, 1]) * (1 - tween(local, [shot.length - 10, shot.length], [0, 1]));
  return (
    <div
      style={{
        position: 'absolute',
        left: 36,
        bottom: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        color: '#f2eee5',
        fontFamily: JOST,
        fontSize: 22,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        opacity: shown,
        transform: `translateY(${(1 - shown) * 8}px)`,
        textShadow: '0 2px 12px rgb(0 0 0 / 0.6)',
      }}
    >
      <span style={{width: 34, height: 1, background: BRASS}} />
      {shot.caption}
    </div>
  );
}

export const Brand = () => {
  const frame = useCurrentFrame();
  const fade = tween(frame, [0, 8], [1, 0]) + tween(frame, [BRAND_DURATION - 10, BRAND_DURATION - 1], [0, 1]);
  return (
    <AbsoluteFill style={{background: '#070504'}}>
      <Shot from={SHOTS[0].from} length={SHOTS[0].length}>
        <Video src={staticFile('vyra-site/brand-screens.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Shot>
      <Shot from={SHOTS[1].from} length={SHOTS[1].length}>
        <BottleShot />
      </Shot>
      <Shot from={SHOTS[2].from} length={SHOTS[2].length}>
        <NeonShot />
      </Shot>
      <Caption />
      <AbsoluteFill style={{background: `rgb(7 5 4 / ${Math.min(1, fade)})`}} />
    </AbsoluteFill>
  );
};
