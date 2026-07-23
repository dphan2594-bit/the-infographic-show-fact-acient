import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const DateHudOverlay: React.FC<{ date: string }> = ({ date }) => {
  const frame = useCurrentFrame();
  const translateX = interpolate(frame, [0, 12], [-40, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          transform: `translateX(${translateX}px)`,
          opacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 20 }}>📅</div>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: "#222",
          }}
        >
          {date}
        </div>
      </div>
    </AbsoluteFill>
  );
};
