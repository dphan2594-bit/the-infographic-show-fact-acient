import { AbsoluteFill } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import { useFrameScale } from "../../animation/useFrameScale";
import type { Entrance, Idle } from "../../scenes/types";

/**
 * Headline text placed anywhere in the frame — the loud, punchy typography an
 * explainer uses to land a point, as opposed to the quiet caption bar at the
 * bottom that carries the voiceover.
 *
 * Pair it with a beat window and a spring entrance: text that snaps in on the
 * stressed word is most of what makes this style feel energetic.
 */
export const BigTextOverlay: React.FC<{
  text: string;
  /** anchor point in percent of the frame */
  x: number;
  y: number;
  /** font size at a 1080px-wide frame; scales with the composition */
  size?: number;
  color?: string;
  /** second line, smaller, under the headline */
  subtitle?: string;
  /** how the block sits on its anchor */
  align?: "left" | "center" | "right";
  /** dark pill behind the text, for busy artwork */
  plate?: boolean;
  plateColor?: string;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({
  text,
  x,
  y,
  size = 96,
  color = "#FFFFFF",
  subtitle,
  align = "center",
  plate = false,
  plateColor = "rgba(6,8,28,0.72)",
  entrance = "squash-pop",
  delayFrames = 0,
  idle = "none",
}) => {
  const scale = useFrameScale();
  const style = useEntranceStyle(entrance, delayFrames, idle);

  const translate = align === "center" ? "-50%" : align === "right" ? "-100%" : "0%";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(${translate}, -50%) ${style.transform}`,
          opacity: style.opacity,
          filter: style.filter,
          textAlign: align,
          padding: plate ? `${14 * scale}px ${30 * scale}px` : undefined,
          borderRadius: plate ? 18 * scale : undefined,
          backgroundColor: plate ? plateColor : undefined,
        }}
      >
        <div
          style={{
            fontFamily: "Arial Black, Arial, sans-serif",
            fontWeight: 900,
            fontSize: size * scale,
            lineHeight: 1.02,
            letterSpacing: -1 * scale,
            color,
            textTransform: "uppercase",
            // a hard shadow keeps heavy type readable over any artwork
            textShadow: `0 ${6 * scale}px 0 rgba(0,0,0,0.28)`,
            whiteSpace: "pre-line",
          }}
        >
          {text}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 10 * scale,
              fontFamily: "Arial, sans-serif",
              fontWeight: 700,
              fontSize: size * 0.32 * scale,
              letterSpacing: 1 * scale,
              color: "rgba(255,255,255,0.92)",
              textShadow: `0 ${3 * scale}px ${8 * scale}px rgba(0,0,0,0.5)`,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
