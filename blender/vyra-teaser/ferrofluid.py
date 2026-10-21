"""B / C — Le ferrofluide : une sphère qui hérisse ses épines comme une bête. Noir (B) ou or liquide (C).

Image fixe :
    blender -b --factory-startup --python ferrofluid.py -- --out <png> [--variant black|gold] [--shot macro|low|wide]
                                                           [--look drop|carre] [--spike 1] [--subdiv 9] [--pct 100]
Séquence pilotée par la musique (JPEG nommés par frame vidéo : 0241.jpg…) :
    ... -- --anim <timing.json> --frames-list 241-300,421-435 --out-dir <dir> [--shot …] [--rest 0.15] [--gain 1]
timing.json (scripts/vyra-teaser/analyse.py) : {"fps": 30, "bass": [0..1 par frame vidéo], …}
"""

import json
import math
import os
import random
import sys
import time

import bpy
import numpy as np
from mathutils import Vector, kdtree, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c  # noqa: E402

opts = c.args()
variant = opts.get("variant", "black")
shot = opts.get("shot", "macro")
look = opts.get("look", "drop")
spike = float(opts.get("spike", 1.0))
scene = c.reset()
c.world(
    (0.0, 0.0, 0.0),
    hdri=opts.get("hdri", "studio"),
    hdri_strength=float(opts.get("hdri_strength", 0.35 if variant == "black" else 0.9)),
    hdri_rot=float(opts.get("hdri_rot", 40)),
)

GOLD = (1.0, 0.62, 0.24)
BLOOD = (1.0, 0.015, 0.03)
RIM = (1.0, 0.5, 0.12)  # saturated: AgX bleaches bright gold to cream
WARM = (1.0, 0.86, 0.66)

# Dense sphere so the spikes stay sharp
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=int(opts.get("subdiv", 9)), radius=1.0)
ferro = bpy.context.active_object
mesh = ferro.data
count = len(mesh.vertices)
dirs = np.empty(count * 3, dtype=np.float32)
mesh.vertices.foreach_get("co", dirs)
dirs = dirs.reshape(count, 3)
dirs /= np.linalg.norm(dirs, axis=1, keepdims=True)

# Spike centres: Fibonacci lattice (near-hexagonal, like real ferrofluid), lightly jittered
N = int(opts.get("spikes", 560))
rand = random.Random(7)
golden = math.pi * (3 - math.sqrt(5))
centres = []
for i in range(N):
    z = 1 - 2 * (i + 0.5) / N
    r = math.sqrt(1 - z * z)
    p = Vector((r * math.cos(golden * i), r * math.sin(golden * i), z))
    p += Vector((rand.uniform(-1, 1), rand.uniform(-1, 1), rand.uniform(-1, 1))) * 0.01
    centres.append(p.normalized())
tree = kdtree.KDTree(N)
for i, p in enumerate(centres):
    tree.insert(p, i)
tree.balance()

# A slow noise decides where the beast bristles; another one staggers the ripples
spacing = math.sqrt(4 * math.pi / N / 0.866)
foot = spacing * 0.74
pattern = np.array([0.07 + 0.3 * max(0.0, (noise.noise(p * 1.7) + 0.3) / 1.3) ** 1.25 for p in centres], np.float32)
phase = np.array([noise.noise(p * 0.8 + Vector((5.2, 1.3, 7.7))) for p in centres], np.float32)

# Each vertex rises with its 3 nearest spikes: sharp tip, concave flanks (computed once, then numpy per frame)
t0 = time.time()
nbr = np.zeros((count, 3), dtype=np.int32)
weight = np.zeros((count, 3), dtype=np.float32)
for i in range(count):
    for j, (_, idx, d) in enumerate(tree.find_n(Vector(dirs[i]), 3)):
        nbr[i, j] = idx
        weight[i, j] = max(0.0, 1.0 - d / foot) ** 2.6
print(f"SPIKES {count} verts in {time.time() - t0:.1f}s")


def bristle(heights):
    lift = (heights[nbr] * weight).max(axis=1)
    mesh.vertices.foreach_set("co", (dirs * (1.0 + lift)[:, None]).ravel())
    mesh.update()


bristle(pattern * spike)
bpy.ops.object.shade_smooth()

if variant == "gold":
    mat, _ = c.principled("liquid_gold", base=(1.0, 0.70, 0.30), metallic=1.0, roughness=0.07)
else:
    mat, _ = c.principled(
        "ferro_black", base=(0.002, 0.002, 0.003), roughness=0.12, **{"Coat Weight": 1.0, "Coat Roughness": 0.06}
    )
ferro.data.materials.append(mat)

if look == "carre":
    # The carré: a column of warm light from above, a gold rim, the blood almost gone
    c.light("beam", "SPOT", (0, -0.3, 7.5), (0, 0, 0.8), float(opts.get("beam", 1800)), WARM, size=0.3, spot=(math.radians(20), 0.6))
    c.light("rim", "AREA", (0.0, 3.6, 2.3), (0, 0, 0.9), float(opts.get("rim", 900)), RIM, size=4.5, size_y=1.6)
    c.light("blood", "AREA", (3.4, 1.2, 0.5), (0, 0, 0.5), float(opts.get("blood", 90)), BLOOD, size=2.2)
    if float(opts.get("density", 0)) > 0:  # the light column is drawn in Remotion by default: black stays black
        c.haze((12, 12, 12), (0, 0, 4), float(opts["density"]), noise_amount=0.7, anisotropy=0.3)
else:
    # The drop: a gold back light rims every spike, a blood kicker on the right flank, a soft top
    k = 0.45 if variant == "gold" else 1.0
    c.light("rim", "AREA", (0.0, 3.6, 2.3), (0, 0, 0.9), float(opts.get("rim", 1400)) * k, RIM, size=4.5, size_y=1.6)
    c.light("blood", "AREA", (3.4, 1.2, 0.5), (0, 0, 0.5), float(opts.get("blood", 700)) * k, BLOOD, size=2.2)
    c.light("top", "AREA", (0.0, 1.6, 3.6), (0, 0, 0.6), float(opts.get("top", 45)) * k, WARM, size=3.0)

# Cameras: (location, target, lens, f-stop, focus distance, roll in degrees)
SHOTS = {
    "macro": ((0.0, -3.1, 1.02), (0.0, 0.0, 0.82), 50.0, 2.2, 2.95, -9.0),  # the spiky horizon
    "low": ((0.95, -1.3, 0.92), (-0.4, 0.3, 1.08), 35.0, 1.8, 1.05, 12.0),  # skimming the spikes
    "wide": ((0.4, -4.2, -0.2), (0.0, 0.0, 0.15), 42.0, 4.0, 4.0, -4.0),  # the beast overflows the frame
}
loc, target, lens, fstop, focus, roll = SHOTS[shot]
cam = c.camera(loc, target, lens=lens, fstop=fstop, focus=focus)
cam.rotation_euler.y += math.radians(float(opts.get("roll", roll)))

c.render_setup(
    scene, opts.get("out", ""), samples=int(opts.get("samples", 128)), pct=int(opts.get("pct", 100)), **c.view_opts(opts)
)


def parse_frames(spec):
    """'241-300,421-435' → {241: 241, …, 300: 241, 421: 421, …}: each frame → the start of its segment."""
    out = {}
    for part in str(spec).split(","):
        a, _, b = part.partition("-")
        for f in range(int(a), int(b or a) + 1):
            out[f] = int(a)
    return out


t0 = time.time()
anim = opts.get("anim")
if anim:
    with open(anim, encoding="utf-8") as f:
        timing = json.load(f)
    fps, bass = timing["fps"], timing["bass"]
    rest = float(opts.get("rest", 0.15))  # spike height between hits
    gain = float(opts.get("gain", 1.0))  # how hard the bass throws them up
    floor = float(opts.get("floor", 0.45))  # bass level under which the spikes are at rest

    def hit(f):
        b = bass[min(max(f, 0), len(bass) - 1)]
        return min(1.0, max(0.0, (b - floor) / (1 - floor)) * gain)
    ripple_hz = float(opts.get("ripple_hz", 0.7))
    spin = math.radians(float(opts.get("spin", 0.3)))  # degrees per frame
    cam0 = cam.location.copy()
    forward = cam.rotation_euler.to_matrix() @ Vector((0, 0, -1))
    drift = float(opts.get("drift", 0.004))  # metres per frame towards the subject
    segments = parse_frames(opts["frames-list"])

    def update(f):
        b = max(hit(f), 0.6 * hit(f + 1))  # the spikes start rising one frame before the kick
        level = spike * (rest + (1 - rest) * b)
        ripple = 1.0 + 0.18 * np.sin(f / fps * 2 * math.pi * ripple_hz + phase * 6.0)
        bristle(pattern * level * ripple)
        # Every segment starts from the style-frame orientation and framing, then turns and creeps in
        elapsed = f - segments[f]
        ferro.rotation_euler.z = spin * elapsed
        cam.location = cam0 + forward * drift * elapsed

    c.render_sequence(scene, opts["out-dir"], sorted(segments), update)
    print(f"RENDER_OK {shot} {len(segments)} frames {time.time() - t0:.1f}s")
else:
    c.render(scene)
    print(f"RENDER_OK {opts['out']} {time.time() - t0:.1f}s")
