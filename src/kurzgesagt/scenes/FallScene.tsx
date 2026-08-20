import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Body, Eyebrow, Headline } from "../components/Type";
import { appear, ramp } from "../anim";
import { HEIGHT, WIDTH, font, palette } from "../theme";
import { City, Creature, Defs, Glow, PlanetArc, arcY } from "../illustration/parts";
import type { Ground } from "../illustration/parts";

const BREAK_START = 34;
const BREAK_END = 108;
const WEST: Ground = { top: 800, radius: 2200, centerX: 500 };
const EAST: Ground = { top: 800, radius: 2200, centerX: 1440 };
const RUBBLE = 16;

/**
 * The west crumbles and its people scatter; the east is untouched. The two
 * halves keep identical framing so the only difference the eye reads is what
 * happened to them.
 */
const Aftermath: React.FC = () => {
  const frame = useCurrentFrame();
  const ruin = ramp(frame, BREAK_START, BREAK_END);

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs colors={[palette.coral, palette.teal]} />

      <clipPath id="fall-west">
        <rect x={0} y={0} width={960} height={HEIGHT} />
      </clipPath>
      <clipPath id="fall-east">
        <rect x={960} y={0} width={960} height={HEIGHT} />
      </clipPath>

      <g clipPath="url(#fall-west)">
        <PlanetArc top={WEST.top} radius={WEST.radius} centerX={WEST.centerX} color="#241A47" rimColor="#5C2E44" />
        <Glow x={500} y={arcY(500, WEST) - 70} r={220} color={palette.coral} opacity={1 - ruin} />
        <City x={500} y={arcY(500, WEST) + 2} scale={1.05} color="#7A3A55" accent={palette.coral} ruin={ruin} />

        {/* Debris thrown clear of the collapsing city. */}
        {new Array(RUBBLE).fill(0).map((_, i) => {
          const a = random(`fall-a-${i}`) * Math.PI - Math.PI;
          const d = (60 + random(`fall-d-${i}`) * 190) * ruin;
          const s = 9 + random(`fall-s-${i}`) * 14;
          return (
            <rect
              key={i}
              x={500 + Math.cos(a) * d - s / 2}
              y={arcY(500, WEST) - 60 + Math.sin(a) * d * 0.5}
              width={s}
              height={s}
              rx={3}
              fill="#7A3A55"
              opacity={Math.max(0, 1 - ruin * 1.2)}
              transform={`rotate(${ruin * 200 + i * 21} ${500 + Math.cos(a) * d} ${arcY(500, WEST) - 60})`}
            />
          );
        })}

        {/* Two survivors walking away from the ruin. */}
        {[0, 1].map((i) => {
          const x = 500 - 130 - i * 60 - ruin * 150;
          return (
            <Creature
              key={i}
              x={x}
              y={arcY(x, WEST) + 2}
              scale={0.92}
              color={palette.coral}
              accessory="hood"
              accessoryColor="#8C4463"
              look={-1}
              opacity={ruin}
            />
          );
        })}
      </g>

      <g clipPath="url(#fall-east)">
        <PlanetArc top={EAST.top} radius={EAST.radius} centerX={EAST.centerX} color="#241A47" rimColor="#2C6B63" />
        <Glow x={1440} y={arcY(1440, EAST) - 80} r={260} color={palette.teal} />
        <City x={1440} y={arcY(1440, EAST) + 2} scale={1.05} color="#2C6B63" accent={palette.teal} />
        {[-150, 150].map((dx) => {
          const x = 1440 + dx;
          return (
            <Creature
              key={dx}
              x={x}
              y={arcY(x, EAST) + 2}
              scale={0.9}
              color={palette.teal}
              look={dx < 0 ? 1 : -1}
            />
          );
        })}
      </g>

      {[
        { x: 500, text: "Sụp đổ năm 476", color: palette.coral, delay: BREAK_END - 26 },
        { x: 1440, text: "Trụ thêm 977 năm — đến 1453", color: palette.teal, delay: BREAK_END - 12 },
      ].map((cap) => (
        <text
          key={cap.text}
          x={cap.x}
          y={706}
          fill={cap.color}
          fontFamily={font.family}
          fontWeight={font.black}
          fontSize={31}
          textAnchor="middle"
          opacity={appear(frame, cap.delay)}
        >
          {cap.text}
        </text>
      ))}
    </svg>
  );
};

export const FallScene: React.FC = () => {
  return (
    <SceneShell mood="grim">
      <AbsoluteFill>
        <Aftermath />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "76px 130px 66px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Eyebrow delay={0} color={palette.coral}>
            Ngày 4 tháng 9, năm 476
          </Eyebrow>
          <Headline delay={7} size={70}>
            Hoàng đế cuối cùng bị phế truất
          </Headline>
        </div>

        <Body delay={118} size={34} color={palette.paper}>
          Romulus Augustulus mất ngôi — và không ai buồn lập người kế vị ở phương Tây.
        </Body>
      </AbsoluteFill>
    </SceneShell>
  );
};
