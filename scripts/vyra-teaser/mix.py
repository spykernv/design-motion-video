"""Mixage du teaser VYRA « La Porte » : musique + bruitages ElevenLabs → public/vyra-teaser/audio/mix.wav.

    python mix.py

- Avant le drop, la musique passe « derrière la porte » : passe-bas à 420 Hz, qui s'ouvre pendant la montée
  (6,0 → 7,95 s), puis 3 frames de silence et le drop en pleine bande.
- Les bruitages sont posés à la frame près (30 fps), sur les coupes de VyraTeaser.tsx.
- Normalisation finale en deux passes : −14 LUFS intégrés, crête vraie −1 dBTP.
"""

import json
import os
import re
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SRC = os.path.join(ROOT, "public", "vyra-teaser", "audio", "src")
OUT = os.path.join(ROOT, "public", "vyra-teaser", "audio", "mix.wav")
PREMIX = os.path.join(ROOT, "out", "vyra-teaser", "wip", "premix.wav")
FPS = 30


def at(frame):
    return frame / FPS


with open(os.path.join(ROOT, "src", "compositions", "VyraTeaser", "timing.json"), encoding="utf-8") as f:
    timing = json.load(f)
DROP = at(timing["drop"])  # 8,03 s
FINAL = at(721)  # le dernier impact de la musique, le logo

# (fichier, départ en secondes, gain en dB[, durée max en secondes, avec fondu de sortie])
CUES = [
    ("heartbeat.mp3", at(1), -2),
    ("heartbeat.mp3", at(121), -3),
    ("crowd.mp3", 0.0, -13),
    ("lock.mp3", at(181), -4),
    ("doors.mp3", at(184), -3, DROP - at(184) - 0.1),  # les portes du château s'ouvrent, et se taisent au drop
    ("riser.mp3", DROP - 2.48, -7),
    ("suck.mp3", DROP - 1.0, -4),
    ("impact.mp3", DROP, -1),
    ("whoosh.mp3", at(421) - 0.15, -10),
    ("whoosh.mp3", at(451) - 0.15, -11),
    ("whoosh.mp3", at(661) - 0.15, -10),
    ("whoosh.mp3", at(691) - 0.15, -11),
    ("boom.mp3", FINAL, -2),
    ("whisper.mp3", 25.4, 3),
]

# Le passe-bas s'ouvre pendant la montée de la musique : 420 Hz → 7 kHz, exponentiel, par pas de 50 ms
steps = []
t, t_end = 6.0, DROP - 0.08
while t <= t_end:
    u = (t - 6.0) / (t_end - 6.0)
    steps.append(f"{t:.3f} lowpass@door frequency {420 * (7000 / 420) ** u:.0f}")
    t += 0.05
door = (
    f"asendcmd=c='{';'.join(steps)}',"
    f"lowpass@door=f=420:p=2:enable='lt(t,{DROP:.3f})',"
    f"volume=0:enable='between(t,{DROP - 0.1:.3f},{DROP - 0.001:.3f})'"
)

inputs = ["-i", os.path.join(SRC, "music.mp3")]
chains = [f"[0:a]aresample=48000,aformat=channel_layouts=stereo,{door}[m]"]
labels = ["[m]"]
for i, (name, start, gain, *rest) in enumerate(CUES, start=1):
    inputs += ["-i", os.path.join(SRC, name)]
    ms = int(round(start * 1000))
    cut = f"atrim=0:{rest[0]:.3f},afade=t=out:st={max(0.0, rest[0] - 0.35):.3f}:d=0.35," if rest else ""
    chains.append(
        f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,{cut}volume={gain}dB,adelay=delays={ms}:all=1[c{i}]"
    )
    labels.append(f"[c{i}]")
graph = ";".join(chains) + ";" + "".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,"
graph += "alimiter=limit=0.89:attack=4:release=60:level=disabled"

os.makedirs(os.path.dirname(PREMIX), exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-c:a", "pcm_s24le", PREMIX], check=True)

# Deux passes loudnorm : on mesure, puis on applique linéairement
LN = "loudnorm=I=-14:TP=-1:LRA=11"
probe = subprocess.run(
    ["ffmpeg", "-hide_banner", "-i", PREMIX, "-af", f"{LN}:print_format=json", "-f", "null", "-"],
    capture_output=True,
    text=True,
    check=True,
).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", probe, re.S).group(0))
apply = (
    f"{LN}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
    f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
)
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-i", PREMIX, "-af", f"{apply},aresample=48000", "-c:a", "pcm_s16le", OUT], check=True
)
print(f"premix: {m['input_i']} LUFS, crete {m['input_tp']} dBTP -> {OUT}")
