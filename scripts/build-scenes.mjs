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
// Plain-data copy of the same scenes, so tooling (scripts/render-batch.mjs)
// can read them without going through TypeScript.
const SCENES_JSON_PATH = path.join(ROOT, "content", "scenes.json");

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
  // Kurzgesagt-style animated backdrop, drawn in code — no image asset needed.
  // "space": "starfield" is shorthand for { "variant": "starfield" }.
  if (entry.space) {
    const space = typeof entry.space === "string" ? { variant: entry.space } : entry.space;
    return { type: "space", ...space };
  }
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

/**
 * Copies the animation preset fields ("entrance", "delayFrames", "idle" — see
 * src/animation/presets.ts) from a manifest entry onto a generated overlay,
 * under an optional prefix so one scene can drive several overlays
 * (`entrance` for the chapter title, `captionEntrance` for the caption...).
 */
function applyPreset(overlay, entry, prefix = "") {
  const key = (name) => (prefix ? prefix + name[0].toUpperCase() + name.slice(1) : name);
  const entrance = entry[key("entrance")];
  const delayFrames = entry[key("delayFrames")];
  const idle = entry[key("idle")];

  if (entrance) overlay.entrance = entrance;
  if (typeof delayFrames === "number") overlay.delayFrames = delayFrames;
  if (idle) overlay.idle = idle;

  return overlay;
}

/**
 * Shorthand effects: `"fx": ["stars", "dust", "meteors"]` expands to the
 * matching overlays with sensible defaults, so a 55-scene manifest does not
 * have to repeat the same overlay objects. An entry can also be an object
 * ({ "type": "glow", "x": 46, "y": 38 }) to pass parameters.
 */
const FX_SHORTHAND = {
  stars: { type: "starLayer", density: 0.5, driftSpeed: 0, opacity: 0.85 },
  dust: { type: "driftParticles", count: 40, angleDeg: 205, speed: 24, opacity: 0.6 },
  meteors: { type: "shootingStars", count: 3, periodSeconds: 4.5, angleDeg: 26 },
};

function buildFx(entry) {
  const fx = entry.fx ?? [];
  if (!Array.isArray(fx)) {
    throw new Error(`"fx" của scene "${entry.id}" phải là 1 mảng.`);
  }

  return fx.map((item) => {
    if (typeof item === "string") {
      const overlay = FX_SHORTHAND[item];
      if (!overlay) {
        throw new Error(
          `fx "${item}" (scene "${entry.id}") không tồn tại. Dùng: ${Object.keys(FX_SHORTHAND).join(", ")}, ` +
            `hoặc khai báo object { "type": "glowPulse" | "engineTrail" | ... }.`,
        );
      }
      // seed per scene so two scenes never share the same star layout
      return { ...overlay, seed: `${entry.id}-${item}` };
    }
    if (item && typeof item === "object" && item.type) {
      // "glow" is a friendlier alias for the overlay's real name
      const type = item.type === "glow" ? "glowPulse" : item.type;
      return { seed: `${entry.id}-${type}`, ...item, type };
    }
    throw new Error(`fx của scene "${entry.id}" phải là chuỗi hoặc object có "type".`);
  });
}

function buildOverlays(entry) {
  const overlays = [...(entry.overlays ?? []), ...buildFx(entry)];

  if (entry.chapterTitle) {
    overlays.push(
      applyPreset(
        {
          type: "chapterTitle",
          title: entry.chapterTitle,
          subtitle: entry.chapterSubtitle,
          accentColor: entry.accentColor ?? "#6B5CE0",
        },
        entry,
      ),
    );
  }
  if (entry.dateHud) {
    overlays.push(applyPreset({ type: "dateHud", date: entry.dateHud }, entry, "dateHud"));
  }
  if (entry.caption) {
    const captionOverlay = { type: "caption", text: entry.caption };
    // dodge baked-in text in the image (see "captionPosition" in the manifest)
    if (entry.captionPosition) captionOverlay.position = entry.captionPosition;
    overlays.push(applyPreset(captionOverlay, entry, "caption"));
  }

  return overlays;
}

// Keep in sync with CameraPresetName in src/animation/cameraPresets.ts —
// tsc will also flag a bad name when it type-checks the generated scenes.
const CAMERA_PRESETS = [
  "hold",
  "drift",
  "push-in",
  "push-in-fast",
  "pull-back",
  "reveal",
  "pan-left",
  "pan-right",
  "tilt-up",
  "tilt-down",
  "punch-in",
  "sweep",
  "orbit-drift",
];

function normaliseCamera(camera, sceneId) {
  if (!camera) return undefined;
  const config = typeof camera === "string" ? { preset: camera } : camera;
  if (config.preset && !CAMERA_PRESETS.includes(config.preset)) {
    throw new Error(
      `camera preset "${config.preset}" (scene "${sceneId}") không tồn tại. Dùng: ${CAMERA_PRESETS.join(", ")}.`,
    );
  }
  return config;
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

    const scene = {
      id: entry.id,
      // groups scenes into one short of a series; see docs/BATCH-PIPELINE.md
      ...(entry.episode ? { episode: String(entry.episode) } : {}),
      motion: entry.motion ?? "static",
      archetype: entry.archetype ?? "",
      durationInFrames,
      background,
      overlays: buildOverlays(entry),
      captionBar: entry.captionBar,
      audioSrc: entry.audio,
      transitionIn: entry.transitionIn ?? { type: "fade" },
    };

    // camera: "push-in" is shorthand for { preset: "push-in" }; a scene can
    // also frame the vertical and wide cuts differently
    const camera = normaliseCamera(entry.camera, entry.id);
    if (camera) scene.camera = camera;
    const cameraVertical = normaliseCamera(entry.cameraVertical, entry.id);
    if (cameraVertical) scene.cameraVertical = cameraVertical;
    const cameraWide = normaliseCamera(entry.cameraWide, entry.id);
    if (cameraWide) scene.cameraWide = cameraWide;

    scenes.push(scene);
  }

  const fileContents = `// AUTO-GENERATED by scripts/build-scenes.mjs from content/manifest.json.
// Do not hand-edit — rerun the script instead, or edit the manifest.
import type { Scene } from "./types";

export const generatedScenes: Scene[] = ${JSON.stringify(scenes, null, 2)};
`;

  await writeFile(OUTPUT_PATH, fileContents, "utf-8");
  await writeFile(SCENES_JSON_PATH, JSON.stringify(scenes, null, 2), "utf-8");
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
