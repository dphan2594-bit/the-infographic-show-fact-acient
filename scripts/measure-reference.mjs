#!/usr/bin/env node
// Measures a reference video against the same benchmarks scripts/check-pacing.mjs
// applies to our own scenes, so a style can be copied from what a channel
// actually does rather than from what a blog says it does.
//
// The playbook's pacing numbers come from agencies and MCN guides, not from the
// channels themselves — this reads them off the footage.
//
//   node scripts/measure-reference.mjs <video.mp4>

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const run = promisify(execFile);

// ffmpeg's scene score is the fraction of the frame that changed. A hard cut
// scores high; a camera push scores low however far it travels.
const CUT_THRESHOLD = 0.28;

const probe = async (file) => {
  const { stdout } = await run("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,avg_frame_rate,nb_frames:format=duration",
    "-of", "json", file,
  ]);
  const { streams, format } = JSON.parse(stdout);
  const [num, den] = streams[0].avg_frame_rate.split("/").map(Number);
  return {
    width: streams[0].width,
    height: streams[0].height,
    fps: num / den,
    duration: Number(format.duration),
  };
};

const cuts = async (file) => {
  const { stderr } = await run("ffmpeg", [
    "-i", file, "-filter:v", `select='gt(scene,${CUT_THRESHOLD})',showinfo`,
    "-f", "null", "-",
  ], { maxBuffer: 64 * 1024 * 1024 });
  return [...stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]));
};

/** Counts how often the picture becomes substantially different from the last
 *  one that counted, rather than how often it hard-cuts.
 *
 *  Cut detection is the wrong instrument for this style: a Kurzgesagt piece
 *  changes what is on screen by animating elements in and out and by moving
 *  the camera, so 38 seconds of it registered four cuts while showing a dozen
 *  different pictures. Read the threshold sweep, not any single number — the
 *  absolute value is arbitrary, the comparison between two videos is not.
 *
 *  What it cannot tell you: whether the change carried new information. A
 *  camera pan over a still scores the same as a redrawn subject. Use it to
 *  disprove "the frame is static", never to prove "the content is rich". */
const motion = async (file, fps) => {
  const dir = await mkdtemp(path.join(tmpdir(), "ref-"));
  try {
    await run("ffmpeg", ["-i", file, "-vf", "fps=6,scale=64:36", "-pix_fmt", "gray",
      path.join(dir, "f%05d.pgm")]);
    const files = (await readdir(dir)).sort();
    const pixels = [];
    for (const name of files) {
      const buf = await readFile(path.join(dir, name));
      // P5 header: magic, width height, maxval — then binary
      let offset = 0, fields = 0;
      while (fields < 3 && offset < buf.length) {
        while (buf[offset] === 32 || buf[offset] === 10) offset += 1;
        while (offset < buf.length && buf[offset] !== 32 && buf[offset] !== 10) offset += 1;
        fields += 1;
      }
      pixels.push(buf.subarray(offset + 1));
    }
    const deltas = [];
    for (let i = 1; i < pixels.length; i += 1) {
      let sum = 0;
      const a = pixels[i - 1], b = pixels[i];
      const n = Math.min(a.length, b.length);
      for (let p = 0; p < n; p += 1) sum += Math.abs(a[p] - b[p]);
      deltas.push(sum / n);
    }
    return deltas;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

const [file] = process.argv.slice(2);
if (!file) { console.error("usage: node scripts/measure-reference.mjs <video>"); process.exit(1); }

const meta = await probe(file);
const at = await cuts(file);
const deltas = await motion(file, meta.fps);

const shots = [];
let previous = 0;
for (const t of [...at, meta.duration]) { shots.push(t - previous); previous = t; }

const sorted = [...shots].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
const mean = shots.reduce((a, b) => a + b, 0) / shots.length;
const still = deltas.filter((d) => d < 1).length / deltas.length;

console.log(`${path.basename(file)}  ${meta.width}x${meta.height}  ${meta.fps.toFixed(2)}fps  ${meta.duration.toFixed(1)}s\n`);
console.log(`shots            ${shots.length}`);
console.log(`cuts per minute  ${(shots.length / meta.duration * 60).toFixed(1)}   (benchmark 3–5)`);
console.log(`seconds per shot median ${median.toFixed(1)}  mean ${mean.toFixed(1)}   (benchmark 12–20)`);
console.log(`shortest / longest      ${sorted[0].toFixed(1)}s / ${sorted[sorted.length - 1].toFixed(1)}s`);
console.log(`frames with no movement ${(still * 100).toFixed(0)}%   (a held still reads as a slide)`);
console.log(`\nshot lengths: ${shots.map((s) => s.toFixed(1)).join("  ")}`);
