#!/usr/bin/env node
// Renders a long composition in resumable chunks, then joins them.
//
// A 55-scene video is 15-20 minutes of rendering per cut; one `remotion render`
// that dies at 90% leaves you with nothing. This splits the timeline into
// fixed-length chunks, skips any chunk that is already on disk, and stitches
// the finished pieces with Remotion's own combiner (no system ffmpeg needed).
//
// Because the chunks are frame ranges of the *whole* composition — not
// separate per-scene renders — every transition between scenes survives.
//
// A manifest can group its scenes into episodes ("episode": "01"), which is
// how a series of shorts and the long compilation come out of one project:
// render each episode on its own for 9:16, then the whole list for 16:9.
//
// Usage:
//   node scripts/render-batch.mjs                       # everything, vertical 9:16
//   node scripts/render-batch.mjs --comp=InfographicWide
//   node scripts/render-batch.mjs --episode=01          # one short
//   node scripts/render-batch.mjs --episodes            # every episode, one file each
//   node scripts/render-batch.mjs --list                # what episodes exist
//   node scripts/render-batch.mjs --chunk=600 --out=out/final.mp4
//   node scripts/render-batch.mjs --force               # re-render every chunk

import { existsSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCENES_JSON = path.join(ROOT, "content", "scenes.json");
const DEFAULT_TRANSITION_FRAMES = 12;
// must match the fps on the compositions in src/Composition.tsx
const FPS = 30;

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? true];
  }),
);

const composition = args.comp ?? "Infographic";
const chunkSize = Number(args.chunk ?? 900);

/** mirrors getTotalDurationInFrames() in src/InfographicVideo.tsx */
const totalFrames = (scenes) => {
  const scenesTotal = scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
  const overlap = scenes
    .slice(1)
    .reduce(
      (total, scene) =>
        total +
        (scene.transitionIn?.type === "none"
          ? 0
          : (scene.transitionIn?.durationInFrames ?? DEFAULT_TRANSITION_FRAMES)),
      0,
    );
  return scenesTotal - overlap;
};

const run = (command, commandArgs, { quiet = false } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd: ROOT, stdio: quiet ? "ignore" : "inherit" });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} thoát với mã ${code}`)),
    );
  });

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m${String(s).padStart(2, "0")}s`;
};

/**
 * Renders one list of scenes: chunk by chunk, skipping what is already on
 * disk, then joining. Returns the output path.
 */
async function renderScenes({ scenes, label, outFile }) {
  const frames = totalFrames(scenes);
  const chunkDir = path.join(ROOT, "out", "chunks", label);
  const propsFile = path.join(chunkDir, "props.json");

  await mkdir(chunkDir, { recursive: true });
  if (args.force) {
    await rm(chunkDir, { recursive: true, force: true });
    await mkdir(chunkDir, { recursive: true });
  }
  // the composition takes its scene list as a prop, so an episode is just a
  // subset handed to the same composition — no extra compositions to register
  await writeFile(propsFile, JSON.stringify({ scenes }), "utf-8");

  const chunks = [];
  for (let start = 0; start < frames; start += chunkSize) {
    const end = Math.min(start + chunkSize, frames) - 1;
    chunks.push({
      start,
      end,
      file: path.join(chunkDir, `${String(chunks.length).padStart(3, "0")}.mp4`),
    });
  }

  console.log(
    `\n${label}: ${scenes.length} scene, ${frames} frame (${formatDuration(frames / FPS)}) → ` +
      `${chunks.length} chunk x ${chunkSize} frame`,
  );

  const startedAt = Date.now();
  let rendered = 0;

  for (const [index, chunk] of chunks.entries()) {
    if (existsSync(chunk.file)) {
      console.log(`↷ chunk ${index + 1}/${chunks.length} đã có, bỏ qua`);
      continue;
    }
    console.log(`▶ chunk ${index + 1}/${chunks.length}: frame ${chunk.start}-${chunk.end}`);
    // render to a temp name so a killed run never leaves a half-written chunk
    // that the next run would happily skip
    const partial = `${chunk.file}.partial.mp4`;
    await run("npx", [
      "remotion",
      "render",
      composition,
      partial,
      `--frames=${chunk.start}-${chunk.end}`,
      `--props=${propsFile}`,
    ]);
    await run("mv", [partial, chunk.file]);
    rendered += 1;

    const elapsed = (Date.now() - startedAt) / 1000;
    const remaining = (chunks.length - index - 1) * (elapsed / rendered);
    if (remaining > 0) {
      console.log(`  còn lại ~${formatDuration(remaining)}`);
    }
  }

  console.log(`⧉ Ghép ${chunks.length} chunk → ${path.relative(ROOT, outFile)}`);
  await mkdir(path.dirname(outFile), { recursive: true });

  // Stream copy, no re-encode: the chunks already share codec, resolution and
  // fps, so joining them is a remux that takes seconds and loses nothing.
  const listFile = path.join(chunkDir, "concat.txt");
  await writeFile(listFile, chunks.map((chunk) => `file '${chunk.file}'`).join("\n"), "utf-8");
  await run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c",
    "copy",
    outFile,
  ]);

  return outFile;
}

async function main() {
  await run("ffmpeg", ["-hide_banner", "-version"], { quiet: true }).catch(() => {
    console.error(
      "Cần ffmpeg để ghép chunk (Ubuntu: sudo apt-get install -y ffmpeg, macOS: brew install ffmpeg).",
    );
    process.exit(1);
  });

  if (!existsSync(SCENES_JSON)) {
    console.error(`Không tìm thấy content/scenes.json — chạy "npm run build:scenes" trước.`);
    process.exit(1);
  }

  const allScenes = JSON.parse(await readFile(SCENES_JSON, "utf-8"));
  const episodes = [...new Set(allScenes.map((scene) => scene.episode).filter(Boolean))].sort();

  if (args.list) {
    console.log(`${allScenes.length} scene, ${episodes.length} tập:`);
    for (const episode of episodes) {
      const scenes = allScenes.filter((scene) => scene.episode === episode);
      console.log(
        `  ${episode}: ${scenes.length} scene, ${formatDuration(totalFrames(scenes) / FPS)}`,
      );
    }
    const loose = allScenes.filter((scene) => !scene.episode).length;
    if (loose) console.log(`  (${loose} scene chưa gán "episode")`);
    return;
  }

  const outputs = [];

  if (args.episodes) {
    if (episodes.length === 0) {
      console.error(`Manifest chưa có scene nào gắn "episode".`);
      process.exit(1);
    }
    for (const episode of episodes) {
      outputs.push(
        await renderScenes({
          scenes: allScenes.filter((scene) => scene.episode === episode),
          label: `${composition}-ep${episode}`,
          outFile: path.join(ROOT, `out/${composition}-ep${episode}.mp4`),
        }),
      );
    }
  } else if (args.episode) {
    const scenes = allScenes.filter((scene) => scene.episode === String(args.episode));
    if (scenes.length === 0) {
      console.error(
        `Không có scene nào thuộc tập "${args.episode}". Tập hiện có: ${episodes.join(", ") || "(chưa có)"}`,
      );
      process.exit(1);
    }
    outputs.push(
      await renderScenes({
        scenes,
        label: `${composition}-ep${args.episode}`,
        outFile: path.join(ROOT, args.out ?? `out/${composition}-ep${args.episode}.mp4`),
      }),
    );
  } else {
    outputs.push(
      await renderScenes({
        scenes: allScenes,
        label: composition,
        outFile: path.join(ROOT, args.out ?? `out/${composition}.mp4`),
      }),
    );
  }

  console.log(`\n✓ Xong:`);
  for (const output of outputs) {
    console.log(`  ${path.relative(ROOT, output)}`);
  }
  console.log(`  Chunk giữ lại ở out/chunks/ — xoá đi khi không cần render lại.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
