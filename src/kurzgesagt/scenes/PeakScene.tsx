import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Stat } from "../components/Stat";
import { Eyebrow, Headline } from "../components/Type";
import { appear, drift } from "../anim";
import { HEIGHT, WIDTH, palette } from "../theme";
import {
  City,
  Creature,
  Defs,
  Glow,
  PlanetArc,
  SunRays,
  Temple,
  arcAngle,
  arcY,
} from "../illustration/parts";
import type { Ground } from "../illustration/parts";

/* A large radius keeps the world nearly flat, so buildings near the edge of
   the frame do not tilt far enough to look like they are toppling. */
const GROUND_SHAPE: Ground = { top: 792, radius: 4200, centerX: 960 };
const STONE = "#4A3F8C";
const STONE_LIT = "#6355B8";

/** A crowd spread along the horizon, dense because the empire is at its peak. */
const CROWD = [
  { x: 250, c: palette.teal },
  { x: 318, c: palette.sky },
  { x: 386, c: palette.violet },
  { x: 1480, c: palette.sky },
  { x: 1552, c: palette.teal },
  { x: 1624, c: palette.violet },
];

export const PeakScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cityIn = appear(frame, 18);

  return (
    <SceneShell mood="calm">
      <AbsoluteFill>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs colors={[palette.gold]} />

          <Glow x={1660} y={214} r={300} color={palette.gold} />
          <g transform={`translate(1660 214)`}>
            <SunRays
              x={0}
              y={0}
              count={14}
              inner={78}
              length={40}
              color={palette.amber}
              rotation={drift(frame, 3)}
            />
            <circle r={66} fill={palette.gold} />
          </g>

          <PlanetArc
            top={GROUND_SHAPE.top}
            radius={GROUND_SHAPE.radius}
            centerX={GROUND_SHAPE.centerX}
            color="#2A2159"
            rimColor="#3E3480"
          />

          {/* Aqueduct arches running off to the left — Rome at full stretch. */}
          <g
            transform={`translate(330 ${arcY(330, GROUND_SHAPE)}) rotate(${arcAngle(330, GROUND_SHAPE)})`}
            opacity={cityIn}
          >
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${i * 62} 0)`}>
                <rect x={-8} y={-86} width={16} height={86} fill={STONE} />
                <path
                  d="M 8 -60 A 23 23 0 0 1 54 -60 L 54 -86 L 8 -86 Z"
                  fill={STONE}
                />
              </g>
            ))}
            <rect x={-12} y={-104} width={272} height={20} fill={STONE_LIT} />
          </g>

          <City
            x={960}
            y={arcY(960, GROUND_SHAPE) + 2}
            scale={1.75 * cityIn}
            color={STONE}
            accent={palette.gold}
          />
          <Temple
            x={640}
            y={arcY(640, GROUND_SHAPE) + 2}
            scale={0.95 * appear(frame, 30)}
            color={STONE}
            roofColor={STONE_LIT}
          />
          <Temple
            x={1300}
            y={arcY(1300, GROUND_SHAPE) + 2}
            scale={0.95 * appear(frame, 36)}
            color={STONE}
            roofColor={STONE_LIT}
          />

          {CROWD.map((who, i) => (
            <Creature
              key={who.x}
              x={who.x}
              y={arcY(who.x, GROUND_SHAPE) + 2}
              scale={0.85 * appear(frame, 44 + i * 5)}
              color={who.c}
              look={who.x < 960 ? 1 : -1}
            />
          ))}
        </svg>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "70px 130px 0",
          gap: 12,
        }}
      >
        <Eyebrow delay={0} color={palette.gold}>
          Năm 117 sau Công nguyên
        </Eyebrow>
        <Headline delay={8} size={74}>
          Đỉnh cao quyền lực
        </Headline>

        <div style={{ display: "flex", gap: 130, marginTop: 40 }}>
          <Stat value={5} label="triệu km² lãnh thổ" color={palette.sky} delay={46} size={86} />
          <Stat value={70} label="triệu người dân" color={palette.teal} delay={58} size={86} />
          <Stat value={25} suffix="%" label="dân số thế giới" color={palette.gold} delay={70} size={86} />
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
