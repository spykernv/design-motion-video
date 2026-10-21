"""A — Le monolithe : deux dalles d'obsidienne, une fente d'or, la lumière ne passe que par la fente.

Image fixe :
    blender -b --factory-startup --python monolith.py -- --out <png> [--shot close] [--samples 128] [--pct 100]
Séquence (JPEG numérotés 0000.jpg…) :
    blender -b --factory-startup --python monolith.py -- --anim dolly|push --out-dir <dir> [--frames 120]
      dolly : travelling bas et lent vers le monolithe (beat 2)
      push  : la fente en gros plan puis la poussée dedans, la porte s'ouvre (beats 3-4)
"""

import math
import os
import sys
import time

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c  # noqa: E402

opts = c.args()
anim = opts.get("anim")
scene = c.reset()
c.world((0.0012, 0.0008, 0.0016))

GOLD = (1.0, 0.62, 0.24)
BLOOD = (1.0, 0.015, 0.03)

# Wet black floor: mirror patches and duller ones
floor_mat, fb = c.principled("floor_wet", base=(0.003, 0.003, 0.004), roughness=0.08)
nt = floor_mat.node_tree
tex = nt.nodes.new("ShaderNodeTexNoise")
tex.inputs["Scale"].default_value = 2.2
tex.inputs["Detail"].default_value = 6.0
rng = nt.nodes.new("ShaderNodeMapRange")
rng.inputs["From Min"].default_value = 0.42
rng.inputs["From Max"].default_value = 0.62
rng.inputs["To Min"].default_value = 0.02
rng.inputs["To Max"].default_value = 0.32
nt.links.new(tex.outputs["Fac"], rng.inputs["Value"])
nt.links.new(rng.outputs["Result"], fb.inputs["Roughness"])
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, 0))
bpy.context.active_object.data.materials.append(floor_mat)

# Two obsidian slabs, the door ajar
W, D, H, GAP = 1.4, 0.55, 3.7, 0.032
obsidian, _ = c.principled(
    "obsidian", base=(0.005, 0.004, 0.006), roughness=0.16, **{"Coat Weight": 1.0, "Coat Roughness": 0.02}
)
half = (W - GAP) / 2
slabs = []
for side in (-1, 1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(side * (GAP / 2 + half / 2), 0, H / 2))
    slab = bpy.context.active_object
    slab.scale = (half, D, H)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)  # the push moves the slabs apart
    bev = slab.modifiers.new("bevel", "BEVEL")
    bev.width, bev.segments, bev.harden_normals = 0.014, 4, True
    bpy.ops.object.shade_smooth()
    slab.data.materials.append(obsidian)
    slabs.append((slab, side))

# The seam: a thin glowing core inside the gap
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.05, H / 2))
core = bpy.context.active_object
core.scale = (GAP * 0.45, D * 0.6, H * 0.985)
seam_mat = c.emission("seam", GOLD, 60.0)
core.data.materials.append(seam_mat)
seam = next(n for n in seam_mat.node_tree.nodes if n.type == "EMISSION")

# Light right behind the door, a narrow sheet: only the seam lets it through, towards us
behind = c.light(
    "behind", "AREA", (0, 0.42, H / 2), (0, -6, H / 2), 420, GOLD, size=0.06, size_y=H * 0.96, spread=math.radians(9)
)
if opts.get("spot"):  # a thin beam from above, the VIP spot
    c.light("spot", "SPOT", (0.0, -0.4, 9.5), (0, 0, H), 1200, (1.0, 0.8, 0.55), size=0.03, spot=(math.radians(7), 0.4))
# Dim glow far behind: the haze lights up just enough for the monolith to read as a silhouette
c.light(
    "halo", "AREA", (0.0, 7.0, 2.6), (0, -6, 1.8), float(opts.get("halo", 420)), (1.0, 0.55, 0.2), size=5.0, size_y=4.0,
    glossy=False,
)
# Blood-red glow far back left, out of frame and out of the floor's mirror: the wild side
c.light("blood", "AREA", (-9.5, 9.0, 2.2), (-0.7, 0, 1.6), 900, BLOOD, size=3.0)

c.haze((22, 22, 9), (0, 0, 4.5), float(opts.get("density", 0.0045)), noise_scale=0.3, noise_amount=0.8, anisotropy=0.15)

if anim == "push" or opts.get("shot") == "close":  # the seam fills the frame
    cy, cz = float(opts.get("camy", -2.4)), float(opts.get("camz", 1.85))
    cam = c.camera((0.0, cy, cz), (0.0, 0.0, cz), lens=30.0)
else:
    cam = c.camera((0.0, -6.0, 0.62), (0.0, 0.0, 1.95), lens=26.0)

c.render_setup(
    scene, opts.get("out", ""), samples=int(opts.get("samples", 128)), pct=int(opts.get("pct", 100)), **c.view_opts(opts)
)


def smooth(t):
    return t * t * (3 - 2 * t)


def dolly(u):
    t = smooth(u)
    cam.location = Vector((0.14, -8.6, 0.42)).lerp(Vector((0.0, -6.0, 0.62)), t)
    c.look_at(cam, Vector((0, 0, 2.15)).lerp(Vector((0, 0, 1.95)), t))


E0, B0 = seam.inputs["Strength"].default_value, behind.data.energy


def push(u):
    if u < 0.5:  # la fente : on s'approche lentement
        p = Vector((0, -3.4, 1.72)).lerp(Vector((0, -2.5, 1.85)), smooth(u / 0.5))
    else:  # l'ouverture : on plonge dedans, de plus en plus vite
        p = Vector((0, -2.5, 1.85)).lerp(Vector((0, -0.3, 1.85)), ((u - 0.5) / 0.5) ** 3)
    cam.location = p
    c.look_at(cam, (0, 0, p.z))
    o = max(0.0, (u - 0.58) / 0.42) ** 2  # la porte s'ouvre
    gap = GAP + 0.2 * o
    for slab, side in slabs:
        slab.location.x = side * (gap / 2 + half / 2)
    core.scale.x = gap * 0.45
    seam.inputs["Strength"].default_value = E0 * (1 + 7 * o)
    behind.data.energy = B0 * (1 + 9 * o)
    if not opts.get("keep-size"):
        behind.data.size = 0.06 + gap


def debug(tag):
    if opts.get("debug"):
        s = bpy.context.scene
        print(
            "DEBUGCAM", tag, s.camera.name, tuple(round(v, 3) for v in s.camera.location),
            tuple(round(math.degrees(v), 1) for v in s.camera.rotation_euler), "lens", s.camera.data.lens,
            "slabs", [round(sl.location.x, 3) for sl, _ in slabs], "core", round(core.scale.x, 4),
            "seam", seam.inputs["Strength"].default_value, "behind", behind.data.energy, round(behind.data.size, 3),
        )


t0 = time.time()
if anim:
    n = int(opts.get("frames", 120))
    move = {"dolly": dolly, "push": push}[anim]
    def update(i):
        move(i / (n - 1))
        debug(f"frame {i}")

    c.render_sequence(scene, opts["out-dir"], c.frames_to_render(opts, n), update, persistent=not opts.get("no-persist"))
    print(f"RENDER_OK {anim} {n} frames {time.time() - t0:.1f}s")
else:
    debug("still")
    c.render(scene)
    print(f"RENDER_OK {opts['out']} {time.time() - t0:.1f}s")
