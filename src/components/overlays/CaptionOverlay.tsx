import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const CaptionOverlay: React.FC<{ text: string; position?: "top" | "bottom" }> = ({
  text,
  position = "bottom",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{ justifyContent: position === "bottom" ? "flex-end" : "flex-start" }}
    >
      <div
        style={{
          margin: position === "bottom" ? "0 auto 64px" : "64px auto 0",
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
