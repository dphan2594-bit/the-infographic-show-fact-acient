import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { generate } from "../../animation/random";
import { KURZ } from "../../theme/kurzgesagt";

const NEBULA_COLORS = [KURZ.purple, KURZ.cyan, KURZ.pink];

/**
 * Soft coloured clouds drifting behind the stars. Blur plus low opacity keeps
 * them as atmosphere: they give the flat void depth and stop long scenes from
 * looking like a still image, without competing with the subject.
 */
export const NebulaGlow: React.FC<{ seed?: string; intensity?: number }> = ({
  seed = "nebula",
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const blobs = useMemo(
    () =>
      generate(`${seed}-blobs`, 4, (rand, i) => ({
        x: 0.15 + rand() * 0.7,
        y: 0.12 + rand() * 0.76,
        radius: 0.28 + rand() * 0.28,
        color: NEBULA_COLORS[i % NEBULA_COLORS.length],
        phase: rand() * Math.PI * 2,
        speed: 0.008 + rand() * 0.01,
        travel: 30 + rand() * 60,
      })),
    [seed],
  );

  return (
    <AbsoluteFill style={{ filter: "blur(70px)", opacity: 0.42 * intensity }}>
      {blobs.map((blob, i) => {
        const dx = Math.sin(frame * blob.speed + blob.phase) * blob.travel;
        const dy = Math.cos(frame * blob.speed * 0.8 + blob.phase) * blob.travel * 0.6;
        const size = blob.radius * Math.min(width, height) * 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: blob.x * width - size / 2 + dx,
              top: blob.y * height - size / 2 + dy,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 68%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
