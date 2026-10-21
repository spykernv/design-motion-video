// La caméra de la visite : une fonction pure de la frame, partagée par la scène 3D et par les étiquettes
// HTML posées par-dessus (projection identique, donc les étiquettes collent à la salle).
import * as THREE from 'three';
import {interpolate} from 'remotion';
import {CLAMP, HEIGHT, IN_OUT, WIDTH} from './theme';
import {PX_PER_M} from './layout';

type Key = {f: number; eye: [number, number, number]; target: [number, number, number]; fov: number};

// Vue de dessus de départ : à 40° de champ vertical, cette hauteur donne 1 m = 50 px, comme le plan SVG.
const TOP = 960 / (PX_PER_M * Math.tan((20 * Math.PI) / 180));

const KEYS: Key[] = [
  {f: 210, eye: [0, TOP, -0.6], target: [0, 0, -1], fov: 40},
  {f: 216, eye: [0, TOP, -0.6], target: [0, 0, -1], fov: 40},
  {f: 266, eye: [4, 22, 21], target: [1, 0, -1.5], fov: 44},
  {f: 312, eye: [10.2, 6.4, 5.6], target: [5.6, 0.6, -2.8], fov: 50},
  {f: 356, eye: [9.1, 3.6, 2.3], target: [6.3, 1.5, -1.8], fov: 50},
  {f: 398, eye: [7.45, 1.78, 0.25], target: [0, 1.7, -8.6], fov: 56},
  {f: 480, eye: [7.3, 1.74, 0.02], target: [-0.3, 1.9, -8.6], fov: 53},
  {f: 600, eye: [7.15, 1.7, -0.2], target: [-0.6, 2, -8.6], fov: 51},
];

export type CameraState = {eye: THREE.Vector3; target: THREE.Vector3; fov: number; quaternion: THREE.Quaternion};

export const cameraAt = (f: number): CameraState => {
  let i = KEYS.length - 2;
  for (let k = 0; k < KEYS.length - 1; k++) {
    if (f < KEYS[k + 1].f) {
      i = k;
      break;
    }
  }
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = interpolate(f, [a.f, b.f], [0, 1], {...CLAMP, easing: IN_OUT});
  const eye = new THREE.Vector3(...a.eye).lerp(new THREE.Vector3(...b.eye), t);
  const target = new THREE.Vector3(...a.target).lerp(new THREE.Vector3(...b.target), t);
  const fov = a.fov + (b.fov - a.fov) * t;
  const m = new THREE.Matrix4().lookAt(eye, target, new THREE.Vector3(0, 1, 0));
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(m);
  return {eye, target, fov, quaternion};
};

/** Position à l'écran (px) d'un point de la salle à la frame f ; null s'il est derrière la caméra. */
export const projectAt = (f: number, p: [number, number, number]) => {
  const {eye, quaternion, fov} = cameraAt(f);
  const cam = new THREE.PerspectiveCamera(fov, WIDTH / HEIGHT, 0.1, 200);
  cam.position.copy(eye);
  cam.quaternion.copy(quaternion);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  if (v.z > 1) return null;
  return {x: ((v.x + 1) / 2) * WIDTH, y: ((1 - v.y) / 2) * HEIGHT};
};
