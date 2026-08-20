import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Body, Eyebrow, Headline } from "../components/Type";
import { ramp } from "../anim";
import { font, palette } from "../theme";

const SPLIT_START = 34;
const SPLIT_END = 96;

/**
 * The single gold disc separates into two, and its colour resolves into the
 * two halves' identities as it goes — one motion carrying the whole idea.
 */
const Halves: React.FC = () => {
  const frame = useCurrentFrame();
  const t = ramp(frame, SPLIT_START, SPLIT_END);
  const offset = t * 250;

  const halves = [
    { label: "TÂY LA MÃ", capital: "Ravenna", color: palette.coral, dir: -1 },
    { label: "ĐÔNG LA MÃ", capital: "Constantinopolis", color: palette.teal, dir: 1 },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: 900,
        height: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {halves.map((half) => (
        <div
          key={half.label}
          style={{
            position: "absolute",
            transform: `translateX(${half.dir * offset}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 190,
              height: 190,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -95,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${half.color}55 0%, transparent 62%)`,
                opacity: t,
              }}
            />
            {/* Both discs start as the same gold and cross-fade to their own
                colour only as they pull apart. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                backgroundColor: palette.gold,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                backgroundColor: half.color,
                opacity: t,
              }}
            />
          </div>

          <div
            style={{
              opacity: ramp(frame, SPLIT_END - 26, SPLIT_END + 8),
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: font.family,
                fontWeight: font.black,
                fontSize: 34,
                color: half.color,
                letterSpacing: "0.04em",
              }}
            >
              {half.label}
            </div>
            <div
              style={{
                fontFamily: font.family,
                fontWeight: font.regular,
                fontSize: 25,
                color: palette.muted,
                marginTop: 4,
              }}
            >
              {half.capital}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SplitScene: React.FC = () => {
  return (
    <SceneShell mood="grim">
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "80px 130px",
        }}
      >
        <Eyebrow delay={0} color={palette.paper}>
          Năm 395
        </Eyebrow>
        <Headline delay={7} size={72}>
          Đế chế tách làm đôi
        </Headline>

        <Halves />

        <Body delay={104} size={34} color={palette.paper}>
          Quá lớn để cai trị từ một chỗ. Nhưng nửa phía tây nhận phần biên giới khó giữ nhất.
        </Body>
      </AbsoluteFill>
    </SceneShell>
  );
};
