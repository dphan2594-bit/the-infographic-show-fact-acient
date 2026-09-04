import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { KURZ } from "../../theme/kurzgesagt";

/**
 * A soft radial glow that breathes on a sine — drop it on top of a painted
 * sun, engine or portal and the light source stops looking like a sticker.
 * Screen blending keeps it additive, so the artwork underneath stays intact.
 */
export const GlowPulseOverlay: React.FC<{
  /** centre in percent of frame */
  x: number;
  y: number;
  /** glow radius in pixels at 1080 wide, scaled with the frame */
  radius?: number;
  color?: string;
  /** seconds for one full breath */
  periodSeconds?: number;
  /** opacity at the bottom and top of the breath */
  minOpacity?: number;
  maxOpacity?: number;
}> = ({
  x,
  y,
  radius = 200,
  color = KURZ.yellow,
  periodSeconds = 3,
  minOpacity = 0.25,
  maxOpacity = 0.6,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const wave = (Math.sin(((frame / fps) * Math.PI * 2) / periodSeconds) + 1) / 2;
  const opacity = minOpacity + (maxOpacity - minOpacity) * wave;
  const size = radius * (width / 1080) * (0.94 + 0.12 * wave) * 2;

  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: (x / 100) * width - size / 2,
          top: (y / 100) * height - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};
