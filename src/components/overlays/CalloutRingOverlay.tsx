import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useFrameScale } from "../../animation/useFrameScale";

/**
 * Draws a ring around something in the picture, optionally with a leader line
 * out to a label. The ring draws itself on rather than appearing, which is
 * what makes it read as "look here" instead of as a sticker.
 */
export const CalloutRingOverlay: React.FC<{
  /** centre of the ring, in percent of the frame */
  x: number;
  y: number;
  /** radii in percent of frame width / height */
  radiusX: number;
  radiusY: number;
  color?: string;
  strokeWidth?: number;
  /** frames the ring takes to draw itself, default 18 */
  drawFrames?: number;
  /** end of a leader line drawn out of the ring, in percent */
  leaderX?: number;
  leaderY?: number;
  /** dash the ring, like a target marker */
  dashed?: boolean;
  /** pulse the ring after it has drawn */
  pulse?: boolean;
}> = ({
  x,
  y,
  radiusX,
  radiusY,
  color = "#FF4D6D",
  strokeWidth = 5,
  drawFrames = 18,
  leaderX,
  leaderY,
  dashed = false,
  pulse = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const scale = useFrameScale();

  const cx = (x / 100) * width;
  const cy = (y / 100) * height;
  const rx = (radiusX / 100) * width;
  const ry = (radiusY / 100) * height;

  // Ramanujan's perimeter approximation, so the dash pattern that draws the
  // ring on is the right length whatever its shape
  const h = ((rx - ry) / (rx + ry)) ** 2;
  const perimeter = Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

  const drawn = interpolate(frame, [0, drawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const breathe = pulse ? 1 + Math.sin((frame - drawFrames) * 0.12) * 0.02 : 1;
  const leaderProgress = interpolate(frame, [drawFrames, drawFrames + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {leaderX !== undefined && leaderY !== undefined ? (
          <line
            x1={cx}
            y1={cy}
            x2={cx + ((leaderX / 100) * width - cx) * leaderProgress}
            y2={cy + ((leaderY / 100) * height - cy) * leaderProgress}
            stroke={color}
            strokeWidth={strokeWidth * scale * 0.7}
            strokeLinecap="round"
            strokeDasharray={`${10 * scale} ${8 * scale}`}
          />
        ) : null}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * (drawn > 0.99 ? breathe : 1)}
          ry={ry * (drawn > 0.99 ? breathe : 1)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * scale}
          strokeLinecap="round"
          strokeDasharray={
            dashed && drawn > 0.99
              ? `${18 * scale} ${12 * scale}`
              : `${perimeter * drawn} ${perimeter}`
          }
          // Start the draw at the top of the ring rather than at three
          // o'clock. Rotating the element would do it too, but it would also
          // stand the ellipse on its side — a ring sized to a wide subject
          // came out tall. Shifting the dash pattern a quarter of the way
          // round moves only the starting point.
          strokeDashoffset={-perimeter / 4}
        />
      </svg>
    </AbsoluteFill>
  );
};
