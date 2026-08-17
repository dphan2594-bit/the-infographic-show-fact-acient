import { useCurrentFrame, useVideoConfig } from "remotion";
import { getPresetStyle, type EntranceName, type IdleName, type PresetStyle } from "./presets";

/**
 * Shared entrance animation used by every overlay — the code equivalent of
 * the CapCut motion graphics techniques from Mục 8 of
 * docs/SKILL-FLAT-EXPLAINER.md (scale-in "pop", slide-in, stagger reveal,
 * crossfade), plus the After Effects style preset library in
 * `src/animation/presets.ts` (fade-up, blur-in, whip, flip, stamp, wipe...).
 *
 * `delayFrames` lets a list of overlays stagger their reveal; `idle` layers a
 * looping motion (wiggle/float/pulse...) on top once the entrance settles.
 *
 * Returns `transform: ""` — not `"none"` — when there is nothing to apply, so
 * callers can safely concatenate it after their own transform:
 * `transform: \`translate(-50%, -50%) ${transform}\``.
 */
export const useEntranceStyle = (
  entrance: EntranceName = "fade",
  delayFrames = 0,
  idle: IdleName = "none",
): PresetStyle => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return getPresetStyle({ frame, fps, entrance, delayFrames, idle });
};
