import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CauseLayout } from "../components/CauseLayout";
import { appear, ramp } from "../anim";
import { HEIGHT, WIDTH, causeColors, palette } from "../theme";
import {
  Creature,
  Defs,
  Glow,
  PlanetArc,
  Tower,
  Wall,
  arcAngle,
  arcY,
} from "../illustration/parts";
import type { Ground } from "../illustration/parts";

const ACCENT = causeColors.overreach;
const GROUND_SHAPE: Ground = { top: 802, radius: 4600, centerX: 960 };
const STONE = "#3B3272";
const STONE_LIT = "#4C4193";

/** Towers march off both edges of the frame — the wall has no end in sight. */
const TOWERS = [-40, 200, 440, 680, 920, 1160, 1400, 1640, 1880];
/** Four defenders for nine towers. The gaps are the argument. */
const GARRISON = [140, 620, 1230, 1780];

const Frontier: React.FC = () => {
  const frame = useCurrentFrame();
  const built = ramp(frame, 16, 80);

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs colors={[ACCENT]} />

      <PlanetArc
        top={GROUND_SHAPE.top}
        radius={GROUND_SHAPE.radius}
        centerX={GROUND_SHAPE.centerX}
        color="#231C4E"
        rimColor="#332A72"
      />

      {TOWERS.map((x, i) => {
        const reveal = appear(frame, 16 + i * 4);
        const y = arcY(x, GROUND_SHAPE) + 2;
        return (
          <g key={x}>
            {/* wall run reaching to the next tower */}
            <g
              transform={`translate(${x} ${y}) rotate(${arcAngle(x, GROUND_SHAPE)})`}
              opacity={built}
            >
              <Wall x={20} y={0} width={200} color={STONE} height={30} />
            </g>
            <g
              transform={`translate(${x} ${y}) rotate(${arcAngle(x, GROUND_SHAPE)}) scale(${reveal})`}
            >
              <Tower x={0} y={0} color={STONE_LIT} height={78} />
            </g>
          </g>
        );
      })}

      {GARRISON.map((x, i) => {
        const y = arcY(x, GROUND_SHAPE) + 2;
        const reveal = appear(frame, 62 + i * 7);
        return (
          <g key={x}>
            <Glow x={x} y={y - 40} r={90} color={ACCENT} opacity={reveal * 0.8} />
            <g transform={`rotate(${arcAngle(x, GROUND_SHAPE)} ${x} ${y})`}>
              <Creature
                x={x}
                y={y}
                scale={0.95 * reveal}
                color={ACCENT}
                accessory="spear"
                accessoryColor={palette.paper}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export const OverreachScene: React.FC = () => {
  const frame = useCurrentFrame();
  const statsIn = appear(frame, 92);

  return (
    <SceneShell mood="calm">
      <AbsoluteFill>
        <Frontier />
      </AbsoluteFill>

      <CauseLayout
        index={1}
        accent={ACCENT}
        title="Quá lớn để tự bảo vệ"
        takeaway="Càng bành trướng, mỗi km biên giới càng ít quân giữ — và càng tốn tiền."
      >
        <div
          style={{
            display: "flex",
            gap: 120,
            opacity: statsIn,
            transform: `translateY(${(1 - statsIn) * 20 - 30}px)`,
          }}
        >
          {[
            { v: "8.000 km", l: "đường biên giới", c: ACCENT },
            { v: "30", l: "quân đoàn giữ toàn bộ", c: palette.paper },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Nunito",
                  fontWeight: 900,
                  fontSize: 88,
                  lineHeight: 1,
                  color: s.c,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontFamily: "Nunito",
                  fontWeight: 700,
                  fontSize: 27,
                  color: palette.muted,
                  marginTop: 8,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </CauseLayout>
    </SceneShell>
  );
};
