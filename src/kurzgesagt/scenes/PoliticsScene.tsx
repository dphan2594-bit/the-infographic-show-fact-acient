import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CauseLayout } from "../components/CauseLayout";
import { Stat } from "../components/Stat";
import { appear, ramp } from "../anim";
import { HEIGHT, WIDTH, causeColors, palette } from "../theme";
import { Creature, Defs, Glow, PlanetArc, arcY } from "../illustration/parts";
import type { Ground } from "../illustration/parts";

const ACCENT = causeColors.politics;
const GROUND_SHAPE: Ground = { top: 742, radius: 5200, centerX: 960 };
const EMPERORS = 13;
/** frames between one emperor taking the throne and the next */
const STEP = 9;
const FIRST = 24;

/**
 * Each emperor rises, wears the crown for a moment, then topples sideways as
 * the next one appears. Run end to end, the row reads as churn — which is the
 * whole claim of this beat.
 */
const Throne: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs colors={[ACCENT]} />

      <PlanetArc
        top={GROUND_SHAPE.top}
        radius={GROUND_SHAPE.radius}
        centerX={GROUND_SHAPE.centerX}
        color="#2C1A3E"
        rimColor="#43285C"
      />

      {new Array(EMPERORS).fill(0).map((_, i) => {
        const x = 190 + i * 130;
        const y = arcY(x, GROUND_SHAPE) + 2;
        const start = FIRST + i * STEP;
        const rise = appear(frame, start);
        /* Falls once the next two have taken the throne. */
        const fall = ramp(frame, start + STEP * 2, start + STEP * 2 + 14);

        return (
          <g key={x}>
            <Glow
              x={x}
              y={y - 46}
              r={96}
              color={ACCENT}
              opacity={rise * (1 - fall) * 0.85}
            />
            {/* Pivot at the feet so the body tips over rather than sliding. */}
            <g transform={`rotate(${fall * 78} ${x} ${y})`}>
              <Creature
                x={x}
                y={y}
                scale={rise}
                color={ACCENT}
                accessory="crown"
                accessoryColor={palette.gold}
                opacity={1 - fall * 0.55}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export const PoliticsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const statsIn = appear(frame, 128);

  return (
    <SceneShell mood="grim">
      <AbsoluteFill>
        <Throne />
      </AbsoluteFill>

      <CauseLayout
        index={3}
        accent={ACCENT}
        title="Không ai ngồi vững trên ngai"
        takeaway="Ai nắm quân đội thì nắm ngai vàng — nên quân đội bận lật đổ hoàng đế hơn là giữ biên giới."
      >
        <div
          style={{
            display: "flex",
            gap: 130,
            opacity: statsIn,
            transform: `translateY(-40px)`,
          }}
        >
          <Stat value={26} label="hoàng đế" color={ACCENT} delay={128} size={92} />
          <Stat value={50} label="năm" color={palette.paper} delay={136} size={92} />
          <Stat
            value={1.9}
            decimals={1}
            label="năm cầm quyền trung bình"
            color={palette.muted}
            delay={144}
            size={92}
          />
        </div>
      </CauseLayout>
    </SceneShell>
  );
};
