import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Subtle handheld-style camera shake — low-frequency, low-amplitude so text
 * stays readable. Reserved for `motion: "animate"` scenes (the emotional /
 * core-movement / hook moments from Mục 8), not applied to explanatory
 * static scenes.
 */
export const useCameraShake = (active: boolean): { transform: string } => {
  const frame = useCurrentFrame();
  if (!active) {
    return { transform: "none" };
  }
  const shakeX = Math.sin(frame * 0.5) * 1.6 + Math.sin(frame * 1.3) * 0.7;
  const shakeY = Math.cos(frame * 0.4) * 1.3 + Math.sin(frame * 1.7) * 0.6;
  return { transform: `translate(${shakeX}px, ${shakeY}px)` };
};

/**
 * Quick "punch in" impact zoom that settles with a slight bounce over the
 * first ~15 frames of a scene — the code equivalent of an editor punching
 * in on a cut for emphasis.
 */
export const useImpactPunch = (active: boolean): { transform: string } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!active) {
    return { transform: "none" };
  }
  const progress = spring({ frame, fps, config: { damping: 9, mass: 0.4, stiffness: 120 } });
  // clamp so the background never scales below 1 and reveals an edge gap
  const scale = Math.max(1, 1.08 - 0.08 * progress);
  return { transform: `scale(${scale})` };
};
