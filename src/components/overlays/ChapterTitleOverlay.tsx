import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";

export const ChapterTitleOverlay: React.FC<{
  title: string;
  subtitle?: string;
  accentColor: string;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({ title, subtitle, accentColor, entrance = "pop", delayFrames = 0, idle = "none" }) => {
  const frame = useCurrentFrame();
  const badge = useEntranceStyle("slideDown", delayFrames);
  const titleStyle = useEntranceStyle(entrance, delayFrames + 4, idle);
  const subtitleStyle = useEntranceStyle("fade-up", delayFrames + 10);
  const patternShift = (frame * 0.6) % 80;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -80,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 40px)",
          transform: `translate(${patternShift}px, ${patternShift}px)`,
        }}
      />
      <div style={{ textAlign: "center", padding: "0 8%", position: "relative" }}>
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
            opacity: badge.opacity,
            transform: badge.transform,
            filter: badge.filter,
            clipPath: badge.clipPath,
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
            opacity: titleStyle.opacity,
            transform: titleStyle.transform,
            filter: titleStyle.filter,
            clipPath: titleStyle.clipPath,
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
              opacity: subtitleStyle.opacity,
              transform: subtitleStyle.transform,
              filter: subtitleStyle.filter,
              clipPath: subtitleStyle.clipPath,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
