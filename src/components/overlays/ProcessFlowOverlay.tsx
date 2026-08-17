import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";

const BOX_SIZE = 160;

/**
 * Horizontal process-flow diagram (archetype E8): boxes pop in one by one
 * and the connecting arrow draws in right after, replacing a static
 * pre-baked flowchart image with a sequence that reads left-to-right.
 */
export const ProcessFlowOverlay: React.FC<{
  steps: { label: string }[];
  accentColor: string;
  y: number;
  staggerFrames?: number;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({
  steps,
  accentColor,
  y,
  staggerFrames = 12,
  entrance = "pop",
  delayFrames = 0,
  idle = "none",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const centerY = (y / 100) * height;

  const margin = width * 0.1;
  const usable = width - margin * 2;
  const centers = steps.map((_, i) =>
    steps.length === 1 ? width / 2 : margin + (usable * i) / (steps.length - 1),
  );

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {centers.slice(0, -1).map((cx, i) => {
          const nextCx = centers[i + 1];
          const startX = cx + BOX_SIZE / 2;
          const endX = nextCx - BOX_SIZE / 2;
          const delay = delayFrames + (i + 1) * staggerFrames;
          const reveal = interpolate(frame - delay, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const currentX = startX + (endX - startX) * reveal;
          return (
            <g key={i}>
              <line
                x1={startX}
                y1={centerY}
                x2={currentX}
                y2={centerY}
                stroke="white"
                strokeWidth={8}
                strokeLinecap="round"
              />
              {reveal > 0.85 ? (
                <polygon
                  points={`${endX - 4},${centerY - 16} ${endX + 14},${centerY} ${endX - 4},${centerY + 16}`}
                  fill="white"
                  opacity={interpolate(reveal, [0.85, 1], [0, 1], {
                    extrapolateLeft: "clamp",
                  })}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      {steps.map((step, i) => (
        <ProcessFlowNode
          key={i}
          label={step.label}
          x={centers[i]}
          y={centerY}
          accentColor={accentColor}
          entrance={entrance}
          delayFrames={delayFrames + i * staggerFrames}
          idle={idle}
        />
      ))}
    </AbsoluteFill>
  );
};

const ProcessFlowNode: React.FC<{
  label: string;
  x: number;
  y: number;
  accentColor: string;
  entrance: Entrance;
  delayFrames: number;
  idle: Idle;
}> = ({ label, x, y, accentColor, entrance, delayFrames, idle }) => {
  const { opacity, transform, filter, clipPath } = useEntranceStyle(entrance, delayFrames, idle);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) ${transform}`,
        opacity,
        filter,
        clipPath,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: BOX_SIZE,
          height: BOX_SIZE,
          borderRadius: 20,
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: accentColor,
          }}
        />
      </div>
      <div
        style={{
          padding: "4px 16px",
          borderRadius: 8,
          backgroundColor: "rgba(0,0,0,0.65)",
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          textTransform: "uppercase",
          letterSpacing: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};
