import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Darkened edges so the eye stays on the center of frame — a cheap but
 * effective "professional grade" cue most flat AI-generated frames lack.
 */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32) 100%)",
    }}
  />
);

/**
 * Per-frame animated noise via an SVG turbulence filter. Because Remotion
 * renders every frame independently, seeding the turbulence off the frame
 * number produces real flicker across playback instead of a static texture.
 */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.045 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seed = frame % 60;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay" }}>
      <svg width={width} height={height}>
        <filter id="film-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.85}
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ${opacity} 0`}
          />
        </filter>
        <rect width={width} height={height} filter="url(#film-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Full post-processing stack: subtle contrast/saturation grade + vignette + grain. */
export const PostFx: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "contrast(1.06) saturate(1.12)" }}>
        {children}
      </AbsoluteFill>
      <Vignette />
      <FilmGrain />
    </AbsoluteFill>
  );
};
