import { AbsoluteFill } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";
import { useFrameScale } from "../../animation/useFrameScale";

export const DateHudOverlay: React.FC<{
  date: string;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({ date, entrance = "slideRight", delayFrames = 0, idle = "none" }) => {
  const { opacity, transform, filter, clipPath } = useEntranceStyle(entrance, delayFrames, idle);
  const scale = useFrameScale();

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 34 * scale,
          left: 34 * scale,
          transform,
          filter,
          clipPath,
          opacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: `${11 * scale}px ${20 * scale}px`,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 22 * scale }}>📅</div>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 800,
            fontSize: 22 * scale,
            color: "#222",
          }}
        >
          {date}
        </div>
      </div>
    </AbsoluteFill>
  );
};
