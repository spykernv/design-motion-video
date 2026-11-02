#!/usr/bin/env node
// Contrôle d'un rendu du studio, sans dépendance : une planche de frames à ouvrir avec Read, et la mesure du son.
//
//   node controle.mjs planche <vidéo> <frames> [--cols 5] [--largeur 320] [-o sortie.png]
//       <frames> : numéros séparés par des virgules (0,75,181) ou auto:N (N frames réparties sur la durée)
//   node controle.mjs son <vidéo ou audio>
//
// Demande ffmpeg et ffprobe dans le PATH : celui que Remotion embarque n'a pas les filtres select, tile ni ebur128.
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';

const USAGE = `Usage :
  node controle.mjs planche <vidéo> <frames> [--cols 5] [--largeur 320] [-o sortie.png]
      <frames> : 0,75,181 ou auto:12
  node controle.mjs son <vidéo ou audio>`;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const run = (command, args) => {
  const result = spawnSync(command, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  if (result.error?.code === 'ENOENT') fail(`${command} introuvable : installer ffmpeg et l'ajouter au PATH.`);
  if (result.error) throw result.error;
  return result;
};

const decimal = (value, digits) => value.toFixed(digits).replace('.', ',');

function parse(argv) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--cols' || arg === '--largeur') {
      const value = Number(argv[++i]);
      if (!Number.isInteger(value) || value < 1) fail(`${arg} attend un entier positif.`);
      options[arg.slice(2)] = value;
    } else if (arg === '-o') {
      options.o = argv[++i];
    } else {
      positional.push(arg);
    }
  }
  return {positional, options};
}

function probe(video) {
  const result = run('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-count_packets',
    '-show_entries', 'stream=width,height,r_frame_rate,nb_read_packets:format=duration',
    '-of', 'json',
    video,
  ]);
  if (result.status !== 0) fail(result.stderr.trim() || `ffprobe ne lit pas ${video}`);
  const {streams, format} = JSON.parse(result.stdout);
  const stream = streams?.[0];
  if (!stream) fail(`${video} n'a pas de piste vidéo.`);
  const [num, den] = stream.r_frame_rate.split('/').map(Number);
  const fps = num / (den || 1);
  const frames = Number(stream.nb_read_packets) || Math.round(Number(format.duration) * fps);
  return {width: stream.width, height: stream.height, fps, frames};
}

function planche(video, spec, options) {
  if (!video || !spec) fail(USAGE);
  if (!existsSync(video)) fail(`Fichier introuvable : ${video}`);
  const info = probe(video);

  let frames;
  const auto = /^auto(?::(\d+))?$/.exec(spec);
  if (auto) {
    const count = Math.max(1, Math.min(Number(auto[1] ?? 12), info.frames));
    frames = Array.from({length: count}, (_, i) => Math.round((i * (info.frames - 1)) / Math.max(count - 1, 1)));
  } else {
    const tokens = spec.split(',').map((s) => s.trim()).filter(Boolean);
    const outside = tokens.filter((t) => !/^\d+$/.test(t) || Number(t) >= info.frames);
    if (outside.length) fail(`Frames hors de la vidéo (de 0 à ${info.frames - 1}) : ${outside.join(', ')}`);
    frames = tokens.map(Number);
  }
  // ffmpeg sort les frames dans l'ordre de la vidéo : on trie et on retire les doublons pour que la liste suive.
  frames = [...new Set(frames)].sort((a, b) => a - b);

  const cols = Math.min(options.cols ?? 5, frames.length);
  const rows = Math.ceil(frames.length / cols);
  const width = options.largeur ?? 320;
  const output = options.o ?? path.join(path.dirname(video), `${path.parse(video).name}-planche.png`);
  const select = frames.map((f) => `eq(n\\,${f})`).join('+');
  const filter = `select='${select}',scale=${width}:-2,tile=${cols}x${rows}:padding=6:color=white`;
  const result = run('ffmpeg', ['-v', 'error', '-y', '-i', video, '-vf', filter, '-fps_mode', 'vfr', '-frames:v', '1', output]);
  if (result.status !== 0) fail(result.stderr.trim() || 'ffmpeg a échoué.');

  console.log(`Planche : ${output}`);
  console.log(`${info.width}×${info.height}, ${decimal(info.fps, 2)} fps, ${info.frames} frames.`);
  console.log('Cases de gauche à droite, puis de haut en bas :');
  frames.forEach((f, i) => console.log(`  ${i + 1}. f${f} (${decimal(f / info.fps, 2)} s)`));
}

function son(file) {
  if (!file) fail(USAGE);
  if (!existsSync(file)) fail(`Fichier introuvable : ${file}`);
  const result = run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const log = result.stderr;
  if (result.status !== 0) {
    fail(/matches no streams/.test(log) ? `${file} n'a pas de piste audio.` : log.trim() || 'ffmpeg a échoué.');
  }
  const summary = log.slice(log.lastIndexOf('Summary:'));
  const read = (pattern) => summary.match(pattern)?.[1];
  const integrated = read(/I:\s+(-?[\d.]+|-inf) LUFS/);
  const range = read(/LRA:\s+(-?[\d.]+) LU\b/);
  const peak = read(/Peak:\s+(-?[\d.]+|-inf) dBFS/);
  if (!integrated || !peak) fail('Mesure introuvable dans la sortie de ffmpeg.');

  const loudness = Number(integrated);
  const truePeak = Number(peak);
  const show = (value) => value.replace('.', ',');
  console.log(`Sonie intégrée : ${show(integrated)} LUFS (cible −14, à 1 près)${Math.abs(loudness + 14) <= 1 ? '' : '  <- hors cible'}`);
  console.log(`Crête vraie : ${show(peak)} dBTP (cible −1 au plus)${truePeak <= -1 ? '' : '  <- trop haute'}`);
  console.log(`Plage de sonie : ${range ? show(range) : '?'} LU`);
}

const [command, ...rest] = process.argv.slice(2);
const {positional, options} = parse(rest);
if (command === 'planche') planche(positional[0], positional[1], options);
else if (command === 'son') son(positional[0]);
else fail(USAGE);
