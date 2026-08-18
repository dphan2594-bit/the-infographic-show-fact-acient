import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { KURZ } from "../../theme/kurzgesagt";

const VERTICAL_LINES = 21;
const HORIZONTAL_LINES = 14;

/**
 * The curved grid plane the reference art stands its characters on: a flat
 * colour "planet surface" whose top edge is an ellipse (so it reads as a
 * horizon curving away), with a perspective grid scrolling toward camera.
 *
 * The scroll is what sells it — horizontal lines are spaced by a squared
 * ramp, so they bunch up at the horizon and spread out near the viewer, and
 * the whole ladder advances by one slot per cycle and wraps seamlessly.
 */
export const GridHorizon: React.FC<{
  /** where the horizon sits, in percent of frame height */
  horizonPercent?: number;
  groundColor?: string;
  lineColor?: string;
  /** grid rows advanced per second */
  speed?: number;
}> = ({
  horizonPercent = 62,
  groundColor = KURZ.ground,
  lineColor = KURZ.gridLine,
  speed = 0.55,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const horizonY = (horizonPercent / 100) * height;
  const groundHeight = height - horizonY;
  // The ground is the top of a very large ellipse: its apex sits at the
  // horizon in the middle of the frame and drops away toward both edges, so
  // the plane reads as a planet curving off, not as a flat floor.
  const curveRx = width * 0.92;
  const curveRy = groundHeight * 0.5;
  const centerX = width / 2;
  // where that arc meets the left and right edges of the frame
  const edgeDrop = curveRy * (1 - Math.sqrt(Math.max(0, 1 - (centerX / curveRx) ** 2)));
  const edgeY = horizonY + edgeDrop;
  const groundPath = `M 0 ${edgeY} A ${curveRx} ${curveRy} 0 0 1 ${width} ${edgeY} L ${width} ${height} L 0 ${height} Z`;
  const phase = ((frame / fps) * speed) % 1;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* clip everything to the ground shape so no line escapes into the sky */}
          <clipPath id="grid-horizon-clip">
            <path d={groundPath} />
          </clipPath>
        </defs>
        <g clipPath="url(#grid-horizon-clip)">
          <path d={groundPath} fill={groundColor} />
          {Array.from({ length: VERTICAL_LINES }, (_, i) => {
            const t = i / (VERTICAL_LINES - 1);
            // all verticals converge on the vanishing point at the horizon
            const bottomX = centerX + (t - 0.5) * width * 3.4;
            return (
              <line
                key={`v-${i}`}
                x1={centerX}
                y1={horizonY}
                x2={bottomX}
                y2={height}
                stroke={lineColor}
                strokeWidth={1.5}
                opacity={0.45}
              />
            );
          })}
          {Array.from({ length: HORIZONTAL_LINES }, (_, i) => {
            const t = (i + phase) / HORIZONTAL_LINES;
            // squared ramp = perspective: dense at the horizon, open up close
            const y = horizonY + groundHeight * t * t;
            const fade = Math.min(1, t * 3);
            return (
              <line
                key={`h-${i}`}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke={lineColor}
                strokeWidth={1.5}
                opacity={0.5 * fade}
              />
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
