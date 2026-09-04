import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { generate } from "../../animation/random";
import { KURZ } from "../../theme/kurzgesagt";

/**
 * Dashes streaming away from a point — an exhaust plume, a warp trail, a
 * particle beam. The dashes are already painted into most flat artwork; this
 * adds the ones that actually move, fading out along the plume so the two
 * blend rather than compete.
 */
export const EngineTrailOverlay: React.FC<{
  /** where the plume starts, in percent of frame */
  x: number;
  y: number;
  /** direction the exhaust travels, in degrees (0 = right, 90 = down) */
  angleDeg?: number;
  /** plume length in percent of frame width */
  length?: number;
  /** how far the dashes spread sideways, in percent of frame width */
  spread?: number;
  count?: number;
  color?: string;
  /** seconds for one dash to travel the whole plume */
  travelSeconds?: number;
  seed?: string;
}> = ({
  x,
  y,
  angleDeg = 35,
  length = 26,
  spread = 6,
  count = 14,
  color = KURZ.cyan,
  travelSeconds = 1.3,
  seed = "trail",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const dashes = useMemo(
    () =>
      generate(`${seed}-dashes`, count, (rand) => ({
        offset: rand(),
        lateral: (rand() - 0.5) * 2,
        length: 0.05 + rand() * 0.09,
        thickness: 2 + rand() * 3,
        speed: 0.85 + rand() * 0.4,
      })),
    [count, seed],
  );

  const radians = (angleDeg * Math.PI) / 180;
  const scale = width / 1080;
  const originX = (x / 100) * width;
  const originY = (y / 100) * height;
  const plume = (length / 100) * width;
  const seconds = frame / fps;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {dashes.map((dash, i) => {
          const progress = ((seconds / travelSeconds) * dash.speed + dash.offset) % 1;
          const distance = progress * plume;
          // the plume widens as it travels, like a real exhaust cone
          const lateral = dash.lateral * (spread / 100) * width * progress;
          const cx = originX + Math.cos(radians) * distance - Math.sin(radians) * lateral;
          const cy = originY + Math.sin(radians) * distance + Math.cos(radians) * lateral;
          const dashLength = dash.length * plume;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) rotate(${angleDeg})`}>
              <rect
                x={-dashLength / 2}
                y={(-dash.thickness * scale) / 2}
                width={dashLength}
                height={dash.thickness * scale}
                rx={(dash.thickness * scale) / 2}
                fill={color}
                // fade in out of the nozzle, fade out at the end of the plume
                opacity={Math.sin(progress * Math.PI) * 0.75}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
