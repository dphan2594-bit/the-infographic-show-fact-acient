import { Img, interpolate, useCurrentFrame } from "remotion";
import type { KenBurnsDirection } from "../scenes/types";

const TRANSFORMS: Record<
  KenBurnsDirection,
  { from: { scale: number; x: number; y: number }; to: { scale: number; x: number; y: number } }
> = {
  // "flat" endpoints keep a small 1.04 margin (instead of exactly 1) so
  // camera shake/punch-zoom on "animate" scenes never reveals an edge gap.
  "zoom-in": { from: { scale: 1.04, x: 0, y: 0 }, to: { scale: 1.15, x: 0, y: 0 } },
  "zoom-out": { from: { scale: 1.15, x: 0, y: 0 }, to: { scale: 1.04, x: 0, y: 0 } },
  "pan-left": { from: { scale: 1.1, x: 2, y: 0 }, to: { scale: 1.1, x: -2, y: 0 } },
  "pan-right": { from: { scale: 1.1, x: -2, y: 0 }, to: { scale: 1.1, x: 2, y: 0 } },
  "pan-up": { from: { scale: 1.1, x: 0, y: 2 }, to: { scale: 1.1, x: 0, y: -2 } },
  "pan-down": { from: { scale: 1.1, x: 0, y: -2 }, to: { scale: 1.1, x: 0, y: 2 } },
  // fully static — for finished graphics (charts/maps) where any crop loses data
  none: { from: { scale: 1, x: 0, y: 0 }, to: { scale: 1, x: 0, y: 0 } },
};

export const KenBurnsImage: React.FC<{
  src: string;
  direction?: KenBurnsDirection;
  durationInFrames: number;
  fit?: "cover" | "contain";
  letterboxColor?: string;
  /**
   * Which point of the picture to keep when the frame crops it, in percent.
   * This is what makes one artwork work in both 9:16 and 16:9: a wide image in
   * a vertical frame loses ~60% of its width, and the focus decides whether
   * what survives is the subject or the empty sky next to it.
   */
  focusX?: number;
  focusY?: number;
}> = ({
  src,
  direction = "zoom-in",
  durationInFrames,
  fit = "cover",
  letterboxColor,
  focusX = 50,
  focusY = 50,
}) => {
  const frame = useCurrentFrame();
  const { from, to } = TRANSFORMS[direction];

  const scale = interpolate(frame, [0, durationInFrames], [from.scale, to.scale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [0, durationInFrames], [from.x, to.x], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [0, durationInFrames], [from.y, to.y], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "absolute",
        inset: 0,
        backgroundColor: fit === "contain" ? (letterboxColor ?? "#000000") : undefined,
      }}
    >
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          objectPosition: `${focusX}% ${focusY}%`,
          transform: `scale(${scale}) translate(${x}%, ${y}%)`,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
};
