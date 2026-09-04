import { CalculateMetadataFunction, Composition } from "remotion";
import { InfographicVideo, getTotalDurationInFrames } from "./InfographicVideo";
import { PRESET_GALLERY_DURATION, PresetGallery } from "./PresetGallery";
import { activeScenes } from "./scenes/active";
import { illustrationScenes } from "./scenes/illustration";
import { kurzgesagtScenes } from "./scenes/kurzgesagt";
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
 * The same scene list at 16:9, for YouTube. Scenes can carry `cameraWide` to
 * frame each shot differently from the vertical cut.
 */
export const InfographicWideComposition = () => {
  return (
    <Composition
      id="InfographicWide"
      component={InfographicVideo}
      durationInFrames={getTotalDurationInFrames(activeScenes)}
      fps={FPS}
      width={1920}
      height={1080}
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

/**
 * Showcase reel for the Kurzgesagt-style motion pack (src/scenes/kurzgesagt.ts):
 * animated space backdrops, orbit systems and particle bursts, no image assets.
 */
export const KurzgesagtDemoComposition = () => {
  return (
    <Composition
      id="KurzgesagtDemo"
      component={InfographicVideo}
      durationInFrames={getTotalDurationInFrames(kurzgesagtScenes)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ scenes: kurzgesagtScenes }}
      calculateMetadata={calculateMetadata}
    />
  );
};

/**
 * A single flat illustration brought to life (src/scenes/illustration.ts):
 * camera push, orbiting bodies on the painted orbits, breathing glows,
 * twinkle and meteors. Landscape, matching the artwork's aspect ratio.
 */
export const AnimatedIllustrationComposition = () => {
  return (
    <Composition
      id="AnimatedIllustration"
      component={InfographicVideo}
      durationInFrames={getTotalDurationInFrames(illustrationScenes)}
      fps={FPS}
      width={1920}
      height={888}
      defaultProps={{ scenes: illustrationScenes }}
      calculateMetadata={calculateMetadata}
    />
  );
};
