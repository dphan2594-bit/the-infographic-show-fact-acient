#!/usr/bin/env node
// Cầu nối Pixelle-Video → Remotion.
//
// Đọc content/manifest.json, tìm những scene có "imagePrompt"/"videoPrompt"
// nhưng chưa có file asset, gọi Pixelle-Video (https://github.com/AIDC-AI/Pixelle-Video)
// để sinh ảnh/clip, tải về public/images | public/videos rồi ghi ngược đường
// dẫn vào manifest. Sau đó chạy build-scenes.mjs như thường lệ:
//
//   node scripts/pixelle-media.mjs      # sinh media còn thiếu
//   node scripts/build-scenes.mjs       # khớp thời lượng + sinh generated.ts
//
// Pixelle chỉ lo phần "sinh media"; toàn bộ chữ tiếng Việt, overlay, motion
// graphics và ghép cảnh vẫn do Remotion đảm nhiệm (Mục 2 style guide).
//
// Xem docs/PIXELLE-BRIDGE.md để biết cách dựng server Pixelle-Video.

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";
import { buildPrompt } from "./pixelle-prompt.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MANIFEST_PATH = path.join(ROOT, "content", "manifest.json");
const PUBLIC_DIR = path.join(ROOT, "public");

const DEFAULTS = {
  api: process.env.PIXELLE_API_URL ?? "http://127.0.0.1:8000",
  // Khớp <Composition> dọc 1080x1920 trong src/Composition.tsx.
  // API Pixelle giới hạn 512-2048 mỗi chiều.
  width: 1080,
  height: 1920,
  // RunningHub gói thường chỉ cho 1 job đồng thời (runninghub_concurrent_limit),
  // nên mặc định chạy tuần tự — tự nâng lên nếu backend của bạn chịu được.
  concurrency: 1,
  // Sinh ảnh/clip có thể mất vài phút.
  timeoutSeconds: 600,
};

const USAGE = `
Cách dùng: node scripts/pixelle-media.mjs [options]

  --api <url>            Base URL của Pixelle-Video (mặc định ${DEFAULTS.api}, hoặc $PIXELLE_API_URL)
  --kind <loại>          image | video | animate | all (mặc định all)
  --only <id,id>         Chỉ xử lý các scene id này
  --force                Sinh lại kể cả khi file asset đã tồn tại
  --dry-run              Chỉ in prompt cuối cùng, không gọi API, không ghi file
  --workflow <name>      Ghi đè workflow (vd runninghub/image_flux.json)
  --width <px>           Mặc định ${DEFAULTS.width}
  --height <px>          Mặc định ${DEFAULTS.height}
  --concurrency <n>      Số job song song (mặc định ${DEFAULTS.concurrency})
  --timeout <giây>       Timeout mỗi job (mặc định ${DEFAULTS.timeoutSeconds})
  -h, --help             In trợ giúp này
`.trim();

function parseArgs(argv) {
  const options = { ...DEFAULTS, kind: "all", only: null, force: false, dryRun: false, workflow: null };

  const takeValue = (flag, index) => {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Thiếu giá trị cho ${flag}`);
    }
    return value;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        console.log(USAGE);
        process.exit(0);
        break;
      case "--force":
        options.force = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--api":
        options.api = takeValue(arg, i).replace(/\/+$/, "");
        i += 1;
        break;
      case "--kind":
        options.kind = takeValue(arg, i);
        if (!["image", "video", "animate", "all"].includes(options.kind)) {
          throw new Error(`--kind phải là image | video | animate | all, nhận được "${options.kind}"`);
        }
        i += 1;
        break;
      case "--only":
        options.only = new Set(
          takeValue(arg, i)
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean),
        );
        i += 1;
        break;
      case "--workflow":
        options.workflow = takeValue(arg, i);
        i += 1;
        break;
      case "--width":
      case "--height":
      case "--concurrency":
      case "--timeout": {
        const key = arg === "--timeout" ? "timeoutSeconds" : arg.slice(2);
        const value = Number(takeValue(arg, i));
        if (!Number.isFinite(value) || value <= 0) {
          throw new Error(`${arg} phải là số dương, nhận được "${takeValue(arg, i)}"`);
        }
        options[key] = value;
        i += 1;
        break;
      }
      default:
        throw new Error(`Không nhận ra tham số "${arg}".\n\n${USAGE}`);
    }
  }

  return options;
}

/**
 * URL của asset Pixelle trả về. ComfyUI/RunningHub thường trả URL http sẵn,
 * nhưng một số workflow trả đường dẫn file trong output/ — khi đó dựng lại URL
 * qua route /api/files giống hàm path_to_url của Pixelle.
 */
function resolveAsset(rawPath, apiBase) {
  const value = String(rawPath).replace(/\\/g, "/");

  if (/^https?:\/\//i.test(value)) {
    return { kind: "url", value };
  }
  if (existsSync(value)) {
    return { kind: "file", value };
  }

  const parts = value.split("/");
  const outputIndex = parts.indexOf("output");
  const tail = outputIndex >= 0 ? parts.slice(outputIndex + 1).join("/") : value.replace(/^\/+/, "");
  return { kind: "url", value: `${apiBase}/api/files/${tail}` };
}

function extensionFor(asset, kind) {
  const pathname = asset.kind === "url" ? new URL(asset.value).pathname : asset.value;
  const extension = path.extname(pathname).toLowerCase();
  if (/^\.(png|jpg|jpeg|webp|mp4|webm|mov)$/.test(extension)) {
    return extension;
  }
  return kind === "video" ? ".mp4" : ".png";
}

async function saveAsset(asset, destinationPath, timeoutSeconds) {
  await mkdir(path.dirname(destinationPath), { recursive: true });

  if (asset.kind === "file") {
    await copyFile(asset.value, destinationPath);
    return;
  }

  const response = await fetch(asset.value, {
    signal: AbortSignal.timeout(timeoutSeconds * 1000),
  });
  if (!response.ok) {
    throw new Error(`Tải asset thất bại (${response.status} ${response.statusText}): ${asset.value}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error(`Asset tải về rỗng: ${asset.value}`);
  }
  await writeFile(destinationPath, buffer);
}

async function postJson(url, body, timeoutSeconds) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutSeconds * 1000),
  });

  const text = await response.text();
  if (!response.ok) {
    const error = new Error(`${response.status} ${response.statusText} — ${text.slice(0, 500)}`);
    error.status = response.status;
    throw error;
  }
  return JSON.parse(text);
}

/**
 * Gọi Pixelle sinh media.
 *
 * Ưu tiên /api/media/generate (sidecar ở scripts/pixelle-sidecar.py): nhận cả
 * video, negative_prompt và duration. Bản Pixelle-Video gốc chưa có route đó
 * nên với ảnh sẽ tự lùi về /api/image/generate — route này KHÔNG nhận
 * negative_prompt, đổi lại các ràng buộc "no text, no watermark" đã nằm sẵn
 * trong prompt chính (Mục 2/3 style guide).
 */
const generationState = { mediaEndpointMissing: false, warnedAboutFallback: false };

async function generateMedia({ kind, prompt, negativePrompt, workflow, duration, sourceImage, options }) {
  const payload = {
    prompt,
    width: options.width,
    height: options.height,
    // "animate" là image-to-video — với Pixelle vẫn là media_type "video",
    // khác ở chỗ có thêm ảnh đầu vào.
    media_type: kind === "animate" ? "video" : kind,
    negative_prompt: negativePrompt,
  };
  if (workflow) payload.workflow = workflow;
  if (duration) payload.duration = duration;
  if (sourceImage) payload.image = sourceImage;

  if (!generationState.mediaEndpointMissing) {
    try {
      const result = await postJson(`${options.api}/api/media/generate`, payload, options.timeoutSeconds);
      const mediaPath = result.media_path ?? result.image_path ?? result.url;
      if (!mediaPath) {
        throw new Error(`Phản hồi /api/media/generate không có đường dẫn media: ${JSON.stringify(result)}`);
      }
      return mediaPath;
    } catch (error) {
      if (error.status !== 404) throw error;
      generationState.mediaEndpointMissing = true;
    }
  }

  if (kind === "video" || kind === "animate") {
    throw new Error(
      `Server ${options.api} không có /api/media/generate nên không sinh được video clip.\n` +
        `  Pixelle-Video gốc chỉ expose /api/image/generate (ảnh) và /api/video/generate (pipeline video hoàn chỉnh),\n` +
        `  không có route sinh riêng 1 clip. Chạy scripts/pixelle-sidecar.py trong checkout Pixelle-Video\n` +
        `  rồi trỏ --api vào nó — xem docs/PIXELLE-BRIDGE.md.`,
    );
  }

  if (!generationState.warnedAboutFallback) {
    generationState.warnedAboutFallback = true;
    console.warn(
      `ℹ Không thấy /api/media/generate, dùng /api/image/generate — negative prompt sẽ bị bỏ qua.\n` +
        `  (Chạy scripts/pixelle-sidecar.py nếu muốn có negative prompt + video clip.)`,
    );
  }

  const result = await postJson(
    `${options.api}/api/image/generate`,
    { prompt, width: options.width, height: options.height, ...(workflow ? { workflow } : {}) },
    options.timeoutSeconds,
  );
  if (!result.image_path) {
    throw new Error(`Phản hồi /api/image/generate không có image_path: ${JSON.stringify(result)}`);
  }
  return result.image_path;
}

/** Độ dài audio TTS của scene, để clip sinh ra dài đúng bằng lời thoại. */
async function audioDurationSeconds(audioRelativePath) {
  const absolutePath = path.join(PUBLIC_DIR, audioRelativePath);
  if (!existsSync(absolutePath)) return null;
  const { slowDurationInSeconds } = await parseMedia({
    src: absolutePath,
    reader: nodeReader,
    fields: { slowDurationInSeconds: true },
  });
  return slowDurationInSeconds;
}

/**
 * Đọc ra chủ thể prompt (và ảnh nguồn nếu là animate) của 1 scene cho 1 loại job.
 * Trả subject = null nghĩa là scene không yêu cầu loại job này.
 */
function describeJob(entry, kind) {
  if (kind === "image") {
    return { subject: entry.imagePrompt ?? null, sourceImage: null };
  }
  if (kind === "video") {
    return { subject: entry.videoPrompt ?? null, sourceImage: null };
  }

  // animate: image-to-video từ 1 ảnh đã có trong public/
  if (!entry.animateFrom) return { subject: null, sourceImage: null };

  const sourceImage = entry.animateFrom === true ? entry.image : entry.animateFrom;
  if (!sourceImage) {
    throw new Error(
      `${entry.id}: "animateFrom": true nhưng scene chưa có field "image" để animate. ` +
        `Ghi thẳng đường dẫn, vd "animateFrom": "images/${entry.id}.jpg".`,
    );
  }
  if (!existsSync(path.join(PUBLIC_DIR, sourceImage))) {
    throw new Error(`${entry.id}: không thấy ảnh nguồn public/${sourceImage} để animate.`);
  }

  const subject = entry.videoMotion ?? entry.animatePrompt ?? null;
  if (!subject) {
    throw new Error(
      `${entry.id}: có "animateFrom" nhưng thiếu "videoMotion" — cần mô tả chuyển động, ` +
        `vd "videoMotion": "the seeds slowly spill between the fingers".`,
    );
  }

  return { subject, sourceImage };
}

/** Các job cần chạy, suy ra từ manifest. */
function planJobs(manifest, options) {
  const jobs = [];
  const wants = (kind) => options.kind === "all" || options.kind === kind;

  for (const entry of manifest) {
    if (!entry.id) {
      throw new Error(`Mỗi scene trong manifest phải có "id". Entry lỗi: ${JSON.stringify(entry)}`);
    }
    if (options.only && !options.only.has(entry.id)) continue;

    if (entry.animateFrom && entry.videoPrompt) {
      throw new Error(
        `${entry.id}: có cả "animateFrom" lẫn "videoPrompt" — cả hai đều sinh ra field "video". ` +
          `Chọn một: animate ảnh có sẵn, hoặc sinh clip mới từ chữ.`,
      );
    }

    for (const kind of ["image", "video", "animate"]) {
      if (!wants(kind)) continue;

      // "animate" sinh ra clip nên cũng ghi vào field "video".
      const outputField = kind === "animate" ? "video" : kind;
      const { subject, sourceImage } = describeJob(entry, kind);
      if (!subject) continue;

      const existingSrc = entry[outputField];
      const alreadyOnDisk = existingSrc && existsSync(path.join(PUBLIC_DIR, existingSrc));
      if (alreadyOnDisk && !options.force) {
        console.log(`↷ ${entry.id} (${kind}): đã có public/${existingSrc}, bỏ qua (dùng --force để sinh lại)`);
        continue;
      }

      jobs.push({ entry, kind, subject, sourceImage, outputField });
    }
  }

  return jobs;
}

async function runJob(job, options) {
  const { entry, kind, subject, sourceImage } = job;

  const { prompt, negativePrompt } = buildPrompt({
    subject,
    palette: entry.palette,
    composition: entry.composition,
    motion: entry.videoMotion,
    kind,
    negativePrompt: entry.negativePrompt,
  });

  if (options.dryRun) {
    const from = sourceImage ? `\nảnh nguồn: public/${sourceImage}` : "";
    console.log(`\n— ${entry.id} (${kind}) —${from}\nprompt: ${prompt}\nnegative: ${negativePrompt}`);
    return null;
  }

  const producesVideo = kind === "video" || kind === "animate";
  const duration = producesVideo && entry.audio ? await audioDurationSeconds(entry.audio) : null;
  const workflowField = kind === "image" ? "imageWorkflow" : "videoWorkflow";
  const workflow = options.workflow ?? entry[workflowField] ?? null;

  console.log(`→ ${entry.id} (${kind}): đang sinh…${duration ? ` (khớp ${duration.toFixed(1)}s audio)` : ""}`);
  const rawPath = await generateMedia({
    kind,
    prompt,
    negativePrompt,
    workflow,
    duration,
    // Pixelle chạy ở process khác nên cần đường dẫn tuyệt đối, không phải
    // đường dẫn tương đối theo public/ của repo này.
    sourceImage: sourceImage ? path.join(PUBLIC_DIR, sourceImage) : null,
    options,
  });

  const asset = resolveAsset(rawPath, options.api);
  const directory = kind === "image" ? "images" : "videos";
  const relativePath = `${directory}/${entry.id}${extensionFor(asset, producesVideo ? "video" : "image")}`;
  await saveAsset(asset, path.join(PUBLIC_DIR, relativePath), options.timeoutSeconds);

  console.log(`✓ ${entry.id} (${kind}): public/${relativePath}`);
  return relativePath;
}

/** Chạy các job với giới hạn song song, không dừng cả mẻ khi 1 job lỗi. */
async function runJobs(jobs, options) {
  const failures = [];
  let written = 0;
  let cursor = 0;

  const worker = async () => {
    while (cursor < jobs.length) {
      const job = jobs[cursor];
      cursor += 1;
      try {
        const relativePath = await runJob(job, options);
        if (relativePath) {
          job.entry[job.outputField] = relativePath;

          if (job.kind === "animate") {
            // build-scenes.mjs ưu tiên "image" hơn "video", nên giữ lại "image"
            // đồng nghĩa clip vừa sinh không bao giờ được render. Ảnh nguồn
            // không mất đi: nó được ghi cố định vào "animateFrom".
            job.entry.animateFrom = job.sourceImage;
            if (job.entry.image) {
              console.log(`  ${job.entry.id}: "image" → "animateFrom" để scene render clip thay vì ảnh tĩnh`);
              delete job.entry.image;
            }
          }

          written += 1;
        }
      } catch (error) {
        failures.push({ job, error });
        console.error(`✗ ${job.entry.id} (${job.kind}): ${error.message}`);
      }
    }
  };

  const workerCount = Math.max(1, Math.min(options.concurrency, jobs.length));
  await Promise.all(Array.from({ length: workerCount }, worker));

  return { failures, written };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

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

  const jobs = planJobs(manifest, options);
  if (jobs.length === 0) {
    console.log(
      `Không có gì để sinh.\n` +
        `Thêm "imagePrompt" (hoặc "videoPrompt") vào scene trong content/manifest.json — xem content/manifest.example.json.`,
    );
    return;
  }

  console.log(`Sinh ${jobs.length} asset qua ${options.api} (${options.width}x${options.height})\n`);
  const { failures, written } = await runJobs(jobs, options);

  if (written > 0) {
    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
    console.log(`\nĐã cập nhật ${written} đường dẫn asset vào content/manifest.json`);
    console.log(`Bước tiếp theo: node scripts/build-scenes.mjs`);
  }

  // buildBackground() trong build-scenes.mjs ưu tiên "image" hơn "video", nên
  // một scene có cả hai sẽ render ảnh tĩnh và bỏ qua clip vừa sinh.
  const ambiguous = manifest.filter((entry) => entry.image && entry.video).map((entry) => entry.id);
  if (ambiguous.length > 0) {
    console.warn(
      `\n⚠ Scene có cả "image" lẫn "video": ${ambiguous.join(", ")}\n` +
        `  build-scenes.mjs sẽ dùng ảnh và bỏ qua clip — xoá field không cần trong manifest.`,
    );
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length}/${jobs.length} job thất bại.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
