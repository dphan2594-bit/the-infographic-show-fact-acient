import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Body, Headline } from "../components/Type";
import { appear, ramp } from "../anim";
import { causeColors, font, palette } from "../theme";

const TOPPLE_START = 118;
const TOPPLE_END = 165;

const LAYERS = [
  { label: "Biên giới quá dài", color: causeColors.overreach, from: -1 },
  { label: "Tiền mất giá", color: causeColors.money, from: 1 },
  { label: "Chính trị bất ổn", color: causeColors.politics, from: -1 },
  { label: "Sức ép bên ngoài", color: causeColors.pressure, from: 1 },
];

/**
 * The four causes stack into one column, then lean together. None of them
 * topples it alone — that is the argument the scene has to land.
 */
const CauseStack: React.FC = () => {
  const frame = useCurrentFrame();
  const lean = ramp(frame, TOPPLE_START, TOPPLE_END);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        /* Pivot at the bottom of the stack so it tips like a tower, not a card. */
        transformOrigin: "50% 100%",
        transform: `rotate(${lean * 5}deg) translateY(${lean * 16}px)`,
      }}
    >
      {LAYERS.map((layer, i) => {
        const delay = 18 + i * 16;
        const slide = appear(frame, delay);
        return (
          <div
            key={layer.label}
            style={{
              width: 660,
              height: 84,
              borderRadius: 18,
              backgroundColor: layer.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: font.family,
              fontWeight: font.black,
              fontSize: 34,
              color: palette.ink,
              opacity: slide,
              transform: `translateX(${(1 - slide) * layer.from * 320}px)`,
            }}
          >
            {layer.label}
          </div>
        );
      })}
    </div>
  );
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const closingIn = appear(frame, 132);

  return (
    <SceneShell mood="calm">
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 62,
          padding: "80px 130px",
        }}
      >
        <Headline delay={0} size={66}>
          Không có một nguyên nhân duy nhất
        </Headline>

        <CauseStack />

        <div style={{ opacity: closingIn, height: 60 }}>
          <Body delay={132} size={36} color={palette.gold}>
            Rome không bị hạ gục. Rome mục ruỗng — trong hơn hai thế kỷ.
          </Body>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
