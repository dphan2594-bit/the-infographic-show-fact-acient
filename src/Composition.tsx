import { CalculateMetadataFunction, Composition } from "remotion";
import { InfographicVideo, getTotalDurationInFrames } from "./InfographicVideo";
import { activeScenes } from "./scenes/active";
import type { Scene } from "./scenes/types";

type Props = {
  scenes: Scene[];
};

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

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
