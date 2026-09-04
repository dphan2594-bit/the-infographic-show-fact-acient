import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { generate } from "../../animation/random";
import { KURZ } from "../../theme/kurzgesagt";

/**
 * Hyperspace streaks: thin horizontal bars racing past the camera, the
 * "we are travelling very fast" cutaway from the reference video. Speed is
 * tied to each streak's own depth so the field has layers instead of moving
 * as one sheet.
 */
export const WarpStreaks: React.FC<{
  density?: number;
  seed?: string;
  /** "left" (default) or "right" — which way the streaks travel */
  direction?: "left" | "right";
  color?: string;
}> = ({ density = 1, seed = "warp", direction = "left", color = KURZ.gridLine }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const streaks = useMemo(
    () =>
      generate(`${seed}-streaks`, Math.round(46 * density), (rand) => ({
        y: rand(),
        length: 0.05 + rand() * 0.22,
        depth: 0.3 + rand() * 0.7,
        offset: rand(),
        thickness: 2 + rand() * 3,
      })),
    [density, seed],
  );

  const sign = direction === "left" ? -1 : 1;
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {streaks.map((streak, i) => {
          const span = width * 1.6;
          const travelled = seconds * 620 * streak.depth;
          // wrap into a band wider than the frame so streaks never pop in view
          const raw = (streak.offset * span + sign * travelled) % span;
          const x = (((raw % span) + span) % span) - width * 0.3;
          const length = streak.length * width * streak.depth;
          return (
            <rect
              key={i}
              x={x}
              y={streak.y * height}
              width={length}
              height={streak.thickness * streak.depth}
              rx={streak.thickness}
              fill={color}
              opacity={0.18 + 0.5 * streak.depth}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
