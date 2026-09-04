import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";

const resolveSrc = (src: string) => (src.startsWith("http") ? src : staticFile(src));

/**
 * Gives a character in a flat illustration its own motion without anyone
 * having to export the artwork in layers.
 *
 * The trick: draw a rectangle of the *same image* back on top of itself, in
 * exactly the place it already occupies, and animate only that copy. Because
 * the copy sits on its original, small moves (a breath, a sway) read as the
 * character moving while the background stays put. A feathered mask hides the
 * rectangle's edges, and `originY: 100` pivots the move at the character's
 * feet, which is what makes a breath look like a breath.
 *
 * Keep the motion small — a couple of percent. Push it far and the copy slides
 * off its own outline and you see a ghost of the artwork underneath.
 */
export const CutoutOverlay: React.FC<{
  /** the picture to cut from — normally the same file as the scene background */
  src: string;
  /** the region to lift, in percent of the frame */
  x: number;
  y: number;
  width: number;
  height: number;
  /** softness of the mask edge, in percent of the region, default 18 */
  feather?: number;
  /** pivot of the motion inside the region, in percent (100 = bottom) */
  originX?: number;
  originY?: number;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({
  src,
  x,
  y,
  width,
  height,
  feather = 18,
  originX = 50,
  originY = 100,
  entrance = "none",
  delayFrames = 0,
  idle = "breathe-still",
}) => {
  const { width: frameWidth, height: frameHeight } = useVideoConfig();
  const style = useEntranceStyle(entrance, delayFrames, idle);

  const left = (x / 100) * frameWidth;
  const top = (y / 100) * frameHeight;
  const regionWidth = (width / 100) * frameWidth;
  const regionHeight = (height / 100) * frameHeight;
  // fade the last `feather` percent on every side so the cut has no hard edge
  const mask =
    `linear-gradient(to right, transparent 0%, black ${feather}%, black ${100 - feather}%, transparent 100%), ` +
    `linear-gradient(to bottom, transparent 0%, black ${feather}%, black ${100 - feather}%, transparent 100%)`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: regionWidth,
          height: regionHeight,
          overflow: "hidden",
          opacity: style.opacity,
          transform: style.transform,
          transformOrigin: `${originX}% ${originY}%`,
          filter: style.filter,
          maskImage: mask,
          maskComposite: "intersect",
          WebkitMaskImage: mask,
          WebkitMaskComposite: "source-in",
        }}
      >
        {/* the full picture, shifted so the wanted region lands in the box */}
        <Img
          src={resolveSrc(src)}
          style={{
            position: "absolute",
            left: -left,
            top: -top,
            width: frameWidth,
            height: frameHeight,
            objectFit: "cover",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
