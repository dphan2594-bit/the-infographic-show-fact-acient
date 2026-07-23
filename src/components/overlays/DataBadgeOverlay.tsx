import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance } from "../../scenes/types";

export const DataBadgeOverlay: React.FC<{
  value: string;
  label?: string;
  x: number;
  y: number;
  accentColor: string;
  calloutTo?: { x: number; y: number };
  entrance?: Entrance;
  delayFrames?: number;
}> = ({ value, label, x, y, accentColor, calloutTo, entrance = "pop", delayFrames = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const badge = useEntranceStyle(entrance, delayFrames);
  const lineProgress = interpolate(frame - delayFrames, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const x1 = (x / 100) * width;
  const y1 = (y / 100) * height;
  const x2 = calloutTo ? (calloutTo.x / 100) * width : x1;
  const y2 = calloutTo ? (calloutTo.y / 100) * height : y1;

  return (
    <AbsoluteFill>
      {calloutTo ? (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <line
            x1={x1}
            y1={y1}
            x2={x1 + (x2 - x1) * lineProgress}
            y2={y1 + (y2 - y1) * lineProgress}
            stroke={accentColor}
            strokeWidth={3}
            strokeDasharray="6 6"
            opacity={badge.opacity}
          />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) ${badge.transform}`,
          opacity: badge.opacity,
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            backgroundColor: accentColor,
            border: "6px solid white",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: 900,
              fontSize: 34,
              color: "white",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          {label ? (
            <div
              style={{
                marginTop: 6,
                fontFamily: "Arial, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: 1,
                textAlign: "center",
                padding: "0 8px",
              }}
            >
              {label}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
