import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { generate } from "../../animation/random";
import { KURZ } from "../../theme/kurzgesagt";

/**
 * Twinkling starfield with parallax depth — the base layer of every
 * Kurzgesagt-style space shot. Three things keep it alive without pulling
 * focus from the subject:
 *
 *  - depth: each star gets a depth 0.25-1; nearer stars are bigger, brighter
 *    and drift faster, which reads as a slow camera move rather than noise
 *  - twinkle: per-star sine on opacity, each with its own phase and speed
 *  - sparkles: a handful of 4-point stars that pulse in scale, the "hero"
 *    stars of the reference art
 */
export const Starfield: React.FC<{
  /** multiplies the default star count, 1 = ~260 stars on a 1080x1920 frame */
  density?: number;
  /** changes the layout without changing the look */
  seed?: string;
  /** pixels per second the field drifts upward (parallax) */
  driftSpeed?: number;
}> = ({ density = 1, seed = "starfield", driftSpeed = 6 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const stars = useMemo(() => {
    const count = Math.round(260 * density);
    return generate(`${seed}-stars`, count, (rand) => ({
      x: rand(),
      y: rand(),
      depth: 0.25 + rand() * 0.75,
      radius: 1 + rand() * 2.2,
      phase: rand() * Math.PI * 2,
      speed: 0.04 + rand() * 0.09,
      dim: rand() > 0.55,
    }));
  }, [density, seed]);

  const sparkles = useMemo(
    () =>
      generate(`${seed}-sparkles`, Math.max(3, Math.round(5 * density)), (rand) => ({
        x: rand(),
        y: rand(),
        size: 10 + rand() * 12,
        phase: rand() * Math.PI * 2,
        speed: 0.06 + rand() * 0.05,
        depth: 0.5 + rand() * 0.5,
      })),
    [density, seed],
  );

  const drift = (frame / fps) * driftSpeed;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {stars.map((star, i) => {
          // wrap around the top edge so the field scrolls forever
          const y = (((star.y * height - drift * star.depth) % height) + height) % height;
          const twinkle = 0.45 + 0.55 * Math.sin(frame * star.speed + star.phase);
          return (
            <circle
              key={i}
              cx={star.x * width}
              cy={y}
              r={star.radius * star.depth}
              fill={star.dim ? KURZ.starDim : KURZ.star}
              opacity={(0.25 + 0.75 * star.depth) * twinkle}
            />
          );
        })}
        {sparkles.map((sparkle, i) => {
          const y = (((sparkle.y * height - drift * sparkle.depth) % height) + height) % height;
          const pulse = 0.7 + 0.3 * Math.sin(frame * sparkle.speed + sparkle.phase);
          const size = sparkle.size * pulse;
          const x = sparkle.x * width;
          // four-point star: two crossed tapered diamonds
          const path = `M ${x} ${y - size} Q ${x} ${y} ${x + size} ${y} Q ${x} ${y} ${x} ${y + size} Q ${x} ${y} ${x - size} ${y} Q ${x} ${y} ${x} ${y - size} Z`;
          return <path key={i} d={path} fill={KURZ.star} opacity={0.55 + 0.45 * pulse} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
