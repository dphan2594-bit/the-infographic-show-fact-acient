import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { FPS, HEIGHT, WIDTH, palette } from "../theme";

type Star = {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  twinkleOffset: number;
  twinkleSpeed: number;
};

/**
 * Stars are generated once from a fixed seed so every frame — and every
 * re-render on the render farm — produces an identical field.
 */
const makeStars = (count: number, seed: string): Star[] =>
  new Array(count).fill(0).map((_, i) => ({
    x: random(`${seed}-x-${i}`) * WIDTH,
    y: random(`${seed}-y-${i}`) * HEIGHT,
    r: 0.8 + random(`${seed}-r-${i}`) * 2.2,
    baseOpacity: 0.25 + random(`${seed}-o-${i}`) * 0.55,
    twinkleOffset: random(`${seed}-t-${i}`) * Math.PI * 2,
    twinkleSpeed: 0.6 + random(`${seed}-s-${i}`) * 1.4,
  }));

const FAR_STARS = makeStars(140, "far");
const NEAR_STARS = makeStars(45, "near");

export const SpaceBackground: React.FC<{
  /** subtle hue shift so later scenes feel heavier than the opening */
  mood?: "calm" | "warm" | "grim";
}> = ({ mood = "calm" }) => {
  const frame = useCurrentFrame();
  const seconds = frame / FPS;

  const near =
    mood === "warm" ? "#3A2A5E" : mood === "grim" ? "#2A1733" : palette.spaceNear;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.spaceFar }}>
      {/* Ground: a single soft radial lift in the middle, dark at the corners. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 62% at 50% 46%, ${near} 0%, ${palette.spaceFar} 72%)`,
        }}
      />

      <AbsoluteFill>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {/* Far layer drifts slowly right, near layer drifts a little faster,
              giving parallax without moving the camera. */}
          <g transform={`translate(${(seconds * 3) % WIDTH}, 0)`}>
            {FAR_STARS.map((s, i) => (
              <circle
                key={`f${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill={palette.paper}
                opacity={
                  s.baseOpacity *
                  (0.65 +
                    0.35 *
                      Math.sin(seconds * s.twinkleSpeed + s.twinkleOffset))
                }
              />
            ))}
          </g>
          <g transform={`translate(${(seconds * 7) % WIDTH}, 0)`}>
            {NEAR_STARS.map((s, i) => (
              <circle
                key={`n${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r * 1.4}
                fill={palette.paper}
                opacity={
                  s.baseOpacity *
                  (0.6 +
                    0.4 * Math.sin(seconds * s.twinkleSpeed + s.twinkleOffset))
                }
              />
            ))}
          </g>
        </svg>
      </AbsoluteFill>

      {/* Vignette keeps attention centred and hides the star seam. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 45%, rgba(4,6,18,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
