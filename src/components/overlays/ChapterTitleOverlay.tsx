import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const ChapterTitleOverlay: React.FC<{
  title: string;
  subtitle?: string;
  accentColor: string;
}> = ({ title, subtitle, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          textAlign: "center",
          padding: "0 8%",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 24px",
            borderRadius: 999,
            backgroundColor: accentColor,
            color: "white",
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 2,
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          Chapter
        </div>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 900,
            fontSize: 64,
            color: "white",
            textShadow: "0 6px 0 rgba(0,0,0,0.25)",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 20,
              fontFamily: "Arial, sans-serif",
              fontWeight: 500,
              fontSize: 28,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
