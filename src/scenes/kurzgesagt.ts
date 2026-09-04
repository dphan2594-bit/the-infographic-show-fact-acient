import { KURZ } from "../theme/kurzgesagt";
import type { Scene } from "./types";

/**
 * Showcase reel for the Kurzgesagt-style motion pack — four shots, no image
 * assets at all: every backdrop, orbit and particle is drawn in code.
 *
 * It runs through the same <InfographicVideo> pipeline as a real script, so
 * anything you see here can be copied straight into content/manifest.json.
 * Render it with:  npx remotion render KurzgesagtDemo out/kurzgesagt.mp4
 */
export const kurzgesagtScenes: Scene[] = [
  {
    id: "kurz-hook",
    motion: "animate",
    archetype: "Space hook — orbit system",
    durationInFrames: 140,
    background: { type: "space", variant: "starfield", density: 1.1, seed: "hook" },
    overlays: [
      {
        type: "orbitSystem",
        x: 50,
        y: 32,
        coreRadius: 88,
        coreColor: KURZ.purple,
        glowColor: KURZ.cyan,
        entrance: "squash-pop",
        idle: "breathe",
        rings: [
          { radius: 300, satelliteColor: KURZ.cyan, secondsPerRevolution: 7, tiltDeg: -22 },
          {
            radius: 420,
            flatten: 0.3,
            tiltDeg: 14,
            color: KURZ.violet,
            opacity: 0.5,
            satelliteColor: KURZ.pink,
            satelliteSize: 13,
            secondsPerRevolution: 11,
            direction: "ccw",
            phase: 1.9,
          },
        ],
      },
      {
        type: "chapterTitle",
        title: "Vũ Trụ Rộng Cỡ Nào?",
        subtitle: "Một chuyến đi 60 giây",
        accentColor: KURZ.cyan,
        plate: false,
        entrance: "squash-pop",
        delayFrames: 14,
      },
    ],
  },
  {
    id: "kurz-scale",
    motion: "static",
    archetype: "Data beat — badge + burst",
    durationInFrames: 130,
    background: { type: "space", variant: "nebula", seed: "scale" },
    transitionIn: { type: "fade", durationInFrames: 14 },
    overlays: [
      {
        type: "dataBadge",
        value: "93 tỷ",
        label: "năm ánh sáng",
        x: 50,
        y: 40,
        accentColor: KURZ.pink,
        entrance: "elastic-drop",
        idle: "float",
        delayFrames: 8,
      },
      { type: "sparkleBurst", x: 50, y: 40, atFrame: 26, spread: 320 },
      {
        type: "caption",
        text: "Đường kính vũ trụ quan sát được — và nó vẫn đang giãn ra.",
        entrance: "rise-float",
        delayFrames: 34,
      },
    ],
  },
  {
    id: "kurz-ground",
    motion: "static",
    archetype: "Grid horizon — stagger reveal",
    durationInFrames: 140,
    background: { type: "space", variant: "grid-horizon", seed: "ground" },
    transitionIn: { type: "slide", direction: "from-bottom", durationInFrames: 14 },
    overlays: [
      {
        type: "staggerBadges",
        accentColor: KURZ.purple,
        entrance: "squash-pop",
        idle: "float",
        staggerFrames: 10,
        delayFrames: 6,
        items: [
          { icon: "🪐", label: "Hành tinh", x: 24, y: 38 },
          { icon: "⭐", label: "Ngôi sao", x: 50, y: 32 },
          { icon: "🌌", label: "Thiên hà", x: 76, y: 38 },
        ],
      },
      {
        type: "caption",
        text: "Mỗi bậc thang lớn hơn bậc trước hàng tỷ lần.",
        entrance: "fade-up",
        delayFrames: 40,
      },
    ],
  },
  {
    id: "kurz-warp",
    motion: "animate",
    archetype: "Warp outro",
    durationInFrames: 120,
    background: { type: "space", variant: "warp", density: 1.2, seed: "warp" },
    transitionIn: { type: "wipe", direction: "from-right", durationInFrames: 12 },
    overlays: [
      {
        type: "chapterTitle",
        title: "Và Đó Mới Là Khởi Đầu",
        accentColor: KURZ.yellow,
        plate: false,
        entrance: "rise-float",
        idle: "float",
        delayFrames: 10,
      },
      { type: "sparkleBurst", x: 50, y: 50, atFrame: 46, count: 30, spread: 420 },
    ],
  },
];
