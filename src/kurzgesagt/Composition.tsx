import { Composition, Still } from "remotion";
import { RomeVideo, getRomeDurationInFrames } from "./RomeVideo";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { waitForFonts } from "./font";
import {
  StyleSheet,
  STYLE_SHEET_HEIGHT,
  STYLE_SHEET_WIDTH,
} from "./stills/StyleSheet";
import { CAROUSEL_SIZE, Carousel } from "./stills/CarouselSlide";
import { DECK } from "./stills/carouselDeck";

/** Every composition here blocks its first frame until Nunito is ready,
 *  otherwise text renders in the fallback face. */
const withFonts = async () => {
  await waitForFonts;
  return {};
};

export const RomeComposition = () => {
  return (
    <>
      <Composition
        id="WhyRomeFell"
        component={RomeVideo}
        durationInFrames={getRomeDurationInFrames()}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        calculateMetadata={withFonts}
      />

      {/* One frame per slide: `remotion still Carousel out/s3.png --frame=2`. */}
      <Composition
        id="Carousel"
        component={Carousel}
        durationInFrames={DECK.length}
        fps={1}
        width={CAROUSEL_SIZE}
        height={CAROUSEL_SIZE}
        calculateMetadata={withFonts}
      />

      <Still
        id="StyleSheet"
        component={StyleSheet}
        width={STYLE_SHEET_WIDTH}
        height={STYLE_SHEET_HEIGHT}
        calculateMetadata={withFonts}
      />
    </>
  );
};
