import { Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { KenBurnsDirection } from "../scenes/types";

const TRANSFORMS: Record<
  KenBurnsDirection,
  { from: { scale: number; x: number; y: number }; to: { scale: number; x: number; y: number } }
> = {
  "zoom-in": { from: { scale: 1, x: 0, y: 0 }, to: { scale: 1.15, x: 0, y: 0 } },
  "zoom-out": { from: { scale: 1.15, x: 0, y: 0 }, to: { scale: 1, x: 0, y: 0 } },
  "pan-left": { from: { scale: 1.1, x: 2, y: 0 }, to: { scale: 1.1, x: -2, y: 0 } },
  "pan-right": { from: { scale: 1.1, x: -2, y: 0 }, to: { scale: 1.1, x: 2, y: 0 } },
  "pan-up": { from: { scale: 1.1, x: 0, y: 2 }, to: { scale: 1.1, x: 0, y: -2 } },
  "pan-down": { from: { scale: 1.1, x: 0, y: -2 }, to: { scale: 1.1, x: 0, y: 2 } },
};

export const KenBurnsImage: React.FC<{
  src: string;
  direction?: KenBurnsDirection;
  durationInFrames: number;
}> = ({ src, direction = "zoom-in", durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
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
    <div style={{ width, height, overflow: "hidden", position: "absolute", inset: 0 }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${x}%, ${y}%)`,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
};
