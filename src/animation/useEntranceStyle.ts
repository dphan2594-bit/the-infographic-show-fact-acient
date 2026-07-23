import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Entrance } from "../scenes/types";

/**
 * Shared entrance animation used by every overlay — the code equivalent of
 * the CapCut motion graphics techniques from Mục 8 of
 * docs/SKILL-FLAT-EXPLAINER.md (scale-in "pop", slide-in, stagger reveal,
 * crossfade). `delayFrames` lets a list of overlays stagger their reveal.
 */
export const useEntranceStyle = (
  entrance: Entrance = "fade",
  delayFrames = 0,
): { opacity: number; transform: string } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - delayFrames;

  if (entrance === "none") {
    return { opacity: 1, transform: "none" };
  }

  const fadeOpacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (entrance === "pop") {
    const scale = spring({ frame: localFrame, fps, config: { damping: 11, mass: 0.5 } });
    return { opacity: fadeOpacity, transform: `scale(${scale})` };
  }

  if (entrance === "fade") {
    return { opacity: fadeOpacity, transform: "none" };
  }

  const distance = 60;
  const offset = interpolate(localFrame, [0, 15], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  switch (entrance) {
    case "slideLeft":
      return { opacity: fadeOpacity, transform: `translateX(${-offset}px)` };
    case "slideRight":
      return { opacity: fadeOpacity, transform: `translateX(${offset}px)` };
    case "slideUp":
      return { opacity: fadeOpacity, transform: `translateY(${offset}px)` };
    case "slideDown":
      return { opacity: fadeOpacity, transform: `translateY(${-offset}px)` };
    default:
      return { opacity: fadeOpacity, transform: "none" };
  }
};
