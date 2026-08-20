import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Body, Headline } from "../components/Type";
import { appear, drift, ramp } from "../anim";
import { HEIGHT, WIDTH, causeColors, font, palette } from "../theme";
import {
  Creature,
  Defs,
  Glow,
  PlanetArc,
  SunRays,
  arcY,
} from "../illustration/parts";
import type { Ground } from "../illustration/parts";

const GROUND_SHAPE: Ground = { top: 812, radius: 4200, centerX: 960 };
const DIM_START = 96;
const DIM_END = 156;

/** One creature per cause, each carrying the colour it had in its own scene. */
const CAUSES = [
  { x: 560, color: causeColors.overreach, label: "Biên giới quá dài", delay: 22 },
  { x: 827, color: causeColors.money, label: "Tiền mất giá", delay: 34 },
  { x: 1093, color: causeColors.politics, label: "Chính trị bất ổn", delay: 46 },
  { x: 1360, color: causeColors.pressure, label: "Sức ép bên ngoài", delay: 58 },
];

/**
 * Rome's sun dims while the four causes stand under it — none of them puts it
 * out alone, which is the point the scene has to land.
 */
const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const dim = ramp(frame, DIM_START, DIM_END);

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs colors={[palette.gold, ...CAUSES.map((c) => c.color)]} />

      <Glow x={960} y={300} r={400} color={palette.gold} opacity={1 - dim * 0.75} />
      <g transform={`translate(960 300) scale(${1 - dim * 0.28})`}>
        <SunRays
          x={0}
          y={0}
          count={16}
          inner={104}
          length={54}
          color={palette.amber}
          rotation={drift(frame, 4)}
          opacity={1 - dim * 0.85}
        />
        <circle r={88} fill={palette.gold} opacity={1 - dim * 0.45} />
      </g>

      <PlanetArc
        top={GROUND_SHAPE.top}
        radius={GROUND_SHAPE.radius}
        centerX={GROUND_SHAPE.centerX}
        color="#221A4A"
        rimColor="#332876"
      />

      {CAUSES.map((cause) => {
        const y = arcY(cause.x, GROUND_SHAPE) + 2;
        const rise = appear(frame, cause.delay);
        return (
          <g key={cause.label}>
            <Glow x={cause.x} y={y - 44} r={104} color={cause.color} opacity={rise * 0.8} />
            <Creature x={cause.x} y={y} scale={1.15 * rise} color={cause.color} />
            <text
              x={cause.x}
              y={y + 52}
              fill={cause.color}
              fontFamily={font.family}
              fontWeight={font.bold}
              fontSize={25}
              textAnchor="middle"
              opacity={rise}
            >
              {cause.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell mood="calm">
      <AbsoluteFill>
        <Closing />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "500px 130px 74px",
          justifyContent: "space-between",
        }}
      >
        <Headline delay={70} size={64}>
          Không có một nguyên nhân duy nhất
        </Headline>

        <div style={{ opacity: appear(frame, 150) }}>
          <Body delay={150} size={36} color={palette.gold}>
            Rome không bị hạ gục. Rome mục ruỗng — trong hơn hai thế kỷ.
          </Body>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
