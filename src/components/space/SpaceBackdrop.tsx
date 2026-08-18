import { AbsoluteFill } from "remotion";
import { KURZ } from "../../theme/kurzgesagt";
import { GridHorizon } from "./GridHorizon";
import { NebulaGlow } from "./NebulaGlow";
import { Starfield } from "./Starfield";
import { WarpStreaks } from "./WarpStreaks";

/** the four backdrop moods lifted from the reference preview */
export type SpaceVariant = "starfield" | "nebula" | "grid-horizon" | "warp";

export type SpaceBackground = {
  type: "space";
  variant?: SpaceVariant;
  /** overrides the variant's default void colour */
  baseColor?: string;
  /** ground colour for "grid-horizon", streak colour for "warp" */
  accentColor?: string;
  /** star / streak count multiplier, default 1 */
  density?: number;
  /** changes the scatter without changing the look */
  seed?: string;
};

/**
 * Animated space backdrop — always moving, never distracting. Every variant
 * layers the same way: flat void colour, atmosphere, stars, then whatever
 * makes the variant itself (ground plane, warp streaks).
 */
export const SpaceBackdrop: React.FC<{ background: SpaceBackground }> = ({ background }) => {
  const { variant = "starfield", baseColor, accentColor, density = 1, seed } = background;

  const base = baseColor ?? (variant === "warp" ? KURZ.void : KURZ.night);

  return (
    <AbsoluteFill style={{ backgroundColor: base }}>
      {variant === "nebula" || variant === "starfield" ? (
        <NebulaGlow seed={seed} intensity={variant === "nebula" ? 1 : 0.45} />
      ) : null}
      {variant !== "warp" ? (
        <Starfield
          density={variant === "grid-horizon" ? density * 0.9 : density}
          seed={seed}
          driftSpeed={variant === "grid-horizon" ? 3 : 6}
        />
      ) : null}
      {variant === "grid-horizon" ? <GridHorizon groundColor={accentColor} /> : null}
      {variant === "warp" ? (
        <WarpStreaks density={density} seed={seed} color={accentColor} />
      ) : null}
    </AbsoluteFill>
  );
};
