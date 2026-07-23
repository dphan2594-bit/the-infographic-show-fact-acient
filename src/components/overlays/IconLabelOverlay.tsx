import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const IconLabelOverlay: React.FC<{
  label: string;
  x: number;
  y: number;
}> = ({ label, x, y }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, 10], [12, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) translateY(${translateY}px)`,
          opacity,
        }}
      >
        <div
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            backgroundColor: "rgba(0,0,0,0.65)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            textTransform: "uppercase",
            letterSpacing: 1,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
