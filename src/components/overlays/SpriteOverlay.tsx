import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getEntrancePreset, getPresetStyle } from "../../animation/presets";
import type { Entrance, Idle } from "../../scenes/types";

/** Pulls the translation out of a preset's transform string, in pixels. */
const translationOf = (transform: string): [number, number] => {
  const pair = /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px\s*\)/.exec(transform);
  if (pair) return [Number(pair[1]), Number(pair[2])];
  const x = /translateX\(\s*(-?[\d.]+)px/.exec(transform);
  const y = /translateY\(\s*(-?[\d.]+)px/.exec(transform);
  return [x ? Number(x[1]) : 0, y ? Number(y[1]) : 0];
};

const resolveSrc = (src: string) => (src.startsWith("http") ? src : staticFile(src));

/**
 * A character cut out of the artwork with a real alpha channel.
 *
 * `cutout` lifts a *rectangle* of the picture — nudge it more than a couple of
 * percent and the copy slides off its own outline and you see the original
 * underneath. A sprite has no such ceiling: the background behind it has been
 * patched (scripts/cut-sprite.py writes the plate), so it can bob, lean and
 * swing as far as the shot wants.
 *
 * Split a limb into its own sprite and pivot it on the joint and the character
 * genuinely acts: the hammer swings rather than the whole body tilting.
 */
export const SpriteOverlay: React.FC<{
  /** the cut-out PNG — must have alpha */
  src: string;
  /** where the sprite's box sits in the artwork, in percent */
  x: number;
  y: number;
  width: number;
  height: number;
  /** pivot for the swing, in percent of the sprite's own box — a shoulder for
   *  an arm, the feet (the default) for a whole body */
  originX?: number;
  originY?: number;
  /** rotation amplitude in degrees */
  swingDeg?: number;
  /** "strike" raises slowly and drops fast, the way a hammer is actually used */
  swingShape?: "sine" | "strike";
  /** multiplies the entrance's clock — 2 makes the same preset land twice as
   *  fast, which is most of what separates a snap from a drift */
  entranceSpeed?: number;
  /** smear the sprite in proportion to how fast it is travelling. A fast move
   *  rendered as sharp frames strobes; a real camera would have blurred it. */
  motionBlur?: number;
  /** Continuous deformation while the sprite is otherwise at rest, 0–1.
   *  Measured against a real Kurzgesagt short, the thing separating their held
   *  frames from ours is not that theirs drift — it is that their shapes never
   *  stop deforming. A bitmap cannot redraw itself, but it can be warped, and
   *  a warp reads as life where a translation reads as drift. */
  alive?: number;
  /** Squash and stretch driven by the sprite's own velocity, 0–1. Stretches
   *  along the direction of travel while accelerating, squashes on the frame
   *  it stops. This is what gives a falling object mass. */
  weight?: number;
  /** Frames of wind-up before the entrance runs. The sprite hangs at its
   *  starting pose, drifts a little the *wrong* way and compresses, then goes.
   *  Nothing in nature moves without first loading up to move, and an entrance
   *  that simply begins reads as a cut rather than as an action.
   *
   *  Only reads on an entrance that starts on screen — "stamp", "squash-pop",
   *  "pop", "overshoot". A drop begins above the frame, so there is nothing
   *  visible to wind up; telegraph the landing instead, with a shadow that
   *  grows under the spot a beat before the impact. */
  anticipateFrames?: number;
  /** How far the wind-up travels, in percent of the sprite's height. */
  anticipatePercent?: number;
  /** Bows the entrance path sideways, in percent of the sprite's width.
   *  A thing that falls dead straight reads as a lift being switched off. */
  arcPercent?: number;
  /** Degrees of damped wobble after the entrance settles. A hand stops; what
   *  it is carrying does not. Give a prop or a limb its own pivot and this
   *  keeps it swinging for a beat after the body has landed. */
  followThrough?: number;
  /** Seconds for the follow-through to die away, default 0.9. */
  followSeconds?: number;
  /** vertical bob, in percent of the sprite's own height */
  bobPercent?: number;
  /** scale swell, in percent */
  breathePercent?: number;
  periodSeconds?: number;
  phaseSeconds?: number;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({
  src,
  x,
  y,
  width,
  height,
  originX = 50,
  originY = 100,
  swingDeg = 0,
  swingShape = "sine",
  bobPercent = 0,
  breathePercent = 0,
  periodSeconds = 2,
  phaseSeconds = 0,
  entranceSpeed = 1,
  motionBlur = 0,
  alive = 0,
  weight = 0,
  anticipateFrames = 0,
  anticipatePercent = 0,
  arcPercent = 0,
  followThrough = 0,
  followSeconds = 0.9,
  entrance = "none",
  delayFrames = 0,
  idle = "none",
}) => {
  const frame = useCurrentFrame();
  const { width: frameWidth, height: frameHeight, fps } = useVideoConfig();

  const at = (f: number) =>
    getPresetStyle({
      frame: delayFrames + Math.max(0, f - delayFrames) * entranceSpeed,
      fps,
      entrance,
      delayFrames,
      idle,
    });
  const style =
    anticipateFrames > 0 && frame < delayFrames && frame >= delayFrames - anticipateFrames
      ? { ...at(delayFrames), opacity: at(delayFrames).opacity }
      : at(frame);

  const phase = (((frame / fps + phaseSeconds) / periodSeconds) % 1 + 1) % 1;

  // A hammer spends most of its cycle on the way up and almost none coming
  // down. A sine wave gives it equal time either way, which reads as waving.
  const strike = (p: number) => {
    if (p < 0.62) {
      const t = p / 0.62;
      return 1 - (1 - t) * (1 - t); // ease-out on the lift
    }
    if (p < 0.76) {
      const t = (p - 0.62) / 0.14;
      return 1 - t * t; // snap down
    }
    const t = (p - 0.76) / 0.24;
    return -0.14 * Math.sin(t * Math.PI) * (1 - t); // recoil, dying out
  };

  const wave = swingShape === "strike" ? strike(phase) : Math.sin(phase * Math.PI * 2);
  const swing = swingDeg * wave;
  const bob = (bobPercent / 100) * (height / 100) * frameHeight * Math.sin(phase * Math.PI * 2);
  const breathe = 1 + (breathePercent / 100) * Math.sin(phase * Math.PI * 2);

  // How far this sprite travelled on this frame and the one before it, so the
  // deformation can tell accelerating from arriving.
  const bobAt = (f: number) =>
    (bobPercent / 100) *
    (height / 100) *
    frameHeight *
    Math.sin(((((f / fps + phaseSeconds) / periodSeconds) % 1) + 1) % 1 * Math.PI * 2);
  const speedAt = (f: number) => {
    const [ax, ay] = translationOf(at(f - 1).transform);
    const [bx, by] = translationOf(at(f).transform);
    return Math.hypot(bx - ax, by - ay + (bobAt(f) - bobAt(f - 1)));
  };
  const speed = speedAt(frame);
  const smear = motionBlur > 0 ? Math.min(motionBlur, speed * 0.42) : 0;

  const spriteWidth = (width / 100) * frameWidth;
  const spriteHeight = (height / 100) * frameHeight;
  const entranceFrames = Math.max(1, getEntrancePreset(entrance).durationInFrames);
  // where the entrance is, 0 before it starts and 1 once it has settled
  const travel = Math.min(1, Math.max(0, (frame - delayFrames) * entranceSpeed / entranceFrames));

  // ANTICIPATION — hold at the start pose, ease the wrong way, then release
  const windUp =
    anticipateFrames > 0 && frame < delayFrames && frame >= delayFrames - anticipateFrames
      ? Math.sin(((frame - (delayFrames - anticipateFrames)) / anticipateFrames) * Math.PI)
      : 0;
  const windUpY = -windUp * (anticipatePercent / 100) * spriteHeight;

  // ARCS — bow the path sideways, widest at the middle of the travel
  const arc =
    arcPercent !== 0 && travel > 0 && travel < 1
      ? Math.sin(travel * Math.PI) * (arcPercent / 100) * spriteWidth
      : 0;

  // FOLLOW-THROUGH — a damped wobble once the body has stopped
  const settled = (frame - delayFrames) * entranceSpeed - entranceFrames;
  const follow =
    followThrough !== 0 && settled > 0
      ? followThrough *
        Math.exp(-(settled / fps) / followSeconds) *
        Math.sin((settled / fps) * Math.PI * 2 * 2.4)
      : 0;

  // Stretch along the travel while it is speeding up; squash on the frame it
  // stops. Anchored at the feet (the default origin), a squash reads as the
  // weight arriving rather than as the figure shrinking.
  const impact = Math.max(0, speedAt(frame - 1) - speed);
  const stretch = weight * Math.min(0.30, speed * 0.0055);
  const squash = weight * Math.min(0.26, impact * 0.0075);

  // Two periods that do not divide into each other, so the loop never ticks
  // like a metronome the way a single sine does.
  const seconds = frame / fps + phaseSeconds;
  const life =
    alive *
    (0.62 * Math.sin((seconds / 2.3) * Math.PI * 2) +
      0.38 * Math.sin((seconds / 3.7) * Math.PI * 2 + 1.1));

  // the wind-up compresses along the axis it is about to travel
  const scaleX = breathe * (1 + life * 0.030 - stretch * 0.62 + squash * 0.70 + windUp * 0.06);
  const scaleY = breathe * (1 - life * 0.026 + stretch - squash - windUp * 0.07);
  const skew = life * 1.5;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: (x / 100) * frameWidth,
          top: (y / 100) * frameHeight,
          width: (width / 100) * frameWidth,
          height: (height / 100) * frameHeight,
          transformOrigin: `${originX}% ${originY}%`,
          transform:
            `translate(${arc.toFixed(2)}px, ${(bob + windUpY).toFixed(2)}px) ` +
            `rotate(${(swing + follow).toFixed(2)}deg) ` +
            `skewX(${skew.toFixed(3)}deg) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)}) ` +
            style.transform,
          opacity: style.opacity,
          filter: smear > 0.4 ? `blur(${smear.toFixed(1)}px) ${style.filter ?? ""}` : style.filter,
        }}
      >
        <Img src={resolveSrc(src)} style={{ width: "100%", height: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};
