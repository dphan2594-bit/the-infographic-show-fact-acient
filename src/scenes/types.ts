import type { EntranceName, IdleName } from "../animation/presets";

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
  | { type: "color"; color: string };

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

export type Overlay =
  | ({
      type: "chapterTitle";
      title: string;
      subtitle?: string;
      accentColor: string;
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
  | { type: "slide"; direction?: "from-left" | "from-right" | "from-top" | "from-bottom"; durationInFrames?: number }
  | { type: "wipe"; direction?: "from-left" | "from-right" | "from-top" | "from-bottom"; durationInFrames?: number }
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
  /** optional per-scene voiceover/sfx, plays from the start of the scene */
  audioSrc?: string;
  /**
   * transition used when cutting INTO this scene from the previous one.
   * First scene ignores this. Defaults to a quick fade.
   */
  transitionIn?: SceneTransition;
};
