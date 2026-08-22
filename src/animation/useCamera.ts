import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { resolveCameraPreset, type CameraPresetName } from "./cameraPresets";

/**
 * Keyframed camera for a scene: a list of shots the camera eases between,
 * plus a continuous drift so it never sits perfectly still.
 *
 * Positions are given as the point of the frame the camera should centre on,
 * in percent, which is the way you actually think about a move ("push in on
 * the sun, then pull back and drift over to the spacecraft").
 */
export type CameraKeyframe = {
  /** where in the scene this pose is reached, 0-100 percent of its duration */
  at: number;
  /** scale, 1 = fit. Above ~1.4 a 1080p-ish still starts to look soft */
  zoom?: number;
  /** the point to centre on, in percent of the frame (50/50 = no pan) */
  focusX?: number;
  focusY?: number;
};

export type CameraConfig = {
  /** name of a move from src/animation/cameraPresets.ts, resolved to keyframes */
  preset?: CameraPresetName;
  /** the point a preset move is about, in percent of the frame */
  focusX?: number;
  focusY?: number;
  /** scales how far a preset travels, default 1 */
  intensity?: number;
  keyframes?: CameraKeyframe[];
  /** continuous floating drift, in percent of the frame */
  driftPercent?: number;
  /** seconds for one drift cycle */
  driftSeconds?: number;
  /** legacy single-move form, still supported */
  zoomFrom?: number;
  zoomTo?: number;
  panXPercent?: number;
  panYPercent?: number;
};

const easeInOut = Easing.inOut(Easing.cubic);

/**
 * A pan is clamped to what the zoom can actually cover: panning further than
 * `(1 - 1/zoom) / 2` would drag the edge of the artwork into frame.
 */
const clampPan = (pan: number, zoom: number) => {
  const limit = Math.max(0, (1 - 1 / zoom) / 2) * 100;
  return Math.max(-limit, Math.min(limit, pan));
};

export const useCameraTransform = (
  cameraInput: CameraConfig | undefined,
  durationInFrames: number,
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!cameraInput) {
    return "";
  }

  // a preset expands into the same keyframe track a hand-written move uses;
  // explicit keyframes on the same object still win
  const camera: CameraConfig = cameraInput.preset
    ? {
        ...resolveCameraPreset({
          preset: cameraInput.preset,
          focusX: cameraInput.focusX,
          focusY: cameraInput.focusY,
          intensity: cameraInput.intensity,
          driftPercent: cameraInput.driftPercent,
          driftSeconds: cameraInput.driftSeconds,
        }),
        ...(cameraInput.keyframes ? { keyframes: cameraInput.keyframes } : {}),
      }
    : cameraInput;

  const keyframes: CameraKeyframe[] =
    camera.keyframes && camera.keyframes.length > 0
      ? camera.keyframes
      : [
          { at: 0, zoom: camera.zoomFrom ?? 1, focusX: 50, focusY: 50 },
          {
            at: 100,
            zoom: camera.zoomTo ?? 1,
            // legacy pans were expressed as a translate, which is the negative
            // of the point being centred on
            focusX: 50 - (camera.panXPercent ?? 0),
            focusY: 50 - (camera.panYPercent ?? 0),
          },
        ];

  const frames = keyframes.map((k) => (k.at / 100) * durationInFrames);
  const track = (pick: (k: CameraKeyframe) => number) =>
    keyframes.length === 1
      ? pick(keyframes[0])
      : interpolate(frame, frames, keyframes.map(pick), {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeInOut,
        });

  const zoom = track((k) => k.zoom ?? 1);
  const focusX = track((k) => k.focusX ?? 50);
  const focusY = track((k) => k.focusY ?? 50);

  // drift keeps the frame alive between keyframes, and runs on two different
  // periods per axis so the path is a slow figure-of-eight, not a circle
  const drift = camera.driftPercent ?? 0;
  const driftSeconds = camera.driftSeconds ?? 9;
  const seconds = frame / fps;
  const driftX = drift ? Math.sin((seconds / driftSeconds) * Math.PI * 2) * drift : 0;
  const driftY = drift ? Math.sin((seconds / (driftSeconds * 1.6)) * Math.PI * 2) * drift * 0.7 : 0;

  const panX = clampPan(50 - focusX + driftX, zoom);
  const panY = clampPan(50 - focusY + driftY, zoom);

  return `scale(${zoom.toFixed(4)}) translate(${panX.toFixed(3)}%, ${panY.toFixed(3)}%)`;
};
