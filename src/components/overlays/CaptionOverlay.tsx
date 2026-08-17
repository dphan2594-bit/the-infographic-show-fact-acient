import { AbsoluteFill } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";

export const CaptionOverlay: React.FC<{
  text: string;
  position?: "top" | "bottom";
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({ text, position = "bottom", entrance = "fade", delayFrames = 0, idle = "none" }) => {
  const { opacity, transform, filter, clipPath } = useEntranceStyle(entrance, delayFrames, idle);

  return (
    <AbsoluteFill
      style={{
        justifyContent: position === "bottom" ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          margin: position === "bottom" ? "0 auto 64px" : "64px auto 0",
          maxWidth: "80%",
          opacity,
          transform,
          filter,
          clipPath,
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
