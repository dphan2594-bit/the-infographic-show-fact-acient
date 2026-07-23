import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Progressive line-draw chart — the code equivalent of "đường biểu đồ vẽ
 * rơi/tăng" (Kling-only movement in the doc) done natively in Remotion via
 * stroke-dashoffset, matching depletion-curve / growth-chart moments.
 */
export const ChartLineOverlay: React.FC<{
  points: { x: number; y: number }[];
  color: string;
  drawEndFrame: number;
  showDot?: boolean;
}> = ({ points, color, drawEndFrame, showDot = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const pixelPoints = points.map((p) => ({ x: (p.x / 100) * width, y: (p.y / 100) * height }));

  let totalLength = 0;
  const cumulative: number[] = [0];
  for (let i = 1; i < pixelPoints.length; i++) {
    const dx = pixelPoints[i].x - pixelPoints[i - 1].x;
    const dy = pixelPoints[i].y - pixelPoints[i - 1].y;
    totalLength += Math.hypot(dx, dy);
    cumulative.push(totalLength);
  }

  const progress = interpolate(frame, [0, drawEndFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drawnLength = totalLength * progress;

  const pathD = pixelPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const leadIndex = cumulative.findIndex((c) => c >= drawnLength);
  const segIndex = leadIndex <= 0 ? 0 : leadIndex - 1;
  const segStart = pixelPoints[segIndex] ?? pixelPoints[0];
  const segEnd = pixelPoints[segIndex + 1] ?? segStart;
  const segLength = cumulative[segIndex + 1] - cumulative[segIndex] || 1;
  const segProgress = (drawnLength - cumulative[segIndex]) / segLength;
  const dotX = segStart.x + (segEnd.x - segStart.x) * segProgress;
  const dotY = segStart.y + (segEnd.y - segStart.y) * segProgress;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
          strokeDashoffset={totalLength - drawnLength}
        />
        {pixelPoints.map((p, i) => {
          const visible = cumulative[i] <= drawnLength + 1;
          return (
            <rect
              key={i}
              x={p.x - 7}
              y={p.y - 7}
              width={14}
              height={14}
              fill={color}
              opacity={visible ? 1 : 0}
            />
          );
        })}
        {showDot && progress < 1 ? <circle cx={dotX} cy={dotY} r={9} fill={color} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
