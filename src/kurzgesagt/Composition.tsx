import { Composition } from "remotion";
import { RomeVideo, getRomeDurationInFrames } from "./RomeVideo";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { waitForFonts } from "./font";

export const RomeComposition = () => {
  return (
    <Composition
      id="WhyRomeFell"
      component={RomeVideo}
      durationInFrames={getRomeDurationInFrames()}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      calculateMetadata={async () => {
        /* Block the first frame until Nunito is ready, otherwise the opening
           title renders in the fallback face. */
        await waitForFonts;
        return {};
      }}
    />
  );
};
