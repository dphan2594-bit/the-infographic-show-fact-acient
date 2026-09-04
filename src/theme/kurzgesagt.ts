/**
 * Palette for the Kurzgesagt-style space look: deep navy void, saturated flat
 * accents, no gradients on the objects themselves (only on the glows).
 * Sampled from the FLATVERSE reference preview.
 */
export const KURZ = {
  /** near-black void, for warp / deep space scenes */
  void: "#06081C",
  /** deep navy, the default backdrop */
  night: "#0B1147",
  /** ground-plane blue of the grid-horizon shots */
  ground: "#1E37D8",
  gridLine: "#5B8CFF",
  purple: "#7B5CFF",
  violet: "#A78BFA",
  cyan: "#22D3EE",
  pink: "#F43F5E",
  yellow: "#FBBF24",
  mint: "#34D399",
  star: "#FFFFFF",
  starDim: "#8FA3E8",
} as const;

/** accent order used when something needs "the next colour" without being told */
export const KURZ_ACCENTS = [KURZ.cyan, KURZ.pink, KURZ.yellow, KURZ.violet, KURZ.mint] as const;
