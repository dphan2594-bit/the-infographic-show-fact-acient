import { AbsoluteFill } from "remotion";
import { Starfield } from "../space/Starfield";

/**
 * The starfield as an overlay, for laying twinkle on top of finished artwork.
 *
 * A flat illustration already has its stars painted in; sprinkling a sparse,
 * *non-drifting* twinkle layer over it makes the whole sky read as alive
 * without any of the new stars sliding out of register with the art.
 */
export const StarLayerOverlay: React.FC<{
  density?: number;
  seed?: string;
  /** pixels per second of parallax drift — keep at 0 over existing artwork */
  driftSpeed?: number;
  opacity?: number;
}> = ({ density = 0.5, seed = "star-layer", driftSpeed = 0, opacity = 0.9 }) => (
  <AbsoluteFill style={{ opacity }}>
    <Starfield density={density} seed={seed} driftSpeed={driftSpeed} />
  </AbsoluteFill>
);
