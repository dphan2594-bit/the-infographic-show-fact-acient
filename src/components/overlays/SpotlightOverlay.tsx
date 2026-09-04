import { AbsoluteFill, useVideoConfig } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";

/**
 * Darkens the whole frame except one oval — the single most effective way to
 * point at something inside a flat illustration.
 *
 * Kurzgesagt does this constantly: the picture is busy, so the film dims
 * everything the narration is not talking about and the eye has nowhere else
 * to go. Move the oval between beats and the same still image becomes a
 * sequence of shots.
 */
export const SpotlightOverlay: React.FC<{
  /** centre of the lit area, in percent of the frame */
  x: number;
  y: number;
  /** radius of the lit area, in percent of frame width / height */
  radiusX: number;
  radiusY: number;
  /** how dark the surroundings go, 0-1, default 0.62 */
  darkness?: number;
  /** how soft the edge is, as a share of the radius, default 0.45 */
  softness?: number;
  color?: string;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({
  x,
  y,
  radiusX,
  radiusY,
  darkness = 0.62,
  softness = 0.45,
  color = "#05040F",
  entrance = "fade",
  delayFrames = 0,
  idle = "none",
}) => {
  const { width, height } = useVideoConfig();
  const style = useEntranceStyle(entrance, delayFrames, idle);

  // the lit core is fully transparent, then the darkness ramps up across the
  // soft band and holds outside it
  const inner = 100 - softness * 100;
  const gradient =
    `radial-gradient(ellipse ${(radiusX / 100) * width}px ${(radiusY / 100) * height}px ` +
    `at ${x}% ${y}%, transparent ${inner}%, ${color} 100%)`;

  return (
    <AbsoluteFill
      style={{
        background: gradient,
        opacity: style.opacity * darkness,
        transform: style.transform,
        pointerEvents: "none",
      }}
    />
  );
};
