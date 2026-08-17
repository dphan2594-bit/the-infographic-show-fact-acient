import { AbsoluteFill } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";

export const DateHudOverlay: React.FC<{
  date: string;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({ date, entrance = "slideRight", delayFrames = 0, idle = "none" }) => {
  const { opacity, transform, filter, clipPath } = useEntranceStyle(entrance, delayFrames, idle);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          transform,
          filter,
          clipPath,
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
