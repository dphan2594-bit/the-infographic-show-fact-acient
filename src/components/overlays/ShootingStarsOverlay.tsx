import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { generate } from "../../animation/random";
import { KURZ } from "../../theme/kurzgesagt";

/**
 * Meteors crossing the sky on a loop: each one waits out its own slot, then
 * streaks across with a tapered tail. Sparse by design — one every few
 * seconds is the difference between "alive" and "busy".
 */
export const ShootingStarsOverlay: React.FC<{
  count?: number;
  /** seconds between one star's appearances (each star gets its own offset) */
  periodSeconds?: number;
  /** seconds a single streak takes to cross */
  travelSeconds?: number;
  /** direction of travel in degrees, 0 = left to right */
  angleDeg?: number;
  color?: string;
  seed?: string;
}> = ({
  count = 3,
  periodSeconds = 5,
  travelSeconds = 1.1,
  angleDeg = 28,
  color = KURZ.star,
  seed = "shooting",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const stars = useMemo(
    () =>
      generate(`${seed}-meteors`, count, (rand) => ({
        startX: -0.15 + rand() * 0.5,
        startY: rand() * 0.55,
        length: 90 + rand() * 110,
        distance: 0.5 + rand() * 0.45,
        offset: rand(),
        thickness: 1.6 + rand() * 1.4,
      })),
    [count, seed],
  );

  const seconds = frame / fps;
  const radians = (angleDeg * Math.PI) / 180;
  const scale = width / 1080;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* tail fades out behind the head, so the streak reads as motion
              rather than as a line someone drew on the frame */}
          <linearGradient id="meteor-tail" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>
        {stars.map((star, i) => {
          // each star runs on the same period, just phase-shifted
          const cycle = (seconds / periodSeconds + star.offset) % 1;
          const progress = (cycle * periodSeconds) / travelSeconds;
          if (progress > 1) {
            return null;
          }
          const eased = interpolate(progress, [0, 1], [0, 1], {
            easing: Easing.inOut(Easing.quad),
          });
          const travel = star.distance * width;
          const x = star.startX * width + Math.cos(radians) * travel * eased;
          const y = star.startY * height + Math.sin(radians) * travel * eased;
          const tail = star.length * scale;
          // fade in on entry, out on exit, so nothing pops
          const opacity = Math.sin(progress * Math.PI);
          return (
            <g
              key={i}
              opacity={opacity * 0.9}
              transform={`translate(${x} ${y}) rotate(${angleDeg})`}
            >
              <rect
                x={-tail}
                y={(-star.thickness * scale) / 2}
                width={tail}
                height={star.thickness * scale}
                rx={(star.thickness * scale) / 2}
                fill="url(#meteor-tail)"
              />
              <circle r={star.thickness * scale * 0.8} fill={color} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
