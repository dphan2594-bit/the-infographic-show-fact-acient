import { BODY_FONT } from "../../theme/fonts";
import { AbsoluteFill } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";
import { useFrameScale } from "../../animation/useFrameScale";

export const CaptionOverlay: React.FC<{
  text: string;
  position?: "top" | "bottom";
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({ text, position = "bottom", entrance = "fade", delayFrames = 0, idle = "none" }) => {
  const { opacity, transform, filter, clipPath } = useEntranceStyle(entrance, delayFrames, idle);
  const scale = useFrameScale();

  return (
    <AbsoluteFill
      style={{
        justifyContent: position === "bottom" ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          margin: position === "bottom" ? `0 auto ${72 * scale}px` : `${72 * scale}px auto 0`,
          maxWidth: "86%",
          opacity,
          transform,
          filter,
          clipPath,
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: `${16 * scale}px ${30 * scale}px`,
          borderRadius: 14 * scale,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontWeight: 600,
            fontSize: 34 * scale,
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
