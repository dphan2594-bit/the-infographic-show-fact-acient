import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Body, Eyebrow, Headline } from "../components/Type";
import { appear, ramp } from "../anim";
import { font, palette } from "../theme";

const BREAK_START = 40;
const BREAK_END = 105;
const SHARDS = 22;
const DISC = 190;
/** Each half gets an equal column so the pair stays centred once one breaks up. */
const COLUMN = 340;

const Caption: React.FC<{ text: string; color: string; delay: number }> = ({
  text,
  color,
  delay,
}) => {
  const captionIn = appear(useCurrentFrame(), delay);
  return (
    <div
      style={{
        fontFamily: font.family,
        fontWeight: font.black,
        fontSize: 30,
        color,
        textAlign: "center",
        whiteSpace: "nowrap",
        opacity: captionIn,
        transform: `translateY(${(1 - captionIn) * 14}px)`,
      }}
    >
      {text}
    </div>
  );
};

/**
 * The western disc breaks into shards that drift outward and dim, while the
 * eastern disc holds its colour — the asymmetry is the point of the scene.
 * A dashed outline is left where the west was so the frame stays balanced.
 */
const Collapse: React.FC = () => {
  const frame = useCurrentFrame();
  const t = ramp(frame, BREAK_START, BREAK_END);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 200,
        paddingTop: 26,
      }}
    >
      <div
        style={{
          width: COLUMN,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <div style={{ position: "relative", width: DISC, height: DISC }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `3px dashed ${palette.coral}`,
              opacity: t * 0.45,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: palette.coral,
              opacity: 1 - t,
              transform: `scale(${1 - t * 0.35})`,
            }}
          />
          {new Array(SHARDS).fill(0).map((_, i) => {
            const angle = random(`shard-a-${i}`) * Math.PI * 2;
            const distance = (70 + random(`shard-d-${i}`) * 190) * t;
            const size = 12 + random(`shard-s-${i}`) * 20;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: DISC / 2 + Math.cos(angle) * distance - size / 2,
                  top: DISC / 2 + Math.sin(angle) * distance - size / 2,
                  width: size,
                  height: size,
                  borderRadius: 5,
                  backgroundColor: palette.coral,
                  opacity: Math.max(0, 1 - t * 1.15),
                  transform: `rotate(${t * 220 + i * 17}deg)`,
                }}
              />
            );
          })}
        </div>
        <Caption
          text="Sụp đổ năm 476"
          color={palette.coral}
          delay={BREAK_END - 20}
        />
      </div>

      <div
        style={{
          width: COLUMN,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <div style={{ position: "relative", width: DISC, height: DISC }}>
          <div
            style={{
              position: "absolute",
              inset: -DISC / 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${palette.teal}55 0%, transparent 62%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: palette.teal,
            }}
          />
        </div>
        <Caption
          text="Trụ thêm 977 năm — đến 1453"
          color={palette.teal}
          delay={BREAK_END - 6}
        />
      </div>
    </div>
  );
};

export const FallScene: React.FC = () => {
  return (
    <SceneShell mood="grim">
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: "80px 130px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Eyebrow delay={0} color={palette.coral}>
            Ngày 4 tháng 9, năm 476
          </Eyebrow>
          <Headline delay={7} size={72}>
            Hoàng đế cuối cùng bị phế truất
          </Headline>
        </div>

        <Collapse />

        <Body delay={112} size={34} color={palette.paper}>
          Romulus Augustulus mất ngôi — và không ai buồn lập người kế vị ở phương Tây.
        </Body>
      </AbsoluteFill>
    </SceneShell>
  );
};
