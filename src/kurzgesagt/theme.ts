/**
 * Design tokens for the flat-vector explainer look: deep space ground,
 * a small set of highly saturated accents, and no gradients on objects
 * themselves — depth comes from glow halos and scale, not shading.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const palette = {
  /** deep space ground, darkest at the edges */
  spaceNear: "#1B2455",
  spaceFar: "#080B22",

  gold: "#FFB627",
  amber: "#FB8500",
  coral: "#EF476F",
  teal: "#06D6A0",
  sky: "#3BB2F6",
  violet: "#8B6FF7",

  ink: "#080B22",
  paper: "#F4F1E8",
  muted: "#9AA2CE",
} as const;

/** The four causes get one accent each, reused every time that cause reappears. */
export const causeColors = {
  overreach: palette.sky,
  money: palette.gold,
  politics: palette.coral,
  pressure: palette.violet,
} as const;

export const font = {
  family: "Nunito",
  /** headline weight */
  black: 900,
  bold: 700,
  regular: 400,
} as const;

/**
 * Scene lengths in frames. Kept in one place so the Series in RomeVideo and
 * any per-scene internal timing read from the same numbers.
 */
export const sceneDurations = {
  title: 150,
  peak: 180,
  overreach: 195,
  money: 210,
  politics: 195,
  pressure: 195,
  split: 165,
  fall: 195,
  outro: 195,
} as const;

export const totalDuration = Object.values(sceneDurations).reduce(
  (sum, d) => sum + d,
  0,
);
