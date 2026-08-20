import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Body, Eyebrow, Headline } from "../components/Type";
import { appear, ramp } from "../anim";
import { HEIGHT, WIDTH, font, palette } from "../theme";
import { City, Creature, Defs, Glow, PlanetArc, arcY } from "../illustration/parts";
import type { Ground } from "../illustration/parts";

const SPLIT_START = 30;
const SPLIT_END = 96;
const BASE: Ground = { top: 806, radius: 3000, centerX: 960 };

const HALVES = [
  {
    key: "west",
    label: "TÂY LA MÃ",
    capital: "Ravenna",
    color: palette.coral,
    dir: -1,
    stone: "#7A3A55",
  },
  {
    key: "east",
    label: "ĐÔNG LA MÃ",
    capital: "Constantinopolis",
    color: palette.teal,
    dir: 1,
    stone: "#2C6B63",
  },
];

/**
 * One world drifts apart into two. Each half keeps its own ground, so the gap
 * that opens between them is literal rather than a graphic device.
 */
const Halves: React.FC = () => {
  const frame = useCurrentFrame();
  const t = ramp(frame, SPLIT_START, SPLIT_END);
  const shift = t * 300;

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs colors={[palette.coral, palette.teal]} />

      {HALVES.map((half) => {
        const cx = 960 + half.dir * shift;
        const ground: Ground = { ...BASE, centerX: cx, radius: 2200 };
        const cityX = cx + half.dir * 40;

        return (
          <g key={half.key}>
            {/* Clip each half to its own side once the gap has opened. */}
            <clipPath id={`half-${half.key}`}>
              <rect
                x={half.dir < 0 ? 0 : 960 + t * 6}
                y={0}
                width={half.dir < 0 ? 960 - t * 6 : WIDTH}
                height={HEIGHT}
              />
            </clipPath>
            <g clipPath={`url(#half-${half.key})`}>
              <PlanetArc
                top={BASE.top}
                radius={ground.radius}
                centerX={cx}
                color="#241A47"
                rimColor={half.stone}
              />
              <Glow x={cityX} y={arcY(cityX, ground) - 80} r={230} color={half.color} opacity={t} />
              <City
                x={cityX}
                y={arcY(cityX, ground) + 2}
                scale={1.05}
                color={half.stone}
                accent={half.color}
              />
              {[-150, 150].map((dx, i) => {
                const x = cityX + dx;
                return (
                  <Creature
                    key={dx}
                    x={x}
                    y={arcY(x, ground) + 2}
                    scale={0.9 * appear(frame, 54 + i * 8)}
                    color={half.color}
                    look={dx < 0 ? 1 : -1}
                  />
                );
              })}
            </g>

            <g opacity={ramp(frame, SPLIT_END - 30, SPLIT_END + 6)}>
              <text
                x={cx}
                y={286}
                fill={half.color}
                fontFamily={font.family}
                fontWeight={font.black}
                fontSize={40}
                textAnchor="middle"
                letterSpacing="2"
              >
                {half.label}
              </text>
              <text
                x={cx}
                y={330}
                fill={palette.muted}
                fontFamily={font.family}
                fontWeight={font.regular}
                fontSize={27}
                textAnchor="middle"
              >
                {half.capital}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export const SplitScene: React.FC = () => {
  return (
    <SceneShell mood="grim">
      <AbsoluteFill>
        <Halves />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "76px 130px 70px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Eyebrow delay={0} color={palette.paper}>
            Năm 395
          </Eyebrow>
          <Headline delay={7} size={70}>
            Đế chế tách làm đôi
          </Headline>
        </div>

        <Body delay={104} size={34} color={palette.paper}>
          Quá lớn để cai trị từ một chỗ. Nhưng nửa phía tây nhận phần biên giới khó giữ nhất.
        </Body>
      </AbsoluteFill>
    </SceneShell>
  );
};
