import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * A short flash of colour over the whole frame.
 *
 * On a cut between beats it hides the seam and gives the edit a pulse; on a
 * stressed word it lands like a hit. Keep it brief — six frames is already a
 * lot — and keep the colour close to the artwork's own palette so it reads as
 * light rather than as a glitch.
 */
export const FlashOverlay: React.FC<{
  /** frame within the scene the flash peaks on */
  atFrame?: number;
  color?: string;
  /** frames from black to peak, default 2 */
  attackFrames?: number;
  /** frames from peak back to nothing, default 8 */
  releaseFrames?: number;
  /** peak opacity, default 0.55 */
  intensity?: number;
}> = ({
  atFrame = 0,
  color = "#FFFFFF",
  attackFrames = 2,
  releaseFrames = 8,
  intensity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const local = frame - atFrame;
  if (local < -attackFrames || local > releaseFrames) {
    return null;
  }

  const opacity = interpolate(local, [-attackFrames, 0, releaseFrames], [0, intensity, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <AbsoluteFill style={{ backgroundColor: color, opacity, pointerEvents: "none" }} />;
};
