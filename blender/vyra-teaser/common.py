"""Shared setup for the VYRA teaser shapes (Blender 5.1, Cycles on the GPU).

Each shape script runs headless:
    blender -b --factory-startup --python <script>.py -- --out <png> [--samples 128] [--pct 100]
"""

import math
import os
import sys

import bpy
from mathutils import Vector

# Blender's bundled HDRIs (CC0, Poly Haven): city, courtyard, forest, interior, night, studio, sunrise, sunset
STUDIOLIGHTS = os.path.join(
    os.path.dirname(bpy.app.binary_path), f"{bpy.app.version[0]}.{bpy.app.version[1]}", "datafiles", "studiolights", "world"
)


def args():
    """`-- --out x.png --samples 64` → {"out": "x.png", "samples": "64"}; bare flags → True."""
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    opts, key = {}, None
    for a in argv:
        if a.startswith("--"):
            key = a[2:]
            opts[key] = True
        elif key:
            opts[key] = a
            key = None
    return opts


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def eevee_setup(scene, samples=64):
    """EEVEE : reflets en lancer de rayons écran, brume volumétrique avec ombres. Bien plus rapide que Cycles."""
    scene.render.engine = next(e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items if "EEVEE" in e.identifier)
    ee = scene.eevee
    for k, v in (
        ("taa_render_samples", samples),
        ("use_raytracing", True),
        ("ray_tracing_method", "SCREEN"),
        ("use_shadows", True),
        ("volumetric_tile_size", "2"),
        ("volumetric_samples", 96),
        ("use_volumetric_shadows", True),
        ("volumetric_end", 140.0),
    ):
        try:
            setattr(ee, k, v)
        except (AttributeError, TypeError):
            pass


def render_setup(scene, out, samples=128, pct=100, width=1080, height=1920, view="AgX", looks=None, exposure=0.0):
    scene.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "OPTIX"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == "OPTIX"
    cy = scene.cycles
    cy.device = "GPU"
    cy.samples = samples
    cy.use_denoising = True
    cy.denoiser = "OPTIX"
    for k, v in (("max_bounces", 8), ("glossy_bounces", 6), ("volume_bounces", 0)):
        try:
            setattr(cy, k, v)
        except (AttributeError, TypeError):
            pass
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.render.resolution_percentage = pct
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = out
    vs = scene.view_settings
    vs.view_transform = view
    vs.exposure = exposure
    for look in looks or ("AgX - High Contrast", "High Contrast"):
        try:
            vs.look = look
            break
        except TypeError:
            continue


def _nodes(owner):
    try:
        owner.use_nodes = True
    except AttributeError:
        pass
    return owner.node_tree


def world(color=(0.0, 0.0, 0.0), strength=1.0, hdri=None, hdri_strength=1.0, hdri_rot=0.0):
    """Flat background; with `hdri`, glossy rays (reflections) see the HDRI and nothing else does."""
    w = bpy.data.worlds.new("world")
    bpy.context.scene.world = w
    nt = _nodes(w)
    bg = nt.nodes["Background"]
    bg.inputs["Color"].default_value = (*color, 1.0)
    bg.inputs["Strength"].default_value = strength
    if hdri:
        out = next(n for n in nt.nodes if n.type == "OUTPUT_WORLD")
        coord = nt.nodes.new("ShaderNodeTexCoord")
        mapping = nt.nodes.new("ShaderNodeMapping")
        mapping.inputs["Rotation"].default_value[2] = math.radians(hdri_rot)
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(os.path.join(STUDIOLIGHTS, f"{hdri}.exr"))
        refl = nt.nodes.new("ShaderNodeBackground")
        refl.inputs["Strength"].default_value = hdri_strength
        path = nt.nodes.new("ShaderNodeLightPath")
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(coord.outputs["Generated"], mapping.inputs["Vector"])
        nt.links.new(mapping.outputs["Vector"], env.inputs["Vector"])
        nt.links.new(env.outputs["Color"], refl.inputs["Color"])
        nt.links.new(path.outputs["Is Glossy Ray"], mix.inputs["Fac"])
        nt.links.new(bg.outputs["Background"], mix.inputs[1])
        nt.links.new(refl.outputs["Background"], mix.inputs[2])
        nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return w


def principled(name, base, metallic=0.0, roughness=0.3, **inputs):
    mat = bpy.data.materials.new(name)
    nt = _nodes(mat)
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    for k, v in inputs.items():
        bsdf.inputs[k].default_value = v
    return mat, bsdf


def _bare(name):
    """Material with only its output node."""
    mat = bpy.data.materials.new(name)
    nt = _nodes(mat)
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    return mat, nt, next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")


def emission(name, color, strength):
    mat, nt, out = _bare(name)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1.0)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def view_opts(opts):
    """--view "Khronos PBR Neutral" --look Punchy --exposure -0.5 on any shape script."""
    looks = None
    if opts.get("look"):
        looks = (f"{opts['view']} - {opts['look']}" if opts.get("view") else f"AgX - {opts['look']}", opts["look"])
    return {"view": opts.get("view", "AgX"), "looks": looks, "exposure": float(opts.get("exposure", 0.0))}


def haze(size, center, density, noise_scale=0.35, noise_amount=0.8, anisotropy=0.45):
    """Smoke box: Principled Volume, wispy when noise_amount > 0 (world-space noise)."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    box = bpy.context.active_object
    box.name = "haze"
    box.scale = size
    mat, nt, out = _bare("haze")
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Anisotropy"].default_value = anisotropy
    if noise_amount > 0:
        geo = nt.nodes.new("ShaderNodeNewGeometry")
        tex = nt.nodes.new("ShaderNodeTexNoise")
        tex.inputs["Scale"].default_value = noise_scale
        tex.inputs["Detail"].default_value = 4.0
        rng = nt.nodes.new("ShaderNodeMapRange")
        rng.inputs["From Min"].default_value = 0.35
        rng.inputs["From Max"].default_value = 0.75
        rng.inputs["To Min"].default_value = density * (1 - noise_amount)
        rng.inputs["To Max"].default_value = density * (1 + noise_amount)
        nt.links.new(geo.outputs["Position"], tex.inputs["Vector"])
        nt.links.new(tex.outputs["Fac"], rng.inputs["Value"])
        nt.links.new(rng.outputs["Result"], vol.inputs["Density"])
    else:
        vol.inputs["Density"].default_value = density
    nt.links.new(vol.outputs["Volume"], out.inputs["Volume"])
    box.data.materials.append(mat)
    return box


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens=35.0, fstop=None, focus=None):
    data = bpy.data.cameras.new("cam")
    data.lens = lens
    cam = bpy.data.objects.new("cam", data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = loc
    look_at(cam, target)
    if fstop:
        data.dof.use_dof = True
        data.dof.aperture_fstop = fstop
        data.dof.focus_distance = focus or (Vector(target) - Vector(loc)).length
    bpy.context.scene.camera = cam
    return cam


def light(
    name, kind, loc, target, energy, color=(1.0, 1.0, 1.0), size=1.0, size_y=None, spread=None, spot=None, glossy=True
):
    """Never seen by the camera; `glossy=False` also keeps it out of reflections (wet floors)."""
    data = bpy.data.lights.new(name, kind)
    data.energy = energy
    data.color = color
    if kind == "AREA":
        if size_y is not None:
            data.shape = "RECTANGLE"
            data.size, data.size_y = size, size_y
        else:
            data.size = size
        if spread is not None:
            data.spread = spread
    elif kind in ("POINT", "SPOT"):
        data.shadow_soft_size = size
        if kind == "SPOT" and spot:
            data.spot_size, data.spot_blend = spot
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = loc
    obj.visible_camera = False
    obj.visible_glossy = glossy
    look_at(obj, target)
    return obj


def render(scene):
    bpy.ops.render.render(write_still=True)
    return scene.render.filepath


def frames_to_render(opts, count):
    """All frames, or only the ones listed by --only 0,60,119 (previews)."""
    return [int(x) for x in str(opts["only"]).split(",")] if opts.get("only") else range(count)


def render_sequence(scene, out_dir, indices, update, quality=92, persistent=True):
    """Renders frames as out_dir/0000.jpg…; `update(i)` moves the scene before each one."""
    os.makedirs(out_dir, exist_ok=True)
    settings = scene.render
    settings.image_settings.file_format = "JPEG"
    settings.image_settings.quality = quality
    settings.use_persistent_data = persistent
    for i in indices:
        update(i)
        settings.filepath = os.path.join(out_dir, f"{i:04d}.jpg")
        bpy.ops.render.render(write_still=True)
