import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const DataBadgeOverlay: React.FC<{
  value: string;
  label?: string;
  x: number;
  y: number;
  accentColor: string;
  calloutTo?: { x: number; y: number };
}> = ({ value, label, x, y, accentColor, calloutTo }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 10, mass: 0.5 } });

  return (
    <AbsoluteFill>
      {calloutTo ? (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0 }}
        >
          <line
            x1={(x / 100) * width}
            y1={(y / 100) * height}
            x2={(calloutTo.x / 100) * width}
            y2={(calloutTo.y / 100) * height}
            stroke={accentColor}
            strokeWidth={3}
            strokeDasharray="6 6"
            opacity={pop}
          />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) scale(${pop})`,
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
