import type { Scene } from "./types";

/**
 * Demo scene list for a short "Ancient Egypt pyramid" infographic, built
 * following docs/SKILL-FLAT-EXPLAINER.md (archetypes E1-E10, static/animate
 * classification from Mục 8). Motion graphics (pop-in, slide-in, stagger
 * reveal, line-draw charts, scene wipes) are implemented natively in
 * Remotion — see src/animation and src/components/overlays.
 *
 * Backgrounds are placeholder SVGs (public/images) standing in for real
 * AI-generated flat-vector art / Kling clips. Swap `background.src` for the
 * final assets without touching overlay/animation logic.
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
    transitionIn: { type: "wipe", direction: "from-left", durationInFrames: 14 },
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
    transitionIn: { type: "fade", durationInFrames: 12 },
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
    transitionIn: { type: "slide", direction: "from-bottom", durationInFrames: 12 },
    overlays: [
      { type: "iconLabel", label: "Kim Tự Tháp Giza", x: 50, y: 88, entrance: "pop", delayFrames: 6 },
    ],
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
    transitionIn: { type: "fade", durationInFrames: 12 },
    overlays: [
      {
        type: "dataBadge",
        value: "4500+",
        label: "năm tuổi",
        x: 78,
        y: 22,
        accentColor: "#E85D5D",
        calloutTo: { x: 58, y: 55 },
        entrance: "pop",
      },
    ],
  },
  {
    id: "compare-theories",
    motion: "static",
    archetype: "Comparison — Slide-in đối xứng (Mục 8)",
    durationInFrames: 120,
    background: { type: "color", color: "#E8DFC8" },
    transitionIn: { type: "fade", durationInFrames: 12 },
    overlays: [
      {
        type: "dataBadge",
        value: "Đường dốc",
        x: 28,
        y: 45,
        accentColor: "#4A90D9",
        entrance: "slideLeft",
      },
      {
        type: "dataBadge",
        value: "Đòn bẩy",
        x: 72,
        y: 45,
        accentColor: "#F2A33C",
        entrance: "slideRight",
      },
      {
        type: "caption",
        text: "Hai giả thuyết chính vẫn còn được tranh luận cho đến ngày nay.",
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
    transitionIn: { type: "fade", durationInFrames: 12 },
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
    archetype: "E8 Process Flow Diagram — stagger reveal",
    durationInFrames: 150,
    background: { type: "color", color: "#4A90D9" },
    transitionIn: { type: "slide", direction: "from-right", durationInFrames: 12 },
    overlays: [
      {
        type: "processFlow",
        accentColor: "#F2A33C",
        y: 50,
        staggerFrames: 14,
        steps: [
          { label: "Khai thác" },
          { label: "Vận chuyển" },
          { label: "Gia công" },
          { label: "Xây dựng" },
        ],
      },
      {
        type: "caption",
        text: "Từ mỏ đá đến công trường: một quy trình vận chuyển khổng lồ.",
      },
    ],
  },
  {
    id: "construction-progress",
    motion: "static",
    archetype: "Growth Curve — line-draw chart (Mục 8)",
    durationInFrames: 120,
    background: { type: "color", color: "#E8DFC8" },
    transitionIn: { type: "fade", durationInFrames: 12 },
    overlays: [
      { type: "dateHud", date: "20 năm xây dựng" },
      {
        type: "chartLine",
        color: "#B98A4A",
        drawEndFrame: 90,
        showDot: true,
        points: [
          { x: 12, y: 78 },
          { x: 30, y: 66 },
          { x: 50, y: 52 },
          { x: 70, y: 34 },
          { x: 88, y: 18 },
        ],
      },
      {
        type: "caption",
        text: "Chiều cao công trình tăng dần qua từng năm xây dựng.",
      },
    ],
  },
  {
    id: "checklist",
    motion: "static",
    archetype: "Checklist — Stagger reveal (Mục 8)",
    durationInFrames: 100,
    background: { type: "color", color: "#4CAF50" },
    transitionIn: { type: "fade", durationInFrames: 12 },
    overlays: [
      {
        type: "staggerBadges",
        accentColor: "#2E7D32",
        staggerFrames: 10,
        entrance: "pop",
        items: [
          { icon: "🧱", label: "2.3 triệu khối đá", x: 22, y: 48 },
          { icon: "📏", label: "Cao 146 mét", x: 50, y: 48 },
          { icon: "⏳", label: "20 năm xây dựng", x: 78, y: 48 },
        ],
      },
    ],
  },
  {
    id: "outro",
    motion: "static",
    archetype: "E3 Chapter Card (outro)",
    durationInFrames: 90,
    background: { type: "color", color: "#6B5CE0" },
    transitionIn: { type: "wipe", direction: "from-right", durationInFrames: 14 },
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
