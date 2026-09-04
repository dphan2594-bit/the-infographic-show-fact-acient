import { BODY_FONT } from "../../theme/fonts";
import { AbsoluteFill } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";

export const IconLabelOverlay: React.FC<{
  label: string;
  x: number;
  y: number;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({ label, x, y, entrance = "slideUp", delayFrames = 0, idle = "none" }) => {
  const { opacity, transform, filter, clipPath } = useEntranceStyle(entrance, delayFrames, idle);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) ${transform}`,
          opacity,
          filter,
          clipPath,
        }}
      >
        <div
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            backgroundColor: "rgba(0,0,0,0.65)",
            color: "white",
            fontFamily: BODY_FONT,
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
