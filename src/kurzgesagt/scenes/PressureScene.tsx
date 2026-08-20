import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CauseLayout } from "../components/CauseLayout";
import { appear, ramp } from "../anim";
import { HEIGHT, WIDTH, causeColors, font, palette } from "../theme";
import {
  City,
  Creature,
  Defs,
  Glow,
  PlanetArc,
  Tower,
  Wall,
  arcY,
} from "../illustration/parts";
import type { Ground } from "../illustration/parts";

const ACCENT = causeColors.pressure;
const GROUND_SHAPE: Ground = { top: 786, radius: 5200, centerX: 960 };

/**
 * Three waves closing on the city. Each stops at its own distance so later
 * waves queue up behind earlier ones instead of standing on top of them, and
 * each label is anchored to its own group rather than to a fixed slot.
 */
const WAVES = [
  { label: "Người Goth · 376", from: -1, delay: 26, stop: 300 },
  { label: "Người Hung · 440s", from: 1, delay: 54, stop: 300 },
  { label: "Người Vandal · 455", from: -1, delay: 82, stop: 570 },
];

const MARCH_START = 780;

const Siege: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs colors={[ACCENT, palette.gold]} />

      <PlanetArc
        top={GROUND_SHAPE.top}
        radius={GROUND_SHAPE.radius}
        centerX={GROUND_SHAPE.centerX}
        color="#2A1733"
        rimColor="#3F2450"
      />

      {/* Rome behind its wall, holding the middle. */}
      <Glow x={960} y={arcY(960, GROUND_SHAPE) - 90} r={280} color={palette.gold} />
      <City
        x={960}
        y={arcY(960, GROUND_SHAPE) - 26}
        scale={1.25}
        color="#5A4A9E"
        accent={palette.gold}
      />
      <Wall x={840} y={arcY(960, GROUND_SHAPE) + 2} width={240} color="#4A3D85" height={40} />
      <Tower x={834} y={arcY(834, GROUND_SHAPE) + 2} color="#5A4A9E" height={64} />
      <Tower x={1086} y={arcY(1086, GROUND_SHAPE) + 2} color="#5A4A9E" height={64} />

      {WAVES.map((wave, w) => {
        const travel = ramp(frame, wave.delay, wave.delay + 46);
        const distance = MARCH_START - (MARCH_START - wave.stop) * travel;
        const fade = appear(frame, wave.delay);

        return (
          <g key={wave.label} opacity={fade}>
            {[0, 1, 2, 3].map((i) => {
              const x = 960 + wave.from * (distance + i * 58);
              const y = arcY(x, GROUND_SHAPE) + 2;
              /* A small vertical bob keeps the group feeling like it marches. */
              const bob = Math.sin(frame / 5 + i * 1.2 + w) * 3;
              return (
                <Creature
                  key={i}
                  x={x}
                  y={y + bob}
                  scale={0.98}
                  color={ACCENT}
                  accessory={i % 2 === 0 ? "spear" : "hood"}
                  accessoryColor={i % 2 === 0 ? palette.paper : "#6B4FD6"}
                  look={wave.from * -1}
                />
              );
            })}
            <text
              x={960 + wave.from * (distance + 87)}
              y={arcY(960 + wave.from * (distance + 87), GROUND_SHAPE) - 132}
              fill={palette.paper}
              fontFamily={font.family}
              fontWeight={font.bold}
              fontSize={27}
              textAnchor="middle"
            >
              {wave.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const PressureScene: React.FC = () => {
  return (
    <SceneShell mood="grim">
      <AbsoluteFill>
        <Siege />
      </AbsoluteFill>
      <CauseLayout
        index={4}
        accent={ACCENT}
        title="Sức ép dồn từ bên ngoài"
        takeaway="Các dân tộc phía bắc bị đẩy về phía nam — và một biên giới đã mỏng thì không chặn nổi."
      >
        <span />
      </CauseLayout>
    </SceneShell>
  );
};
