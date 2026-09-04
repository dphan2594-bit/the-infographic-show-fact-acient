/**
 * Deterministic pseudo-randomness.
 *
 * Remotion renders every frame independently — `Math.random()` would give each
 * frame a different starfield and the picture would boil. Every scattered
 * layout in this project therefore comes from a seeded generator, so frame 0
 * and frame 900 agree on where star #37 sits.
 */

/** mulberry32 — small, fast, good enough for scattering dots on a backdrop */
export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** turns a string seed ("starfield") into a number seed */
export const hashSeed = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/**
 * Builds `count` items from a seeded generator. Memoise the result with
 * useMemo so the array is built once per component, not once per frame.
 */
export const generate = <T>(
  seed: string,
  count: number,
  make: (rand: () => number, index: number) => T,
): T[] => {
  const rand = createRandom(hashSeed(seed));
  return Array.from({ length: count }, (_, index) => make(rand, index));
};
