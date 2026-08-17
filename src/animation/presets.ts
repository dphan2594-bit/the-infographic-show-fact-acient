import { Easing, interpolate, spring } from "remotion";

/**
 * After Effects style animation presets, in code.
 *
 * Adobe After Effects ships "Animation Presets" (Effects & Presets panel):
 * named, drag-and-drop moves like Fade Up, Pop, Blur In, Flip In, Roll In,
 * plus the classic `wiggle()` expression for idle motion. This module is the
 * Remotion equivalent — every preset is a pure function of the local frame,
 * so it can be used from a hook (see useEntranceStyle) or evaluated directly
 * (see src/PresetGallery.tsx, which previews all of them side by side).
 *
 * Two families:
 *   - ENTRANCE presets: play once when an overlay appears (AE "In" presets).
 *   - IDLE presets: loop forever after the entrance settles (AE wiggle/loopOut).
 */

export type PresetStyle = {
  opacity: number;
  /** CSS transform list — "" (not "none") when identity, so it stays concatenable */
  transform: string;
  filter?: string;
  clipPath?: string;
};

export type PresetContext = {
  /** frame local to the preset: 0 = the moment the entrance starts */
  frame: number;
  fps: number;
};

/** Legacy names kept from the original Mục 8 motion set — still valid. */
export type LegacyEntranceName =
  | "pop"
  | "slideLeft"
  | "slideRight"
  | "slideUp"
  | "slideDown"
  | "fade"
  | "none";

/** After Effects style presets added on top of the legacy set. */
export type AeEntranceName =
  | "fade-up"
  | "overshoot"
  | "elastic-drop"
  | "blur-in"
  | "whip-left"
  | "whip-right"
  | "flip-in-x"
  | "flip-in-y"
  | "roll-in"
  | "zoom-punch"
  | "stamp"
  | "wipe-up"
  | "wipe-right"
  | "swing-in";

export type EntranceName = LegacyEntranceName | AeEntranceName;

export type IdleName = "none" | "wiggle" | "float" | "pulse" | "sway" | "breathe";

export type EntrancePreset = {
  name: EntranceName;
  /** the After Effects preset this mirrors, for anyone coming from AE */
  label: string;
  description: string;
  /** frames the move needs to settle at 30fps — use it to plan stagger delays */
  durationInFrames: number;
  apply: (ctx: PresetContext) => PresetStyle;
};

export type IdlePreset = {
  name: IdleName;
  label: string;
  description: string;
  apply: (ctx: PresetContext) => PresetStyle;
};

const IDENTITY: PresetStyle = { opacity: 1, transform: "" };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const fadeIn = (frame: number, frames = 10) => interpolate(frame, [0, frames], [0, 1], clamp);

const easeOut = Easing.out(Easing.cubic);

const round = (value: number, digits = 3) => Number(value.toFixed(digits));

const slide = (frame: number, axis: "X" | "Y", from: number): PresetStyle => {
  const offset = interpolate(frame, [0, 15], [from, 0], clamp);
  return {
    opacity: fadeIn(frame),
    transform: `translate${axis}(${round(offset, 2)}px)`,
  };
};

const ENTRANCE_PRESETS: EntrancePreset[] = [
  {
    name: "none",
    label: "No animation",
    description: "Fully visible from frame 0 — for elements that must not move.",
    durationInFrames: 0,
    apply: () => IDENTITY,
  },
  {
    name: "fade",
    label: "Fade In",
    description: "Plain opacity dissolve over 10 frames.",
    durationInFrames: 10,
    apply: ({ frame }) => ({ opacity: fadeIn(frame), transform: "" }),
  },
  {
    name: "pop",
    label: "Scale In (Pop)",
    description: "Springy scale from 0 — the default badge/callout entrance.",
    durationInFrames: 20,
    apply: ({ frame, fps }) => {
      const scale = spring({ frame, fps, config: { damping: 11, mass: 0.5 } });
      return { opacity: fadeIn(frame), transform: `scale(${round(scale)})` };
    },
  },
  {
    name: "slideLeft",
    label: "Slide In From Right",
    description: "Slides 60px leftward into place while fading in.",
    durationInFrames: 15,
    apply: ({ frame }) => slide(frame, "X", -60),
  },
  {
    name: "slideRight",
    label: "Slide In From Left",
    description: "Slides 60px rightward into place while fading in.",
    durationInFrames: 15,
    apply: ({ frame }) => slide(frame, "X", 60),
  },
  {
    name: "slideUp",
    label: "Slide In From Below",
    description: "Slides 60px upward into place while fading in.",
    durationInFrames: 15,
    apply: ({ frame }) => slide(frame, "Y", 60),
  },
  {
    name: "slideDown",
    label: "Slide In From Above",
    description: "Slides 60px downward into place while fading in.",
    durationInFrames: 15,
    apply: ({ frame }) => slide(frame, "Y", -60),
  },
  {
    name: "fade-up",
    label: "Fade Up",
    description:
      "AE's Fade Up text preset: a short 40px rise on an ease-out curve with a soft fade. The safest entrance for body text and captions.",
    durationInFrames: 18,
    apply: ({ frame }) => {
      const offset = interpolate(frame, [0, 18], [40, 0], {
        ...clamp,
        easing: easeOut,
      });
      return {
        opacity: fadeIn(frame, 12),
        transform: `translateY(${round(offset, 2)}px)`,
      };
    },
  },
  {
    name: "overshoot",
    label: "Scale In (Overshoot)",
    description:
      "Under-damped spring that scales past 100% and settles back — the bouncy title look, more energetic than plain Pop.",
    durationInFrames: 26,
    apply: ({ frame, fps }) => {
      const progress = spring({
        frame,
        fps,
        config: { damping: 8, mass: 0.7, stiffness: 140 },
      });
      const scale = 0.6 + 0.4 * progress;
      return { opacity: fadeIn(frame, 8), transform: `scale(${round(scale)})` };
    },
  },
  {
    name: "elastic-drop",
    label: "Drop In (Elastic)",
    description:
      "Falls in from above and bounces to rest, with a small squash at the landing. For emphatic numbers and stamps.",
    durationInFrames: 32,
    apply: ({ frame, fps }) => {
      const progress = spring({
        frame,
        fps,
        config: { damping: 9, mass: 0.8, stiffness: 140 },
      });
      const offset = (1 - progress) * -180;
      // squash follows the overshoot: past 1 the element is compressing
      const squash = 1 - (progress - 1) * 0.18;
      return {
        opacity: fadeIn(frame, 6),
        transform: `translateY(${round(offset, 2)}px) scaleY(${round(squash)})`,
      };
    },
  },
  {
    name: "blur-in",
    label: "Blur In (Dissolve)",
    description:
      "Gaussian blur racks from 24px to sharp while the element eases down from 106% — AE's blurry dissolve.",
    durationInFrames: 16,
    apply: ({ frame }) => {
      const blur = interpolate(frame, [0, 16], [24, 0], {
        ...clamp,
        easing: easeOut,
      });
      const scale = interpolate(frame, [0, 16], [1.06, 1], {
        ...clamp,
        easing: easeOut,
      });
      return {
        opacity: fadeIn(frame, 12),
        transform: `scale(${round(scale)})`,
        filter: blur > 0.05 ? `blur(${round(blur, 2)}px)` : undefined,
      };
    },
  },
  {
    name: "whip-left",
    label: "Whip Pan In From Right",
    description:
      "Fast horizontal whip from the right with directional motion blur that resolves as it lands.",
    durationInFrames: 18,
    apply: ({ frame, fps }) => whip(frame, fps, 320),
  },
  {
    name: "whip-right",
    label: "Whip Pan In From Left",
    description:
      "Fast horizontal whip from the left with directional motion blur that resolves as it lands.",
    durationInFrames: 18,
    apply: ({ frame, fps }) => whip(frame, fps, -320),
  },
  {
    name: "flip-in-x",
    label: "Flip In (X axis)",
    description:
      "3D card flip around the horizontal axis — the element swings up flat into the frame.",
    durationInFrames: 22,
    apply: ({ frame, fps }) => flip(frame, fps, "X", -92),
  },
  {
    name: "flip-in-y",
    label: "Flip In (Y axis)",
    description: "3D card flip around the vertical axis, like a sign turning to face camera.",
    durationInFrames: 22,
    apply: ({ frame, fps }) => flip(frame, fps, "Y", 92),
  },
  {
    name: "roll-in",
    label: "Roll In",
    description: "Rotates in from the left while translating — AE's Roll In, good for icon badges.",
    durationInFrames: 22,
    apply: ({ frame, fps }) => {
      const progress = spring({
        frame,
        fps,
        config: { damping: 13, mass: 0.6, stiffness: 120 },
      });
      const offset = (1 - progress) * -140;
      const rotation = (1 - progress) * -22;
      return {
        opacity: fadeIn(frame, 8),
        transform: `translateX(${round(offset, 2)}px) rotate(${round(rotation, 2)}deg)`,
      };
    },
  },
  {
    name: "zoom-punch",
    label: "Zoom In (Punch)",
    description:
      "Rushes in from 170% to 100% on an ease-out — the impact hit for a hook line or a big number.",
    durationInFrames: 14,
    apply: ({ frame }) => {
      const scale = interpolate(frame, [0, 14], [1.7, 1], {
        ...clamp,
        easing: easeOut,
      });
      const blur = interpolate(frame, [0, 8], [8, 0], {
        ...clamp,
        easing: easeOut,
      });
      return {
        opacity: fadeIn(frame, 6),
        transform: `scale(${round(scale)})`,
        filter: blur > 0.05 ? `blur(${round(blur, 2)}px)` : undefined,
      };
    },
  },
  {
    name: "stamp",
    label: "Stamp",
    description:
      "Slams in from 260%, undershoots to 94% and settles — the rubber-stamp hit for reveals.",
    durationInFrames: 16,
    apply: ({ frame }) => {
      const scale = interpolate(frame, [0, 7, 12, 16], [2.6, 0.94, 1.02, 1], {
        ...clamp,
        easing: easeOut,
      });
      const blur = interpolate(frame, [0, 7], [12, 0], clamp);
      return {
        opacity: fadeIn(frame, 4),
        transform: `scale(${round(scale)})`,
        filter: blur > 0.05 ? `blur(${round(blur, 2)}px)` : undefined,
      };
    },
  },
  {
    name: "wipe-up",
    label: "Linear Wipe (Up)",
    description:
      "Clip-path wipe: the element is revealed from its bottom edge upward, no movement. Good over busy artwork where a slide would read as clutter.",
    durationInFrames: 18,
    apply: ({ frame }) => {
      const hidden = interpolate(frame, [0, 18], [100, 0], {
        ...clamp,
        easing: easeOut,
      });
      return {
        opacity: frame < 0 ? 0 : 1,
        transform: "",
        clipPath: `inset(${round(hidden, 2)}% 0% 0% 0%)`,
      };
    },
  },
  {
    name: "wipe-right",
    label: "Linear Wipe (Right)",
    description: "Clip-path wipe revealing from the left edge rightward, like a bar filling in.",
    durationInFrames: 18,
    apply: ({ frame }) => {
      const hidden = interpolate(frame, [0, 18], [100, 0], {
        ...clamp,
        easing: easeOut,
      });
      return {
        opacity: frame < 0 ? 0 : 1,
        transform: "",
        clipPath: `inset(0% ${round(hidden, 2)}% 0% 0%)`,
      };
    },
  },
  {
    name: "swing-in",
    label: "Swing In",
    description:
      "Hinges in from the top-left corner with a pendulum settle — playful, for icon labels.",
    durationInFrames: 28,
    apply: ({ frame, fps }) => {
      const progress = spring({
        frame,
        fps,
        config: { damping: 9, mass: 0.8, stiffness: 110 },
      });
      const rotation = (1 - progress) * -70;
      return {
        opacity: fadeIn(frame, 8),
        transform: `rotate(${round(rotation, 2)}deg)`,
      };
    },
  },
];

function whip(frame: number, fps: number, from: number): PresetStyle {
  const progress = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 200 },
  });
  const offset = (1 - progress) * from;
  const blur = Math.min(20, Math.abs(offset) * 0.09);
  return {
    opacity: fadeIn(frame, 5),
    transform: `translateX(${round(offset, 2)}px)`,
    filter: blur > 0.05 ? `blur(${round(blur, 2)}px)` : undefined,
  };
}

function flip(frame: number, fps: number, axis: "X" | "Y", fromDegrees: number): PresetStyle {
  const progress = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 130 },
  });
  const rotation = (1 - progress) * fromDegrees;
  return {
    opacity: fadeIn(frame, 6),
    // perspective must lead the transform list for the rotation to read as 3D
    transform: `perspective(1200px) rotate${axis}(${round(rotation, 2)}deg)`,
  };
}

const IDLE_PRESETS: IdlePreset[] = [
  {
    name: "none",
    label: "Hold",
    description: "No idle motion once the entrance settles.",
    apply: () => IDENTITY,
  },
  {
    name: "wiggle",
    label: "Wiggle",
    description:
      "AE's wiggle(2, 6) expression: layered sine waves at incommensurate frequencies, so the drift never visibly repeats.",
    apply: ({ frame }) => ({
      opacity: 1,
      transform: `translate(${round(Math.sin(frame * 0.21) * 4 + Math.sin(frame * 0.37) * 2.4, 2)}px, ${round(
        Math.cos(frame * 0.17) * 3.4 + Math.sin(frame * 0.41) * 2,
        2,
      )}px)`,
    }),
  },
  {
    name: "float",
    label: "Float",
    description: "Slow 10px vertical bob — keeps a static badge from looking frozen.",
    apply: ({ frame }) => ({
      opacity: 1,
      transform: `translateY(${round(Math.sin(frame * 0.06) * 10, 2)}px)`,
    }),
  },
  {
    name: "pulse",
    label: "Pulse",
    description: "±2% scale heartbeat, for a badge that should pull the eye.",
    apply: ({ frame }) => ({
      opacity: 1,
      transform: `scale(${round(1 + Math.sin(frame * 0.15) * 0.02)})`,
    }),
  },
  {
    name: "sway",
    label: "Sway",
    description: "±1.5° rotation on a long period — a hanging-sign feel.",
    apply: ({ frame }) => ({
      opacity: 1,
      transform: `rotate(${round(Math.sin(frame * 0.05) * 1.5, 2)}deg)`,
    }),
  },
  {
    name: "breathe",
    label: "Breathe",
    description: "Very slow scale + opacity swell, the calmest of the idle loops.",
    apply: ({ frame }) => ({
      opacity: 0.94 + Math.sin(frame * 0.045) * 0.06,
      transform: `scale(${round(1 + Math.sin(frame * 0.045) * 0.015)})`,
    }),
  },
];

const ENTRANCE_BY_NAME = new Map(ENTRANCE_PRESETS.map((preset) => [preset.name, preset]));
const IDLE_BY_NAME = new Map(IDLE_PRESETS.map((preset) => [preset.name, preset]));

export const entrancePresets = ENTRANCE_PRESETS;
export const idlePresets = IDLE_PRESETS;

export const getEntrancePreset = (name: EntranceName = "fade"): EntrancePreset =>
  ENTRANCE_BY_NAME.get(name) ?? ENTRANCE_BY_NAME.get("fade")!;

export const getIdlePreset = (name: IdleName = "none"): IdlePreset =>
  IDLE_BY_NAME.get(name) ?? IDLE_BY_NAME.get("none")!;

export type PresetStyleOptions = {
  frame: number;
  fps: number;
  entrance?: EntranceName;
  /** frames to wait, within the scene, before the entrance starts */
  delayFrames?: number;
  /** looping motion that takes over once the entrance has settled */
  idle?: IdleName;
};

/**
 * Evaluates an entrance preset (and any idle loop layered on top of it) at a
 * given frame. Pure — no hooks — so the same call works inside a component,
 * inside a loop in the preset gallery, or in a test.
 *
 * The idle loop ramps in over 8 frames *after* the entrance has settled, so
 * the two never fight each other for the same transform.
 */
export const getPresetStyle = ({
  frame,
  fps,
  entrance = "fade",
  delayFrames = 0,
  idle = "none",
}: PresetStyleOptions): PresetStyle => {
  const preset = getEntrancePreset(entrance);
  const localFrame = frame - delayFrames;
  const entranceStyle = preset.apply({ frame: localFrame, fps });

  if (idle === "none") {
    return entranceStyle;
  }

  const idleRamp = interpolate(
    localFrame,
    [preset.durationInFrames, preset.durationInFrames + 8],
    [0, 1],
    clamp,
  );
  if (idleRamp === 0) {
    return entranceStyle;
  }

  const idleStyle = getIdlePreset(idle).apply({
    frame: localFrame - preset.durationInFrames,
    fps,
  });
  const transform = [entranceStyle.transform, scaleTransformStrength(idleStyle.transform, idleRamp)]
    .filter(Boolean)
    .join(" ");

  return {
    ...entranceStyle,
    opacity: entranceStyle.opacity * (1 - idleRamp + idleRamp * idleStyle.opacity),
    transform,
  };
};

/**
 * Fades an idle transform in by interpolating its numeric arguments toward
 * their neutral values (0 for translate/rotate, 1 for scale), so the loop
 * starts from exactly where the entrance left off instead of snapping.
 */
const scaleTransformStrength = (transform: string, strength: number): string => {
  if (strength >= 1 || transform === "") {
    return transform;
  }
  return transform.replace(/(-?\d+(?:\.\d+)?)(px|deg)?/g, (match, value: string, unit?: string) => {
    const numeric = Number(value);
    // unitless numbers are scale factors, which are neutral at 1 rather than 0
    const neutral = unit ? 0 : 1;
    return `${round(neutral + (numeric - neutral) * strength)}${unit ?? ""}`;
  });
};
