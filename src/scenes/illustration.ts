import { KURZ } from "../theme/kurzgesagt";
import type { Scene } from "./types";

/**
 * Bringing a flat illustration to life, Kurzgesagt-style.
 *
 * The source is a single static PNG (public/images/space-solar-system.png), so
 * nothing inside it can be moved. What makes it feel animated instead:
 *
 *  1. a very slow camera push, applied to the artwork AND the overlays at once
 *     (scene.camera) so everything drawn in code stays registered with it
 *  2. satellites running along the orbits that are already painted in — the
 *     rings themselves are switched off, only the moving bodies are ours
 *  3. a breathing glow on every light source in the picture: the sun, the
 *     antenna emitter, the engine exhaust
 *  4. a sparse twinkle layer over the existing stars, plus meteors crossing
 *     every few seconds
 *
 * Coordinates are in percent of the frame and were measured against the
 * artwork at 1920x888 — re-check them if you swap the image.
 */

/**
 * The centre of the painted orbit family, and the ring geometry, were measured
 * off the PNG itself (ray-scan + conic fit) rather than guessed: every orbit
 * shares tilt -18° and flatten 0.36, with semi-major axes of 124, 199, 277,
 * 350 and 421 image pixels — which is why the satellites below sit exactly on
 * the lines that are already drawn in the artwork.
 */
const SUN = { x: 45.99, y: 38.57 };

export const illustrationScenes: Scene[] = [
  {
    id: "solar-system-still",
    motion: "static",
    archetype: "Ảnh tĩnh + animation kiểu Kurzgesagt",
    durationInFrames: 360,
    background: {
      type: "image",
      src: "images/space-solar-system.png",
      // the camera below moves the whole scene instead, so the image itself
      // must stay put — otherwise it would slide out from under the overlays
      kenBurns: "none",
    },
    camera: { zoomFrom: 1.02, zoomTo: 1.09, panXPercent: -0.6, panYPercent: -0.3 },
    overlays: [
      { type: "starLayer", density: 0.45, driftSpeed: 0, opacity: 0.85, seed: "solar" },
      {
        // planets on the orbits already drawn in the artwork: same centre,
        // same tilt and flatten, rings hidden
        type: "orbitSystem",
        x: SUN.x,
        y: SUN.y,
        showCore: false,
        entrance: "fade",
        rings: [
          {
            radius: 73,
            flatten: 0.36,
            tiltDeg: -18,
            showRing: false,
            satelliteColor: KURZ.cyan,
            satelliteSize: 9,
            secondsPerRevolution: 7,
            phase: 2.4,
          },
          {
            radius: 117,
            flatten: 0.36,
            tiltDeg: -18,
            showRing: false,
            satelliteColor: KURZ.pink,
            satelliteSize: 9,
            secondsPerRevolution: 11,
            phase: 0.4,
          },
          {
            radius: 162,
            flatten: 0.36,
            tiltDeg: -18,
            showRing: false,
            satelliteColor: KURZ.yellow,
            satelliteSize: 10,
            secondsPerRevolution: 16,
            phase: 3.6,
          },
          {
            radius: 205,
            flatten: 0.36,
            tiltDeg: -18,
            showRing: false,
            satelliteColor: KURZ.violet,
            satelliteSize: 8,
            secondsPerRevolution: 21,
            phase: 2.6,
            direction: "ccw",
          },
          {
            radius: 247,
            flatten: 0.36,
            tiltDeg: -18,
            showRing: false,
            satelliteColor: KURZ.mint,
            satelliteSize: 9,
            secondsPerRevolution: 27,
            phase: 5.0,
          },
        ],
      },
      // the sun breathes
      {
        type: "glowPulse",
        x: SUN.x,
        y: SUN.y,
        radius: 210,
        color: "#FFF0B0",
        periodSeconds: 3.6,
        minOpacity: 0.16,
        maxOpacity: 0.4,
      },
      // emitter on the antenna arm
      {
        type: "glowPulse",
        x: 66.4,
        y: 51.8,
        radius: 34,
        color: KURZ.cyan,
        periodSeconds: 1.5,
        minOpacity: 0.3,
        maxOpacity: 0.85,
      },
      // engine exhaust
      {
        type: "glowPulse",
        x: 79.5,
        y: 71.5,
        radius: 78,
        color: "#4FD8FF",
        periodSeconds: 1.1,
        minOpacity: 0.22,
        maxOpacity: 0.6,
      },
      { type: "shootingStars", count: 3, periodSeconds: 6.5, angleDeg: 26, seed: "solar-meteor" },
    ],
  },
];
