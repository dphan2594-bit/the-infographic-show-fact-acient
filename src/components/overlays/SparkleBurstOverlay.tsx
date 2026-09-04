import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { generate } from "../../animation/random";
import { KURZ_ACCENTS } from "../../theme/kurzgesagt";

/**
 * One-shot particle burst for the beat where a fact lands: a shockwave ring
 * plus confetti-ish dots flying outward on an ease-out curve. Kurzgesagt uses
 * this to punctuate a reveal — keep it to one per scene or it stops meaning
 * anything.
 */
export const SparkleBurstOverlay: React.FC<{
  x: number;
  y: number;
  /** frame within the scene the burst fires on */
  atFrame?: number;
  count?: number;
  colors?: string[];
  /** how far the particles travel, in pixels at 1080 wide */
  spread?: number;
  /** frames the burst takes to finish */
  durationInFrames?: number;
  seed?: string;
}> = ({
  x,
  y,
  atFrame = 0,
  count = 22,
  colors,
  spread = 260,
  durationInFrames = 34,
  seed = "burst",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = useMemo(
    () =>
      generate(`${seed}-particles`, count, (rand, i) => ({
        angle: (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.5,
        distance: 0.55 + rand() * 0.45,
        size: 4 + rand() * 8,
        color: (colors ?? [...KURZ_ACCENTS])[Math.floor(rand() * (colors ?? KURZ_ACCENTS).length)],
        delay: Math.floor(rand() * 4),
      })),
    [colors, count, seed],
  );

  const local = frame - atFrame;
  if (local < 0 || local > durationInFrames + 6) {
    return null;
  }

  const scale = width / 1080;
  const cx = (x / 100) * width;
  const cy = (y / 100) * height;

  const ringProgress = interpolate(local, [0, durationInFrames * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <circle
          cx={cx}
          cy={cy}
          r={ringProgress * spread * scale}
          fill="none"
          stroke={KURZ_ACCENTS[0]}
          strokeWidth={6 * scale * (1 - ringProgress)}
          opacity={(1 - ringProgress) * 0.8}
        />
        {particles.map((particle, i) => {
          const progress = interpolate(local - particle.delay, [0, durationInFrames], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const distance = progress * particle.distance * spread * scale;
          return (
            <circle
              key={i}
              cx={cx + Math.cos(particle.angle) * distance}
              cy={cy + Math.sin(particle.angle) * distance}
              r={particle.size * scale * (1 - progress * 0.6)}
              fill={particle.color}
              opacity={1 - progress}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
