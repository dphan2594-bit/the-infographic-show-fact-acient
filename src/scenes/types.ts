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
      /**
       * Which point of the artwork to keep when the frame has to crop it, in
       * percent. Defaults to the camera's focus point for the frame being
       * rendered, which is what lets one image serve both 9:16 and 16:9.
       */
      focusX?: number;
      focusY?: number;
    }
  | { type: "video"; src: string; focusX?: number; focusY?: number }
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

/**
 * Whether an overlay travels with the scene camera or stays put in the frame.
 *
 * Anything anchored to a spot in the artwork (a glow on a painted sun, an
 * orbiting body, a badge pointing at something) must move with the camera, or
 * it slides off its target. Text and atmosphere must not: a caption pushed
 * around by the camera drifts off-centre and out of the title-safe area.
 */
export type OverlayLock = "image" | "frame";

type OverlayVariant =
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
      /**
       * Lifts a rectangle of the background image and animates just that copy,
       * so a character in flat artwork can breathe or sway without the picture
       * being exported in layers. Keep the motion small.
       */
      type: "cutout";
      src: string;
      x: number;
      y: number;
      width: number;
      height: number;
      feather?: number;
      originX?: number;
      originY?: number;
    } & EntranceProps)
  | ({
      /**
       * A character cut out of the artwork with a real alpha channel, drawn
       * over a background the character has been patched out of. Unlike
       * `cutout` it is not stuck on its own outline, so the motion can be as
       * large as the shot needs. See scripts/cut-sprite.py.
       */
      type: "sprite";
      src: string;
      x: number;
      y: number;
      width: number;
      height: number;
      /** pivot, in percent of the sprite's own box — a shoulder for an arm */
      originX?: number;
      originY?: number;
      swingDeg?: number;
      /** "strike" raises slowly and drops fast, the way a hammer is used */
      swingShape?: "sine" | "strike";
      /** multiplies the entrance's clock — a snap instead of a drift */
      entranceSpeed?: number;
      /** smear in proportion to travel speed, so a fast move does not strobe */
      motionBlur?: number;
      /** continuous deformation at rest, 0–1 — a warp reads as life where a
       *  translation reads as drift */
      alive?: number;
      /** velocity-driven squash and stretch, 0–1 — what gives a fall mass */
      weight?: number;
      /** frames of wind-up before the entrance — anticipation */
      anticipateFrames?: number;
      anticipatePercent?: number;
      /** bows the entrance path sideways, percent of the sprite's width */
      arcPercent?: number;
      /** degrees of damped wobble after the entrance settles */
      followThrough?: number;
      followSeconds?: number;
      /** carries the sprite across the frame, percent of frame, over travelFrames */
      travelXPercent?: number;
      travelYPercent?: number;
      travelFrames?: number;
      /** scale reached at the end of the travel, for walking into depth */
      travelScale?: number;
      bobPercent?: number;
      breathePercent?: number;
      periodSeconds?: number;
      phaseSeconds?: number;
    } & EntranceProps)
  | {
      /** covers painted eyes with a patch of skin for a few frames — a blink */
      type: "blink";
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      periodSeconds?: number;
      closedFrames?: number;
      offsetSeconds?: number;
      radiusPercent?: number;
    }
  | ({
      /** dims everything except one oval — points the eye inside a busy picture */
      type: "spotlight";
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      darkness?: number;
      softness?: number;
      color?: string;
    } & EntranceProps)
  | ({
      /** headline typography placed anywhere in the frame */
      type: "bigText";
      text: string;
      x: number;
      y: number;
      size?: number;
      color?: string;
      subtitle?: string;
      align?: "left" | "center" | "right";
      plate?: boolean;
      plateColor?: string;
    } & EntranceProps)
  | {
      /** ring drawn around something, optionally with a leader line */
      type: "calloutRing";
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      color?: string;
      strokeWidth?: number;
      drawFrames?: number;
      leaderX?: number;
      leaderY?: number;
      dashed?: boolean;
      pulse?: boolean;
    }
  | {
      /**
       * A one-shot sound effect, timed with `startFrame` like any other beat.
       * The kit in public/audio/sfx is synthesised by scripts/make-sfx.py —
       * every sound library reachable from the sandbox is blocked, and these
       * sounds are built from primitives anyway.
       */
      type: "sfx";
      src: string;
      /** 0–1, default 0.7 */
      volume?: number;
    }
  | {
      /** short flash of colour over the frame, for a cut or a stressed word */
      type: "flash";
      atFrame?: number;
      color?: string;
      attackFrames?: number;
      releaseFrames?: number;
      intensity?: number;
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

/**
 * Every overlay may override where it is locked, and may be limited to a beat
 * inside the scene instead of running its whole length. A long scene is
 * usually a chain of beats ("coins glint, then the ledger unrolls, then the
 * camera pulls back"), and each beat's overlay should come and go with it.
 *
 * `startFrame`/`endFrame` are frames within the scene. Inside that window the
 * overlay sees its own clock starting at 0, so `delayFrames` and `atFrame`
 * stay relative to the beat, and the last 10 frames fade out.
 */
export type Overlay = OverlayVariant & {
  lockTo?: OverlayLock;
  startFrame?: number;
  endFrame?: number;
};

/**
 * How one scene is joined to the next.
 *
 * The first three are plain cuts; the rest are the joins that make a sequence
 * of stills feel like one continuous piece — a flash on the beat, a whip with
 * motion blur, an iris opening on the new subject, a zoom that carries through
 * from one picture into the next.
 */
export type SceneTransition =
  | { type: "fade"; durationInFrames?: number }
  | { type: "flash"; color?: string; intensity?: number; durationInFrames?: number }
  | { type: "whip"; direction?: "from-left" | "from-right"; durationInFrames?: number }
  | { type: "iris"; durationInFrames?: number }
  | { type: "clock-wipe"; durationInFrames?: number }
  | { type: "zoom-through"; durationInFrames?: number }
  | { type: "dissolve"; durationInFrames?: number }
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
  /**
   * Groups scenes into one short of a series ("01", "02", ...). Render a
   * single episode with `npm run render:batch -- --episode=01`; leave it out
   * and every scene is rendered as one long compilation.
   */
  episode?: string;
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
  /** overrides `camera` when rendering the vertical (9:16) composition */
  cameraVertical?: CameraConfig;
  /** overrides `camera` when rendering the wide (16:9) composition */
  cameraWide?: CameraConfig;
  /** optional per-scene voiceover/sfx, plays from the start of the scene */
  audioSrc?: string;
  /**
   * transition used when cutting INTO this scene from the previous one.
   * First scene ignores this. Defaults to a quick fade.
   */
  transitionIn?: SceneTransition;
};
