"""Analyse de la musique du teaser : tempo, temps, drop, enveloppes par frame vidéo.

Lancé avec le Python du venv video-use (librosa) :
    python analyse.py <music.mp3> <timing.json>

timing.json sert à Remotion (coupes calées sur les temps) et à Blender (épines pilotées par la basse).
"""

import json
import sys

import librosa
import numpy as np

FPS = 30
SR = 22050
HOP = SR // FPS  # une colonne de spectre = une frame vidéo

src, out = sys.argv[1], sys.argv[2]
y, _ = librosa.load(src, sr=SR, mono=True)
duration = len(y) / SR
frames = int(round(duration * FPS))

tempo, beat_frames = librosa.beat.beat_track(y=y, sr=SR, hop_length=HOP, start_bpm=120, tightness=200)
bpm = float(np.atleast_1d(tempo)[0])

spec = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))[:, :frames]
freqs = librosa.fft_frequencies(sr=SR, n_fft=2048)


def band(lo, hi):
    return spec[(freqs >= lo) & (freqs < hi)].sum(axis=0)


def envelope(x, release_s):
    """0..1, attaque immédiate, relâchement exponentiel : de quoi faire pulser une forme."""
    x = x / (np.percentile(x, 98) + 1e-9)
    x = np.clip(x, 0, 1)
    out_env = np.zeros_like(x)
    k = np.exp(-1.0 / (release_s * FPS))
    for i, v in enumerate(x):
        out_env[i] = max(v, (out_env[i - 1] if i else 0) * k)
    return out_env


bass = band(25, 140)
full = spec.sum(axis=0)
onset = librosa.onset.onset_strength(S=librosa.amplitude_to_db(spec, ref=np.max), sr=SR)[:frames]

# Drop : la plus forte montée d'énergie (2 s après / 2 s avant), entre 4 s et la fin moins 6 s
w = 2 * FPS
ratios = [(full[i : i + w].mean() + 1e-9) / (full[i - w : i].mean() + 1e-9) for i in range(4 * FPS, frames - 6 * FPS)]
drop = int(np.argmax(ratios)) + 4 * FPS
beats = [int(b) for b in beat_frames if b < frames]
if beats:
    nearest = min(beats, key=lambda b: abs(b - drop))
    if abs(nearest - drop) <= 6:
        drop = nearest

# Dernier gros impact : l'onset le plus fort après 20 s
late = onset[20 * FPS :]
final_hit = int(np.argmax(late)) + 20 * FPS if len(late) else frames - FPS

rms_per_second = [round(float(full[s * FPS : (s + 1) * FPS].mean() / (full.max() + 1e-9)), 3) for s in range(int(duration))]
timing = {
    "fps": FPS,
    "duration": round(duration, 3),
    "frames": frames,
    "bpm": round(bpm, 2),
    "beats": beats,
    "drop": drop,
    "finalHit": final_hit,
    "bass": [round(float(v), 4) for v in envelope(bass, 0.18)],
    "energy": [round(float(v), 4) for v in envelope(full, 0.35)],
    "rmsPerSecond": rms_per_second,
}
with open(out, "w", encoding="utf-8") as f:
    json.dump(timing, f)

print(f"bpm {bpm:.2f} | {len(beats)} temps | premiers temps {beats[:8]}")
print(f"drop f{drop} ({drop / FPS:.2f} s) | impact final f{final_hit} ({final_hit / FPS:.2f} s) | durée {duration:.2f} s")
print("énergie par seconde:", " ".join(f"{s}:{v}" for s, v in enumerate(rms_per_second)))
