#!/usr/bin/env node
// Reads content/manifest.json + the real audio/image files you provide and
// writes src/scenes/generated.ts — each scene's durationInFrames is derived
// from its actual TTS audio length, so captions and images stay in sync
// with the voiceover automatically instead of hand-counting frames.
//
// Usage:
//   node scripts/build-scenes.mjs
//
// Then flip src/scenes/active.ts to re-export from "./generated".

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MANIFEST_PATH = path.join(ROOT, "content", "manifest.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_PATH = path.join(ROOT, "src", "scenes", "generated.ts");

// Must match `fps` on the <Composition> in src/Composition.tsx.
const FPS = 30;
// Extra frames kept after the audio ends, so a scene never hard-cuts the
// instant the voiceover stops.
const PADDING_FRAMES = 9;
// Used when a scene has no audio and no explicit durationInFrames.
const FALLBACK_DURATION_FRAMES = 90;

const KEN_BURNS_ROTATION = [
  "zoom-in",
  "pan-left",
  "zoom-out",
  "pan-right",
  "pan-up",
  "pan-down",
];

async function getAudioDurationInFrames(audioRelativePath) {
  const absolutePath = path.join(PUBLIC_DIR, audioRelativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(
      `Audio file not found: public/${audioRelativePath} (khai báo trong manifest nhưng chưa có file)`,
    );
  }
  const { slowDurationInSeconds } = await parseMedia({
    src: absolutePath,
    reader: nodeReader,
    fields: { slowDurationInSeconds: true },
  });
  return Math.round(slowDurationInSeconds * FPS) + PADDING_FRAMES;
}

function buildBackground(entry, kenBurnsIndex) {
  if (entry.image) {
    const kenBurns =
      entry.kenBurns ?? KEN_BURNS_ROTATION[kenBurnsIndex % KEN_BURNS_ROTATION.length];
    const background = { type: "image", src: entry.image, kenBurns };
    // "contain" for finished graphics (charts/maps) with baked-in text
    // reaching the edges — "cover" (default) would crop it.
    if (entry.fit) background.fit = entry.fit;
    if (entry.letterboxColor) background.letterboxColor = entry.letterboxColor;
    return background;
  }
  if (entry.video) {
    return { type: "video", src: entry.video };
  }
  return { type: "color", color: entry.backgroundColor ?? "#E8DFC8" };
}

function buildOverlays(entry) {
  const overlays = [...(entry.overlays ?? [])];

  if (entry.chapterTitle) {
    overlays.push({
      type: "chapterTitle",
      title: entry.chapterTitle,
      subtitle: entry.chapterSubtitle,
      accentColor: entry.accentColor ?? "#6B5CE0",
    });
  }
  if (entry.dateHud) {
    overlays.push({ type: "dateHud", date: entry.dateHud });
  }
  if (entry.caption) {
    const captionOverlay = { type: "caption", text: entry.caption };
    // dodge baked-in text in the image (see "captionPosition" in the manifest)
    if (entry.captionPosition) captionOverlay.position = entry.captionPosition;
    overlays.push(captionOverlay);
  }

  return overlays;
}

async function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error(
      `Không tìm thấy content/manifest.json.\n` +
        `Xem content/manifest.example.json để biết định dạng, tạo content/manifest.json rồi chạy lại.`,
    );
    process.exit(1);
  }

  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8"));
  if (!Array.isArray(manifest) || manifest.length === 0) {
    console.error("content/manifest.json phải là 1 mảng scene, không được rỗng.");
    process.exit(1);
  }

  const scenes = [];
  let kenBurnsIndex = 0;

  for (const entry of manifest) {
    if (!entry.id) {
      throw new Error(`Mỗi scene trong manifest phải có "id". Entry lỗi: ${JSON.stringify(entry)}`);
    }

    let durationInFrames;
    if (entry.audio) {
      durationInFrames = await getAudioDurationInFrames(entry.audio);
      console.log(`✓ ${entry.id}: audio ${entry.audio} → ${durationInFrames} frames`);
    } else if (entry.durationInFrames) {
      durationInFrames = entry.durationInFrames;
      console.log(`• ${entry.id}: không có audio, dùng durationInFrames=${durationInFrames}`);
    } else {
      durationInFrames = FALLBACK_DURATION_FRAMES;
      console.warn(
        `⚠ ${entry.id}: không có "audio" lẫn "durationInFrames", dùng mặc định ${FALLBACK_DURATION_FRAMES} frames.`,
      );
    }

    const background = buildBackground(entry, kenBurnsIndex);
    if (background.type === "image") {
      kenBurnsIndex += 1;
    }

    scenes.push({
      id: entry.id,
      motion: entry.motion ?? "static",
      archetype: entry.archetype ?? "",
      durationInFrames,
      background,
      overlays: buildOverlays(entry),
      captionBar: entry.captionBar,
      audioSrc: entry.audio,
      transitionIn: entry.transitionIn ?? { type: "fade" },
    });
  }

  const fileContents = `// AUTO-GENERATED by scripts/build-scenes.mjs from content/manifest.json.
// Do not hand-edit — rerun the script instead, or edit the manifest.
import type { Scene } from "./types";

export const generatedScenes: Scene[] = ${JSON.stringify(scenes, null, 2)};
`;

  await writeFile(OUTPUT_PATH, fileContents, "utf-8");
  console.log(`\nĐã ghi ${scenes.length} scene vào src/scenes/generated.ts`);
  console.log(
    `Tổng thời lượng ước tính: ${(scenes.reduce((t, s) => t + s.durationInFrames, 0) / FPS).toFixed(1)}s (chưa trừ overlap transition)`,
  );
  console.log(`\nBước tiếp theo: sửa src/scenes/active.ts để export từ "./generated".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
