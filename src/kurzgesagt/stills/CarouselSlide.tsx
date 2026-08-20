import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { SpaceBackground } from "../components/SpaceBackground";
import { Orb } from "../components/Orb";
import { Settled } from "./Settled";
import { DECK } from "./carouselDeck";
import { font, palette } from "../theme";

export const CAROUSEL_SIZE = 1080;
/** Instagram crops the very edge in feed view — keep everything inside this. */
const SAFE_MARGIN = 80;

/**
 * One square slide. Art occupies the upper 55%; the bottom third is reserved
 * for Vietnamese copy, which is always drawn here in code rather than baked
 * into the AI art (Mục 2 of the style guide).
 */
const Slide: React.FC<{ index: number }> = ({ index }) => {
  const slide = DECK[index];

  return (
    <AbsoluteFill>
      <SpaceBackground mood="calm" />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: SAFE_MARGIN,
        }}
      >
        {/* Art zone — upper 55% */}
        <div
          style={{
            height: "52%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {slide.image ? (
            <Img
              src={staticFile(slide.image)}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 72,
              }}
            >
              <Orb size={260} color={slide.accent} glow={1} ring />
              {/* Names the archetype to generate for this slot. */}
              <div
                style={{
                  fontFamily: font.family,
                  fontWeight: font.bold,
                  fontSize: 20,
                  letterSpacing: "0.2em",
                  color: `${palette.muted}AA`,
                }}
              >
                {`CHỖ ĐẶT ẢNH · ARCHETYPE ${slide.archetype}`}
              </div>
            </div>
          )}
        </div>

        {/* Copy zone — bottom third */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
          }}
        >
          {slide.eyebrow ? (
            <div
              style={{
                fontFamily: font.family,
                fontWeight: font.bold,
                fontSize: 26,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: slide.accent,
              }}
            >
              {slide.eyebrow}
            </div>
          ) : null}

          <div
            style={{
              fontFamily: font.family,
              fontWeight: font.black,
              fontSize: 62,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: palette.paper,
            }}
          >
            {slide.headline}
          </div>

          {slide.body ? (
            <div
              style={{
                fontFamily: font.family,
                fontWeight: font.regular,
                fontSize: 32,
                lineHeight: 1.4,
                color: palette.muted,
              }}
            >
              {slide.body}
            </div>
          ) : null}
        </div>

        {/* Slide counter */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          {DECK.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 30 : 10,
                height: 10,
                borderRadius: 999,
                backgroundColor:
                  i === index ? slide.accent : `${palette.muted}55`,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** One frame per slide, so `remotion still --frame=N` exports slide N. */
export const Carousel: React.FC = () => {
  const frame = useCurrentFrame();
  const index = Math.min(Math.max(frame, 0), DECK.length - 1);
  return (
    <Settled at={90}>
      <Slide index={index} />
    </Settled>
  );
};
