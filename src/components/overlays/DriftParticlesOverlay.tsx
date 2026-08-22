import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { generate } from "../../animation/random";
import { KURZ_ACCENTS } from "../../theme/kurzgesagt";

/**
 * Coloured dust drifting across the frame at three depths. Because near
 * particles are bigger, brighter and faster than far ones, the layer reads as
 * parallax — which is what gives a flat illustration a sense of space when the
 * camera moves over it.
 */
export const DriftParticlesOverlay: React.FC<{
  count?: number;
  /** travel direction in degrees, 0 = left to right */
  angleDeg?: number;
  /** pixels per second at full depth */
  speed?: number;
  colors?: string[];
  seed?: string;
  opacity?: number;
}> = ({ count = 40, angleDeg = 200, speed = 26, colors, seed = "dust", opacity = 0.75 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const particles = useMemo(() => {
    const palette = colors ?? [...KURZ_ACCENTS];
    return generate(`${seed}-dust`, count, (rand) => ({
      x: rand(),
      y: rand(),
      depth: 0.3 + rand() * 0.7,
      size: 1.5 + rand() * 3.5,
      color: palette[Math.floor(rand() * palette.length)],
      twinklePhase: rand() * Math.PI * 2,
    }));
  }, [colors, count, seed]);

  const seconds = frame / fps;
  const radians = (angleDeg * Math.PI) / 180;
  const scale = width / 1080;

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {particles.map((particle, i) => {
          const travel = seconds * speed * particle.depth;
          // wrap in both axes so the field is endless in any drift direction
          const wrap = (value: number, span: number) => ((value % span) + span) % span;
          const x = wrap(particle.x * width + Math.cos(radians) * travel, width);
          const y = wrap(particle.y * height + Math.sin(radians) * travel, height);
          const twinkle = 0.55 + 0.45 * Math.sin(frame * 0.07 + particle.twinklePhase);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={particle.size * particle.depth * scale}
              fill={particle.color}
              opacity={particle.depth * twinkle}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
