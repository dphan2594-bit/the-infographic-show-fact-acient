import { KURZ } from "../theme/kurzgesagt";
import type { OrbitRing, Scene } from "./types";

/**
 * Bringing a flat illustration to life, Kurzgesagt-style.
 *
 * The source is a single static PNG (public/images/space-solar-system.png), so
 * nothing inside it can be moved. The life comes from five layers on top:
 *
 *  1. a keyframed camera — push in on the sun, pull back to the whole system,
 *     then drift across to the spacecraft — applied to the artwork AND every
 *     overlay at once (scene.camera) so nothing slides out of register
 *  2. planets running along the orbits already painted in, plus light pulses
 *     flowing around those same orbits
 *  3. a breathing glow on every light source: sun, antenna emitter, exhaust
 *  4. a live exhaust plume streaming out of the engine
 *  5. atmosphere: twinkle over the existing stars, coloured dust drifting at
 *     three depths for parallax, and meteors crossing every few seconds
 *
 * The orbit geometry was measured off the PNG itself (ray-scan + conic fit),
 * not guessed: all five orbits share tilt -18° and flatten 0.36, with
 * semi-major axes of 124, 199, 277, 350 and 421 image pixels. That is why the
 * satellites sit exactly on the lines that are already drawn.
 */

/** centre of the painted orbit family, in percent of frame */
const SYSTEM = { x: 45.99, y: 38.57 };

/** every orbit shares the artwork's tilt and flatten — only the radius differs */
const orbit = (ring: Omit<OrbitRing, "flatten" | "tiltDeg" | "showRing">): OrbitRing => ({
  flatten: 0.36,
  tiltDeg: -18,
  // the ellipse is already painted into the picture; only the bodies are ours
  showRing: false,
  ...ring,
});

export const illustrationScenes: Scene[] = [
  {
    id: "solar-system-still",
    motion: "static",
    archetype: "Ảnh tĩnh + animation kiểu Kurzgesagt",
    durationInFrames: 450,
    background: {
      type: "image",
      src: "images/space-solar-system.png",
      // the scene camera below moves everything together, so the image itself
      // must stay put — kenBurns would slide it out from under the overlays
      kenBurns: "none",
    },
    camera: {
      keyframes: [
        { at: 0, zoom: 1.26, focusX: 47, focusY: 40 },
        { at: 30, zoom: 1.05, focusX: 50, focusY: 50 },
        { at: 62, zoom: 1.14, focusX: 56, focusY: 52 },
        { at: 100, zoom: 1.3, focusX: 61, focusY: 57 },
      ],
      driftPercent: 0.5,
      driftSeconds: 8,
    },
    overlays: [
      { type: "starLayer", density: 0.5, driftSpeed: 0, opacity: 0.9, seed: "solar" },
      {
        type: "driftParticles",
        count: 46,
        angleDeg: 205,
        speed: 24,
        opacity: 0.6,
        seed: "solar-dust",
      },
      {
        type: "orbitSystem",
        x: SYSTEM.x,
        y: SYSTEM.y,
        // the sun is painted in — we only add the bodies going round it
        showCore: false,
        entrance: "fade",
        rings: [
          orbit({
            radius: 73,
            satelliteColor: KURZ.cyan,
            satelliteSize: 9,
            secondsPerRevolution: 4.5,
            phase: 2.4,
          }),
          orbit({
            radius: 117,
            satelliteColor: KURZ.pink,
            satelliteSize: 9,
            secondsPerRevolution: 6.5,
            phase: 0.4,
            pulse: true,
            pulseColor: KURZ.cyan,
          }),
          orbit({
            radius: 117,
            satelliteColor: KURZ.mint,
            satelliteSize: 7,
            secondsPerRevolution: 6.5,
            phase: 3.9,
          }),
          orbit({
            radius: 162,
            satelliteColor: KURZ.yellow,
            satelliteSize: 10,
            secondsPerRevolution: 8.5,
            phase: 3.6,
          }),
          orbit({
            radius: 205,
            satelliteColor: KURZ.violet,
            satelliteSize: 8,
            secondsPerRevolution: 11,
            phase: 2.6,
            direction: "ccw",
            pulse: true,
            pulseColor: KURZ.cyan,
          }),
          orbit({
            radius: 247,
            satelliteColor: KURZ.mint,
            satelliteSize: 9,
            secondsPerRevolution: 13,
            phase: 5,
            pulse: true,
            pulseColor: KURZ.cyan,
          }),
          orbit({
            radius: 247,
            satelliteColor: KURZ.pink,
            satelliteSize: 7,
            secondsPerRevolution: 13,
            phase: 1.4,
          }),
        ],
      },
      // the sun breathes
      {
        type: "glowPulse",
        x: SYSTEM.x,
        y: SYSTEM.y,
        radius: 230,
        color: "#FFF0B0",
        periodSeconds: 3.6,
        minOpacity: 0.14,
        maxOpacity: 0.5,
      },
      // emitter on the antenna arm
      {
        type: "glowPulse",
        x: 66.4,
        y: 51.8,
        radius: 36,
        color: KURZ.cyan,
        periodSeconds: 1.4,
        minOpacity: 0.25,
        maxOpacity: 0.95,
      },
      // engine: a steady glow at the nozzle plus dashes streaming out of it
      {
        type: "glowPulse",
        x: 79.5,
        y: 71.5,
        radius: 82,
        color: "#4FD8FF",
        periodSeconds: 1.1,
        minOpacity: 0.22,
        maxOpacity: 0.65,
      },
      {
        type: "engineTrail",
        x: 80.5,
        y: 72.5,
        angleDeg: 33,
        length: 22,
        spread: 5,
        count: 16,
        travelSeconds: 1.2,
        seed: "exhaust",
      },
      {
        type: "shootingStars",
        count: 4,
        periodSeconds: 3.6,
        travelSeconds: 1.1,
        angleDeg: 26,
        seed: "solar-meteor",
      },
    ],
  },
];
