import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const CaptionOverlay: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div
        style={{
          margin: "0 auto 64px",
          maxWidth: "80%",
          opacity,
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "14px 28px",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 600,
            fontSize: 26,
            color: "white",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
