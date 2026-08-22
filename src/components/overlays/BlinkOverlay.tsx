import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Makes a painted character blink.
 *
 * Flat artwork draws eyes as a couple of dark strokes, so covering them with a
 * patch of the surrounding skin colour for two frames reads exactly like a
 * blink. It is the cheapest possible motion and the one the eye notices most —
 * a face that blinks stops looking like a sticker.
 *
 * Sample the skin colour from the artwork right next to the eyes, and keep the
 * patch just big enough to cover them.
 */
export const BlinkOverlay: React.FC<{
  /** centre of the eye area, in percent of the frame */
  x: number;
  y: number;
  /** size of the patch, in percent of the frame */
  width: number;
  height: number;
  /** the skin colour sampled beside the eyes */
  color: string;
  /** seconds between blinks, default 4 */
  periodSeconds?: number;
  /** frames the eyes stay shut, default 3 */
  closedFrames?: number;
  /** offsets this face's blinks from another's, in seconds */
  offsetSeconds?: number;
  /** rounding of the patch, in percent — 50 gives an oval */
  radiusPercent?: number;
}> = ({
  x,
  y,
  width,
  height,
  color,
  periodSeconds = 4,
  closedFrames = 3,
  offsetSeconds = 0,
  radiusPercent = 45,
}) => {
  const frame = useCurrentFrame();
  const { width: frameWidth, height: frameHeight, fps } = useVideoConfig();

  const period = periodSeconds * fps;
  const phase = (frame + offsetSeconds * fps) % period;
  if (phase >= closedFrames) {
    return null;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: ((x - width / 2) / 100) * frameWidth,
          top: ((y - height / 2) / 100) * frameHeight,
          width: (width / 100) * frameWidth,
          height: (height / 100) * frameHeight,
          backgroundColor: color,
          borderRadius: `${radiusPercent}%`,
        }}
      />
    </AbsoluteFill>
  );
};
