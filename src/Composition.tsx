import { CalculateMetadataFunction, Composition } from "remotion";
import { InfographicVideo, getTotalDurationInFrames } from "./InfographicVideo";
import {
  MilletKurzgesagt,
  MILLET_CANVAS,
  MILLET_TOTAL_FRAMES,
} from "./MilletKurzgesagt";
import { activeScenes } from "./scenes/active";
import type { Scene } from "./scenes/types";

type Props = {
  scenes: Scene[];
};

const FPS = 30;
// Vertical 9:16 — YouTube Shorts / TikTok / Reels.
const WIDTH = 1080;
const HEIGHT = 1920;

const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => {
  return {
    durationInFrames: Math.max(1, getTotalDurationInFrames(props.scenes)),
  };
};

export const InfographicComposition = () => {
  return (
    <Composition
      id="Infographic"
      component={InfographicVideo}
      durationInFrames={getTotalDurationInFrames(activeScenes)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ scenes: activeScenes }}
      calculateMetadata={calculateMetadata}
    />
  );
};

// Same millet script, drawn entirely in code in the Kurzgesagt-style flat-vector
// language. Built with .claude/skills/kurzgesagt-style-video.
export const MilletKurzgesagtComposition = () => {
  return (
    <Composition
      id="MilletKurzgesagt"
      component={MilletKurzgesagt}
      durationInFrames={MILLET_TOTAL_FRAMES}
      fps={MILLET_CANVAS.fps}
      width={MILLET_CANVAS.width}
      height={MILLET_CANVAS.height}
    />
  );
};
