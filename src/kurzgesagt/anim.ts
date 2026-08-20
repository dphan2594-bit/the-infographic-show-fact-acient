import { interpolate, spring } from "remotion";
import { FPS } from "./theme";

/**
 * Springy 0→1 used for every element entrance. Slightly overdamped so shapes
 * settle without a visible wobble — the flat-vector look reads as "confident",
 * not bouncy.
 */
export const appear = (frame: number, delay = 0, damping = 200) =>
  spring({
    frame: frame - delay,
    fps: FPS,
    config: { damping, mass: 0.7, stiffness: 110 },
    durationInFrames: 26,
  });

/** A softer pop with a touch of overshoot, for numbers and badges. */
export const pop = (frame: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps: FPS,
    config: { damping: 12, mass: 0.6, stiffness: 140 },
    durationInFrames: 30,
  });

/**
 * Fades an element out over the last `frames` of its scene so cuts never
 * happen on a hard-edged shape.
 */
export const fadeOutTail = (
  frame: number,
  sceneDuration: number,
  frames = 14,
) =>
  interpolate(frame, [sceneDuration - frames, sceneDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Slow continuous drift, in degrees, for orbiting and rotating decoration. */
export const drift = (frame: number, degreesPerSecond: number) =>
  (frame / FPS) * degreesPerSecond;

/** Eased 0→1 ramp between two frames. */
export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
