import type { CameraConfig } from "../animation/useCamera";
import type { EntranceName, IdleName } from "../animation/presets";
import type { SpaceBackground } from "../components/space/SpaceBackdrop";

export type { SpaceVariant } from "../components/space/SpaceBackdrop";

export type KenBurnsDirection =
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down"
  | "none";

export type Background =
  | {
      type: "image";
      src: string;
      kenBurns?: KenBurnsDirection;
      /**
       * "cover" (default) fills the frame and crops overflow — fine for
       * clean scene art. Use "contain" for finished graphics that already
       * have their own baked-in text/data reaching the edges (charts, maps)
       * so nothing gets cropped off.
       */
      fit?: "cover" | "contain";
      /** background shown behind a "contain"-fit image, matches the source graphic's own bg by default */
      letterboxColor?: string;
    }
  | { type: "video"; src: string }
  | { type: "color"; color: string }
  /**
   * Animated Kurzgesagt-style space backdrop rendered entirely in code —
   * starfield, nebula, curved grid horizon or warp streaks. No image asset
   * needed, and it never holds a static frame.
   */
  | SpaceBackground;

/**
 * Motion graphics entrance style — matches the "làm bằng CapCut" replacements
 * in Mục 8 of docs/SKILL-FLAT-EXPLAINER.md (scale-in pop, slide-in, stagger
 * reveal, crossfade) plus the After Effects style preset library, all
 * implemented natively in Remotion. The full catalogue with descriptions lives
 * in src/animation/presets.ts; preview them in the "PresetGallery" composition.
 */
export type Entrance = EntranceName;

/** Looping motion applied after the entrance settles (AE `wiggle()` & friends). */
export type Idle = IdleName;

type EntranceProps = {
  /** entrance animation style, defaults to "fade" */
  entrance?: Entrance;
  /** frames to wait (within the scene) before this overlay starts entering */
  delayFrames?: number;
  /** looping idle motion once the entrance has settled, defaults to "none" */
  idle?: Idle;
};

/** one elliptical orbit in an `orbitSystem` overlay */
export type OrbitRing = {
  /** ring radius in pixels at 1080 wide, scaled with the frame */
  radius: number;
  /** ry/rx — how flat the ellipse looks, default 0.42 (a tilted circle) */
  flatten?: number;
  /** rotation of the whole ellipse in degrees, default -22 */
  tiltDeg?: number;
  color?: string;
  opacity?: number;
  /** draw the ellipse itself, default true — false when the orbit is already painted into the artwork */
  showRing?: boolean;
  satelliteColor?: string;
  satelliteSize?: number;
  /** seconds for the satellite to go all the way round, default 6 */
  secondsPerRevolution?: number;
  direction?: "cw" | "ccw";
  /** starting angle in radians, so two satellites do not sit on top of each other */
  phase?: number;
  /** run a light pulse along the ring — energy flowing through the orbit */
  pulse?: boolean;
  pulseColor?: string;
  /** length of the glowing arc, in percent of the ring, default 14 */
  pulseArcPercent?: number;
  /** seconds for the pulse to lap the ring, default 55% of the satellite's period */
  pulseSecondsPerRevolution?: number;
};

export type Overlay =
  | ({
      type: "chapterTitle";
      title: string;
      subtitle?: string;
      accentColor: string;
      /** dark scrim + diagonal pattern behind the text, default true — set false over animated backdrops */
      plate?: boolean;
    } & EntranceProps)
  | ({
      type: "dataBadge";
      value: string;
      label?: string;
      /** position in percent of frame, 0-100 */
      x: number;
      y: number;
      accentColor: string;
      /** point the callout line points to, in percent */
      calloutTo?: { x: number; y: number };
    } & EntranceProps)
  | ({
      type: "iconLabel";
      label: string;
      x: number;
      y: number;
    } & EntranceProps)
  | ({
      type: "dateHud";
      date: string;
    } & EntranceProps)
  | ({
      type: "caption";
      text: string;
      /** anchor the caption bar to the top instead of the bottom, to dodge baked-in text in the image */
      position?: "top" | "bottom";
    } & EntranceProps)
  | ({
      /** checklist / comparison grid — each item pops or slides in with a stagger delay */
      type: "staggerBadges";
      items: { icon: string; label: string; x: number; y: number }[];
      accentColor: string;
      /** frames between each item's entrance, default 8 */
      staggerFrames?: number;
    } & EntranceProps)
  | {
      /** animated line chart — draws progressively, for depletion curves / growth charts */
      type: "chartLine";
      /** points in percent of frame, drawn left to right */
      points: { x: number; y: number }[];
      color: string;
      /** frame (within the scene) the draw-in finishes by */
      drawEndFrame: number;
      showDot?: boolean;
    }
  | ({
      /** glowing core + satellites on tilted orbit rings (Kurzgesagt "system" shot) */
      type: "orbitSystem";
      x: number;
      y: number;
      coreRadius?: number;
      coreColor?: string;
      glowColor?: string;
      rings?: OrbitRing[];
      /** draw the glowing core, default true */
      showCore?: boolean;
    } & EntranceProps)
  | {
      /** one-shot particle burst to punctuate a reveal */
      type: "sparkleBurst";
      x: number;
      y: number;
      /** frame within the scene the burst fires on, default 0 */
      atFrame?: number;
      count?: number;
      colors?: string[];
      spread?: number;
      durationInFrames?: number;
      seed?: string;
    }
  | {
      /** twinkling star layer laid over finished artwork */
      type: "starLayer";
      density?: number;
      seed?: string;
      /** parallax drift in px/s — keep 0 over artwork that already has stars */
      driftSpeed?: number;
      opacity?: number;
    }
  | {
      /** breathing radial glow, for a painted sun / engine / portal */
      type: "glowPulse";
      x: number;
      y: number;
      radius?: number;
      color?: string;
      periodSeconds?: number;
      minOpacity?: number;
      maxOpacity?: number;
    }
  | {
      /** meteors crossing the sky on a loop */
      type: "shootingStars";
      count?: number;
      periodSeconds?: number;
      travelSeconds?: number;
      angleDeg?: number;
      color?: string;
      seed?: string;
    }
  | {
      /** coloured dust drifting at three depths, for parallax over flat art */
      type: "driftParticles";
      count?: number;
      angleDeg?: number;
      speed?: number;
      colors?: string[];
      seed?: string;
      opacity?: number;
    }
  | {
      /** dashes streaming away from a point: exhaust plume, warp trail, beam */
      type: "engineTrail";
      x: number;
      y: number;
      angleDeg?: number;
      length?: number;
      spread?: number;
      count?: number;
      color?: string;
      travelSeconds?: number;
      seed?: string;
    }
  | ({
      /** horizontal process-flow diagram (E8): boxes + connecting arrows, staggered reveal */
      type: "processFlow";
      steps: { label: string }[];
      accentColor: string;
      y: number;
      /** frames between each step's entrance, default 12 */
      staggerFrames?: number;
    } & EntranceProps);

export type SceneTransition =
  | { type: "fade"; durationInFrames?: number }
  | {
      type: "slide";
      direction?: "from-left" | "from-right" | "from-top" | "from-bottom";
      durationInFrames?: number;
    }
  | {
      type: "wipe";
      direction?: "from-left" | "from-right" | "from-top" | "from-bottom";
      durationInFrames?: number;
    }
  | { type: "none" };

export type Scene = {
  id: string;
  /** matches the doc's Mục 8 static/animate classification, for traceability only */
  motion: "static" | "animate";
  archetype: string;
  durationInFrames: number;
  background: Background;
  overlays?: Overlay[];
  /**
   * Reserve a solid-color strip (default bottom, 16% of height) that the
   * background image is shrunk to avoid, so a caption overlay never has to
   * fight the image's own baked-in text for the same pixels.
   */
  captionBar?: { color: string; heightPercent?: number; position?: "top" | "bottom" };
  /**
   * Keyframed camera move applied to the background AND every overlay at once,
   * so animation drawn in code stays registered with the artwork underneath.
   * (`background.kenBurns` moves only the image, which would slide a painted
   * sun out from under its glow.) See src/animation/useCamera.ts.
   */
  camera?: CameraConfig;
  /** optional per-scene voiceover/sfx, plays from the start of the scene */
  audioSrc?: string;
  /**
   * transition used when cutting INTO this scene from the previous one.
   * First scene ignores this. Defaults to a quick fade.
   */
  transitionIn?: SceneTransition;
};
