#!/usr/bin/env node
// Measures a scene file against the pacing and typography benchmarks in
// docs/SKILL-FLAT-EXPLAINER.md, so the numbers are checked rather than
// eyeballed. Reads a props JSON (the same file `remotion render --props`
// takes).
//
//   node scripts/check-pacing.mjs content/si-nong-02-07.json

import { readFile } from "node:fs/promises";

const FPS = 30;
// A new beat within this many frames of the last one is the same visual
// change — several overlays starting together are one moment, not three.
const BEAT_CLUSTER_FRAMES = 12;

const RULES = {
  // How often a new *illustration* arrives. Beats inside one image are a
  // finer rhythm and are not what this benchmark caps.
  imageChangesPerMinute: [3, 5],
  secondsPerImage: [12, 20],
  // A scene that sits on one picture with almost nothing happening reads as a
  // slideshow, however long the picture is held.
  minBeatsPerMinute: 6,
  openingSecondsPerBeat: [10, 20], // tighter for the first 30 seconds
  minTextSeconds: 0.5,
  maxFlashHz: 3,
  maxColours: 6,
  patternInterruptSeconds: 240,
};

const COLOUR = /^#[0-9a-fA-F]{3,8}$/;

const collectColours = (scene) => {
  const found = new Set();
  const walk = (value) => {
    if (typeof value === "string" && COLOUR.test(value)) found.add(value.toUpperCase());
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(scene.overlays ?? []);
  return found;
};

const beatStarts = (scene) => {
  const starts = [...new Set((scene.overlays ?? []).map((o) => o.startFrame ?? 0))].sort(
    (a, b) => a - b,
  );
  const beats = [];
  for (const start of starts) {
    if (beats.length === 0 || start - beats[beats.length - 1] > BEAT_CLUSTER_FRAMES) {
      beats.push(start);
    }
  }
  return beats;
};

const check = (scenes) => {
  const problems = [];
  const note = (scene, text) => problems.push(`${scene.id}: ${text}`);
  let elapsed = 0;

  for (const scene of scenes) {
    const seconds = scene.durationInFrames / FPS;
    const beats = beatStarts(scene);
    const perMinute = (beats.length / seconds) * 60;

    console.log(
      `${scene.id.padEnd(34)} ${seconds.toFixed(1)}s  ${String(beats.length).padStart(2)} beats  ` +
        `${perMinute.toFixed(1)}/min  ${(seconds / beats.length).toFixed(1)}s each`,
    );

    if (perMinute < RULES.minBeatsPerMinute) {
      note(scene, `only ${perMinute.toFixed(1)} beats/min inside the picture — it will read as a slide`);
    }
    const [, holdMax] = RULES.secondsPerImage;
    if (seconds > holdMax) {
      note(scene, `holds one illustration ${seconds.toFixed(0)}s — the benchmark is ${RULES.secondsPerImage[0]}–${holdMax}s`);
    }

    // the first 30 seconds of the whole piece have to move faster
    if (elapsed < 30) {
      const opening = beats.filter((b) => (elapsed + b / FPS) < 30);
      if (opening.length > 1) {
        const gap = 30 / opening.length;
        if (gap > RULES.openingSecondsPerBeat[1]) {
          note(scene, `opening holds ${gap.toFixed(1)}s per beat — the first 30s wants 10–20s`);
        }
      }
    }

    for (const overlay of scene.overlays ?? []) {
      if (overlay.type === "bigText" || overlay.type === "caption") {
        const end = overlay.endFrame ?? scene.durationInFrames;
        const held = (end - (overlay.startFrame ?? 0)) / FPS;
        if (held < RULES.minTextSeconds) {
          note(scene, `"${(overlay.text ?? "").split("\n")[0]}" holds ${held.toFixed(2)}s — under ${RULES.minTextSeconds}s`);
        }
      }
    }

    const flashes = (scene.overlays ?? [])
      .filter((o) => o.type === "flash")
      .map((o) => (o.startFrame ?? 0) + (o.atFrame ?? 0))
      .sort((a, b) => a - b);
    for (let i = 1; i < flashes.length; i += 1) {
      const hz = FPS / (flashes[i] - flashes[i - 1]);
      if (hz > RULES.maxFlashHz) note(scene, `two flashes ${hz.toFixed(1)}Hz apart — over the ${RULES.maxFlashHz}Hz limit`);
    }

    const colours = collectColours(scene);
    if (colours.size > RULES.maxColours) {
      note(scene, `${colours.size} colours (${[...colours].join(" ")}) — the cap is ${RULES.maxColours}`);
    }

    elapsed += seconds;
  }

  const total = elapsed;
  const perMinute = (scenes.length / total) * 60;
  console.log(`\ntotal ${Math.floor(total / 60)}m ${(total % 60).toFixed(0)}s`);
  console.log(
    `${scenes.length} illustrations = ${perMinute.toFixed(1)} image changes/min ` +
      `(benchmark ${RULES.imageChangesPerMinute.join("–")})`,
  );
  if (perMinute < RULES.imageChangesPerMinute[0]) {
    problems.push(
      `whole piece: ${perMinute.toFixed(1)} image changes/min — under the ${RULES.imageChangesPerMinute[0]}/min floor`,
    );
  }
  if (total > RULES.patternInterruptSeconds) {
    console.log(
      `note: ${(total / 60).toFixed(1)} min with no chapter card or music change — the playbook ` +
        `wants a pattern interrupt every ${RULES.patternInterruptSeconds / 60} min`,
    );
  }
  return problems;
};

const [file] = process.argv.slice(2);
if (!file) {
  console.error("usage: node scripts/check-pacing.mjs <props.json>");
  process.exit(1);
}
const data = JSON.parse(await readFile(file, "utf-8"));
const problems = check(data.scenes ?? data);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(1);
}
console.log("\nall checks pass");
