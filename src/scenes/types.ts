export type KenBurnsDirection =
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down";

export type Background =
  | { type: "image"; src: string; kenBurns?: KenBurnsDirection }
  | { type: "video"; src: string }
  | { type: "color"; color: string };

export type Overlay =
  | {
      type: "chapterTitle";
      title: string;
      subtitle?: string;
      accentColor: string;
    }
  | {
      type: "dataBadge";
      value: string;
      label?: string;
      /** position in percent of frame, 0-100 */
      x: number;
      y: number;
      accentColor: string;
      /** point the callout line points to, in percent */
      calloutTo?: { x: number; y: number };
    }
  | {
      type: "iconLabel";
      label: string;
      x: number;
      y: number;
    }
  | {
      type: "dateHud";
      date: string;
    }
  | {
      type: "caption";
      text: string;
    };

export type Scene = {
  id: string;
  /** matches the doc's Mục 8 static/animate classification, for traceability only */
  motion: "static" | "animate";
  archetype: string;
  durationInFrames: number;
  background: Background;
  overlays?: Overlay[];
  /** optional per-scene voiceover/sfx, plays from the start of the scene */
  audioSrc?: string;
};
