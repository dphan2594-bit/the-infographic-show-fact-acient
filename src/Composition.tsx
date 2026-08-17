import { CalculateMetadataFunction, Composition } from "remotion";
import { InfographicVideo, getTotalDurationInFrames } from "./InfographicVideo";
import { PRESET_GALLERY_DURATION, PresetGallery } from "./PresetGallery";
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

/**
 * Preview-only composition: every animation preset playing side by side, so
 * you can pick one by eye before writing it into content/manifest.json.
 */
export const PresetGalleryComposition = () => {
  return (
    <Composition
      id="PresetGallery"
      component={PresetGallery}
      durationInFrames={PRESET_GALLERY_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
