import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Body, Headline } from "../components/Type";
import { appear, drift, ramp } from "../anim";
import { HEIGHT, WIDTH, palette } from "../theme";
import {
  City,
  Creature,
  Defs,
  Glow,
  PlanetArc,
  SunRays,
  arcY,
} from "../illustration/parts";
import type { Ground } from "../illustration/parts";

const GROUND_SHAPE: Ground = { top: 892, radius: 2400, centerX: 960 };
const GROUND = "#241C4A";
const GROUND_RIM = "#3A2E6B";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sun = appear(frame, 4);
  const cityIn = appear(frame, 26);
  /** breathing so the star never sits perfectly still */
  const pulse = 1 + Math.sin(frame / 24) * 0.018;

  return (
    <SceneShell mood="calm">
      <AbsoluteFill>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs colors={[palette.gold]} />

          <Glow x={960} y={268} r={430} color={palette.gold} opacity={sun} />
          <g transform={`translate(960 268) scale(${sun * pulse})`}>
            <SunRays
              x={0}
              y={0}
              count={16}
              inner={124}
              length={64}
              color={palette.amber}
              rotation={drift(frame, 4)}
            />
            <circle r={106} fill={palette.gold} />
          </g>

          <PlanetArc
            top={GROUND_SHAPE.top}
            radius={GROUND_SHAPE.radius}
            centerX={GROUND_SHAPE.centerX}
            color={GROUND}
            rimColor={GROUND_RIM}
          />

          <City
            x={1408}
            y={arcY(1408, GROUND_SHAPE) + 4}
            scale={0.8 * cityIn}
            color="#443A80"
            accent="#5A4EA8"
          />

          {/* Onlookers, small on purpose — the scale gap is the point. */}
          {[
            { x: 520, c: palette.teal, look: 1, d: 40 },
            { x: 584, c: palette.sky, look: 0, d: 48 },
            { x: 648, c: palette.violet, look: 0, d: 56 },
          ].map((who) => (
            <Creature
              key={who.x}
              x={who.x}
              y={arcY(who.x, GROUND_SHAPE) + 4}
              scale={0.95 * appear(frame, who.d)}
              color={who.c}
              look={who.look}
            />
          ))}
        </svg>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 150px",
          gap: 24,
          transform: `translateY(${ramp(frame, 30, 60) * 0 + 96}px)`,
        }}
      >
        <Headline delay={34} size={88}>
          VÌ SAO ĐẾ CHẾ LA MÃ SỤP ĐỔ?
        </Headline>
        <Body delay={52} size={35}>
          Không phải một cú sập. Là bốn vết nứt kéo dài hàng thế kỷ.
        </Body>
      </AbsoluteFill>
    </SceneShell>
  );
};
