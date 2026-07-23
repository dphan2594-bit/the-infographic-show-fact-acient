import type { Scene } from "./types";

/**
 * Demo scene list for a short "Ancient Egypt pyramid" infographic,
 * built following docs/SKILL-FLAT-EXPLAINER.md (archetypes E1-E10,
 * static/animate classification from Mục 8).
 *
 * Backgrounds here are placeholder SVGs (public/images) standing in for
 * real AI-generated flat-vector art / Kling clips. Swap `background.src`
 * for the final assets without touching overlay logic.
 */
export const sampleScenes: Scene[] = [
  {
    id: "hook",
    motion: "animate",
    archetype: "E6 Wide Shot (hook, 0-15s)",
    durationInFrames: 120,
    background: {
      type: "image",
      src: "images/scene-02-wideshot-pyramids.svg",
      kenBurns: "zoom-in",
    },
    overlays: [
      { type: "dateHud", date: "~2560 TCN" },
      {
        type: "caption",
        text: "Làm sao người Ai Cập cổ đại xây kim tự tháp mà không có máy móc?",
      },
    ],
  },
  {
    id: "chapter-1",
    motion: "static",
    archetype: "E3 Chapter Card",
    durationInFrames: 90,
    background: { type: "color", color: "#6B5CE0" },
    overlays: [
      {
        type: "chapterTitle",
        title: "Bí Ẩn Kim Tự Tháp",
        subtitle: "Kỳ quan cổ đại cuối cùng còn tồn tại",
        accentColor: "#F2A33C",
      },
    ],
  },
  {
    id: "builder-intro",
    motion: "static",
    archetype: "E1 Character Scene",
    durationInFrames: 150,
    background: {
      type: "image",
      src: "images/scene-03-builder-character.svg",
      kenBurns: "zoom-in",
    },
    overlays: [
      {
        type: "caption",
        text: "Hơn 100.000 công nhân đã tham gia xây dựng công trình này.",
      },
    ],
  },
  {
    id: "badge-pyramid",
    motion: "static",
    archetype: "E2 Icon Badge",
    durationInFrames: 90,
    background: {
      type: "image",
      src: "images/scene-04-icon-badge-pyramid.svg",
    },
    overlays: [{ type: "iconLabel", label: "Kim Tự Tháp Giza", x: 50, y: 88 }],
  },
  {
    id: "data-badge-years",
    motion: "static",
    archetype: "E9 Data Callout Badge",
    durationInFrames: 120,
    background: {
      type: "image",
      src: "images/scene-02-wideshot-pyramids.svg",
      kenBurns: "pan-right",
    },
    overlays: [
      {
        type: "dataBadge",
        value: "4500+",
        label: "năm tuổi",
        x: 78,
        y: 22,
        accentColor: "#E85D5D",
        calloutTo: { x: 58, y: 55 },
      },
    ],
  },
  {
    id: "closeup-stone",
    motion: "animate",
    archetype: "E4 Close-up + Core Concept Movement",
    durationInFrames: 150,
    background: {
      type: "image",
      src: "images/scene-05-closeup-stone.svg",
      kenBurns: "zoom-out",
    },
    overlays: [
      {
        type: "caption",
        text: "Mỗi khối đá nặng tới 2.5 tấn được kéo bằng sức người.",
      },
    ],
  },
  {
    id: "process-flow",
    motion: "static",
    archetype: "E8 Process Flow Diagram",
    durationInFrames: 150,
    background: {
      type: "image",
      src: "images/scene-06-process-flow.svg",
    },
    overlays: [
      { type: "iconLabel", label: "Khai thác", x: 12.5, y: 68 },
      { type: "iconLabel", label: "Vận chuyển", x: 34.4, y: 68 },
      { type: "iconLabel", label: "Gia công", x: 56.25, y: 68 },
      { type: "iconLabel", label: "Xây dựng", x: 78.1, y: 68 },
      {
        type: "caption",
        text: "Từ mỏ đá đến công trường: một quy trình vận chuyển khổng lồ.",
      },
    ],
  },
  {
    id: "outro",
    motion: "static",
    archetype: "E3 Chapter Card (outro)",
    durationInFrames: 90,
    background: { type: "color", color: "#6B5CE0" },
    overlays: [
      {
        type: "chapterTitle",
        title: "Theo dõi để khám phá thêm",
        subtitle: "Những bí ẩn lịch sử cổ đại khác",
        accentColor: "#F2A33C",
      },
    ],
  },
];
