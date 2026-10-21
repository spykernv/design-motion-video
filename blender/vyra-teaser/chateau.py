"""Le château (teaser v2) : l'escalier, les portes monumentales au V d'or, la nef au tapis rouge, la table d'honneur.

Formes abstraites, aucun élément des clubs VYRA. Toutes les longueurs en mètres.

Image fixe d'un plan :
    blender -b --factory-startup --python chateau.py -- --shot <plan> --frame <frame vidéo> --out <png> [--pct 50]
Séquence d'un plan (JPEG nommés par frame vidéo, 0241.jpg…) :
    blender -b --factory-startup --python chateau.py -- --shot <plan> --out-dir <dir> [--samples 64]
Plans et frames : SHOTS ci-dessous, calés sur src/compositions/VyraTeaser/edit.ts.
"""

import math
import os
import sys
import time

import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c  # noqa: E402

opts = c.args()
scene = c.reset()
c.world((0.0010, 0.0007, 0.0012))

GOLD = (1.0, 0.62, 0.24)
GOLD_WHITE = (1.0, 0.8, 0.52)
WARM = (1.0, 0.86, 0.66)
BLOOD = (1.0, 0.015, 0.03)

STEPS, STEP_H, STEP_D = 8, 0.16, 0.55
Z0 = STEPS * STEP_H  # le seuil, 1,28 m
PW, PH = 3.2, 11.2  # demi-largeur et hauteur du portail
Y_DOOR = 0.6  # plan des portes, en retrait dans l'épaisseur de la façade
TABLE_Y = 51.0

# ———————————————————————————————————————— Matériaux

obsidian, _ = c.principled(
    "obsidian", base=(0.006, 0.005, 0.007), roughness=0.18, **{"Coat Weight": 1.0, "Coat Roughness": 0.03}
)
gold_metal, _ = c.principled("gold", base=(1.0, 0.72, 0.32), metallic=1.0, roughness=0.2)
velvet, _ = c.principled(
    "velvet",
    base=(0.1, 0.0015, 0.006),
    roughness=0.9,
    **{"Sheen Weight": 0.8, "Sheen Roughness": 0.4, "Sheen Tint": (0.9, 0.12, 0.16, 1.0)},
)
black_glass, _ = c.principled(
    "black_glass", base=(0.004, 0.012, 0.006), roughness=0.04, **{"Coat Weight": 1.0, "Coat Roughness": 0.0}
)
bronze, _ = c.principled("bronze", base=(0.32, 0.2, 0.09), metallic=1.0, roughness=0.32)
line_hot = c.emission("line_hot", GOLD_WHITE, 32.0)
line = c.emission("line", GOLD, 18.0)
line_soft = c.emission("line_soft", GOLD, 8.0)


def stone(name):
    """Pierre de château sombre : grands blocs appareillés, joints creusés, teinte qui varie d'un bloc à l'autre."""
    mat, bsdf = c.principled(name, base=(0.012, 0.01, 0.011), roughness=0.55, **{"Coat Weight": 0.25, "Coat Roughness": 0.3})
    nt = mat.node_tree
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    add = nt.nodes.new("ShaderNodeMath")
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    brick = nt.nodes.new("ShaderNodeTexBrick")
    bump = nt.nodes.new("ShaderNodeBump")
    nt.links.new(geo.outputs["Position"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["X"], add.inputs[0])
    nt.links.new(sep.outputs["Y"], add.inputs[1])
    nt.links.new(add.outputs["Value"], comb.inputs["X"])  # horizontal along the facade or along the hall walls
    nt.links.new(sep.outputs["Z"], comb.inputs["Y"])
    nt.links.new(comb.outputs["Vector"], brick.inputs["Vector"])
    brick.inputs["Scale"].default_value = 0.31  # blocs d'environ 1,6 × 0,8 m
    brick.inputs["Mortar Size"].default_value = 0.025
    brick.inputs["Color1"].default_value = (0.014, 0.012, 0.012, 1)
    brick.inputs["Color2"].default_value = (0.008, 0.007, 0.008, 1)
    brick.inputs["Mortar"].default_value = (0.003, 0.003, 0.003, 1)
    nt.links.new(brick.outputs["Color"], bsdf.inputs["Base Color"])
    bump.invert = True
    bump.inputs["Strength"].default_value = 0.6
    bump.inputs["Distance"].default_value = 0.03
    nt.links.new(brick.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


castle_stone = stone("castle_stone")


def mirror(name, base, rmin, rmax, scale):
    """Sol noir verni : plaques miroir et plaques plus mates."""
    mat, bsdf = c.principled(name, base=base, roughness=rmin)
    nt = mat.node_tree
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = scale
    tex.inputs["Detail"].default_value = 6.0
    rng = nt.nodes.new("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value = 0.42
    rng.inputs["From Max"].default_value = 0.62
    rng.inputs["To Min"].default_value = rmin
    rng.inputs["To Max"].default_value = rmax
    nt.links.new(tex.outputs["Fac"], rng.inputs["Value"])
    nt.links.new(rng.outputs["Result"], bsdf.inputs["Roughness"])
    return mat


wet_stone = mirror("wet_stone", (0.003, 0.003, 0.004), 0.03, 0.32, 1.6)
marble = mirror("marble", (0.006, 0.005, 0.006), 0.02, 0.2, 0.8)

# ———————————————————————————————————————— Briques


def link_parent(obj, parent):
    if parent is not None:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()


def box(name, lo, hi, mat, bevel=0.0, parent=None):
    """Pavé entre deux coins (lo, hi)."""
    lo, hi = Vector(lo), Vector(hi)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(lo + hi) / 2)
    o = bpy.context.active_object
    o.name = name
    o.scale = hi - lo
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new("bevel", "BEVEL")
        mod.width, mod.segments, mod.harden_normals = bevel, 3, True
        bpy.ops.object.shade_smooth()
    o.data.materials.append(mat)
    link_parent(o, parent)
    return o


def strip(name, p0, p1, width, mat, normal=(0, -1, 0), depth=0.02, parent=None):
    """Filet de lumière de p0 à p1, à plat sur une face de normale `normal`."""
    p0, p1 = Vector(p0), Vector(p1)
    z = p1 - p0
    length = z.length
    z.normalize()
    y = Vector(normal)
    y = (y - z * y.dot(z)).normalized()
    x = y.cross(z)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(p0 + p1) / 2)
    o = bpy.context.active_object
    o.name = name
    o.scale = (width, depth, length)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.rotation_euler = Matrix((x, y, z)).transposed().to_euler()
    o.data.materials.append(mat)
    link_parent(o, parent)
    return o


def cylinder(name, r, h, loc, mat, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=48)
    o = bpy.context.active_object
    o.name = name
    bpy.ops.object.shade_smooth_by_angle(angle=0.6)
    o.data.materials.append(mat)
    link_parent(o, parent)
    return o


def sphere(name, r, loc, mat, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    bpy.ops.object.shade_smooth()
    o.data.materials.append(mat)
    return o


def hinge(name, loc):
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=loc)
    e = bpy.context.active_object
    e.name = name
    bpy.context.view_layer.update()
    return e


# ———————————————————————————————————————— Dehors : le parvis, l'escalier, la façade

bpy.ops.mesh.primitive_plane_add(size=120, location=(0, -20, 0))
bpy.context.active_object.data.materials.append(wet_stone)

STAIR_X = 8.0
for i in range(STEPS):
    y_front = -2.5 - (STEPS - i) * STEP_D
    top = (i + 1) * STEP_H
    box(f"step_{i}", (-STAIR_X, y_front, 0), (STAIR_X, -2.5, top), obsidian, bevel=0.01)
    strip(f"nosing_{i}", (-STAIR_X + 0.2, y_front + 0.05, top + 0.004), (STAIR_X - 0.2, y_front + 0.05, top + 0.004), 0.035, line, normal=(0, 0, 1))
box("landing", (-STAIR_X, -2.5, 0), (STAIR_X, 0, Z0), obsidian, bevel=0.01)

# Façade de pierre : deux murs, un linteau, un seuil
box("wall_l", (-26, 0, 0), (-PW, 2.2, 30), castle_stone)
box("wall_r", (PW, 0, 0), (26, 2.2, 30), castle_stone)
box("lintel", (-PW, 0, Z0 + PH), (PW, 2.2, 30), castle_stone)
box("sill", (-PW, 0, 0), (PW, 2.2, Z0), obsidian)
# Le portail cerné d'or
strip("frame_l", (-PW - 0.06, -0.012, Z0), (-PW - 0.06, -0.012, Z0 + PH + 0.06), 0.04, line)
strip("frame_r", (PW + 0.06, -0.012, Z0), (PW + 0.06, -0.012, Z0 + PH + 0.06), 0.04, line)
strip("frame_t", (-PW - 0.08, -0.012, Z0 + PH + 0.06), (PW + 0.08, -0.012, Z0 + PH + 0.06), 0.04, line)
# L'ogive : deux arcs d'or qui se rejoignent au-dessus du portail, comme une entrée de cathédrale
spring = Z0 + PH + 0.06
arch_r = 2 * (PW + 0.6)
for side in (-1, 1):
    cx = -side * (PW + 0.6)  # chaque arc a son centre sur le pied de l'autre
    pts = []
    for k in range(25):
        a = math.radians(60) * k / 24
        pts.append((cx + side * arch_r * math.cos(a), -0.015, spring + arch_r * math.sin(a)))
    arc_curve = bpy.data.curves.new(f"arch_{side}", "CURVE")
    arc_curve.dimensions = "3D"
    arc_curve.bevel_depth = 0.024
    arc_poly = arc_curve.splines.new("POLY")
    arc_poly.points.add(len(pts) - 1)
    for pt, p in zip(arc_poly.points, pts):
        pt.co = (*p, 1.0)
    arc_obj = bpy.data.objects.new(f"arch_{side}", arc_curve)
    scene.collection.objects.link(arc_obj)
    arc_obj.data.materials.append(line)

# Deux obélisques de lumière de part et d'autre de l'entrée
for side in (-1, 1):
    x = side * 5.2
    box(f"obelisk_{side}", (x - 0.35, -1.45, Z0), (x + 0.35, -0.75, Z0 + 8.6), obsidian, bevel=0.012)
    strip(f"obelisk_line_{side}", (x, -1.462, Z0 + 0.5), (x, -1.462, Z0 + 8.1), 0.06, line)

# ———————————————————————————————————————— Les portes : deux vantaux sur gonds, filets d'or, un V qui se fend

LEAF_T = 0.22
hinges = {}
for side in (-1, 1):
    h = hinge(f"hinge_{side}", (side * PW, Y_DOOR, Z0))
    hinges[side] = h
    inner = side * 0.01
    outer = side * PW
    lo_x, hi_x = sorted((inner, outer))
    box(f"leaf_{side}", (lo_x, Y_DOOR - LEAF_T / 2, Z0), (hi_x, Y_DOOR + LEAF_T / 2, Z0 + PH), obsidian, bevel=0.015, parent=h)
    face = Y_DOOR - LEAF_T / 2 - 0.006
    # Encadrement du vantail
    x_in, x_out = side * 0.32, side * (PW - 0.32)
    for k, (p0, p1) in enumerate(
        (
            ((x_in, face, Z0 + 0.32), (x_in, face, Z0 + PH - 0.32)),
            ((x_out, face, Z0 + 0.32), (x_out, face, Z0 + PH - 0.32)),
            ((x_in, face, Z0 + 0.32), (x_out, face, Z0 + 0.32)),
            ((x_in, face, Z0 + PH - 0.32), (x_out, face, Z0 + PH - 0.32)),
        )
    ):
        strip(f"panel_{side}_{k}", p0, p1, 0.022, line_soft, parent=h)
    # Pentures de bronze, comme sur une porte de château
    for zb in (Z0 + 1.6, Z0 + 5.4, Z0 + 9.2):
        lo_b, hi_b = sorted((side * 0.5, side * (PW - 0.5)))
        box(f"strap_{side}_{zb:.1f}", (lo_b, face - 0.05, zb), (hi_b, face, zb + 0.3), bronze, bevel=0.012, parent=h)
    # La moitié du V : du haut extérieur jusqu'à la fente, devant les pentures
    strip(f"v_{side}", (side * (PW - 0.75), face - 0.062, Z0 + PH - 1.3), (side * 0.03, face - 0.062, Z0 + 3.4), 0.045, line_hot, parent=h)
    # Poignée de bronze doré, haute et fine
    cylinder(f"handle_{side}", 0.035, 2.4, (side * 0.42, face - 0.12, Z0 + 2.9), gold_metal, parent=h)

# La fente : un cœur de lumière visible tant que les portes sont closes
seam_core = box("seam_core", (-0.004, Y_DOOR - 0.08, Z0 + 0.05), (0.004, Y_DOOR + 0.08, Z0 + PH - 0.05), line_hot)

# ———————————————————————————————————————— Dedans : la nef, le tapis rouge, les colonnes

HALL_X, HALL_END = 11.0, 64.0
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, (2.2 + HALL_END) / 2, Z0))
hall_floor = bpy.context.active_object
hall_floor.scale = (2 * HALL_X, HALL_END - 2.2, 1)
hall_floor.data.materials.append(marble)
box("hall_wall_l", (-HALL_X - 1, 2.2, 0), (-HALL_X, HALL_END, 26), castle_stone)
box("hall_wall_r", (HALL_X, 2.2, 0), (HALL_X + 1, HALL_END, 26), castle_stone)
box("hall_ceiling", (-HALL_X - 1, 2.2, 26), (HALL_X + 1, HALL_END + 1, 27), castle_stone)
box("far_wall", (-HALL_X - 1, HALL_END, 0), (HALL_X + 1, HALL_END + 1, 26), castle_stone)
# Au bout de la nef, une fente de lumière : l'écho de la porte
box("far_slit", (-0.5, HALL_END - 0.06, Z0 + 0.6), (0.5, HALL_END - 0.01, Z0 + 15.5), c.emission("far_light", GOLD_WHITE, 2.0))

CARPET_END = 47.6
box("carpet", (-1.6, 0.4, Z0), (1.6, CARPET_END, Z0 + 0.018), velvet)
for side in (-1, 1):
    strip(f"carpet_edge_{side}", (side * 1.66, 0.5, Z0 + 0.004), (side * 1.66, CARPET_END, Z0 + 0.004), 0.04, line_soft, normal=(0, 0, 1))

for y in range(6, 43, 6):
    for side in (-1, 1):
        x = side * 5.2
        box(f"column_{side}_{y}", (x - 0.55, y - 0.55, Z0), (x + 0.55, y + 0.55, Z0 + 16), obsidian, bevel=0.015)
        xf = x - side * 0.556
        strip(f"column_line_{side}_{y}", (xf, y, Z0 + 0.4), (xf, y, Z0 + 15.6), 0.06, line, normal=(-side, 0, 0))

# ———————————————————————————————————————— Le carré : l'estrade, la table d'honneur, le cordon de velours

for k, (w, d, z) in enumerate(((8.0, 6.2, 0.2), (6.4, 4.8, 0.4))):
    box(f"dais_{k}", (-w / 2, TABLE_Y - d / 2, Z0 + z - 0.2), (w / 2, TABLE_Y + d / 2, Z0 + z), obsidian, bevel=0.01)
    strip(f"dais_line_{k}", (-w / 2 + 0.1, TABLE_Y - d / 2 - 0.006, Z0 + z - 0.01), (w / 2 - 0.1, TABLE_Y - d / 2 - 0.006, Z0 + z - 0.01), 0.025, line)
TOP = Z0 + 0.4 + 0.74
box("table_top", (-1.5, TABLE_Y - 0.55, TOP), (1.5, TABLE_Y + 0.55, TOP + 0.07), obsidian, bevel=0.01)
strip("table_line", (-1.48, TABLE_Y - 0.556, TOP + 0.035), (1.48, TABLE_Y - 0.556, TOP + 0.035), 0.018, line)
for side in (-1, 1):
    box(f"table_leg_{side}", (side * 1.2 - 0.04, TABLE_Y - 0.42, Z0 + 0.4), (side * 1.2 + 0.04, TABLE_Y + 0.42, TOP), gold_metal)
# Champagne dans son seau d'or
bx, by = 0.55, TABLE_Y + 0.05
cylinder("bucket", 0.13, 0.26, (bx, by, TOP + 0.07 + 0.13), gold_metal)
cylinder("bottle", 0.048, 0.26, (bx, by, TOP + 0.07 + 0.22), black_glass)
sphere("bottle_shoulder", 0.048, (bx, by, TOP + 0.07 + 0.35), black_glass, scale=(1, 1, 0.75))
cylinder("bottle_neck", 0.017, 0.12, (bx, by, TOP + 0.07 + 0.43), black_glass)
cylinder("bottle_foil", 0.019, 0.09, (bx, by, TOP + 0.07 + 0.455), gold_metal)
# Le cordon : deux poteaux dorés et une corde de velours qui pend
ROPE_Y = 47.0
for side in (-1, 1):
    x = side * 1.9
    cylinder(f"post_base_{side}", 0.16, 0.03, (x, ROPE_Y, Z0 + 0.015), gold_metal)
    cylinder(f"post_{side}", 0.032, 0.95, (x, ROPE_Y, Z0 + 0.475), gold_metal)
    sphere(f"post_top_{side}", 0.055, (x, ROPE_Y, Z0 + 0.97), gold_metal)
rope_curve = bpy.data.curves.new("rope", "CURVE")
rope_curve.dimensions = "3D"
rope_curve.bevel_depth = 0.024
rope_curve.bevel_resolution = 4
spline = rope_curve.splines.new("BEZIER")
spline.bezier_points.add(2)
for bp, p in zip(spline.bezier_points, ((-1.86, ROPE_Y, Z0 + 0.9), (0, ROPE_Y, Z0 + 0.6), (1.86, ROPE_Y, Z0 + 0.9))):
    bp.co = p
    bp.handle_left_type = bp.handle_right_type = "AUTO"
rope = bpy.data.objects.new("rope", rope_curve)
scene.collection.objects.link(rope)
rope.data.materials.append(velvet)

# ———————————————————————————————————————— Lumières

door_light = c.light(
    "door_light", "AREA", (0, 2.8, Z0 + 5.6), (0, -10, Z0 + 4.0), 1500, GOLD_WHITE, size=6.2, size_y=10.6,
    spread=math.radians(70), glossy=False,
)
for y in (8, 16, 24, 32, 40):
    c.light(f"spot_{y}", "SPOT", (0, y, 25), (0, y, Z0), 4500, WARM, size=0.15, spot=(math.radians(16), 0.35))
c.light("spot_table", "SPOT", (0, TABLE_Y, 25), (0, TABLE_Y, Z0), 9000, WARM, size=0.12, spot=(math.radians(11), 0.3))
for y in (9, 21, 33, 45):
    for side in (-1, 1):
        c.light(f"red_{side}_{y}", "AREA", (side * 8.6, y, Z0 + 3), (side * 12, y, Z0 + 7), 650, BLOOD, size=4.0, size_y=2.0, glossy=False)
c.light("far_glow", "AREA", (0, HALL_END - 1.5, Z0 + 8), (0, 0, Z0 + 6), 600, GOLD_WHITE, size=2.0, size_y=14.0, glossy=False)
c.light("halo", "AREA", (0, 8, 37), (0, -12, 24), 2200, (1.0, 0.55, 0.2), size=22.0, size_y=6.0, glossy=False)
c.light("night_fill", "AREA", (-14, -22, 18), (0, 0, 8), 160, (1.0, 0.72, 0.48), size=8.0, glossy=False)
# Deux flambeaux devant les obélisques : la pierre se réchauffe et vacille
torches = [
    c.light(f"torch_{side}", "POINT", (side * 5.2, -2.1, Z0 + 6.2), (0, 0, 0), 420, (1.0, 0.48, 0.16), size=0.35)
    for side in (-1, 1)
]
# Image de fil : des projecteurs au pied de la façade la lèchent par en dessous, la pierre se révèle
if opts.get("uplights"):
    for x, z in ((-4.4, Z0), (4.4, Z0), (-9.6, 0.0), (9.6, 0.0), (-15.0, 0.0), (15.0, 0.0)):
        c.light(
            f"uplight_{x}", "SPOT", (x, -0.7, z + 0.08), (x, 1.2, z + 10.0), float(opts["uplights"]), (1.0, 0.6, 0.3),
            size=0.15, spot=(math.radians(36), 0.8),
        )
# Une lumière douce sur la table, pour que l'or du seau et le verre de la bouteille brillent
c.light("table_key", "AREA", (2.2, TABLE_Y - 3.2, TOP + 1.6), (0, TABLE_Y, TOP + 0.2), 140, WARM, size=1.6)

c.haze(
    (54, 100, 27), (0, 27, 13.5), float(opts.get("density", 0.0045)), noise_scale=0.25,
    noise_amount=float(opts.get("haze_noise", 0.6)), anisotropy=0.3,
)

# ———————————————————————————————————————— Plans


def smooth(t):
    return t * t * (3 - 2 * t)


def ease_in(t):
    return t**3


def ease_out(t):
    return 1 - (1 - t) ** 3


def lerp(a, b, t):
    return Vector(a).lerp(Vector(b), t)


def straight(p0, p1, t0, t1, easing=smooth, roll=0.0):
    """Un mouvement de caméra rectiligne : position et visée interpolées."""
    return lambda u: (lerp(p0, p1, easing(u)), lerp(t0, t1, easing(u)), roll)


def orbit(u):
    a = math.radians(-40 + 70 * smooth(u))
    r = 5.2 - 1.4 * smooth(u)
    pos = Vector((r * math.sin(a), TABLE_Y - r * math.cos(a), 3.4 - 0.6 * smooth(u)))
    return pos, Vector((0, TABLE_Y, TOP + 0.25)), 0.0


# Chaque plan : liste de segments (première frame, dernière frame, focale, mouvement, (f-stop, mise au point) ou None)
SHOTS = {
    "door_v": [(0, 0, 30.0, lambda u: ((0, Y_DOOR - 2.3, Z0 + 2.6), (0, Y_DOOR, Z0 + 3.0), 0.0), None)],
    "door_close": [(0, 0, 30.0, lambda u: ((0, Y_DOOR - 2.3, Z0 + 1.0), (0, Y_DOOR, Z0 + 1.0), 0.0), None)],
    "seam": [(0, 0, 30.0, lambda u: ((0, Y_DOOR - 0.86, Z0 + 1.0), (0, Y_DOOR, Z0 + 1.0), 0.0), None)],
    # Image de fil 4:5 : caméra de niveau, décentrement vers le haut (--shift_y) pour garder les verticales droites
    "feed": [(0, 0, 22.0, lambda u: ((0, -17, 2.0), (0, 0, 2.0), 0.0), None)],
    "approach": [(61, 180, 24.0, straight((0, -17, 0.55), (0, -4.6, 2.05), (0, 0, 7.4), (0, 0, 6.2)), None)],
    "open": [(181, 240, 24.0, straight((0, -4.6, 2.05), (0, 7.5, 2.3), (0, 6, 6.2), (0, 30, 3.2), easing=ease_in), None)],
    "nave": [(241, 300, 18.0, straight((0, 4, 1.75), (0, 23, 1.6), (0, 40, 3.2), (0, 60, 3.0), easing=ease_out), None)],
    "truck": [(301, 360, 30.0, straight((7.6, 9, 3.2), (7.6, 21, 3.2), (0, 12, 2.6), (0, 24, 2.6), easing=lambda t: t), None)],
    "crane": [(361, 420, 22.0, straight((0, 12, 1.6), (0, 6, 14), (0, 30, 3.5), (0, 40, 1.5)), None)],
    "cuts": [
        (421, 435, 18.0, straight((3.6, 17.2, 1.5), (3.75, 18.2, 1.7), (5.0, 18.4, 14), (5.0, 18.6, 14), easing=lambda t: t), None),
        (436, 450, 26.0, straight((0.3, 19, 15), (0.3, 22, 15), (0.3, 19.01, Z0), (0.3, 22.01, Z0), easing=lambda t: t), None),
        (451, 465, 20.0, straight((-1.3, 25, 1.5), (-1.3, 29.5, 1.5), (0.6, 50, 2.6), (0.6, 52, 2.6), easing=lambda t: t, roll=12.0), None),
        (466, 480, 28.0, straight((0, 30, 3.2), (0, 35.5, 3.2), (0, HALL_END, 7.5), (0, HALL_END, 7.5), easing=lambda t: t), None),
    ],
    "carre": [(481, 660, 35.0, orbit, (2.8, None))],
    "relance": [
        (661, 675, 24.0, straight((0, 30, 2.0), (0, 38.5, 2.1), (0, TABLE_Y, 2.6), (0, TABLE_Y, 2.6), easing=lambda t: t), None),
        (676, 690, 22.0, straight((0, 9.5, 1.6), (0, 7.8, 1.9), (0, 0, 7.0), (0, 0, 7.0), easing=lambda t: t), None),
        (691, 705, 28.0, straight((0, 45.5, 9.0), (0, 47.5, 7.2), (0, TABLE_Y, 2.4), (0, TABLE_Y, 2.4), easing=lambda t: t), None),
        (706, 720, 24.0, straight((0, 44, 3.0), (0, 58.5, 4.0), (0, HALL_END, 8.0), (0, HALL_END, 8.0), easing=ease_in), None),
    ],
}


def doors(f):
    """Angle d'ouverture (degrés) et puissance de la lumière derrière les portes, à la frame vidéo f."""
    if f < 181:
        return 0.0, 1500.0
    if f <= 240:
        u = (f - 181) / 59
        return 82.0 * smooth(min(1.0, max(0.0, (u - 0.05) / 0.65))), 1500.0 + 20500.0 * smooth(min(1.0, u / 0.7))
    return 82.0, 3500.0  # dans la nef : une lueur d'entrée, sans écraser le tapis


cam = c.camera((0, -10, 2), (0, 0, 4), lens=24.0)


def update(f):
    for seg_start, seg_end, lens, move, dof in SHOTS[opts["shot"]]:
        if seg_start <= f <= seg_end:
            break
    u = 0.0 if seg_end == seg_start else (f - seg_start) / (seg_end - seg_start)
    pos, target, roll = move(u)
    cam.location = Vector(pos)
    c.look_at(cam, target)
    if roll:  # around the view axis (the camera's local Z)
        cam.rotation_euler = (cam.rotation_euler.to_matrix() @ Matrix.Rotation(math.radians(roll), 3, "Z")).to_euler()
    cam.data.lens = lens
    cam.data.dof.use_dof = dof is not None
    if dof:
        cam.data.dof.aperture_fstop = dof[0]
        cam.data.dof.focus_distance = dof[1] or (Vector(target) - Vector(pos)).length
    angle, energy = doors(f)
    hinges[-1].rotation_euler.z = math.radians(angle)
    hinges[1].rotation_euler.z = -math.radians(angle)
    seam_core.hide_render = angle > 0.3
    door_light.data.energy = energy
    for k, torch in enumerate(torches):  # vacillement déterministe, différent pour chaque flambeau
        flicker = 0.5 * math.sin(f * 0.9 + k * 2.1) + 0.3 * math.sin(f * 2.3 + k) + 0.2 * math.sin(f * 5.1 + 3 * k)
        torch.data.energy = 420 * (1 + 0.18 * flicker)


shot_frames = [f for seg in SHOTS[opts["shot"]] for f in range(seg[0], seg[1] + 1)]
c.render_setup(
    scene,
    opts.get("out", ""),
    samples=int(opts.get("samples", 64)),
    pct=int(opts.get("pct", 100)),
    width=int(opts.get("width", 1080)),
    height=int(opts.get("height", 1920)),
    **c.view_opts(opts),
)
cam.data.shift_y = float(opts.get("shift_y", 0.0))
if opts.get("engine") == "eevee":
    c.eevee_setup(scene, samples=int(opts.get("samples", 64)))
t0 = time.time()
if opts.get("out-dir"):
    frames = shot_frames if not opts.get("only") else [int(x) for x in str(opts["only"]).split(",")]
    c.render_sequence(scene, opts["out-dir"], frames, update)
    print(f"RENDER_OK {opts['shot']} {len(frames)} frames {time.time() - t0:.1f}s")
else:
    update(int(opts.get("frame", shot_frames[len(shot_frames) // 2])))
    c.render(scene)
    print(f"RENDER_OK {opts['out']} {time.time() - t0:.1f}s")
